import should from 'should';
import NetlifyPlugin from '../src/plugin';

describe('The Netlify Toml Output', () => {
  it('hooks into emit', (done) => {
    new NetlifyPlugin({}).apply({
      plugin: (stage, cb) => {
        stage.should.be.equal('emit');
        done();
      }
    })
  })
  
  it('produces a file called netlify.toml', (done) => {
    new NetlifyPlugin({}).apply({
      plugin: (_, callback) => {
        const comp = {assets: {}};
        callback(comp, () => {
          comp.assets.should.have.property('netlify.toml');
          done();
        })
      }
    })
  })
  
  it('outputs a toml version of the config', (done) => {
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
      plugin: (_, callback) => {
        const comp = {assets: {}};
        callback(comp, () => {
          comp.assets['netlify.toml'].source().should.be.equal(
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
          done();
        })
      }
    })
  })
  
})