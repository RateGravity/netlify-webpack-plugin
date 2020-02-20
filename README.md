# Netlify Webpack Plugin

A set of plugins for webpack that generate netlify files.

## Netlify Headers

Generates a `_headers` file for the publish directory of your site.
See https://docs.netlify.com/routing/headers/ for more info.

Syntax:

```javascript
new NetlifyHeaders({
  'Strict-Transport-Security': ['max-age=31536000', 'preload'],
  'X-XSS-Protection': ['1', 'mode=block'],
  'X-Content-Type-Options': 'nosniff'
});
```

## Netlify Redirects

Generates a `_redirects` file for the publish directory of your site.
See https://docs.netlify.com/routing/redirects/ for more info.

Syntax:

```javascript
new NetlifyRedirects([
  { from: '/api/*', to: `${apiUrlAdvisor}:splat`, status: 200 },
  { from: '/old', to: '/index.html', status: 308 },
  { from: '/auth', to: '/auth.html', status: 200 },
  { from: '/*', to: '/index.html', status: 200 }
]);
```
