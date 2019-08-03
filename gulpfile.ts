import * as gulp from 'gulp'
import * as sourcemaps from 'gulp-sourcemaps'
import * as babel from 'gulp-babel'
import * as concat from 'gulp-concat'

const all = gulp.series(typescript, html, png)
export default all

export async function typescript() {
	return gulp
		.src('src/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
}

export async function html() {
	return gulp.src('src/**/*.html').pipe(gulp.dest('dist'))
}

export async function png() {
	return gulp.src('src/**/*.png').pipe(gulp.dest('dist'))
}
