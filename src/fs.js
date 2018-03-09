
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
    get: fileName => files.then(({[fileName]: file}) => {
      if (!file) {
        throw new Error('File Not Found!');
      }
      return file()
    })
  }
  
}