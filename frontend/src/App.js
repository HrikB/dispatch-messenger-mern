import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import Login from "./Login";
import { useStateValue } from "./StateProvider";
import Modal from "./Modal";

function App() {
  const [{ user }, dispatch] = useStateValue();
  const [showModal, setShowModal] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchEmail, setSearchEmail] = useState(() => {});

  return (
    <div className="app">
      {!user ? (
        <Login />
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
              <Route path="/:chatHash">
                <Chat setShowEmoji={setShowEmoji} />
              </Route>
            </Switch>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
