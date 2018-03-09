import tomlify from 'tomlify';
import fs from './fs';

// Given a configuration writes it out as a netlify.toml file
// Hooks into Wepback dev server to support the redirects and headers
class NetlifyPlugin {

    constructor(configuration) {
      this.configuration = configuration;
    }
  
    apply(compiler) {
      compiler.plugin('emit', (compilation, callback) => {
        const tomlFile = tomlify(this.configuration);
        
        compilation.assets['netlify.toml'] = {
          source: () => tomlFile,
          size: () => tomlFile.length
        }
        callback();
      });
      
      fs(compiler);
      
    }

}

module.exports = NetlifyPlugin;
