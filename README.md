# Lexical Text Editor

一個基於 Lexical 的輕量級 React 富文本編輯器套件。

> ⚠️ **開發中警告**
> 此專案目前仍在積極開發中，API 可能會有變動，不建議用於正式環境。

## 安裝

```bash
npm install lexical-text-editor
```

## 使用方式

### 基本使用

```tsx
import { LexicalEditor } from "lexical-text-editor";
import type { LexicalEditorRef } from "lexical-text-editor";
import { useRef } from "react";

function App() {
  const editorRef = useRef<LexicalEditorRef>(null);

  const handleSave = () => {
    if (editorRef.current) {
      const json = editorRef.current.getJSON();
      const text = editorRef.current.getText();
      console.log("JSON 格式:", json);
      console.log("純文字:", text);
    }
  };

  return (
    <div>
      <LexicalEditor ref={editorRef} placeholder="開始輸入..." />
      <button onClick={handleSave}>儲存內容</button>
    </div>
  );
}
```

### 載入已儲存的內容

```tsx
import { LexicalEditor } from "lexical-text-editor";

function App() {
  const savedContent = '{"root":{"children":[...]}}'; // 之前儲存的 JSON

  return <LexicalEditor initialContent={savedContent} />;
}
```

## Props

| 參數             | 類型       | 預設值          | 說明                          |
| ---------------- | ---------- | --------------- | ----------------------------- |
| `placeholder`    | `string`   | `'開始輸入...'` | 編輯器佔位文字                |
| `initialContent` | `string`   | -               | 初始內容 (JSON 格式)          |
| `customIcons`    | `IconSet`  | -               | 自訂工具列圖示                |
| `ref`            | `React.Ref`| -               | 用於存取編輯器方法的 ref 物件 |

## Ref 方法

透過 `ref` 可以存取以下方法:

| 方法                      | 回傳值   | 說明                         |
| ------------------------- | -------- | ---------------------------- |
| `getJSON()`               | `string` | 取得編輯器內容的 JSON 字串   |
| `getText()`               | `string` | 取得編輯器的純文字內容       |
| `setContent(json: string)`| `void`   | 設定編輯器內容 (JSON 格式)   |

## 開發

```bash
# 安裝依賴
npm install

# 打包套件
npm run build

# 執行範例
npm run dev:example
```

## License

MIT
