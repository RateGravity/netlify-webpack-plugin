import tomlify from 'tomlify';

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
    })
    }

}

module.exports = NetlifyPlugin;
