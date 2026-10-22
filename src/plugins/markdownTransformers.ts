import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  CODE,
  HEADING,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  type TextMatchTransformer,
  type Transformer,
} from "@lexical/markdown";
import { $createImageNode, $isImageNode, ImageNode } from "../nodes/ImageNode";

// ![alt](src)
export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) =>
    $isImageNode(node) ? `![${node.getAltText()}](${node.getSrc()})` : null,
  importRegExp: /!\[([^[\]]*)\]\(([^()\s]+)\)/,
  regExp: /!\[([^[\]]*)\]\(([^()\s]+)\)$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    textNode.replace($createImageNode({ src, altText }));
  },
  trigger: ")",
  type: "text-match",
};

// 只包含編輯器有註冊對應 node 的語法（不含 checklist、highlight）
export const MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  CODE,
  INLINE_CODE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  IMAGE,
  LINK,
];
