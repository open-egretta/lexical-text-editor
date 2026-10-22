const LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];
const IMAGE_PROTOCOLS = ["http:", "https:", "data:", "blob:"];

function normalize(input: string, protocols: string[]): string | null {
  const url = input.trim();
  if (!url) return null;

  // 相對路徑與錨點直接保留
  if (/^[/#?.]/.test(url)) return url;

  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    try {
      return protocols.includes(new URL(url).protocol) ? url : null;
    } catch {
      return null;
    }
  }

  // 沒有協定時（如 example.com）補上 https://
  return `https://${url}`;
}

/** 正規化使用者輸入的連結；不允許的協定（如 javascript:）回傳 null */
export function normalizeLinkUrl(input: string): string | null {
  return normalize(input, LINK_PROTOCOLS);
}

/** 正規化圖片網址；data: 只接受圖片 */
export function normalizeImageUrl(input: string): string | null {
  const url = normalize(input, IMAGE_PROTOCOLS);
  if (url?.toLowerCase().startsWith("data:") && !/^data:image\//i.test(url)) {
    return null;
  }
  return url;
}

/** 給 LinkPlugin 的 validateUrl：只接受完整且協定安全的網址 */
export function isValidLinkUrl(url: string): boolean {
  try {
    return LINK_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
