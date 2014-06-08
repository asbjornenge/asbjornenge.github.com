var gulp           = require('gulp')
var gutil          = require('gulp-util')
var uglify         = require('gulp-uglify')
var rename         = require('gulp-rename')
var size           = require('gulp-size')
var s3             = require("gulp-s3")
var clean          = require("gulp-clean")
var gzip           = require("gulp-gzip")
var Metalsmith     = require('metalsmith')
var markdown       = require('metalsmith-markdown')
var templates      = require('metalsmith-templates')
var webpack        = require('webpack')
var webpack_config = require('./webpack.config.js')
var pkg            = require('./package.json')
var argv           = require('minimist')(process.argv.slice(2))
var React          = require('react')
var Base           = require('./components/base')

var _config   = Object.create(webpack_config)
_config.debug = true
var _compiler = webpack(_config)

gulp.task('webpack', function(callback) {
    _compiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            colors: true
        }))
        if (typeof callback == 'function') callback()
    })
})

gulp.task('metalsmith', function() {
    return Metalsmith(__dirname)
            .use(markdown())
            .use(templates('handlebars'))
            .build()    
})

gulp.task('minify', ['webpack','metalsmith'], function() {
    return gulp.src('build/bundle.js')
        .pipe(size({showFiles:true}))
        .pipe(uglify())
        .pipe(rename(pkg.name+'-'+pkg.version+'.min.js'))
        .pipe(size({showFiles:true}))
        .pipe(gulp.dest('./build/scripts'))
})

gulp.task('cleanup', ['minify'], function() {
    return gulp.src('build/bundle.js', {read:false})
        .pipe(clean())
})

gulp.task('build', function() {
    console.log(React.renderComponentToStaticMarkup(Base({pkg:pkg})))
})

// gulp.task('build', ['cleanup'])

// gulp.task('publish', function() {

//   RATHER -> https://github.com/rowoot/gulp-gh-pages

//     var aws    = require('../taghub-config.json').aws
//     var target = argv.t
//     var valid  = ['demo','prod'].filter(function(env) { return target == env })
//     if (valid.length == 0) { console.log('Unknown target '+target); process.exit(1) }
//     gulp.src('./build/**')
//         .pipe(gzip())
//         .pipe(s3(aws, { 
//             uploadPath  : target+'/changelog/',
//             gzippedOnly: true
//         }));
// });


module.exports = gulp
