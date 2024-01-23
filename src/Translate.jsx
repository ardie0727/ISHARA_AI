import {HandLandmarker,FilesetResolvers}from '@mediapipe/tasks-vision'
import React, { useRef} from 'react';
import Webcam from 'react-webcam';


const Translate = () => {
    const camStyle={
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left:0,
        right: 0,
        textAlign: "center",
        zIndex: 9,
        width: 640,
        height: 500,
    }
    const webcamRef=useRef(null);
    const canvasRef=useRef(null);
    
    
  

    let handLandmarker='undefined';
    const createHandLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: 'VIDEO',
        numHands: 2
      });
      
      var intervalid=setInterval(()=>{
        handDetector(handLandmarker)
      },100)
      if (wbcam==='true'){
        clearInterval(intervalid)
      }
    };
    

  const drawLandmarks = (landmarksArray) => {
      const canvas = canvasRef.current;
      const ctx=canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';  
      landmarksArray.forEach(landmarks => {

        drawConnectors(ctx, landmarks,HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5
        }); 
            
          landmarks.forEach(landmark => {
              const x = landmark.x * canvas.width;
              const y = landmark.y * canvas.height;
              

              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI); 
              ctx.fill();
          });
      });
  };
  

    const handDetector = async (handLandmarker)=>{
      if (
        typeof webcamRef.current!=='undefined'&& webcamRef.current !== null && webcamRef.current.video.readyState===4){
          const video=webcamRef.current.video;
          const videoWidth=webcamRef.current.video.videoWidth;
          const videoHeight=webcamRef.current.video.videoHeight;

          webcamRef.current.video.width=videoWidth;
          webcamRef.current.video.height=videoHeight;

          canvasRef.current.width=videoWidth;
          canvasRef.current.height=videoHeight;
          const hand= await handLandmarker.detectForVideo(video, performance.now());
          drawLandmarks(hand.landmarks)

        } 
    }

    



    return( 
    <>
    <div className="camera">
    <Webcam ref={webcamRef} style={camStyle}/>
    <canvas ref={canvasRef} style={camStyle}/>
    <button onClick={()=>{
      createHandLandmarker();
    }}>Start Detection</button>

    </div>
    </>
    );
}

export default Translate;

