import React, { useEffect, useRef, useState } from 'react';
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';

function Translate() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [btn, setBtn] = useState(true);
  const id = useRef();

  const containerStyle = {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 9,
    width: '100%',
    maxWidth: '540px',
    height: 'auto'
  };

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });
    holistic.setOptions({
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    holistic.onResults(onResults);

    const camera = new Camera(webcamRef.current?.video, {
      onFrame: async () => {
        if (webcamRef.current?.video) await holistic.send({ image: webcamRef.current.video });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, []);

  let detector;
  const start = async () => {
    const model = await tf.loadLayersModel('model.json');
    setBtn(false)
    id.current = setInterval(() => detector(model), 100);
  };

  const stop = () => {
    setBtn(true)
    clearInterval(id.current)
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !webcamRef.current?.video) return;

    const { videoWidth, videoHeight } = webcamRef.current.video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
    drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
    drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
    drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
    drawLandmarks(ctx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
    drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
    drawLandmarks(ctx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
    ctx.restore();
    
    const pose = results.poseLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z, landmark.visibility]).flat() || Array(132).fill(0);
    const face = results.faceLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() || Array(1404).fill(0);
    const rh = results.rightHandLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() || Array(63).fill(0);
    const lh = results.leftHandLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() || Array(63).fill(0);      
    const cat = pose.concat(face, lh, rh);

    detector = async (model) => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        console.log(cat);
      }
    }; 
  };

  return (
    <div className="App">
      <Webcam ref={webcamRef} style={containerStyle}  />
      <canvas ref={canvasRef} style={containerStyle} />
      <button style={{ cursor: 'pointer' }} onClick={btn ? start : stop}>{btn ? "start" : 'stop'}</button>
    </div>
  );
}

export default Translate;
