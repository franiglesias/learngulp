var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var es = require('event-stream');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var newer = require('gulp-newer');
var path = require('path');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');

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

// Copy react.js and react-dom.js to assets/js/src/vendor
// only if the copy in node_modules is "newer"
gulp.task('copy-react', function() {
    return gulp.src('node_modules/react/dist/react.js')
        .pipe(newer(outputDir + '/js/vendor/react.js'))
        .pipe(gulp.dest(outputDir + '/js/vendor'));
});

gulp.task('copy-react-dom', function() {
    return gulp.src('node_modules/react-dom/dist/react-dom.js')
        .pipe(newer(outputDir + '/js/vendor/react-dom.js'))
        .pipe(gulp.dest(outputDir + '/js/src/vendor'));
});

gulp.task('watch', function() {
    gulp.watch(sassSources, ['sass']);
    gulp.watch(htmlSources, ['copy']);
});
