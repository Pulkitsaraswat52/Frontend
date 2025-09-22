import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, faceLogin, logoutUser, getProfile } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const profile = await getProfile();
        if (profile?.username && profile?.role) {
          setUser({ username: profile.username, role: profile.role.name });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (username, password, faceBlob) => {
    setLoading(true);
    try {
      const res = faceBlob
        ? await faceLogin(faceBlob)
        : await loginUser(username, password);

      if (res?.username && res?.role) {
        setUser({ username: res.username, role: res.role.name });
        return { success: true };
      }
      return { success: false, error: "Invalid credentials" };
    } catch {
      return { success: false, error: "Login error" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
