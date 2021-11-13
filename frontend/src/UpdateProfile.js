import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./UpdateProfile.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton, Slider } from "@material-ui/core";
import { SearchOutlined, Photo } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import { updateProfilePic } from "./server/api.js";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Link } from "react-router-dom";
import { actionTypes } from "./reducer";
import AvatarEditor from "react-avatar-editor";

export default forwardRef(({ profPic, setProfPic }, ref) => {
  const [viewPreview, setViewPreview] = useState(false);
  const [image, setImage] = useState(null);
  const [{ user }, dispatch] = useStateValue();
  const [finalImage, setFinalImage] = useState(null);
  const [slider, setSlider] = useState({ min: 0.5, max: 5, value: 0.5 });
  const [zoom, setZoom] = useState(slider.value);
  const fileInput = useRef();
  const editor = useRef();

  const uploadFile = (e) => {
    fileInput.current.click();
  };

  const onSlide = (e, val) => {
    setZoom(val);
  };

  const previewImage = (e) => {
    if (e.target.files.length > 0) {
      var fileReader = new FileReader();
      fileReader.onload = (e) => {
        setImage(e.target.result);
      };

      fileReader.readAsDataURL(e.target.files[0]);
      setViewPreview(true);
    }
  };

  const save = async () => {
    if (editor) {
      const canvas = editor.current.getImageScaledToCanvas();
      const updateRes = await updateProfilePic(user._id, canvas.toDataURL());
      console.log("upRes", updateRes);
      if (updateRes?.data.modifiedCount === 1) {
        setProfPic(canvas.toDataURL());
      }
    }
  };

  const cancel = () => {
    setViewPreview(false);
  };

  return (
    <div className="updateProfile__container">
      <div className="updateProfile__window" ref={ref}>
        <h3>Update Profile</h3>
        {viewPreview ? (
          <div className="preview__container">
            <AvatarEditor
              ref={editor}
              id="preview"
              image={image}
              height={250}
              width={250}
              color={[255, 255, 255, 0.3]} // RGBA
              scale={zoom}
              border={[90, 20]}
              borderRadius={125}
              rotate={0}
            />
            <div className="slider__container">
              <Photo style={{ transform: "scale(.8)" }} />
              <Slider
                id="slider"
                min={slider.min}
                max={slider.max}
                defaultValue={slider.value}
                onChange={onSlide}
                step={0.01}
              />
              <Photo style={{ transform: "scale(1.8)" }} />
            </div>
            <div className="button__container">
              <button className="cancel__button" onClick={cancel}>
                Cancel
              </button>
              <button className="save__button" onClick={save}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="defaultProf__options">
            <div className="picture__container">
              <div className="line" />
              <label htmlFor="file__input-button-file" onClick={uploadFile}>
                <IconButton>
                  <Avatar id="avatar" src={profPic}>
                    <svg
                      class="MuiSvgIcon-root MuiAvatar-fallback"
                      focusable="false"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                    </svg>
                  </Avatar>
                  <div className="overlay">
                    <h5>CHANGE AVATAR</h5>
                  </div>
                </IconButton>
              </label>
            </div>

            <input
              accept="image/*"
              id="file__input"
              type="file"
              ref={fileInput}
              style={{ display: "none" }}
              onChange={previewImage}
            />
            <div className="prof__info">
              <div className="first__name prof__section">
                <p className="prof__header">FIRST NAME</p>
                <p>{user.first_name}</p>
              </div>
              <div className="last__name prof__section">
                <p className="prof__header">LAST NAME</p>
                <p>{user.last_name}</p>
              </div>
              <div className="email prof__section">
                <p className="prof__header">EMAIL</p>
                <p>{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
