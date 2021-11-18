import React, { useState, useEffect, useRef } from "react";
import "./AddFriends.css";
import Loading from "./Loading";
import { getPicture } from "./server/api";
import { useStateValue } from "./StateProvider";

function AddFriends({ friendsList }) {
  const [input, setInput] = useState("");
  const [{ user, socket }, dispatch] = useStateValue();
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputContainer = useRef();

  const setDefaults = () => {
    setSuccess(false);
    setMessage("");
    inputContainer.current.style.border = "2px solid #4400ff";
  };

  const errorHandler = (_inp, message) => {
    _inp.style.border = "2px solid red";
    setMessage(message);
    setLoading(false);
  };

  useEffect(() => {
    socket?.on("alreadyFriends", (data) => {
      errorHandler(inputContainer.current, data.message);
    });
    socket?.on("requestExists", (data) => {
      errorHandler(inputContainer.current, data.message);
    });
    socket?.on("samePersonRequest", (data) => {
      errorHandler(inputContainer.current, data.message);
    });
    socket?.on("emailNotFound", (data) => {
      errorHandler(inputContainer.current, data.message);
    });
    socket?.on("successfulRequest", (data) => {
      inputContainer.current.style.border = "2px solid green";
      setMessage(data.message);
      setSuccess(true);
      setLoading(false);
    });
  }, [user]);

  const sendFriendRequests = async (e) => {
    e.preventDefault();
    setLoading(true);
    let outgoingRequest = {
      senderId: user._id,
      senderName: user.first_name + " " + user.last_name,
      senderProfPic: user.prof_pic,
      receiverEmail: input,
    };
    socket.emit("sendFriendRequest", outgoingRequest);
    setInput("");
  };

  return (
    <div className="addFriend">
      <h3>ADD FRIEND</h3>
      <h5>You can add a friend using their email address.</h5>
      <form className="friendRequest__form">
        <div ref={inputContainer} className="input__contain">
          <input
            className="newFriend__email"
            value={input}
            onChange={(e) => {
              setDefaults();
              setInput(e.target.value);
            }}
            placeholder="Enter an email..."
            type="text"
          />
          <button
            disabled={!input.trim()}
            className="submitFriend__request"
            onClick={sendFriendRequests}
            type="submit"
          >
            {loading ? <Loading /> : <p>Send Friend Request</p>}
          </button>
        </div>
      </form>
      {message && message !== "" && (
        <div className="error__message">
          <h5 style={{ color: success ? "green" : "red" }}>{`${
            success ? "" : "Error: "
          } ${message}`}</h5>
        </div>
      )}
    </div>
  );
}

export default AddFriends;
