/**
 * This function will automatically be executed prior to the jest tooling
 *   being initialized. See: https://jestjs.io/docs/configuration#globalsetup-string
 */
module.exports = async () => {
  // Ensure the test suite runs in UTC time.
  process.env.TZ = 'UTC';
};
