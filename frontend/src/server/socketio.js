import { io } from "socket.io-client";

const socket = io("http://localhost:7000", {
  reconnectionDelayMax: 10000,
  auth: {
    accessToken: localStorage.getItem("token"),
  },
});

export default socket;
