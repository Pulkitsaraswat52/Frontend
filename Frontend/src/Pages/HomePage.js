import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/useAuth";
import Webcam from "react-webcam";
import { faceLogin, registerUser } from "../api";

function HomePage() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    role: "", // default
  });

  // ----------------------------
  // Capture Image Helper
  // ----------------------------
  const captureImage = async () => {
    if (!webcamRef.current) return null;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return null;
    const blob = await (await fetch(imageSrc)).blob();
    return blob;
  };

  // ----------------------------
  // Face Verification (Periodic)
  // ----------------------------
  const captureAndVerify = useCallback(async () => {
    if (!webcamRef.current || isVerifying || isLoggedIn || showRegisterForm) return;

    const blob = await captureImage();
    if (!blob) return;

    setIsVerifying(true);
    try {
      const res = await faceLogin(blob);

      if (res?.success) {
        toast.success(`✅ Welcome, ${res.username}!`);
        setUser(res);
        setIsLoggedIn(true);
        setIsCameraOn(false);
        navigate("/dashboard");
      } else {
        console.log("❌ Face not recognized yet...");
      }
    } catch (err) {
      console.error("Face verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  }, [navigate, setUser, isVerifying, isLoggedIn, showRegisterForm]);

  // ----------------------------
  // Handle Registration
  // ----------------------------
  const handleRegister = async () => {
    if (!registerData.username || !registerData.password) {
      toast.error("⚠️ Enter username and password!");
      return;
    }

    const blob = await captureImage();
    if (!blob) {
      toast.error("⚠️ Could not capture image!");
      return;
    }

    try {
      const res = await registerUser(
        registerData.username,
        registerData.password,
        blob,
        registerData.role.toLowerCase() // ✅ Normalize role here
      );

      if (res?.success) {
        toast.success(`🎉 Registered ${registerData.username} successfully!`);

        // Auto login after register
        setUser({
          username: res.username,
          role: res.role, // backend sends "admin" or "employee"
        });
        setIsLoggedIn(true);
        setIsCameraOn(false);
        navigate("/dashboard");

        // Reset form
        setShowRegisterForm(false);
        setRegisterData({ username: "", password: "", role: "" });
      } else {
        toast.error(`❌ ${res.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("❌ Registration failed");
    }
  };

  // ----------------------------
  // Start camera automatically
  // ----------------------------
  useEffect(() => {
    setIsCameraOn(true);
  }, []);

  // ----------------------------
  // Periodic scanning
  // ----------------------------
  useEffect(() => {
    if (!isCameraOn || isVerifying || isLoggedIn || showRegisterForm) return;

    const interval = setInterval(() => captureAndVerify(), 3000);
    return () => clearInterval(interval);
  }, [isCameraOn, isVerifying, isLoggedIn, showRegisterForm, captureAndVerify]);

  return (
    <div className="container">
      <h2 className="heading">📸 Face Login / Registration</h2>
      <div className="frameCard">
        {isCameraOn && !isLoggedIn ? (
          <>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              style={{
                width: "100%",
                borderRadius: "10px",
                border: "2px solid #333",
              }}
            />
            <p style={{ marginTop: "10px" }}>
              {isVerifying
                ? "🔍 Scanning for your face..."
                : showRegisterForm
                ? "📸 Ready to capture your registration photo"
                : "Align your face with the camera"}
            </p>

            {/* Registration Form */}
            {showRegisterForm && (
              <div style={{ marginTop: "15px" }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={registerData.username}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, username: e.target.value })
                  }
                  style={{ margin: "5px", padding: "5px" }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, password: e.target.value })
                  }
                  style={{ margin: "5px", padding: "5px" }}
                />
                <select
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({ ...registerData, role: e.target.value })
                  }
                  style={{ margin: "5px", padding: "5px" }}
                >
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  onClick={handleRegister}
                  className="button"
                  style={{ margin: "5px" }}
                >
                  ✅ Confirm Register
                </button>
              </div>
            )}

            <div style={{ marginTop: "10px" }}>
              <button
                className="button"
                onClick={() => setShowRegisterForm(!showRegisterForm)}
              >
                {showRegisterForm ? "❌ Cancel" : "📝 Register New User"}
              </button>
            </div>
          </>
        ) : !isLoggedIn ? (
          <button className="button" onClick={() => setIsCameraOn(true)}>
            🚀 Start Camera
          </button>
        ) : (
          <p>✅ Logged in successfully! Redirecting...</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
