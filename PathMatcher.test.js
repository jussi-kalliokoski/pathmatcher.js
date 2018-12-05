const PathMatcher = require("./pathmatcher.js");

describe("PathMatcher", () => {
  it("should throw if parts are separated by an empty string", () => {
    expect(() => {
      PathMatcher`${x => x}${x => x}`;
    }).toThrow();
    expect(() => {
      PathMatcher`${x => x}${PathMatcher.rest(x => x)}`;
    }).toThrow();
  });

  it("should throw if rest is at non-last position", () => {
    expect(() => {
      PathMatcher`${x => x}abc${PathMatcher.rest(x => x)}def${x => x}`;
    }).toThrow();
  });

  it("should throw if rest is followed by a non-empty string", () => {
    expect(() => {
      PathMatcher`${PathMatcher.rest(x => x)}abc`;
    }).toThrow();
  });

  it("should return null if the last string does not match", () => {
    expect(PathMatcher`${x => x}abc`({}, "fooab")).toBe(null);
    expect(PathMatcher`${x => x}abc`({}, "fooabcd")).toBe(null);
    expect(PathMatcher`${x => x}abc`({}, "fooabx")).toBe(null);
  });

  it("should return null if a segment does not match", () => {
    expect(PathMatcher`a${x => x}a`({}, "abc")).toBe(null);
    expect(PathMatcher`a${x => x}b${x => x}c`({}, "adc")).toBe(null);
    expect(PathMatcher`a${x => x}b${x => x}c`({}, "dbc")).toBe(null);
    expect(PathMatcher`a${x => x}b${x => x}c`({}, "abd")).toBe(null);
  });

  it("should return null if the segment contains a path separator", () => {
    expect(PathMatcher`a${x => x}a`({}, "ab/ba")).toBe(null);
  });

  it("should return null if the filler returns null", () => {
    expect(PathMatcher`${x => null}`({}, "abc")).toBe(null);
  });

  it("should fill the route parameters", () => {
    expect(
      PathMatcher`foo${(l, r) => l + r}zoo${(l, r) => l + r}`(
        "",
        "foobarzoocar",
      ),
    ).toBe("barcar");
    expect(
      PathMatcher`foo${(l, r) => l + r}zoo${(l, r) => l + r}boo`(
        "",
        "foobarzoocarboo",
      ),
    ).toBe("barcar");
  });

  it("should allow path separators in the rest segment", () => {
    expect(
      PathMatcher`foo${(l, r) => l + r}zoo${PathMatcher.rest((l, r) => l + r)}`(
        "",
        "foobarzooc/a/r",
      ),
    ).toBe("barc/a/r");
  });
});

describe("PathMatcher.rest", () => {
  it("should return a wrapped function that calls the underlying function", () => {
    const original = (a, b) => a + b;
    const wrapped = PathMatcher.rest(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped(1, 2)).toBe(3);
  });
});
