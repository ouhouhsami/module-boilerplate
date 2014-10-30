module.exports = function(gulp, packageJson) {
    
  browserify = require('browserify');
  uglify = require('gulp-uglify');
  rename = require('gulp-rename');
  streamify = require('gulp-streamify');
  connect = require('gulp-connect');
  source = require('vinyl-source-stream');
  verb = require("gulp-verb");
  deploy = require("gulp-gh-pages");
  gutil = require("gulp-util");
  download = require("gulp-download");
  conflict = require("gulp-conflict");
  clean = require("gulp-clean");
  es6transpiler = require("gulp-es6-transpiler");
  args   = require('yargs').argv;
  runSequence = require("run-sequence").use(gulp);
  fs = require('fs');
  path = require('path');
  exec = require('child_process').exec;
  markdox = require('markdox');
  libName = packageJson.exports || packageJson.name;
  
  boilerplatePath = './node_modules/module-boilerplate/';
  
}