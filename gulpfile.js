const gulp = require('gulp');
const sass = require('gulp-sass');
const gutil = require('gulp-util');
const autoprefixer = require('gulp-autoprefixer');

const sassSource = './assets/sass/yuiko.scss';
const sassDestination = './public/styles';
const sassOptions = { dev: { outputStyle: 'expanded' }, prod: { outputStyle: 'compressed' }};

gulp.task('sass', () => {
    return gulp.src(sassSource)
        .pipe(sass(sassOptions.dev).on('error', sass.logError))
        .pipe(gulp.dest(sassDestination));
});

gulp.task('watch', () => {
    return gulp.watch(sassSource, ['sass'])
        .on('change', event => gutil.log(`File ${event.path} was ${event.type}, running tasks...`));
});

gulp.task('prod', () => {
    return gulp.src(sassSource)
        .pipe(sass(sassOptions.prod).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(sassDestination));
});

gulp.task('default', ['sass']);
