import MemoryFileSystem from 'memory-fs';
import { compilation as webpackCompilation } from 'webpack';
import { copyFunctions } from '../functions';

describe('functions', () => {
  describe('copyFunctions', () => {
    const FILE_CONTENT = 'console.log("Hello world!");';
    const FILE_LENGTH = FILE_CONTENT.length;
    const inputFs = new MemoryFileSystem();

    beforeAll(() => {
      inputFs.writeFileSync('/example.js', FILE_CONTENT);
    });

    it('injects the scripts as output assets', () => {
      const compilation = {
        inputFileSystem: inputFs,
        assets: {}
      } as webpackCompilation.Compilation;
      copyFunctions('functions', ['/example.js'], compilation);
      const expectedKey = 'netlify/functions/example.js';
      expect(compilation).toMatchObject({
        assets: {
          [expectedKey]: {
            source: expect.any(Function),
            size: expect.any(Function)
          }
        }
      });
      expect(compilation.assets[expectedKey].source()).toBe(FILE_CONTENT);
      expect(compilation.assets[expectedKey].size()).toBe(FILE_LENGTH);
    });

    it('can accept a path/name config', () => {
      const compilation = {
        inputFileSystem: inputFs,
        assets: {}
      } as webpackCompilation.Compilation;
      copyFunctions('functions', [{ path: '/example.js', name: 'my-script' }], compilation);
      const expectedKey = 'netlify/functions/my-script.js';
      expect(compilation).toMatchObject({
        assets: {
          [expectedKey]: {
            source: expect.any(Function),
            size: expect.any(Function)
          }
        }
      });
    });
  });
});
