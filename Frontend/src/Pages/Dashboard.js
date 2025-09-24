// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { toast } from "react-toastify";
import axios from "axios";
import Camera from "../components/Camera";
import { faceLogin } from "../api";

function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [faceEntries, setFaceEntries] = useState([]);
  const [newEntry, setNewEntry] = useState("");
  const [loadingEntries, setLoadingEntries] = useState(true);

  // -------------------- FETCH ENTRIES --------------------
  useEffect(() => {
    if (!user) return;
    const fetchEntries = async () => {
      try {
        const res = await axios.get("http://localhost:8000/entries/", {
          withCredentials: true,
        });
        setTableData(res.data || []);
      } catch (err) {
        console.error("Error fetching entries:", err);
      } finally {
        setLoadingEntries(false);
      }
    };
    fetchEntries();
  }, [user]);

  // -------------------- FETCH FACES --------------------
  useEffect(() => {
    const fetchFaces = async () => {
      try {
        const res = await axios.get("http://localhost:8000/faces/", {
          withCredentials: true,
        });
        setFaceEntries(res.data || []);
      } catch (err) {
        console.error("Error fetching face entries:", err);
      }
    };
    fetchFaces();
  }, []);

  // -------------------- FACE LOGIN --------------------
  const handleFaceLogin = async (imageBlob) => {
    if (user?.email) {
      toast.info("⚠️ Google users cannot login via face.");
      return;
    }
    try {
      const res = await faceLogin(imageBlob);
      if (res?.success) {
        setUser({ username: res.username, role: res.role });
        toast.success(`✅ Welcome, ${res.username}!`);
        navigate("/dashboard");
      } else {
        toast.error("❌ Face not recognized!");
      }
    } catch (err) {
      console.error("Face login error:", err);
      toast.error("❌ Face login failed!");
    }
  };

  // -------------------- ADD ENTRY --------------------
  const handleAdd = async () => {
    if (!newEntry.trim()) return toast.warning("⚠️ Entry can't be empty.");
    try {
      const res = await axios.post(
        "http://localhost:8000/entries",
        { data: newEntry },
        { withCredentials: true }
      );
      setTableData((prev) => [...prev, res.data]);
      setNewEntry("");
      toast.success("✅ Entry added.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add entry.");
    }
  };

  // -------------------- DELETE ENTRY --------------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/entries/${id}`, {
        withCredentials: true,
      });
      setTableData((prev) => prev.filter((entry) => entry.id !== id));
      toast.success("🗑️ Entry deleted.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete entry.");
    }
  };

  // -------------------- UPDATE ENTRY --------------------
  const handleUpdate = async (id, updatedData) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/entries/${id}`,
        { data: updatedData },
        { withCredentials: true }
      );
      setTableData((prev) =>
        prev.map((entry) => (entry.id === id ? res.data : entry))
      );
      toast.success("✅ Entry updated.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update entry.");
    }
  };

  // -------------------- LOGOUT --------------------
  const handleLogout = async () => {
    await logout();
    toast.info("🚪 Logged out.");
    navigate("/");
  };

  const roleKey = typeof user?.role === "string" ? user.role.toLowerCase() : "";
  const visibleEntries =
    roleKey === "admin"
      ? tableData
      : tableData.filter((entry) => entry.username === user?.username);

  return (
    <div className="container">
      <h2 className="heading">👤 Dashboard</h2>

      {!user ? (
        <div>
          <h3>Login with Face</h3>
          <Camera onCapture={handleFaceLogin} />
        </div>
      ) : (
        <>
          {/* USER INFO */}
          <div className="loggedInBox">
            <p>
              Username: <strong>{user.username}</strong>
            </p>
            {user.email && (
              <p>
                Email: <strong>{user.email}</strong>
              </p>
            )}
            {user.picture && (
              <img
                src={user.picture}
                alt="profile"
                width="50"
                style={{ borderRadius: "50%" }}
              />
            )}
            <p>
              Role:{" "}
              {user.role ? (
                <strong>{user.role}</strong>
              ) : (
                <span style={{ color: "red" }}>Missing</span>
              )}
            </p>
            <button className="button" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          {/* ENTRIES TABLE */}
          <h3>📋 Data Table</h3>
          {roleKey === "admin" && (
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="New entry data"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
              />
              <button onClick={handleAdd} className="button" style={{ marginLeft: 8 }}>
                ➕ Add Entry
              </button>
            </div>
          )}

          {loadingEntries ? (
            <p>Loading entries...</p>
          ) : (
            <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Data</th>
                  {roleKey === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visibleEntries.length > 0 ? (
                  visibleEntries.map(({ id, username, data }) => (
                    <TableRow
                      key={id}
                      id={id}
                      username={username}
                      data={data}
                      isAdmin={roleKey === "admin"}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={roleKey === "admin" ? 4 : 3} style={{ textAlign: "center" }}>
                      No entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* FACES TABLE */}
          <h3 style={{ marginTop: "2rem" }}>🧑‍🦱 Registered Faces</h3>
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {faceEntries.length > 0 ? (
                faceEntries.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.username}</td>
                    <td>
                      {f.image_link ? (
                        <img
                          src={`http://localhost:8000/${f.image_link}`}
                          alt={f.username}
                          width="50"
                          style={{ borderRadius: "4px" }}
                        />
                      ) : (
                        "No image"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No face entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

const TableRow = ({ id, username, data, isAdmin, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data);

  const saveUpdate = () => {
    if (!editValue.trim()) return toast.warning("⚠️ Data cannot be empty.");
    onUpdate(id, editValue);
    setIsEditing(false);
  };

  return (
    <tr>
      <td>{id}</td>
      <td>{username}</td>
      <td>
        {isEditing ? (
          <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
        ) : (
          data
        )}
      </td>
      {isAdmin && (
        <td>
          {isEditing ? (
            <>
              <button onClick={saveUpdate}>💾 Save</button>
              <button onClick={() => setIsEditing(false)}>❌ Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}>✏️ Edit</button>
              <button onClick={() => onDelete(id)}>🗑️ Delete</button>
            </>
          )}
        </td>
      )}
    </tr>
  );
};

export default Dashboard;
