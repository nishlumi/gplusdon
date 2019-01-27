var gulp = require('gulp');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');

gulp.task('default', function () {
    return gulp.src(['static/*.js', 'static/**/*.js'])
        .pipe(plumber())
        .pipe(babel())
        .pipe(gulp.dest('static/destjs'));
});
gulp.task('watch', function () {
    gulp.watch(src, ['babel']);
});
