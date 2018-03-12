const gulp = require('gulp');
const del = require('del')
const babel = require('gulp-babel');

gulp.task('build', () => (
  gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
));

gulp.task('clean', () => {
  return del('./dist');
});

gulp.task('default', [ 'clean', 'build' ]);