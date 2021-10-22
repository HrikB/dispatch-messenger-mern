import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const _authUrl = "http://localhost:8000";
const _dataUrl = "http://localhost:7000";
const instance = axios.create();

axios.interceptors.request.use(
  (request) => {
    request.headers["Authorization"] =
      "Bearer " + localStorage.getItem("accessToken");
    return request;
  },
  (err) => {
    Promise.reject(err);
  }
);

axios.interceptors.response.use(undefined, async (err) => {
  const {
    config,
    response: { status },
  } = err;

  if (status === 401) {
    const newTokenPair = await refreshAccessToken();
    if (newTokenPair.data.error) {
    } else {
      localStorage.setItem("accessToken", newTokenPair.data.accessToken);
      localStorage.setItem("refreshToken", newTokenPair.data.refreshToken);
      console.log("d", config);
      if (config.method === "get") {
        return await axios.get(`${config.url}`);
      }
    }
  }
  return Promise.reject(err);
});

export const login = async (email, pass) => {
  try {
    return await axios.post(`${_authUrl}/auth/signin`, {
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
    return await axios.post(`${_authUrl}/auth/signup`, {
      first_name,
      last_name,
      email,
      password,
      password_confirm,
    });
  } catch (err) {
    return err.response;
  }
};

export const getConversation = async (conversationId) => {
  try {
    return await axios.get(
      `${_dataUrl}/api/conversations/conversation-data/${conversationId}`
    );
  } catch (err) {
    return err.response;
  }
};

export const getConversations = async (userId) => {
  try {
    return await axios.get(
      `${_dataUrl}/api/conversations/all-conversations/${userId}`
    );
  } catch (err) {
    return err.response;
  }
};

export const getUserDataById = async (userId) => {
  try {
    return await axios.get(`${_dataUrl}/api/user/user-id/${userId}`);
  } catch (err) {
    return err.response;
  }
};

export const getUserDataByEmail = async (email) => {
  try {
    return await axios.get(`${_dataUrl}/api/user/user-email/${email}`);
  } catch (err) {
    return err.response;
  }
};

export const getMessages = async (conversationId) => {
  try {
    return await axios.get(
      `${_dataUrl}/api/messages/get-message/${conversationId}`
    );
  } catch (err) {
    return err.response;
  }
};

export const sendMessageDatabase = async (conversationId, sender, message) => {
  try {
    return await axios.post(`${_dataUrl}/api/messages/send-message`, {
      conversationId,
      sender,
      text: message,
    });
  } catch (err) {
    return err.response;
  }
};

export const sendFriendRequest = async (userId, userName, receiverEmail) => {
  try {
    return await axios.post(`${_dataUrl}/api/requests/send-request`, {
      userId,
      userName,
      receiverEmail,
    });
  } catch (err) {
    return err.response;
  }
};

export const getFriendRequests = async (userId) => {
  try {
    return await axios.get(`${_dataUrl}/api/requests/get-request/${userId}`);
  } catch (err) {
    return err.response;
  }
};

export const getAllFriends = async (userId) => {
  try {
    return await axios.get(`${_dataUrl}/api/requests/friends/${userId}`);
  } catch (err) {
    return err.response;
  }
};

export const refreshAccessToken = async () => {
  try {
    return await instance.post(`${_authUrl}/auth/token`, {
      refreshToken: localStorage.getItem("refreshToken"),
    });
  } catch (err) {
    return err.response;
  }
};
