import React, { useEffect, useState, useRef } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import { MoreVert, ModeComment } from "@material-ui/icons";
import { useStateValue } from "../../redux/StateProvider";
import { getOnlineStatus, removeFriend } from "../../server/api.js";
import "./FriendComponent.css";

function FriendComponent({ friend, i, createChat }) {
  const [openFriendOptions, setOpenFriendOptions] = useState(-1);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [{ user, socket }, dispatch] = useStateValue();
  const openFriendMenu = useRef();

  useEffect(() => {
    const checkStatus = async () => {
      const res = await getOnlineStatus(friend._id);
      res && setOnlineStatus(res.data.isOnline);
    };
    checkStatus();
    const interval = setInterval(() => {
      checkStatus();
    }, 60000);

    const updateMenus = (e) => {
      if (
        openFriendMenu &&
        openFriendMenu.current &&
        !openFriendMenu.current.contains(e.target)
      ) {
        setOpenFriendOptions(-1);
      }
    };

    document.addEventListener("mousedown", updateMenus);

    return () => {
      document.removeEventListener("mousedown", updateMenus);
      clearInterval(interval);
    };
  }, [openFriendOptions]);

  const friendOptions = (i) => {
    setOpenFriendOptions(i);
  };

  const remove = async (friendId) => {
    socket?.emit("removeFriend", { removerId: user._id, toRemoveId: friendId });
    await removeFriend(user._id, friendId);
  };

  return (
    <div className="friendComponent__container">
      <div className="friend__info">
        <Avatar src={friend?.prof_pic} className="accountPic" />
        <div className="info__text">
          <p className="friend__name">
            {friend.first_name + " " + friend.last_name}
          </p>
          <p
            style={{ color: onlineStatus ? "green" : "red" }}
            className="online__status"
          >
            {onlineStatus ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="friend__options">
        <IconButton onClick={() => createChat(friend)}>
          <ModeComment style={{ fontSize: 30 }} />
        </IconButton>

        <IconButton onClick={() => friendOptions(i)}>
          <MoreVert style={{ fontSize: 30 }} />
          {openFriendOptions === i && (
            <div className="friendOptions__menu" ref={openFriendMenu}>
              <button onClick={() => remove(friend._id)}>Remove Friend</button>
            </div>
          )}
        </IconButton>
      </div>
    </div>
  );
}

export default FriendComponent;
