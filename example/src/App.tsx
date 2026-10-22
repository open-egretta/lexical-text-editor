import { useRef, useState } from "react";
import {
  LexicalEditor,
  LexicalEditorRef,
  zhTW,
} from "@open-egretta/lexical-text-editor";
import "@open-egretta/lexical-text-editor/style.css";

// 測試用的範例 JSON（包含粗體文字）
const sampleJson =
  '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"這是粗體文字","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"這是一般文字","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';

const sampleHTML =
  "頂層行內文字 <u>底線</u><h2>HTML 標題</h2><p>一段 <b>粗體</b> 與 <i>斜體</i>、<s>刪除線</s>、<code>inline</code>、<a href=\"https://lexical.dev\">連結</a></p><ul><li>項目一</li><li>項目二</li></ul>" +
  "<pre><code>const a = 1;</code></pre>" +
  "<table><tr><th>欄 A</th><th>欄 B</th></tr><tr><td>1</td><td>2</td></tr></table>" +
  '<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" alt="範例圖片" width="40" height="40"></p>';

const panelStyle = {
  marginTop: "12px",
  padding: "10px",
  background: "#f0f0f0",
  borderRadius: "4px",
};

const buttonRowStyle = {
  marginTop: "12px",
  display: "flex",
  gap: "10px",
  flexWrap: "wrap" as const,
};

function UncontrolledDemo() {
  const editorRef = useRef<LexicalEditorRef>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [output, setOutput] = useState("");
  const [savedJSON, setSavedJSON] = useState("");

  return (
    <section>
      <h2>非受控模式（defaultValue + ref）</h2>

      <LexicalEditor
        ref={editorRef}
        defaultValue={sampleJson}
        onChange={() => setChangeCount((c) => c + 1)}
        locale={zhTW}
        placeholder="輸入一些內容..."
      />

      <div style={buttonRowStyle}>
        <button onClick={() => setOutput(editorRef.current?.getJSON() ?? "")}>
          getJSON()
        </button>
        <button onClick={() => setOutput(editorRef.current?.getHTML() ?? "")}>
          getHTML()
        </button>
        <button onClick={() => setOutput(editorRef.current?.getText() ?? "")}>
          getText()
        </button>
        <button onClick={() => editorRef.current?.setContent(sampleJson)}>
          setContent(範例 JSON)
        </button>
        <button onClick={() => editorRef.current?.setHTML(sampleHTML)}>
          setHTML(範例 HTML)
        </button>
        <button
          onClick={() => setSavedJSON(editorRef.current?.getJSON() ?? "")}
        >
          儲存 JSON
        </button>
        <button
          onClick={() => editorRef.current?.setContent(savedJSON)}
          disabled={!savedJSON}
        >
          載入儲存的 JSON
        </button>
        <button onClick={() => editorRef.current?.clear()}>clear()</button>
        <button onClick={() => editorRef.current?.focus()}>focus()</button>
      </div>

      <div style={panelStyle}>
        <div data-testid="change-count">onChange 次數：{changeCount}</div>
        {output && (
          <pre
            data-testid="output"
            style={{ fontSize: "12px", overflow: "auto", whiteSpace: "pre-wrap" }}
          >
            {output}
          </pre>
        )}
      </div>
    </section>
  );
}

function ControlledDemo() {
  const [value, setValue] = useState(sampleJson);

  return (
    <section>
      <h2>受控模式（value + onChange，預設英文介面）</h2>

      <LexicalEditor value={value} onChange={(json) => setValue(json)} />

      <div style={buttonRowStyle}>
        <button onClick={() => setValue(sampleJson)}>重設為範例</button>
        <button onClick={() => setValue("")}>清空（value = ""）</button>
      </div>

      <div style={panelStyle}>
        <strong>目前 value：</strong>
        <pre
          data-testid="controlled-value"
          style={{ fontSize: "12px", overflow: "auto", whiteSpace: "pre-wrap" }}
        >
          {value}
        </pre>
      </div>
    </section>
  );
}

function LocaleOverrideDemo() {
  return (
    <section data-testid="locale-override">
      <h2>局部覆寫語系（zhTW + bold: "加粗"）</h2>
      <LexicalEditor locale={{ ...zhTW, bold: "加粗" }} />
    </section>
  );
}

function App() {
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Lexical Editor 測試</h1>
      <UncontrolledDemo />
      <ControlledDemo />
      <LocaleOverrideDemo />
    </div>
  );
}

export default App;
