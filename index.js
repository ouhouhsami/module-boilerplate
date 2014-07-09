module.exports = function(gulp, packageJson) {
  
  var tools = {};
  
  //replace for [cdn] dynamic value and check http in url name
  tools.processCdn = function(options) {
    for(var i in options.css) {
        options.css[i] = options.css[i].replace(/\[cdn\]/g, options.cdn);
        if(options.js[i].substr(0, 2) == '//')
            options.js[i] = 'http:' + options.js[i];
    }
    for(var j in options.js) {
        options.js[j] = options.js[j].replace(/\[cdn\]/g, options.cdn);
        if(options.js[j].substr(0, 2) == '//')
            options.js[j] = 'http:' + options.js[j];
    }
  }
  
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
  var runSequence = require("run-sequence");
  var fs = require('fs');
  
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
  
  //get remote files to the doc repositories
  gulp.task('dl-docs-files', function() {
    tools.processCdn(options);
    
    download(options.css)
      .pipe(gulp.dest("./docs/css"));

    download(options.js)
      .pipe(gulp.dest("./docs/js"));
  });
  
  gulp.task('get-default-tpl', function() {
    return gulp.src(['./node_modules/module-boilerplate/docs/README.tmpl.md', './node_modules/module-boilerplate/docs/index.tmpl.html'])
      .pipe(gulp.dest('./_tmpdocs/'));
  });
  
  gulp.task('get-default-partials', function() {
      return gulp.src('./node_modules/module-boilerplate/docs/partials/*')
      .pipe(gulp.dest('./_tmpdocs/partials/'));
  });
  
  gulp.task('get-repo-tpl', function() {
    return gulp.src(['./docs/README.tmpl.md', './docs/index.tmpl.html'])
      .pipe(conflict('./_tmpdocs/', {cwd : './_tmpdocs/todel'}))
      .pipe(gulp.dest('./_tmpdocs/'));
  });
  
  gulp.task('get-repo-partials', function() {
    return gulp.src('./docs/partials/*')
      .pipe(conflict('./_tmpdocs/partials/', {cwd : './_tmpdocs/todel'}))
      .pipe(gulp.dest('./_tmpdocs/partials/'));
  });
  
  //Generation of README.md
  gulp.task('verb-docs', function() {
    return gulp.src(['_tmpdocs/README.tmpl.md'])
      .pipe(verb({
        dest: 'README.md'
      }))
      .pipe(gulp.dest('./'));
  });

  //Generation of github page
  gulp.task('verb-gh-pages', function() {
    
    if(!options.external.css) {
      gulp.src('./docs/css/**/*', {base: './docs/'})
        .pipe(gulp.dest('./gh-pages/'));
    }
    
    if(!options.external.js) {
      gulp.src('./docs/js/**/*', {base: './docs/'})
        .pipe(gulp.dest('./gh-pages/'));
    }
    
    gulp.src(['./_tmpdocs/index.tmpl.html'])
      .pipe(verb({
        name: libName,
        dest: 'index.html'
      }))
      .pipe(gulp.dest('./gh-pages'));
  });

  gulp.task('default', ['standalone', 'uglify']);

  gulp.task('watch', function() {
    gulp.watch("./", ['dependencies', 'lib']);
  });

  gulp.task('test', ['dependencies', 'lib', 'connectDev' , 'watch']);

  gulp.task('docs', function(callback) {
    runSequence('get-default-tpl', 'get-default-partials', 'get-repo-tpl', 'get-repo-partials', 'verb-docs', callback);
  });

  gulp.task('gh-pages', ['verb-gh-pages']);
  
  //Deploy github page to the master on gh-pages branch 
  gulp.task('deploy-gh-pages', function() {
    gulp.src("./gh-pages/**/*")
      .pipe(deploy());
  });

};