## Package.json

Add this dependencies in your repo

```js
"devDependencies": {
  "module-boilerplate": "git://github.com/Ircam-RnD/module-boilerplate.git#master",
  "fs-utils" : "0.4.3",
  "browserify": "~4.1.2",
  "mocha": "~1.17.1",
  "chai": "~1.9.0",
  "blanket": "~1.1.6",
  "gulp": "~3.8.2",
  "gulp-uglify": "~0.3",
  "gulp-connect": "~2.0.5",
  "gulp-streamify": "~0.0.5",
  "gulp-verb": "0.2.3",
  "gulp-gh-pages" : "0.3.3",
  "gulp-download" : "0.0.1",
  "gulp-conflict" : "0.1.2",
  "gulp-util" : "2.2.19",
  "gulp-clean": "^0.3.1",
  "vinyl-source-stream": "~0.1.1",
  "run-sequence" : "0.3.6"
}
```

## .gitignore

```
/node_modules/*
/gh-pages/*
```

## gulpfile.js

```js
var gulp = require('gulp');
var packageJson = require('./package.json');
var loadTasks = require('module-boilerplate');

loadTasks(gulp, packageJson);
```