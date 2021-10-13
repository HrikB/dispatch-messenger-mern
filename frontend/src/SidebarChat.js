import React, { useState, useEffect, useParams } from "react";
import "./SidebarChat.css";
import { Avatar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useStateValue } from "./StateProvider";
import { getUserData } from "./server/api.js";

function SidebarChat({ convId, memberId, friendsTab }) {
  const [messages, setMessages] = useState("");
  const [{ user }, dispatch] = useStateValue();
  const [conversations, setConversations] = useState([]);
  const [profpic, setProfpic] = useState("");

  //there has to be a better way to implement selection
  useEffect(() => {
    const allContainer = document.getElementsByClassName("allContainer");
    const path = window.location.pathname.split("/");
    if (allContainer) {
      for (let e of allContainer) {
        if (e.id != path[2]) {
          e.style.background = "#171717";
        } else {
          e.style.background = "#403d3d";
        }
      }
    }
    if (friendsTab) {
      console.log("a", friendsTab.id, path[1]);
      if (friendsTab.id != path[1]) {
        console.log("b", friendsTab.id, path[1]);
        friendsTab.style.background = "#171717";
      } else {
        console.log("c", friendsTab.id, path[1]);
        friendsTab.style.background = "#403d3d";
      }
    }
  }, [window.location.pathname]);

  useEffect(async () => {
    //console.log(window.location.pathname.split("/")[2]);
    try {
      const memberData = await getUserData(memberId);
      setConversations(memberData.data);
    } catch (err) {
      console.error(err);
    }
  }, [conversations]);

  return (
    <div>
      <Link to={`/t/${convId}`}>
        <div className="sidebarChat">
          <div id={convId} className="allContainer">
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
