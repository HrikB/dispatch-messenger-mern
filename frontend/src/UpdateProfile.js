import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./UpdateProfile.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton, Slider } from "@material-ui/core";
import { SearchOutlined, Photo } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import {
  uploadPicture,
  updateProfilePic,
  _dataUrl,
  getPicture,
} from "./server/api.js";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Link } from "react-router-dom";
import { actionTypes } from "./reducer";
import EditProfileInfo from "./EditProfileInfo";
import AvatarEditor from "react-avatar-editor";
import Loading from "./Loading";

export default forwardRef(({ profPic, setProfPic }, ref) => {
  const [viewPreview, setViewPreview] = useState(false);
  const [image, setImage] = useState(null);
  const [editInfo, setEditInfo] = useState(false);
  const [toUpdate, setToUpdate] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);
  const [slider, setSlider] = useState({ min: 0.5, max: 5, value: 0.5 });
  const [zoom, setZoom] = useState(slider.value);
  const [loading, setLoading] = useState(false);
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

  const editProfInfo = (toEdit) => {
    setToUpdate(toEdit);
    setEditInfo(true);
  };

  const save = async () => {
    setLoading(true);
    await handleSave();
    setLoading(false);
  };

  const handleSave = async () => {
    if (editor) {
      const canvas = editor.current.getImageScaledToCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve));
      const formData = new FormData();
      formData.append("image", blob);
      //Uploads image using gridfs and multer
      const uploadedId = await uploadPicture(user._id, formData);
      if (!uploadedId) return;
      //Uses returned file id to update prof pic link in database
      const updateRes = await updateProfilePic(user._id, uploadedId.data);
      if (!updateRes.data.acknowledged === true) return;

      dispatch({
        type: actionTypes.SET_USER,
        user: Object.assign({ ...user }, { prof_pic: uploadedId.data }),
      });
      setViewPreview(false);
    }
  };

  useEffect(() => {
    setZoom(slider.min);
  }, [viewPreview]);

  const cancel = () => {
    setLoading(false);
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
                {loading ? <Loading /> : "Save"}
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
              {editInfo && (
                <EditProfileInfo
                  setEditInfo={setEditInfo}
                  setFirstName={setFirstName}
                  setLastName={setLastName}
                  setEmail={setEmail}
                  toUpdate={toUpdate}
                />
              )}
              <div className="first__name prof__section">
                <div className="info__container">
                  <p className="prof__header">FIRST NAME</p>
                  <p>{firstName}</p>
                </div>
                <button onClick={() => editProfInfo("first name")}>Edit</button>
              </div>
              <div className="last__name prof__section">
                <div className="info__container">
                  <p className="prof__header">LAST NAME</p>
                  <p>{lastName}</p>
                </div>
                <button onClick={() => editProfInfo("last name")}>Edit</button>
              </div>
              <div className="email prof__section">
                <div className="info__container">
                  <p className="prof__header">EMAIL</p>
                  <p>{email}</p>
                </div>
                <button onClick={() => editProfInfo("email")}>Edit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
