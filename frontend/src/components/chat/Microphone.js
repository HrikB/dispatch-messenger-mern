import { ContactSupportOutlined } from "@material-ui/icons";
import React, { useEffect } from "react";

function Microphone() {
  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    console.log(audio);
    return audio;
  };

  useEffect(() => {
    (async () => {
      let chunks = [];

      const micAudio = await getMicrophone();
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
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        player.src = audioURL;
        console.log("finished");
      };
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      const context = new AudioContext();
      const source = context.createMediaStreamSource(micAudio);
    })();
  });

  return (
    <div className="mic__container">
      <audio id="player" controls></audio>
    </div>
  );
}

export default Microphone;
