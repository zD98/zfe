var gulp = require('gulp');
//var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
//var rename = require('gulp-rename');
//var plumber = require('gulp-plumber');
var connect = require('gulp-connect');

var path = require('path');
var projpath = process.env.projpath;

gulp.task('server', function() {
    connect.server({
        
    });
})

gulp.task('lint', function() {
    gulp
        .src(path.join(projpath, './es6.js'))
        .pipe(eslint({ //错误检测
            "rules": {
                "semi": [1, "always"], //分号
                "quotes": [1, "single"] //单引号
            }
        }))
        .pipe(eslint.format()) //规范检测
    console.log(path.join(projpath, './es6.js'));
})
gulp.task('babel', function() {
    gulp
        .src(path.join(projpath, './es6.js'))
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename('index.js'))
        .pipe(gulp.dest(path.join(projpath, './')))
})
gulp.task('watch', function() {
    gulp.watch('./es6.js', ['babel', 'lint']);
})
gulp.task('default', ['babel', 'lint', 'watch']);