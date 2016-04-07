var gulp = require('gulp'),
    inject = require('gulp-inject'),
    bowerFiles = require('main-bower-files'),
    clean = require('gulp-clean'),
    angularFilesort = require('gulp-angular-filesort'),
    uglify = require('gulp-uglify'),
    cleanCss = require('gulp-clean-css'),
    filter = require('gulp-filter'),
    concat = require('gulp-concat'),
    merge = require('merge-stream'),
    browserSync = require('browser-sync').create();

var config = {
    paths: {
        src: './src',
        build: './build',
        bower: './bower_components'
    }
};

gulp.task('clean', function () {
   return gulp.src(config.paths.build, {read:false})
       .pipe(clean());
});

gulp.task('serve', ['inject'], function () {
    browserSync.init({
        port: 3010,
        server: {
            baseDir: [config.paths.build],
            routes: {
                '/bower_components': "bower_components"
            }
        },
        files: [
            config.paths.src + '/**'
        ]
    })
});

gulp.task('inject', function () {
    var cssFiles = gulp.src([
        config.paths.src + '**/*.css'
    ], {read: false});

    var jsFiles = gulp.src([
        config.paths.src + '**/*.js'])
        .pipe(angularFilesort());

    return gulp.src(config.paths.src + '/index.html')
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
        .pipe(inject(cssFiles, {ignore: 'src', addRootSlash: false}))
        .pipe(inject(jsFiles, {ignore: 'src', addRootSlash: false}))
        .pipe(gulp.dest(config.paths.build));
});

// Optimized Build
gulp.task('minify-css', function () {
    var vendorStyles = gulp.src(bowerFiles())
        .pipe(filter(['**/*.css']))
        .pipe(concat('vendor.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest(config.paths.build  + '/styles'));

    var appStyles = gulp.src(config.paths.src + '/**/*.css')
        .pipe(concat('app.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest(config.paths.build  + '/styles'));

    return merge(vendorStyles,appStyles);
});

gulp.task('minify-js', function () {
    var vendorJs = gulp.src(bowerFiles())
        .pipe(filter(['**/*.js']))
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.paths.build  + '/scripts'));

    var appJs = gulp.src(config.paths.src + '/**/*.js')
        .pipe(angularFilesort())
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.paths.build  + '/scripts'));

    return merge(vendorJs,appJs);
});

gulp.task('htmls', function () {
    return gulp.src([config.paths.src + '/**/*.html',
            '!' + config.paths.src + '/index/html'])
        .pipe(gulp.dest(config.paths.build));
});

gulp.task('others', function () {
    return gulp.src([config.paths.src + '/**/*.*',
            '!**/*/html',
            '!**/*.js',
            '!**/*.css'
    ])
        .pipe(gulp.dest(config.paths.build));
});

gulp.task('build', ['minify-css', 'minify-js', 'htmls', 'others'], function () {
    var vendorFiles = gulp.src([
        config.paths.build + 'styles/vendor.min.css',
        config.paths.build + 'scripts/vendor.min.js'
    ], {read: false});

    var appFiles = gulp.src([
            config.paths.src + '/styles/app.min.css',
            config.paths.src + '/scripts/app.min.js'
    ], {read: false});

    return gulp.src(config.paths.src + '/index.html')
        .pipe(inject(vendorFiles, {name: 'vendor.min', ignore: 'build', addRootSlash: false}))
        .pipe(inject(appFiles, {name: 'app.min', ignore: 'build', addRootSlash: false}))
        .pipe(gulp.dest(config.paths.build));
});