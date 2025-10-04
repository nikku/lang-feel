// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox' ]
const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

var singleStart = process.env.SINGLE_START;

const suite = 'test/bundle.ts';

module.exports = function(karma) {
  const config = {

    frameworks: [
      'mocha',
      'chai',
      'webpack'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [suite]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress' ],

    browsers,

    autoWatch: false,
    singleRun: true,

    webpack: {
      mode: 'development',
      devtool: 'eval-source-map',
      module: {
        rules: [
          {
            test: /\.ts?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          }
        ]
      },
      resolve: {
        extensions: [
          '.ts',
          '.js'
        ]
      }
    }
  };

  if (singleStart) {
    config.browsers = [].concat(config.browsers, 'Debug');
    config.envPreprocessor = [].concat(config.envPreprocessor || [], 'SINGLE_START');
  }

  karma.set(config);
};
