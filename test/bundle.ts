// @ts-expect-error webpack extension
const allTests = require.context('.', true, /-spec\.ts$/);

allTests.keys().forEach(allTests);