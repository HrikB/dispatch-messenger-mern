import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import { io } from "socket.io-client";
import { getConversations } from "./api.js";

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

const socket = io("http://localhost:7000", {
  reconnectionDelayMax: 10000,
  auth: {
    accessToken: localStorage.getItem("token"),
  },
});

function Sidebar({ setShowModal }) {
  const [chatWithName, setChatWithName] = useState("");
  const [chatWithPic, setChatWithPic] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [{ user }, dispatch] = useStateValue();
  const [names, setNames] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [origNames, setOrigNames] = useState([]);

  useEffect(async () => {
    const conversationsData = await getConversations(user.userId);
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
  }, [user.userId]);
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
        {conversations.map((conversation) => (
          <SidebarChat
            key={conversation.members.find((m) => m !== user.userId)}
            conversationId={conversation._id}
            memberId={conversation.members.find((m) => m !== user.userId)}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
