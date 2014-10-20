module.exports = function(gulp, packageJson) {
  
  gulp.task('get-docs-readme', function() {
      gulp.src(['node_modules/module-boilerplate/docs/README.tmpl.md'])
      .pipe(gulp.dest('./docs/'));
  });
  
  //Generation of README.md
  gulp.task('verb-docs', function() {
    return gulp.src([boilerplatePath + '_tmpdocs/README.tmpl.md'])
      .pipe(verb({
        docsFolder : {docs : boilerplatePath + '_tmpdocs/'},
        dest: 'README.md'
      }))
      .pipe(gulp.dest('./'));
  });
  
  gulp.task('docs', function(callback) {
    runSequence('get-default-tpl', 'get-default-partials', 'get-repo-tpl', 'get-repo-partials', 'verb-docs', 'clean-after', callback);
  });
  
};