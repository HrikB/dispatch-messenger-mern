import React, { useState, useEffect, useRef } from "react";
import AudioAnalyzer from "./AudioAnalyzer";
import "./Microphone.css";

function Microphone(props) {
  const {
    openMic,
    setOpenMic,
    deleteAudio,
    setDeleteAudio,
    ...visualizerOptions
  } = props;

  const inputContainer = document.getElementsByClassName("input__container")[0];
  const inputOverlay = document.getElementsByClassName("input__overlay")[0];
  const inputField = document.getElementsByClassName("input__field")[0];
  const emojiButton = document.getElementsByClassName("emoji__button")[0];
  const micIcon = document.getElementById("mic__icon");
  const deleteIcon = document.getElementById("delete__icon");
  const [micAudio, setMicAudio] = useState(null);
  const micAudRef = useRef(micAudio);
  micAudRef.current = micAudio;

  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    onMicClick();
    setMicAudio(audio);
  };

  const stopMic = () => {
    console.log("micAudRef.current.getTracks()[0]");
    micAudRef.current.getTracks().forEach((track) => track.stop());
    setOpenMic(false);
    onDeleteClick();
    setDeleteAudio(false);
  };

  const onMicClick = async () => {
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

  useEffect(() => {
    (async () => {
      if (openMic) await getMicrophone();
      if (deleteAudio) stopMic();

      /*let chunks = [];

      getMicrophone();
      if (!micAudio) return;

      const player = document.getElementById("player");

      const mediaRecorder = new MediaRecorder(micAudio);
      mediaRecorder.start();
      
      console.log("started");
      setTimeout(() => {
        console.log("stopped");
        mediaRecorder.stop();
      }, 5000);

      mediaRecorder.onstop = () => {
        onDeleteClick();
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        player.src = audioURL;
        console.log("finished");
      };
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };*/
    })();
  }, [openMic, deleteAudio]);

  return (
    <div className="mic__container">
      {micAudio && <AudioAnalyzer micAudio={micAudio} {...visualizerOptions} />}
    </div>
  );
}

export default Microphone;
