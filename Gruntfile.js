var fs = require("fs");
var AsyncSequence = require("./tools/utils/AsyncSequence");
var qsub=require("qsub");

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

		AsyncSequence.run(
			function(next) {
				var job = qsub("./node_modules/.bin/jasmine-node")
					.arg("--captureExceptions")
					.arg("--verbose")
					.arg("test");

				job.expect(0).show();
				job.run().then(next, grunt.fail.fatal);
			}
		).then(done);
	});

	grunt.registerTask("default", function() {
		console.log("Available tasks:");
		console.log("");
		console.log("  test    - Run unit tests.");
		console.log("  concat  - Concat files.");
	});
};