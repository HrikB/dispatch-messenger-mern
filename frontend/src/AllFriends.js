import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router";
import "./AllFriends.css";
import { Avatar, IconButton } from "@material-ui/core";
import MoreVert from "@material-ui/icons/MoreVert";
import ModeComment from "@material-ui/icons/ModeComment";
import { getAllFriends, removeFriend, getPicture } from "./server/api.js";
import { useStateValue } from "./StateProvider";
import Loading from "./Loading";

function AllFriends() {
  const [friendsList, setFriendsList] = useState([]);
  const [openFriendOptions, setOpenFriendOptions] = useState(-1);
  const openFriendMenu = useRef();
  const [arrivingFriend, setArrivingFriend] = useState();
  const [toRemoveFriend, setToRemoveFriend] = useState();
  const [loading, setLoading] = useState(false);
  const [{ user, socket }, dispatch] = useStateValue();
  const history = useHistory();

  const createChat = (friend) => {
    socket.emit("newPrivateChat", {
      senderId: user._id,
      receiverId: friend._id,
    });
  };

  const friendOptions = (i) => {
    setOpenFriendOptions(i);
  };

  const remove = async (friendId) => {
    socket?.emit("removeFriend", { removerId: user._id, toRemoveId: friendId });
    await removeFriend(user._id, friendId);
  };

  useEffect(() => {
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
    };
  }, [openFriendOptions]);

  useEffect(async () => {
    setLoading(true);
    const allFriends = await getAllFriends(user._id);
    //before setting friends, changes profile photo key to the actual photo metadata

    socket?.on("newFriend", async (data) => {
      const prof_pic = await getPicture(data.prof_pic);
      setArrivingFriend({
        _id: data._id,
        first_name: data.first,
        last_name: data.last,
        prof_pic,
      });
    });
    socket?.on("openMessage", (data) => {
      history.push({ pathname: `/t/${data._id}` });
    });
    socket?.on("friendRemoved", (toRemoveId) => {
      setToRemoveFriend(toRemoveId);
    });
    const newList = await Promise.all(
      allFriends.data.map(async (friend) => {
        friend.prof_pic = await getPicture(friend.prof_pic);
        return friend;
      })
    );
    setFriendsList(newList);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    arrivingFriend && setFriendsList((prev) => [...prev, arrivingFriend]);
  }, [arrivingFriend]);

  useEffect(() => {
    setFriendsList(friendsList.filter((prev) => prev._id != toRemoveFriend));
  }, [toRemoveFriend]);

  return (
    <div
      style={{
        display: loading && "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
      className="allFriends"
    >
      <h4 className="allFriends_heading">
        {loading ? "" : `All Friends - ${friendsList.length}`}
      </h4>
      {loading ? (
        <Loading />
      ) : (
        friendsList.map((friend, i) => (
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

              <IconButton onClick={() => friendOptions(i)}>
                <MoreVert style={{ fontSize: 30 }} />
                {openFriendOptions === i && (
                  <div className="friendOptions__menu" ref={openFriendMenu}>
                    <button onClick={() => remove(friend._id)}>
                      Remove Friend
                    </button>
                  </div>
                )}
              </IconButton>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AllFriends;
