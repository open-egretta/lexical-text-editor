import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isElementNode } from "lexical";
import { $isListNode, $isListItemNode, ListNode } from "@lexical/list";
import { $getNearestNodeOfType } from "@lexical/utils";
import { useEffect, useState } from "react";

export function SimpleDebugPanel() {
  const [editor] = useLexicalComposerContext();
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element =
            anchorNode.getKey() === "root"
              ? anchorNode
              : anchorNode.getTopLevelElementOrThrow();

          let info = "";
          info += `Element Type: ${element.getType()}\n`;
          info += `Is ListItemNode: ${$isListItemNode(element)}\n`;
          info += `Is ListNode: ${$isListNode(element)}\n`;

          if ($isElementNode(element)) {
            const format = element.getFormatType();
            info += `Element Format: "${format}"\n`;
          }

          if ($isListItemNode(element)) {
            const children = element.getChildren();
            info += `\nChildren Count: ${children.length}\n`;

            children.forEach((child, index) => {
              info += `Child ${index} Type: ${child.getType()}\n`;
              if ($isElementNode(child)) {
                const childFormat = child.getFormatType();
                info += `Child ${index} Format: "${childFormat}"\n`;
              }
            });

            const parentList = $getNearestNodeOfType<ListNode>(
              anchorNode,
              ListNode
            );
            if (parentList && $isElementNode(parentList)) {
              const listFormat = parentList.getFormatType();
              info += `\nParent ListNode Format: "${listFormat}"\n`;
            }
          }

          setDebugInfo(info);
        }
      });
    });
  }, [editor]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "#333",
        color: "#fff",
        padding: "15px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "12px",
        whiteSpace: "pre-wrap",
        maxWidth: "400px",
        maxHeight: "300px",
        overflow: "auto",
        zIndex: 9999,
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
        🔍 Debug Panel
      </div>
      {debugInfo || "No selection"}
    </div>
  );
}
