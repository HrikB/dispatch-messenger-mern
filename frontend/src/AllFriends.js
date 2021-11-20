import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router";
import "./AllFriends.css";
import { getAllFriends, getPicture } from "./server/api.js";
import { useStateValue } from "./StateProvider";
import Loading from "./Loading";
import FriendComponent from "./FriendComponent";

function AllFriends() {
  const [friendsList, setFriendsList] = useState([]);
  const [arrivingFriend, setArrivingFriend] = useState();
  const [toRemoveFriend, setToRemoveFriend] = useState();
  const [loading, setLoading] = useState(true);
  const [{ user, socket }, dispatch] = useStateValue();
  const history = useHistory();

  const createChat = (friend) => {
    socket.emit("newPrivateChat", {
      senderId: user._id,
      receiverId: friend._id,
    });
  };

  useEffect(async () => {
    setLoading(true);
    const allFriends = await getAllFriends(user._id);
    //before setting friends, changes profile photo key to the actual photo metadata

    socket?.on("newFriend", async (data) => {
      const prof_pic = await getPicture(data.prof_pic?.toString());
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
          <FriendComponent friend={friend} i={i} createChat={createChat} />
        ))
      )}
    </div>
  );
}

export default AllFriends;
