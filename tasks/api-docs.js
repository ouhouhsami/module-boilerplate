module.exports = function(gulp, packageJson) {
  
  //generation of api.md
  gulp.task('get-api-docs', function() {
    fs.readdir('./docs', function (err, files) { 
      if (!err) {
        var ommitprivate = args.ommitprivate || true;
        if(ommitprivate == 'no') ommitprivate = false;
        
        var file = './' + packageJson.name + '.js';
        if (fs.existsSync('./' + packageJson.name + '.es6.js'))
          file = './' + packageJson.name + '.es6.js';
        
        markdox.process(file, {'ommitprivate' : ommitprivate}, function(err, output){
          fs.writeFileSync("./docs/api.md", output, "UTF-8");
        });
      }
      else {
        gutil.log(gutil.colors.yellow("run gulp init-docs first"));
      }
    });
    
  });

  //Just for debug
  gulp.task('get-api-doc-json', function() {
    var dox = require('./node_modules/markdox/node_modules/dox/index');
    
    var file = './' + packageJson.name + '.js';
    if (fs.existsSync('./' + packageJson.name + '.es6.js'))
      file = './' + packageJson.name + '.es6.js';
          
    var code = fs.readFileSync(file, "utf8");
    var obj = dox.parseComments(code, { raw: true });
    process.stdout.write(JSON.stringify(obj, null, 2));
  });
 
  
};