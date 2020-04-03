import { createHeaderFile } from "./headers";
import { createRedirectFile } from "./redirects";

// Given a configuration writes it out as _headers and _redirects files
export class NetlifyPlugin {
  constructor(configuration) {
    this.configuration = configuration;
  }

  apply(compiler) {
    compiler.hooks.emit.tap("NetlifyPlugin", compilation => {
      if ("headers" in this.configuration) {
        const headersFile = createHeaderFile(this.configuration.headers);
        compilation.assets["_headers"] = {
          source: () => headersFile,
          size: () => headersFile.length
        };
      }
      if ("redirects" in this.configuration) {
        const redirects = createRedirectFile(this.configuration.redirects);
        compilation.assets["_redirects"] = {
          source: () => redirects,
          size: () => redirects.length
        };
      }
    });
  }
}
