import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Avatar, IconButton } from "@material-ui/core";
import { SendOutlined, InsertEmoticon, Mic, Delete } from "@material-ui/icons";
import { useStateValue } from "../../redux/StateProvider";
import {
  getConversation,
  getMessages,
  getPicture,
  getUserDataById,
  getOnlineStatus,
} from "../../server/api.js";
import Picker from "emoji-picker-react";
import Loading from "../Loading";
import "./Chat.css";
import Microphone from "./audiohandler/Microphone";

//settings for microphone
const visualizerOptions = {
  strokeWidth: 5,
  strokeColor: "blue",
  canvasColor: "purple",
  cssWidth: "100%",
  cssHeight: "100%",
};

function Chat({ conversations, setConversations, setLastMessage }) {
  const [input, setInput] = useState("");
  const [receiver, setReceiver] = useState({});
  const [conversation, setConversation] = useState({});
  const { conversationId } = useParams();
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [{ user, socket }, dispatch] = useStateValue();
  const [messages, setMessages] = useState([]);
  const [arrivingMessage, setArrivingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef();
  const [loading, setLoading] = useState(true);
  const [removed, setRemoved] = useState(false);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [record, setRecord] = useState(false);

  const inputContainer = document.getElementsByClassName("input__container")[0];
  const inputOverlay = document.getElementsByClassName("input__overlay")[0];
  const inputField = document.getElementsByClassName("input__field")[0];
  const emojiButton = document.getElementsByClassName("emoji__button")[0];
  const micIcon = document.getElementById("mic__icon");
  const deleteIcon = document.getElementById("delete__icon");

  //mic hooks
  const [openMic, setOpenMic] = useState(false);
  const [disableAudio, setDisableAudio] = useState(false);
  const [sendAudio, setSendAudio] = useState(false);
  const [audioMessage, setAudioMessage] = useState();

  const onEmojiClick = (e, emojiObject) => {
    setInput(input + emojiObject.emoji);
  };

  const onAudioOptionClick = () => {
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

  const onStop = (blobObj) => {
    console.log("stopped in chat", blobObj);
    setAudioMessage(blobObj);
  };

  const scrollToBottomSmooth = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottomAuto = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "auto" });
  };

  //closes emoji picker if clicked outside area
  useEffect(() => {
    const updateMenu = (e) => {
      if (
        emojiPickerRef &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setOpenEmoji(false);
      }
    };

    document.addEventListener("mousedown", updateMenu);

    return () => {
      document.removeEventListener("mousedown", updateMenu);
    };
  }, [openEmoji]);

  //Every 60 seconds, checks status of current receiver
  useEffect(() => {
    const checkStatus = async () => {
      const res = await getOnlineStatus(receiver?._id);
      res && setOnlineStatus(res.data.isOnline);
    };
    checkStatus();
    const interval = setInterval(() => {
      checkStatus();
    }, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [receiver]);

  //checks for data from socket
  useEffect(() => {
    socket?.on("welcome", () => {
      console.log("Welcome this is the server");
    });
    //getUsers to get online users
    socket?.on("getMessage", (data) => {
      data.media = URL.createObjectURL(new Blob([data.media]));
      const arrvMessage = {
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        receiver: user._id,
        text: data.text,
        isAudio: data.isAudio,
        media: data.media,
        createdAt: data.createdAt,
      };
      setArrivingMessage(arrvMessage);
    });
    socket?.on("removeConversation", (removedConvId) => {
      if (removedConvId === conversationId) {
        setRemoved(true);
        setReceiver(null);
      }
    });
  }, [user]);

  //loads messages from the database
  useEffect(() => {
    //checks if there is conversationId in the link
    (async () => {
      if (conversationId) {
        setLoading(true);
        const messages = await getMessages(conversationId);
        console.log("mesmse", messages);
        const conversation = await getConversation(conversationId);
        if (messages?.data?.error || conversation?.data?.error) {
          setLoading(false);
          return;
        }
        const receiverData = await getUserDataById(
          conversation.data?.members.find((m) => m !== user._id)
        );
        //get image metadata
        receiverData.data.prof_pic = await getPicture(
          receiverData.data.prof_pic
        );
        let newMessages;
        if (messages) {
          newMessages = await Promise.all(
            messages.data.map(async (message) => {
              if (message.media)
                message.media = URL.createObjectURL(message.media);
              return message;
            })
          );
        }

        setLoading(false);
        setMessages(messages ? newMessages : []);
        setConversation(conversation?.data);
        setReceiver(receiverData?.data);
        scrollToBottomAuto();
      }
    })();
  }, [conversationId]);

  useEffect(() => {
    if (arrivingMessage) {
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
  }, [arrivingMessage]);

  //scrolls to bottom after new message (sent or received)
  useEffect(() => {
    scrollToBottomSmooth();
  }, [messages]);

  useEffect(() => {
    sendAudio && sendAudioMessage();
  }, [audioMessage]);

  useEffect(() => {
    console.log("chattt");
  }, [sendAudio]);

  const sendAudioMessage = () => {
    setSendAudio(false);
    onAudioOptionClick();
    const receiverId = conversation?.members.find((m) => m !== user._id);

    let outgoingMessage = {
      conversationId: conversationId,
      senderId: user._id,
      senderName: user.first_name,
      receiver: receiverId,
      text: "Audio Message",
      isAudio: sendAudio,
      media: audioMessage.blob,
      createdAt: Date.now(),
    };
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
    setMessages((prev) => [
      ...prev,
      { ...outgoingMessage, media: audioMessage.blobURL },
    ]);
    setOpenMic(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();

    //checks if this is an audio message
    if (openMic) {
      setSendAudio(true);
      setDisableAudio(true);
      return;
    }

    const receiverId = conversation?.members.find((m) => m !== user._id);
    let outgoingMessage = {
      conversationId: conversationId,
      senderId: user._id,
      senderName: user.first_name,
      receiver: receiverId,
      text: input,
      isAudio: sendAudio,
      media: null,
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
            <h6 style={{ color: onlineStatus ? "green" : "red" }}>
              {onlineStatus ? "Online" : "Offline"}
            </h6>
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
                    message.senderId === user._id && "chat__reciever"
                  } ${
                    !(
                      new Date(
                        new Date(messages[i - 1]?.createdAt).getTime() +
                          10 * 60000
                      ) < new Date(new Date(messages[i].createdAt).getTime())
                    ) &&
                    messages[i - 1]?.senderId === messages[i].senderId &&
                    "same__sender"
                  }`}
                >
                  {/*<h6 className="chat__name">
                {message.senderId !== user._id ? message.senderName : ""}
            </h6>*/}
                  {/*console.log("onRender", message.isAudio, message.media)*/}
                  {message.isAudio ? (
                    <audio src={message.media} controls />
                  ) : (
                    message.text
                  )}
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

      <div ref={emojiPickerRef} className="emoji__container">
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

      <div className="chat__footer">
        <div className="icon__container">
          <IconButton id="delete__icon" onClick={() => setDisableAudio(true)}>
            <Delete />
          </IconButton>
          <IconButton
            id="mic__icon"
            disabled={loading || removed}
            onClick={() => setOpenMic(true)}
          >
            <Mic />
          </IconButton>
        </div>

        <form className="form">
          <div id="type_message" className="input__container">
            <div className="input__overlay">
              {openMic && (
                <Microphone
                  openMic={openMic}
                  setOpenMic={setOpenMic}
                  disableAudio={disableAudio}
                  setDisableAudio={setDisableAudio}
                  onAudioOptionClick={onAudioOptionClick}
                  onStop={onStop}
                  {...visualizerOptions}
                />
              )}
            </div>
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
              <InsertEmoticon />
            </IconButton>
          </div>
          <button
            disabled={openMic ? false : !input.trim() || loading || removed}
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
