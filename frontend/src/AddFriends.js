import React, { useState, useEffect } from "react";
import "./AddFriends.css";

function AddFriends({ friendsList }) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const emailInput = document.getElementsByClassName("newFriend__email")[0];

    console.log(document.activeElement);
    console.log(emailInput);
  }, [document.activeElement]);

  const sendFriendRequest = (e) => {
    e.preventDefault();
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
            onClick={sendFriendRequest}
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
