import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// 編輯時一般點擊只放置游標；按住 Cmd/Ctrl 點擊才在新分頁開啟連結
export function LinkClickPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor?.href) return;
      event.preventDefault();
      window.open(anchor.href, "_blank", "noopener,noreferrer");
    };

    return editor.registerRootListener((root, prevRoot) => {
      prevRoot?.removeEventListener("click", onClick);
      root?.addEventListener("click", onClick);
    });
  }, [editor]);

  return null;
}
