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
  const [str, setStr]=useState("");
  const id = useRef(null);
  const [responser, setResponse] = useState(null);

  let chatsentences=[]

  const chatgpt = async (words) => {
    const prompt = `Try to use these words and phrases to create a full sentence : ${words} exclude blanks`;
    const apiKey = import.meta.env.VITE_REACT_APP_C_KEY; 
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          "model": "gpt-3.5-turbo",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          "max_tokens": 250
        })
      });
  
      const data = await response.json();
      
      console.log(data.choices[0]?.message?.content)
      chatsentences.push(data.choices[0]?.message?.content)
      let wordss=chatsentences.toString().replace(/,/g, ' ')
      setResponse(wordss); 
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const containerStyle = {
    position: "absolute",
    marginLeft: "auto",
    marginRight: "auto",
    padding:20,
    left: 0,
    textAlign: "center",
    width: '100%',
    maxWidth: '1000px',
    height: 'auto'
  };
let holistic;
  useEffect(() => {
    holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
    });
    holistic.setOptions({
      selfieMode: false,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      refineFaceLandmarks: true,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.8
    });
    
    const camera = new Camera(webcamRef.current?.video, {
      onFrame: async () => {
        if (webcamRef.current?.video) await holistic.send({ image: webcamRef.current.video });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, []);

const start = () => {   
    setBtn(false);
    id.current = setInterval(holistic.onResults(onResults), 1);
};

const stop =  () => { 
    setBtn(true)
    clearInterval(id.current)
    
  };

let frames=[]
let sentences=[]
let count=0
  const onResults = async (results) => {
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
    // drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
    // drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
    drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
    // drawLandmarks(ctx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
    drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
    // drawLandmarks(ctx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
    ctx.restore();
    
    const pose = results.poseLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z, landmark.visibility]).flat() || Array(132).fill(0);
    const face = (results.faceLandmarks ? results.faceLandmarks.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() : []).concat(Array(1404).fill(0)).slice(0, 1404);
    const rh = results.rightHandLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() || Array(63).fill(0);
    const lh = results.leftHandLandmarks?.map(landmark => [landmark.x, landmark.y, landmark.z]).flat() || Array(63).fill(0);          
    const cat = pose.concat(face, lh, rh);
    
    frames.push(cat)      
    
    if (frames.length === 30) {
      const formdata = new FormData();
      formdata.append("vector", JSON.stringify(frames));
      fetch("http://127.0.0.1:5300/test",{
        method: "POST",
        body: formdata,
        redirect: "follow"
      }).then((response) => response.text())
        .then((result) => {
          console.log(result)
          const jsonResponse = JSON.parse(result);  
          sentences.push(jsonResponse.resp)
          let words=sentences.toString().replace(/,/g, ' ')
          setStr(words)
          count++;
          if (count===5)
          {
            count=0
            chatgpt(words)
          }
        }).catch((error) => console.error(error));
          frames.splice(0, frames.length);    
    }
  };

  return (
    <>
    <div className="App" >
      <div className='Video'>
      <Webcam ref={webcamRef} style={containerStyle} />
      <canvas ref={canvasRef} style={containerStyle} />
      <button style={{marginLeft:1000, padding:10, cursor: 'pointer', marginRight:'auto', marginBlock:20,width:'100%', maxWidth:"300px"}} onClick={btn ? start : stop}>{btn ? "start" : 'stop'}</button>
      <textarea style={{marginLeft:1000, padding:10, marginRight:'auto'}} placeholder='Translation...'>{responser}</textarea>
      </div>
    </div>
    </>
  );
}

export default Translate;
