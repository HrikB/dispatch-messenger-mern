import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import { getUserDataById } from "./server/api.js";

function SidebarChat({ convId, memberId, friendsTab }) {
  const [messages, setMessages] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [conversations, setConversations] = useState([]);
  const [profpic, setProfpic] = useState("");
  const location = useLocation();

  //there has to be a better way to implement selection
  useEffect(() => {
    const allContainer = document.getElementsByClassName("allContainer");
    const path = window.location.pathname.split("/");
    if (allContainer) {
      for (let e of allContainer) {
        if (e.id != path[2]) {
          e.style.background = "#252525";
        } else {
          e.style.background = "#403d3d";
        }
      }
    }
    if (friendsTab) {
      if (friendsTab.id != path[1]) {
        friendsTab.style.background = "#252525";
      } else {
        friendsTab.style.background = "#403d3d";
      }
    }
  }, [location]);

  useEffect(async () => {
    try {
      const memberData = await getUserDataById(memberId);
      setConversations(memberData.data);
    } catch (err) {
      console.error(err);
    }
  }, [memberId]);

  return (
    <div>
      <Link to={`/t/${convId}`}>
        <div className="sidebarChat">
          <div id={convId} className="allContainer">
            <Avatar src={conversations.prof_pic} id="profpic" />
            <div className="infoContainer">
              <h4 className="name">
                {conversations.first_name + " " + conversations.last_name}
              </h4>
              <h5 className="lastMessage">
                {/*last_msg == null
                    ? "You are now connected on Dispatch!"
                    : last_msg.length < 32
                    ? last_msg
                  : last_msg.substring(0, 31) + "..."*/}
              </h5>
            </div>
          </div>
        </div>
      </Link>
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
