module.exports = function(gulp, packageJson) {
  
  var tools = {};
  
  //replace for [cdn] dynamic value and check http in url name
  tools.getOptionUrl = function(option, cdn) {
    if(option.ircamlib)  
      option.url = "/Ircam-RnD/" + option.url + "/master/" + option.url + ".js";
    if(option.cdn)
      option.url = cdn + option.url;
    if(option.url.substr(0, 2) == '//')
      option.url = 'http:' + option.url;
    return option.url;
  }
  
  tools.processOptions = function(options) {
    options.internalCSS = [];
    options.externalCSS = [];
    options.internalJS = [];
    options.externalJS = [];
    for(var i in options.css.internal)
        options.internalCSS.push(tools.getOptionUrl(options.css.internal[i], options.cdn));
    for(var i in options.css.external)
        options.externalCSS.push(tools.getOptionUrl(options.css.external[i], options.cdn));
    for(var i in options.js.internal)
        options.internalJS.push(tools.getOptionUrl(options.js.internal[i], options.cdn));
    for(var i in options.js.external)
        options.externalJS.push(tools.getOptionUrl(options.js.external[i], options.cdn));
  }
  
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
  var runSequence = require("run-sequence");
  var fs = require('fs');
  var path = require('path');
  
  try {
    var options = require('../../docs/options.json');
  }
  catch (e) {
    gutil.log(gutil.colors.yellow("docs/options.json does not exist execute"), gutil.colors.cyan("gulp init-docs"));
  }
  
  var libName = packageJson.exports || packageJson.name;
  var exports =  packageJson.exports;
  var dependencies = Object.keys(packageJson && packageJson.dependencies || {});
  
  //lib with dependencies
  gulp.task('standalone', function () {
    return browserify('./index.js')
      .bundle({
        standalone : libName
      })
      .pipe(source(packageJson.name + '.js'))
      .pipe(gulp.dest('./build/'));
  });
  
  //Minify lib with dependencies 
  gulp.task('uglify', function() {
    return browserify('./index.js')
      .bundle({
        standalone : libName
      })
      .pipe(source(packageJson.name + '.min.js'))
      .pipe(streamify(uglify))
      .pipe(gulp.dest('./build/'));
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
      } else {
        gutil.log(e);
      }
    });
    
    gulp.src(['node_modules/module-boilerplate/docs/options.json'])
      .pipe(verb({
        dest: 'options.json',
      }))
      .pipe(gulp.dest('./docs'));
    
    fs.mkdir("./docs/partials", function(e) {
      if(!e || (e && e.code === 'EEXIST')){
        gutil.log("The folder /docs/partials was created!");
      } else {
        gutil.log(e);
      }
    });
    
    fs.writeFile("./docs/partials/_api.md", "#Usage", function(err) {
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
        dest: 'README.md'
      }))
      .pipe(gulp.dest('./'));
  });
  
  // Start internal task for create gh-pages
  gulp.task('verb-gh-pages-snd', function() {
    return gulp.src('./docs/snd/*')
      .pipe(gulp.dest('./gh-pages/snd/'));
  });
    
  gulp.task('verb-gh-pages-datas', function() {
    return gulp.src('./docs/datas/*')
      .pipe(gulp.dest('./gh-pages/datas/'));
  });      
  
  gulp.task('verb-gh-pages-utils', function() {
    return gulp.src('./docs/utils/*')
      .pipe(gulp.dest('./gh-pages/utils/'));
  });
  
  gulp.task('verb-gh-pages-lib', function() {
    return gulp.src('./build/' + packageJson.name + '.js')
      .pipe(gulp.dest('./gh-pages/js/'));
  });
  
  gulp.task('process-options', function() {
    tools.processOptions(options);
    return true;
  });
  
  //Download internal JS files
  gulp.task('verb-gh-pages-dl-internal-js', function() {
    if(options.internalJS.length > 0) {
      return download(options.internalJS)
        .pipe(gulp.dest("./gh-pages/js"));
    }
    else
      return true;
  });
  
  //Download internal CSS files
  gulp.task('verb-gh-pages-dl-internal-css', function() {
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
        dest: 'index.html'
      }))
      .pipe(gulp.dest('./gh-pages'));
  });
  
  gulp.task('update-demo-path', function() {
    return gulp.src('./gh-pages/**')
      .pipe(gulp.dest('./examples/'));
  });
  
  gulp.task('launch-server-gh-page', function() {
    gutil.log(gutil.colors.green("Test your gh-pages on 9002 port"));
    connect.server({
      root: ['./gh-pages'],
      port: 9002,
      livereload: false
    });
  });
  
  gulp.task('launch-server-demo-path', function() { 
    gutil.log(gutil.colors.green("Test your demo path on 9003 port"));
    return connect.server({
      root: ['./examples'],
      port: 9003,
      livereload: false
    });
  });
  
  gulp.task('clean-gh-pages', function() {
    return gulp.src('./gh-pages/', {read: false})
        .pipe(clean());
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
  
  //Generation of github pages
  //delete the path before
  //mix repo content and boilerplate content
  //get static content like snd, datas and utils
  //procces the css and js dependencies
  //download internal css and js dependencies
  //create index.html and test with the local server
  //delete tmp files
  gulp.task('gh-pages', function(callback) {
    runSequence(
      'clean-gh-pages', 'get-default-tpl', 'get-default-partials', 'get-repo-tpl', 'get-repo-partials', 
      'verb-gh-pages-snd','verb-gh-pages-datas', 'verb-gh-pages-utils', 'verb-gh-pages-lib', 
      'process-options', 'verb-gh-pages-dl-internal-js', 'verb-gh-pages-dl-internal-css', 
      'verb-gh-pages', 'launch-server-gh-page', 'clean-after',
    callback);
  });
  
  //update demo from gh-pages but no clean the example folder before
  gulp.task('update-demo', function(callback) {
    runSequence('gh-pages', 'update-demo-path', 'launch-server-demo-path');
  });
  
  //Deploy github page to the master on gh-pages branch 
  gulp.task('deploy-gh-pages', function() {
    gulp.src("./gh-pages/**/*")
      .pipe(deploy());
  });

};