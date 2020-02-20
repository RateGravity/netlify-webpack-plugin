const gulp = require('gulp');
const del = require('del');
const { createProject } = require('gulp-typescript');
const tsProject = createProject('tsconfig.json', { noEmit: false });

const build = () =>
  gulp
    .src(['src/**/*.ts', '!**/__*__/**'], { nodir: true })
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));

const clean = () => {
  return del('./dist');
};

const defaultTasks = gulp.series(clean, build);

module.exports = {
  build,
  clean,
  default: defaultTasks
};
