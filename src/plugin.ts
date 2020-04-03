import { Compiler } from "webpack";
import { createHeaderFile, Headers } from "./headers";
import { createRedirectFile, Redirect } from "./redirects";

export interface NetlifyPluginConfiguration {
  readonly headers?: Headers;
  readonly redirects?: Redirect[];
}

// Given a configuration writes it out as _headers and _redirects files
export class NetlifyPlugin {
  private readonly configuration: NetlifyPluginConfiguration;

  constructor(configuration: NetlifyPluginConfiguration) {
    this.configuration = configuration;
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.emit.tap("NetlifyPlugin", compilation => {
      if (this.configuration.headers) {
        const headersFile = createHeaderFile(this.configuration.headers);
        compilation.assets["_headers"] = {
          source: () => headersFile,
          size: () => headersFile.length
        };
      }
      if (this.configuration.redirects) {
        const redirects = createRedirectFile(this.configuration.redirects);
        compilation.assets["_redirects"] = {
          source: () => redirects,
          size: () => redirects.length
        };
      }
    });
  }
}
