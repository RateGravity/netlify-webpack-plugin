import { NetlifyPlugin } from "../plugin";

describe("NetlifyPlugin", () => {
  describe("_headers and _redirects files", () => {
    const plugin = new NetlifyPlugin({
      headers: [{ for: "/*", values: { "x-from": "netlify-test" } }],
      redirects: [{ from: "/*", to: "/index.html" }]
    });
    const compilation = {
      assets: {}
    };
    plugin.apply({
      hooks: {
        emit: {
          tap: (_, callback) => callback(compilation)
        }
      }
    });
    it("emits _headers file", () => {
      expect(compilation.assets).toMatchObject({
        _headers: {
          source: expect.any(Function),
          size: expect.any(Function)
        }
      });
    });
    it("emits _headers file content", () => {
      const source = compilation.assets["_headers"].source();
      expect(source).toBe(
        `/*
  x-from: netlify-test`
      );
    });
    it("emits _headers file size", () => {
      const source = compilation.assets["_headers"].source();
      const size = compilation.assets["_headers"].size();
      expect(size).toBe(source.length);
    });
    it("emits _redirects file", () => {
      expect(compilation.assets).toMatchObject({
        _redirects: {
          source: expect.any(Function),
          size: expect.any(Function)
        }
      });
    });
    it("emits _redirects file content", () => {
      const source = compilation.assets["_redirects"].source();
      expect(source).toBe("/*    /index.html    301");
    });
    it("emits _redirects file size", () => {
      const source = compilation.assets["_redirects"].source();
      const size = compilation.assets["_redirects"].size();
      expect(size).toBe(source.length);
    });
  });
  it("skips _redirects file if not specified", () => {
    const plugin = new NetlifyPlugin({
      headers: [{ for: "/*", values: { "x-from": "netlify-test" } }]
    });
    const compilation = {
      assets: {}
    };
    plugin.apply({
      hooks: {
        emit: {
          tap: (_, callback) => callback(compilation)
        }
      }
    });
    expect(compilation.assets).not.toHaveProperty("_redirects");
  });
  it("skips _headers file if not specified", () => {
    const plugin = new NetlifyPlugin({
      redirects: [{ from: "/*", to: "/index.html" }]
    });
    const compilation = {
      assets: {}
    };
    plugin.apply({
      hooks: {
        emit: {
          tap: (_, callback) => callback(compilation)
        }
      }
    });
    expect(compilation.assets).not.toHaveProperty("_headers");
  });
  it("skips everything if not defined", () => {
    const plugin = new NetlifyPlugin({});
    const compilation = {
      assets: {}
    };
    plugin.apply({
      hooks: {
        emit: {
          tap: (_, callback) => callback(compilation)
        }
      }
    });
    expect(compilation.assets).toEqual({});
  });
});
