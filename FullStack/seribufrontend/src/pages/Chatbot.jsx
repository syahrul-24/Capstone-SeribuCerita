import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { marked } from "marked";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { createChatConversation, saveChatMessage, updateChatConversation, deleteChatConversation } from "../lib/api";

const HF_API = "https://syahrulw-seribucerita-emotion.hf.space";
const BACKEND_API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function predictEmotion(text, calibrate = true, signal) {
  const controller = signal ? null : new AbortController();
  const sig = signal || controller.signal;

  const timeout = setTimeout(() => controller?.abort(), 8000);
  try {
    const res = await fetch(`${HF_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, calibrate }),
      signal: sig,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Predict error: ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") throw new Error("timeout");
    throw err;
  }
}

async function pingHFSpace() {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    await fetch(`${HF_API}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "halo", calibrate: false }),
      signal: controller.signal,
    });
  } catch { /* ignore — ini hanya warm-up */ }
}

async function predictBatch(texts, calibrate = true) {
  const res = await fetch(`${HF_API}/predict/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, calibrate }),
  });
  if (!res.ok) throw new Error(`Batch error: ${res.status}`);
  return await res.json();
}

async function callChatAPI(text, history = []) {
  const res = await fetch(`${HF_API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, history, calibrate: true }),
  });
  if (!res.ok) throw new Error(`Chat error: ${res.status}`);
  return await res.json();
}

function normalizeEmotion(label = "") {
  const map = {
    fear: "fear", anger: "anger", sad: "sad", happy: "happy", neutral: "neutral",
    sedih: "sad", marah: "anger", takut: "fear", senang: "happy", netral: "neutral",
    cemas: "fear", anxious: "fear", worried: "fear",
  };
  return map[label.toLowerCase()] || "neutral";
}

const genId = () => `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

const EMOTION_MAP = {
  fear:    { label: "Takut",  emoji: "😨", color: "#C77DFF" },
  anger:   { label: "Marah",  emoji: "😠", color: "#FF6B6B" },
  sad:     { label: "Sedih",  emoji: "😢", color: "#8b5cf6" },
  happy:   { label: "Senang", emoji: "😊", color: "#6BCB77" },
  neutral: { label: "Netral", emoji: "😐", color: "#7B7B9A" },
};

const C = "#739caf";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)    return "Baru saja";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} mnt lalu`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
  return new Date(ts).toLocaleDateString("id", { day: "numeric", month: "short" });
}

const EMOTION_CATEGORY_MAP = {
  fear:    "fear",
  anger:   "anger",
  sad:     "sad",
  happy:   "happy",
  neutral: "neutral",
};

async function fetchArticlesByEmotion(emotion) {
  const category = EMOTION_CATEGORY_MAP[emotion] || "neutral";
  try {
    const res = await fetch(`${BACKEND_API}/api/articles?category=${category}&limit=3`);
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    const articles = json.data || [];

    if (articles.length > 0) return articles;

    const fallback = await fetch(`${BACKEND_API}/api/articles?limit=3`);
    if (!fallback.ok) return [];
    const fallbackJson = await fallback.json();
    return fallbackJson.data || [];
  } catch {
    try {
      const res = await fetch(`${BACKEND_API}/api/articles?limit=3`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  }
}

function EmotionBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#3D3D5C" }}>
          {EMOTION_MAP[label]?.emoji} {EMOTION_MAP[label]?.label || label}
        </span>
        <span style={{ fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color }}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: "rgba(26,26,46,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${Math.round(value * 100)}%`,
          background: color,
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function LiveEmotionPanel({ data, loading, warmingUp, timedOut }) {
  if (!data && !loading && !warmingUp && !timedOut) return null;
  const em = data ? (EMOTION_MAP[normalizeEmotion(data.label || "")] || EMOTION_MAP.neutral) : null;
  const probs = data?.probabilities || {};

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: `1.5px solid ${em ? em.color + "30" : "rgba(115,156,175,0.20)"}`,
      borderRadius: 16,
      padding: "10px 16px",
      marginBottom: 8,
      boxShadow: "0 4px 20px rgba(26,26,46,0.07)",
      transition: "all 0.3s",
      animation: "fadeUp 0.2s ease both",
    }}>
      {warmingUp ? (
        /* State: HF Space sedang bangun dari tidur */
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%", background: "#f59e0b",
                animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <div>
            <span style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#92400e" }}>
              🔥  Pemanasan dulu...
            </span>
            <span style={{ fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 500, color: "#7B7B9A", marginLeft: 6 }}>
              (biasanya 10–30 detik pertama)
            </span>
          </div>
        </div>
      ) : timedOut ? (
        /* State: timeout — HF Space lambat */
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>⏰</span>
          <span style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: "#7B7B9A" }}>
            Deteksi lambat — AI masih loading. Kirim pesan untuk coba lagi.
          </span>
        </div>
      ) : loading ? (
        /* State: sedang proses */
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%", background: C,
                animation: "bounce 1s infinite", animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: "#7B7B9A" }}>
            Mendeteksi emosi...
          </span>
        </div>
      ) : em ? (
        /* State: hasil tersedia */
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
<div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, background: `${em.color}15`, border: `1.5px solid ${em.color}30` }}>
            <span style={{ fontSize: 15 }}>{em.emoji}</span>
            <span style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: em.color }}>
              {em.label}
            </span>
            <span style={{ fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: em.color + "90" }}>
              {Math.round((data?.confidence || 0) * 100)}%
            </span>
          </div>
{Object.keys(probs).length > 0 && (
            <div style={{ flex: 1, minWidth: 180, display: "flex", gap: 4, alignItems: "flex-end", height: 24 }}>
              {Object.entries(probs)
                .sort(([, a], [, b]) => b - a)
                .map(([key, val]) => {
                  const e2 = EMOTION_MAP[normalizeEmotion(key)] || EMOTION_MAP.neutral;
                  const h = Math.max(4, Math.round(val * 24));
                  const isTop = normalizeEmotion(key) === normalizeEmotion(data?.label || "");
                  return (
                    <div key={key} title={`${e2.label}: ${Math.round(val * 100)}%`}
                      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 9, lineHeight: 1 }}>{e2.emoji}</span>
                      <div style={{ width: "100%", height: h, borderRadius: 3, background: e2.color, opacity: isTop ? 1 : 0.35, transition: "height 0.4s ease" }} />
                    </div>
                  );
                })}
            </div>
          )}
          {data?.calibrated && (
            <span style={{ fontSize: 10, fontFamily: "'Nunito',sans-serif", color: C, padding: "2px 7px", borderRadius: 99, background: `${C}12` }}>
              ✓ calibrated
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function BatchAnalysisPanel({ results, onClose }) {
  if (!results || results.length === 0) return null;

  const emotionCounts = results.reduce((acc, r) => {
    const k = normalizeEmotion(r.label || "");
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0];

  return (
    <div style={{
      background: "white", borderRadius: 20, padding: 18, margin: "0 0 12px",
      border: "2px solid rgba(115,156,175,0.12)",
      boxShadow: "0 6px 30px rgba(26,26,46,0.08)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: "#1A1A2E" }}>
          📊 Analisis Emosi Percakapan
        </span>
        <button onClick={onClose} style={{
          border: "none", background: "transparent", cursor: "pointer", color: "#7B7B9A", fontSize: 16,
        }}>×</button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.entries(emotionCounts).map(([key, count]) => {
          const em = EMOTION_MAP[key] || EMOTION_MAP.neutral;
          return (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 99,
              background: `${em.color}12`, border: `1.5px solid ${em.color}30`,
            }}>
              <span style={{ fontSize: 13 }}>{em.emoji}</span>
              <span style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: em.color }}>
                {em.label}
              </span>
              <span style={{
                fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 600,
                color: "#7B7B9A", marginLeft: 2,
              }}>×{count}</span>
            </div>
          );
        })}
      </div>

      {dominant && (
        <div style={{
          padding: "10px 14px", borderRadius: 14,
          background: `${(EMOTION_MAP[dominant[0]] || EMOTION_MAP.neutral).color}10`,
          border: `1.5px solid ${(EMOTION_MAP[dominant[0]] || EMOTION_MAP.neutral).color}20`,
        }}>
          <p style={{ fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: "#3D3D5C", margin: 0 }}>
            Emosi dominan: <strong style={{ color: (EMOTION_MAP[dominant[0]] || EMOTION_MAP.neutral).color }}>
              {(EMOTION_MAP[dominant[0]] || EMOTION_MAP.neutral).emoji} {(EMOTION_MAP[dominant[0]] || EMOTION_MAP.neutral).label}
            </strong> ({dominant[1]} dari {results.length} pesan)
          </p>
        </div>
      )}

      <p style={{ fontSize: 11, color: "#7B7B9A", fontFamily: "'Nunito',sans-serif", fontWeight: 500, margin: "10px 0 0" }}>
        Dianalisis via /predict/batch · {results.length} pesan
      </p>
    </div>
  );
}

function SimpleEmotionBadge({ emotion }) {
  const em = EMOTION_MAP[emotion] || EMOTION_MAP.neutral;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 999,
      background: `${em.color}15`, border: `1px solid ${em.color}30`,
    }}>
      <span style={{ fontSize: 14 }}>{em.emoji}</span>
      <span style={{
        fontFamily: "'Nunito',sans-serif", fontSize: 11, fontWeight: 700, color: em.color,
      }}>{em.label}</span>
    </div>
  );
}

function EmotionBadge({ emotion }) {
  const em = EMOTION_MAP[emotion] || EMOTION_MAP.neutral;
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 999, fontSize: 11,
      fontFamily: "'Nunito',sans-serif", fontWeight: 700,
      background: `${em.color}15`, color: em.color,
    }}>{em.emoji} {em.label}</span>
  );
}

function ArticleSuggestionCard({ article }) {
  return (
    <Link to={`/artikel/${article.id}`}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
        borderRadius: 16, border: "2px solid rgba(26,26,46,0.06)",
        background: "rgba(255,248,240,0.80)", textDecoration: "none", transition: "background 0.2s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(115,156,175,0.08)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,248,240,0.80)"}>
      <div style={{
        width: 36, height: 36, borderRadius: 12, background: "rgba(115,156,175,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
      }}>{article.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "'Nunito',sans-serif",
        }}>{article.title}</p>
        <p style={{
          fontSize: 11, color: "#7B7B9A", margin: "2px 0 0",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontFamily: "'Nunito',sans-serif", fontWeight: 500,
        }}>{article.excerpt}</p>
      </div>
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function SummaryCard({ summary, emotion, suggestedArticles }) {
  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{
        background: "white", borderRadius: 20, padding: 20,
        border: "2px solid rgba(26,26,46,0.05)", boxShadow: "0 4px 20px rgba(26,26,46,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <SimpleEmotionBadge emotion={emotion} />
          <span style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#1A1A2E" }}>
            Ringkasan Percakapan ✨
          </span>
        </div>
        <p style={{
          fontSize: 13, color: "#3D3D5C", fontFamily: "'Nunito',sans-serif",
          fontWeight: 500, lineHeight: "20px", marginBottom: 12,
        }}>{summary}</p>
        {suggestedArticles.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#7B7B9A", fontFamily: "'Nunito',sans-serif", marginBottom: 8 }}>
              Artikel untukmu 📚
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {suggestedArticles.map(a => <ArticleSuggestionCard key={a.id} article={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  if (msg.type === "summary") {
    return <SummaryCard summary={msg.summary} emotion={msg.emotion} suggestedArticles={msg.articles || []} />;
  }

  const isUser = msg.role === "user";
  return (
    <div className="chat-msg" style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
      {!isUser && (
        <img src={logo} alt="SeribuCerita AI" style={{
          width: 32, height: 32, borderRadius: 12, objectFit: "cover",
          flexShrink: 0, marginRight: 10, marginTop: 2, border: `1.5px solid ${C}`,
        }} />
      )}
      <div style={{ maxWidth: "72%" }}>
        {!isUser && msg.emotionLabel && (
          <div style={{ marginBottom: 6 }}>
            <SimpleEmotionBadge emotion={msg.emotionLabel} />
          </div>
        )}
        <div style={{
          padding: "12px 16px",
          borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
          background: isUser ? `linear-gradient(135deg,${C},#4a7c8f)` : "white",
          color: isUser ? "white" : "#1A1A2E",
          fontSize: 14, lineHeight: "22px",
          fontFamily: "'Nunito',sans-serif", fontWeight: 500,
          boxShadow: isUser ? `0 4px 16px rgba(115,156,175,0.30)` : "0 2px 12px rgba(26,26,46,0.06)",
          border: isUser ? "none" : "2px solid rgba(26,26,46,0.05)",
        }}>
          {isUser
            ? <p style={{ margin: 0 }}>{msg.content}</p>
            : <div className="ai-prose" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
          }
        </div>
        {!isUser && msg.aiModel && (
          <p style={{
            fontSize: 10, color: "#7B7B9A", margin: "4px 0 0 4px",
            fontFamily: "'Nunito',sans-serif", fontWeight: 500,
          }}>via {msg.aiModel}</p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <img src={logo} alt="SeribuCerita AI" style={{
        width: 32, height: 32, borderRadius: 12, objectFit: "cover", border: `1.5px solid ${C}`,
      }} />
      <div style={{
        background: "white", borderRadius: "20px 20px 20px 4px", padding: "12px 16px",
        border: "2px solid rgba(26,26,46,0.05)", boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
      }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <span key={i} className="typing-dot" style={{
              width: 7, height: 7, borderRadius: "50%", background: C,
              display: "inline-block", animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  { emoji: "😨", text: "Aku takut banget sama masa depan..." },
  { emoji: "😠", text: "Aku lagi marah sama situasi ini..." },
  { emoji: "😢", text: "Aku sedih banget, boleh cerita?" },
  { emoji: "😊", text: "Aku lagi senang hari ini!" },
  { emoji: "🌿", text: "Kasih aku tips buat rileksasi dong!" },
  { emoji: "💭", text: "Aku butuh saran buat menghadapi masalah..." },
];

function WelcomeScreen({ onQuickPrompt }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100%",
      padding: "40px 24px", textAlign: "center",
    }}>
      <img src={logo} alt="SeribuCerita Logo" style={{
        width: 72, height: 72, borderRadius: 24, objectFit: "cover", marginBottom: 20,
        boxShadow: `0 12px 28px rgba(115,156,175,0.35)`, border: `2px solid ${C}`,
      }} />
      <h2 style={{
        fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700,
        color: "#1A1A2E", marginBottom: 12,
      }}>
        Halo! Aku di sini buat kamu 💙
      </h2>
      <p style={{
        fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 500,
        color: "#7B7B9A", lineHeight: "26px", maxWidth: 420, marginBottom: 32,
      }}>
        Ceritakan apapun yang kamu rasakan. Aku akan mendeteksi emosimu dan merespon dengan empati.
      </p>
      {/* Desktop: 2-column grid | Mobile: horizontal scroll carousel */}
      <div className="quick-prompts-desktop" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, width: "100%", maxWidth: 500 }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p.text} onClick={() => onQuickPrompt(p.text)}
            className="quick-prompt"
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "14px 18px",
              borderRadius: 18, border: "2px solid rgba(26,26,46,0.08)",
              background: "white", cursor: "pointer", textAlign: "left",
              boxShadow: "0 2px 14px rgba(26,26,46,0.06)",
            }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{p.emoji}</span>
            <span style={{
              fontFamily: "'Nunito',sans-serif", fontSize: 13,
              fontWeight: 600, color: "#3D3D5C", lineHeight: "18px",
            }}>{p.text}</span>
          </button>
        ))}
      </div>
      {/* Mobile carousel */}
      <div className="quick-prompts-mobile" style={{
        display: "none", overflowX: "auto", width: "100%",
        paddingBottom: 8, gap: 10,
        scrollbarWidth: "none", msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{ display: "flex", gap: 10, paddingLeft: 4, paddingRight: 4 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p.text} onClick={() => onQuickPrompt(p.text)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                borderRadius: 18, border: "2px solid rgba(26,26,46,0.08)",
                background: "white", cursor: "pointer", textAlign: "left",
                boxShadow: "0 2px 14px rgba(26,26,46,0.06)",
                flexShrink: 0, minWidth: 200, maxWidth: 240,
              }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
              <span style={{
                fontFamily: "'Nunito',sans-serif", fontSize: 13,
                fontWeight: 600, color: "#3D3D5C", lineHeight: "18px",
              }}>{p.text}</span>
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .quick-prompts-desktop { display: none !important; }
          .quick-prompts-mobile { display: block !important; }
          .quick-prompts-mobile > div { display: flex !important; }
          .quick-prompts-mobile::-webkit-scrollbar { display: none; }
        }
      `}</style>
    </div>
  );
}

function Sidebar({ conversations, activeId, onNew, onLoad, onDelete, open, onClose }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayConvos = conversations.filter(c => c.createdAt >= todayStart.getTime());
  const olderConvos = conversations.filter(c => c.createdAt < todayStart.getTime());
  const emojiMap = { fear: "😨", anger: "😠", sad: "😢", happy: "😊", neutral: "😐" };

  return (
    <>
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 30,
            background: "rgba(26,26,46,0.40)", backdropFilter: "blur(4px)",
          }}
          className="md:hidden"
          onClick={onClose}
        />
      )}
      <aside style={{
        width: open ? 260 : 0, minWidth: open ? 260 : 0,
        background: "white", borderRight: `2px solid rgba(115,156,175,0.10)`,
        display: "flex", flexDirection: "column", height: "100%",
        overflow: "hidden", transition: "width 0.25s ease, min-width 0.25s ease", flexShrink: 0,
      }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "2px solid rgba(26,26,46,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <img src={logo} alt="SeribuCerita Logo"
                className="w-6 h-6 rounded-full object-cover"
                style={{ border: `1.5px solid ${C}` }} />
              <span style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
                Seribu<span style={{ color: C }}>Cerita</span>
              </span>
            </Link>
            <button onClick={onClose} style={{
              padding: 6, borderRadius: 10, border: "none",
              background: "transparent", cursor: "pointer", color: "#7B7B9A",
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button onClick={onNew} className="btn-fun w-full"
            style={{
              padding: "9px 16px", fontSize: 13, borderRadius: 12,
              background: `linear-gradient(135deg,${C},#4a7c8f)`, color: "white",
              boxShadow: `0 4px 16px rgba(115,156,175,0.25)`,
            }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Percakapan Baru
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }} className="custom-scroll">
          {[{ label: "Hari Ini", items: todayConvos }, { label: "Sebelumnya", items: olderConvos }].map(group =>
            group.items.length > 0 && (
              <div key={group.label} style={{ padding: "4px 12px" }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: "#7B7B9A", textTransform: "uppercase",
                  letterSpacing: "0.6px", padding: "4px 8px", margin: "0 0 4px",
                  fontFamily: "'Nunito',sans-serif",
                }}>{group.label}</p>
                {group.items.map(c => (
                  <div key={c.id} onClick={() => onLoad(c.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 14, cursor: "pointer", marginBottom: 2,
                      background: c.id === activeId ? `rgba(115,156,175,0.10)` : "transparent",
                      border: c.id === activeId ? `2px solid rgba(115,156,175,0.20)` : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = "rgba(26,26,46,0.04)"; }}
                    onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: `rgba(115,156,175,0.12)`, display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 12,
                    }}>
                      {emojiMap[c.emotion] || "😐"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: 0,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        fontFamily: "'Nunito',sans-serif",
                      }}>{c.title}</p>
                      <p style={{
                        fontSize: 10, color: "#7B7B9A", margin: 0,
                        fontFamily: "'Nunito',sans-serif", fontWeight: 500,
                      }}>{timeAgo(c.createdAt)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                      style={{
                        padding: 3, border: "none", background: "transparent",
                        cursor: "pointer", color: "#7B7B9A", borderRadius: 4,
                        display: "flex", alignItems: "center", transition: "color 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#FF6B6B"}
                      onMouseLeave={e => e.currentTarget.style.color = "#7B7B9A"}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
          {conversations.length === 0 && (
            <p style={{
              textAlign: "center", fontSize: 13, color: "#7B7B9A",
              padding: "24px 16px", fontFamily: "'Nunito',sans-serif", fontWeight: 500,
            }}>Belum ada percakapan 💬</p>
          )}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "2px solid rgba(26,26,46,0.06)", flexShrink: 0 }}>
          <Link to="/"
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, textDecoration: "none", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(115,156,175,0.06)`}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{
              width: 30, height: 30, borderRadius: 10,
              background: `linear-gradient(135deg,${C},#4a7c8f)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, color: "white",
            }}>←</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", margin: 0, fontFamily: "'Nunito',sans-serif" }}>Ke Beranda</p>
              <p style={{ fontSize: 10, color: "#7B7B9A", margin: 0, fontFamily: "'Nunito',sans-serif" }}>Kembali</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function Chatbot() {
  const { user } = useAuth();
  const backendIdRef = useRef({});

  const [conversations, setConversations] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sc_convos") || "[]"); } catch { return []; }
  });
  const [activeId, setActiveId] = useState(() => {
    return localStorage.getItem("sc_active_id") || null;
  });
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [isTyping,      setIsTyping]      = useState(false);
  const [input,         setInput]         = useState("");
  const [liveEmotion,   setLiveEmotion]   = useState(null);
  const [apiError,      setApiError]      = useState(null);

  const [predictData,    setPredictData]    = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [showPredict,    setShowPredict]    = useState(false);
  const [predictTimedOut,setPredictTimedOut]= useState(false);
  const [warmingUp,      setWarmingUp]      = useState(false);
  const [hfReady,        setHfReady]        = useState(false); // true setelah ping berhasil
  const abortRef = useRef(null); // AbortController untuk request predict aktif

  const [batchResults,  setBatchResults]  = useState(null);
  const [batchLoading,  setBatchLoading]  = useState(false);
  const [showBatch,     setShowBatch]     = useState(false);

  const [suggestedArticles, setSuggestedArticles] = useState([]);

  const messagesEndRef  = useRef(null);
  const textareaRef     = useRef(null);
  const predictTimerRef = useRef(null);

  useEffect(() => { localStorage.setItem("sc_convos", JSON.stringify(conversations)); }, [conversations]);

  useEffect(() => {
    let cancelled = false;
    async function warmUp() {
      try {
        setWarmingUp(true);
        await pingHFSpace();
        if (!cancelled) { setHfReady(true); setWarmingUp(false); }
      } catch {
        if (!cancelled) setWarmingUp(false);
      }
    }
    warmUp();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (activeId) localStorage.setItem("sc_active_id", activeId);
    else localStorage.removeItem("sc_active_id");
  }, [activeId]);

  useEffect(() => {
    if (activeId && conversations.length > 0) {
      const stillExists = conversations.find(c => c.id === activeId);
      if (!stillExists) setActiveId(conversations[0]?.id || null);
    }
  }, [activeId, conversations]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); });

  const save = useCallback((convos) => {
    setConversations(convos);
    localStorage.setItem("sc_convos", JSON.stringify(convos));
  }, []);

  const activeConvo = conversations.find(c => c.id === activeId) || null;
  const messages    = activeConvo?.messages || [];
  const emotion     = activeConvo?.emotion || "neutral";

  function handleInputChange(e) {
    const val = e.target.value;
    setInput(val);
    e.target.style.height = "36px";
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px";

    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (predictTimerRef.current) clearTimeout(predictTimerRef.current);

    if (val.trim().length >= 3) {
      setShowPredict(true);
      setPredictTimedOut(false);

      if (!hfReady) {
        setPredictLoading(false);
        setWarmingUp(true);
        predictTimerRef.current = setTimeout(async () => {
          try {
            await pingHFSpace();
            setHfReady(true);
            setWarmingUp(false);
            runPredict(val.trim());
          } catch {
            setWarmingUp(false);
          }
        }, 300);
        return;
      }

      setPredictLoading(true);
      predictTimerRef.current = setTimeout(() => runPredict(val.trim()), 500);
    } else {
      setShowPredict(false);
      setPredictData(null);
      setPredictLoading(false);
      setPredictTimedOut(false);
    }
  }

  async function runPredict(text) {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPredictLoading(true);
    setPredictTimedOut(false);

    const timer = setTimeout(() => {
      controller.abort();
      setPredictLoading(false);
      setPredictTimedOut(true);
      setPredictData(null);
    }, 10000);

    try {
      const result = await predictEmotion(text, true, controller.signal);
      clearTimeout(timer);
      if (controller.signal.aborted) return;
      const normalized = {
        ...result,
        label: normalizeEmotion(result.label || ""),
        probabilities: Object.fromEntries(
          Object.entries(result.probabilities || {}).map(([k, v]) => [normalizeEmotion(k), v])
        ),
      };
      setPredictData(normalized);
      setPredictTimedOut(false);
    } catch (err) {
      clearTimeout(timer);
      if (controller.signal.aborted || err.message === "timeout") {
        setPredictTimedOut(true);
        setPredictData(null);
      } else {
        setPredictData(null);
      }
    } finally {
      if (!controller.signal.aborted) setPredictLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  async function runBatchAnalysis() {
    if (!activeConvo) return;
    const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
    if (userMessages.length === 0) return;

    const chunks = [];
    for (let i = 0; i < userMessages.length; i += 32) {
      chunks.push(userMessages.slice(i, i + 32));
    }

    setBatchLoading(true);
    setShowBatch(true);
    try {
      const allResults = [];
      for (const chunk of chunks) {
        const res = await predictBatch(chunk);
        allResults.push(...(res.results || []));
      }
      setBatchResults(allResults);
    } catch {
      setBatchResults(null);
    } finally {
      setBatchLoading(false);
    }
  }

  function newConvo() {
    const c = {
      id: genId(), title: "Percakapan Baru", messages: [],
      createdAt: Date.now(), emotion: "neutral", userMsgCount: 0,
    };
    save([c, ...conversations]);
    setActiveId(c.id);
    setSidebarOpen(false);
    setLiveEmotion(null);
    setApiError(null);
    setPredictData(null);
    setShowPredict(false);
    setBatchResults(null);
    setShowBatch(false);
    setSuggestedArticles([]);
  }

  function loadConvo(id) {
    setActiveId(id);
    setSidebarOpen(false);
    setBatchResults(null);
    setShowBatch(false);
  }

  async function deleteConvo(id) {
    const backendId = backendIdRef.current[id];
    if (user && backendId) {
      try { await deleteChatConversation(user.id, backendId); } catch {}
      delete backendIdRef.current[id];
    }
    const updated = conversations.filter(c => c.id !== id);
    save(updated);
    if (activeId === id) setActiveId(updated[0]?.id || null);
  }

  function clearChat() {
    if (!activeConvo || !window.confirm("Hapus semua pesan di percakapan ini?")) return;
    save(conversations.map(c =>
      c.id === activeId ? { ...c, messages: [], title: "Percakapan Baru", userMsgCount: 0 } : c
    ));
    setLiveEmotion(null);
    setApiError(null);
    setBatchResults(null);
    setShowBatch(false);
    setSuggestedArticles([]);
  }

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || isTyping) return;

    setShowPredict(false);
    setPredictData(null);
    if (predictTimerRef.current) clearTimeout(predictTimerRef.current);

    let convoId = activeId;
    let currentConvos = conversations;

    if (!convoId) {
      const c = {
        id: genId(),
        title: userText.slice(0, 35),
        messages: [], createdAt: Date.now(), emotion: "neutral", userMsgCount: 0,
      };
      currentConvos = [c, ...conversations];
      convoId = c.id;
      setActiveId(convoId);
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "44px";
    setIsTyping(true);
    setApiError(null);

    const userMsg = { role: "user", content: userText, ts: Date.now() };

    const existingMsgs = currentConvos.find(c => c.id === convoId)?.messages || [];
    const history = existingMsgs
      .filter(m => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    let updatedConvos = currentConvos.map(c => {
      if (c.id !== convoId) return c;
      const newCount = (c.userMsgCount || 0) + 1;
      return {
        ...c,
        messages: [...c.messages, userMsg],
        title: c.title === "Percakapan Baru"
          ? userText.slice(0, 35) + (userText.length > 35 ? "…" : "")
          : c.title,
        userMsgCount: newCount,
      };
    });
    save(updatedConvos);

    if (user) {
      try {
        if (!backendIdRef.current[convoId]) {
          const convoTitle = updatedConvos.find(c => c.id === convoId)?.title || "Percakapan Baru";
          const created = await createChatConversation(user.id, convoTitle);
          backendIdRef.current[convoId] = created.data?.id;
        }
        const backendId = backendIdRef.current[convoId];
        if (backendId) {
          await saveChatMessage(user.id, backendId, { role: "user", text: userText, emotion: null });
        }
      } catch {}
    }

    try {
      const result = await callChatAPI(userText, history);

      const rawEmotion     = result.emotion?.label || "neutral";
      const emotionKey     = normalizeEmotion(rawEmotion);
      const aiText         = result.ai_response || "Maaf, ada kesalahan. Coba lagi ya! 😊";
      const aiModel        = result.ai_model || null;
      const processingTime = result.processing_time_ms || null;

      setLiveEmotion({ emotion: emotionKey });

      const aiMsg = {
        role: "assistant",
        content: aiText,
        ts: Date.now(),
        emotionLabel: emotionKey,
        aiModel,
        processingTime,
      };

      const currentCount = updatedConvos.find(c => c.id === convoId)?.userMsgCount || 0;
      const shouldSummarize = currentCount > 0 && currentCount % 4 === 0;

      let finalMsgs = [aiMsg];
      if (shouldSummarize) {
        // Fetch artikel yang relevan dengan emosi dominan percakapan
        const articlesForEmotion = await fetchArticlesByEmotion(emotionKey);
        setSuggestedArticles(articlesForEmotion);

        // Buat summary berdasarkan emosi
        const emotionDisplay = EMOTION_MAP[emotionKey]?.label || "netral";
        const summaryByEmotion = {
          fear:    `Aku bisa merasakan ada rasa takut atau cemas dalam ceritamu. Wajar banget merasakan itu — kamu tidak sendirian. Berikut beberapa artikel yang mungkin bisa membantu kamu 💙`,
          anger:   `Kamu tampak merasa frustrasi atau marah, dan itu valid banget. Marah adalah respons yang manusiawi. Coba baca artikel berikut untuk membantu mengelola perasaan ini 💙`,
          sad:     `Dari ceritamu, aku merasakan ada kesedihan yang kamu bawa. Terima kasih sudah mau berbagi — itu butuh keberanian. Semoga artikel ini bisa sedikit membantu 💙`,
          happy:   `Senang banget mendengar kamu merasa baik hari ini! Pertahankan energi positif ini ya. Berikut beberapa artikel untuk mendukung kesehatan mentalmu 💙`,
          neutral: `Terima kasih sudah cerita selama ini. Berikut beberapa artikel pilihan yang mungkin relevan untukmu 💙`,
        };

        finalMsgs.push({
          type: "summary",
          summary: summaryByEmotion[emotionKey] || summaryByEmotion.neutral,
          emotion: emotionKey,
          articles: articlesForEmotion,
          ts: Date.now(),
        });
      }

      updatedConvos = updatedConvos.map(c =>
        c.id === convoId
          ? { ...c, emotion: emotionKey, messages: [...c.messages, ...finalMsgs] }
          : c
      );
      save(updatedConvos);

      if (user) {
        try {
          const backendId = backendIdRef.current[convoId];
          if (backendId) {
            await saveChatMessage(user.id, backendId, { role: "bot", text: aiText, emotion: emotionKey });
            await updateChatConversation(user.id, backendId, {
              title: updatedConvos.find(c => c.id === convoId)?.title,
              emotion: emotionKey,
            });
          }
        } catch {}
      }

    } catch (err) {
      setApiError("Koneksi ke AI bermasalah. Cek koneksimu dan coba lagi 🙏");

      const fallbackMsg = {
        role: "assistant",
        content: "Makasih udah cerita ke aku 💙 Aku di sini buat dengerin. Mau lanjut cerita?",
        ts: Date.now(),
      };
      save(updatedConvos.map(c =>
        c.id === convoId ? { ...c, messages: [...c.messages, fallbackMsg] } : c
      ));
    }

    setIsTyping(false);
    textareaRef.current?.focus();
  }

  const userMsgCount = messages.filter(m => m.role === "user").length;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 72px)", overflow: "hidden", background: "linear-gradient(160deg,#FFF8F0 0%,#EEF4F7 100%)" }}>

      <Sidebar
        conversations={conversations} activeId={activeId}
        onNew={newConvo} onLoad={loadConvo} onDelete={deleteConvo}
        open={sidebarOpen} onClose={() => setSidebarOpen(false)}
      />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column", height: "100%",
        overflow: "hidden", minWidth: 0, alignItems: "center", padding: "20px 20px 0",
      }}>
<div style={{
          width: "100%", maxWidth: 900, display: "flex", alignItems: "center",
          justifyContent: "flex-end", marginBottom: 16, flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {liveEmotion && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                borderRadius: 999, background: "rgba(255,255,255,0.90)",
                border: `1.5px solid rgba(115,156,175,0.20)`,
                fontSize: 12, fontFamily: "'Nunito',sans-serif", fontWeight: 700, color: "#3D3D5C",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6BCB77", display: "inline-block" }} />
                AI Emosi: <EmotionBadge emotion={liveEmotion.emotion} />
              </div>
            )}
{userMsgCount > 0 && (
              <button onClick={runBatchAnalysis} disabled={batchLoading}
                style={{
                  padding: "8px 16px", borderRadius: 12,
                  border: "2px solid rgba(115,156,175,0.20)",
                  background: "white", cursor: batchLoading ? "wait" : "pointer",
                  fontSize: 13, color: "#3D3D5C",
                  fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
                  opacity: batchLoading ? 0.7 : 1,
                }}>
                {batchLoading ? "⏳" : "📊"} Analisis
              </button>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px 16px", borderRadius: 12, border: "2px solid rgba(26,26,46,0.10)",
                background: "white", cursor: "pointer", fontSize: 13, color: "#3D3D5C",
                fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 2px 12px rgba(26,26,46,0.06)",
              }}>
              📋 Riwayat
            </button>
            <button onClick={newConvo}
              style={{
                padding: "8px 18px", borderRadius: 12, border: "none", cursor: "pointer",
                fontSize: 13, background: `linear-gradient(135deg,${C},#4a7c8f)`, color: "white",
                fontFamily: "'Nunito',sans-serif", fontWeight: 800,
                boxShadow: `0 4px 16px rgba(115,156,175,0.30)`,
              }}>
              + Baru
            </button>
          </div>
        </div>
<div style={{
          width: "100%", maxWidth: 900, background: "white", borderRadius: 28,
          border: `2px solid rgba(115,156,175,0.10)`, display: "flex", flexDirection: "column",
          height: "calc(100vh - 100px)", overflow: "hidden",
          boxShadow: "0 8px 40px rgba(26,26,46,0.08)",
        }}>
<div style={{
            padding: "16px 24px", borderBottom: "2px solid rgba(26,26,46,0.05)", flexShrink: 0,
            background: "linear-gradient(135deg,rgba(255,248,240,0.80),rgba(238,244,247,0.80))",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={logo} alt="SeribuCerita Logo"
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: `2px solid ${C}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Fraunces',serif", fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
                    SeribuCerita
                  </span>
                  {warmingUp && !hfReady ? (
                    <span style={{
                      padding: "3px 10px", borderRadius: 999, background: "rgba(245,158,11,0.15)",
                      color: "#92400e", fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                      animation: "pulse 1.5s infinite",
                    }}>🔥 Pemanasan dulu...</span>
                  ) : (
                    <span style={{
                      padding: "3px 10px", borderRadius: 999, background: "rgba(107,203,119,0.15)",
                      color: "#1A7A44", fontSize: 11, fontFamily: "'Nunito',sans-serif", fontWeight: 700,
                    }}>{hfReady ? "● Online" : "● Standby"}</span>
                  )}
                  {activeConvo && messages.length > 0 && <EmotionBadge emotion={emotion} />}
                </div>
                <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 12, color: "#7B7B9A", margin: 0, fontWeight: 500 }}>
                  Pendamping Kesehatan Mental 💙
                </p>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {activeConvo && messages.length > 0 && (
                  <button onClick={clearChat}
                    style={{
                      padding: "6px 8px", border: "none", background: "transparent",
                      cursor: "pointer", color: "#7B7B9A", borderRadius: 10,
                    }}
                    title="Hapus percakapan">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <Link to="/edukasi" title="Artikel"
                  style={{
                    padding: "6px 8px", border: "none", background: "transparent",
                    cursor: "pointer", color: "#7B7B9A", borderRadius: 10,
                    display: "flex", alignItems: "center", textDecoration: "none",
                  }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
{apiError && (
            <div style={{
              padding: "10px 20px", background: "rgba(232,82,127,0.08)",
              borderBottom: "1.5px solid rgba(232,82,127,0.15)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, color: "#E8527F", fontFamily: "'Nunito',sans-serif", fontWeight: 600 }}>
                ⚠️ {apiError}
              </span>
              <button onClick={() => setApiError(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#E8527F", fontSize: 16 }}>
                ×
              </button>
            </div>
          )}
<div style={{ flex: 1, overflowY: "auto", padding: "24px" }} className="custom-scroll">
            {!activeConvo || messages.length === 0 ? (
              <WelcomeScreen onQuickPrompt={t => sendMessage(t)} />
            ) : (
              <>
{showBatch && (
                  batchLoading ? (
                    <div style={{
                      background: "white", borderRadius: 20, padding: 18, marginBottom: 12,
                      border: "2px solid rgba(115,156,175,0.12)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C, animation: "pulse 1s infinite" }} />
                      <span style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif", fontWeight: 600, color: "#7B7B9A" }}>
                        Menganalisis seluruh percakapan...
                      </span>
                    </div>
                  ) : (
                    <BatchAnalysisPanel
                      results={batchResults}
                      onClose={() => { setShowBatch(false); setBatchResults(null); }}
                    />
                  )
                )}

                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {isTyping && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
<div style={{
            padding: "12px 20px 16px", flexShrink: 0,
            borderTop: "2px solid rgba(26,26,46,0.05)",
            background: "rgba(255,248,240,0.50)",
          }}>
{showPredict && (
              <LiveEmotionPanel
                data={predictData}
                loading={predictLoading}
                warmingUp={warmingUp && !hfReady}
                timedOut={predictTimedOut}
              />
            )}

            <div style={{
              display: "flex", alignItems: "flex-end", gap: 10,
              background: "white", borderRadius: 24,
              border: `2.5px solid rgba(115,156,175,0.20)`,
              boxShadow: `0 2px 12px rgba(115,156,175,0.08)`,
              padding: "6px 6px 6px 18px",
              transition: "border-color 0.2s",
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = C}
              onBlurCapture={e => e.currentTarget.style.borderColor = "rgba(115,156,175,0.20)"}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) sendMessage();
                  }
                }}
                placeholder="Ketik ceritamu di sini... 💬"
                style={{
                  flex: 1, padding: "8px 0", border: "none", background: "transparent",
                  fontSize: 14, lineHeight: "22px", color: "#1A1A2E", boxSizing: "border-box",
                  fontFamily: "'Nunito',sans-serif", fontWeight: 500, outline: "none", resize: "none",
                  minHeight: 36, maxHeight: 110, overflowY: "auto",
                }}
                rows={1}
              />
              <button
                onClick={() => input.trim() && sendMessage()}
                disabled={!input.trim() || isTyping}
                style={{
                  width: 40, height: 40, borderRadius: 18, border: "none", flexShrink: 0,
                  background: input.trim() && !isTyping
                    ? `linear-gradient(135deg,${C},#4a7c8f)`
                    : "rgba(26,26,46,0.08)",
                  cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                  boxShadow: input.trim() && !isTyping ? `0 4px 12px rgba(115,156,175,0.35)` : "none",
                }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p style={{
              fontFamily: "'Nunito',sans-serif", fontSize: 11, color: "#7B7B9A",
              textAlign: "center", margin: "8px 0 0", fontWeight: 500,
            }}>
              {hfReady
                ? "AI aktif · mendeteksi emosi real-time 💙"
                : warmingUp
                  ? "🔥 AI sedang pemanasan, tunggu sebentar ya..."
                  : "AI mendeteksi emosimu · 5 emosi: Takut, Marah, Sedih, Senang, Netral 💙"
              }
            </p>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); opacity: 0.5; }
                50% { transform: translateY(-4px); opacity: 1; }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
              }
              @keyframes fadeUp {
                from { opacity: 0; transform: translateY(6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}