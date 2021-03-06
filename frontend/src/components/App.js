import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useStateValue } from "../redux/StateProvider";
import { actionTypes } from "../redux/reducer";
import { getUserDataById, _dataUrl, logOutAPI } from "../server/api.js";
import { io } from "socket.io-client";
import Sidebar from "./sidebar/Sidebar";
import Chat from "./chat/Chat";
import Login from "./user/Login";
import Friends from "./friends/Friends";
import CreateChat from "./chat/CreateChat";
import Loading from "./Loading";
import "./App.css";

function App() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [showEmoji, setShowEmoji] = useState(false);
  const [lastMessage, setLastMessage] = useState();
  const [conversations, setConversations] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(true);

  useEffect(() => {
    (async () => {
      if (sessionStorage.getItem("accessToken")) {
        try {
          const userId = JSON.parse(
            window.atob(sessionStorage.getItem("accessToken").split(".")[1])
          ).sub;
          //this also refreshes token through interceptor if it is expired
          const user = await getUserDataById(userId);
          const socket = io(`${_dataUrl}`, {
            reconnection: false,
            auth: {
              accessToken: sessionStorage.getItem("accessToken"),
              userId,
            },
          });

          socket?.on("disconnect", async () => {
            await logOutAPI();
            sessionStorage.clear();
            dispatch({
              type: actionTypes.SET_SOCKET,
              socket: null,
            });
            dispatch({
              type: actionTypes.SET_USER,
              user: null,
            });
          });

          if (user.status === 200) {
            dispatch({
              type: actionTypes.SET_USER,
              user: user.data,
            });
            dispatch({
              type: actionTypes.SET_SOCKET,
              socket: socket,
            });
            socket.emit("sendUser", user.data._id);
          } else {
            dispatch({
              type: actionTypes.SET_USER,
              user: null,
            });
            dispatch({
              type: actionTypes.SET_SOCKET,
              socket: null,
            });
          }
        } catch (err) {
          console.log(err, "Invalid Access Token");
          dispatch({
            type: actionTypes.SET_USER,
            user: null,
          });
          dispatch({
            type: actionTypes.SET_SOCKET,
            socket: null,
          });
        }
      }
      setLoadingComponents(false);
    })();
  }, []);

  return (
    <div className="app">
      {loadingComponents ? (
        <div className="loading__body">
          <Loading />
        </div>
      ) : !user ? (
        <div className="home__body">
          <Login />
        </div>
      ) : (
        <div id="body" className="app__body">
          <Router>
            <Sidebar
              conversations={conversations}
              setConversations={setConversations}
              lastMessage={lastMessage}
              setLastMessage={setLastMessage}
            />
            <Switch>
              <Route path="/t/:conversationId">
                <Chat
                  conversations={conversations}
                  setConversations={setConversations}
                  setLastMessage={setLastMessage}
                  setShowEmoji={setShowEmoji}
                />
              </Route>
              <Route path="/friends">
                <Friends />
              </Route>
              <Route path="/create">
                <CreateChat />
              </Route>
            </Switch>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
