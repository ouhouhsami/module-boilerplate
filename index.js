module.exports = function(gulp, packageJson) {
  
  var browserify = require('browserify');
  var uglify = require('gulp-uglify');
  var streamify = require('gulp-streamify');
  var connect = require('gulp-connect');
  var source = require('vinyl-source-stream');
  var verb = require("gulp-verb");
  var deploy = require("gulp-gh-pages");
  var runSequence = require("run-sequence");

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
  gulp.task('dependencies', function () {
    return browserify()
      .require(dependencies)
      .bundle()
      .pipe(source('dependencies.js'))
      .pipe(gulp.dest('./tests/'));
  });
  
  //Just lib without dependencies
  gulp.task('lib', function () {
    return browserify('./index.js')
      .external(dependencies)
      .bundle({
          standalone : libName
      })
      .pipe(source('lib.js'))
      .pipe(gulp.dest('./tests/'));
  });
  
  //Server
  gulp.task('connectDev', function () {
    connect.server({
      root: ['./'],
      port: 9001,
      livereload: false
    });
  });
  
  //Generation of README.md
  gulp.task('verb-docs', function () {
    gulp.src(['docs/README.tmpl.md'])
      .pipe(verb({
        dest: 'README.md',
      }))
      .pipe(gulp.dest('./'));
  });

  //Generation of github page
  gulp.task('verb-gh-pages', function () {
    gulp.src('./docs/css/**/*', {base: './docs/'})
      .pipe(gulp.dest('./gh-pages/'));

    gulp.src('./docs/js/*', {base: './docs/'})
      .pipe(gulp.dest('./gh-pages/'));

    gulp.src(['./docs/index.tmpl.html'])
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

  gulp.task('docs', ['verb-docs']);

  gulp.task('gh-pages', ['verb-gh-pages']);
  
  //Deploy github page to the master on gh-pages branch 
  gulp.task('deploy-gh-pages', function () {
    gulp.src("./gh-pages/**/*")
      .pipe(deploy());
  });

};