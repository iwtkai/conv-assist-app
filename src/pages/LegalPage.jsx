import { useNavigate } from "react-router-dom";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #040711;
    --surface: #080f1e;
    --surface-2: #0d1628;
    --border: rgba(255,255,255,0.10);
    --text-primary: #f1f5f9;
    --text-secondary: #b8c5d6;
    --text-muted: #7a8fa8;
    --font-mono: 'JetBrains Mono', monospace;
    --radius-sm: 8px;
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text-primary);
    font-family: 'Inter', 'Hiragino Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .legal-body h2 {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 24px 0 8px;
  }
  .legal-body p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.85;
    margin-bottom: 4px;
  }
  .legal-body a {
    color: var(--text-secondary);
  }
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.2s;
  }
  .back-btn:hover {
    border-color: rgba(255,255,255,0.2);
    color: var(--text-secondary);
  }
`;

export default function LegalPage({ title, children }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      <header style={{
        height: 48, padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 12,
        flexShrink: 0,
      }}>
        <button className="back-btn" onClick={() => navigate("/")}>
          ← 戻る
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          {title}
        </span>
      </header>

      <main style={{ flex: 1, overflowY: "auto", padding: "0 20px 48px", maxWidth: 640, width: "100%", margin: "0 auto" }}>
        <div className="legal-body">
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 24, marginBottom: 8 }}>
            最終更新：{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
