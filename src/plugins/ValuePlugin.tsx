import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalEditor } from "lexical";
import { $createParagraphNode, $getRoot, HISTORY_MERGE_TAG } from "lexical";

// 由 value prop 同步進編輯器的更新會帶上此 tag，不觸發 onChange
const EXTERNAL_VALUE_TAG = "lte-external-value";

interface ValuePluginProps {
  value?: string;
  onChange?: (json: string, editor: LexicalEditor) => void;
}

export function ValuePlugin({ value, onChange }: ValuePluginProps) {
  const [editor] = useLexicalComposerContext();
  // 最後一次與外部同步的 JSON（送出的 onChange 或收到的 value），用來避免受控模式迴圈
  const lastJSONRef = useRef<string | undefined>(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ editorState, prevEditorState, dirtyElements, dirtyLeaves, tags }) => {
        // 與 @lexical/react 的 OnChangePlugin 相同：略過初始化、history-merge 與純選取變動
        if (tags.has(EXTERNAL_VALUE_TAG) || tags.has(HISTORY_MERGE_TAG)) return;
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        if (prevEditorState.isEmpty()) return;

        const json = JSON.stringify(editorState.toJSON());
        if (json === lastJSONRef.current) return;
        lastJSONRef.current = json;
        onChangeRef.current?.(json, editor);
      }
    );
  }, [editor]);

  useEffect(() => {
    if (value === undefined || value === lastJSONRef.current) return;
    lastJSONRef.current = value;

    if (value === "") {
      editor.update(
        () => {
          const root = $getRoot();
          root.clear();
          root.append($createParagraphNode());
        },
        { tag: EXTERNAL_VALUE_TAG }
      );
      return;
    }

    try {
      editor.setEditorState(editor.parseEditorState(value), {
        tag: EXTERNAL_VALUE_TAG,
      });
    } catch (error) {
      console.error("Failed to apply value:", error);
    }
  }, [editor, value]);

  return null;
}
