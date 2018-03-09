import should from 'should';
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
  
  it('has files that exist', () => {
    return fileSystem.exists('/index.html').then(b => b.should.be.true());
  })
  
  it('doesnt have files that dont exist', () => {
    return fileSystem.exists('/logo.png').then(b => b.should.be.false());
  })
  
  it('gets files that exist', () => {
    return fileSystem.get('/index.js').then(b => b.should.be.equal(
      '+function(){return 1;}()'
    ))
  })
  
})