import React, { useEffect, useRef } from 'react';
import Webcam from "react-webcam";
import { Camera } from "@mediapipe/camera_utils";
import { FACEMESH_TESSELATION, HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const containerStyle = {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    left: 0,
    right: 0,
    textAlign: "center",
    zIndex: 9,
    width: '100%',
    maxWidth:'540px',
    height:'auto',
    transform: 'scaleX(-1)'
  };

  const onResults = (results) => {
    if (!webcamRef.current?.video || !canvasRef.current) return;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    if (canvasCtx == null) throw new Error('Could not get context');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

   
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
      {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, results.poseLandmarks,
      {color: '#FF0000', lineWidth: 2});
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
      { color: '#C0C0C070', lineWidth: 1 });
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
      { color: '#CC0000', lineWidth: 5 });
    drawLandmarks(canvasCtx, results.leftHandLandmarks,
      { color: '#00FF00', lineWidth: 2 });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
      { color: '#00CC00', lineWidth: 5 });
    drawLandmarks(canvasCtx, results.rightHandLandmarks,
      { color: '#FF0000', lineWidth: 2 });
    canvasCtx.restore();

    
  }
let start;
  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
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

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      if (!webcamRef.current?.video) return;
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (!webcamRef.current?.video) return;
          await holistic.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  start=()=>{
    setInterval(()=>{
      detector()
    },100)
  }
  }, [])

 
  


  const detector = async (h)=>{
    if (
      typeof webcamRef.current!=='undefined'&& webcamRef.current !== null && webcamRef.current.video.readyState===4){
        const video=webcamRef.current.video;
        const videoWidth=webcamRef.current.video.videoWidth;
        const videoHeight=webcamRef.current.video.videoHeight;

        webcamRef.current.video.width=videoWidth;
        webcamRef.current.video.height=videoHeight;

        canvasRef.current.width=videoWidth;
        canvasRef.current.height=videoHeight;

        const model = await tf.loadLayersModel('model.json');
        const img = tf.browser.fromPixels(video);
        const normalizedImg = img.toFloat().div(255);
        const extract=extract_landmarks(normalizedImg)
        console.log(extract)
        
        // const resized = tf.image.resizeBilinear(img, [30, 1662]); 
        // const grayscale = resized.mean(2); 
        // const reshaped = grayscale.reshape([1, 30, 1662]); 
        // const obj = await model.predict(landmarks);
        // console.log(obj)
        

        tf.dispose(img)
        tf.dispose(normalizedImg)
        tf.dispose(extract)
        tf.dispose(model)
        // tf.dispose(resized)
        // tf.dispose(grayscale)
        // tf.dispose(reshaped)
        // tf.dispose(obj)
      } 
    };

    const extract_landmarks=(results) =>{
      const face = results.faceLandmarks ? results.faceLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() : Array(1404).fill(0);
      const pose = results.poseLandmarks ? results.poseLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z, landmark.visibility]).flat() : Array(132).fill(0);
      const rh = results.rightHandLandmarks ? results.rightHandLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() : Array(63).fill(0);
      const lh = results.leftHandLandmarks ? results.leftHandLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() : Array(63).fill(0);
  
      return pose.concat(face, lh, rh);
  }
  return (
    <div className="App">
      <Webcam
        ref={webcamRef}
        style={containerStyle}
      />
      <canvas
        ref={canvasRef}
        style={containerStyle}
      />
      <button style={{cursor:'pointer'}} onClick={()=>start()}>Start</button>
    </div>
  );
}

export default App;
