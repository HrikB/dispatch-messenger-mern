import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./Sidebar.css";
import Compose from "./Compose.svg";
import { Avatar, IconButton, Slider } from "@material-ui/core";
import { SearchOutlined, Photo } from "@material-ui/icons";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "./StateProvider";
import {
  getConversations,
  getPicture,
  logOutAPI,
  _dataUrl,
} from "./server/api.js";
import EmojiPeopleIcon from "@material-ui/icons/EmojiPeople";
import { Link } from "react-router-dom";
import { actionTypes } from "./reducer";
import UpdateProfile from "./UpdateProfile";

function Sidebar({ conversations, setConversations, lastMessage }) {
  const [searchInput, setSearchInput] = useState("");
  const [{ user, socket }, dispatch] = useStateValue();
  const [arrivingConversation, setArrivingConversation] = useState();
  const [toDeleteConversation, setToDeleteConversation] = useState();
  const [profileOptMenu, setProfileOptMenu] = useState(false);
  const [updateProfWin, setUpdateProfWin] = useState(false);
  const [viewPreview, setViewPreview] = useState(false);
  const [profPic, setProfPic] = useState("");

  const history = useHistory();
  const updateProfMenu = useRef();
  const profOptionsMenu = useRef();

  const createConversation = () => {
    history.push("/create");
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

  //updates last message
  useEffect(() => {
    lastMessage &&
      setConversations(
        conversations.map((conv) => {
          if (conv._id === lastMessage.conversationId)
            conv.last_msg = lastMessage;
          return conv;
        })
      );
  }, [lastMessage]);

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
    socket?.on("getNewChat", (data) => {
      console.log("getNewChat", data);
      setArrivingConversation(data);
    });
    socket?.on("removeConversation", (conversationId) => {
      setToDeleteConversation(conversationId);
    });

    const res = await getPicture(user.prof_pic);
    setProfPic(res);
    setConversations(conversationsData.data);
  }, [user]);

  useEffect(() => {
    arrivingConversation &&
      setConversations((prev) => [arrivingConversation, ...prev]);
  }, [arrivingConversation]);

  useEffect(() => {
    toDeleteConversation &&
      setConversations(
        conversations.filter((prev) => prev._id != toDeleteConversation)
      );
  }, [toDeleteConversation]);
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
            last_msg={conversation.last_msg}
            convId={conversation._id}
            memberId={conversation.members.find((m) => m !== user._id)}
            friendsTab={document.getElementById("friends")}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
