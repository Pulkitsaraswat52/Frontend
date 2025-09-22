// src/api.js
import axios from "axios";

const API_BASE = "http://localhost:8000";

export async function registerUser(username, password, imageBlob, role = "employee") {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  formData.append("file", imageBlob, "face.jpg");
  formData.append("role_name", role.toLowerCase);

  try {
    const res = await axios.post(`${API_BASE}/register/`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err.response?.data?.detail || err.message || "Registration failed",
    };
  }
}

export async function faceLogin(imageBlob) {
  const formData = new FormData();
  formData.append("file", imageBlob, "face.jpg");

  try {
    const res = await axios.post(`${API_BASE}/face-login/`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    return { success: false, error: err.response?.data?.detail || "Face login failed" };
  }
}

export async function loginUser(username, password) {
  try {
    const res = await axios.post(`${API_BASE}/login/`, { username, password }, { withCredentials: true });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data?.detail || "Login failed" };
  }
}

export async function getProfile() {
  try {
    const res = await axios.get(`${API_BASE}/me/`, { withCredentials: true });
    return res.data;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    await axios.post(`${API_BASE}/logout/`, {}, { withCredentials: true });
    return { success: true };
  } catch {
    return { success: false, error: "Logout failed" };
  }
}

export async function getEntries() {
  try {
    const res = await axios.get(`${API_BASE}/entries`, { withCredentials: true });
    return res.data;
  } catch {
    return { success: false, error: "Unauthorized" };
  }
}

export async function getFaces() {
  try {
    const res = await axios.get(`${API_BASE}/faces/`, { withCredentials: true });
    return res.data;
  } catch {
    return [];
  }
}

const api = { registerUser, faceLogin, loginUser, getProfile, logoutUser, getEntries, getFaces };
export default api;
