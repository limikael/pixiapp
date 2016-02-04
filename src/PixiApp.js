var ContentScaler = require("./ContentScaler");
var EventDispatcher = require("yaed");
var PIXI;

if (window.PIXI)
	PIXI = window.PIXI;

else
	PIXI = require("pixi.js");

/**
 * Manages the main loop and scaling of a PIXI application.
 * The intended way of using this class is to extend it, for example:
 *
 *     var PIXI = require("pixi.js");
 *     var PixiApp = require("PixiApp");
 *     var inherits = require("inherits");
 *
 *     function MyApp() {
 *         PixiApp.call(this);
 *
 *         var t = new PIXI.Text("Hello PIXI.js!");
 *         this.addChild(t);
 *     }
 *
 *     inherits(MyApp, PixiApp);
 *
 *     new MyApp();
 * @class PixiApp
 */
function PixiApp(width, height) {
	PIXI.Container.call(this);

	if (!width)
		width = 500;

	if (!height)
		height = width;

	this._applicationWidth = width;
	this._applicationHeight = height;
	this._backgroundColor = 0xffffff;
	this._antialias = false;
	this.autoAttach = true;

	setTimeout(this.onCheckReadyTimeout.bind(this), 0);

	this.contentScaler = new ContentScaler(this);
}

module.exports = global.PixiApp = PixiApp;
PixiApp.prototype = Object.create(PIXI.Container.prototype);
PixiApp.prototype.constructor = PixiApp;

EventDispatcher.init(PixiApp);

/**
 * Dispatched if the app is resized.
 * @event resize
 */

/**
 * Dispatched every frame before rendering.
 * The time is send to the listening function as parameter.
 * @event frame
 */

PixiApp.TOP = ContentScaler.TOP;
PixiApp.MIDDLE = ContentScaler.MIDDLE;
PixiApp.BOTTOM = ContentScaler.BOTTOM;

PixiApp.LEFT = ContentScaler.LEFT;
PixiApp.CENTER = ContentScaler.CENTER;
PixiApp.RIGHT = ContentScaler.RIGHT;

PixiApp.NO_BORDER = ContentScaler.NO_BORDER;
PixiApp.NO_SCALE = ContentScaler.NO_SCALE;
PixiApp.SHOW_ALL = ContentScaler.SHOW_ALL;

/**
 * If the app is displayed in an html element, rather than
 * on the whole screen, we can use this function to set the
 * explicit width and height of the element. If we don't call
 * this funciton, the element size will be autodetected. However,
 * autodetection doesn't work 100% reliably if
 * the underlying element is resized.
 * @method setElementSize
 */
PixiApp.prototype.setElementSize = function(width, height) {
	this._explicitElementWidth = width;
	this._explicitElementHeight = height;

	this._sizeDirty = true;
}

/**
 * Check if it's time to attach ourselves.
 * @method onCheckReadyTimeout
 * @private
 */
PixiApp.prototype.onCheckReadyTimeout = function() {
	if (this._view)
		return;

	if (!this.autoAttach)
		return false;

	if (!document.body) {
		setTimeout(this.onCheckReadyTimeout.bind(this), 0);
		return;
	}

	this.attachToElement();
}

/**
 * Attach to an element in the document.
 * If this function is not called, the app will be attached
 * to entire browser window.
 * @method attachToElement
 * @param element {DOMElement} The element to attach to.
 */
PixiApp.prototype.attachToElement = function(element) {
	this.attachedToBody = false;

	if (this._view)
		throw new Error("Already attached!");

	if (typeof element == "string") {
		element = document.getElementById(element);
		if (!element)
			throw new Error("That's not an element!");
	}

	if (!element) {
		element = document.body;
		this.attachedToBody = true;
	}

	this.containerElement = element;

	if (navigator.isCocoonJS)
		this._view = document.createElement('screencanvas');

	else
		this._view = document.createElement('canvas');

	this._view.style.margin = 0;
	this._view.style.padding = 0;
	this._view.style.position = "absolute";
	this._view.style.left = 0;
	this._view.style.top = 0;

	if (this.attachedToBody) {
		this._view.style.position = "fixed";

		document.body.style.margin = 0;
		document.body.style.padding = 0;
		document.body.style.overflow = "hidden";

		document.body.onresize = this.onWindowResize.bind(this);
		window.onresize = this.onWindowResize.bind(this);
	}

	this.containerElement.appendChild(this._view);

	this.createRenderer();
	this.updateContentScaler();

	this._renderer.render(this.contentScaler);
	this._sizeDirty = false;

	window.requestAnimationFrame(this.onAnimationFrame.bind(this));
	this.trigger("resize");

	//console.log("attached...");
}

/**
 * Create renderer.
 * @method createRenderer
 * @private
 */
PixiApp.prototype.createRenderer = function() {
	if (!this._view)
		throw new Error("Can't create renderer, no view yet.");

	if (this._renderer)
		this._renderer.destroy();

	var options = {
		view: this._view,
		antialias: this._antialias
	};

	this._renderer = new PIXI.autoDetectRenderer(this.getElementWidth(), this.getElementHeight(), options);
	this._renderer.backgroundColor = this._backgroundColor;
}

/**
 * Update the content scaler.
 * @method updateContentScaler
 * @private
 */
PixiApp.prototype.updateContentScaler = function() {
	this.contentScaler.setContentSize(this._applicationWidth, this._applicationHeight);
	this.contentScaler.setScreenSize(this.getElementWidth(), this.getElementHeight());
}

/**
 * Animation frame. Render ourselfs.
 * @method onAnimationFrame
 * @private
 */
PixiApp.prototype.onAnimationFrame = function(time) {
	//console.log("render");

	if (this._sizeDirty) {
		this.updateContentScaler();
		this._renderer.resize(this.getElementWidth(), this.getElementHeight());
		this._sizeDirty = false;
	}

	this.trigger("frame", time);

	this._renderer.render(this.contentScaler);
	//TWEEN.update(time);

	window.requestAnimationFrame(this.onAnimationFrame.bind(this));
}

/**
 * Handle window resize.
 * @method onWindowResize
 * @private
 */
PixiApp.prototype.onWindowResize = function() {
	this._sizeDirty = true;
	this.trigger("resize");
}

/**
 * Get height of the element that we are attached to.
 * @method getElementHeight
 * @private
 */
PixiApp.prototype.getElementHeight = function() {
	if (this.attachedToBody)
		return window.innerHeight;

	if (this._explicitElementHeight)
		return this._explicitElementHeight;

	return this.containerElement.clientHeight;
}

/**
 * Get height of the element that we are attached to.
 * @method getElementWidth
 * @private
 */
PixiApp.prototype.getElementWidth = function() {
	if (this.attachedToBody)
		return window.innerWidth;

	if (this._explicitElementWidth)
		return this._explicitElementWidth;

	return this.containerElement.clientWidth;
}

/**
 * The logic width of the application.
 * @property applicationWidth
 */
Object.defineProperty(PixiApp.prototype, 'applicationWidth', {
	get: function() {
		return this._applicationWidth;
	},
	set: function(value) {
		this._applicationWidth = value;
		this._sizeDirty = true;
	}
});

/**
 * The logic height of the application.
 * @property applicationHeight
 */
Object.defineProperty(PixiApp.prototype, 'applicationHeight', {
	get: function() {
		return this._applicationHeight;
	},
	set: function(value) {
		this._applicationHeight = value;
		this._sizeDirty = true;
	}
});

/**
 * How the application should be vertically aligned in the window.
 * @property verticalAlign
 */
Object.defineProperty(PixiApp.prototype, "verticalAlign", {
	get: function() {
		return this.contentScaler.verticalAlign;
	},
	set: function(value) {
		this.contentScaler.setVerticalAlign(value)
	}
});

/**
 * How the application should be horizontally aligned in the window.
 * @property horizontalAlign
 */
Object.defineProperty(PixiApp.prototype, "horizontalAlign", {
	get: function() {
		return this.contentScaler.horizontalAlign;
	},
	set: function(value) {
		this.contentScaler.setHorizontalAlign(value)
	}
});

/**
 * How should the application be scaled to fit the window?
 * Available vaues are:
 * <ul>
 *   <li>
 *     `PixiApp.SHOW_ALL` - Ensure that the whole application as defined by
 *     `applicationWidth` and `applicationHeight` is visible on the screen.
 *   </li>
 *   <li>
 *     `PixiApp.NO_BORDER` - Show as much as possible of the application,
 *     but scale it so that there will be no border.
 *   </li>
 *   <li>
 *     `PixiApp.NO_SCALE` - Don't scale the application at all.
 *   </li>
 * </ul>
 * @property scaleMode
 */
Object.defineProperty(PixiApp.prototype, "scaleMode", {
	get: function() {
		return this.contentScaler.scaleMode;
	},
	set: function(value) {
		this.contentScaler.setScaleMode(value)
	}
});

/**
 * Get or set the minimum allowed scale value.
 * @property minScale
 */
Object.defineProperty(PixiApp.prototype, "minScale", {
	get: function() {
		return this.contentScaler.minScale;
	},
	set: function(value) {
		this.contentScaler.setMinScale(value)
	}
});

/**
 * Get or set the maximum allowed scale value.
 * @property minScale
 */
Object.defineProperty(PixiApp.prototype, "maxScale", {
	get: function() {
		return this.contentScaler.maxScale;
	},
	set: function(value) {
		this.contentScaler.setMaxScale(value)
	}
});

/**
 * Should there be a letterbox matte around the content? I.e.
 * should the content outside the application area be masked
 * away?
 * @property matte
 */
Object.defineProperty(PixiApp.prototype, "matte", {
	get: function() {
		return this.contentScaler.maskContentEnabled
	},
	set: function(value) {
		this.contentScaler.setMaskContentEnabled(value);
	}
});

/**
 * The color of the letterbox matte. This has effect only if the
 * letter box matte is enabled using the matte property.
 * @property matteColor
 */
Object.defineProperty(PixiApp.prototype, "matteColor", {
	get: function() {
		return this.contentScaler.maskColor;
	},
	set: function(value) {
		this.contentScaler.setMaskColor(value);
	}
});

/**
 * Gets the rectangle on the screen that is currently visible.
 * The rectangle is represented in application coordinates.
 * @property visibleRect
 */
Object.defineProperty(PixiApp.prototype, "visibleRect", {
	get: function() {
		if (this._sizeDirty) {
			this.updateContentScaler();
			this._renderer.resize(this.getElementWidth(), this.getElementHeight());
			this._sizeDirty = false;
		}

		return this.contentScaler.getVisibleRect();
	},
});

/**
 * The background color for the application.
 * Default is 0xffffff, i.e. white.
 * @property backgroundColor
 */
Object.defineProperty(PixiApp.prototype, "backgroundColor", {
	get: function() {
		return this._backgroundColor;
	},
	set: function(value) {
		this._backgroundColor = value;
		/*if (this.stage)
			this.stage.setBackgroundColor(this._backgroundColor);*/

		if (this._renderer)
			this._renderer.backgroundColor = this._backgroundColor;
	}
});

/**
 * Should antialias be used?
 * This needs to be set befor the app is attached to the window.
 * @property antialias
 */
Object.defineProperty(PixiApp.prototype, "antialias", {
	get: function() {
		return this._antialias;
	},
	set: function(value) {
		this._antialias = value;

		if (this._view) {
			throw new Error("antialias needs to be set before attaching");
			this.createRenderer();
		}
	}
});