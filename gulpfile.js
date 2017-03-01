const gulp   = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();

gulp.task('clean', function () {
    return gulp.src('public/', {read: false})
        .pipe(clean());
});

gulp.task('html', function() {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('public/'));
});

gulp.task('css', function() {
    return gulp.src(['src/css/*.css'])
        .pipe(concat('main.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('public/'));
});

gulp.task('img', function() {
    gulp.src('src/img/**/*.*')
        .pipe(gulp.dest('public/img'));
});

gulp.task('js', function() {
    gulp.src('src/js/**/*.*')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('public'));
});

gulp.task('app', function() {
    gulp.src(['src/app/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public'));
});

gulp.task('build', function(callback) {
    runSequence('clean',
        ['img','html','css','js','app'],
        callback);
});

gulp.task('watch', function() {

    gulp.run('build');


    gulp.watch('src/js/**/*.js', function() {
        gulp.run('js');
    });
    
    gulp.watch('src/app/**/*.js', function() {
        gulp.run('app');
    });
   
    gulp.watch('src/img/*.*', function() {
        gulp.run('img');
    });

    gulp.watch('src/css/**/*.css', function() {
        gulp.run('css');
    });   

    gulp.watch('src/index.html', function() {
        gulp.run('html');
    });

    browserSync.init({
        server: {
            baseDir: './public/'
            // index:'dest/index.html'
        },
        host: '127.0.0.1',
        port: 4444,
        open: false,
        notify: false,
        ui: false,
        ghostMode: false
    });

    gulp.watch("./public/*.*").on('change', browserSync.reload);
});