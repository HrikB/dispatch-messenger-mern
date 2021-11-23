import React, { useState, useEffect, useRef } from "react";
import AudioAnalyzer from "./AudioAnalyzer";
import "./Microphone.css";

function Microphone(props) {
  const {
    openMic,
    setOpenMic,
    disableAudio,
    setDisableAudio,
    onAudioOptionClick,
    sendAudio,
    onStop,
    ...visualizerOptions
  } = props;

  const inputContainer = document.getElementsByClassName("input__container")[0];
  const inputOverlay = document.getElementsByClassName("input__overlay")[0];
  const inputField = document.getElementsByClassName("input__field")[0];
  const emojiButton = document.getElementsByClassName("emoji__button")[0];
  const micIcon = document.getElementById("mic__icon");
  const deleteIcon = document.getElementById("delete__icon");

  const [micAudio, setMicAudio] = useState(null);
  const [stream, setStream] = useState({
    access: false,
    recorder: null,
  });
  const [recording, setRecording] = useState({
    active: false,
    available: false,
    url: "",
  });

  const chunks = useRef([]);

  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    if (!audio) {
      setOpenMic(false);
      return;
    }

    let mediaRecorder;

    try {
      mediaRecorder = new MediaRecorder(audio);
    } catch (err) {
      console.log("medRecErr", err);
    }

    const track = mediaRecorder.stream.getTracks()[0];
    track.onended = () => console.log("ended");

    mediaRecorder.onstart = () => {
      console.log("started");
      setRecording({
        ...recording,
        active: true,
      });
    };

    mediaRecorder.ondataavailable = (e) => {
      chunks.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      console.log("stopped");

      const url = URL.createObjectURL(chunks.current[0]);
      const blob = new Blob(chunks.current, { type: "audio/ogg; codecs=opus" });
      chunks.current = [];

      const blobObj = {
        blob,
        blobURL: url,
      };

      setRecording({
        active: false,
        available: true,
        url,
      });
      onStop(blobObj);
    };

    setStream({
      ...stream,
      access: true,
      recorder: mediaRecorder,
    });

    setMicAudio(audio);
    onMicClick();
  };

  const stopMic = () => {
    stream.recorder.stop();
    setOpenMic(false);
    onAudioOptionClick();
    setDisableAudio(false);
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

  useEffect(() => {
    stream.recorder && stream.recorder.start();
  }, [stream]);

  useEffect(() => {
    (async () => {
      console.log("running");
      if (disableAudio) stopMic();
      else if (openMic) await getMicrophone();
      else if (stream.recorder) stream.recorder.start();
    })();
  }, [openMic, disableAudio, sendAudio]);

  return (
    <div className="mic__container">
      {micAudio && (
        <AudioAnalyzer
          micAudio={micAudio}
          onStop={onStop}
          sendAudio={sendAudio}
          {...visualizerOptions}
        />
      )}
    </div>
  );
}

export default Microphone;
