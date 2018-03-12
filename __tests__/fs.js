import fs from '../src/fs';

describe('the webpack file system', () => {
  let fileSystem = null;
  
  beforeEach(() => {
    fileSystem = fs({
      plugin: (stage, callback) => {
        if (stage === 'after-emit') {
          callback({
            assets: {
              "index.html": {
                source: () => '<!DOCTYPE HTML><html></html>'
              },
              "index.js": {
                source: () => '+function(){return 1;}()'
              }
            }
          }, () => {});
        }
      }
    });
  })
  
  it('doesnt have files that dont exist', () => {
    expect.assertions(1);
    return fileSystem.get('/logo.png').catch(err => expect(err).toBeDefined());
  })
  
  it('gets files that exist', () => {
    expect.assertions(1);
    return fileSystem.get('/index.js').then(b => expect(b).toEqual(
      '+function(){return 1;}()'
    ))
  })
  
})