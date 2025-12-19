import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $isElementNode } from "lexical";
import { $isListNode, $isListItemNode } from "@lexical/list";
// import { $getNearestNodeOfType } from "@lexical/utils";
import { useEffect, useState } from "react";

export function DetailedDebugPanel() {
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
          info += `=== TOP LEVEL ELEMENT ===\n`;
          info += `Type: ${element.getType()}\n`;
          info += `Is ListNode: ${$isListNode(element)}\n`;
          info += `Is ListItemNode: ${$isListItemNode(element)}\n`;

          if ($isElementNode(element)) {
            const format = element.getFormatType();
            info += `Format: "${format}"\n`;
          }

          info += `\n=== ANCHOR NODE ===\n`;
          info += `Type: ${anchorNode.getType()}\n`;
          info += `Parent Type: ${
            anchorNode.getParent()?.getType() || "null"
          }\n`;

          const parent = anchorNode.getParent();
          if (parent && $isElementNode(parent)) {
            info += `Parent Format: "${parent.getFormatType()}"\n`;
          }

          if ($isListNode(element)) {
            info += `\n=== LIST CHILDREN ===\n`;
            const children = element.getChildren();
            info += `Children Count: ${children.length}\n\n`;

            children.forEach((child, index) => {
              info += `Child ${index}:\n`;
              info += `  Type: ${child.getType()}\n`;
              info += `  Is ListItemNode: ${$isListItemNode(child)}\n`;

              if ($isElementNode(child)) {
                const childFormat = child.getFormatType();
                info += `  Format: "${childFormat}"\n`;

                // 檢查 ListItemNode 的子元素
                if ($isListItemNode(child)) {
                  const grandChildren = child.getChildren();
                  info += `  GrandChildren: ${grandChildren.length}\n`;
                  grandChildren.forEach((gc, gcIndex) => {
                    info += `    ${gcIndex}. ${gc.getType()}`;
                    if ($isElementNode(gc)) {
                      info += ` - Format: "${gc.getFormatType()}"`;
                    }
                    info += `\n`;
                  });
                }
              }
              info += `\n`;
            });
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
        background: "#1a1a1a",
        color: "#00ff00",
        padding: "15px",
        borderRadius: "8px",
        fontFamily: "'Courier New', monospace",
        fontSize: "11px",
        whiteSpace: "pre-wrap",
        maxWidth: "450px",
        maxHeight: "500px",
        overflow: "auto",
        zIndex: 9999,
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        border: "1px solid #333",
      }}
    >
      <div
        style={{ fontWeight: "bold", marginBottom: "10px", color: "#ffff00" }}
      >
        🔍 Detailed Debug Panel
      </div>
      {debugInfo || "No selection"}
    </div>
  );
}
