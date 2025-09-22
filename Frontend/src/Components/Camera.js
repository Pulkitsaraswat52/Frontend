import React from "react";
import Webcam from "react-webcam";

function Camera({ webcamRef, handleCapture, isLoginMode }) {
  const videoConstraints = { width: 450, height: 340, facingMode: "user" };

  return (
    <div className="cameraBox">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="webcam"
      />
      <button className="button" onClick={handleCapture}>
        {isLoginMode ? "Verify Face" : "Capture"}
      </button>
    </div>
  );
}

export default Camera;
