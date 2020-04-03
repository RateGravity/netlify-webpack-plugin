import { createHeaderFile } from "../headers";

describe("createHeaderFile", () => {
  it("creates headers for paths", () => {
    const result = createHeaderFile([
      {
        for: "/*",
        values: {
          "x-from": "netlify-test"
        }
      },
      {
        for: "/index.html",
        values: {
          "Cache-Control": "no-cache"
        }
      }
    ]);
    expect(result).toBe(
      `/*
  x-from: netlify-test
/index.html
  Cache-Control: no-cache`
    );
  });
  it("writes multi-value headers", () => {
    const result = createHeaderFile([
      {
        for: "/*",
        values: {
          "X-XSS-Protection": [1, { mode: "block" }]
        }
      }
    ]);
    expect(result).toBe(
      `/*
  X-XSS-Protection: 1; mode=block`
    );
  });
});
