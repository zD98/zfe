var gulp = require('gulp'),
    fs = require("fs"),
    file = require('gulp-file'),
    runSequence = require('run-sequence'),
    replace = require('gulp-replace'),
    rev = require('gulp-rev'),
    useref = require('gulp-useref'),
    gulp_if = require('gulp-if'),
    uglify = require('gulp-uglify'),
    csso = require('gulp-csso'),
    watch = require('gulp-watch'),
    vFile= require('vinyl'),
    sprite = require('gulp-sprite-generator');

var componentFileArr=[];
var cdn ='';

gulp.task('readFile',function(callback) {
    walk("src/component", function (path) {
        var ext = getFileExt(path);
      //  if (ext === ".html" || ext === ".css") {
            componentFileArr.push(path);
       // }
    }, function () {
        var map=arrToObj(componentFileArr);
        //console.log(map)
        for (var key in map) {
            var isExist = fs.existsSync("src/component/" + key + "/index.js");
            if (isExist) {
                var paths = map[key],
                    i = 0,
                    len = paths.length,
                    contentArr = [];
                for (; i < len; i++) {
                    var path = paths[i];
                    var ext = getFileExt(path);
                    if (['.html', '.css'].indexOf(ext) !== -1) {
                        contentArr.push(fileContentToStr(fs.readFileSync(path, "utf8"), getFileExt(path) === ".html", path));
                    }
                }
                contentArr.push(fs.readFileSync("src/component/" + key + "/index.js", "utf8"));
                file("index.js", contentArr.join(""), { src: true })
                    .pipe(gulp.dest('dev/component/' + key))
            } else {
                //非nuclear组件全部copy过去
                gulp.src('src/component/' + key + '/*.js').pipe(gulp.dest('dev/component/' + key )).pipe(gulp.dest('dist/component/' + key ));
            }

        }
        callback();
    })
})

gulp.task('copyHTML', function () {
    return gulp.src('src/*.html').pipe(gulp.dest('dev'));
});

gulp.task('copyCSS', function () {
    return gulp.src('src/**/*.css').pipe(gulp.dest('dev'));
});

gulp.task('copyComponent', function () {
    return gulp.src('src/component/**/*.png').pipe(gulp.dest('dev/component')).pipe(gulp.dest('dist/component'));
});

gulp.task('copyJS', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(gulp.dest('dev/js'))
});

gulp.task('fixUtil', function () {
    return gulp.src('fix/app.js').pipe(gulp.dest('dev/js'));
});
gulp.task('copyAsset', function () {
return gulp.src('src/asset/*')
    .pipe(gulp.dest('dev/asset'))
    .pipe(gulp.dest('dist/asset'))
});

gulp.task('sprites', function () {
    var spriteOutput;
    spriteOutput = gulp.src("src/component/read_num/index.html")
        .pipe(sprite({
            spriteSheetName: "sprite.png",
            baseUrl:'./src/',
            spriteSheetPath:"component/read_num"
        }));

    spriteOutput.css.pipe(gulp.dest("./dev/component/read_num/"));
    spriteOutput.img.pipe(gulp.dest("./dev/component/read_num/"));
    console.log(spriteOutput.css);
    return spriteOutput;
})

gulp.task('dist', function () {
    return gulp.src('dev/*.html')
        .pipe(useref())
        .pipe(gulp_if('*.js',rev()))
        .pipe(gulp_if('*.js',uglify()))
        .pipe(gulp_if('*.css',rev()))
        .pipe(gulp_if('*.css',csso()))
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest({path:'manifest.json',merge:true}))
        .pipe(gulp.dest('dev'))
});

var G={};
G.ift={};//全部文件列表
G.usedkey={};//真正被使用的
gulp.task('creatdist' , function() {
    // G.iftimg = require('./dist/ift-img.json'),
    //    G.iftcss = require('./dist/ift-css.json'),
    G.iftjs = require('./dev/manifest.json');
   // G.iftimg = require('./dev/img_manifest.json');
    //for(var key in G.iftimg){
    //    G.ift[key] = G.iftimg[key];
    //}
    //for(var key in G.iftcss){
    //    G.ift[key] = G.iftcss[key];
    //}
    for (var key in G.iftjs) {
        G.ift[key] = G.iftjs[key];
    }
    var md5 = function (match, name) {
        if (G.ift[match]) {
            G.usedkey[match] = true;//被使用标记
            return name + G.ift[match] + '"';
        } else {
            console.log('ERROR:' + match + ' is undefined');
        }
    };

    return gulp.src(['./dist/css/**', './dist/js/**', './dist/*.html'], {base: 'dist'})
        .pipe(replace(/css\/[\S]*\\?\"/g, function (match) {
            return md5(match.replace(/\"/g, ""), cdn);
        }))
        //.pipe(replace(/<img[^>]+src="[^"]+"[^>]*>/g,function(match){
        //
        //    var reg2 = /src="([^"]+)"/;
        //    var src = reg2.exec(match);
        //    console.log(src)
        //    return img_md5(src,cdn);
        //}))
        .pipe(replace(/js\/[\S]*\\?\"/g, function (match) {
            return md5(match.replace(/\"/g, ""), cdn);

        }))
        .pipe(gulp.dest('./dist/'));
});

//http://www.tuicool.com/articles/rQvUbu2
gulp.task('default',  function (taskDone) {
    runSequence(
        'readFile',
        'copyHTML',
        'copyJS',
        'fixUtil',
        'copyCSS',
        'dist',
        'creatdist',
        'copyAsset',
        'copyComponent',
        taskDone
    );
});

function arrToObj(arr){
    var obj={};
    for(var i= 0,len=arr.length;i<len;i++){
        var item=arr[i];
        var key=item.split("/")[2];
        if(!obj[key]){
            obj[key]=[];
        }

        obj[key].push(item);

    }
    return obj;
}

function getFileExt(filename) {
    var index1 = filename.lastIndexOf(".")
    var index2 = filename.length;
    return filename.substring(index1, index2).toLowerCase();
}

function  fileContentToStr(r ,isTpl ,path) {
    var strVar =isTpl? "tpl":"css";
    var g = "";
    var vf = new vFile({
              cwd: "/",
              base: "/",
              path: path,
              contents: new Buffer(r)
        });
    console.log(path);
    console.log(JSON.stringify(vf));
    spriteOutput = vf.pipe(sprite({

                spriteSheetName: "sprite.png",
                baseUrl:'./src/',
                spriteSheetPath:"component/read_num"
        
            }));

    spriteOutput.css.pipe(gulp.dest("./dev/component/read_num/"));
    spriteOutput.img.pipe(gulp.dest("./dev/component/read_num/"));
    console.log(spriteOutput.css);


    var arr = r.replace(/\r/g, "").replace(/^[\s\uFEFF\xa0\u3000]+|[\uFEFF\xa0\u3000\s]+$/g, "").split("\n");
    g += "App.componentRes['"+path.substring(4,path.length)+"'] =\n";
    var i = 0;
    for (; i < arr.length; i++) {
        var l = '';
        if (i === 0) {
            l += "'"
        }
        ;

        if (i === arr.length - 1) {
            l += arr[i] + "';\n\n";
        } else {
            l += arr[i] + "\\\n";
        }
        g += l;
    }
    return g;
}

function walk (path, handleFile, callback) {
    var len = 1,       // 文件|目录数，起始一个
        floor = 0;     // 第x个目录？

    function done () {
        // 完成任务, 运行回调函数
        if (--len === 0) {
            callback();
        }
    }

    function composeErr (err) {
        // 错误处理
        console.log('stat error');
        done();  // 以错误内容完成
    }

    function composeDir (path) {
        // 目录处理
        floor++;
        fs.readdir(path, function (err, files) {
            if (err) {
                console.log('read dir error');
                done();  // 目录完成
                return;
            }
            len += files.length;  // 子文件|子目录计数
            files.forEach(function (filename) {
                compose(path + '/' + filename);  // 子内容新的操作
            });
            done();  // 目录完成
        });
    }

    function composeFile (path) {
        // 文件处理
        handleFile(path, floor);
        done();  // 文件完成
    }

    function compose (path) {
        //同步
        fs.stat(path, function (err, stats) {
            if (err) {
                composeErr(err);
                return;
            }

            if (stats.isDirectory()) {
                composeDir(path);
                return;
            }

            composeFile(path);
        });
    }

    compose(path);
}