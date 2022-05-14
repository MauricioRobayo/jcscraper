import {
  removeEnclosingQuotationMarks,
  removeSignature,
  normalizeNewLines,
} from "./utils";

describe("removeEnclosingQuotes", () => {
  const cases = [
    ["hello, world!", "hello, world!"],
    ['"hello, world!"', "hello, world!"],
    ["“hello, world!”", "hello, world!"],
    ["‘hello, world!’", "hello, world!"],
    ["hello, “world!”", "hello, “world!”"],
    ["“hello”, world!", "“hello”, world!"],
    ['“hello, "world!"”', 'hello, "world!"'],
    ['"hello, "world!""', 'hello, "world!"'],
  ];
  it.each(cases)(
    "should remove enclosing quotation marks from %p",
    (text, expected) => {
      expect(removeEnclosingQuotationMarks(text)).toBe(expected);
    }
  );
});

describe("removeSignature", () => {
  const mockText = "hello, world";
  const cases = [
    `${mockText}- @JamesClear`,
    `${mockText}– @JamesClear`,
    `${mockText}-via @JamesClear`,
    `${mockText}–via @JamesClear`,
    `${mockText}-    @JamesClear`,
    `${mockText}-  via  @JamesClear`,
    `${mockText}\n\n-  via  @JamesClear`,
    `${mockText}\n\n-@JamesClear`,
    `${mockText}\n\n@JamesClear`,
    `${mockText}@JamesClear`,
    `${mockText}\n\nJamesClear`,
  ];
  it.each(cases)("should remove signature from %p", (text) => {
    expect(removeSignature(text)).toBe(mockText);
  });
});

describe("normalizeNewLines", () => {
  const expected = "Hello,\nworld!";
  const cases = [
    "Hello, \n\n world!",
    "Hello, \n\nworld!",
    "Hello,\n\n world!",
    "Hello,\n\nworld!",
    "Hello,\n\n\nworld!",
    "Hello, \n world!",
    "Hello, \nworld!",
    "Hello,\n world!",
    "Hello,\nworld!",
  ];
  it.each(cases)("should normalize new lines from %p", (text) => {
    expect(normalizeNewLines(text)).toBe(expected);
  });
});
