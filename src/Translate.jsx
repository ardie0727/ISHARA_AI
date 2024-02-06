import {HandLandmarker,FilesetResolver, FaceLandmarker, DrawingUtils, /*PoseLandmarker*/}from '@mediapipe/tasks-vision'
import React, {useRef} from 'react';
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
        // width: 640,
        // height: 500,
        //hua isse
        width: '100%',
        maxWidth: '640px', 
        height: 'auto', 
    }
    const webcamRef=useRef(null);
    const canvasRef=useRef(null);
    
    
  

    let handLandmarker='undefined';
    let faceLandmarker='undefined';
    // let poseLandmarker='undefined';
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

      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode:'VIDEO',
        numFaces: 1
      });
      // poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      //   baseOptions: {
      //     modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      //     delegate: "GPU"
      //   },
      //   runningMode: 'VIDEO',
      //   numPoses: 2
      // });

      setInterval(()=>{
        handDetector(handLandmarker)
        faceDetector(faceLandmarker)
        // poseDetector(poseLandmarker)
      },100)
    }
      
      
    

  const drawLandmarks = (landmarksArray) => {
      canvasRef.current.width=webcamRef.current.video.videoWidth
      canvasRef.current.height=webcamRef.current.video.videoHeight
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
  
  const drawfaceLandmarks=(landmarksArray)=>{
  const ctx = canvasRef.current.getContext("2d");
  const drawingUtils = new DrawingUtils(ctx);
  for (const landmarks of landmarksArray) {
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0"
    });
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: "#30FF30" }
    );
  }}
    



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
    };
    const faceDetector = async (faceLandmarker)=>{
      if (
        typeof webcamRef.current!=='undefined'&& webcamRef.current !== null && webcamRef.current.video.readyState===4){
          const video=webcamRef.current.video;
          const videoWidth=webcamRef.current.video.videoWidth;
          const videoHeight=webcamRef.current.video.videoHeight;

          webcamRef.current.video.width=videoWidth;
          webcamRef.current.video.height=videoHeight;

          canvasRef.current.width=videoWidth;
          canvasRef.current.height=videoHeight;

          const face= await faceLandmarker.detectForVideo(video, performance.now());

          drawfaceLandmarks(face.faceLandmarks)
        } 
    };
    // const poseDetector = async (poseLandmarker)=>{
    //   if (
    //     typeof webcamRef.current!=='undefined'&& webcamRef.current !== null && webcamRef.current.video.readyState===4){
    //       const video=webcamRef.current.video;
    //       const videoWidth=webcamRef.current.video.videoWidth;
    //       const videoHeight=webcamRef.current.video.videoHeight;

    //       webcamRef.current.video.width=videoWidth;
    //       webcamRef.current.video.height=videoHeight;

    //       canvasRef.current.width=videoWidth;
    //       canvasRef.current.height=videoHeight;
    //       const ctx = canvasRef.current.getContext("2d");
    //       const drawingUtils = new DrawingUtils(ctx);
    //       await poseLandmarker.detectForVideo(video, performance.now(), (result) => {
    //         ctx.save();
    //         ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    //         for (const landmark of result.landmarks) {
    //           drawingUtils.drawLandmarks(landmark, {
    //             radius: (data) => DrawingUtils.lerp(data.from|data.z, -0.15, 0.1, 5, 1)
    //           });
    //           drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    //         }
    //         ctx.restore();
    //       });

    //     } 
    // };
    return( 
    <>
    <div className="camera">
    <Webcam ref={webcamRef} style={camStyle}/>
    <canvas ref={canvasRef} style={camStyle}/>
    <button onClick={()=>{createHandLandmarker();}}>Start Detection</button>
    </div>
    </>
    );
};

export default Translate;

