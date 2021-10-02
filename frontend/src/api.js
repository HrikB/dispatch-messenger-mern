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

//export const register = ()
