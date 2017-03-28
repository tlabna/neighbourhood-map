var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-htmlmin');

// Resize pizzeria.jpg since it's too large and we can save on file size
gulp.task('moveImages', function() {
    gulp.src('src/images/*')
        .pipe(gulp.dest('dist/images'));
});

// Minify CSS
gulp.task('minifycss', function() {
    gulp.src('src/css/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});


// Minify JavaScript
gulp.task('minifyjs', function() {
    gulp.src('src/js/*.js')
        // Disable mangle since variable changes are
        // affecting knockout js from functioning correctly
        .pipe(uglify({ mangle: false }))
        .pipe(gulp.dest('dist/js'));
});

// Minify HTML
gulp.task('minifyhtml', function() {
    gulp.src('src/*.html')
        .pipe(minifyHTML({
            ignoreCustomComments: [/^\s+ko/, /\/ko\s+$/],
            minifyJS: true
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['moveImages', 'minifycss', 'minifyjs', 'minifyhtml']);
