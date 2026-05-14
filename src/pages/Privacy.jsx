import LegalPage from "./LegalPage.jsx";

export default function Privacy() {
  return (
    <LegalPage title="PRIVACY POLICY">
      <h2>収集する情報</h2>
      <p>本アプリは以下の情報を処理します。</p>
      <p>・<b>音声・テキスト入力</b>：マイクから取得した音声はブラウザ上でテキストに変換され、AI解析のために送信されます。音声データ自体は保存されません。</p>
      <p>・<b>テーマ設定</b>：ライト / ダークモードの選択をブラウザの localStorage に保存します。</p>

      <h2>第三者サービス</h2>
      <p>・<b>Anthropic Claude API</b>：入力テキストをニュアンス解析・返答生成のために送信します。Anthropic のプライバシーポリシーが適用されます。</p>
      <p>・<b>Cloudflare Workers</b>：API キーを保護するためのプロキシとして使用します。テキストはプロキシを経由しますが、保存はされません。</p>

      <h2>データの保存</h2>
      <p>サーバー側でのユーザーデータの保存は行いません。セッション内のテキストはページを閉じると消去されます。</p>

      <h2>マイクの使用</h2>
      <p>音声入力はユーザーが録音ボタンを押した場合のみ有効になります。ブラウザのマイク権限設定からいつでも取り消せます。</p>

      <h2>お問い合わせ</h2>
      <p>ご不明な点は<a href="https://forms.gle/HnVKmXMkcKgUWD7U6" target="_blank" rel="noreferrer">お問い合わせフォーム</a>よりご連絡ください。</p>
    </LegalPage>
  );
}
