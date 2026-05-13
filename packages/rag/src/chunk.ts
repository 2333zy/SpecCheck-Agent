export type TextChunk = {
  index: number;
  content: string;
};

export function chunkText(content: string, chunkSize = 800, overlap = 100): TextChunk[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  const chunks: TextChunk[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    chunks.push({ index: chunks.length, content: normalized.slice(start, end) });
    if (end === normalized.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}
