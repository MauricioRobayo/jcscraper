export class QuoteCleaner {
  constructor(private rawText: string) {}

  removeEnclosingQuotationMarks(): this {
    if (this.rawText.startsWith('"') && this.rawText.endsWith('"')) {
      this.rawText = this.rawText.slice(1, -1);
    }
    if (this.rawText.startsWith("“") && this.rawText.endsWith("”")) {
      this.rawText = this.rawText.slice(1, -1);
    }
    if (this.rawText.startsWith("‘") && this.rawText.endsWith("’")) {
      this.rawText = this.rawText.slice(1, -1);
    }
    return this;
  }

  removeSignature(): this {
    this.rawText = this.rawText
      .trimEnd()
      .replace(/[-–].*@?JamesClear$/, "")
      .replace(/@?JamesClear$/, "")
      .trimEnd();

    return this;
  }

  normalizeNewLines(): this {
    this.rawText = this.rawText.replace(/\s*\n+\s*/g, "\n");

    return this;
  }

  extractQuote(): this {
    // Order matters!
    this.rawText = this.removeSignature().removeEnclosingQuotationMarks().text;

    return this;
  }

  clean(): this {
    this.extractQuote().normalizeNewLines().text.trim();

    return this;
  }

  get text(): string {
    return this.rawText;
  }
}
