import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getInitialTheme } from "./theme.js";
import { useSpeechRecognition } from "./useSpeechRecognition.js";

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const WORKER_URL = "https://conv-assist-proxy.sv-mu-g-em-d-9-xxx.workers.dev"; // ← Worker URL

const PROMPTS = {
  en: `You are a bilingual conversation coach helping a Japanese speaker respond naturally to English speakers in real-time.

When given an English utterance, respond ONLY with a JSON object (no markdown, no backticks):
{
  "nuance": "相手の発言の意味・ニュアンス・意図を日本語で2〜3文で解説。口語表現・スラング・文化的背景があれば補足。",
  "tone": "casual | neutral | formal",
  "responses": [
    { "english": "Natural English response 1", "japanese": "日本語訳", "label": "ラベル（例：同意する）" },
    { "english": "Natural English response 2", "japanese": "日本語訳", "label": "ラベル" },
    { "english": "Natural English response 3", "japanese": "日本語訳", "label": "ラベル" }
  ]
}
Make responses feel natural, not textbook-stiff.`,

  ja: `You are a bilingual conversation coach helping a Japanese speaker communicate naturally with English speakers.

The user has spoken in Japanese. Your job is to:
1. Understand what they want to say
2. Provide natural English translations/phrasings they can use

Respond ONLY with a JSON object (no markdown, no backticks):
{
  "nuance": "入力された日本語の意図・ニュアンスを1〜2文で確認（日本語で）",
  "tone": "casual | neutral | formal",
  "responses": [
    { "english": "Natural English phrasing 1", "japanese": "日本語訳・補足", "label": "ラベル（例：ストレートに伝える）" },
    { "english": "Natural English phrasing 2", "japanese": "日本語訳・補足", "label": "ラベル" },
    { "english": "Natural English phrasing 3", "japanese": "日本語訳・補足", "label": "ラベル" }
  ]
}
Make the English sound native and natural for the context.`,
};

const TONE_META = {
  casual:  { color: "#34d399", bg: "rgba(52,211,153,0.08)",  label: "カジュアル" },
  neutral: { color: "#60a5fa", bg: "rgba(96,165,250,0.08)", label: "ニュートラル" },
  formal:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", label: "フォーマル" },
};

const LANGS = {
  en: { code: "en-US", label: "EN", sublabel: "相手の英語を聞き取る", flag: "🇺🇸", accent: "#2563eb", accentDark: "#1d4ed8" },
  ja: { code: "ja-JP", label: "JA", sublabel: "自分の日本語を英訳する", flag: "🇯🇵", accent: "#8652f3", accentDark: "#7c3aed" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #040711;
    --surface: #080f1e;
    --surface-2: #0d1628;
    --surface-3: #111e34;
    --border: rgba(255,255,255,0.10);
    --border-subtle: rgba(255,255,255,0.06);
    --text-primary: #f1f5f9;
    --text-secondary: #b8c5d6;
    --text-muted: #7a8fa8;
    --text-ghost: #364d66;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    --font-mono: 'JetBrains Mono', 'DM Mono', monospace;
  }

  [data-theme="light"] {
    --bg: #f5f7fa;
    --surface: #ffffff;
    --surface-2: #eef1f6;
    --surface-3: #e4e9f2;
    --border: rgba(0,0,0,0.10);
    --border-subtle: rgba(0,0,0,0.06);
    --text-primary: #0f172a;
    --text-secondary: #334155;
    --text-muted: #64748b;
    --text-ghost: #9aabbd;
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'Inter', 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .jp-text {
    letter-spacing: 0.04em;
    font-feature-settings: "palt";
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.18); border-radius: 2px; }

  textarea { font-family: inherit; }
  textarea:focus { outline: none; }
  button { cursor: pointer; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes ripple {
    0%   { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(1.9); opacity: 0; }
  }

  .fade-up    { animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  .pulsing    { animation: pulse 1.6s ease-in-out infinite; }
  .spinning   { animation: spin 0.9s linear infinite; }
  .ripple-1   { animation: ripple 2s ease-out infinite; }
  .ripple-2   { animation: ripple 2s ease-out 0.65s infinite; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }

  .label-tag {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .response-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    transition: background 0.15s, border-color 0.15s;
  }
  .response-card:hover {
    background: var(--surface-2);
    border-color: rgba(128,128,128,0.15);
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding: 0 10px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-muted);
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .copy-btn:hover { border-color: rgba(128,128,128,0.25); color: var(--text-secondary); }
  .copy-btn.copied { border-color: rgba(52,211,153,0.3); color: #34d399; }

  .lang-tab {
    flex: 1;
    padding: 10px 8px;
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    transition: all 0.2s;
  }
  .lang-tab:hover:not(.active) { background: rgba(255,255,255,0.03); }

  .toggle-track {
    width: 34px;
    height: 18px;
    border-radius: 9px;
    border: none;
    padding: 0;
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
  }
  .toggle-thumb {
    position: absolute;
    top: 3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s cubic-bezier(0.34,1.56,0.64,1);
  }

  .reset-btn {
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    transition: all 0.2s;
  }
  .reset-btn:hover { border-color: rgba(128,128,128,0.2); color: var(--text-secondary); }

  .mic-btn { cursor: pointer; }
  .mic-btn:hover { transform: scale(1.06); }
  .mic-btn:active { transform: scale(0.96); }
  .mic-btn:disabled { cursor: not-allowed; transform: none; }

  .analyze-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: var(--radius-sm);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: opacity 0.2s, transform 0.1s;
  }
  .analyze-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .analyze-btn:active:not(:disabled) { transform: translateY(0); }
  .analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .privacy-link {
    background: none; border: none; padding: 0;
    color: var(--text-muted); font-size: 10px;
    font-family: var(--font-mono); letter-spacing: 0.06em;
    cursor: pointer; text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.15s;
  }
  .privacy-link:hover { color: var(--text-secondary); }
  a.privacy-link { text-decoration: underline; }

  .pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    border-radius: 18px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .pill-btn:hover  { transform: translateY(-2px); }
  .pill-btn:active { transform: translateY(0); }

  .pill-kofi {
    background: linear-gradient(135deg, #1a2640, #0f1a30);
    border: 1px solid rgba(114,164,242,0.25);
    color: #72a4f2;
  }
  [data-theme="light"] .pill-kofi {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
    border-color: rgba(114,164,242,0.4);
    color: #2563eb;
  }
  .pill-kofi:hover { box-shadow: 0 6px 20px rgba(114,164,242,0.2); border-color: rgba(114,164,242,0.5); }

  .feedback-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    background: linear-gradient(135deg, #1a3a2a, #0f2a1f);
    border: 1px solid rgba(52,211,153,0.25);
    border-radius: 18px;
    color: #34d399;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  [data-theme="light"] .feedback-btn {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    border-color: rgba(52,211,153,0.4);
    color: #059669;
  }
  .feedback-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52,211,153,0.2);
    border-color: rgba(52,211,153,0.5);
  }
  .feedback-btn:active { transform: translateY(0); }

`;

function getMicVisuals(speech, L, langLabel) {
  if (speech.stopping) {
    return {
      bg: `linear-gradient(135deg, #64748b, #94a3b8)`,
      icon: "⏳",
      labelColor: "var(--text-muted)",
      statusText: "停止処理中…",
      boxShadow: `0 0 16px ${L.accentDark}33, 0 4px 12px rgba(0,0,0,0.3)`,
      opacity: 0.75,
      pulsing: false,
    };
  }
  if (speech.listening) {
    return {
      bg: `linear-gradient(135deg, ${L.accentDark}, ${L.accent})`,
      icon: "⏹",
      labelColor: L.accent,
      statusText: `● 録音中… (${langLabel})`,
      boxShadow: `0 0 40px ${L.accent}55, 0 8px 24px rgba(0,0,0,0.4)`,
      opacity: 1,
      pulsing: true,
    };
  }
  return {
    bg: `linear-gradient(135deg, ${L.accentDark}cc, ${L.accentDark})`,
    icon: "🎙",
    labelColor: "var(--text-ghost)",
    statusText: `タップして${langLabel}で録音`,
    boxShadow: `0 0 16px ${L.accentDark}33, 0 4px 12px rgba(0,0,0,0.3)`,
    opacity: 1,
    pulsing: false,
  };
}

function LangSwitcher({ lang, onSwitch }) {
  return (
    <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
      <div style={{
        display: "flex",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 3,
        gap: 3,
      }}>
        {Object.entries(LANGS).map(([key, val]) => {
          const active = lang === key;
          return (
            <button
              key={key}
              type="button"
              className={`lang-tab${active ? " active" : ""}`}
              onClick={() => onSwitch(key)}
              style={{
                background: active ? val.accentDark : "transparent",
                boxShadow: active ? `0 0 20px ${val.accent}22` : "none",
                borderRadius: "var(--radius-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15 }}>{val.flag}</span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
                  color: active ? "#fff" : "var(--text-ghost)",
                  letterSpacing: "0.08em",
                }}>
                  {val.label}
                </span>
              </div>
              <span className="jp-text" style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.6)" : "var(--text-ghost)" }}>
                {val.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MicSection({ speech, L, micVisuals, onToggle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 0 8px" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {speech.listening && (
          <>
            <div className="ripple-1" style={{
              position: "absolute", width: 80, height: 80, borderRadius: "50%",
              border: `1.5px solid ${L.accent}`,
            }} />
            <div className="ripple-2" style={{
              position: "absolute", width: 80, height: 80, borderRadius: "50%",
              border: `1.5px solid ${L.accent}`,
            }} />
          </>
        )}
        <button
          type="button"
          className="mic-btn"
          onClick={onToggle}
          disabled={!speech.supported || speech.stopping}
          style={{
            width: 72, height: 72, borderRadius: "50%", border: "none",
            background: micVisuals.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, transition: "background 0.25s, box-shadow 0.25s, opacity 0.25s, transform 0.1s",
            boxShadow: micVisuals.boxShadow,
            opacity: micVisuals.opacity,
          }}
        >
          {micVisuals.icon}
        </button>
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em",
        color: micVisuals.labelColor,
        transition: "color 0.3s",
      }} className={micVisuals.pulsing ? "pulsing" : ""}>
        {micVisuals.statusText}
      </div>
    </div>
  );
}

function TranscriptCard({ speech, isEN }) {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div className="section-label" style={{ marginBottom: 8 }}>
        {isEN ? "TRANSCRIPT (EN)" : "TRANSCRIPT (JA)"}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.75, minHeight: 22 }}>
        {speech.input && <span style={{ color: "var(--text-primary)" }}>{speech.input}</span>}
        {speech.interim && <span style={{ color: "var(--text-muted)" }}> {speech.interim}</span>}
        {!speech.input && !speech.interim && (
          <span style={{ color: "var(--text-ghost)" }}>
            {isEN ? "相手の英語がここに表示されます…" : "話した日本語がここに表示されます…"}
          </span>
        )}
      </div>
      {speech.input && (
        <textarea
          value={speech.input}
          onChange={e => speech.setInput(e.target.value)}
          rows={2}
          style={{
            width: "100%", marginTop: 10,
            background: "transparent",
            border: "none",
            borderTop: "1px solid var(--border)",
            paddingTop: 10,
            color: "var(--text-muted)", fontSize: 12, resize: "none",
            lineHeight: 1.65,
          }}
          placeholder="修正はここで編集できます"
        />
      )}
    </div>
  );
}

function ToneBadge({ tone }) {
  if (!tone) return null;
  const t = TONE_META[tone] || TONE_META.neutral;
  return (
    <span className="label-tag" style={{ background: t.bg, color: t.color }}>
      {t.label}
    </span>
  );
}

function ResponseCard({ index, response, L, isEN, copied, onCopy }) {
  return (
    <div className="response-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
              color: L.accent, opacity: 0.5,
            }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className="label-tag"
              style={{
                background: isEN ? "rgba(59,130,246,0.08)" : "rgba(139,92,246,0.08)",
                color: L.accent,
              }}
            >
              {response.label}
            </span>
          </div>
          <div style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.55, marginBottom: 5 }}>
            {response.english}
          </div>
          <div className="jp-text" style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.65 }}>
            {response.japanese}
          </div>
        </div>
        <button
          type="button"
          className={`copy-btn${copied ? " copied" : ""}`}
          onClick={onCopy}
        >
          {copied ? "✓ done" : "copy"}
        </button>
      </div>
    </div>
  );
}

function ResultPanel({ result, isEN, L, copied, onCopy, onReset }) {
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Nuance */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span className="section-label">{isEN ? "NUANCE" : "INTENT CHECK"}</span>
          <ToneBadge tone={result.tone} />
        </div>
        <div className="card jp-text" style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.85 }}>
          {result.nuance}
        </div>
      </div>

      {/* Responses */}
      <div>
        <div className="section-label" style={{ marginBottom: 8 }}>
          {isEN ? "RESPONSE OPTIONS" : "ENGLISH PHRASES"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.responses?.map((r, i) => (
            <ResponseCard
              key={`${i}-${r.english}`}
              index={i}
              response={r}
              L={L}
              isEN={isEN}
              copied={copied === i}
              onCopy={() => onCopy(r.english, i)}
            />
          ))}
        </div>
      </div>

      <button type="button" className="reset-btn" onClick={onReset}>
        ← 新しい録音を始める
      </button>
    </div>
  );
}

export default function ConversationAssistant() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const isDark = theme === "dark";
  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const triggerAnalyze = useCallback(async (text, currentLang) => {
    if (!text || loadingRef.current) return;
    setLoading(true);
    setAnalyzeError(null);
    speech.setError(null);
    setResult(null);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 1000,
          system: PROMPTS[currentLang],
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
      setResult(JSON.parse(cleaned));
    } catch {
      setAnalyzeError("解析に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }, []);

  const speech = useSpeechRecognition({
    lang,
    langCode: LANGS[lang].code,
    autoAnalyze,
    onAutoAnalyze: triggerAnalyze,
  });

  const switchLang = (l) => {
    speech.stopForReconfigure();
    setLang(l);
    speech.resetInput();
    setResult(null);
    setAnalyzeError(null);
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  const L = LANGS[lang];
  const isEN = lang === "en";
  const langLabel = isEN ? "英語" : "日本語";
  const displayError = speech.error || analyzeError;
  const micVisuals = getMicVisuals(speech, L, langLabel);

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", transition: "background 0.25s, color 0.25s" }}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{
        padding: "0 16px",
        height: 48,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: `linear-gradient(135deg, ${L.accentDark}, ${L.accent})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, transition: "background 0.3s",
          }}>
            💬
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            CONV ASSIST
          </span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: "var(--radius-sm)",
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", transition: "all 0.2s",
            }}
            title={isDark ? "ライトモードに切替" : "ダークモードに切替"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          <span style={{ fontSize: 11, color: "var(--text-ghost)", fontFamily: "var(--font-mono)" }}>自動解析</span>
          <button
            type="button"
            className="toggle-track"
            onClick={() => { speech.stopForReconfigure(); setAutoAnalyze(v => !v); }}
            aria-pressed={autoAnalyze}
            aria-label="自動解析"
            style={{ background: autoAnalyze ? L.accentDark : "var(--surface-3)" }}
          >
            <div className="toggle-thumb" style={{ left: autoAnalyze ? 19 : 3 }} />
          </button>
        </div>
      </header>

      {/* Lang switcher */}
      <LangSwitcher lang={lang} onSwitch={switchLang} />

      {/* Main scroll area */}
      <main style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {!speech.supported && (
          <div className="jp-text" style={{
            padding: "10px 14px", borderRadius: "var(--radius-sm)",
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            fontSize: 12, color: "#f87171",
          }}>
            ⚠ Chrome / Edge のみ音声入力に対応しています
          </div>
        )}

        <MicSection
          speech={speech}
          L={L}
          micVisuals={micVisuals}
          onToggle={() => speech.toggleListen(() => { setResult(null); setAnalyzeError(null); })}
        />

        <TranscriptCard speech={speech} isEN={isEN} />

        {/* Manual analyze button */}
        {speech.input && !autoAnalyze && (
          <button
            type="button"
            className="analyze-btn"
            onClick={() => triggerAnalyze(speech.input.trim(), lang)}
            disabled={loading}
            style={{ background: `linear-gradient(135deg, ${L.accentDark}, ${L.accent})` }}
          >
            解析する →
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: L.accent, fontSize: 13, padding: "2px 0" }}>
            <div
              className="spinning"
              style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `1.5px solid var(--surface-3)`,
                borderTopColor: L.accent,
              }}
            />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em" }}>解析中…</span>
          </div>
        )}

        {/* Error */}
        {displayError && (
          <div className="jp-text" style={{ color: "#f87171", fontSize: 13, padding: "2px 0" }}>{displayError}</div>
        )}

        {/* Result */}
        {result && !loading && (
          <ResultPanel
            result={result}
            isEN={isEN}
            L={L}
            copied={copied}
            onCopy={copyText}
            onReset={() => { speech.resetInput(); setResult(null); }}
          />
        )}

        {/* Empty state */}
        {!result && !loading && !speech.input && (
          <div style={{
            textAlign: "center", padding: "24px 0",
            color: "var(--text-ghost)", fontSize: 11,
            fontFamily: "var(--font-mono)", lineHeight: 2.4, letterSpacing: "0.04em",
          }}>
            {isEN
              ? "EN モード：相手の英語 → ニュアンス解説 + 日本語返答案"
              : "JA モード：自分の日本語 → 自然な英語フレーズ 3 案"}
          </div>
        )}

      </main>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, padding: "8px 16px 0" }}>
        <a href="https://ko-fi.com/A0A01ZHER8" target="_blank" rel="noreferrer" className="pill-btn pill-kofi">
          <span style={{ fontSize: 14 }}>☕</span>{" "}
          コーヒーを奢る
        </a>
        <a
          href="https://forms.gle/HnVKmXMkcKgUWD7U6"
          target="_blank"
          rel="noreferrer"
          className="feedback-btn"
        >
          <span style={{ fontSize: 14 }}>💬</span>{" "}
          感想を教えてください
        </a>
      </div>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-ghost)", letterSpacing: "0.08em" }}>
          © {new Date().getFullYear()} kai
        </span>
        <span style={{ color: "var(--border)", fontSize: 10 }}>|</span>
        <Link to="/about" className="privacy-link">運営者情報</Link>
        <span style={{ color: "var(--border)", fontSize: 10 }}>|</span>
        <Link to="/terms" className="privacy-link">利用規約</Link>
        <span style={{ color: "var(--border)", fontSize: 10 }}>|</span>
        <Link to="/privacy" className="privacy-link">プライバシーポリシー</Link>
        <span style={{ color: "var(--border)", fontSize: 10 }}>|</span>
        <Link to="/commercial" className="privacy-link">特定商取引法に基づく表記</Link>
      </footer>

    </div>
  );
}
