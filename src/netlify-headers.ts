export type NetlifyHeaderConfig = Record<string, any>;

const formatValue = (value: any) => {
  if (typeof value === 'object') {
    if (value.join != null) {
      return value.join('; ');
    } else {
      return Object.keys(value)
        .map(key => {
          if (typeof value[key] === 'boolean') {
            if (value[key]) {
              return key;
            } else {
              return null;
            }
          }
          return `${key}=${value[key]}`;
        })
        .filter(v => v != null)
        .join('; ');
    }
  }
  return value;
};

/**
 * Generates a `_headers` file for the publish directory of your site.
 *   See https://docs.netlify.com/routing/headers/ for more info.
 */
class NetlifyHeaders {
  private headers: NetlifyHeaderConfig;

  constructor(headers: NetlifyHeaderConfig) {
    this.headers = headers;
  }

  public apply(compiler: any) {
    const before =
      compiler.options.devServer.before ||
      (() => {
        // ... no-op.
      });
    compiler.options.devServer.before = (app: any) => {
      app.use((req: any, res: any, next: any) => {
        Object.keys(this.headers).forEach(key => res.header(key, formatValue(this.headers[key])));
        next();
      });
      before(app);
    };

    compiler.hooks.emit.tapAsync('emit', (compilation: any, callback: any) => {
      const headerFile = `/*\n${Object.keys(this.headers)
        .map(key => `  ${key}: ${formatValue(this.headers[key])}`)
        .join('\n')}`;
      compilation.assets._headers = {
        source: () => headerFile,
        size: () => headerFile.length
      };
      callback();
    });
  }
  public csp(cspPolicy: Record<string, string[]>) {
    return Object.entries(cspPolicy).map(([directive, value]) => `${directive} ${value.join(' ')}`);
  }
}

export { NetlifyHeaders };
