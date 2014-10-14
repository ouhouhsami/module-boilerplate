## Gulp commands

* `gulp` - build the lib in root folder : transpile es6 -> es5 if necessary and make uglify version
* `gulp test` - build standalone lib and dependencies and launch server on 9001 port for unit testing
* `gulp init-docs` - create "docs" and "partials" folder with empty "_api.md", "_demo-ghp.md" files
* `gulp get-docs-options` - get "options.json" to "docs" folder
* `gulp get-docs-readme` -  get "README.tmpl.md" to "docs" folder
* `gulp get-docs-index` - push "index.tmpl.html" to "docs" folder
* `gulp docs` - create README.md
* `gulp get-api-docs` - generate "docs/api.md" with parsing "src/index.js" with forked markdox version without private function
* `gulp get-api-docs --ommitprivate=no` - generate "docs/api.md" with private function
* `gulp gh-pages` - create gh-pages
* `gulp serve-gh-pages` - test your gh-pages online on 9002 port
* `gulp deploy-gh-pages` - push gh-pages folder to github
* `gulp export-examples` - create examples folder with gh-pages demo
* `gulp serve-examples` - test your examples online on 9003 port

## Package.json

Add this dependencies in your repo

```js
"devDependencies": {
  "module-boilerplate": "git://github.com/Ircam-RnD/module-boilerplate.git#master",
  "gulp": "~3.8.2"
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

## options.json

```js
{
  "cdn" : "https://rawgit.com",
  "css" : {
    "external" : [
      {"cdn": true, "url": "/Ircam-RnD/module-boilerplate/master/docs/css/main.css"}
    ],
    "internal": []
  },
  "js" : {
  	"external" : [
      {"url": "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.0/highlight.min.js"},
      {"cdn": true, "ircamlib" : true, "url": "player"},
      {"cdn": true, "ircamlib" : true, "url": "buffer-loader"}
    ],
    "internal": []
  }
}
```
