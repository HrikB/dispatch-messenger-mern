import React, { useState, useEffect } from "react";
import "./AllFriends.css";
import { Avatar, IconButton } from "@material-ui/core";
import MoreVert from "@material-ui/icons/MoreVert";
import ModeComment from "@material-ui/icons/ModeComment";
import { getAllFriends } from "./server/api.js";
import { useStateValue } from "./StateProvider";
import socket from "./server/socketio";

function AllFriends() {
  const [friendsList, setFriendsList] = useState([]);
  const [arrivingFriend, setArrivingFriend] = useState();
  const [{ user }, dispatch] = useStateValue();

  useEffect(async () => {
    const allFriends = await getAllFriends(user._id);
    socket?.on("newFriend", (data) => {
      setArrivingFriend();
    });
    setFriendsList(allFriends.data);
  }, [user]);

  return (
    <div className="allFriends">
      <h4 className="allFriends_heading">
        All Friends - {`${friendsList.length}`}
      </h4>
      {friendsList.map((friend) => (
        <div className="friendComponent__container">
          <div className="friend__info">
            <Avatar src={friend?.photoURL} className="accountPic" />
            <div className="info__text">
              <p className="friend__name">
                {friend.first_name + " " + friend.last_name}
              </p>
              <p className="online__status">online status</p>
            </div>
          </div>
          <div className="friend__options">
            <IconButton>
              <ModeComment style={{ fontSize: 30 }} />
            </IconButton>

            <IconButton>
              <MoreVert style={{ fontSize: 30 }} />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AllFriends;
