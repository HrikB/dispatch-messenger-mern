import React, { useState, useEffect, Component } from "react";
import "./Friends.css";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import AllFriends from "./AllFriends";
import AddFriends from "./AddFriends";
import Pending from "./Pending";
//import socket from "./server/socketio";
import { useStateValue } from "./StateProvider";

let friendsJson = {
  friendsList: [
    { first_name: "Sara", last_name: "Blake" },
    { first_name: "Jake", last_name: "Towers" },
    { first_name: "Lois", last_name: "Sky" },
  ],
};

function Friends() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [friendsList, setFriendsList] = useState(friendsJson.friendsList);
  const [currentTab, setCurrentTab] = useState(
    <AllFriends friendsList={friendsList} />
  );
  useEffect(() => {
    socket?.emit("sendUser", user._id);
  }, []);
  useEffect(() => {
    //Handles tab highlighting
    const allButton = document.getElementsByClassName("all")[0];
    const pendingButton = document.getElementsByClassName("pending")[0];
    const addFriendsButton = document.getElementsByClassName("add__friend")[0];

    if (currentTab.type.name === "AllFriends") {
      allButton.style.backgroundColor = "#424242";
    } else {
      allButton.style.backgroundColor = "#000";
    }

    if (currentTab.type.name === "Pending") {
      pendingButton.style.backgroundColor = "#424242";
    } else {
      pendingButton.style.backgroundColor = "#000";
    }

    if (currentTab.type.name === "AddFriends") {
      addFriendsButton.children[0].style.color = "#00FF00";
      addFriendsButton.style.backgroundColor = "#000";
    } else {
      addFriendsButton.children[0].style.color = "#FFF";
      addFriendsButton.style.backgroundColor = "#005f00";
    }
  }, [currentTab]);

  const all = () => {
    setCurrentTab(<AllFriends friendsList={friendsList} />);
  };

  const pending = () => {
    setCurrentTab(<Pending />);
  };

  const addFriend = () => {
    setCurrentTab(<AddFriends />);
  };

  return (
    <div className="friendsContainer">
      <div className="friend__header">
        <div className="header__left">
          <div className="friends__icon">
            <EmojiPeopleIcon style={{ fontSize: 30 }}></EmojiPeopleIcon>
            <h1>Friends</h1>
          </div>

          <button className="all" onClick={all}>
            <p>All</p>
          </button>
          <button className="pending" onClick={pending}>
            <p>Pending</p>
          </button>
        </div>
        <div className="header__right">
          <button className="add__friend" onClick={addFriend}>
            <p>Add Friend</p>
          </button>
        </div>
      </div>
      <div className="friend__body">{currentTab}</div>
    </div>
  );
}

export default Friends;
