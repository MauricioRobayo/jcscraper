export class QuoteCleaner {
  constructor(private rawText: string) {}

  removeEnclosingQuotationMarks(): QuoteCleaner {
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

  removeSignature(): QuoteCleaner {
    this.rawText = this.rawText
      .trimEnd()
      .replace(/[-–].*@?JamesClear$/, "")
      .replace(/@?JamesClear$/, "")
      .trimEnd();

    return this;
  }

  normalizeNewLines(): QuoteCleaner {
    this.rawText = this.rawText.replace(/\s*\n+\s*/g, "\n");

    return this;
  }

  extractQuote(): QuoteCleaner {
    // Order matters!
    this.rawText = this.removeSignature().removeEnclosingQuotationMarks().text;

    return this;
  }

  clean(): QuoteCleaner {
    this.extractQuote().normalizeNewLines().text.trim();

    return this;
  }

  get text(): string {
    return this.rawText;
  }
}
