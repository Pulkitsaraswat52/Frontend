import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./auth/useAuth";
import ProtectedRoute from "./auth/Protectedroute";

import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";

import "./App.css";

// Create WebSocket Context
export const WebSocketContext = createContext(null);

function App() {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect WebSocket to FastAPI
    const socket = new WebSocket("ws://localhost:8000/ws");

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      socket.send("Hello from React Client 👋");
    };

    socket.onmessage = (event) => {
      console.log("📩 WebSocket message:", event.data);
      toast.info(event.data); // show notification
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      toast.warn("WebSocket disconnected");
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
    };

    setWs(socket);

    // Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  return (
    <AuthProvider>
      <WebSocketContext.Provider value={ws}>
        <Router>
          <div className="app-container">
            <Routes>
              {/* Public Route */}
              <Route path="/" element={<HomePage />} />

              {/* Protected Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Notifications */}
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        </Router>
      </WebSocketContext.Provider>
    </AuthProvider>
  );
}

export default App;
