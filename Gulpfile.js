/* jshint strict: false */
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('build', function() {
	var src = [
		'src/autodisable.module.js',
		'src/autodisable.directive.js',
		'src/autodisable.factory.js'
	];
	return gulp.src(src)
		.pipe(concat('autodisable.js'))
		.pipe(gulp.dest('.'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});
