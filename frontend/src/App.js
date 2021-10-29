import React, { useState, useEffect, useLocation } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { io } from "socket.io-client";
import { actionTypes } from "./reducer";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Login from "./Login";
import Modal from "./Modal";
import Friends from "./Friends";
import Loading from "./Loading";
import { useStateValue } from "./StateProvider";
import { getUserDataById } from "./server/api.js";

function App() {
  const [{ user, socket }, dispatch] = useStateValue();
  const [showModal, setShowModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchEmail, setSearchEmail] = useState(() => {});
  const [loadingComponents, setLoadingComponents] = useState(true);

  useEffect(async () => {
    console.log("reconnecting");
    if (sessionStorage.getItem("accessToken")) {
      try {
        const userId = JSON.parse(
          window.atob(sessionStorage.getItem("accessToken").split(".")[1])
        ).sub;
        //this also refreshes token through interceptor if it is expired
        const user = await getUserDataById(userId);
        const socket = io("http://localhost:7000", {
          reconnectionDelayMax: 10000,
          auth: {
            accessToken: sessionStorage.getItem("accessToken"),
          },
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
        console.log("Invalid Access Token");
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
          <Modal
            showModal={showModal}
            setShowModal={setShowModal}
            searchEmail={searchEmail}
            setSearchEmail={setSearchEmail}
          />

          <Router>
            <Sidebar setShowModal={setShowModal} />
            <Switch>
              <Route path="/t/:conversationId">
                <Chat setShowEmoji={setShowEmoji} />
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
