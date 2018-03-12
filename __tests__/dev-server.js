import devServer from '../src/dev-server';
import fetch from 'node-fetch';

jest.mock('node-fetch', () => {
  return jest.fn(() => Promise.resolve({
    headers: {
      forEach: f => {
        f('Netlify','X-From');
        f('Basic', 'Auth');
      }
    },
    status: 202,
    body: {
      pipe: target => target.end()
    }
  }));
})


describe('the netlify dev-server', () => {
  const compiler = {
    options: {
      devServer: {}
    }
  }
  
  const boundDev = devServer.bind(null, compiler);
  
  beforeEach(() => {
    compiler.options.devServer = {};
  })
  
  afterEach(() => {
    jest.resetModules();
  })
  
  it('attaches handlers for paths', (done) => {
   boundDev({
     headers: [{
       "for": '/my-long-path',
       values: {}
     }]
   }, {get: () => Promise.reject('Error!')});
   compiler.options.devServer.before({
     use: (path) => {
       expect(path).toBe('/my-long-path');
       done();
     }
   })
  })

  it('sets headers from the headers config', (done) => {
    expect.assertions(2);
    boundDev({
      headers: [{
        "for": '/*',
        values: {
          "x-test-header": 'Test'
        }
      }]
    }, {get: () => Promise.reject('Error!')});
    compiler.options.devServer.before({
      use: (_, callback) => callback(
        {},
        {
          header: (header, value) => {
            expect(header).toBe('x-test-header');
            expect(value).toBe('Test');
          }
        },
        done
      )
    });
  })

  it('matches redirects on from path', (done) => {
    expect.assertions(1);
    boundDev({
      redirects: [
        {
          from: '/my-awesome-path',
          to: '/someplace-else'
        }
      ]
    }, {get: () => Promise.reject('Error!')});
    compiler.options.devServer.after({
      all: (path) => {
        expect(path).toBe('/my-awesome-path');
        done();
      }
    })
  });

  it('matches redirects on path, uses before if forcing', (done) => {
    expect.assertions(1);
    boundDev({
      redirects: [
        {
          from: '/my-awesome-path',
          to: '/someplace-else',
          force: true
        }
      ]
    }, {get: () => Promise.reject('Error!')});
    compiler.options.devServer.before({
      all: (path) => {
        expect(path).toBe('/my-awesome-path');
        done();
      }
    })
  })

  it('rejects if query doesnt match', (done) => {
    boundDev({
      redirects: [
        {
          from: '/*',
          to: '/index.html',
          query: {
            'element': 'fire'
          }
        }
      ]
    }, {get: () => Promise.reject('Error!')});
    compiler.options.devServer.after({
      all: (_, callback) => {
        callback(
          {
            query: {}
          },
          {},
          done
        )
      }
    });
  })

  it('sends redirect on match', (done) => {
    expect.assertions(3);
    boundDev({
      redirects: [
        {
          from: '/*',
          to: '/:element.html',
          status: 302,
          query: {
            'el': ':element'
          }
        }
      ]
    }, {get: () => Promise.reject('Error!')});
    compiler.options.devServer.after({
      all: (_, callback) => {
        callback(
          {
            query: {
              el: 'fire'
            },
            params: {}
          },
          {
            status: s => {
              expect(s).toBe(302)
              return {
                header: (name, value) => {
                  expect(name).toBe('Location');
                  expect(value).toBe('/fire.html');
                  return {
                    send: done
                  }
                }
              }
            }
          },
          () => {throw new Error('Should not have called next!')}
        );
      }
    })
  })

  it('serves from fs', (done) => {
    expect.assertions(2);
    boundDev(
      {
        redirects: [
          {
            from: '/*',
            to: '/404.html',
            status: 404,
          }
        ]
      },
      {
        get: fileName => {
          if (fileName === '/404.html') {
            return Promise.resolve('MY 404 FILE!');
          }
          return Promise.reject('Error!');
        }
      }
    );
    compiler.options.devServer.after({
      all: (_, callback) => {
        callback(
          {
            params: {}
          },
          {
            status: s => {
              expect(s).toBe(404)
              return {
                send: content => {
                  expect(content).toBe('MY 404 FILE!');
                  done();
                }
              }
            }
          },
          () => {throw new Error('Should not have called next!')}
        );
      }
    });
  })
   
  it('routes to remote server', () => {
    expect.assertions(4);
    boundDev(
      {
        redirects: [
          {
            from: '/api/*',
            to: 'https://api.example.com/:splat',
            status: 200,
          }
        ]
      },
      {
        get: fileName => Promise.reject('Error!')
      }
    );
    compiler.options.devServer.after({
      all: (_, callback) => {
        callback(
          {
            method: 'post',
            headers: {
              'x-basic-auth': 'Disallow'
            },
            params: {
              '0': 'netlify'              
            }
          },
          {
            status: s => {
              expect(s).toBe(202);
            },
            header: (name, value) => {
              if (name === 'X-From') {
                expect(value).toBe('Netlify');
              }
              if (name === 'Auth') {
                expect(value).toBe('Basic')
              }
            },
            end:() => {}
          },
          () => {throw new Error('Should not have called next!')}
        );
      }
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/netlify?',
      {
        method: 'post',
        headers: {
          'x-basic-auth': 'Disallow'
        },
        body: expect.anything()
      }
    );
  })
})