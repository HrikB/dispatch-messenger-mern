import { Avatar, IconButton } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import "./Pending.css";
import { useStateValue } from "./StateProvider";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Cancel from "@material-ui/icons/Cancel";
//import socket from "./server/socketio";
import { getFriendRequests } from "./server/api.js";

let jsonPending = [
  {
    requesterId: "61639307187a61187b5e20b1",
    recipientId: "6163933a187a61187b5e20b4",
    requesterName: "h h",
    recipientName: "o o",
    _id: "61642eec7745de2e4fc5ae22",
    __v: 0,
  },
  {
    requesterId: "61639307187a61z87b5e20b1",
    recipientId: "61639307187a61187b5e20b1",
    requesterName: "z z",
    recipientName: "h h",
    _id: "61642eec7745de2e4fc5ae24",
    __v: 0,
  },
  {
    requesterId: "61639307187a6x187b5e20b1",
    recipientId: "61639307187a61187b5e20b1",
    requesterName: "l l",
    recipientName: "o o",
    _id: "61642eec7745de2e4fc5ae25",
    __v: 0,
  },
  {
    requesterId: "61639307187a61187b5e24b1",
    recipientId: "61639307187a61187b5e20b1",
    requesterName: "y y",
    recipientName: "o o",
    _id: "61642eec7745de2e4fc5ae26",
    __v: 0,
  },
];

function Pending() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [pending, setPending] = useState([]);
  const [arrivingRequest, setArrivingRequest] = useState(null);

  useEffect(async () => {
    const res = await getFriendRequests(user._id);
    const friendRequests = res.data;
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

    socket?.on("getFriendRequest", (data) => {
      setArrivingRequest({
        _id: data.id,
        requesterId: data.senderId,
        recipientId: user._id,
        requesterName: data.senderName,
        recipientName: user.first_name + " " + user.last_name,
      });
    });
    setPending(friendRequests);
  }, [user]);

  useEffect(() => {
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
            <Avatar src={friendRequest?.photoURL} className="accountPic" />
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
