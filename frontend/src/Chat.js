import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { Avatar, IconButton } from "@material-ui/core";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import MicIcon from "@material-ui/icons/Mic";
import { MoreVert, SendOutlined } from "@material-ui/icons";
import { useParams } from "react-router-dom";
import ReactDOM from "react-dom";
import { useStateValue } from "./StateProvider";
import Picker, { SKIN_TONE_NEUTRAL } from "emoji-picker-react";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  getConversation,
  getMessages,
  getPicture,
  getUserDataById,
} from "./server/api.js";
import Loading from "./Loading";

function Chat({ conversations, setConversations, setLastMessage }) {
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState({});
  const [openMic, setOpenMic] = useState(false);
  const [conversation, setConversation] = useState({});
  const [audioOutput, setAudioOutput] = useState();
  const { conversationId } = useParams();
  const [{ user, socket }, dispatch] = useStateValue();
  const [messages, setMessages] = useState([]);
  const [arrivingMessage, setArrivingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [removed, setRemoved] = useState(false);
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

  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    if (!audio) return;
    return audio;
  };

  const onMicClick = async () => {
    const micAudio = await getMicrophone();
    if (!micAudio) return;
    setAudioOutput(micAudio);
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

  const scrollToBottomAuto = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "auto" });
  };

  //checks for data from socket
  useEffect(() => {
    socket?.on("welcome", () => {
      console.log("Welcome this is the server");
    });
    //getUsers to get online users
    socket?.on("getMessage", (data) => {
      const arrvMessage = {
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        receiver: user._id,
        text: data.text,
        createdAt: data.createdAt,
      };
      setArrivingMessage(arrvMessage);
      //sets the recent message on the sidebar component
      setLastMessage(arrvMessage);
      //moves most recent conversation to the top
    });
    socket?.on("removeConversation", (removedConvId) => {
      console.log(removedConvId);
      if (removedConvId === conversationId) {
        setRemoved(true);
        setReceiver(null);
      }
    });
  }, [user]);

  //loads messages from the database
  useEffect(async () => {
    //checks if there is conversationId in the link
    if (conversationId) {
      setLoading(true);
      const messages = await getMessages(conversationId);
      const conversation = await getConversation(conversationId);
      if (messages?.data?.error || conversation?.data?.error) {
        setLoading(false);
        return;
      }
      const receiverData = await getUserDataById(
        conversation.data?.members.find((m) => m !== user._id)
      );
      //get image metadata
      receiverData.data.prof_pic = await getPicture(receiverData.data.prof_pic);
      setLoading(false);
      setMessages(messages.data);
      setConversation(conversation.data);
      setReceiver(receiverData.data);
      scrollToBottomAuto();
    }
  }, [conversationId]);

  useEffect(() => {
    if (arrivingMessage) {
      console.log("new arrived");
      conversation?.members.includes(arrivingMessage.senderId) &&
        setMessages((prev) => [...prev, arrivingMessage]);

      //Moves conversation to top of the messages list
      setConversations(() => {
        const temp = conversations;
        let moveToFront;
        for (let i = 0; i < temp.length; i++) {
          if (temp[i]._id === arrivingMessage.conversationId) {
            moveToFront = temp[i];
            temp.splice(i, 1);
            break;
          }
        }
        temp.unshift(moveToFront);
        return temp;
      });
    }
    scrollToBottomSmooth();
  }, [arrivingMessage]);

  useEffect(() => {
    scrollToBottomSmooth();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const receiverId = conversation?.members.find((m) => m !== user._id);
    let outgoingMessage = {
      conversationId: conversationId,
      senderId: user._id,
      senderName: user.first_name,
      receiver: receiverId,
      text: input,
      createdAt: Date.now(),
    };
    //sets the recent message on the sidebar component
    setLastMessage(outgoingMessage);
    //moves most recent conversation to the top
    setConversations(() => {
      const temp = conversations;
      let moveToFront;
      for (let i = 0; i < temp.length; i++) {
        if (temp[i]._id === conversationId) {
          moveToFront = temp[i];
          temp.splice(i, 1);
          break;
        }
      }
      temp.unshift(moveToFront);
      return temp;
    });
    socket.emit("sendMessage", outgoingMessage);

    setMessages((prev) => [...prev, outgoingMessage]);

    setOpenMic(false);
    setInput("");
  };

  return (
    <div id="chatid" className="chat">
      <div className="chat__header">
        <Avatar src={receiver?.prof_pic} />
        {receiver?.first_name && receiver?.last_name && (
          <div className="chat__headerInfo">
            <h3>
              {loading
                ? "Loading..."
                : receiver.first_name + " " + receiver.last_name}
            </h3>
            <h6>Last seen at...</h6>
          </div>
        )}
      </div>

      <div
        id="body__id"
        style={{
          display: (loading || removed) && "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="chat__body"
      >
        {removed && (
          <p className="remove__message">
            This user has removed you as a friend. You can no longer send them
            messages.
          </p>
        )}
        {!removed &&
          (loading ? (
            <Loading />
          ) : (
            messages.map((message, i) => (
              <div id="container__id" className="dateMessageContainer">
                {/*Checks if 10 mins passed since last message. If it has, redisplay time*/}
                {
                  <h6 className="time">
                    {(!messages[i - 1] ||
                      new Date(
                        new Date(messages[i - 1]?.createdAt).getTime() +
                          10 * 60000
                      ) <
                        new Date(new Date(messages[i].createdAt).getTime())) &&
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
                    message.senderId == user._id && "chat__reciever"
                  } ${
                    !(
                      new Date(
                        new Date(messages[i - 1]?.createdAt).getTime() +
                          10 * 60000
                      ) < new Date(new Date(messages[i].createdAt).getTime())
                    ) &&
                    messages[i - 1]?.senderId == messages[i].senderId &&
                    "same__sender"
                  }`}
                >
                  {/*<h6 className="chat__name">
                {message.senderId !== user._id ? message.senderName : ""}
            </h6>*/}

                  {message.text}
                </p>
              </div>
            ))
          ))}
        <div
          id="endRef__id"
          style={{
            "margin-top": "30px",
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
          <IconButton
            id="mic__icon"
            disabled={loading || removed}
            onClick={onMicClick}
          >
            <MicIcon />
          </IconButton>
        </div>

        <form className="form">
          <div id="type_message" className="input__container">
            <div className="input__overlay"></div>
            <input
              className="input__field"
              disabled={loading || removed}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a Message..."
              type="text"
            />
            <IconButton
              className="emoji__button"
              disabled={loading || removed}
              onClick={() => setOpenEmoji(!openEmoji)}
            >
              <InsertEmoticonIcon />
            </IconButton>
          </div>
          <button
            disabled={!input.trim() || loading || removed}
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
