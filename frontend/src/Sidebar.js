import React, { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import { getConversations, logOutAPI } from "./server/api.js";
//import socket from "./server/socketio.js";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Link } from "react-router-dom";
import { actionTypes } from "./reducer";

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

function Sidebar({ setShowModal }) {
  const [chatWithName, setChatWithName] = useState("");
  const [chatWithPic, setChatWithPic] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [{ user, socket }, dispatch] = useStateValue();
  const [names, setNames] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [arrivingConversation, setArrivingConversation] = useState();
  const [profileOptMenu, setProfileOptMenu] = useState(false);
  const [origNames, setOrigNames] = useState([]);
  const ref = useRef();

  const createConversation = () => {};

  const logOut = async () => {
    const res = await logOutAPI();
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    socket.disconnect();
    dispatch({
      type: actionTypes.SET_USER,
      user: null,
    });
    dispatch({
      type: actionTypes.SET_SOCKET,
      socket: null,
    });
  };

  const profileOptions = () => {
    setProfileOptMenu(!profileOptMenu);
  };

  useEffect(() => {
    const closeMenus = (e) => {
      if (profileOptMenu && ref.current && !ref.current.contains(e.target)) {
        setProfileOptMenu(false);
      }
    };

    document.addEventListener("mousedown", closeMenus);

    return () => {
      document.removeEventListener("mousedown", closeMenus);
    };
  }, [profileOptMenu]);

  useEffect(async () => {
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
        <IconButton ref={ref}>
          <Avatar
            src={user?.photoURL}
            className="accountPic"
            onClick={profileOptions}
          />
          {profileOptMenu && (
            <div className="profile__options">
              <button>Update Profile</button>
              <button className="logOut__button" onClick={logOut}>
                Log Out
              </button>
            </div>
          )}
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
