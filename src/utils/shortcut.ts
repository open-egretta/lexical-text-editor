import { useSyncExternalStore } from "react";

/** 編輯器實際支援的快捷鍵（由 Lexical rich-text / history 提供） */
export type Shortcut = "undo" | "redo" | "bold" | "italic" | "underline";

interface ShortcutDisplay {
  /** 顯示在 title 的文字，例如 "⌘B" 或 "Ctrl+B" */
  label: string;
  /** aria-keyshortcuts 屬性值 */
  aria: string;
}

const APPLE: Record<Shortcut, ShortcutDisplay> = {
  undo: { label: "⌘Z", aria: "Meta+Z" },
  redo: { label: "⇧⌘Z", aria: "Meta+Shift+Z" },
  bold: { label: "⌘B", aria: "Meta+B" },
  italic: { label: "⌘I", aria: "Meta+I" },
  underline: { label: "⌘U", aria: "Meta+U" },
};

const OTHER: Record<Shortcut, ShortcutDisplay> = {
  undo: { label: "Ctrl+Z", aria: "Control+Z" },
  redo: { label: "Ctrl+Y", aria: "Control+Y" },
  bold: { label: "Ctrl+B", aria: "Control+B" },
  italic: { label: "Ctrl+I", aria: "Control+I" },
  underline: { label: "Ctrl+U", aria: "Control+U" },
};

function detectApple(): boolean {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

const subscribe = () => () => {};

/**
 * 依平台取得快捷鍵顯示方式。
 * 伺服器端與 hydration 期間一律使用非 Apple 版本，避免 SSR 輸出與用戶端不一致。
 */
export function useShortcuts(): Record<Shortcut, ShortcutDisplay> {
  const isApple = useSyncExternalStore(subscribe, detectApple, () => false);
  return isApple ? APPLE : OTHER;
}
