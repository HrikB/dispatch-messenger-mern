import React, { useState } from "react";
import "./Login.css";
import { Button, IconButton } from "@material-ui/core";
import DispatchLogo from "./DispatchLogo.svg";
import { useStateValue } from "./StateProvider.js";
import { actionTypes } from "./reducer";
import { DeckOutlined } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import { login, register, _dataUrl } from "./server/api";
import { io } from "socket.io-client";
import Loading from "./Loading";
function Login() {
  const [{ user, socket }, dispatch] = useStateValue();

  //login and register fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassConfirm, setRegPassConfirm] = useState("");

  //loading variables
  const [logLoading, setLogLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  //login field error handlers
  const [logEmailError, setLogEmailError] = useState(false);
  const [logPasswordError, setLogPasswordError] = useState(false);
  const [logEmailErrorMessage, setLogEmailErrorMessage] = useState("");
  const [logPasswordErrorMessage, setLogPasswordErrorMessage] = useState("");

  //registration field error handlers
  const [firstError, setFirstError] = useState(false);
  const [lastError, setLastError] = useState(false);
  const [regEmailError, setRegEmailError] = useState(false);
  const [regPasswordError, setRegPasswordError] = useState(false);
  const [confPasswordError, setConfPasswordError] = useState(false);
  const [firstErrorMessage, setFirstErrorMessage] = useState("");
  const [lastErrorMessage, setLastErrorMessage] = useState("");
  const [regEmailErrorMessage, setRegEmailErrorMessage] = useState("");
  const [regPasswordErrorMessage, setRegPasswordErrorMessage] = useState("");
  const [confPasswordErrorMessage, setConfPasswordErrorMessage] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [errVisibility, setErrVisibility] = useState("hidden");
  const [regErrorMessage, setRegErrorMessage] = useState("");

  const [showRegModal, setShowRegModal] = useState(false);

  const setLogDefaults = () => {
    setLogEmailError(false);
    setLogPasswordError(false);
    setLogEmailErrorMessage("");
    setLogPasswordErrorMessage("");
  };

  const setRegDefaults = () => {
    setFirstError(false);
    setLastError(false);
    setRegEmailError(false);
    setRegPasswordError(false);
    setConfPasswordError(false);
    setFirstErrorMessage("");
    setLastErrorMessage("");
    setRegEmailErrorMessage("");
    setRegPasswordErrorMessage("");
    setConfPasswordErrorMessage("");
    setRegErrorMessage("");
  };

  const emptyRegFields = () => {
    setFirstName("");
    setLastName("");
    setRegEmail("");
    setRegPassword("");
    setRegPassConfirm("");
  };

  const grantUserAccess = (serverResponse) => {
    sessionStorage.setItem("accessToken", serverResponse.data.accessToken);
    sessionStorage.setItem("refreshToken", serverResponse.data.refreshToken);

    if (!socket) {
      const socket = io(`${_dataUrl}`, {
        reconnection: false,
        auth: {
          accessToken: sessionStorage.getItem("accessToken"),
          userId: serverResponse.data.user._id,
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
      dispatch({
        type: actionTypes.SET_SOCKET,
        socket: socket,
      });
      socket?.emit("sendUser", serverResponse.data.user._id);
    }
    dispatch({
      type: actionTypes.SET_USER,
      user: serverResponse.data.user,
    });
  };

  const signIn = async (e) => {
    e.preventDefault();
    setLogLoading(true);
    const logResponse = await login(email, password);

    if (logResponse) {
      console.log(logResponse);
      //if successful signin
      if (logResponse.status === 200) {
        grantUserAccess(logResponse);
      }
      //unsucessfull signin
      else {
        const error = logResponse.data.error.message;

        if (Array.isArray(error)) {
          if (error[0].path[0] === "email") {
            setLogEmailError(true);
            setLogEmailErrorMessage(error[0].message);
          } else if (error[0].path[0] === "password") {
            setLogPasswordError(true);
            setLogPasswordErrorMessage(error[0].message);
          }
        } else {
          setLogEmailError(true);
          setLogPasswordError(true);
          setLogEmailErrorMessage(error);
          setLogPasswordErrorMessage(error);
        }

        setErrVisibility("visible");
      }
    } else {
      setErrorMessage("Server Error");
      setErrVisibility("visible");
    }

    setLogLoading(false);
  };

  const signUp = async () => {
    setRegLoading(true);
    const regResponse = await register(
      firstName,
      lastName,
      regEmail,
      regPassword,
      regPassConfirm
    );
    console.log(regResponse);
    if (regResponse.status === 200) {
      grantUserAccess(regResponse);
    } else {
      const error = regResponse.data.error.message;
      if (Array.isArray(error)) {
        if (error[0].path[0] === "first_name") {
          setFirstError(true);
          setFirstErrorMessage(error[0].message);
        } else if (error[0].path[0] === "last_name") {
          setLastError(true);
          setLastErrorMessage(error[0].message);
        } else if (error[0].path[0] === "email") {
          setRegEmailError(true);
          setRegEmailErrorMessage(error[0].message);
        } else if (error[0].path[0] === "password") {
          setRegPasswordError(true);
          setRegPasswordErrorMessage(error[0].message);
        } else if (error[0].path[0] === "password_confirm") {
          setConfPasswordError(true);
          setConfPasswordErrorMessage(error[0].message);
        }
      } else {
        setRegEmailError(true);
        setRegEmailErrorMessage(error);
      }
    }

    setRegLoading(false);
  };

  return (
    <div className="landingPage__container">
      {showRegModal && (
        <div className="registrationModal">
          <form className="register__box">
            <div className="cancel">
              <IconButton
                onClick={() => {
                  emptyRegFields();
                  setShowRegModal(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <h1>Sign Up</h1>
            <p style={{ color: firstError && "red" }}>
              FIRST NAME
              {firstError && ` - ${firstErrorMessage}`}
            </p>
            <input
              type="text"
              className="first__name"
              style={{
                border: firstError && "2px solid red",
                transition: firstError && "0s",
              }}
              value={firstName}
              onChange={(e) => {
                setRegDefaults();
                setFirstName(e.target.value);
              }}
            />
            <p style={{ color: lastError && "red" }}>
              LAST NAME
              {lastError && ` - ${lastErrorMessage}`}
            </p>
            <input
              type="text"
              className="last__name"
              style={{
                border: lastError && "2px solid red",
                transition: lastError && "0s",
              }}
              value={lastName}
              onChange={(e) => {
                setRegDefaults();
                setLastName(e.target.value);
              }}
            />
            <p style={{ color: regEmailError && "red" }}>
              EMAIL
              {regEmailError && ` - ${regEmailErrorMessage}`}
            </p>
            <input
              type="text"
              className="email"
              style={{
                border: regEmailError && "2px solid red",
                transition: regEmailError && "0s",
              }}
              value={regEmail}
              onChange={(e) => {
                setRegDefaults();
                setRegEmail(e.target.value);
              }}
            />
            <p style={{ color: regPasswordError && "red" }}>
              PASSWORD
              {regPasswordError && ` - ${regPasswordErrorMessage}`}
            </p>
            <input
              type="password"
              className="new__password"
              style={{
                border: regPasswordError && "2px solid red",
                transition: regPasswordError && "0s",
              }}
              value={regPassword}
              onChange={(e) => {
                setRegDefaults();
                setRegPassword(e.target.value);
              }}
            />
            <p style={{ color: confPasswordError && "red" }}>
              CONFIRM PASSWORD
              {confPasswordError && ` - ${confPasswordErrorMessage}`}
            </p>
            <input
              type="password"
              className="confirm__password"
              style={{
                border: confPasswordError && "2px solid red",
                transition: confPasswordError && "0s",
              }}
              value={regPassConfirm}
              onChange={(e) => {
                setRegDefaults();
                setRegPassConfirm(e.target.value);
              }}
            />
            <p className="regError__message">
              {regErrorMessage &&
                regErrorMessage !== "" &&
                `Error: ${regErrorMessage}`}
            </p>
            <button type="button" className="sign__up" onClick={signUp}>
              {regLoading ? <Loading /> : <h3>Sign Up</h3>}
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
            <p style={{ color: logEmailError && "red" }}>
              EMAIL
              {logEmailError && ` - ${logEmailErrorMessage}`}
            </p>
            <form onSubmit={signIn}>
              <input
                style={{
                  border: logEmailError && "2px solid red",
                }}
                type="text"
                className="username"
                value={email}
                onChange={(e) => {
                  setLogDefaults();
                  setEmail(e.target.value);
                }}
              />
            </form>

            <p style={{ color: logPasswordError && "red" }}>
              PASSWORD
              {logPasswordError && ` - ${logPasswordErrorMessage}`}
            </p>
            <form onSubmit={signIn}>
              <input
                style={{
                  border: logPasswordError && "2px solid red",
                  transition: logPasswordError && "0s",
                }}
                type="password"
                className="password"
                value={password}
                onChange={(e) => {
                  setLogDefaults();
                  setPassword(e.target.value);
                }}
              />
            </form>

            <button className="login__button" onClick={signIn}>
              {logLoading ? <Loading /> : <h3>Log In</h3>}
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
              onClick={() => {
                setRegDefaults();
                setShowRegModal(true);
              }}
            >
              <h3>Create New Account</h3>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
