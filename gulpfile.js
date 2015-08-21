var module_path    = "node_modules/";
var bower_files    = "vendor/";
// var mainBowerFiles = require(module_path + 'main-bower-files');
var gulp           = require(module_path + 'gulp'),
    gutil          = require(module_path + 'gulp-util');
    plumber        = require(module_path + 'gulp-plumber'),
    changed        = require(module_path + 'gulp-changed'),
    less           = require(module_path + 'gulp-less'),
    autoprefixer   = require(module_path + 'gulp-autoprefixer'),
    minify         = require(module_path + 'gulp-minify-css'),
    jshint         = require(module_path + 'gulp-jshint'),
    concat         = require(module_path + 'gulp-concat'),
    imagemin       = require(module_path + 'gulp-imagemin'),
    cache          = require(module_path + 'gulp-cache'),
    uglify         = require(module_path + 'gulp-uglify'),
    rename         = require(module_path + 'gulp-rename'),
    notify         = require(module_path + 'gulp-notify'),
    livereload     = require(module_path + 'gulp-livereload'),
    del            = require(module_path + 'del'),
    path           = require(module_path + 'path');

// error handler
var onError = function (err) {  
  gutil.beep();
  console.log(err);
  this.emit('end');
};

var bases = {
  src:  'resources/',
  dist: '',
};

var paths = {  
    'dev': {
        'views':  bases.src + '**/*.php',
        'less':   bases.src + 'assets/less/',
        'js':     bases.src + 'assets/js/',
        'img':    bases.src + 'assets/img/**/*.*',
        'vendor': bower_files,
        'files': [bases.src + 'favicon.ico', bases.src + 'assets/files/**/*.*']
    },
    'production': {
        'base':   bases.dist,
        'views':  bases.dist + '**/*.php',
        'assets': bases.dist + 'assets/',
        'css':    bases.dist + 'assets/css/',
        'js':     bases.dist + 'assets/js/',
        'img':    bases.dist + 'assets/img/'
    }
};


// gulp.task('bower', function() {
//   return gulp.src(mainBowerFiles(), {
//       base: 'bower_components'
//     })
//     .pipe(gulp.dest('public_html/lib'));
// });

// gulp the html
// gulp.task('views', function() {
//   return gulp.src(paths.dev.jade+'*.jade')
//     .pipe(plumber({errorHandler: onError}))
//     .pipe(jade({
//       pretty: true
//     }))
//     .pipe(gulp.dest(paths.production.base))
//     .pipe(notify({ message: 'Views task complete' }));
// });

gulp.task('views', function() {
  return gulp.src(paths.dev.views)
    .pipe(changed(paths.production.base))
    .pipe(gulp.dest(paths.production.base))
    .pipe(notify({ message: 'Views task complete' }));
});


// gulp the styles
gulp.task('css', function() {  
  return gulp.src(paths.dev.less+'main.less')
    .pipe(plumber({errorHandler: onError}))
    .pipe(less())
    // .pipe(gulp.dest(paths.production.css))
    .pipe(minify({keepSpecialComments:0}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.production.css))
    .pipe(notify({ message: 'LESS task complete' }));
});

// gulp the scripts
gulp.task('js', function(){  
  return gulp.src([
      paths.dev.vendor+'jquery/dist/jquery.js',
      paths.dev.vendor+'bootstrap/js/modal.js',
      paths.dev.vendor+'bootstrap/js/tooltip.js',
      paths.dev.vendor+'bootstrap/js/popover.js',
      // paths.dev.vendor+'bootstrap/js/collapse.js',
      // paths.dev.vendor+'bootstrap/js/transition.js',
      paths.dev.vendor+'parsleyjs/dist/parsley.js',
      '!'+paths.dev.js+'_*.js',
      paths.dev.js+'**/*'
    ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.production.js))
    .pipe(notify({ message: 'Scripts task complete' }));
});


// gulp the images
gulp.task('images', function() {
  return gulp.src(paths.dev.img)
    // .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.production.img))
    .pipe(notify({ message: 'Images task complete' }));
});

// gulp the fonts
gulp.task('fonts', function() {
  return gulp.src([
      paths.dev.vendor+'bootstrap/fonts/**/*',
      paths.dev.vendor+'fontawesome/fonts/**/*',
    ])
    .pipe(gulp.dest(paths.production.assets+'fonts'))
    .pipe(notify({ message: 'Font task complete' }));
});

// copy all other files
gulp.task('copy', function() {
  return gulp.src(paths.dev.files, { base: './resources/' })
  .pipe(gulp.dest(paths.production.base))
  .pipe(notify({ message: 'Copy task complete' }));
});

// clean all the things!
gulp.task('clean', function(cb) {
  del([
    paths.production.base+'assets/**/*',
  ], {force: true}, cb);
});

// Default task - gulp all the things!
gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'images', 'fonts', 'copy');
});


// watch for changes
gulp.task('watch', function() {
  // Watch .jade files
  gulp.watch(paths.production.views);
  // Watch .less files
  gulp.watch(paths.dev.less + '*.less', ['css']);
  // Watch .js files
  gulp.watch(paths.dev.js + '*.js', ['js']);
  // Watch image files
  gulp.watch(paths.dev.img, ['images']);
  // Watch other files
  gulp.watch(paths.dev.files, ['copy']);
  // Create LiveReload server
  livereload.listen();
  // Watch any files in dist/, reload on change
  gulp.watch([paths.production.views  + '**']).on('change', livereload.changed);
  gulp.watch([paths.production.assets + '**']).on('change', livereload.changed);
});