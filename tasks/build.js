module.exports = function(gulp, packageJson) {
  
  gulp.task('transpile', function () {
    return gulp.src('./' + packageJson.name + '.es6.js')
      .pipe(es6transpiler())
      .pipe(rename(packageJson.name + '.js'))
      .pipe(gulp.dest('./'));
  });
  
  //Minify lib with dependencies 
  gulp.task('uglify', function() {
    return browserify('./' + packageJson.name + '.js')
      .bundle({
        standalone : libName
      })
      .pipe(source(packageJson.name + '.min.js'))
      .pipe(streamify(uglify))
      .pipe(gulp.dest('./'));
  });
  
  //delete es5 temporary version when we user es6
  gulp.task('delete-es5', function () {
    return gulp.src('./' + packageJson.name + '.js', {read: false})
        .pipe(clean());
  });
  
  gulp.task('build', function(callback) {
    fs.exists('./' + packageJson.name + '.es6.js', function(exists) {
      if (exists) {
        gutil.log(gutil.colors.cyan("es6 version detected"));
        runSequence('transpile', 'uglify', callback);
      } else {
        gutil.log(gutil.colors.cyan("es5 version"));
        runSequence('uglify', callback);
      }
    });
  });
  
};