import NetlifyPlugin from '../src/plugin';

describe('The Netlify Toml Output', () => {
  it('hooks into emit', () => {
    const plugin = jest.fn();
    new NetlifyPlugin({}).apply({plugin});
    expect(plugin.mock.calls[0][0]).toBe('emit');
  })
  
  it('produces a file called netlify.toml', () => {
    const comp = {assets: {}};
    new NetlifyPlugin({}).apply({
      plugin: (_, callback) => callback(comp, () => {})
    });
    expect(comp.assets['netlify.toml']).toBeDefined();
  })
  
  it('outputs a toml version of the config', () => {
    const comp = {assets: {}};
    new NetlifyPlugin({
      redirects: [
        {
          from: "/*",
          to: "/index.html",
          status: 200,
        },
        {
          from: "/api/*",
          to: "https://api.example.com/:spat",
          status: 200,
          force: true
        }
      ]
    }).apply({
      plugin: (_, callback) => callback(comp, () => {})
    });
    expect(comp.assets['netlify.toml'].source()).toEqual(
`[[redirects]]
from = "/*"
to = "/index.html"
status = 200
[[redirects]]
from = "/api/*"
to = "https://api.example.com/:spat"
status = 200
force = true`
    );
  })
  
})