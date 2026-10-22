export { LexicalEditor } from "./Editor";
export type { LexicalEditorProps, LexicalEditorRef } from "./Editor";
export { ToolbarPlugin } from "./plugins/ToolbarPlugin";
export { editorTheme } from "./themes/editorTheme";
export { editorNodes } from "./nodes";
export { ImageNode, $createImageNode, $isImageNode } from "./nodes/ImageNode";
export type { ImagePayload, SerializedImageNode } from "./nodes/ImageNode";
export { MARKDOWN_TRANSFORMERS } from "./plugins/markdownTransformers";

export { Icon, defaultIcons } from "./components/icons";
export type { IconType, IconComponent, IconSet } from "./components/icons";

export { en } from "./locales/en";
export { zhTW } from "./locales/zhTW";
export type { EditorLocale } from "./locales/types";
