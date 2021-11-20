import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import { getUserDataById, getPicture } from "./server/api.js";

function SidebarChat({ last_msg, convId, memberId, searchInput }) {
  const [messages, setMessages] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [inSearch, setInSearch] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const allContainer = document.getElementById(convId.toString());
    const path = window.location.pathname.split("/");

    if (allContainer) {
      if (allContainer.id != path[2]) {
        allContainer.style.background = "#252525";
      } else {
        allContainer.style.background = "#403d3d";
      }
    }
  });

  useEffect(async () => {
    try {
      setLoading(true);
      //before setting members, changes profile photo key to the actual photo metadata
      const memberData = await getUserDataById(memberId);
      memberData.data.prof_pic = await getPicture(memberData.data.prof_pic);
      setLoading(false);
      setConversation(memberData.data);
    } catch (err) {
      console.error(err);
    }
  }, [memberId]);

  useEffect(() => {
    if (
      searchInput === "" ||
      (conversation.first_name + " " + conversation.last_name)
        .toLowerCase()
        .includes(searchInput.toLowerCase())
    )
      setInSearch(true);
    else {
      setInSearch(false);
    }
  }, [searchInput]);

  return (
    <div>
      {!loading && (
        <Link to={`/t/${convId}`}>
          {inSearch && (
            <div className="sidebarChat">
              <div id={convId} className="allContainer">
                <Avatar src={conversation.prof_pic} id="profpic" />
                <div className="infoContainer">
                  <h4 className="name">
                    {conversation.first_name + " " + conversation.last_name}
                  </h4>
                  <h5 className="lastMessage">
                    {!last_msg
                      ? "You are now connected on Dispatch!"
                      : `${last_msg.senderId === user._id ? "You:" : ""} ${
                          last_msg.text
                        }`}
                  </h5>
                </div>
              </div>
            </div>
          )}
        </Link>
      )}
    </div>

    /*<Link to={`/t/${id}`}>
      <div className="sidebarChat">
        <div className="allContainer">
          <Avatar id="profpic" />
          <div className="infoContainer">
            <h4 className="name">}</h4>
            <h5 className="lastMessage">
              {last_msg == null
                ? "You are now connected on Dispatch!"
                : last_msg.length < 32
                ? last_msg
                : last_msg.substring(0, 31) + "..."}
            </h5>
          </div>
        </div>
      </div>
              </Link>*/
  );
}

export default SidebarChat;
