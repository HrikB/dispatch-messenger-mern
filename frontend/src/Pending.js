import { Avatar, IconButton } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./Pending.css";
import { useStateValue } from "./StateProvider";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Cancel from "@material-ui/icons/Cancel";
import { getFriendRequests, getPicture } from "./server/api.js";
import { ControlPointSharp } from "@material-ui/icons";

function Pending() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [pending, setPending] = useState([]);
  const [rejectId, setRejectId] = useState();
  const [arrivingRequest, setArrivingRequest] = useState(null);

  useEffect(async () => {
    const res = await getFriendRequests(user._id);
    const friendRequests = res.data;
    console.log(friendRequests);
    friendRequests.sort((a, b) => {
      if (a.requesterId == b.requesterId || a.recipientId == b.recipientId) {
        return 0;
      }
      if (a.requesterId == user._id) {
        return 1;
      }
      if (a.recipientId == user._id) {
        return -1;
      }
    });

    socket?.on("getFriendRequest", async (data) => {
      const recipientProfPic = await getPicture(user.prof_pic);
      const requesterProfPic = await getPicture(data.senderProfPic);
      setArrivingRequest({
        _id: data.id,
        requesterId: data.senderId,
        recipientId: user._id,
        requesterName: data.senderName,
        recipientName: user.first_name + " " + user.last_name,
        recipientProfPic,
        requesterProfPic,
      });
    });
    socket?.on("rejectRequest", (data) => {
      setRejectId(data.requestId);
    });
    setPending(
      await Promise.all(
        friendRequests.map(async (friend) => {
          friend.recipientProfPic = await getPicture(friend.recipientProfPic);
          friend.requesterProfPic = await getPicture(friend.requesterProfPic);
          return friend;
        })
      )
    );
  }, [user]);

  useEffect(() => {
    rejectId && setPending(pending.filter((prev) => prev._id != rejectId));
  }, [rejectId]);

  useEffect(() => {
    arrivingRequest && console.log(arrivingRequest);
    arrivingRequest && setPending((prev) => [arrivingRequest, ...prev]);
  }, [arrivingRequest]);

  const responseToReq = (friendRequest, response) => {
    setPending(pending.filter((prev) => prev._id != friendRequest._id));
    socket.emit("respondToRequest", {
      requestId: friendRequest._id,
      requesterId: friendRequest.requesterId,
      recipientId: friendRequest.recipientId,
      response: response,
    });
  };

  return (
    <div className="pending">
      <h4 className="pending__heading">Pending - {`${pending.length}`}</h4>
      {pending.map((friendRequest) => (
        <div className="request__container">
          <div className="request__info">
            <Avatar
              src={
                user._id == friendRequest.requesterId
                  ? friendRequest.recipientProfPic
                  : friendRequest.requesterProfPic
              }
              className="accountPic"
            />
            <div className="info__text">
              <p className="request__name">
                {user._id == friendRequest.requesterId
                  ? friendRequest.recipientName
                  : friendRequest.requesterName}
              </p>
              <p className="request__direction">
                {user._id == friendRequest.requesterId
                  ? "Outgoing Friend Request"
                  : "Incoming Friend Request"}
              </p>
            </div>
          </div>
          <div className="request__response">
            <IconButton
              onClick={() => responseToReq(friendRequest, 1)}
              style={
                friendRequest.requesterId != user._id
                  ? { visbility: "visible" }
                  : { visibility: "hidden" }
              }
            >
              <CheckCircle style={{ fontSize: 40 }} />
            </IconButton>

            <IconButton onClick={() => responseToReq(friendRequest, 0)}>
              <Cancel style={{ fontSize: 40 }} />
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Pending;
