PixiApp
=======

Easy setup and mainloop management for PIXI.js.

Documentation is available here: http://limikael.altervista.org/pixiappdoc/

Getting started with PIXI.js has never been easier! This is how you do it:

````html
<!DOCTYPE html>
<html>
	<script src="pixi.js"></script>
	<script src="pixiapp.js"></script>
	<script>
		var app = new PixiApp(640,480);

		var t = new PIXI.Text("Hello PIXI.js!");
		app.addChild(t);
	</script>
</html>
````

Or you can install it using `npm` and use browserify. In this case, first create a folder and
initialize it as a npm project with:

    npm init

Then install `PixiApp` and `inherits` as dependencies. This will automatically install PIXI.js as well.

    npm install --save-dev PixiApp

You also need browserify on your system. This is global so you only need to do it once and not for 
each project:

    npm install -g browserify

Now create your main javascipt file, e.g. main.js, where you create a class that extends PixiApp:

````javascript
    var PIXI = require("pixi.js");
    var PixiApp = require("PixiApp");
    var inherits = require("inherits");

    function MyApp() {
        PixiApp.call(this);

		var t = new PIXI.Text("Hello PIXI.js!");
		this.addChild(t);
    }

    inherits(MyApp, PixiApp);

    new MyApp();
````

Then create a bundle:

    browserify -o main.bundle.js main.js

And create a .html file to load the bundle:

````html
<!DOCTYPE html>
<html>
	<script src="main.bundle.js"></script>
</html>
````
