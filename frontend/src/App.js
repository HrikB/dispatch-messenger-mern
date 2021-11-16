import React, { useState, useEffect, useLocation } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { io } from "socket.io-client";
import { actionTypes } from "./reducer";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Login from "./Login";
import Friends from "./Friends";
import Loading from "./Loading";
import { useStateValue } from "./StateProvider";
import { getUserDataById } from "./server/api.js";

function App() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [connected, setConnected] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [lastMessage, setLastMessage] = useState();
  const [conversations, setConversations] = useState([]);
  const [searchEmail, setSearchEmail] = useState(() => {});
  const [loadingComponents, setLoadingComponents] = useState(true);

  useEffect(async () => {
    if (sessionStorage.getItem("accessToken")) {
      try {
        const userId = JSON.parse(
          window.atob(sessionStorage.getItem("accessToken").split(".")[1])
        ).sub;
        //this also refreshes token through interceptor if it is expired
        const user = await getUserDataById(userId);
        const socket = io("http://localhost:7000", {
          reconnection: false,
          auth: {
            accessToken: sessionStorage.getItem("accessToken"),
            userId,
          },
        });

        socket?.on("disconnect", () => {
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
            </Switch>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
