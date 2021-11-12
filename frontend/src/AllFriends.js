import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import "./AllFriends.css";
import { Avatar, IconButton } from "@material-ui/core";
import MoreVert from "@material-ui/icons/MoreVert";
import ModeComment from "@material-ui/icons/ModeComment";
import { getAllFriends, removeFriend } from "./server/api.js";
import { useStateValue } from "./StateProvider";
import { ContactPhoneOutlined } from "@material-ui/icons";

function AllFriends() {
  const [friendsList, setFriendsList] = useState([]);
  const [openFriendOptions, setOpenFriendOptions] = useState(false);
  const [arrivingFriend, setArrivingFriend] = useState();
  const [{ user, socket }, dispatch] = useStateValue();
  const history = useHistory();

  const createChat = (friend) => {
    socket.emit("newPrivateChat", {
      senderId: user._id,
      receiverId: friend._id,
    });
  };

  const friendOptions = () => {
    setOpenFriendOptions(!openFriendOptions);
  };

  const remove = async (friendId) => {
    await removeFriend(user._id, friendId);
  };

  useEffect(async () => {
    const allFriends = await getAllFriends(user._id);
    socket?.on("newFriend", (data) => {
      console.log("socketNewFriend");
      setArrivingFriend({
        _id: data._id,
        first_name: data.first,
        last_name: data.last,
      });
    });
    //
    socket?.on("openMessage", (data) => {
      history.push({ pathname: `/t/${data._id}` });
    });
    setFriendsList(allFriends.data);
  }, [user]);

  useEffect(() => {
    arrivingFriend && setFriendsList((prev) => [...prev, arrivingFriend]);
  }, [arrivingFriend]);

  return (
    <div className="allFriends">
      <h4 className="allFriends_heading">
        All Friends - {`${friendsList.length}`}
      </h4>
      {friendsList.map((friend) => (
        <div className="friendComponent__container">
          <div className="friend__info">
            <Avatar src={friend?.prof_pic} className="accountPic" />
            <div className="info__text">
              <p className="friend__name">
                {friend.first_name + " " + friend.last_name}
              </p>
              <p className="online__status">online status</p>
            </div>
          </div>
          <div className="friend__options">
            <IconButton onClick={() => createChat(friend)}>
              <ModeComment style={{ fontSize: 30 }} />
            </IconButton>

            <IconButton onClick={friendOptions}>
              <MoreVert style={{ fontSize: 30 }} />
              {openFriendOptions && (
                <div className="friendOptions__menu">
                  <button onClick={() => remove(friend._id)}>
                    Remove Friend
                  </button>
                </div>
              )}
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AllFriends;
