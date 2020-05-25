import MemoryFileSystem from 'memory-fs';
import webpack from 'webpack';
import { NetlifyPlugin } from '../plugin';

describe('integration with webpack api', () => {
  const inputFs = new MemoryFileSystem();

  beforeAll(() => {
    inputFs.mkdirSync('/input');
    inputFs.writeFileSync('/input/index.js', `document.write('Hello World');`);
  });

  describe('_headers and _redirects files', () => {
    const fs = new MemoryFileSystem();
    const compiler = webpack({
      entry: '/input/index.js',
      output: {
        path: '/dist'
      },
      plugins: [
        new NetlifyPlugin({
          headers: { '/*': { 'x-from': 'netlify-test' } },
          redirects: [{ from: '/*', to: '/index.html' }]
        })
      ]
    });
    compiler.outputFileSystem = fs;
    compiler.inputFileSystem = inputFs;

    beforeAll((done) => {
      compiler.run(done);
    });

    it('_headers file content', () => {
      expect(fs.readFileSync('/dist/_headers').toString()).toBe(`/*\n  x-from: netlify-test`);
    });

    it('_redirects file content', () => {
      expect(fs.readFileSync('/dist/_redirects').toString()).toBe('/*    /index.html    301');
    });
  });
});
