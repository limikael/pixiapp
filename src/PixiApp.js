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
	PIXI.DisplayObjectContainer.call(this);

	this._applicationWidth = width;
	this._applicationHeight = height;

	setTimeout(this.onCheckReadyTimeout.bind(this), 0);

	this.contentScaler = new ContentScaler(this);
}

PixiApp.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
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
 * Check if it's time to attach ourselves.
 * @method onCheckReadyTimeout
 * @private
 */
PixiApp.prototype.onCheckReadyTimeout = function() {
	if (this.attachedToElement)
		return;

	if (!document.body) {
		setTimeout(this.onCheckReadyTimeout.bind(this), 0);
		return;
	}

	this.attachToElement(document.body);
}

/**
 * Attach to an element in the document.
 * If this function is not called, the app will be attached
 * to entire browser window.
 * @method attachToElement
 * @param element {DOMElement} The element to attach to.
 */
PixiApp.prototype.attachToElement = function(element) {
	if (this.attachedToElement)
		throw new Error("Already attached!");

	if (typeof element == "string")
		element = document.getElementById(element);

	if (!element)
		throw new Error("That's not an element!");

	console.log("attaching to element, w=" + element.clientWidth + " h=" + element.clientHeight);

	this.containerElement = element;

	var view;

	if (navigator.isCocoonJS)
		view = document.createElement('screencanvas');

	else
		view = document.createElement('canvas');

	view.style.margin = 0;
	view.style.padding = 0;

	if (this.containerElement == document.body) {
		console.log("style: " + document.documentElement.style.height);

		view.style.position = "fixed";

		document.body.style.margin = 0;
		document.body.style.padding = 0;

		document.body.onresize = this.onWindowResize.bind(this);
		window.onresize = this.onWindowResize.bind(this);
	}

	this.renderer = new PIXI.autoDetectRenderer(this.getElementWidth(), this.getElementHeight(), view);
	this.containerElement.appendChild(this.renderer.view);

	this.stage = new PIXI.Stage(0);

	this.updateContentScaler();
	this.stage.addChild(this.contentScaler);

	this.renderer.render(this.stage);
	this.sizeDirty = false;

	window.requestAnimationFrame(this.onAnimationFrame.bind(this));
	this.trigger("resize");

	this.attachedToElement = true;

	console.log("attached...");
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

	if (this.sizeDirty) {
		this.updateContentScaler();
		this.renderer.resize(this.getElementWidth(), this.getElementHeight());
		this.sizeDirty = false;
	}

	this.trigger("frame", time);

	this.renderer.render(this.stage);
	//TWEEN.update(time);

	window.requestAnimationFrame(this.onAnimationFrame.bind(this));
}

/**
 * Handle window resize.
 * @method onWindowResize
 * @private
 */
PixiApp.prototype.onWindowResize = function() {
	this.sizeDirty = true;
	this.trigger("resize");
}

/**
 * Get height of the element that we are attached to.
 * @method getElementHeight
 * @private
 */
PixiApp.prototype.getElementHeight = function() {
	if (this.containerElement == document.body)
		return window.innerHeight;

	return this.containerElement.clientHeight;
}

/**
 * Get height of the element that we are attached to.
 * @method getElementWidth
 * @private
 */
PixiApp.prototype.getElementWidth = function() {
	if (this.containerElement == document.body)
		return window.innerWidth;

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
		this.sizeDirty = true;
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
		this.sizeDirty = true;
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
 * Should there be a sad border around the content? I.e.
 * should the content outside the application area be masked
 * away?
 * @property sadBorder
 */
Object.defineProperty(PixiApp.prototype, "sadBorder", {
	get: function() {
		return this.contentScaler.maskContentEnabled
	},
	set: function(value) {
		this.contentScaler.setMaskContentEnabled(value);
	}
});

/**
 * Gets the rectangle on the screen that is currently visible.
 * The rectangle is represented in application coordinates.
 * @property
 */
Object.defineProperty(PixiApp.prototype, "visibleRect", {
	get: function() {
		if (this.sizeDirty) {
			this.updateContentScaler();
			this.renderer.resize(this.getElementWidth(), this.getElementHeight());
			this.sizeDirty = false;
		}

		return this.contentScaler.getVisibleRect();
	},
});