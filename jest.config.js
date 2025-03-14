const path = require('path');

module.exports = {
  'moduleFileExtensions': [
    'js',
    'json',
    'ts'
  ],
  'rootDir': './test/',
  'testRegex': '.spec.ts$',
  'transform': {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  'testEnvironment': 'node'
};
