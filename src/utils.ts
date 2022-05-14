import path from "path";

export const cacheDir = path.join(process.cwd(), ".jcscraper-cache");

export function removeEnclosingQuotationMarks(text: string): string {
  if (text.startsWith('"') && text.endsWith('"')) {
    return text.slice(1, -1);
  }
  if (text.startsWith("“") && text.endsWith("”")) {
    return text.slice(1, -1);
  }
  if (text.startsWith("‘") && text.endsWith("’")) {
    return text.slice(1, -1);
  }
  return text;
}

export function removeSignature(text: string): string {
  return text
    .trimEnd()
    .replace(/[-–].*@?JamesClear$/, "")
    .replace(/@?JamesClear$/, "")
    .trimEnd();
}

export function normalizeNewLines(text: string): string {
  return text.replace(/\s*\n+\s*/g, "\n");
}
