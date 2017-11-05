/// <binding AfterBuild='min' Clean='clean' />
var gulp = require("gulp");
var rimraf = require("rimraf");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");

var paths = {
    source: "./src/**/*.js",
    minified: "./dist/**/*.min.js",
    concatenatedMinified: "./dist/jquery.jsonpp.min.js"
};

gulp.task("clean", function (cb)
{
    rimraf(paths.distribution, cb);
});

gulp.task("min", function ()
{
    return gulp.src([paths.source, "!" + paths.minified], { base: "." })
        .pipe(concat(paths.concatenatedMinified))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});
