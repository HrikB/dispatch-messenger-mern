import React, { useState } from "react";
import "./Login.css";
import { Button, IconButton } from "@material-ui/core";
import DispatchLogo from "./DispatchLogo.svg";
import { useStateValue } from "./StateProvider.js";
import { actionTypes } from "./reducer";
import { DeckOutlined } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import { login, register } from "./api";

function Login() {
  const [{}, dispatch] = useStateValue();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassConfirm, setRegPassConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("/");
  const [errVisibility, setErrVisibility] = useState("hidden");
  const [showRegModal, setShowRegModal] = useState(false);

  const signIn = async () => {
    const response = await login(email, password);
    if (response.data.success) {
      setErrorMessage("/");
      setErrVisibility("hidden");
      dispatch({
        type: actionTypes.SET_USER,
        user: response.data.message,
      });
      localStorage.setItem("token", response.data.accessToken);
    }
    if (response.data.errors) {
      setErrorMessage(response.data.errors[0].error);
      setErrVisibility("visible");
    }
  };

  const signUp = async () => {
    const response = await register(
      firstName,
      lastName,
      regEmail,
      regPassword,
      regPassConfirm
    );
    console.log(response);
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
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                }}
              />
              <input
                type="text"
                className="last__name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                }}
              />
            </div>
            <input
              type="text"
              className="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => {
                setRegEmail(e.target.value);
              }}
            />
            <input
              type="password"
              className="new__password"
              placeholder="New password"
              value={regPassword}
              onChange={(e) => {
                setRegPassword(e.target.value);
              }}
            />
            <input
              type="password"
              className="confirm__password"
              placeholder="Confirm password"
              value={regPassConfirm}
              onChange={(e) => {
                setRegPassConfirm(e.target.value);
              }}
            />
            <button type="button" className="sign__up" onClick={signUp}>
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
              }}
            />
            <button className="login__button" onClick={signIn}>
              <h3>Log In</h3>
            </button>
            <h5
              className="error__message"
              style={{ visibility: `${errVisibility}` }}
            >
              {errorMessage}
            </h5>
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
