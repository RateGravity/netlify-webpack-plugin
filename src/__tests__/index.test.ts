import { exec } from 'child_process';
import * as fs from 'fs';
import path from 'path';

describe('NetlifyHeaders', () => {
  const root = path.resolve(__dirname, '../../example/dist');

  beforeAll(async () => {
    await exec('yarn webpack');
  });

  it('generates headers based on input', () => {
    expect.assertions(1);
    const file = fs.readFileSync(`${root}/_headers`).toString();
    expect(file).toBe('/*\n' + '  x-from: netlify-test');
  });

  it('generates redirects based on input', () => {
    expect.assertions(1);
    const file = fs.readFileSync(`${root}/_redirects`).toString();
    expect(file).toBe(
      '/netlify/*    https://www.netlify.com/docs/:splat    200!\n' +
        '/pass-through/*    https://www.netlify.com/docs/:splat    200\n' +
        '/*    /index.html    200'
    );
  });
});
