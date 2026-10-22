# Changelog

本專案遵循[語意化版本](https://semver.org/lang/zh-TW/)。1.0.0 之前，minor 版本（0.x.0）可能包含破壞性變更。

## 0.1.0 - 2026-10-22

### 破壞性變更

- **只提供 ESM**：不再輸出 CommonJS，`require()` 無法載入。Vite、Next.js、webpack 5 等打包工具不受影響。
- **Lexical 改為 peerDependencies**：需在專案中自行安裝 Lexical，確保整個專案只有一份 Lexical：

  ```bash
  npm install @open-egretta/lexical-text-editor lexical @lexical/react @lexical/html @lexical/rich-text @lexical/list @lexical/link @lexical/code @lexical/table @lexical/markdown @lexical/selection @lexical/utils
  ```

- **需要 Lexical 0.52**：peer 版本範圍為 `^0.52.0`。
- **預設介面改為英文**：原本寫死的中文介面，現在需傳入 `locale={zhTW}`：

  ```tsx
  import { LexicalEditor, zhTW } from "@open-egretta/lexical-text-editor";

  <LexicalEditor locale={zhTW} />;
  ```

- **`placeholder` 預設值**改為依語系決定（英文為 `Start typing...`）。

### 新增

- 受控／非受控模式：`value`、`defaultValue`、`onChange(json, editor)`。
- ref 方法：`getHTML()`、`setHTML(html)`、`clear()`、`focus()`。
- 多語系：`locale` prop，內建 `en`、`zhTW`，可局部覆寫或自訂語系。
- 刪除線、行內程式碼。
- 連結：工具列插入／移除、自動偵測網址與 email、Cmd/Ctrl+點擊開啟；拒絕 `javascript:` 等不安全協定。
- 程式碼區塊（Tab 插入縮排）。
- 表格：插入 3×3 表格（含標題列）、插入／刪除列與欄、Tab 切換儲存格。
- 圖片：以網址插入，可選取並刪除；支援 JSON、HTML、Markdown 匯入匯出。
- Markdown 快捷輸入：標題、引用、列表、程式碼區塊、粗體、斜體、刪除線、行內程式碼、連結、圖片。
- 工具列提示依平台顯示快捷鍵（macOS 顯示 `⌘B`，其他平台顯示 `Ctrl+B`），並加上 `aria-keyshortcuts`。
- 匯出 `editorNodes`、`MARKDOWN_TRANSFORMERS`、`ImageNode`，可在伺服器端（`@lexical/headless`）解析相同的 JSON。

### 變更

- Lexical 升級至 0.52.0。
- `lucide-react` 升級至 1.x，並改為只在 build 時使用；用到的圖示已打包進套件，使用者不需安裝。
- `package.json` 的 `exports` 將 `types` 排在第一位，並加上 `sideEffects`。

### 修正

- 移除被打包進正式版的除錯面板（編輯器上方會顯示除錯資訊）。
- `@lexical/react` 等子路徑被打包進套件，導致專案中出現兩份 Lexical、自訂 plugin 接不上編輯器。

### 已棄用

- `initialContent`：請改用 `defaultValue`，舊名稱仍可使用。

## 0.0.1 - 2025-12-19

- 首次發佈。
