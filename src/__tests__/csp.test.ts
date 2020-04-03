import { csp } from '../csp';
import { createHeaderFile } from '../headers';

describe('csp', () => {
  it('creates csp header value', () => {
    const value = csp({
      'default-src': ["'self'", "'none'"],
      'frame-src': ["'none'"]
    });
    expect(value).toEqual(["default-src 'self' 'none'", ["frame-src 'none'"]]);
  });
  it('outputs correct header', () => {
    const result = createHeaderFile({
      '/*': {
        'Content-Security-Policy': csp({
          'default-src': ["'self'"],
          'img-src': ['*'],
          'media-src': ['media1.com', 'media2.com'],
          'script-src': ['userscripts.example.com']
        })
      }
    });
    expect(result).toBe(
      `/*
  Content-Security-Policy: default-src 'self'; img-src *; media-src media1.com media2.com;` +
        ` script-src userscripts.example.com`
    );
  });
});
