import { compilation as webpackCompilation, Compiler } from 'webpack';
import { createHeaderFile, Headers } from './headers';
import { createRedirectFile, Redirect } from './redirects';

export interface NetlifyPluginConfiguration {
  /**
   * The Netlify Headers to Generate
   */
  readonly headers?: Headers;
  /**
   * The Redirect Rules to generate
   */
  readonly redirects?: Redirect[];
}

function tapEmit(
  compiler: Compiler
): (name: string, syncHook: (compilation: webpackCompilation.Compilation) => void) => void {
  if ('hooks' in compiler) {
    return compiler.hooks.emit.tap;
  } else {
    // use the the legacy api if that's what is provided.
    return (_: string, syncHook: (compilation: webpackCompilation.Compilation) => void) => {
      (compiler as any).plugin(
        'emit',
        (compilation: webpackCompilation.Compilation, callback: () => void) => {
          syncHook(compilation);
          callback();
        }
      );
    };
  }
}

// Given a configuration writes it out as _headers and _redirects files
export class NetlifyPlugin {
  private readonly configuration: NetlifyPluginConfiguration;

  constructor(configuration: NetlifyPluginConfiguration) {
    this.configuration = configuration;
  }

  public apply(compiler: Compiler): void {
    tapEmit(compiler)('NetlifyPlugin', (compilation) => {
      if (this.configuration.headers) {
        const headersFile = createHeaderFile(this.configuration.headers);
        compilation.assets._headers = {
          source: () => headersFile,
          size: () => headersFile.length
        };
      }
      if (this.configuration.redirects) {
        const redirects = createRedirectFile(this.configuration.redirects);
        compilation.assets._redirects = {
          source: () => redirects,
          size: () => redirects.length
        };
      }
    });
  }
}
