import MemoryFileSystem from 'memory-fs';
import webpack from 'webpack';
import { NetlifyPlugin } from '../plugin';

describe('integration with webpack api', () => {
  const inputFs = new MemoryFileSystem();

  beforeAll(() => {
    inputFs.mkdirSync('/input');
    inputFs.writeFileSync('/input/index.js', `document.write('Hello World');`);
  });

  it('outputs nothing on an empty config', (done) => {
    expect.assertions(3);

    const outputFs = new MemoryFileSystem();
    const compiler = webpack({
      entry: '/input/index.js',
      output: {
        path: '/dist'
      },
      plugins: [new NetlifyPlugin({})]
    });
    compiler.inputFileSystem = inputFs;
    compiler.outputFileSystem = outputFs;

    compiler.run((err) => {
      expect(err).toBeFalsy();
      expect(outputFs.existsSync('/dist/_headers')).toBe(false);
      expect(outputFs.existsSync('/dist/_redirects')).toBe(false);
      done();
    });
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

  describe('functions and edge functions', () => {
    const outputFs = new MemoryFileSystem();
    const compiler = webpack({
      entry: '/input/index.js',
      output: {
        path: '/dist'
      },
      plugins: [
        new NetlifyPlugin({
          functions: ['/src/hello-world.ts', '/src/goodnight-moon.ts'],
          edgeFunctions: [
            '/src/edge/nonce-adder.ts',
            { path: '/src/edge/email-verification.ts', name: 'spam-filter' }
          ]
        })
      ]
    });
    compiler.outputFileSystem = outputFs;
    compiler.inputFileSystem = inputFs;

    beforeAll((done) => {
      inputFs.mkdirSync('/src');
      inputFs.mkdirSync('/src/edge');
      // Note, none of these are actual examples of functions or edge functions.
      //   If you're looking for real examples, check the example folder or see
      //   the README for links to Netlify's documentation.
      inputFs.writeFileSync('/src/hello-world.ts', `Hello world`);
      inputFs.writeFileSync('/src/goodnight-moon.ts', `Goodnight moon`);
      inputFs.writeFileSync('/src/edge/nonce-adder.ts', `Nonce added`);
      inputFs.writeFileSync('/src/edge/email-verification.ts', `Email verified`);
      compiler.run(done);
    });

    it.each([
      ['/src/hello-world.ts', '/dist/netlify/functions/hello-world.ts'],
      ['/src/goodnight-moon.ts', '/dist/netlify/functions/goodnight-moon.ts'],
      ['/src/edge/nonce-adder.ts', '/dist/netlify/edge-functions/nonce-adder.ts'],
      ['/src/edge/email-verification.ts', '/dist/netlify/edge-functions/spam-filter.ts']
    ])('wrote %s to %s', (src, dest) => {
      expect(outputFs.readFileSync(dest).toString()).toBe(inputFs.readFileSync(src).toString());
    });
  });
});
