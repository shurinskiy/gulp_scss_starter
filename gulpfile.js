const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const $ = require('gulp-load-plugins')({ pattern: ['*', '!sass'] });
const isRemote = process.argv.indexOf('--remote') !== -1;
const isSync = process.argv.indexOf('--sync') !== -1;
const isDev = process.argv.indexOf('--dev') !== -1;
const isProd = !isDev;

// console.log(JSON.stringify($));
let pckg = require('./package.json');
let webconf = {
	output: {
		filename: 'common.js'
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
					loader: 'babel-loader',
					options: { presets: ['@babel/preset-env'] }
				}
		}]
	},
	externals: {
		jquery: 'jQuery'
	},
	mode: isDev ? 'development' : 'production',
	devtool: isDev ? 'eval-source-map' : 'none'
};

let pth = {
	pbl: {
		root: './docs/',
		html: './docs/',
		js: './docs/',
		css: './docs/',
		img: './docs/images/',
		fnts: './docs/fonts/'
	},
	src: {
		root: './src/',
		html: './src/[^_]*.html',
		js: './src/js/common.js',
		// jslib: './src/js/!(common)*.js',
		css: './src/scss/style.scss',
		scss: './src/scss/lib/',
		img: './src/images/**/!(icon-*.svg|shape-*.svg)',
		shp: './src/images/**/shape-*.svg',
		icn: './src/images/**/icon-*.svg',
		fnts: './src/fonts/**/*.*',
		tmpl: './src/templates/'
	},
	wtch: {
		html: './src/**/*.html',
		js: ['./src/js/**/*.js','./src/blocks/**/(*.js|*.json)'],
		css: ['./src/scss/**/*.scss','./src/blocks/**/*.scss'],
		img: './src/images/**/!(icon-*.svg|shape-*.svg)',
		shp: './src/images/**/shape-*.svg',
		icn: './src/images/**/icon-*.svg',
		fnts: './src/fonts/**/*.*'
	}
};

function swallowError (error) {
	console.log(error.toString());
	this.emit('end');
}

function clear() {
	return $.del(pth.pbl.root + '*');
}

function js() {
	return gulp.src(pth.src.js)
		.pipe($.webpackStream(webconf))
		.on('error', swallowError)
		.pipe(gulp.dest(pth.pbl.js))
		.pipe($.if(isSync, $.browserSync.stream()))
		.on('end', function() {
			if(isRemote) deploy(true, 'js');
		});
}

function jslib () {
	let paths = [];
	if (Object.keys(pckg.externalJs).length !== 0) {
		Object.entries(pckg.externalJs).forEach(function ([key, value], index) {
			paths[index] = `node_modules/${key}/${value}`;
		});

		return gulp.src(paths)
			.pipe(gulp.dest(pth.pbl.js));
	}
	return gulp.src('.', { allowEmpty: true });
}

function html() {
	return gulp.src(pth.src.html)
		.pipe($.fileInclude({ prefix: '@@', basepath: pth.src.tmpl }))
		.on('error', swallowError)
		.pipe($.if(isProd, $.versionNumber({
			'value': '%DT%',
			'append': {
				'to': [
					{ 'type': 'js', 'files': ['common.js'] },
					{ 'type': 'css', 'files': ['style.css'] }
				]
			}
		})))
		.pipe(gulp.dest(pth.pbl.html))
		.pipe($.if(isSync, $.browserSync.stream()));
}

function styles() {
	return gulp.src(pth.src.css)
		.pipe($.if(isDev, $.sourcemaps.init()))
		.pipe($.sassGlob())
		.pipe(sass())
		.on('error', swallowError)
		.pipe($.autoprefixer({ 
			overrideBrowserslist: [ "last 4 version" ],
			cascade: false, 
			grid: true 
		}))
		.pipe($.if(isProd, $.groupCssMediaQueries()))
		.pipe($.if(isProd, $.cleanCss({ level: 2 })))
		.pipe($.if(isDev, $.sourcemaps.write()))
		.pipe(gulp.dest(pth.pbl.css))
		.pipe($.if(isSync, $.browserSync.stream()))
		.on('end', function() {
			if(isRemote) deploy(true, 'css');
		});
}

function images() {
	return gulp.src(pth.src.img)
		.pipe($.newer(pth.pbl.img))
		.pipe(gulp.dest(pth.pbl.img))
		.pipe($.if(isSync, $.browserSync.stream()));
}

function icons() {
	return gulp.src(pth.src.icn)
	.pipe($.svgSymbolView({
		name: 'icons-sprite',
		monochrome: {
			blue: '#638bf5',
			dark: '#46557b',
			white: '#ffffff'
		}
	}))
	.pipe(gulp.dest(pth.pbl.img))
};

function shapes() {
	return gulp.src(pth.src.shp)
	.pipe($.svgSymbolView('svg-sprite'))
	.pipe(gulp.dest(pth.pbl.img))
};

function fonts() {
	return $.del([pth.pbl.fnts+'*']).then(function(paths) {
		gulp.src(pth.src.fnts)
		.pipe($.fonter({
			formats: ['woff', 'ttf', 'eot'],
			compound2simple: true
		  }))		
		.pipe(gulp.dest(pth.pbl.fnts))
		.pipe($.if(isSync, $.browserSync.stream()));
		console.log('Deleted files and folders:\n', paths.join('\n'));
	});
}

function deploy(e, ...args) {
	const conn = $.vinylFtp.create({
		host: pckg.ftp.host,
		user: pckg.ftp.user,
		password: pckg.ftp.password,
		parallel: 5,
		log: $.fancyLog
	});

	args = args.length ? args : ['js','css'];
	args.forEach(function(item, i) {
		this[i] = pth.pbl[item]+'*.'+item;
	}, args);

	if (process.argv.indexOf('--all') !== -1) {
		return gulp.src(pth.pbl.root+'**', {base: pth.pbl.root})
			.pipe(conn.newerOrDifferentSize(pckg.ftp.workdir))
			.pipe(conn.dest(pckg.ftp.workdir));
	} else {
		return gulp.src(args, {base: pth.pbl.root, buffer: false})
			.pipe(conn.newerOrDifferentSize(pckg.ftp.workdir))
			.pipe(conn.dest(pckg.ftp.workdir));
	}
}

function watch() {
	if(isSync) {
		$.browserSync.init({
			server: { baseDir: pth.pbl.root }
		});
	}
	gulp.watch(pth.wtch.js, js);
	gulp.watch(pth.wtch.html, html);
	gulp.watch(pth.wtch.css, styles);
	gulp.watch(pth.wtch.img, gulp.parallel(images, icons));
	gulp.watch(pth.wtch.icn, icons);
	gulp.watch(pth.wtch.shp, shapes);
	gulp.watch(pth.wtch.fnts, fonts);
}

const build = gulp.series(clear, gulp.parallel(html, js, jslib, styles, images, icons, shapes, fonts));

exports.build = build;
exports.watch = gulp.series(build, watch);
exports.deploy = gulp.series(build, deploy);