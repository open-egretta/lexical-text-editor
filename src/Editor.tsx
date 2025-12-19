import "./Editor.css";
import { forwardRef, useImperativeHandle } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { $getRoot } from "lexical";
import { editorTheme } from "./themes/editorTheme";
import { TabIndentPlugin } from "./plugins/TabIndentPlugin";
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";
import { IconSet } from "./components/icons";
import { DetailedDebugPanel } from "./plugins/DetailedDebugPanel";

export interface LexicalEditorRef {
  getJSON: () => string;
  getText: () => string;
  setContent: (json: string) => void; // 新增
}

export interface LexicalEditorProps {
  initialContent?: string;
  placeholder?: string;
  customIcons?: IconSet;
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

    setContent: (json: string) => {
      // 新增
      try {
        const editorState = editor.parseEditorState(json);
        editor.setEditorState(editorState);
      } catch (error) {
        console.error("Failed to set content:", error);
      }
    },
  }));

  return null;
}

export const LexicalEditor = forwardRef<LexicalEditorRef, LexicalEditorProps>(
  ({ placeholder = "開始輸入...", initialContent, customIcons }, ref) => {
    const initialConfig = {
      namespace: "LexicalEditor",
      theme: editorTheme,
      editorState: initialContent || undefined,
      onError: (error: Error) => {
        console.error(error);
      },
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    };

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <DetailedDebugPanel />
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
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <ListPlugin />
          <TabIndentPlugin />
          <LinkPlugin />
          <EditorRefPlugin forwardedRef={ref} />
        </div>
      </LexicalComposer>
    );
  }
);

LexicalEditor.displayName = "LexicalEditor";
