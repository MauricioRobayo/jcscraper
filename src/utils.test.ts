import { removeEnclosingQuotationMarks } from "./utils";

describe.only("removeEnclosingQuotes", () => {
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
