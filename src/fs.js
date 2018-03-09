
export default (compiler) => {
  const files = new Promise(res => (
    compiler.plugin('after-emit', (compilation, callback) => {
      const fs = {};
      Object.keys(compilation.assets).forEach(fileName => {
        fs[`/${fileName}`] = compilation.assets[fileName].source;
      });
      res(fs);
      callback();
    })
  ));
  
  return {
    exists: fileName => files.then(({[fileName]: file}) => !!file),
    get: fileName => files.then(({[fileName]: file}) => file())
  }
  
}