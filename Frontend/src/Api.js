// src/api.js
import axios from "axios";

const API_BASE = "http://localhost:8000";

// -------------------- REGISTER --------------------
export async function registerUser(username, password, imageBlob, role = "employee") {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);
  if (imageBlob) {
    formData.append("file", imageBlob, "face.jpg");
  }
  formData.append("role_name", role.toLowerCase());

  try {
    const res = await axios.post(`${API_BASE}/register/`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, ...res.data };
  } catch (err) {
    console.error("Register error:", err);
    return {
      success: false,
      error: err.response?.data?.detail || err.message || "Registration failed",
    };
  }
}

// -------------------- FACE LOGIN --------------------
export async function faceLogin(imageBlob) {
  const formData = new FormData();
  formData.append("file", imageBlob, "face.jpg");

  try {
    const res = await axios.post(`${API_BASE}/face-login/`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, ...res.data };
  } catch (err) {
    console.error("Face login error:", err);
    return {
      success: false,
      error: err.response?.data?.detail || "Face login failed",
    };
  }
}

// -------------------- LOGIN --------------------
export async function loginUser(username, password) {
  try {
    const res = await axios.post(
      `${API_BASE}/login/`,
      { username, password },
      { withCredentials: true }
    );
    return { success: true, ...res.data };
  } catch (err) {
    console.error("Login error:", err);
    return {
      success: false,
      error: err.response?.data?.detail || "Login failed",
    };
  }
}

// -------------------- PROFILE --------------------
export async function getProfile() {
  try {
    const res = await axios.get(`${API_BASE}/me/`, { withCredentials: true });
    return { success: true, ...res.data };
  } catch (err) {
    console.error("Get profile error:", err);
    return { success: false, error: "Not authenticated" };
  }
}

// -------------------- LOGOUT --------------------
export async function logoutUser() {
  try {
    await axios.post(`${API_BASE}/logout/`, {}, { withCredentials: true });
    return { success: true };
  } catch (err) {
    console.error("Logout error:", err);
    return { success: false, error: "Logout failed" };
  }
}

// -------------------- ENTRIES --------------------
export async function getEntries() {
  try {
    const res = await axios.get(`${API_BASE}/entries`, { withCredentials: true });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Get entries error:", err);
    return { success: false, error: "Unauthorized" };
  }
}

export async function addEntry(data) {
  try {
    const res = await axios.post(
      `${API_BASE}/entries`,
      { data },
      { withCredentials: true }
    );
    return { success: true, ...res.data };
  } catch (err) {
    console.error("Add entry error:", err);
    return { success: false, error: "Failed to add entry" };
  }
}

export async function updateEntry(id, data) {
  try {
    const res = await axios.put(
      `${API_BASE}/entries/${id}`,
      { data },
      { withCredentials: true }
    );
    return { success: true, ...res.data };
  } catch (err) {
    console.error("Update entry error:", err);
    return { success: false, error: "Failed to update entry" };
  }
}

export async function deleteEntry(id) {
  try {
    await axios.delete(`${API_BASE}/entries/${id}`, { withCredentials: true });
    return { success: true };
  } catch (err) {
    console.error("Delete entry error:", err);
    return { success: false, error: "Failed to delete entry" };
  }
}

// -------------------- FACES --------------------
export async function getFaces() {
  try {
    const res = await axios.get(`${API_BASE}/faces/`, { withCredentials: true });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("Get faces error:", err);
    return { success: false, error: "Failed to fetch faces" };
  }
}

const api = {
  registerUser,
  faceLogin,
  loginUser,
  getProfile,
  logoutUser,
  getEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  getFaces,
};

export default api;
