import { createHeaderFile } from "../headers";

describe("createHeaderFile", () => {
  it("creates headers for paths", () => {
    const result = createHeaderFile({
      '/*': {
        'x-from': 'netlify-test'
      },
      "/index.html": {
        "Cache-Control": "no-cache"
      }
    });
    expect(result).toBe(
      `/*
  x-from: netlify-test
/index.html
  Cache-Control: no-cache`
    );
  });
  it("writes multi-value headers", () => {
    const result = createHeaderFile({
      "/*": {
        "X-XSS-Protection": [1, { mode: "block" }]
      }
    });
    expect(result).toBe(
      `/*
  X-XSS-Protection: 1; mode=block`
    );
  });
});
