import LegalPage from "./LegalPage.jsx";

export default function About() {
  return (
    <LegalPage title="ABOUT">
      <h2>サイト名</h2>
      <p>Conv Assist</p>

      <h2>運営者</h2>
      <p>iwtkai</p>

      <h2>サービス概要</h2>
      <p>Conv Assist は、英会話をリアルタイムでサポートするWebアプリです。相手の英語を聞き取って返答案を提示する「ENモード」と、自分の日本語を自然な英語に変換する「JAモード」を備えています。</p>
      <p>AI（Claude）を活用して、ニュアンス解説・トーン別フレーズ提案を即時に行います。</p>

      <h2>お問い合わせ</h2>
      <p>ご意見・ご要望・不具合報告は<a href="https://forms.gle/HnVKmXMkcKgUWD7U6" target="_blank" rel="noreferrer">お問い合わせフォーム</a>よりご連絡ください。</p>
    </LegalPage>
  );
}
