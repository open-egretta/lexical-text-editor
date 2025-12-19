import { useRef, useState } from "react";
import { LexicalEditor, LexicalEditorRef } from "lexical-text-editor";
import "lexical-text-editor/style.css";

function App() {
  const editorRef = useRef<LexicalEditorRef>(null);
  const [savedContent, setSavedContent] = useState<string>("");

  const handleSave = () => {
    const json = editorRef.current?.getJSON();
    const text = editorRef.current?.getText();

    if (json) {
      setSavedContent(json);
      console.log("✅ 已儲存");
      console.log("JSON:", json);
      console.log("Text:", text);
      alert("內容已儲存！查看 Console");
    }
  };

  const handleLoad = () => {
    if (savedContent) {
      editorRef.current?.setContent(savedContent);
      alert("✅ 內容已載入！");
    } else {
      alert("⚠️ 沒有已儲存的內容");
    }
  };

  const handleLoadSample = () => {
    // 測試用的範例 JSON（包含粗體文字）
    const sampleJson =
      '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"這是粗體文字","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"這是一般文字","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

    editorRef.current?.setContent(sampleJson);
    alert("✅ 範例內容已載入！");
  };

  const handleClear = () => {
    const emptyJson =
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';
    editorRef.current?.setContent(emptyJson);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Lexical Editor 測試</h1>

      <LexicalEditor
        ref={editorRef}
        placeholder="輸入一些內容，然後測試儲存/載入..."
      />

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={handleSave}>💾 儲存內容</button>

        <button onClick={handleLoad} disabled={!savedContent}>
          📂 載入已儲存的內容
        </button>

        <button onClick={handleLoadSample}>📄 載入範例內容</button>

        <button onClick={handleClear}>🗑️ 清空</button>
      </div>

      {savedContent && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <strong>已儲存的內容：</strong>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {savedContent}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
