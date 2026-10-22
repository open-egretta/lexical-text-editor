import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isCodeNode } from "@lexical/code";
import {
  INDENT_CONTENT_COMMAND,
  INSERT_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  $findMatchingParent,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { useEffect } from "react";

export function TabIndentPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 表格內的 Tab 由 TablePlugin（較高優先級）處理，用來切換儲存格
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        event.preventDefault();

        // 程式碼區塊內：Tab 插入 TabNode（不可直接插入 "\t" 文字）
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) &&
          $findMatchingParent(selection.anchor.getNode(), $isCodeNode)
        ) {
          if (!event.shiftKey) {
            editor.dispatchCommand(INSERT_TAB_COMMAND, undefined);
          }
          return true;
        }

        return editor.dispatchCommand(
          event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
          undefined
        );
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
