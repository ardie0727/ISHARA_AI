import {HandLandmarker,FilesetResolver}from '@mediapipe/tasks-vision'
import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const Translate = () => {
    const camStyle={
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left:0,
        right: 0,
        textAlign: "center",
        zindex: 9,
        width: 640,
        height: 500,
    }
    const webcamRef=useRef(null);
    const canvasRef=useRef(null);

      createHandLandmarker();
    return( 
    <>
    <div className="camera">
    <Webcam ref={webcamRef} style={camStyle}/>
    <canvas ref={canvasRef} style={camStyle}/>
    </div>
    </>
    );
}

export default Translate;