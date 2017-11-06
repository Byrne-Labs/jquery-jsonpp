/// <binding AfterBuild='min' Clean='clean' />
var gulp = require("gulp");
var uglify = require("gulp-uglify");
var mkdirp = require("mkdirp");
var concat = require("gulp-concat");
var argv = require("yargs").argv;
var nuget = require("gulp-nuget");
var fs = require("fs");
var request = require("request");
var del = require("del");
var rename = require("gulp-rename");

var paths = {
    source: "./src/**/*.js",
    distribution: "./dist/",
    bin: "./bin/",
    minified: "./dist/**/*.min.js",
    concatenated: "./dist/jquery.jsonpp.js",
    concatenatedMinified: "./dist/jquery.jsonpp.min.js"
};

gulp.task(
    "clean",
    function()
    {
        return del([paths.distribution, paths.bin, paths.bin + "nuget.exe"]);
    });

gulp.task(
    "javascript-concat", ["clean"],
    function()
    {
        return gulp.src(paths.source)
            .pipe(concat(paths.concatenated))
            .pipe(gulp.dest("."));
    });

gulp.task(
    "javascript-minify", ["javascript-concat"],
    function ()
    {
        var uglifyOptions =
        {
            sourceMap:
            {
                filename: "jquery.jsonpp.js",
                url: "jquery.jsonpp.js.map"
            }
            };

        return gulp.src(paths.concatenated)
            .pipe(uglify(uglifyOptions))
            .pipe(rename(paths.concatenatedMinified))
            .pipe(gulp.dest("."));
    });

gulp.task(
    "npm-publish", ["javascript-minify"],
    function(callback)
    {
        var username = argv.username;
        var password = argv.password;
        var email = argv.email;
        if (!username)
        {
            var usernameError = new Error("Username is required as an argument --username exampleUsername");
            return callback(usernameError);
        }
        if (!password)
        {
            var passwordError = new Error("Password is required as an argument --password  examplepassword");
            return callback(passwordError);
        }
        if (!email)
        {
            var emailError = new Error("Email is required as an argument --email example@email.com");
            return callback(emailError);
        }
        callback();
    });

gulp.task(
    "nuget-download", ["clean"],
    function(callback)
    {
        if (!fs.existsSync(paths.bin + "nuget.exe"))
        {
            if (!fs.existsSync(paths.bin))
            {
                mkdirp(paths.bin);
            }
            request.get("http://nuget.org/nuget.exe")
                .pipe(fs.createWriteStream(paths.bin + "nuget.exe"))
                .on("close", callback);
        }
        else
        {
            return callback();
        }
    });

gulp.task(
    "nuget-package", ["nuget-download", "javascript-minify"],
    function()
    {
        return gulp.src("./jquery.jsonpp.nuspec")
            .pipe(nuget.pack({ nuget: "nuget.exe" }))
            .pipe(gulp.dest(paths.distribution));;
    });

gulp.task(
    "nuget-publish", ["nuget-package"],
    function(callback)
    {
        var nugetApiKey = argv.nugetApiKey;
        if (!nugetApiKey)
        {
            var usernameError = new Error("Nuget API key is required as an argument --nugetApiKey secret-key");
            return callback(usernameError);
        }
        return gulp.src("./jquery.jsonpp.nuspec")
            .pipe(nuget.push({ source: "https://www.nuget.org/api/v2/package", apiKey: argv.nugetApiKey }));
    });

gulp.task("default", ["clean", "javascript-minify", "nuget-download", "nuget-package"]);

gulp.task("publish", ["default", "npm-publish", "nuget-publish"]);
