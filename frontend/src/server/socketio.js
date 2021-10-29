/*import { io } from "socket.io-client";

var socket = null;

export const connectSocket = () => {
  const newSocket = io("http://localhost:7000", {
    reconnectionDelayMax: 10000,
    auth: {
      accessToken: sessionStorage.getItem("accessToken"),
    },
  });
  console.log("new", newSocket);
  updateSocket(newSocket);
  return newSocket;
};
const updateSocket = (newSocket) => {
  socket = newSocket;
  console.log(socket === newSocket);
};

if (sessionStorage.getItem("accessToken")) {
  connectSocket();
}*/

//export default socket;
