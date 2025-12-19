import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useEffect } from "react";

export function TabIndentPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // 處理 Tab 鍵
    const removeTabListener = editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        event.preventDefault(); // 🔑 關鍵：阻止預設行為

        if (event.shiftKey) {
          // Shift + Tab = 減少縮排
          return editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
        } else {
          // Tab = 增加縮排
          return editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
        }
      },
      COMMAND_PRIORITY_EDITOR // 🔑 使用正確的優先級
    );

    return removeTabListener;
  }, [editor]);

  return null;
}
