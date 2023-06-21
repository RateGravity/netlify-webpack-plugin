const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

/**
 * Produce the package.json for the types package.
 */
const preparePackageJson = () => {
  // Set version to the tag number
  exec('git describe --tags HEAD | xargs yarn version --no-git-tag-version --new-version');
};

/**
 * Publish the package to npm
 */
const publishPackage = () => {
  console.log('Performing npm publication of package.');
  // Write the npmrc file containing our auth token.
  fs.writeFileSync(
    path.join(__dirname, '..', '.npmrc'),
    `//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}`
  );
  exec(
    `npm publish`,
    {
      env: {
        ...process.env,
        npm_config_registry: 'https://registry.npmjs.org/' // override yarn's environment settings
      }
    },
    (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
    }
  );
};

preparePackageJson();
publishPackage();
