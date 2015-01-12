var fs = require("fs");
var AsyncSequence = require("./tools/utils/AsyncSequence");
var qsub = require("qsub");
var async = require("async");

module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [
					"src/intro.js",
					"src/EventDispatcher.js",
					"src/ContentScaler.js",
					"src/PixiApp.js",
					"src/outro.js",
				],
				dest: "bin/pixiapp.js"
			}
		}
	});

	grunt.registerTask("test", function() {
		var done = this.async();

		async.series([

			function(next) {
				var job = qsub("./node_modules/.bin/jasmine-node")
					.arg("--captureExceptions")
					.arg("--verbose")
					.arg("test");

				job.expect(0).show();
				job.run().then(next, grunt.fail.fatal);
			},

			function(next) {
				done();
			}
		]);
	});

	grunt.registerTask("doc", function() {
		var done = this.async();

		var job = qsub("./node_modules/.bin/yuidoc");
		job.arg("--configfile", "yuidoc.json", "src");
		job.show().expect(0);

		job.run().then(done, function(e) {
			console.log(e);
			grunt.fail.fatal(e);
		});
	});

	grunt.registerTask("publish-doc", function() {
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
	});

	grunt.registerTask("default", function() {
		console.log("Available tasks:");
		console.log("");
		console.log("  test          - Run unit tests.");
		console.log("  concat        - Concat files.");
		console.log("  doc           - Create docs.");
		console.log("  publish-doc   - Upload docs.");
	});
};