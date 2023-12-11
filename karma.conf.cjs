/* eslint-env node */

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox' ]
const browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

const suite = 'test/bundle.ts';

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'chai',
      'webpack'
    ],

    files: [
      suite
    ],

    preprocessors: {
      [suite]: [ 'webpack' ]
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
        ],
        alias: {
          'lang-feel': '.'
        }
      }
    }
  });
};
