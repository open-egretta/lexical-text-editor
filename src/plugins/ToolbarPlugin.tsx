import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  ElementFormatType,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $isElementNode,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  $isListNode,
  $isListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
  $isQuoteNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";

import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useState } from "react";
import { Icon, IconSet } from "../components/icons";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

interface ToolbarPluginProps {
  customIcons?: IconSet;
}

export function ToolbarPlugin({ customIcons }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // 更新文字格式狀態
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      // 先重置列表狀態
      setIsBulletList(false);
      setIsNumberedList(false);

      // 🔑 如果 element 是 ListNode
      if ($isListNode(element)) {
        setBlockType("paragraph");
        const listType = element.getListType();
        setIsBulletList(listType === "bullet");
        setIsNumberedList(listType === "number");

        // 🎯 改善的對齊狀態讀取邏輯
        let detectedFormat: ElementFormatType = "left";

        // 方法 1：從 anchorNode 的 parent 讀取
        const parent = anchorNode.getParent();
        if (parent && $isElementNode(parent)) {
          const parentFormat = parent.getFormatType();
          if (parentFormat) {
            detectedFormat = parentFormat;
          } else {
            // 方法 2：如果 parent 沒有格式，嘗試從 parent 的子元素讀取
            const parentChildren = parent.getChildren();
            if (parentChildren.length > 0) {
              const firstChild = parentChildren[0];
              if ($isElementNode(firstChild)) {
                const childFormat = firstChild.getFormatType();
                if (childFormat) {
                  detectedFormat = childFormat;
                }
              }
            }
          }
        }

        // 方法 3：如果都沒有，嘗試從前一個 ListItemNode 讀取（繼承）
        if (detectedFormat === "left" && parent && $isListItemNode(parent)) {
          const listChildren = element.getChildren();
          const currentIndex = listChildren.indexOf(parent);

          if (currentIndex > 0) {
            // 有前一個 ListItemNode，嘗試繼承它的格式
            const prevListItem = listChildren[currentIndex - 1];
            if ($isElementNode(prevListItem)) {
              const prevFormat = prevListItem.getFormatType();
              if (prevFormat) {
                detectedFormat = prevFormat;
              }
            }
          }
        }

        setElementFormat(detectedFormat);
      }
      // 檢查是否是 ListItemNode
      else if ($isListItemNode(element)) {
        setBlockType("paragraph");

        const parentList = $getNearestNodeOfType<ListNode>(
          anchorNode,
          ListNode
        );
        if (parentList) {
          const listType = parentList.getListType();
          setIsBulletList(listType === "bullet");
          setIsNumberedList(listType === "number");
        }

        // ListItemNode 的對齊
        const format = element.getFormatType();
        setElementFormat(format || "left");
      }
      // 檢查標題
      else if ($isHeadingNode(element)) {
        setBlockType(element.getTag() as BlockType);
        const format = element.getFormatType();
        setElementFormat(format || "left");
      }
      // 檢查引用
      else if ($isQuoteNode(element)) {
        setBlockType("quote");
        const format = element.getFormatType();
        setElementFormat(format || "left");
      }
      // 一般段落
      else {
        setBlockType("paragraph");
        if ($isElementNode(element)) {
          const format = element.getFormatType();
          setElementFormat(format || "left");
        } else {
          setElementFormat("left");
        }
      }
    }
  }, []);

  useEffect(() => {
    // 監聽 undo/redo 狀態變化
    return mergeRegister(
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatHeading = (headingType: BlockType) => {
    if (blockType !== headingType) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          if (headingType === "paragraph") {
            $setBlocksType(selection, () => $createParagraphNode());
          } else if (headingType === "quote") {
            $setBlocksType(selection, () => $createQuoteNode());
          } else {
            $setBlocksType(selection, () =>
              $createHeadingNode(headingType as HeadingTagType)
            );
          }
        }
      });
    }
  };

  const handleUndo = () => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  };

  const handleRedo = () => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  };

  const blockTypeLabels: Record<BlockType, string> = {
    paragraph: "段落",
    h1: "標題 1",
    h2: "標題 2",
    h3: "標題 3",
    quote: "引用",
  };

  return (
    <div className="toolbar">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className="toolbar-item"
        aria-label="復原 (Ctrl+Z)"
        title="復原 (Ctrl+Z)"
      >
        <Icon type="undo" customIcons={customIcons} />
      </button>
      <button
        onClick={handleRedo}
        disabled={!canRedo}
        className="toolbar-item"
        aria-label="重做 (Ctrl+Y)"
        title="重做 (Ctrl+Y)"
      >
        <Icon type="redo" customIcons={customIcons} />
      </button>

      <div className="divider" />

      {/* 標題選擇器 */}
      <select
        value={blockType}
        onChange={(e) => formatHeading(e.target.value as BlockType)}
        className="toolbar-item block-controls"
      >
        <option value="paragraph">{blockTypeLabels.paragraph}</option>
        <option value="h1">{blockTypeLabels.h1}</option>
        <option value="h2">{blockTypeLabels.h2}</option>
        <option value="h3">{blockTypeLabels.h3}</option>
        <option value="quote">{blockTypeLabels.quote}</option>
      </select>

      <div className="divider" />

      {/* 文字格式 */}
      <button
        onClick={formatBold}
        className={isBold ? "toolbar-item active" : "toolbar-item"}
        aria-label="粗體 (Ctrl+B)"
        title="粗體 (Ctrl+B)"
      >
        <Icon type="bold" customIcons={customIcons} />
      </button>
      <button
        onClick={formatItalic}
        className={isItalic ? "toolbar-item active" : "toolbar-item"}
        aria-label="斜體 (Ctrl+I)"
        title="斜體 (Ctrl+I)"
      >
        <Icon type="italic" customIcons={customIcons} />
      </button>
      <button
        onClick={formatUnderline}
        className={isUnderline ? "toolbar-item active" : "toolbar-item"}
        aria-label="底線 (Ctrl+U)"
        title="底線 (Ctrl+U)"
      >
        <Icon type="underline" customIcons={customIcons} />
      </button>

      <div className="divider" />

      {/* 對齊方式 */}
      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        className={
          elementFormat === "left" ? "toolbar-item active" : "toolbar-item"
        }
        aria-label="左對齊 (Ctrl+Shift+L)"
        title="左對齊 (Ctrl+Shift+L)"
      >
        <Icon type="alignLeft" customIcons={customIcons} />
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        className={
          elementFormat === "center" ? "toolbar-item active" : "toolbar-item"
        }
        aria-label="置中對齊 (Ctrl+Shift+E)"
        title="置中對齊 (Ctrl+Shift+E)"
      >
        <Icon type="alignCenter" customIcons={customIcons} />
      </button>

      <button
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        className={
          elementFormat === "right" ? "toolbar-item active" : "toolbar-item"
        }
        aria-label="右對齊 (Ctrl+Shift+R)"
        title="右對齊 (Ctrl+Shift+R)"
      >
        <Icon type="alignRight" customIcons={customIcons} />
      </button>

      <button
        onClick={() =>
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
        }
        className={
          elementFormat === "justify" ? "toolbar-item active" : "toolbar-item"
        }
        aria-label="兩端對齊 (Ctrl+Shift+J)"
        title="兩端對齊 (Ctrl+Shift+J)"
      >
        <Icon type="alignJustify" customIcons={customIcons} />
      </button>

      <div className="divider" />

      {/* 列表 */}
      <button
        onClick={formatBulletList}
        className={isBulletList ? "toolbar-item active" : "toolbar-item"}
        aria-label="項目列表"
        title="項目列表"
      >
        <Icon type="list" customIcons={customIcons} />
      </button>

      <button
        onClick={formatNumberedList}
        className={isNumberedList ? "toolbar-item active" : "toolbar-item"}
        aria-label="編號列表"
        title="編號列表"
      >
        <Icon type="listOrdered" customIcons={customIcons} />
      </button>
    </div>
  );
}
