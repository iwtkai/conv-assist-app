import { useState, useRef, useEffect, useCallback } from "react";

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

const toneColor = { casual: "#4ade80", neutral: "#60a5fa", formal: "#f59e0b" };
const toneLabel = { casual: "カジュアル", neutral: "ニュートラル", formal: "フォーマル" };

const LANGS = {
  en: { code: "en-US", label: "EN", sublabel: "相手の英語を聞き取る", flag: "🇺🇸" },
  ja: { code: "ja-JP", label: "JA", sublabel: "自分の日本語を英訳する", flag: "🇯🇵" },
};

export default function ConversationAssistant() {
  const [lang, setLang] = useState("en");
  const [input, setInput] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [supported, setSupported] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const langRef = useRef(lang);
  const loadingRef = useRef(loading);

  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const triggerAnalyze = useCallback(async (text, currentLang) => {
    if (!text || loadingRef.current) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: PROMPTS[currentLang],
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      setResult(JSON.parse(raw));
    } catch {
      setError("解析に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.lang = LANGS[lang].code;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      if (finalText) {
        setInput(prev => {
          const updated = (prev + " " + finalText).trim();
          if (autoAnalyze) {
            if (silenceTimer.current) clearTimeout(silenceTimer.current);
            silenceTimer.current = setTimeout(() => {
              triggerAnalyze(updated, langRef.current);
            }, 2000);
          }
          return updated;
        });
        setInterim("");
      } else {
        setInterim(interimText);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== "no-speech") setError("マイクエラー: " + e.error);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;

    return () => { rec.stop(); if (silenceTimer.current) clearTimeout(silenceTimer.current); };
  }, [lang, autoAnalyze, triggerAnalyze]);

  const toggleListen = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop(); setListening(false); setInterim("");
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    } else {
      setInput(""); setResult(null); setError(null); setInterim("");
      rec.start(); setListening(true);
    }
  };

  const switchLang = (l) => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); setInterim(""); }
    setLang(l);
    setInput(""); setResult(null); setError(null);
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx); setTimeout(() => setCopied(null), 1500);
  };

  const isEN = lang === "en";

  return (
    <div style={{
      minHeight: "100vh", background: "#080b12", color: "#e2e8f0",
      fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 2px; }
        textarea:focus { outline: none; }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.4);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-in { animation: fadeSlide 0.3s ease forwards; }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
        .spin { animation: spin 1s linear infinite; }
        .mic-ring { animation: ripple 1.8s ease-out infinite; }
        .mic-ring-2 { animation: ripple 1.8s ease-out 0.6s infinite; }
        .rc:hover { background: #111826 !important; }
        .copy-btn:hover { color: #94a3b8 !important; }
        .lang-btn { transition: all 0.2s; }
        .lang-btn:hover { opacity: 0.85; }
        .reset-btn:hover { color: #64748b !important; border-color: #334155 !important; }
      `}</style>

      <div style={{ padding: "13px 18px", borderBottom: "1px solid #10172a", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade8088" }} />
        <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#3a4a60", letterSpacing: "0.12em" }}>CONV ASSIST</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#2d3d52", fontFamily: "'DM Mono'" }}>自動解析</span>
          <div onClick={() => setAutoAnalyze(v => !v)} style={{
            width: 32, height: 17, borderRadius: 9,
            background: autoAnalyze ? "#1d4ed8" : "#1a2235",
            cursor: "pointer", position: "relative", transition: "background 0.2s",
          }}>
            <div style={{
              position: "absolute", top: 2, left: autoAnalyze ? 17 : 2,
              width: 13, height: 13, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s",
            }} />
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 18px 0" }}>
        <div style={{ display: "flex", background: "#0d1220", border: "1px solid #1a2540", borderRadius: 10, padding: 4, gap: 4 }}>
          {Object.entries(LANGS).map(([key, val]) => {
            const active = lang === key;
            const accent = key === "en" ? "#1d4ed8" : "#7c3aed";
            return (
              <button key={key} className="lang-btn" onClick={() => switchLang(key)}
                style={{
                  flex: 1, padding: "10px 8px", borderRadius: 7, border: "none",
                  background: active ? accent : "transparent",
                  cursor: "pointer", transition: "all 0.2s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  boxShadow: active ? `0 0 16px ${accent}44` : "none",
                }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{val.flag}</span>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 13, fontWeight: 600, color: active ? "#fff" : "#3a4a60", letterSpacing: "0.08em" }}>{val.label}</span>
                </div>
                <span style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.7)" : "#2d3a4d" }}>{val.sublabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "18px", gap: 18, overflowY: "auto" }}>
        {!supported && (
          <div style={{ fontSize: 12, color: "#f87171", background: "#2d1515", padding: "8px 14px", borderRadius: 6 }}>
            ⚠ Chrome / Edge のみ音声入力に対応しています
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "8px 0" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {listening && (
              <>
                <div className="mic-ring" style={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", border: `2px solid ${isEN ? "#3b82f6" : "#8b5cf6"}` }} />
                <div className="mic-ring-2" style={{ position: "absolute", width: 70, height: 70, borderRadius: "50%", border: `2px solid ${isEN ? "#3b82f6" : "#8b5cf6"}` }} />
              </>
            )}
            <button onClick={toggleListen} disabled={!supported}
              style={{
                width: 66, height: 66, borderRadius: "50%", border: "none",
                background: listening ? (isEN ? "#2563eb" : "#7c3aed") : (isEN ? "#1d4ed8" : "#6d28d9"),
                cursor: supported ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, transition: "all 0.2s",
                boxShadow: listening ? `0 0 28px ${isEN ? "#3b82f688" : "#8b5cf688"}` : `0 0 14px ${isEN ? "#1d4ed844" : "#6d28d944"}`,
              }}>
              {listening ? "⏹" : "🎙"}
            </button>
          </div>
          <div style={{ fontSize: 12, fontFamily: "'DM Mono'", letterSpacing: "0.08em", color: listening ? (isEN ? "#60a5fa" : "#a78bfa") : "#2d3a4d" }}
            className={listening ? "pulse" : ""}>
            {listening ? `● 録音中… (${isEN ? "英語" : "日本語"})` : `タップして${isEN ? "英語" : "日本語"}で録音`}
          </div>
        </div>

        <div style={{ background: "#0d1220", border: "1px solid #141f35", borderRadius: 10, padding: "12px 14px", minHeight: 64 }}>
          <div style={{ fontSize: 10, color: "#2d3a4d", letterSpacing: "0.12em", marginBottom: 6, fontFamily: "'DM Mono'" }}>
            {isEN ? "TRANSCRIPT (EN)" : "TRANSCRIPT (JA)"}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, minHeight: 24 }}>
            <span style={{ color: "#cbd5e1" }}>{input}</span>
            {interim && <span style={{ color: "#334155" }}> {interim}</span>}
            {!input && !interim && <span style={{ color: "#1a2535" }}>{isEN ? "相手の英語がここに表示されます…" : "話した日本語がここに表示されます…"}</span>}
          </div>
          {input && (
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={2}
              style={{
                width: "100%", marginTop: 8, background: "transparent",
                border: "none", borderTop: "1px solid #141f35", paddingTop: 8,
                color: "#64748b", fontSize: 12, resize: "none",
                fontFamily: "'DM Sans', 'Hiragino Sans', sans-serif", lineHeight: 1.6,
              }}
              placeholder="修正はここで編集できます" />
          )}
        </div>

        {input && !autoAnalyze && (
          <button onClick={() => triggerAnalyze(input.trim(), lang)} disabled={loading}
            style={{
              width: "100%", padding: "11px", background: isEN ? "#1d4ed8" : "#6d28d9",
              border: "none", borderRadius: 8, color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}>
            解析する →
          </button>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: isEN ? "#3b82f6" : "#8b5cf6", fontSize: 13 }}>
            <div className="spin" style={{ width: 15, height: 15, border: "2px solid #1a2235", borderTopColor: isEN ? "#3b82f6" : "#8b5cf6", borderRadius: "50%" }} />
            解析中…
          </div>
        )}

        {error && <div style={{ color: "#f87171", fontSize: 13 }}>{error}</div>}

        {result && !loading && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#3a4a60", letterSpacing: "0.12em", fontFamily: "'DM Mono'" }}>
                  {isEN ? "NUANCE" : "INTENT CHECK"}
                </span>
                {result.tone && (
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: toneColor[result.tone] + "18", color: toneColor[result.tone], fontFamily: "'DM Mono'", border: `1px solid ${toneColor[result.tone]}28` }}>
                    {toneLabel[result.tone]}
                  </span>
                )}
              </div>
              <div style={{ background: "#0d1220", border: "1px solid #141f35", borderRadius: 8, padding: "11px 13px", fontSize: 13, color: "#7a8fa8", lineHeight: 1.8 }}>
                {result.nuance}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "#3a4a60", letterSpacing: "0.12em", marginBottom: 8, fontFamily: "'DM Mono'" }}>
                {isEN ? "RESPONSE OPTIONS" : "ENGLISH PHRASES"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.responses?.map((r, i) => (
                  <div key={i} className="rc" style={{
                    background: "#0d1220", border: "1px solid #141f35",
                    borderLeft: `3px solid ${isEN ? "#1d4ed8" : "#6d28d9"}`,
                    borderRadius: 8, padding: "11px 13px", transition: "background 0.15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: isEN ? "#0f2040" : "#1a0d35", color: isEN ? "#3b82f6" : "#8b5cf6", fontFamily: "'DM Mono'" }}>{r.label}</span>
                        <div style={{ fontSize: 15, color: "#e2e8f0", margin: "7px 0 4px", fontWeight: 500, lineHeight: 1.5 }}>{r.english}</div>
                        <div style={{ fontSize: 12, color: "#3d4f65", lineHeight: 1.6 }}>{r.japanese}</div>
                      </div>
                      <button className="copy-btn" onClick={() => copyText(r.english, i)}
                        style={{
                          background: "transparent", border: "1px solid #141f35", borderRadius: 5,
                          padding: "4px 9px", cursor: "pointer", fontSize: 11,
                          color: copied === i ? "#4ade80" : "#2d3a4d",
                          fontFamily: "'DM Mono'", flexShrink: 0, transition: "all 0.15s",
                        }}>
                        {copied === i ? "✓" : "copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="reset-btn" onClick={() => { setInput(""); setResult(null); setError(null); }}
              style={{
                background: "transparent", border: "1px solid #141f35", borderRadius: 6,
                padding: "9px", color: "#2d3a4d", fontSize: 11,
                cursor: "pointer", fontFamily: "'DM Mono'", letterSpacing: "0.06em", transition: "all 0.2s",
              }}>
              ← 新しい録音を始める
            </button>
          </div>
        )}

        {!result && !loading && !input && (
          <div style={{ textAlign: "center", color: "#1a2535", fontSize: 11, lineHeight: 2.2, fontFamily: "'DM Mono'" }}>
            {isEN ? "🇺🇸 EN モード：相手の英語 → ニュアンス解説 + 日本語返答案" : "🇯🇵 JA モード：自分の日本語 → 自然な英語フレーズ3案"}
          </div>
        )}
      </div>
    </div>
  );
}
