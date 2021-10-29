import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { Avatar, IconButton } from "@material-ui/core";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import {
  SearchOutlined,
  MoreVert,
  SendOutlined,
  DateRange,
  LocalConvenienceStoreOutlined,
  ContactPhoneOutlined,
} from "@material-ui/icons";
import { useParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { useStateValue } from "./StateProvider";
import Picker, { SKIN_TONE_NEUTRAL } from "emoji-picker-react";
import DeleteIcon from "@material-ui/icons/Delete";
import { getConversation, getMessages, getUserDataById } from "./server/api.js";
//import socket from "./server/socketio";

function Chat() {
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState({});
  const [personName, setPersonName] = useState("");
  const [chatWithPic, setChatWithPic] = useState("");
  const [chatWithEmail, setChatWithEmail] = useState("");
  const [openMic, setOpenMic] = useState(false);
  const [lastSentTime, setlastSentTime] = useState(new Date(0));
  const [conversation, setConversation] = useState({});
  const { conversationId } = useParams();
  const [{ user, socket }, dispatch] = useStateValue();
  const [messages, setMessages] = useState([]);
  const [arrivingMessage, setArrivingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const inputContainer = document.getElementsByClassName("input__container")[0];
  const inputOverlay = document.getElementsByClassName("input__overlay")[0];
  const inputField = document.getElementsByClassName("input__field")[0];
  const emojiButton = document.getElementsByClassName("emoji__button")[0];
  const micIcon = document.getElementById("mic__icon");
  const deleteIcon = document.getElementById("delete__icon");

  const onEmojiClick = (e, emojiObject) => {
    setInput(input + emojiObject.emoji);
  };

  const onMicClick = () => {
    setOpenMic(true);
    //replace typing section
    inputContainer.style.zIndex = "-1";
    inputField.style.zIndex = "-1";
    emojiButton.style.zIndex = "-1";
    inputOverlay.style.transition = "transform 0.3s ease";
    inputOverlay.style.transform = "translateX(0)";

    //transform mic icon to delete icon
    deleteIcon.style.display = "initial";
    deleteIcon.disabled = true;
    micIcon.style.display = "none";
    setTimeout(() => (deleteIcon.disabled = false), 1000);
  };
  const onDeleteClick = () => {
    setOpenMic(false);
    inputOverlay.style.transform = "translateX(-100%)";
    micIcon.style.display = "initial";
    micIcon.disabled = true;
    deleteIcon.style.display = "none";
    setTimeout(() => {
      inputContainer.style.zIndex = "0";
      inputField.style.zIndex = "0";
      emojiButton.style.zIndex = "0";
    }, 333);
    setTimeout(() => (micIcon.disabled = false), 1000);
  };

  const onStop = async (recordedBlob) => {
    const file = await fetch(recordedBlob.blobURL)
      .then((r) => r.blob())
      .then(
        (blobFile) =>
          new File([blobFile], "audioMessage", { type: blobFile.type })
      );
    setInput(file);
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  //checks for data from socket
  useEffect(() => {
    socket?.on("welcome", () => {
      console.log("Welcome this is the socket server");
    });
    socket?.emit("sendUser", user._id);
    socket?.on("getUsers", (users) => {});
    socket?.on("getMessage", (data) => {
      setArrivingMessage({
        sender: data.sender,
        receiver: user._id,
        text: data.text,
        createdAt: data.createdAt,
      });
    });
  }, [user]);

  //loads messages from the database
  useEffect(async () => {
    //checks if there is conversationId in the link
    if (conversationId) {
      const messages = await getMessages(conversationId);
      const conversation = await getConversation(conversationId);
      const receiverData = await getUserDataById(
        conversation.data?.members.find((m) => m !== user._id)
      );
      setMessages(messages.data);
      setConversation(conversation.data);
      setReceiver(receiverData.data);
    }
  }, [conversationId]);

  useEffect(() => {
    arrivingMessage &&
      conversation?.members.includes(arrivingMessage.sender) &&
      setMessages((prev) => [...prev, arrivingMessage]);
  }, [arrivingMessage, conversation]);

  const sendMessage = (e) => {
    e.preventDefault();
    const receiverId = conversation?.members.find((m) => m !== user._id);
    let outgoingMessage = {
      conversationId: conversationId,
      sender: user._id,
      receiver: receiverId,
      text: input,
      createdAt: Date.now(),
    };
    socket.emit("sendMessage", outgoingMessage);

    setMessages((prev) => [...prev, outgoingMessage]);

    //send message to Database asynchrounsly
    //is it more performative or sercure if instead of
    //storing to database from client while sending, I picked up the
    //data from the socket server side and had the server send to
    //database directly??
    /*try {
      sendMessageDatabase(conversationId, user._id, input);
    } catch (err) {
      console.error(err);
    }*/

    setOpenMic(false);
    setInput("");
    scrollToBottomSmooth();
  };

  return (
    <div id="chatid" className="chat">
      <div className="chat__header">
        <Avatar src={chatWithPic} />
        <div className="chat__headerInfo">
          <h3>{receiver.first_name + " " + receiver.last_name}</h3>
          <h6>Last seen at...</h6>
        </div>

        <div className="chat__headerRight">
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <style></style>
      <div id="body__id" className="chat__body">
        {messages.map((message, i) => (
          <div id="container__id" className="dateMessageContainer">
            {/*Checks if 10 mins passed since last message. If it has, redisplay time*/}
            {
              <h6 className="time">
                {(!messages[i - 1] ||
                  new Date(
                    new Date(messages[i - 1]?.createdAt).getTime() + 10 * 60000
                  ) < new Date(new Date(messages[i].createdAt).getTime())) &&
                  new Date(message.createdAt).toLocaleTimeString([], {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
              </h6>
            }
            <p
              className={`chat__message ${
                message.sender == user._id && "chat__reciever"
              } ${
                !(
                  new Date(
                    new Date(messages[i - 1]?.createdAt).getTime() + 10 * 60000
                  ) < new Date(new Date(messages[i].createdAt).getTime())
                ) &&
                messages[i - 1]?.sender == messages[i].sender &&
                "same__sender"
              }`}
            >
              <h6 className="chat__name">
                {message.senderEmail !== user.email ? message.name : ""}
              </h6>

              {message.text}
            </p>
          </div>
        ))}
        <div
          id="endRef__id"
          style={{
            float: "left",
            clear: "both",
            width: "10px",
            height: "10px",
          }}
          ref={messagesEndRef}
        ></div>
      </div>
      <div className="emoji__container">
        {openEmoji && (
          <Picker
            onEmojiClick={onEmojiClick}
            pickerStyle={{
              position: "absolute",
              bottom: "0",
              right: "0",
            }}
            preload="true"
            native="true"
            className="emoji__box"
          />
        )}
      </div>
      <div className="mic__container">
        {/*true && (
          <ReactMic
            record={openMic}
            visualSetting="frequencyBars"
            onStop={onStop}
            strokeColor="white"
            backgroundColor="#FF4081"
          />
        )*/}
      </div>

      <div className="chat__footer">
        <div className="icon__container">
          <IconButton id="delete__icon" onClick={onDeleteClick}>
            <DeleteIcon />
          </IconButton>
          <IconButton id="mic__icon" onClick={onMicClick}>
            <MicIcon />
          </IconButton>
        </div>

        <form className="form">
          <div id="type_message" className="input__container">
            <div className="input__overlay"></div>
            <input
              className="input__field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a Message..."
              type="text"
            />
            <IconButton
              className="emoji__button"
              onClick={() => setOpenEmoji(!openEmoji)}
            >
              <InsertEmoticonIcon />
            </IconButton>
          </div>
          <button
            disabled={!input.trim()}
            id="submitbutton"
            onClick={sendMessage}
            type="submit"
          >
            <IconButton>
              <SendOutlined />
            </IconButton>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
