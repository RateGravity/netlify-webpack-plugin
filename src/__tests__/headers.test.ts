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
  it('writes multi-value headers', () => {
    const result = createHeaderFile({
      "/*": {
        "cache-control": {
          "max-age": 0,
          "no-cache": true,
          "no-store": true,
          "must-revalidate": true
        }
      }
    });
    expect(result).toBe(
      `/*
  cache-control: max-age=0
  cache-control: no-cache
  cache-control: no-store
  cache-control: must-revalidate`
    )
  });
  it("writes tokenized headers", () => {
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
  it("writes tokenized simple token", () => {
    const result = createHeaderFile({
      "/*": {
        "X-XSS-Protection": [1, [2, 3, 4]]
      }
    });
    expect(result).toBe(
      `/*
  X-XSS-Protection: 1; 2; 3; 4`
    );
  });
  it('writes multi-valued tokenized headers', () => {
    const result = createHeaderFile({
      "/*": {
        "Accept": [
          ['text/*', { q: 0.3 }],
          ['text/html', { q: 0.7 }],
          ['text/html', { level: 1}],
          ['text/html', { level: 2, q: 0.4}],
          ['*/*', { q: 0.5 }]
        ]
      }
    });
    expect(result).toBe(
      `/*
  Accept: text/*; q=0.3
  Accept: text/html; q=0.7
  Accept: text/html; level=1
  Accept: text/html; level=2; q=0.4
  Accept: */*; q=0.5`
    );
  })
});
