import React, { useState } from "react";
import "./Login.css";
import { Button } from "@material-ui/core";
import DispatchLogo from "./DispatchLogo.svg";
import { useStateValue } from "./StateProvider.js";
import { actionTypes } from "./reducer";
import { DeckOutlined } from "@material-ui/icons";

function Login() {
  const [{}, dispatch] = useStateValue();

  const signIn = () => {
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
    <div className="login">
      <div className="login__container">
        <img src={DispatchLogo} alt="Logo" />
        <div className="login__text">
          <h1>Sign in to Dispatch</h1>
        </div>

        <Button onClick={signIn}>Sign In</Button>
      </div>
    </div>
  );
}

export default Login;
