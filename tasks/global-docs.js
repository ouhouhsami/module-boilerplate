module.exports = function(gulp, packageJson) {
  
  function copyPartial(name){
    var origPartials = boilerplatePath + '/docs/partials/';
    var destPartials = './docs/partials/';
    fs.createReadStream(origPartials + name)
      .pipe(fs.createWriteStream( destPartials + name));
  }
  
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
    return gulp.src([boilerplatePath + 'docs/README.tmpl.md', boilerplatePath + 'docs/index.tmpl.html'])
      .pipe(gulp.dest(boilerplatePath + '_tmpdocs/'));
  });
  
  gulp.task('get-default-partials', function() {
      return gulp.src(boilerplatePath + 'docs/partials/*')
      .pipe(gulp.dest(boilerplatePath + '_tmpdocs/partials/'));
  });
  
  gulp.task('get-repo-tpl', function() {
    return gulp.src(['./docs/README.tmpl.md', './docs/index.tmpl.html'])
      .pipe(conflict(boilerplatePath + '_tmpdocs/', {cwd : boilerplatePath + 'todel'}))
      .pipe(gulp.dest(boilerplatePath + '_tmpdocs/'));
  });
  
  gulp.task('get-repo-partials', function() {
    return gulp.src('./docs/partials/*')
      .pipe(conflict(boilerplatePath + '_tmpdocs/partials/', {cwd : boilerplatePath + 'todel'}))
      .pipe(gulp.dest(boilerplatePath + '_tmpdocs/partials/'));
  });
  
  gulp.task('clean-after', function() {
    return gulp.src(boilerplatePath + '_tmpdocs/', {read: false})
        .pipe(clean());
  });
  
};