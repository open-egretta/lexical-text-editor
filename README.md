# Lexical Text Editor

一個基於 Lexical 的輕量級 React 富文本編輯器套件。

> ⚠️ **開發中警告**
> 此專案目前仍在積極開發中，API 可能會有變動，不建議用於正式環境。

## 安裝

Lexical 相關套件為 `peerDependencies`，需與本套件一起安裝，確保專案中只有一份 Lexical：

```bash
npm install @open-egretta/lexical-text-editor lexical @lexical/react @lexical/html @lexical/rich-text @lexical/list @lexical/link @lexical/code @lexical/table @lexical/markdown @lexical/selection @lexical/utils
```

需要 React 18 或 19。本套件只提供 ESM 格式。

記得引入樣式：

```tsx
import "@open-egretta/lexical-text-editor/style.css";
```

## 功能

- 段落、標題（H1–H3）、引用、程式碼區塊
- 粗體、斜體、底線、刪除線、行內程式碼
- 連結：工具列插入／移除，輸入網址或 email 自動轉成連結，按住 Cmd/Ctrl 點擊開啟
- 項目列表、編號列表（Tab / Shift+Tab 調整縮排）
- 對齊：左、中、右、兩端
- 表格：插入 3×3 表格（含標題列），可插入／刪除列與欄，Tab 切換儲存格
- 圖片：以網址插入，點擊選取後按 Backspace / Delete 刪除
- 復原／重做
- Markdown 快捷輸入（見下表）
- 內容可輸出／載入為 Lexical JSON 或 HTML

### Markdown 快捷輸入

| 輸入                    | 結果         |
| ----------------------- | ------------ |
| `# ` / `## ` / `### `   | 標題 1–3     |
| `> `                    | 引用         |
| `- ` / `* `             | 項目列表     |
| `1. `                   | 編號列表     |
| ```` ``` ````（加空白） | 程式碼區塊   |
| `**粗體**`              | **粗體**     |
| `*斜體*`                | *斜體*       |
| `~~刪除線~~`            | ~~刪除線~~   |
| `` `程式碼` ``          | `程式碼`     |
| `[文字](網址)`          | 連結         |
| `![替代文字](網址)`     | 圖片         |

連結與圖片只接受 `http`、`https`（連結另可用 `mailto`、`tel`；圖片另可用 `data:image/*`）與相對路徑，`javascript:` 等協定會被拒絕。

## 使用方式

### 基本使用

```tsx
import { LexicalEditor } from "@open-egretta/lexical-text-editor";
import type { LexicalEditorRef } from "@open-egretta/lexical-text-editor";
import "@open-egretta/lexical-text-editor/style.css";
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

### 非受控模式：載入已儲存的內容

```tsx
import { LexicalEditor } from "@open-egretta/lexical-text-editor";

function App() {
  const savedContent = '{"root":{"children":[...]}}'; // 之前儲存的 JSON

  return (
    <LexicalEditor
      defaultValue={savedContent}
      onChange={(json) => localStorage.setItem("draft", json)}
    />
  );
}
```

`defaultValue` 只在 mount 時生效，之後請透過 ref 方法更新內容。

### 受控模式

```tsx
import { useState } from "react";
import { LexicalEditor } from "@open-egretta/lexical-text-editor";

function App() {
  const [value, setValue] = useState("");

  return (
    <>
      <LexicalEditor value={value} onChange={setValue} />
      <button onClick={() => setValue("")}>清空</button>
    </>
  );
}
```

- `value` 改變時，若與編輯器目前內容不同，會以新的 `value` 取代內容；`value=""` 代表清空。
- 由 `value` 同步進來的內容不會再觸發 `onChange`。
- `onChange` 只在內容變動時觸發，單純移動游標或選取不會觸發。
- 編輯器不會把內容回滾成舊的 `value`：如果 `onChange` 沒有更新 `value`，編輯器仍會保留使用者的輸入。

## Props

| 參數             | 類型                                       | 預設值          | 說明                                          |
| ---------------- | ------------------------------------------ | --------------- | --------------------------------------------- |
| `value`          | `string`                                   | -               | 受控模式的內容（Lexical JSON），`""` 代表清空 |
| `defaultValue`   | `string`                                   | -               | 非受控模式的初始內容（Lexical JSON）          |
| `onChange`       | `(json: string, editor: LexicalEditor) => void` | -          | 內容變動時觸發                                |
| `locale`         | `Partial<EditorLocale>`                    | `en`            | 介面語系，見「多語系」                        |
| `placeholder`    | `string`                                   | 依 `locale`     | 編輯器佔位文字，優先於 `locale.placeholder`   |
| `customIcons`    | `IconSet`                                  | -               | 自訂工具列圖示                                |
| `initialContent` | `string`                                   | -               | 已棄用，請改用 `defaultValue`                 |
| `ref`            | `React.Ref<LexicalEditorRef>`              | -               | 用於存取編輯器方法的 ref 物件                 |

## Ref 方法

透過 `ref` 可以存取以下方法:

| 方法                       | 回傳值   | 說明                                     |
| -------------------------- | -------- | ---------------------------------------- |
| `getJSON()`                | `string` | 取得編輯器內容的 JSON 字串               |
| `getText()`                | `string` | 取得編輯器的純文字內容                   |
| `getHTML()`                | `string` | 取得編輯器內容的 HTML                    |
| `setContent(json: string)` | `void`   | 以 Lexical JSON 取代內容                 |
| `setHTML(html: string)`    | `void`   | 以 HTML 取代內容                         |
| `clear()`                  | `void`   | 清空內容                                 |
| `focus()`                  | `void`   | 讓編輯器取得焦點                         |

透過 ref 修改內容（`setContent`、`setHTML`、`clear`）會觸發 `onChange`。

## 多語系

介面文字預設為英文，內建 `en` 與 `zhTW`：

```tsx
import { LexicalEditor, zhTW } from "@open-egretta/lexical-text-editor";

<LexicalEditor locale={zhTW} />;
```

只想改幾個字時，展開內建語系再覆寫：

```tsx
<LexicalEditor locale={{ ...zhTW, bold: "加粗" }} />
```

也可以自行建立其他語系。缺少的 key 會以英文補齊，完整的 key 請參考 `EditorLocale` 型別：

```tsx
import type { EditorLocale } from "@open-egretta/lexical-text-editor";

const ja: Partial<EditorLocale> = {
  placeholder: "入力してください...",
  bold: "太字",
  italic: "斜体",
  // ...
};
```

- 語系物件只放文字，不含快捷鍵；工具列提示會依平台自動顯示快捷鍵，例如 macOS 顯示 `粗體 (⌘B)`、其他平台顯示 `粗體 (Ctrl+B)`。
- 編輯器不會自動偵測瀏覽器語言，請由你的 app 決定傳入哪個語系。
- 只有用到的語系會被打包。

## 進階：在其他地方解析相同的 JSON

套件匯出編輯器使用的 node 與 Markdown 轉換規則，可用於伺服器端（`@lexical/headless`）或其他 Lexical 編輯器：

```ts
import { editorNodes, MARKDOWN_TRANSFORMERS } from "@open-egretta/lexical-text-editor";
import { createHeadlessEditor } from "@lexical/headless";
import { $convertToMarkdownString } from "@lexical/markdown";

const editor = createHeadlessEditor({ nodes: [...editorNodes] });
editor.setEditorState(editor.parseEditorState(json));
const markdown = editor.read(() => $convertToMarkdownString(MARKDOWN_TRANSFORMERS));
```

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
