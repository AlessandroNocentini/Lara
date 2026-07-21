export interface TextPart {
  text: string;
  highlight: boolean;
}

export function splitHighlighted(text: string, highlightWords: string[]): TextPart[] {
  if (highlightWords.length === 0) return [{ text, highlight: false }];

  const pattern = new RegExp(
    `(${highlightWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );
  const parts = text.split(pattern);

  return parts.filter(Boolean).map((part) => ({
    text: part,
    highlight: highlightWords.some((w) => w.toLowerCase() === part.toLowerCase()),
  }));
}
