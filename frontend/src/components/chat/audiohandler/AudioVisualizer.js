import React, { useEffect, useRef } from "react";

function AudioVisualizer({
  audioData,
  strokeWidth,
  strokeColor,
  canvasColor,
  cssWidth,
  cssHeight,
}) {
  const canvasRef = useRef();

  useEffect(() => {
    draw();
  });

  const draw = () => {
    const canvas = canvasRef.current;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext("2d");

    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    context.lineWidth = strokeWidth;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = strokeColor;

    context.beginPath();
    context.moveTo(0, height / 2);
    for (let item of audioData) {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }

    context.lineTo(x, height / 2);
    context.stroke();
  };

  return (
    <canvas
      style={{
        width: cssWidth,
        height: cssHeight,
        backgroundColor: canvasColor,
      }}
      ref={canvasRef}
    />
  );
}

export default AudioVisualizer;
