import React, { useState, useEffect } from "react";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import { getConversations, getUserData } from "./api.js";

function SidebarChat({ memberId }) {
  const [messages, setMessages] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [conversations, setConversations] = useState([]);
  const [profpic, setProfpic] = useState("");

  useEffect(async () => {
    const memberData = await getUserData(memberId);
    setConversations(memberData.data);
  }, [conversations]);

  return (
    <div>
      <Link to={`/t/${conversations._id}`}>
        <div className="sidebarChat">
          <div className="allContainer">
            <Avatar id="profpic" />
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
