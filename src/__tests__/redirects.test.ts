import { createRedirectFile } from '../redirects';

describe('createRedirectFile', () => {
  it('writes redirect rules', () => {
    const content = createRedirectFile([
      {
        from: '/netlify/*',
        to: 'https://www.netlify.com/docs/:splat',
        status: 301,
        force: true
      },
      {
        from: '/pass-through/*',
        to: 'https://www.netlify.com/docs/:splat',
        status: 200,
        force: false
      },
      {
        from: '/*',
        to: '/index.html',
        status: 200,
        force: false
      }
    ]);
    expect(content).toBe(
      `/netlify/*    https://www.netlify.com/docs/:splat    301!
/pass-through/*    https://www.netlify.com/docs/:splat    200
/*    /index.html    200`
    );
  });
  it('defaults to 301 if not specified', () => {
    const content = createRedirectFile([
      {
        from: '/netlify/*',
        to: 'https://www.netlify.com/docs/:splat',
        force: false
      }
    ]);
    expect(content).toBe('/netlify/*    https://www.netlify.com/docs/:splat    301');
  });
  it('defaults to not force if not specified', () => {
    const content = createRedirectFile([
      {
        from: '/netlify/*',
        to: 'https://www.netlify.com/docs/:splat',
        status: 301
      }
    ]);
    expect(content).toBe('/netlify/*    https://www.netlify.com/docs/:splat    301');
  });
  it('outputs query matchers', () => {
    const result = createRedirectFile([
      {
        from: '/foo',
        to: '/bar-ma/:id',
        query: {
          state: 'MA',
          id: ':id'
        }
      }
    ]);
    expect(result).toBe(`/foo    state=MA    id=:id    /bar-ma/:id    301`);
  });
  it('outputs language conditions', () => {
    const result = createRedirectFile([
      {
        from: '/foo',
        to: '/foo.php',
        conditions: {
          language: ['en-us', 'en-au']
        }
      }
    ]);
    expect(result).toBe(`/foo    /foo.php    301    Language=en-us,en-au`);
  });
  it('outputs country conditions', () => {
    const result = createRedirectFile([
      {
        from: '/foo',
        to: '/foo.php',
        conditions: {
          country: ['US', 'CA']
        }
      }
    ]);
    expect(result).toBe('/foo    /foo.php    301    Country=US,CA');
  });
  it('outputs role conditions', () => {
    const result = createRedirectFile([
      {
        from: '/foo',
        to: '/foo.php',
        conditions: {
          role: ['admin', 'user']
        }
      }
    ]);
    expect(result).toBe('/foo    /foo.php    301    Role=admin,user');
  });
  it('outputs multiple conditions', () => {
    const result = createRedirectFile([
      {
        from: '/foo',
        to: '/mercia.html',
        conditions: {
          language: ['en-us'],
          country: ['US'],
          role: ['patriot']
        }
      }
    ]);
    expect(result).toBe(
      '/foo    /mercia.html    301    Language=en-us    Country=US    Role=patriot'
    );
  });
  it('outputes no conditions', () => {
    const result = createRedirectFile([
      {
        from: '/foo',
        to: '/foo.php',
        conditions: {}
      }
    ]);
    expect(result).toBe('/foo    /foo.php    301');
  });
});
