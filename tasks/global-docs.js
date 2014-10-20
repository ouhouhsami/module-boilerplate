module.exports = function(gulp, packageJson) {
  
  //Generation of specific docs files for the repo
  gulp.task('init-docs', function() {

    fs.mkdir("./docs", function(e) {
      if(!e || (e && e.code === 'EEXIST')){
        gutil.log("The folder /docs was created!");
    
        fs.mkdir("./docs/partials", function(e) {
    
          if(!e || (e && e.code === 'EEXIST')){
            gutil.log("The folder /docs/partials was created!");
            
            copyPartial('_head.md');
            copyPartial('_demo-master.md');
            copyPartial('_demo-ghp.md');
            copyPartial('_api.md');
            copyPartial('_status.md');

        } else {
          gutil.log(e);
        }

      });
      } else {
        gutil.log(e);
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
  
  gulp.task('clean-after', function() {
    return gulp.src(tools.boilerplatePath + '_tmpdocs/', {read: false})
        .pipe(clean());
  });
  
};