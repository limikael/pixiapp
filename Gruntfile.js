module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-ftpuploadtask');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			pixi: {
				src: "node_modules/pixi.js/bin/pixi.js",
				dest: "demos/pixi.js"
			}
		},

		browserify: {
			pixiapp: {
				options: {
					external: [
						"pixi.js"
					],
					require: [
						[
							"./src/PixiApp.js", {
								expose: "PixiApp"
							}
						]
					]
				},

				src: "src/PixiApp.js",
				dest: "bin/pixiapp.js"
			}
		},

		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: 'src',
					outdir: 'doc',
					"preprocessor": ["yuidoc-filter-tags", "yuidoc-die-on-warnings"],
					"dont-include-tags": "internal"
				}
			}
		},

		ftpUploadTask: {
			doc: {
				options: {
					user: "limikael",
					password: process.env.ALTERVISTA_PASSWORD,
					host: "ftp.limikael.altervista.org",
					checksumfile: "_checksums/pixiappdoc.json"
				},

				files: [{
					expand: true,
					dest: "pixiappdoc",
					src: ["**"],
					cwd: "doc"
				}]
			},
			demos: {
				options: {
					user: "limikael",
					password: process.env.ALTERVISTA_PASSWORD,
					host: "ftp.limikael.altervista.org",
					checksumfile: "_checksums/pixiappdemos.json"
				},

				files: [{
					expand: true,
					dest: "pixiappdemos",
					src: ["**"],
					cwd: "demos"
				}]
			}
		}
	});

	/*grunt.registerTask("publish-doc", function() {
		var done = this.async();

		if (fs.existsSync("doc.zip"))
			fs.unlinkSync("doc.zip");

		async.series([

			function(next) {
				var job = qsub("zip");
				job.arg("-r", "doc.zip", "doc");
				job.expect(0);
				job.run().then(next, grunt.fail.fatal);
			},

			function(next) {
				console.log("running...");

				var job = qsub("curl");
				job.arg("-s", "-X", "POST");
				job.arg("--data-binary", "@doc.zip");
				job.arg("http://limikael.altervista.org/?target=pixiappdoc&key=d2qqJJQU");
				job.expect(0).show();

				job.run().then(
					function() {
						if (job.output.substring(0, 2) != "OK") {
							console.log(job.output);
							grunt.fail.fatal("Unexpected output from curl");
						}

						next();
					},
					function(e) {
						grunt.fail.fatal(e);
					}
				);
			},

			function() {
				if (fs.existsSync("doc.zip"))
					fs.unlinkSync("doc.zip");

				done();
			}
		]);
	});*/

	grunt.registerTask("default", function() {
		console.log("Available tasks:");
		console.log("");
		console.log("  browserify    - Create bin/pixiapp.js.");
		console.log("  copy          - Copy pixi to make it available for demos.");
	});
};