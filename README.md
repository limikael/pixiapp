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

PixiApp also helps you create applications that work consistently across different screen resolutions.
This is done in a way that is best suitable for "game like" applications that uses bitmapped graphics created in a
certain resolution.

In order to get the adaptation to different resolutions to work as automatic as possible, PixiApp uses the concept of a
"logic size" of the application. This logic size is specified by the width and height that gets passed to the constructor,
as in:

````javascript
var app = new PixiApp(640, 480);
````

Here, the logic size is 640 by 480 pixels. However, this does not mean that the application will be this size, it just 
means that we can use this size when thinking about coordinates where we should put things in the application. If something
is placed at coordinate 320 horizontally, then it will be at the middle of the screen. It also means that an image that
is drawn in the resolution of 640x480 will be scaled to cover the whole screen.

The logic size, 640x480 here, defines the area of the application that we can use to draw things and be sure that they will
be visible. It doesn't necessarily define the area that is actually visible, since the app can be run on a screen or in 
a window that has a different aspect ratio. We can say that the area covered by the coordinates 0,0 to 640,480 is our
critical area, but the actual area will most likely be something else.

To get the area that is actually displayed we can use the property `visibleRect`, which defines the rectangle of the 
screen in logic coordinates. If we put something at coordinate `visibleRect.x`, `visibleRect.y` it will be at the top left
corner. If we want something to be as wide as the entire screen, we can make it the width `visibleRect.width`.

The visible rect will change if the aspect ratio of the window or screen changes, e.g. if the browser window gets resized
or if a mobile devices changes orientation from horizontal to landscape. To get notifications about when this happens,
you can listen to the `resize` event.
