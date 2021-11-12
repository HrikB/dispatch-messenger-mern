import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./Sidebar.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton, Slider } from "@material-ui/core";
import { SearchOutlined, Photo } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import { getConversations, logOutAPI } from "./server/api.js";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Link } from "react-router-dom";
import { actionTypes } from "./reducer";
import UpdateProfile from "./UpdateProfile";

function Sidebar() {
  const [searchInput, setSearchInput] = useState("");
  const [profPic, setProfPic] = useState("");
  const [{ user, socket }, dispatch] = useStateValue();
  const [names, setNames] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [arrivingConversation, setArrivingConversation] = useState();
  const [profileOptMenu, setProfileOptMenu] = useState(false);
  const [updateProfWin, setUpdateProfWin] = useState(false);
  const [viewPreview, setViewPreview] = useState(false);
  const [origNames, setOrigNames] = useState([]);
  const updateProfMenu = useRef();
  const profOptionsMenu = useRef();

  const createConversation = () => {
    console.log(socket.connected);
  };

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

  const upProfile = () => {
    setUpdateProfWin(!updateProfWin);
    setProfileOptMenu(false);
  };

  const profileOptions = () => {
    setProfileOptMenu(!profileOptMenu);
  };

  useEffect(() => {
    const updateMenus = (e) => {
      if (
        updateProfMenu &&
        updateProfMenu.current &&
        !updateProfMenu.current.contains(e.target)
      ) {
        setUpdateProfWin(false);
        setViewPreview(false);
      }
      if (
        profileOptMenu &&
        profOptionsMenu.current &&
        !profOptionsMenu.current.contains(e.target)
      ) {
        setProfileOptMenu(false);
      }
    };

    document.addEventListener("mousedown", updateMenus);

    return () => {
      document.removeEventListener("mousedown", updateMenus);
    };
  }, [profileOptMenu]);

  useEffect(async () => {
    const conversationsData = await getConversations(user._id);
    socket.on("getNewChat", (data) => {
      console.log("getNewChat", data);
      setArrivingConversation(data);
    });
    setProfPic(user.prof_pic);
    setConversations(conversationsData.data);
  }, [user]);

  useEffect(() => {
    arrivingConversation &&
      setConversations((prev) => [arrivingConversation, ...prev]);
  }, [arrivingConversation]);
  return (
    <div className="sidebar">
      {updateProfWin && (
        <UpdateProfile
          ref={updateProfMenu}
          profPic={profPic}
          setProfPic={setProfPic}
        />
      )}
      <div className="sidebar__header">
        <IconButton ref={profOptionsMenu}>
          <Avatar
            src={profPic}
            className="accountPic"
            onClick={profileOptions}
          />
          {profileOptMenu && (
            <div className="profile__options">
              <button onClick={upProfile}>Update Profile</button>
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
            searchInput={searchInput}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
