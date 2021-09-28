import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";

function Sidebar({ setShowModal }) {
  const [chatWithName, setChatWithName] = useState("");
  const [chatWithPic, setChatWithPic] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const openPersonFinder = () => {
    setShowModal(true);
  };

  const [{ user }, dispatch] = useStateValue();
  const [names, setNames] = useState([]);
  const [origNames, setOrigNames] = useState([]);

  useEffect(() => {}, []);

  useEffect(() => {
    var newNames = [];
    console.log("input", searchInput);
    if (searchInput) {
      console.log(names);
      origNames.forEach((e) => {
        console.log("name", e.data.chatWithName);
        console.log(
          "?",
          e.data.chatWithName.toLowerCase().includes(searchInput.toLowerCase())
        );
        if (
          e.data.chatWithName.toLowerCase().includes(searchInput.toLowerCase())
        ) {
          newNames.push(e);
        }
      });
      console.log("namesA", newNames);
      setNames(newNames);
    } else {
      setNames(origNames);
    }
  }, [searchInput]);

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user?.photoURL} className="accountPic" />
        <h3>Dispatch</h3>
        <IconButton onClick={openPersonFinder}>
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
        {names.map((name) => (
          <SidebarChat
            key={name.id}
            id={name.id}
            name={name.data.chatWithName}
            prof_pic={name.data.chatWithProfPic}
            last_msg={name.data.lastMessage}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
