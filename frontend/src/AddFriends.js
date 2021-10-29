import React, { useState } from "react";
import "./AddFriends.css";
import { useStateValue } from "./StateProvider";
//import socket from "./server/socketio";

function AddFriends({ friendsList }) {
  const [input, setInput] = useState("");
  const [{ user, socket }, dispatch] = useStateValue();

  const sendFriendRequests = async (e) => {
    e.preventDefault();
    let outgoingRequest = {
      senderId: user._id,
      senderName: user.first_name + " " + user.last_name,
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
        <div className="input__container">
          <input
            className="newFriend__email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter an email..."
            type="text"
          />
          <button
            disabled={!input.trim()}
            className="submitFriend__request"
            onClick={sendFriendRequests}
            type="submit"
          >
            <p>Send Friend Request</p>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddFriends;
