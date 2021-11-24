import React, { useEffect, useState } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import { CheckCircle, Cancel } from "@material-ui/icons";
import { useStateValue } from "../../redux/StateProvider";
import { getFriendRequests, getPicture } from "../../server/api.js";
import Loading from "../Loading";
import "./Pending.css";

function Pending() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [pending, setPending] = useState([]);
  const [rejectId, setRejectId] = useState();
  const [arrivingRequest, setArrivingRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await getFriendRequests(user._id);
      const friendRequests = res.data;
      friendRequests.sort((a, b) => {
        if (
          a.requesterId === b.requesterId ||
          a.recipientId === b.recipientId
        ) {
          return 0;
        }
        if (a.requesterId === user._id) {
          return 1;
        }
        if (a.recipientId === user._id) {
          return -1;
        }
      });

      socket?.on("getFriendRequest", async (data) => {
        let recipientProfPic;
        let requesterProfPic;

        if (typeof user.prof_pic !== "undefined") {
          recipientProfPic = await getPicture(user.prof_pic.toString());
        } else recipientProfPic = null;

        if (data.senderProfPic !== "undefined") {
          requesterProfPic = await getPicture(data.senderProfPic);
        } else requesterProfPic = null;

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
      const newPending = await Promise.all(
        friendRequests.map(async (friend) => {
          friend.recipientProfPic = await getPicture(
            friend.recipientProfPic?.toString()
          );
          friend.requesterProfPic = await getPicture(
            friend.requesterProfPic?.toString()
          );
          return friend;
        })
      );
      setLoading(false);
      setPending(newPending);
    })();
  }, [user]);

  useEffect(() => {
    rejectId && setPending(pending.filter((prev) => prev._id !== rejectId));
  }, [rejectId]);

  useEffect(() => {
    arrivingRequest && setPending((prev) => [arrivingRequest, ...prev]);
  }, [arrivingRequest]);

  const responseToReq = (friendRequest, response) => {
    setPending(pending.filter((prev) => prev._id !== friendRequest._id));
    socket.emit("respondToRequest", {
      requestId: friendRequest._id,
      requesterId: friendRequest.requesterId,
      recipientId: friendRequest.recipientId,
      response: response,
    });
  };

  return (
    <div
      style={{
        display: loading && "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
      className="pending"
    >
      <h4 className="pending__heading">
        {loading ? "" : `Pending - ${pending.length}`}
      </h4>
      {loading ? (
        <Loading />
      ) : (
        pending.map((friendRequest) => (
          <div className="request__container">
            <div className="request__info">
              <Avatar
                src={
                  user._id === friendRequest.requesterId
                    ? friendRequest.recipientProfPic
                    : friendRequest.requesterProfPic
                }
                className="accountPic"
              />
              <div className="info__text">
                <p className="request__name">
                  {user._id === friendRequest.requesterId
                    ? friendRequest.recipientName
                    : friendRequest.requesterName}
                </p>
                <div className="requestDir__container">
                  <p className="request__direction">
                    {user._id === friendRequest.requesterId
                      ? "Outgoing"
                      : "Incoming"}
                  </p>
                  <p className="extra__text"> &nbsp;Friend Request</p>
                </div>
              </div>
            </div>
            <div className="request__response">
              <IconButton
                onClick={() => responseToReq(friendRequest, 1)}
                style={
                  friendRequest.requesterId !== user._id
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
        ))
      )}
    </div>
  );
}

export default Pending;
