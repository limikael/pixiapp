module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [
					"src/intro.js",
					"src/ContentScaler.js",
					"src/PixiApp.js",
					"src/outro.js",
				],
				dest: "bin/pixiapp.js"
			}
		}
	});
};