import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem("sc_user"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("sc_token") || null);

  useEffect(() => {
    if (user) localStorage.setItem("sc_user", JSON.stringify(user));
    else localStorage.removeItem("sc_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("sc_token", token);
    else localStorage.removeItem("sc_token");
  }, [token]);

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Login gagal");
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, avatarConfig = null) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, avatar_config: avatarConfig ? JSON.stringify(avatarConfig) : null }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Registrasi gagal");
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() { setUser(null); setToken(null); }

  const updateUser = useCallback((newUser) => setUser(newUser), []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
