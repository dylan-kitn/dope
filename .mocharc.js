'use strict';

module.exports = {
  diff: true,
  extension: ['ts'],
  package: './package.json',
  slow: 75,
  timeout: 0,
  ui: 'bdd+',
  require: [
    'ts-node/register',
    '.mochautil.js'
  ],
  spec: [
    'src/*.test.ts',
    'src/**/*.test.ts'
  ],
  ignore: [
    'src/*_bak/*.test.ts',
    'src/**/*_bak/*.test.ts'
  ],
  'watch-files': [
    'src/*.ts',
    'src/**/*.ts'
  ],
  'watch-ignore': [
    'src/*_bak/**/*.ts',
    'src/**/*_bak/**/*.ts'
  ]
};
