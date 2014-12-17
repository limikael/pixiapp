PixiApp
=======

Easy setup and mainloop management for PIXI.js.

* [Introduction](#introduction)
* [Using npm and browserify](#using-npm-and-browserify)
* [Resolution and scaling](#resolution-and-scaling)

Reference documentation is available [here](http://limikael.altervista.org/pixiappdoc/).

Introduction
------------

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

Using npm and browserify
------------------------

You can install PixiApp using `npm` and use browserify to build your code.
This is recommended since it allows you to structure your code very nicely!
In order to do this, first create a folder and initialize it as a npm project with:

    npm init

Then install `pixiapp` and `inherits` as dependencies. This will automatically install PIXI.js as well.

    npm install --save-dev pixiapp

You also need browserify on your system. This is global so you only need to do it once and not for 
each project:

    npm install -g browserify

Now create your main javascipt file, e.g. main.js, where you create a class that extends PixiApp:

````javascript
var PIXI = require("pixi.js");
var PixiApp = require("pixiapp");
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

Resolution and scaling
----------------------

As mentioned, PixiApp helps you with initializing PIXI.js, but it also helps you with create applications that work
consistently across different screen resolutions. This is done in a way that is best suitable for "game like" applications
that uses bitmapped graphics created in a certain resolution. In order to get the adaptation to different resolutions,
PixiApp uses the concept of a "logic size" of the application. These are the values that gets passed to the constructor, as in:

````javascript
var app = new PixiApp(640,480);
````
