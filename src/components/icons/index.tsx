import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Unlink,
  SquareCode,
  Table,
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
  TableRowsSplit,
  TableCellsSplit,
  Grid2x2X,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { IconType, IconComponent, IconSet } from "./types";

// 預設圖示集（使用 Lucide）
export const defaultIcons: Record<IconType, IconComponent> = {
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  code: Code,
  link: Link,
  unlink: Unlink,
  codeBlock: SquareCode,
  table: Table,
  tableRowInsert: BetweenHorizontalEnd,
  tableColumnInsert: BetweenVerticalEnd,
  tableRowDelete: TableRowsSplit,
  tableColumnDelete: TableCellsSplit,
  tableDelete: Grid2x2X,
  image: ImageIcon,
  alignLeft: AlignLeft,
  alignCenter: AlignCenter,
  alignRight: AlignRight,
  alignJustify: AlignJustify,
  list: List,
  listOrdered: ListOrdered,
  quote: Quote,
  undo: Undo2,
  redo: Redo2,
};

// Icon 組件介面
interface IconComponentProps {
  type: IconType;
  size?: number;
  className?: string;
  customIcons?: IconSet;
}

// Icon 組件
export const Icon: React.FC<IconComponentProps> = ({
  type,
  size = 18,
  className = "",
  customIcons = {},
}) => {
  // 優先使用自訂圖示，否則使用預設圖示
  const IconComponent = customIcons[type] || defaultIcons[type];

  if (!IconComponent) {
    console.warn(`Icon type "${type}" not found`);
    return null;
  }

  return (
    <span className={`editor-icon ${className}`}>
      <IconComponent size={size} />
    </span>
  );
};

// 匯出型別供外部使用
export type { IconType, IconComponent, IconSet } from "./types";
