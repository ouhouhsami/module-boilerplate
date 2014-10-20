module.exports = function(gulp, packageJson) {
  
  var dependencies = Object.keys(packageJson && packageJson.dependencies || {});
  
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
  
  gulp.task('test', ['dependencies', 'lib', 'connectDev' , 'watch']);
  
};