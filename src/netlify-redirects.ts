import fetch from 'node-fetch';
import querystring from 'querystring';

/**
 * Generates a `_redirects` file for the publish directory of your site.
 *   See https://docs.netlify.com/routing/redirects/ for more info.
 */
interface NetlifyRedirectPattern {
  to: string;
  from: string;
  status: string | number;
}

class NetlifyRedirects {
  private patterns: NetlifyRedirectPattern[];
  constructor(patterns: NetlifyRedirectPattern[]) {
    this.patterns = patterns;
  }

  public apply(compiler: any) {
    const fs: Record<string, any> = {};

    const doRedirect = (app: any, { from, to, status }: NetlifyRedirectPattern) => {
      const parsedStatus = parseInt(status.toString().replace('!', ''));
      const parts = from.split(' ');
      app.all(parts[0], (req: any, res: any, next: any) => {
        // see if we match the query strings
        for (let i = 1; i < parts.length; i++) {
          const [param, value] = parts[i].split('=');
          if (req.query[param]) {
            if (value.startsWith(':')) {
              req.params[value.substr(1)] = req.query[param];
              continue;
            } else if (req.query[param] === value) {
              // matching keep going
              continue;
            }
          }
          // not matching end..
          next();
          return;
        }

        const newTarget = to.replace(/\:(\w+)/g, (m, param) => {
          if (param !== 'splat') {
            if (req.params[param]) {
              return req.params[param];
            }
          } else if (req.params['0']) {
            return req.params['0'];
          }
          return m;
        });

        if (parsedStatus >= 300 && parsedStatus <= 399) {
          res
            .status(parsedStatus)
            .header('Location', newTarget)
            .send();
          return;
        }

        if (newTarget.startsWith('/')) {
          // local file proxy
          if (fs[newTarget]) {
            res.status(parsedStatus).send(fs[newTarget]());
            return;
          }
        } else {
          const { host, ...headers } = req.headers;
          fetch(`${newTarget}?${querystring.stringify(req.query)}`, {
            method: req.method,
            headers,
            body: req
          }).then(result => {
            result.headers.forEach((v, n) => res.set(n, v));
            res.status(result.status);
            result.body.pipe(res);
          });
          return;
        }

        next();
      });
    };

    const before =
      compiler.options.devServer.before ||
      (() => {
        // ... no-op
      });
    compiler.options.devServer.before = (app: any) => {
      this.patterns
        .filter(({ status }) => status.toString().endsWith('!'))
        .forEach(pattern => doRedirect(app, pattern));
      before(app);
    };

    const after =
      compiler.options.devServer.after ||
      (() => {
        // ... no-op
      });
    compiler.options.devServer.after = (app: any) => {
      after(app);
      this.patterns
        .filter(({ status }) => !status.toString().endsWith('!'))
        .forEach(pattern => doRedirect(app, pattern));
    };

    compiler.hooks.emit.tapAsync('emit', (compilation: any, callback: any) => {
      const redirectFile = this.patterns
        .map(({ from, to, status }) => `${from}    ${to}    ${status}`)
        .join('\n');
      compilation.assets._redirects = {
        source: () => redirectFile,
        size: () => redirectFile.length
      };
      callback();
    });

    compiler.hooks.emit.tapAsync('after-emit', (compilation: any, callback: any) => {
      Object.keys(compilation.assets).forEach(fileName => {
        fs[`/${fileName}`] = compilation.assets[fileName].source;
      });
      callback();
    });
  }
}

export { NetlifyRedirects };
