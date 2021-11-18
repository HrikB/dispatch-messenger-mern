import { UpdateTwoTone } from "@material-ui/icons";
import React, { useState } from "react";
import { updateFirstName, updateLastName, updateEmail } from "./server/api";
import "./EditProfile.css";
import Loading from "./Loading";
import { useStateValue } from "./StateProvider";

function EditProfileInfo({
  setEditInfo,
  setFirstName,
  setLastName,
  setEmail,
  toUpdate,
}) {
  const [updatedInfo, setUpdatedInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [updateErrorMessage, setUpdateErrorMessage] = useState("");
  const [{ user }, dispatch] = useStateValue();

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    let response;
    let updateFunc;
    console.log("toUpdate", toUpdate);
    let formattedInfo = updatedInfo;

    switch (toUpdate) {
      case "first name":
        response = await updateFirstName(user._id, formattedInfo);
        formattedInfo =
          formattedInfo[0]?.toUpperCase() + formattedInfo.substring(1);
        updateFunc = setFirstName;
        break;

      case "last name":
        response = await updateLastName(user._id, formattedInfo);
        formattedInfo =
          formattedInfo[0]?.toUpperCase() + formattedInfo.substring(1);
        updateFunc = setLastName;
        break;

      case "email":
        response = await updateEmail(user._id, formattedInfo);
        updateFunc = setEmail;
    }
    console.log(response);
    setLoading(false);
    if (response.data.error) {
      setUpdateError(true);
      setUpdateErrorMessage(response.data.error.message);
      return;
    }
    updateFunc(formattedInfo);
    setEditInfo(false);
  };

  const cancel = () => {
    setEditInfo(false);
  };

  return (
    <div className="editProfile__background">
      <div className="editProfile__container">
        <h1>{`Change your ${toUpdate}`}</h1>
        <h4>{`Enter a new ${toUpdate} to change it`}</h4>

        <p style={{ color: updateError && "red" }}>
          {`${toUpdate}`.toUpperCase()}
          {updateError && ` - ${updateErrorMessage}`}
        </p>
        <form onSubmit={save}>
          <input
            style={{
              border: updateError && "2px solid red",
            }}
            type="text"
            className="to__update"
            placeholder={`Enter your new ${toUpdate}`}
            value={updatedInfo}
            onChange={(e) => {
              setUpdatedInfo(e.target.value);
            }}
          />
        </form>

        <div className="button__container">
          <button className="cancel__button" onClick={cancel}>
            Cancel
          </button>
          <button className="save__button" onClick={save}>
            {loading ? <Loading /> : `Save`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileInfo;
