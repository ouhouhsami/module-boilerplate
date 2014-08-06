module.exports = function(gulp, packageJson) {
  
  var tools = {};
  
  //replace for [cdn] dynamic value and check http in url name
  tools.getOptionUrl = function(option, cdn) {
    if(option.ircamlib)
      option.url = "/ircam-rnd/" + option.url + "/master/" + option.url + ".js";
    if(option.cdn)
      option.url = cdn + option.url;
    if(option.url.substr(0, 2) == '//')
      option.url = 'http:' + option.url;
    return option.url;
  };
  
  tools.processOptions = function(options) {
    options.internalCSS = [];
    options.externalCSS = [];
    options.internalJS = [];
    options.externalJS = [];
    if(options.css && options.css.internal) {
      for(var i in options.css.internal)
        options.internalCSS.push(tools.getOptionUrl(options.css.internal[i], options.cdn));
    }
    if(options.css && options.css.internal) {
      for(var i in options.css.internal)
        options.externalCSS.push(tools.getOptionUrl(options.css.external[i], options.cdn));
    }
    if(options.js && options.js.internal) {
      for(var i in options.js.internal)
        options.internalJS.push(tools.getOptionUrl(options.js.internal[i], options.cdn));
    }
    if(options.js && options.js.external) {
      for(var i in options.js.external)
        options.externalJS.push(tools.getOptionUrl(options.js.external[i], options.cdn));
    }
  };
  
  tools.boilerplatePath = './node_modules/module-boilerplate/';
  
  var browserify = require('browserify');
  var uglify = require('gulp-uglify');
  var streamify = require('gulp-streamify');
  var connect = require('gulp-connect');
  var source = require('vinyl-source-stream');
  var verb = require("gulp-verb");
  var deploy = require("gulp-gh-pages");
  var gutil = require("gulp-util");
  var download = require("gulp-download");
  var conflict = require("gulp-conflict");
  var clean = require("gulp-clean");
  //var exec = require('gulp-exec');
  var runSequence = require("run-sequence");
  var fs = require('fs');
  var path = require('path');
  var exec = require('child_process').exec;
  
  try {
    var options = require('../../docs/options.json');
  }
  catch (e) {
    var options = {
        cdn : "https://rawgit.com"
    }
    //gutil.log(gutil.colors.yellow("docs/options.json does not exist execute"), gutil.colors.cyan("gulp init-docs"));
  }
  
  var libName = packageJson.exports || packageJson.name;
  var dependencies = Object.keys(packageJson && packageJson.dependencies || {});
  
  //lib with dependencies
  gulp.task('standalone', function () {
    return browserify('./index.js')
      .bundle({
        standalone : libName
      })
      .pipe(source(packageJson.name + '.js'))
      .pipe(gulp.dest('./'));
  });
  
  //Minify lib with dependencies 
  gulp.task('uglify', function() {
    return browserify('./index.js')
      .bundle({
        standalone : libName
      })
      .pipe(source(packageJson.name + '.min.js'))
      .pipe(streamify(uglify))
      .pipe(gulp.dest('./'));
  });
  
  //Just dependencies without lib
  gulp.task('dependencies', function() {
    return browserify()
      .require(dependencies)
      .bundle()
      .pipe(source('dependencies.js'))
      .pipe(gulp.dest('./tests/'));
  });
  
  //Just lib without dependencies
  gulp.task('lib', function() {
    return browserify('./index.js')
      .external(dependencies)
      .bundle({
          standalone : libName
      })
      .pipe(source('lib.js'))
      .pipe(gulp.dest('./tests/'));
  });
  
  //Server
  gulp.task('connectDev', function() {
    connect.server({
      root: ['./'],
      port: 9001,
      livereload: false
    });
  });
  
  //Generation of specific docs files for the repo
  gulp.task('init-docs', function() {
    fs.mkdir("./docs", function(e) {
      if(!e || (e && e.code === 'EEXIST')){
        gutil.log("The folder /docs was created!");
        fs.mkdir("./docs/partials", function(e) {
        if(!e || (e && e.code === 'EEXIST')){
          gutil.log("The folder /docs/partials was created!");
          fs.writeFile("./docs/partials/_api.md", "## Usage", function(err) {
            if(err) {
                gutil.log(err);
              } else {
                gutil.log("The file _api.md was created!");
              }
            });
            
            fs.writeFile("./docs/partials/_demo-ghp.md", "<script></script>", function(err) {
              if(err) {
                gutil.log(err);
              } else {
                gutil.log("The file _demo-ghp.md was created!");
              }
          });
        } else {
          gutil.log(e);
        }
      });
      } else {
        gutil.log(e);
      }
    });
  });
  
  gulp.task('get-docs-options', function() {
      gulp.src(['node_modules/module-boilerplate/docs/options.json'])
      .pipe(gulp.dest('./docs/'));
  });      
  
  gulp.task('get-docs-readme', function() {
      gulp.src(['node_modules/module-boilerplate/docs/README.tmpl.md'])
      .pipe(gulp.dest('./docs/'));
  });
  
  gulp.task('get-docs-index', function() {
      gulp.src(['node_modules/module-boilerplate/docs/index.tmpl.html'])
      .pipe(gulp.dest('./docs/'));
  });
  
  gulp.task('get-default-tpl', function() {
    return gulp.src([tools.boilerplatePath + 'docs/README.tmpl.md', tools.boilerplatePath + 'docs/index.tmpl.html'])
      .pipe(gulp.dest(tools.boilerplatePath + '_tmpdocs/'));
  });
  
  gulp.task('get-default-partials', function() {
      return gulp.src(tools.boilerplatePath + 'docs/partials/*')
      .pipe(gulp.dest(tools.boilerplatePath + '_tmpdocs/partials/'));
  });
  
  gulp.task('get-repo-tpl', function() {
    return gulp.src(['./docs/README.tmpl.md', './docs/index.tmpl.html'])
      .pipe(conflict(tools.boilerplatePath + '_tmpdocs/', {cwd : tools.boilerplatePath + 'todel'}))
      .pipe(gulp.dest(tools.boilerplatePath + '_tmpdocs/'));
  });
  
  gulp.task('get-repo-partials', function() {
    return gulp.src('./docs/partials/*')
      .pipe(conflict(tools.boilerplatePath + '_tmpdocs/partials/', {cwd : tools.boilerplatePath + 'todel'}))
      .pipe(gulp.dest(tools.boilerplatePath + '_tmpdocs/partials/'));
  });
  
  //Generation of README.md
  gulp.task('verb-docs', function() {
    return gulp.src([tools.boilerplatePath + '_tmpdocs/README.tmpl.md'])
      .pipe(verb({
        docsFolder : {docs : tools.boilerplatePath + '_tmpdocs/'},
        dest: 'README.md'
      }))
      .pipe(gulp.dest('./'));
  });

  gulp.task('process-options', function() {
    tools.processOptions(options);
    return true;
  });
  
  gulp.task('get-gh-pages', function(){
    fs.mkdir("./gh-pages", function(e) {
      if(!e || (e && e.code === 'EEXIST')){
        gutil.log("The folder ./gh-pages was created!");
        exec('git clone -b gh-pages https://github.com/Ircam-RnD/' + packageJson.name + '.git gh-pages', function (err, stdout, stderr) {
          if(!fs.existsSync("./gh-pages")) {
            fs.mkdir("./gh-pages", function(e) {
              gutil.log("No gh-pages branch found. The folder ./gh-pages was re-created!");
            });
          }
          else {
            exec('cd gh-pages;rm -rf .git', function (err, stdout, stderr) {
            });
          }
        });
      }
    });
  });
  
  //Download internal JS files
  gulp.task('gh-pages-dl-internal-js', function() {
    if(options.internalJS.length > 0) {
      return download(options.internalJS)
        .pipe(gulp.dest("./gh-pages/js"));
    }
    else
      return true;
  });
  
  //Download internal CSS files
  gulp.task('gh-pages-dl-internal-css', function() {
    if(options.internalCSS.length > 0) {
      return download(options.internalCSS)
        .pipe(gulp.dest("./gh-pages/css"));
    }
  });
  
  //Generation of github page
  gulp.task('verb-gh-pages', function() {
  
    for(var i in options.internalJS)
      options.internalJS[i] = path.basename(options.internalJS[i]);
    for(var i in options.internalCSS)
      options.internalCSS[i] = path.basename(options.internalCSS[i]);
    
    gutil.log(options.internalCSS);
    
    return gulp.src([tools.boilerplatePath + '_tmpdocs/index.tmpl.html'])
      .pipe(verb({
        options : options,
        css_default : options.cdn + "/Ircam-RnD/module-boilerplate/master/docs/css/main.css",
        js_default : "//cdnjs.cloudflare.com/ajax/libs/highlight.js/8.0/highlight.min.js",
        js_lib : options.cdn + "/Ircam-RnD/" + packageJson.name + "/master/build/" + packageJson.name + ".js",
        dest: 'index.html'
      }))
      .pipe(gulp.dest('./gh-pages'));
  });
  
  gulp.task('get-gh-pages-into-examples-path', function() {
    return gulp.src('./gh-pages/**')
      .pipe(gulp.dest('./examples/'));
  });
  
  gulp.task('serve-gh-pages', function() {
    gutil.log(gutil.colors.green("Test your gh-pages on 9002 port"));
    connect.server({
      root: ['./gh-pages'],
      port: 9002,
      livereload: false
    });
  });
  
  gulp.task('serve-examples', function() {
    gutil.log(gutil.colors.green("Test your demo path on 9003 port"));
    return connect.server({
      root: ['./examples'],
      port: 9003,
      livereload: false
    });
  });
 
  gulp.task('clean-after', function() {
    return gulp.src(tools.boilerplatePath + '_tmpdocs/', {read: false})
        .pipe(clean());
  });

  gulp.task('default', ['standalone', 'uglify']);

  gulp.task('watch', function() {
    gulp.watch("./", ['dependencies', 'lib']);
  });

  gulp.task('test', ['dependencies', 'lib', 'connectDev' , 'watch']);

  gulp.task('docs', function(callback) {
    runSequence('get-default-tpl', 'get-default-partials', 'get-repo-tpl', 'get-repo-partials', 'verb-docs', 'clean-after', callback);
  });
  
  gulp.task('gh-pages-init', function(callback) {
    runSequence('repo-clone', 'gh-pages-checkout');
  });
  
  //Generation of github pages
  //mix repo content and boilerplate content
  //procces the css and js dependencies
  //download internal css and js dependencies
  //create index.html and test with the local server
  //delete tmp files
  gulp.task('gh-pages', function(callback) {
    if(!fs.existsSync("./gh-pages")) {
        gutil.log(gutil.colors.yellow("gh-pages folder does not exist, we first create the folder and checkout gh-pages from github."), gutil.colors.cyan("You need to re-execute gh-pages for generate pages"));
        runSequence('get-gh-pages', callback);
    }
    else {
        runSequence(
          'get-default-tpl', 'get-default-partials', 'get-repo-tpl', 'get-repo-partials',
          'process-options', 'gh-pages-dl-internal-js', 'gh-pages-dl-internal-css',
          'verb-gh-pages', 'clean-after',
        callback);
    }
  });
  
  //update demo from gh-pages but no clean the example folder before
  gulp.task('export-examples', function(callback) {
    runSequence('gh-pages', 'get-gh-pages-into-examples-path');
  });
  
  //Deploy github page to the master on gh-pages branch 
  gulp.task('deploy-gh-pages', function() {
    gulp.src("./gh-pages/**/*")
      .pipe(deploy({remoteUrl : packageJson.repository.url}));
  });

};
