import React, { useState, useEffect } from "react";
import { useStateValue } from "../../redux/StateProvider";
import Loading from "../Loading";
import "./AddFriends.css";

function AddFriends() {
  const [input, setInput] = useState("");
  const [{ user, socket }, dispatch] = useStateValue();
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputContainer, setInputContainer] = useState();

  const setDefaults = () => {
    setSuccess(false);
    setMessage("");
    inputContainer.style.border = "2px solid #4400ff";
  };

  const errorHandler = (_inp, message) => {
    if (_inp) {
      _inp.style.border = "2px solid red";
    } else {
      inputContainer.style.border = "2px solid red";
    }
    setMessage(message);
    setLoading(false);
  };

  useEffect(() => {
    const inpContainer = document.getElementsByClassName("input__contain")[0];
    socket?.on("alreadyFriends", (data) => {
      errorHandler(inpContainer, data.message);
    });
    socket?.on("requestExists", (data) => {
      errorHandler(inpContainer, data.message);
    });
    socket?.on("samePersonRequest", (data) => {
      errorHandler(inpContainer, data.message);
    });
    socket?.on("emailNotFound", (data) => {
      errorHandler(inpContainer, data.message);
    });
    socket?.on("successfulRequest", (data) => {
      inpContainer.style.border = "2px solid green";

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
        <div
          ref={(el) => {
            setInputContainer(el);
          }}
          className="input__contain"
        >
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
