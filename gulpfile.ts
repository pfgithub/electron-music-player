import * as gulp from 'gulp'
import * as sourcemaps from 'gulp-sourcemaps'
import * as babel from 'gulp-babel'
import * as concat from 'gulp-concat'

const all = gulp.series(typescript, html, nocomp)
export default all

export async function typescript() {
	return gulp
		.src('src/**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
}

export function watch() {
	gulp.watch('src/**/*.ts', typescript)
	gulp.watch('src/**/*.html', html)
	gulp.watch('static/**/*', nocomp)
}

export async function html() {
	return gulp.src('src/**/*.html').pipe(gulp.dest('dist'))
}

export async function nocomp() {
	return gulp.src('static/**/*').pipe(gulp.dest('dist'))
}
