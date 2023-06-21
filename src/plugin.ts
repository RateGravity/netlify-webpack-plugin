import { compilation as webpackCompilation, Compiler } from 'webpack';
import { copyFunctions, FunctionDefinition } from './functions';
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
  /**
   * Netlify function scripts to copy into the final build directory.
   *   These scripts will be inserted as-is. No transpilation
   *   or transformation will be applied to them.
   *
   * To learn more about Netlify functions, see: https://docs.netlify.com/functions/overview/
   */
  readonly functions?: FunctionDefinition[];
  /**
   * Netlify edge function scripts to inject into the final build
   *   directory. These scripts will be inserted as-is. No
   *   transpilation or transformation will be applied to them.
   *
   * To learn more about Netlify edge functions, see: https://docs.netlify.com/edge-functions/overview/
   */
  readonly edgeFunctions?: FunctionDefinition[];
}

function tapEmit(
  compiler: Compiler
): (name: string, syncHook: (compilation: webpackCompilation.Compilation) => void) => void {
  if ('hooks' in compiler) {
    return (name: string, syncHook: (compilation: webpackCompilation.Compilation) => void) =>
      compiler.hooks.emit.tap(name, syncHook);
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

      if (this.configuration.functions) {
        copyFunctions('functions', this.configuration.functions, compilation);
      }

      if (this.configuration.edgeFunctions) {
        copyFunctions('edge-functions', this.configuration.edgeFunctions, compilation);
      }
    });
  }
}
