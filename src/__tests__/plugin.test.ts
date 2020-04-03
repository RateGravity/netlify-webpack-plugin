import { Compiler, compilation } from "webpack";
import { NetlifyPlugin } from "../plugin";

describe("NetlifyPlugin", () => {
  it("taps emit", () => {
    const plugin = new NetlifyPlugin({});
    const compiler = {
      hooks: {
        emit: {
          tap: jest.fn() as any
        }
      }
    } as Compiler;
    plugin.apply(compiler);
    expect(compiler.hooks.emit.tap).toHaveBeenCalledWith(
      "NetlifyPlugin",
      expect.any(Function)
    );
  });
  describe("_headers and _redirects files", () => {
    const plugin = new NetlifyPlugin({
      headers: [{ for: "/*", values: { "x-from": "netlify-test" } }],
      redirects: [{ from: "/*", to: "/index.html" }]
    });
    const c = {
      assets: {}
    } as compilation.Compilation;
    const compiler = {
      hooks: {
        emit: {
          tap: (_, callback: any) => callback(c)
        }
      }
    } as Compiler;
    plugin.apply(compiler);
    it("emits _headers file", () => {
      expect(c.assets).toMatchObject({
        _headers: {
          source: expect.any(Function),
          size: expect.any(Function)
        }
      });
    });
    it("emits _headers file content", () => {
      const source = c.assets["_headers"].source();
      expect(source).toBe(
        `/*
  x-from: netlify-test`
      );
    });
    it("emits _headers file size", () => {
      const source = c.assets["_headers"].source();
      const size = c.assets["_headers"].size();
      expect(size).toBe(source.length);
    });
    it("emits _redirects file", () => {
      expect(c.assets).toMatchObject({
        _redirects: {
          source: expect.any(Function),
          size: expect.any(Function)
        }
      });
    });
    it("emits _redirects file content", () => {
      const source = c.assets["_redirects"].source();
      expect(source).toBe("/*    /index.html    301");
    });
    it("emits _redirects file size", () => {
      const source = c.assets["_redirects"].source();
      const size = c.assets["_redirects"].size();
      expect(size).toBe(source.length);
    });
  });
  it("skips _redirects file if not specified", () => {
    const plugin = new NetlifyPlugin({
      headers: [{ for: "/*", values: { "x-from": "netlify-test" } }]
    });
    const c = {
      assets: {}
    } as compilation.Compilation;
    const compiler = {
      hooks: {
        emit: {
          tap: (_, callback: any) => callback(c)
        }
      }
    } as Compiler;
    plugin.apply(compiler);
    expect(c.assets).not.toHaveProperty("_redirects");
  });
  it("skips _headers file if not specified", () => {
    const plugin = new NetlifyPlugin({
      redirects: [{ from: "/*", to: "/index.html" }]
    });
    const c = {
      assets: {}
    } as compilation.Compilation;
    const compiler = {
      hooks: {
        emit: {
          tap: (_, callback: any) => callback(c)
        }
      }
    } as Compiler;
    plugin.apply(compiler);
    expect(c.assets).not.toHaveProperty("_headers");
  });
  it("skips everything if not defined", () => {
    const plugin = new NetlifyPlugin({});
    const c = {
      assets: {}
    } as compilation.Compilation;
    const compiler = {
      hooks: {
        emit: {
          tap: (_, callback: any) => callback(c)
        }
      }
    } as Compiler;
    plugin.apply(compiler);
    expect(c.assets).toEqual({});
  });
});
