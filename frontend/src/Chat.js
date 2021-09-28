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

function Chat() {
  const [input, setInput] = useState("");
  const [personName, setPersonName] = useState("");
  const [chatWithPic, setChatWithPic] = useState("");
  const [chatWithEmail, setChatWithEmail] = useState("");
  const [lastSentTime, setlastSentTime] = useState(new Date(0));
  const { chatHash } = useParams();
  const [{ user }, dispatch] = useStateValue();
  const [messages, setMessages] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openMic, setOpenMic] = useState(false);
  const inputContainer = document.getElementsByClassName("input__container")[0];
  const inputOverlay = document.getElementsByClassName("input__overlay")[0];
  const inputField = document.getElementsByClassName("input__field")[0];
  const emojiButton = document.getElementsByClassName("emoji__button")[0];
  const micIcon = document.getElementById("mic__icon");
  const deleteIcon = document.getElementById("delete__icon");
  const useForceUpdate = () => {
    const [value, setValue] = useState(0); // integer state
    return () => setValue((value) => value + 1); // update the state to force render
  };
  const forceUpdate = useForceUpdate();
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  var msgArr = "";
  let unsub;
  useEffect(() => {
    //checks if there is chatHash in the link
    if (chatHash) {
    }
  }, [chatHash]);

  const sendMessage = (e) => {
    e.preventDefault();
    setOpenMic(false);
    setInput("");
    scrollToBottomSmooth();
  };

  return (
    <div id="chatid" className="chat">
      <div className="chat__header">
        <Avatar src={chatWithPic} />
        <div className="chat__headerInfo">
          <h3>{personName}</h3>
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
        {console.log(messages)}
        {messages.map((message, i) => (
          <div id="container__id" className="dateMessageContainer">
            {/*Checks if 10 mins has passed since last message. If it has, redisplay time*/}
            <h6
              className="time"
              style={
                messages[i].timestamp
                  ? messages[i]?.timestamp.valueOf() > new Date(0, 0).valueOf()
                    ? {}
                    : { display: "none" }
                  : Date.now() >
                    (lastSentTime ? lastSentTime : new Date(0)).valueOf() +
                      600000
                  ? {}
                  : { display: "none" }
              }
            >
              {messages[i].timestamp
                ? new Date(
                    messages[i].timestamp.seconds * 1000 +
                      messages[i].timestamp.nanoseconds / 1000000
                  ).toString()
                : new Date(Date.now()).toDateString() +
                  " " +
                  new Date(Date.now()).toTimeString()}
            </h6>
            <p
              className={`chat__message ${
                message.senderEmail === user.email && "chat__reciever"
              } ${
                messages[i - 1]?.senderEmail == messages[i].senderEmail &&
                !(messages[i].timestamp
                  ? messages[i]?.timestamp.valueOf() > new Date(0).valueOf()
                  : Date.now() > lastSentTime.valueOf() + 600000) &&
                "same__sender"
              }`}
            >
              <h6 className="chat__name">
                {message.senderEmail !== user.email ? message.name : ""}
              </h6>
              {message.message}
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
              onChange={(e) => {
                setIsInitialized(true);
                setInput(e.target.value);
              }}
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
