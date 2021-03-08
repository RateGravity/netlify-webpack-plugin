# netlify-webpack-plugin

Webpack Plugin for Netlify Configuration Files

The Netlify Webpack Plugin hooks into the Emit stage of webpack's bundler to
output `_redirects` and `_headers` files that are included in a netlify deploy
to configure the redirect and headers.

## Installation

Install the netlify webpack plugin with your package manager of choice

```
yarn add --dev netlify-webpack-plugin
npm install --save-dev netlify-webpack plugin
```

## Adding to Webpack:

The netlify plugin should be added to the plugins section of your webpack config.

```js
const { NetlifyPlugin } = require('netlify-webpack-plugin');

module.exports = {
  // webpack config goes here.
  plugins: [new NetlifyPlugin({})]
};
```

## Configuring

The `NetlifyPlugin` takes a single configuration argument that can specify headers and redirects. If both are omitted then no files are output.

### Redirects

The format for redirects is intended to mimic the [netlify.toml](https://docs.netlify.com/configure-builds/file-based-configuration/#redirects) file configuration.

```ts
new NetlifyPlugin({
  redirects: [
    {
      from: "/old-path",
      to: "/new-path",
      status: 301,
      force: false
      query: {
        path: ":path"
      }
      conditions: {
        language: ["en","es"],
        country: ["US"]
      }
    },
    {
      from: "/api/*",
      to: "https://us-central1-netlify-intercom.cloudfunctions.net/readHeaders/:splat",
      status: 200,
      force: true,
      conditions: {
        role: ["admin", "cms"]
      }
    }
  ]
});
```

The above configuration will generate the following `_redirects` file:

```
/old-path path=:path /new-path 301 Language=en,es Country=US
/api/* https://us-central1-netlify-intercom.cloudfunctions.net/readHeaders/:splat 200! Role=admin,cms
```

For each redirect role the following fields are supported:

- `from`: Required. The url on which to trigger the redirect, you can match with path parts "/api/:userId" or wild cards "/api/\*"
- `to`: Required. The url or path to redirect to.
- `status`: Optional, defaults to 301. The status code for the redirect, use 200 to proxy.
- `force`: Optional, defaults to false. If true this redirect should apply even if there is content that netlify would normally serve.
- `query`: Optional, defaults to none. If preset the query parameters that must be matched for this redirect. Query parameters may include capturing arguments such as: `{id: ':id'}` which can be reused in the `to` field.
- `conditions` Optional, defaults to none. If present specifies the conditions in which this rewrite rules is applied. Conditions can list one or more of the condition types: `languages`, `countries`, or `role`. The value of the condition should be an array of all the values that match.

### Headers

The Netlify webpack plugin supports writing a variety of headers to the headers file.

```ts
new NetlifyPlugin({
  headers: {
    '/templates/index.html': {
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': [1, { mode: 'block' }]
    },
    '/templates/index2.html': {
      'X-Frame-Options': 'SAMEORIGIN'
    }
  }
});
```

The above configuration will generate the following `_headers` file:

```
/templates/index.html
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
/templates/index2.html
  X-Frame-Options: SAMEORIGIN
```

#### Structure of the Headers option

The headers option takes an object with keys for each path on which to specify headers for. The value of each of those keys are objects where they keys are specific headers. There are several ways to declare the value of a header:

**Simple Values**
The value of a header can be given as a string or number ex.

`{ 'X-Frame-Options': 'DENY' }`

This will produce a header with the given value.

**Simple Values with Tokens**
The value of a header can be given as a 2 element array where the first element is the string or number value and the second element is an object or array of tokens, ex.

`{ 'X-XSS-Protection': [1, { mode: 'block'}] }`

The value of the header will be the first element in the array then a ";" semi-colon followed by the various tokens in the form of "_token-name_=_token-value_" separated by a semi-colon. In the case that the value of a token is a boolean, just the token name will be included if the value is true, otherwise the token is skipped.
If the second element of the array is an array the values will be joined together with semi-colons.

**Multiple Simple Values**
Netlify supports multi-valued header fields. Simple fields in this category should be specified with an array of values, ex.

`{ 'cache-control': ['no-cache', 'no-store', 'must-revalidate']}`

These each element in the array follows the rules established above for simple values and simple values with tokens.

**Multiple-Complex-Values**
In cases where you need to specify a value in a header you can use the object syntax of multiple headers ex.

```
{
  'cache-control': {
    'max-age': 0,
    'no-cache': true,
    'no-store': true
    'must-revalidate': true
  }
}
```

In the above example the "no-cache", "no-store" and "must-revalidate" keys are treated as the values of our 3 cache-control headers because their value is tru. The forth header will be:
`cache-control: max-age=0`.

When dealing with Multi-valued headers you can use any of the same values you use for the single valued headers. For instance while not recommended the following is allowed.

```ts
{
  'Dummy-Example': {
    'html': ["load", { lazy: true, progressive: 'no'  }],
    'css': 'skip',
    'js': false
  }
}
```

This would produce the following header

```
Dummy-Example: html=load; lazy; progressive: no, css=skip
```
