import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const login = async (email, pass) => {
  try {
    const res = await axios.post(`http://localhost:8000/api/signin`, {
      email: email,
      password: pass,
    });
    return res;
  } catch (err) {
    return err.response;
  }
};

export const register = async (
  first_name,
  last_name,
  email,
  password,
  password_confirm
) => {
  try {
    const res = await axios.post(`http://localhost:8000/api/signup`, {
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
      password_confirm: password_confirm,
    });
    return res;
  } catch (err) {
    return err.response;
  }
};
