/** 編輯器介面文字；不含快捷鍵，快捷鍵會依平台自動附加 */
export interface EditorLocale {
  placeholder: string;

  /** 工具列本身的 aria-label */
  toolbar: string;
  undo: string;
  redo: string;

  /** 區塊類型選單的 aria-label */
  blockType: string;
  blockParagraph: string;
  blockH1: string;
  blockH2: string;
  blockH3: string;
  blockQuote: string;
  blockCode: string;

  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  inlineCode: string;
  insertLink: string;
  removeLink: string;

  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;

  bulletList: string;
  numberedList: string;

  insertImage: string;
  insertTable: string;
  tableInsertRowBelow: string;
  tableInsertColumnRight: string;
  tableDeleteRow: string;
  tableDeleteColumn: string;
  tableDelete: string;

  promptLinkUrl: string;
  invalidLinkUrl: string;
  promptImageUrl: string;
  invalidImageUrl: string;
}
