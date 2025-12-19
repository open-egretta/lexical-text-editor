import { ComponentType } from "react";

// 定義所有可用的圖示類型
export type IconType =
  | "bold"
  | "italic"
  | "underline"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "alignJustify"
  | "list"
  | "listOrdered"
  | "quote"
  | "undo"
  | "redo";

// 圖示組件的 props 介面
export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// 圖示組件型別
export type IconComponent = ComponentType<IconProps>;

// 圖示集型別（部分或完整）
export type IconSet = Partial<Record<IconType, IconComponent>>;
