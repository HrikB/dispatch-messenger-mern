import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const _authUrl = `${window.location.origin}`;
export const _dataUrl = "http://localhost:4000";
const instance = axios.create();
axios.defaults.withCredentials = true;
let user;

const blobToBase64 = async (blob) => {
  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

export const injectUser = (_user) => {
  user = _user;
};

axios.interceptors.request.use(
  (request) => {
    request.headers["Authorization"] =
      "Bearer " + sessionStorage.getItem("accessToken");
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
      user.dispatch({ type: "SET_USER", user: null });
      return Promise.resolve({ data: [] });
    } else {
      sessionStorage.setItem("accessToken", newTokenPair.data.accessToken);
      sessionStorage.setItem("refreshToken", newTokenPair.data.refreshToken);
      if (config.method === "get") {
        if (config.responseType) {
          return await axios.get(`${config.url}`, {
            responseType: config.responseType,
          });
        }
        return await axios.get(`${config.url}`);
      }
      if (config.method === "put") {
        return await axios.put(`${config.url}`, JSON.parse(config.data));
      }
      if (config.method === "post") {
        return await axios.post(`${config.url}`, config.data);
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

export const getOnlineStatus = async (userId) => {
  try {
    return await axios.get(`${_dataUrl}/api/user/online/${userId}`);
  } catch (err) {
    return err.resposne;
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

export const updateProfilePic = async (userId, picId) => {
  try {
    return await axios.put(`${_dataUrl}/api/user/update-profile/pic`, {
      userId,
      profPic: picId,
    });
  } catch (err) {
    return err.response;
  }
};

export const uploadPicture = async (userId, formData) => {
  try {
    return await axios.post(`${_dataUrl}/api/images/upload`, formData);
  } catch (err) {
    return err.response;
  }
};

export const getPicture = async (picId) => {
  try {
    //gets blob
    const blob = await axios.get(`${_dataUrl}/api/images/${picId}`, {
      responseType: "blob",
    });

    //turns blob into base64 and returns it
    return await blobToBase64(blob.data);
  } catch (err) {
    return err.resposne;
  }
};

export const getVoiceMessage = async (audioId) => {
  try {
    const blob = await axios.get(`${_dataUrl}/api/audio/${audioId}`, {
      responseType: "blob",
    });
    //turns blob into base64 and returns it
    return blob.data;
  } catch (err) {
    return err.response;
  }
};

export const updateFirstName = async (userId, firstName) => {
  try {
    return await axios.put(`${_dataUrl}/api/user/update-profile/first-name`, {
      userId,
      firstName,
    });
  } catch (err) {
    return err.response;
  }
};

export const updateLastName = async (userId, lastName) => {
  try {
    return await axios.put(`${_dataUrl}/api/user/update-profile/last-name`, {
      userId,
      lastName,
    });
  } catch (err) {
    return err.response;
  }
};

export const updateEmail = async (userId, email) => {
  try {
    return await axios.put(`${_dataUrl}/api/user/update-profile/email`, {
      userId,
      email,
    });
  } catch (err) {
    return err.response;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const res = await axios.get(
      `${_dataUrl}/api/messages/get-message/${conversationId}`
    );

    return res;
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

export const removeFriend = async (removerId, toRemoveId) => {
  try {
    return await axios.put(`${_dataUrl}/api/requests/remove`, {
      removerId,
      toRemoveId,
    });
  } catch (err) {
    return err.response;
  }
};

export const logOutAPI = async () => {
  try {
    return await axios.delete(`${_authUrl}/auth/logout`, {
      data: { refreshToken: sessionStorage.getItem("refreshToken") },
    });
  } catch (err) {
    return err.response;
  }
};

export const refreshAccessToken = async () => {
  try {
    return await instance.post(`${_authUrl}/auth/token`, {
      refreshToken: sessionStorage.getItem("refreshToken"),
    });
  } catch (err) {
    return err.response;
  }
};
