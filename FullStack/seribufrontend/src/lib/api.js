export const API_BASE = import.meta.env.VITE_API_URL || "https://seribu-backend-production.up.railway.app";
export const HF_API   = import.meta.env.VITE_HF_URL  || "https://syahrulw-seribucerita-emotion.hf.space";

async function handleRes(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

function getToken() {
  return localStorage.getItem("sc_token") || null;
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchArticles({ category, search, page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category && category !== "semua") params.set("category", category);
  if (search) params.set("search", search);
  return handleRes(await fetch(`${API_BASE}/api/articles?${params}`, {
    headers: authHeaders(),
  }));
}

export async function fetchArticleById(id) {
  return handleRes(await fetch(`${API_BASE}/api/articles/${id}`));
}

export async function fetchCategories() {
  return handleRes(await fetch(`${API_BASE}/api/articles/categories`));
}

export async function userLogin(email, password) {
  return handleRes(await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }));
}

export async function userRegister(name, email, password) {
  return handleRes(await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }));
}

export async function getMe() {
  return handleRes(await fetch(`${API_BASE}/api/auth/me`, {
    headers: authHeaders(),
  }));
}

export async function fetchProfile() {
  return handleRes(await fetch(`${API_BASE}/api/profile`, {
    headers: authHeaders(),
  }));
}

export async function updateProfile(payload) {
  return handleRes(await fetch(`${API_BASE}/api/profile`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }));
}

export async function fetchJournals() {
  return handleRes(await fetch(`${API_BASE}/api/journals`, {
    headers: authHeaders(),
  }));
}

export async function createJournal(payload) {
  return handleRes(await fetch(`${API_BASE}/api/journals`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }));
}

export async function updateJournal(id, payload) {
  return handleRes(await fetch(`${API_BASE}/api/journals/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }));
}

export async function deleteJournal(id) {
  return handleRes(await fetch(`${API_BASE}/api/journals/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }));
}

export async function fetchHighlights() {
  return handleRes(await fetch(`${API_BASE}/api/highlights`, {
    headers: authHeaders(),
  }));
}

export async function createHighlight(payload) {
  return handleRes(await fetch(`${API_BASE}/api/highlights`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }));
}

export async function deleteHighlight(id) {
  return handleRes(await fetch(`${API_BASE}/api/highlights/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  }));
}

export async function searchFaskes(lat, lon, radius) {
  const params = new URLSearchParams({ lat, lon, radius });
  return handleRes(await fetch(`${API_BASE}/api/faskes/search?${params}`));
}

export async function superadminLogin(username, password) {
  return handleRes(await fetch(`${API_BASE}/api/superadmin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }));
}

export async function superadminVerify(token) {
  const res = await fetch(`${API_BASE}/api/superadmin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function createArticle(token, payload) {
  return handleRes(await fetch(`${API_BASE}/api/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }));
}

export async function updateArticle(token, id, payload) {
  return handleRes(await fetch(`${API_BASE}/api/articles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  }));
}

export async function deleteArticle(token, id) {
  return handleRes(await fetch(`${API_BASE}/api/articles/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  }));
}

export async function fetchChatHistory(userId) {
  return handleRes(await fetch(`${API_BASE}/api/chat/history?user_id=${encodeURIComponent(userId)}`));
}

export async function fetchChatConversation(userId, convoId) {
  return handleRes(await fetch(
    `${API_BASE}/api/chat/history/${convoId}?user_id=${encodeURIComponent(userId)}`
  ));
}

export async function createChatConversation(userId, title) {
  return handleRes(await fetch(`${API_BASE}/api/chat/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, title }),
  }));
}

export async function saveChatMessage(userId, convoId, { role, text, emotion }) {
  return handleRes(await fetch(`${API_BASE}/api/chat/history/${convoId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, role, text, emotion }),
  }));
}

export async function updateChatConversation(userId, convoId, { title, emotion }) {
  return handleRes(await fetch(`${API_BASE}/api/chat/history/${convoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, title, emotion }),
  }));
}

export async function deleteChatConversation(userId, convoId) {
  return handleRes(await fetch(
    `${API_BASE}/api/chat/history/${convoId}?user_id=${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  ));
}

export async function hfPredictEmotion(text, calibrate = true) {
  return handleRes(await fetch(`${HF_API}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, calibrate }),
  }));
}

export async function hfChat(text, history = [], calibrate = true) {
  return handleRes(await fetch(`${HF_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, history, calibrate }),
  }));
}
