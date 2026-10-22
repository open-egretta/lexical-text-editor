import "./Editor.css";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $createParagraphNode,
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  type LexicalEditor as LexicalEditorInstance,
  type LexicalNode,
} from "lexical";
import { editorTheme } from "./themes/editorTheme";
import { TabIndentPlugin } from "./plugins/TabIndentPlugin";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";
import { ValuePlugin } from "./plugins/ValuePlugin";
import { LinkClickPlugin } from "./plugins/LinkClickPlugin";
import { MARKDOWN_TRANSFORMERS } from "./plugins/markdownTransformers";
import { editorNodes } from "./nodes";
import { IconSet } from "./components/icons";
import { isValidLinkUrl } from "./utils/url";
import { LocaleContext, resolveLocale } from "./locales/LocaleContext";
import type { EditorLocale } from "./locales/types";

const AUTO_LINK_MATCHERS = [
  createLinkMatcherWithRegExp(
    /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/,
    (text) => (text.startsWith("http") ? text : `https://${text}`)
  ),
  createLinkMatcherWithRegExp(
    /[\w.+-]+@[\w-]+(\.[\w-]+)+/,
    (text) => `mailto:${text}`
  ),
];

export interface LexicalEditorRef {
  getJSON: () => string;
  getText: () => string;
  getHTML: () => string;
  /** 設定編輯器內容（Lexical JSON 字串） */
  setContent: (json: string) => void;
  setHTML: (html: string) => void;
  clear: () => void;
  focus: () => void;
}

export interface LexicalEditorProps {
  /** 受控模式：目前內容（Lexical JSON 字串），空字串代表清空 */
  value?: string;
  /** 非受控模式：初始內容（Lexical JSON 字串），只在 mount 時生效 */
  defaultValue?: string;
  /** @deprecated 請改用 `defaultValue` */
  initialContent?: string;
  /** 內容變動時觸發（不含純選取變動） */
  onChange?: (json: string, editor: LexicalEditorInstance) => void;
  /** 介面文字，預設英文；缺少的 key 以英文補齊。例如 `locale={zhTW}` 或 `locale={{ ...zhTW, bold: "加粗" }}` */
  locale?: Partial<EditorLocale>;
  /** 佔位文字，優先於 `locale.placeholder` */
  placeholder?: string;
  customIcons?: IconSet;
}

function $isBlockNode(node: LexicalNode) {
  return (
    ($isElementNode(node) || $isDecoratorNode(node)) && !node.isInline()
  );
}

// 以 HTML 取代整份內容；頂層的行內節點會被包進段落
function $setHTML(editor: LexicalEditorInstance, html: string) {
  const dom = new DOMParser().parseFromString(html, "text/html");
  const nodes = $generateNodesFromDOM(editor, dom);
  const root = $getRoot();
  root.clear();

  let paragraph: ReturnType<typeof $createParagraphNode> | null = null;
  for (const node of nodes) {
    if ($isBlockNode(node)) {
      paragraph = null;
      root.append(node);
    } else {
      if (!paragraph) {
        paragraph = $createParagraphNode();
        root.append(paragraph);
      }
      paragraph.append(node);
    }
  }

  if (root.getChildrenSize() === 0) {
    root.append($createParagraphNode());
  }
}

function EditorRefPlugin({
  forwardedRef,
}: {
  forwardedRef: React.ForwardedRef<LexicalEditorRef>;
}) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(forwardedRef, () => ({
    getJSON: () => {
      const editorState = editor.getEditorState();
      return JSON.stringify(editorState.toJSON());
    },

    getText: () => {
      let text = "";
      editor.getEditorState().read(() => {
        text = $getRoot().getTextContent();
      });
      return text;
    },

    getHTML: () => editor.read(() => $generateHtmlFromNodes(editor, null)),

    setContent: (json: string) => {
      try {
        const editorState = editor.parseEditorState(json);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error("Failed to set content:", error);
      }
    },

    setHTML: (html: string) => {
      editor.update(() => $setHTML(editor, html));
    },

    clear: () => {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        root.append($createParagraphNode());
      });
    },

    focus: () => editor.focus(),
  }));

  return null;
}

export const LexicalEditor = forwardRef<LexicalEditorRef, LexicalEditorProps>(
  (
    {
      value,
      defaultValue,
      initialContent,
      onChange,
      locale,
      placeholder,
      customIcons,
    },
    ref
  ) => {
    const initialConfig = {
      namespace: "LexicalEditor",
      theme: editorTheme,
      editorState: (value ?? defaultValue ?? initialContent) || undefined,
      onError: (error: Error) => {
        console.error(error);
      },
      nodes: [...editorNodes],
    };

    const resolvedLocale = useMemo(() => resolveLocale(locale), [locale]);

    return (
      <LocaleContext.Provider value={resolvedLocale}>
        <LexicalComposer initialConfig={initialConfig}>
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <ToolbarPlugin customIcons={customIcons} />
            <div style={{ position: "relative", backgroundColor: "white" }}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    style={{
                      minHeight: "200px",
                      padding: "15px",
                      outline: "none",
                      fontSize: "16px",
                      lineHeight: "1.6",
                    }}
                  />
                }
                placeholder={
                  <div
                    style={{
                      position: "absolute",
                      top: "15px",
                      left: "15px",
                      color: "#999",
                      pointerEvents: "none",
                      fontSize: "16px",
                    }}
                  >
                    {placeholder ?? resolvedLocale.placeholder}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            <HistoryPlugin />
            <ListPlugin />
            <TabIndentPlugin />
            <LinkPlugin validateUrl={isValidLinkUrl} />
            <AutoLinkPlugin matchers={AUTO_LINK_MATCHERS} />
            <LinkClickPlugin />
            <TablePlugin hasCellMerge={false} hasHorizontalScroll />
            <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
            <ValuePlugin value={value} onChange={onChange} />
            <EditorRefPlugin forwardedRef={ref} />
          </div>
        </LexicalComposer>
      </LocaleContext.Provider>
    );
  }
);

LexicalEditor.displayName = "LexicalEditor";
