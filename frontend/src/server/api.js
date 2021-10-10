import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const login = async (email, pass) => {
  try {
    return await axios.post(`http://localhost:8000/auth/signin`, {
      email: email,
      password: pass,
    });
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
    return await axios.post(`http://localhost:8000/auth/signup`, {
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
      password_confirm: password_confirm,
    });
  } catch (err) {
    return err.response;
  }
};

export const getConversation = async (conversationId) => {
  try {
    return await axios.get(
      "http://localhost:7000/api/conversations/conversation-data/" +
        conversationId
    );
  } catch (err) {
    return err.response;
  }
};

export const getConversations = async (userId) => {
  try {
    return await axios.get(
      "http://localhost:7000/api/conversations/all-conversations/" + userId
    );
  } catch (err) {
    return err.response;
  }
};

export const getUserData = async (userId) => {
  try {
    return await axios.get("http://localhost:8000/auth/data/" + userId);
  } catch (err) {
    return err.response;
  }
};

export const getMessages = async (conversationId) => {
  try {
    return await axios.get(
      "http://localhost:7000/api/messages/get-message/" + conversationId
    );
  } catch (err) {
    return err.response;
  }
};

export const sendMessageDatabase = async (conversationId, sender, message) => {
  try {
    return await axios.post("http://localhost:7000/api/messages/send-message", {
      conversationId: conversationId,
      sender: sender,
      text: message,
    });
  } catch (err) {
    return err.response;
  }
};
