import React, { useState, useEffect } from "react";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useStateValue } from "./StateProvider";

function SidebarChat({ id, name, prof_pic, last_msg }) {
  const [messages, setMessages] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [profpic, setProfpic] = useState("");

  useEffect(() => {
    if (id) {
      //download messages in descending order
    }
  }, [id]);

  return (
    <Link to={`/${id}`}>
      <div className="sidebarChat">
        <div className="allContainer">
          <Avatar src={profpic} id="profpic" />
          <div className="infoContainer">
            <h4 className="name">{name}</h4>
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
    </Link>
  );
}

export default SidebarChat;
