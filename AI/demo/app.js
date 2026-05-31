/**
 * SeribuCerita Emotion Demo — Client App
 * Emotion classification (IndoBERT) + Grok AI empathetic chat.
 * Calls HF Spaces /chat endpoint for combined response.
 */

// ============================================================
// CONFIG
// ============================================================
const API_URL = 'https://syahrulw-seribucerita-emotion.hf.space';

const EMOTIONS = {
  anger:   { emoji: '😠', color: '#FC8181', tag: 'NEGATIF',  tagClass: 'negative' },
  fear:    { emoji: '😨', color: '#F6AD55', tag: 'NEGATIF',  tagClass: 'negative' },
  sad:     { emoji: '😢', color: '#76E4F7', tag: 'NEGATIF',  tagClass: 'negative' },
  neutral: { emoji: '😐', color: '#A0AEC0', tag: 'NETRAL',   tagClass: 'neutral-tag' },
  happy:   { emoji: '😄', color: '#68D391', tag: 'POSITIF',  tagClass: '' },
};

// ============================================================
// STATE
// ============================================================
let isLoading = false;
let grokAvailable = false;
const historyItems = [];
const conversationHistory = [];  // [{role, content}] for multi-turn chat

// DOM refs
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const chatMessages  = document.getElementById('chatMessages');
const chatInput     = document.getElementById('chatInput');
const sendBtn       = document.getElementById('sendBtn');
const resultCard    = document.getElementById('resultCard');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const historySection = document.getElementById('historySection');
const historyList   = document.getElementById('historyList');

// ============================================================
// INIT — health check
// ============================================================
(async () => {
  setStatus('loading', 'Menghubungkan...');
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    grokAvailable = data.gemini_available ?? false;
    if (data.status === 'healthy' && data.model_loaded) {
      const label = grokAvailable ? 'Model + Gemini Siap' : 'Model Siap (tanpa Gemini)';
      setStatus('ready', label);
    } else {
      setStatus('error', 'Model Belum Siap');
    }
  } catch {
    setStatus('error', 'Tidak Terhubung');
  }
})();

// ============================================================
// STATUS
// ============================================================
function setStatus(state, text) {
  statusDot.className = `status-dot ${state}`;
  statusText.textContent = text;
}

// ============================================================
// INPUT HANDLERS
// ============================================================
function onInputChange(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  sendBtn.disabled = !el.value.trim() || isLoading;
}

function onKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) handleSubmit(e);
  }
}

function useExample(btn) {
  chatInput.value = btn.textContent.trim();
  chatInput.dispatchEvent(new Event('input'));
  handleSubmit(new Event('submit'));
}

// ============================================================
// SUBMIT — calls /chat (emotion + Grok in one request)
// ============================================================
async function handleSubmit(e) {
  e.preventDefault?.();
  const text = chatInput.value.trim();
  if (!text || isLoading) return;

  // Hide welcome
  document.getElementById('welcomeBlock')?.remove();

  appendBubble(text, 'user');
  chatInput.value = '';
  chatInput.style.height = 'auto';
  sendBtn.disabled = true;
  isLoading = true;

  const typingId = appendTyping();

  try {
    const t0 = performance.now();

    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        history: conversationHistory.slice(-12),
        calibrate: true,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const totalMs = Math.round(performance.now() - t0);

    removeTyping(typingId);

    const emotion = data.emotion;
    const aiResponse = data.ai_response;

    // Show Grok AI response as chat bubble
    appendBubble(aiResponse, 'bot');

    // Maintain multi-turn history
    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: aiResponse });

    // Update result panel with emotion data
    showResult(emotion, totalMs);
    addHistory(text, emotion);

  } catch (err) {
    removeTyping(typingId);
    appendBubble(`❌ Gagal terhubung ke API: ${err.message}`, 'bot');
  } finally {
    isLoading = false;
    sendBtn.disabled = !chatInput.value.trim();
  }
}

// ============================================================
// CHAT BUBBLES
// ============================================================
function appendBubble(content, sender) {
  const row = document.createElement('div');
  row.className = `message-row ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = sender === 'user' ? '👤' : '💙';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  // Support line breaks in AI response
  bubble.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');

  row.appendChild(avatar);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return row;
}

function appendTyping() {
  const id = 'typing-' + Date.now();
  const row = document.createElement('div');
  row.id = id;
  row.className = 'message-row bot';
  row.innerHTML = `
    <div class="message-avatar">💙</div>
    <div class="message-bubble">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

// ============================================================
// RESULT CARD — shows emotion classification from IndoBERT
// ============================================================
function showResult(data, totalMs) {
  if (!data) return;
  const em = EMOTIONS[data.label] || EMOTIONS.neutral;

  document.getElementById('resultEmoji').textContent = em.emoji;

  const labelEl = document.getElementById('resultLabel');
  labelEl.textContent = data.label;
  labelEl.style.color = em.color;

  const conf = ((data.confidence || 0) * 100).toFixed(1);
  document.getElementById('resultConfidence').textContent = `Confidence: ${conf}%`;

  const tagEl = document.getElementById('resultTag');
  tagEl.textContent = em.tag;
  tagEl.className = `result-tag ${em.tagClass}`;

  // Score bars
  const scoreList = document.getElementById('scoreList');
  scoreList.innerHTML = '';
  if (data.scores) {
    for (const [label, score] of Object.entries(data.scores)) {
      const pct = (score * 100).toFixed(1);
      const barColor = EMOTIONS[label]?.color || '#A0AEC0';
      const isActive = label === data.label;
      const row = document.createElement('div');
      row.className = `score-row${isActive ? ' active' : ''}`;
      row.innerHTML = `
        <span class="score-name">${label}</span>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width:0%; background:${barColor}"></div>
        </div>
        <span class="score-pct">${pct}%</span>`;
      scoreList.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.score-bar-fill').style.width = `${pct}%`;
      });
    }
  }

  // Calibration
  const calRow = document.getElementById('calibrationRow');
  if (data.calibrated_confidence != null) {
    const raw = ((data.confidence || 0) * 100).toFixed(1);
    const cal = (data.calibrated_confidence * 100).toFixed(1);
    calRow.textContent = `Raw: ${raw}%  •  Setelah kalibrasi: ${cal}%`;
  } else {
    calRow.textContent = '';
  }

  // Notes
  const notesRow = document.getElementById('notesRow');
  if (data.notes?.length) {
    notesRow.textContent = '⚙️ ' + data.notes.join(' | ');
    notesRow.hidden = false;
  } else {
    notesRow.hidden = true;
  }

  // Timing
  const serverMs = data.processing_time_ms?.toFixed(0) ?? '—';
  document.getElementById('serverTime').textContent = `⏱️ Server: ${serverMs}ms`;
  document.getElementById('totalTime').textContent = `🌐 Total: ${totalMs}ms`;

  resultPlaceholder.hidden = true;
  resultCard.hidden = false;
}

// ============================================================
// HISTORY
// ============================================================
function addHistory(text, data) {
  if (!data) return;
  const em = EMOTIONS[data.label] || EMOTIONS.neutral;
  historyItems.unshift({ text, label: data.label, emoji: em.emoji });

  historySection.hidden = false;
  historyList.innerHTML = '';
  historyItems.slice(0, 8).forEach(item => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <span class="h-emoji">${item.emoji}</span>
      <span class="h-text">${escapeHtml(item.text)}</span>
      <span class="h-label">${item.label}</span>`;
    historyList.appendChild(div);
  });
}

function clearHistory() {
  historyItems.length = 0;
  conversationHistory.length = 0;
  historySection.hidden = true;
  resultCard.hidden = true;
  resultPlaceholder.hidden = false;
  chatMessages.innerHTML = '';
  // Restore welcome
  const welcome = document.createElement('div');
  welcome.className = 'welcome-block';
  welcome.id = 'welcomeBlock';
  welcome.innerHTML = `
    <div class="welcome-text">
      <p>Halo! Coba ceritakan perasaanmu dalam <strong>Bahasa Indonesia</strong>. AI akan mendeteksi emosimu dan merespon dengan empati. 💙</p>
    </div>
    <div class="examples-grid">
      <button class="example-chip" onclick="useExample(this)">aku senang banget hari ini!</button>
      <button class="example-chip" onclick="useExample(this)">aku sedih ditinggal pergi</button>
      <button class="example-chip" onclick="useExample(this)">kenapa sih selalu bikin kesal</button>
      <button class="example-chip" onclick="useExample(this)">aku takut gagal ujian besok</button>
      <button class="example-chip" onclick="useExample(this)">hari ini biasa saja sih</button>
      <button class="example-chip" onclick="useExample(this)">aku tidak marah, cuma capek</button>
    </div>`;
  chatMessages.appendChild(welcome);
}

// ============================================================
// UTILS
// ============================================================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
