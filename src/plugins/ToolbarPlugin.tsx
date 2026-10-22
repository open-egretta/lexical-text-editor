import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  ElementFormatType,
  TextFormatType,
  $createParagraphNode,
  $createTextNode,
  $findMatchingParent,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isElementNode,
  $isRangeSelection,
  UNDO_COMMAND,
  REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type LexicalNode,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  ListType,
} from "@lexical/list";
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType,
  $isQuoteNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $createLinkNode, $isLinkNode, $toggleLink } from "@lexical/link";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableSelection,
  INSERT_TABLE_COMMAND,
} from "@lexical/table";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Icon, IconSet, IconType } from "../components/icons";
import { $createImageNode } from "../nodes/ImageNode";
import { normalizeImageUrl, normalizeLinkUrl } from "../utils/url";
import { useShortcuts, type Shortcut } from "../utils/shortcut";
import { useLocale } from "../locales/LocaleContext";
import type { EditorLocale } from "../locales/types";

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote" | "code";

const blockTypeLabelKeys: Record<BlockType, keyof EditorLocale> = {
  paragraph: "blockParagraph",
  h1: "blockH1",
  h2: "blockH2",
  h3: "blockH3",
  quote: "blockQuote",
  code: "blockCode",
};

interface ToolbarPluginProps {
  customIcons?: IconSet;
}

interface ToolbarButtonProps {
  icon: IconType;
  label: string;
  shortcut?: Shortcut;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  customIcons?: IconSet;
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  onClick,
  active = false,
  disabled = false,
  customIcons,
}: ToolbarButtonProps) {
  const shortcuts = useShortcuts();
  const keys = shortcut ? shortcuts[shortcut] : undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={active ? "toolbar-item active" : "toolbar-item"}
      aria-label={label}
      aria-pressed={active}
      aria-keyshortcuts={keys?.aria}
      title={keys ? `${label} (${keys.label})` : label}
    >
      <Icon type={icon} customIcons={customIcons} />
    </button>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="divider" />
      {children}
    </>
  );
}

function $isBlock(node: LexicalNode) {
  return $isElementNode(node) && !node.isInline();
}

export function ToolbarPlugin({ customIcons }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const t = useLocale();

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [formats, setFormats] = useState<Set<TextFormatType>>(new Set());
  const [isLink, setIsLink] = useState(false);
  const [isInTable, setIsInTable] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [listType, setListType] = useState<ListType | null>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isTableSelection(selection)) {
      setIsInTable(true);
      return;
    }
    if (!$isRangeSelection(selection)) return;

    const textFormats: TextFormatType[] = [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "code",
    ];
    setFormats(new Set(textFormats.filter((f) => selection.hasFormat(f))));

    const anchorNode = selection.anchor.getNode();
    setIsLink($findMatchingParent(anchorNode, $isLinkNode) !== null);
    setIsInTable($findMatchingParent(anchorNode, $isTableCellNode) !== null);

    const list = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
    setListType(list ? list.getListType() : null);

    // 最近的區塊節點（段落、標題、列表項目、程式碼區塊…）決定區塊類型與對齊
    const block = $findMatchingParent(anchorNode, $isBlock);
    if ($isHeadingNode(block)) {
      setBlockType(block.getTag() as BlockType);
    } else if ($isQuoteNode(block)) {
      setBlockType("quote");
    } else if ($isCodeNode(block)) {
      setBlockType("code");
    } else {
      setBlockType("paragraph");
    }
    setElementFormat(
      ($isElementNode(block) && block.getFormatType()) || "left"
    );
  }, []);

  useEffect(() => {
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
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateToolbar);
      })
    );
  }, [editor, updateToolbar]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatBlock = (type: BlockType) => {
    if (blockType === type) return;
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => {
        switch (type) {
          case "paragraph":
            return $createParagraphNode();
          case "quote":
            return $createQuoteNode();
          case "code":
            return $createCodeNode();
          default:
            return $createHeadingNode(type as HeadingTagType);
        }
      });
    });
  };

  const toggleLink = () => {
    if (isLink) {
      editor.update(() => $toggleLink(null));
      return;
    }
    const input = window.prompt(t.promptLinkUrl, "https://");
    if (input === null) return;
    const url = normalizeLinkUrl(input);
    if (!url) {
      window.alert(t.invalidLinkUrl);
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (selection.isCollapsed()) {
        // 沒有選取文字時，直接插入以網址為文字的連結
        selection.insertNodes([$createLinkNode(url).append($createTextNode(url))]);
      } else {
        $toggleLink(url);
      }
    });
  };

  const insertImage = () => {
    const input = window.prompt(t.promptImageUrl, "https://");
    if (input === null) return;
    const src = normalizeImageUrl(input);
    if (!src) {
      window.alert(t.invalidImageUrl);
      return;
    }
    editor.update(() => {
      if ($getSelection() === null) $getRoot().selectEnd();
      $insertNodes([$createImageNode({ src })]);
    });
  };

  const insertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: "3",
      columns: "3",
      includeHeaders: { rows: true, columns: false },
    });
  };

  const deleteTable = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!selection) return;
      const cell = $findMatchingParent(
        selection.getNodes()[0],
        $isTableCellNode
      );
      if (!cell) return;
      const paragraph = $createParagraphNode();
      $getTableNodeFromLexicalNodeOrThrow(cell).replace(paragraph);
      paragraph.select();
    });
  };

  return (
    <div className="toolbar" role="toolbar" aria-label={t.toolbar}>
      <ToolbarButton
        icon="undo"
        label={t.undo}
        shortcut="undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        disabled={!canUndo}
        customIcons={customIcons}
      />
      <ToolbarButton
        icon="redo"
        label={t.redo}
        shortcut="redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        disabled={!canRedo}
        customIcons={customIcons}
      />

      <Group>
        <select
          value={blockType}
          onChange={(e) => formatBlock(e.target.value as BlockType)}
          className="toolbar-item block-controls"
          aria-label={t.blockType}
        >
          {(Object.keys(blockTypeLabelKeys) as BlockType[]).map((type) => (
            <option key={type} value={type}>
              {t[blockTypeLabelKeys[type]]}
            </option>
          ))}
        </select>
      </Group>

      <Group>
        <ToolbarButton
          icon="bold"
          label={t.bold}
        shortcut="bold"
          onClick={() => formatText("bold")}
          active={formats.has("bold")}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="italic"
          label={t.italic}
        shortcut="italic"
          onClick={() => formatText("italic")}
          active={formats.has("italic")}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="underline"
          label={t.underline}
        shortcut="underline"
          onClick={() => formatText("underline")}
          active={formats.has("underline")}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="strikethrough"
          label={t.strikethrough}
          onClick={() => formatText("strikethrough")}
          active={formats.has("strikethrough")}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="code"
          label={t.inlineCode}
          onClick={() => formatText("code")}
          active={formats.has("code")}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon={isLink ? "unlink" : "link"}
          label={isLink ? t.removeLink : t.insertLink}
          onClick={toggleLink}
          active={isLink}
          customIcons={customIcons}
        />
      </Group>

      <Group>
        <ToolbarButton
          icon="alignLeft"
          label={t.alignLeft}
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          active={elementFormat === "left"}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="alignCenter"
          label={t.alignCenter}
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
          }
          active={elementFormat === "center"}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="alignRight"
          label={t.alignRight}
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
          }
          active={elementFormat === "right"}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="alignJustify"
          label={t.alignJustify}
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
          }
          active={elementFormat === "justify"}
          customIcons={customIcons}
        />
      </Group>

      <Group>
        <ToolbarButton
          icon="list"
          label={t.bulletList}
          onClick={() =>
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
          }
          active={listType === "bullet"}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="listOrdered"
          label={t.numberedList}
          onClick={() =>
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
          }
          active={listType === "number"}
          customIcons={customIcons}
        />
      </Group>

      <Group>
        <ToolbarButton
          icon="image"
          label={t.insertImage}
          onClick={insertImage}
          customIcons={customIcons}
        />
        <ToolbarButton
          icon="table"
          label={t.insertTable}
          onClick={insertTable}
          disabled={isInTable}
          customIcons={customIcons}
        />
      </Group>

      {isInTable && (
        <Group>
          <ToolbarButton
            icon="tableRowInsert"
            label={t.tableInsertRowBelow}
            onClick={() => editor.update(() => $insertTableRowAtSelection(true))}
            customIcons={customIcons}
          />
          <ToolbarButton
            icon="tableColumnInsert"
            label={t.tableInsertColumnRight}
            onClick={() =>
              editor.update(() => $insertTableColumnAtSelection(true))
            }
            customIcons={customIcons}
          />
          <ToolbarButton
            icon="tableRowDelete"
            label={t.tableDeleteRow}
            onClick={() => editor.update(() => $deleteTableRowAtSelection())}
            customIcons={customIcons}
          />
          <ToolbarButton
            icon="tableColumnDelete"
            label={t.tableDeleteColumn}
            onClick={() =>
              editor.update(() => $deleteTableColumnAtSelection())
            }
            customIcons={customIcons}
          />
          <ToolbarButton
            icon="tableDelete"
            label={t.tableDelete}
            onClick={deleteTable}
            customIcons={customIcons}
          />
        </Group>
      )}
    </div>
  );
}
