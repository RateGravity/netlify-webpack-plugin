import fetch from 'node-fetch';
import querystring from 'querystring';

const doRedirect = (fs, app, {
  from,
  to,
  status = 301,
  query = {},
  headers
}) => {
  
  const queryMatcher = Object.keys(query).map(param => {
    const value = query[param];
    const hasParam = (req) => !!req.query[param];
    if (value.startsWith(':')) {
      const target = value.substr(1);
      return (req) => {
        if(hasParam(req)) {
          req.params[target] = req.query[param];
          return true;
        }
        return false;
      }
    } else {
      return (req) => (
        hasParam(req) && req.query[param] === value
      );
    }
  }).reduce((prev,m) => ((req) => prev(req) && m(req)), () => true);
  
  app.all(from, (req, res, next) => {
    //see if we match the query strings
    if (!queryMatcher(req)) {
      next();
      return;
    }

    const newTarget = to.replace(/\:(\w+)/g,(m, param) => {
      if (param !== 'splat') {
        if (req.params[param]) {
          return req.params[param];
        }
      } else if (req.params['0']) {
        return req.params['0'];
      }
      return m;
    });

    if (status >= 300 && status <= 399) {
      res.status(status).header('Location', newTarget).send();
      return;
    }

    if (newTarget.startsWith('/')) {
      //local file proxy
      fs.get(newTarget).then(
        file => res.status(status).send(file),
        () => next()
      );
    } else {
      fetch(
        `${newTarget}${
          req.query ? `?${querystring.stringify(req.query)}` : ''
        }`,
        {
          method: req.method,
          headers: {
            ...req.headers,
            ...headers
          },
          body: (
            req.method.toUpperCase() === 'HEAD' ||
            req.method.toUpperCase() === 'GET'
          ) ? undefined : req
        }
      ).then(
          result => {
            result.headers.forEach(
              (v,n) => res.header(n,v)
            );
            res.status(result.status);
            result.body.pipe(res);
          },
          err => res.status(500).send({error: err.toString()})
      );
    }
  });
}

export default (compiler, configuration, fs) => {
    if (!compiler || !compiler.options || !compiler.options.devServer) {
      return;
    }
    
    let before = compiler.options.devServer.before || (() => {});
    let after = compiler.options.devServer.after || (() => {});
    
    if(configuration.redirects) {
      const forced = configuration.redirects.filter(({force = false}) => force);
      const notForced = configuration.redirects.filter(
        ({force = false}) => !force
      );
      if (forced.length) {
        const b = before;
        before = (app) => {
          forced.forEach(doRedirect.bind(null, fs, app));
          b(app);
        }
      }
      if(notForced.length) {
        const a = after;
        after = (app) => {
          notForced.forEach(doRedirect.bind(null, fs, app));
          a(app);
        }
      }
    }
    
    if(configuration.headers) {
      const b = before;
      before = (app) => {
        configuration.headers.forEach(({['for']: path, values}) => {
          const headers = Object.keys(values).map(key => ({
            header: key,
            value: values[key]
          }));
          app.use(path, (_, res, next) => {
            headers.forEach(({header, value}) => res.header(header, value));
            next();
          })
        });
        b(app);
      }
    }
    
    compiler.options.devServer.before = before;
    compiler.options.devServer.after = after;
  
}
