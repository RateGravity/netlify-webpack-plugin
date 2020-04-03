import { csp } from "../csp";

describe("csp", () => {
  it("creates csp header value", () => {
    const value = csp({
      "default-src": ["self", "none"],
      "frame-src": ["none"]
    });
    expect(value).toEqual(["default-src self none", "frame-src none"]);
  });
});
