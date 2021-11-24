import React, { useEffect, useState, useRef } from "react";
import AudioVisualizer from "./AudioVisualizer";

const context = new AudioContext();

function AudioAnalyzer(props) {
  const { micAudio, onAudioData, onStop, ...visualizerOptions } = props;

  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const [analyzer, setAnalyzer] = useState(context.createAnalyser());
  const [frames, setFrames] = useState(0); //dummy used for state-refreshing. setAudioData not refreshing
  const analyzerRef = useRef(analyzer);
  analyzerRef.current = analyzer;
  const [dataArray, setDataArray] = useState(
    new Uint8Array(analyzer.frequencyBinCount)
  );
  const rafId = useRef();

  const tick = () => {
    analyzerRef.current.getByteTimeDomainData(dataArray);
    setAudioData(dataArray);
    setFrames((prev) => prev + 1);
    rafId.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    let chunks = [];

    //for visualizer
    const source = context.createMediaStreamSource(micAudio);
    source.connect(analyzerRef.current);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      analyzerRef.current.disconnect();
      source.disconnect();
    };
  }, []);

  return <AudioVisualizer audioData={audioData} {...visualizerOptions} />;
}

export default AudioAnalyzer;
