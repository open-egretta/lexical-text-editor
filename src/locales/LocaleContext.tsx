import { createContext, useContext } from "react";
import { en } from "./en";
import type { EditorLocale } from "./types";

// 沒有 provider 時（例如單獨使用 ToolbarPlugin）使用英文
export const LocaleContext = createContext<EditorLocale>(en);

export function useLocale(): EditorLocale {
  return useContext(LocaleContext);
}

/** 以英文補齊缺少的 key */
export function resolveLocale(locale?: Partial<EditorLocale>): EditorLocale {
  return locale ? { ...en, ...locale } : en;
}
