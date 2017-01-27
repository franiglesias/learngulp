var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var
    jsBase = 'src/js',
    jsSources = ['src/js/**/*.js'],
    sassSources = ['src/scss/**/*.scss'],
    htmlSources = ['src/**/*.html'],
    outputDir = '/Library/WebServer/Documents/playground';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file))
                .isDirectory();
        });

}
// Move index.html to destination

gulp.task('copy', function() {
    gulp.src(htmlSources)
        .pipe(gulp.dest(outputDir))
});

// Process scss file

gulp.task('sass', function() {
    gulp.src(sassSources)
        .pipe(sass({
            style: 'expanded'
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(outputDir + '/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(outputDir + '/css'))
});

gulp.task('scripts', function() {
    var folders = getFolders('src/js');
    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(jsBase, folder, '/*.js'))
            .pipe(concat(folder + '.js'))
            .pipe(gulp.dest(outputDir + '/js'))
            .pipe(uglify())
            .pipe(rename(folder + '.min.js'))
            .pipe(gulp.dest(outputDir + '/js'));
    });
    return es.concat.apply(null, tasks);

});


gulp.task('watch', function() {
    gulp.watch(sassSources, ['sass']);
    gulp.watch(htmlSources, ['copy']);
});
