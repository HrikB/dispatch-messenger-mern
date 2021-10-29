import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import { getConversations } from "./server/api.js";
//import socket from "./server/socketio.js";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Link } from "react-router-dom";

let jsonNames = [
  {
    id: 1,
    data: {
      chatWithName: "Sara",
      chatWithProfPic:
        "https://images.news18.com/ibnlive/uploads/2021/06/1622715559_disha.jpg?impolicy=website&width=510&height=356",
      lastMessage: "Byebye",
    },
  },
  {
    id: 2,
    data: {
      chatWithName: "Jake",
      chatWithProfPic:
        "https://apod.nasa.gov/apod/image/2109/SunSpotHill_Coy_960.jpg",
      lastMessage: "wtf",
    },
  },
];

const createConversation = () => {};

function Sidebar({ setShowModal }) {
  const [chatWithName, setChatWithName] = useState("");
  const [chatWithPic, setChatWithPic] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [{ user, socket }, dispatch] = useStateValue();
  const [names, setNames] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [arrivingConversation, setArrivingConversation] = useState();
  const [origNames, setOrigNames] = useState([]);

  useEffect(async () => {
    //socket.emit("sendUser", user._id);

    const conversationsData = await getConversations(user._id);
    socket.on("getNewChat", (data) => {
      console.log("getNewChat", data);
      setArrivingConversation(data);
    });

    setConversations(conversationsData.data);
    /*var newNames = [];
    if (searchInput) {
      origNames.forEach((e) => {
        if (
          e.data.chatWithName.toLowerCase().includes(searchInput.toLowerCase())
        ) {
          newNames.push(e);
        }
      });
      setNames(newNames);
    } else {
      setNames(origNames);
    }*/
  }, [user]);

  useEffect(() => {
    arrivingConversation &&
      setConversations((prev) => [arrivingConversation, ...prev]);
  }, [arrivingConversation]);
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <IconButton>
          <Avatar src={user?.photoURL} className="accountPic" />
        </IconButton>
        <h3>Dispatch</h3>
        <IconButton onClick={createConversation}>
          <img id="compose" src={Compose} alt="Compose"></img>
        </IconButton>
      </div>
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <input
            placeholder="Search"
            type="text"
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <SearchOutlined />
        </div>
      </div>

      <div className="sidebar__chats">
        <Link to="/friends">
          <div id="friends" className="friends__tab">
            <EmojiPeopleIcon style={{ fontSize: 30 }}></EmojiPeopleIcon>
            <p>Friends</p>
          </div>
        </Link>
        <h3>PRIVATE MESSAGES</h3>
        {conversations.map((conversation) => (
          <SidebarChat
            key={conversation.members.find((m) => m !== user._id)}
            convId={conversation._id}
            memberId={conversation.members.find((m) => m !== user._id)}
            friendsTab={document.getElementById("friends")}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
