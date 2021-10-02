import React, { useState } from "react";
import "./Login.css";
import { Button, IconButton } from "@material-ui/core";
import DispatchLogo from "./DispatchLogo.svg";
import { useStateValue } from "./StateProvider.js";
import { actionTypes } from "./reducer";
import { DeckOutlined } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import { login } from "./api";

function Login() {
  const [{}, dispatch] = useStateValue();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegModal, setShowRegModal] = useState(false);

  const signIn = async () => {
    const response = await login(email, password);
    if (response.data.success) {
      dispatch({
        type: actionTypes.SET_USER,
        user: response.data.message,
      });
    }
    if (response.data.errors) {
      console.log(response.data.errors[0].error);
    }
    console.log(response.data);
    /*dispatch({
      type: actionTypes.SET_USER,
      user: response,
    });*/
    /*auth
      .signInWithPopup(provider)
      .then((result) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: result.user,
        });

        if (result.additionalUserInfo.isNewUser) {
        }
      })
      .catch((error) => alert(error.message));*/
  };

  return (
    <div className="landingPage__container">
      {showRegModal && (
        <div className="registrationModal">
          <form className="register__box">
            <div className="cancel">
              <IconButton onClick={() => setShowRegModal(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <h1>Sign Up</h1>
            <div className="name__container">
              <input
                type="text"
                className="first__name"
                placeholder="First name"
              />
              <input
                type="text"
                className="last__name"
                placeholder="Last name"
              />
            </div>
            <input type="text" className="email" placeholder="Email" />
            <input
              type="password"
              className="new__password"
              placeholder="New password"
            />
            <input
              type="password"
              className="confirm__password"
              placeholder="Confirm password"
            />
            <button className="sign__up" onClick={(e) => e.preventDefault()}>
              <h3>Sign Up</h3>
            </button>
          </form>
        </div>
      )}
      <div className="login">
        <div className="app__info">
          <img src={DispatchLogo} alt="Logo" />
          <h1>Dispatch</h1>
        </div>
        <div className="userInteract__container">
          <div className="login__container">
            <input
              type="text"
              placeholder="Email"
              className="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                console.log(password);
              }}
            />
            <button className="login__button" onClick={signIn}>
              <h3>Log In</h3>
            </button>
          </div>
          <div className="register__container">
            <button
              className="createNew__account"
              onClick={() => setShowRegModal(true)}
            >
              <h3>Create New Account</h3>
            </button>
          </div>
        </div>
        {/*<div className="login__container">
          <img src={DispatchLogo} alt="Logo" />
          <div className="login__text">
            <h1>Sign in to Dispatch</h1>
          </div>

          <Button onClick={signIn}>Sign In</Button>
        </div>*/}
      </div>
    </div>
  );
}

export default Login;
