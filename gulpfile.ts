import * as gulp from "gulp";
import * as sourcemaps from "gulp-sourcemaps";
import * as babel from "gulp-babel";
import * as concat from "gulp-concat";
import * as fs from "fs";

// TODO prettier fmt

const all = gulp.series(typescript, html, nocomp);
export default all;
gulp.task("all", all);

export async function typescript() {
    // const babelConfig = JSON.parse(fs.readFileSync(".babelrc", "utf-8"));
    const replacers = {"./crossplatform_web": "./crossplatform", "././crossplatform_web": "./crossplatform_node"};
    const babelConfig = {
        plugins: [
            {visitor: { Program: {enter: () => {},
            exit: () => {}},ImportDeclaration(path) { if(replacers[path.node.source.value])
            path.node.source.value = replacers[path.node.source.value]}}}, // because I'm not using webpack
            // webpack can do module replacement that solves this
        ], presets: [
            ["@babel/preset-env", {
                "targets": {
                    "node": "12"
                }
            }],
        ],
    };
    return gulp
        .src("src/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(babel(babelConfig as any))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist"));
}

gulp.task(
    "watch",
    gulp.series("all", () => {
        gulp.watch("src/**/*.ts", typescript);
        gulp.watch("src/**/*.html", html);
        gulp.watch("static/**/*", nocomp);
    }),
);

export async function html() {
    return gulp.src("src/**/*.html").pipe(gulp.dest("dist"));
}

export async function nocomp() {
    return gulp.src("static/**/*").pipe(gulp.dest("dist"));
}
