'use strict';

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const mocha = new Mocha();
const testDir = __dirname;

fs.readdirSync(testDir).filter(function(file) {
  return file.substr(-3) === '.js';
}).forEach(function(file) {
  mocha.addFile(
    path.join(testDir, file)
  );
});

mocha.reporter('spec');

mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
