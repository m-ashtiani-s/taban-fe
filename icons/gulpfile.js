const gulp = require("gulp"),
    replace = require("gulp-replace"),
    rename = require("gulp-rename"),
    svgmin = require("gulp-svgmin"),
    wrap = require("gulp-wrap"),
    fs = require("fs");

let icons_component_list=[]

gulp.task("minify-svg", function () {
	return gulp
		.src("icons-svg/*.svg")
		.pipe(svgmin())
		.pipe(
			svgmin({
				multipass: true,
				full: true,
				plugins: [
					{
						name: "removeAttrs",
						params: {
							attrs: [
								"(filter|fill|stroke|fill-rule|stroke-linecap|stroke-linejoin|stroke-width|transform|style|class|data.*)",
								"svg:(width|height|xmlns)",
							],
						},
					},
					"removeUselessDefs",
				],
			})
		)
		.pipe(replace(/<\/?svg(.*?)>/g, ""))
		.pipe(wrap({ src: "icon-template.txt" }))
		.pipe(
            rename(function (path) {
                icons_component_list.push(path.basename);
                path.extname = ".tsx";
            })
        )
		.pipe(gulp.dest("../src/app/_components/icon/src"));
});

gulp.task('root-file', function (cb) {
    fs.writeFile('../src/app/_components/icon/icons.ts',
            icons_component_list
                .map((item) => {
                    let module_name = (
                        item.charAt(0).toUpperCase() + item.substr(1)
                    ).replace(/-([a-z])/g, function (g) {
                        return g[1].toUpperCase();
                    });

                    return `export { default as Icon${module_name} } from './src/${item}';`;
                })
                .join("\n"),
        cb
    )
    });

gulp.task("default", gulp.series("minify-svg", "root-file"));
