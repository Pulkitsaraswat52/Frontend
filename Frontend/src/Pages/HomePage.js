// src/pages/HomePage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../auth/useAuth";
import Webcam from "react-webcam";
import { faceLogin, registerUser } from "../api";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const clientId =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  "459111757593-hpnpd591itdubpqafgibljolavq304bq.apps.googleusercontent.com";

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
    role: "employee",
  });
  const [googleLoading, setGoogleLoading] = useState(false);

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
  // Face Verification
  // ----------------------------
  const captureAndVerify = useCallback(async () => {
    if (
      !webcamRef.current ||
      isVerifying ||
      isLoggedIn ||
      showRegisterForm ||
      googleLoading
    )
      return;

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
  }, [navigate, setUser, isVerifying, isLoggedIn, showRegisterForm, googleLoading]);

  // ----------------------------
  // Registration
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
        registerData.role.toLowerCase()
      );

      if (res?.success) {
        toast.success(`🎉 Registered ${registerData.username} successfully!`);
        setUser({
          username: res.username,
          role: res.role,
        });
        setIsLoggedIn(true);
        setIsCameraOn(false);
        navigate("/dashboard");

        setShowRegisterForm(false);
        setRegisterData({ username: "", password: "", role: "employee" });
      } else {
        toast.error(`❌ ${res.error || "Registration failed"}`);
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("❌ Registration failed");
    }
  };

  // ----------------------------
  // Google Login (NO API CALL)
  // ----------------------------
  const handleGoogleSuccess = (credentialResponse) => {
    setGoogleLoading(true);
    setIsCameraOn(false); // Stop webcam immediately

    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);
      console.log("Google user:", decoded);

      // Store user locally without backend
      setUser({
        username: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      localStorage.setItem("google_user", JSON.stringify(decoded));

      toast.success("✅ Google Login Successful!");
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("❌ Google login failed!");
      setIsCameraOn(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("❌ Google Login Failed. Try again.");
    setIsCameraOn(true); // restart webcam if google login fails
  };

  // ----------------------------
  // Auto camera start
  // ----------------------------
  useEffect(() => {
    if (!isLoggedIn && !googleLoading) setIsCameraOn(true);
  }, [isLoggedIn, googleLoading]);

  // ----------------------------
  // Periodic scanning
  // ----------------------------
  useEffect(() => {
    if (!isCameraOn || isVerifying || isLoggedIn || showRegisterForm) return;
    const interval = setInterval(() => captureAndVerify(), 3000);
    return () => clearInterval(interval);
  }, [isCameraOn, isVerifying, isLoggedIn, showRegisterForm, captureAndVerify]);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="container">
        <h2 className="heading">🔐 Face & Google Login</h2>

        {!isLoggedIn ? (
          <div className="frameCard">
            {/* Face Login Section */}
            {isCameraOn && !isLoggedIn && !googleLoading ? (
              <>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="webcam"
                />
                <p>
                  {isVerifying
                    ? "🔍 Scanning for your face..."
                    : showRegisterForm
                    ? "📸 Capture your registration photo"
                    : "Align your face with the camera"}
                </p>

                {/* Registration Form */}
                {showRegisterForm && (
                  <div className="register-form">
                    <input
                      type="text"
                      placeholder="Username"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, username: e.target.value })
                      }
                      className="usernameInput"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                      className="usernameInput"
                    />
                    <select
                      value={registerData.role}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, role: e.target.value })
                      }
                      className="usernameInput"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={handleRegister} className="button">
                      ✅ Confirm Register
                    </button>
                  </div>
                )}

                <div>
                  <button
                    className="button"
                    onClick={() => setShowRegisterForm(!showRegisterForm)}
                  >
                    {showRegisterForm ? "❌ Cancel" : "📝 Register New User"}
                  </button>
                </div>
              </>
            ) : (
              !googleLoading && (
                <button className="button" onClick={() => setIsCameraOn(true)}>
                  🚀 Start Camera
                </button>
              )
            )}

            {/* Google Login Section */}
            <div className="google-login-box">
              <h3>Or Login with Google</h3>
              {googleLoading ? (
                <p>Loading...</p>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signin_with"
                />
              )}
            </div>
          </div>
        ) : (
          <p>✅ Logged in successfully! Redirecting...</p>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default HomePage;
