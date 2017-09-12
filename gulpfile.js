var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
      
gulp.task('scripts', function() {
       return gulp.src([
        '/client/static/js/controllers/videoController.js',
        '/client/static/js/services/ratingService.js'
        ])
         .pipe(concat('all.js'))
         .pipe(gulp.dest('/client/js/'));
});