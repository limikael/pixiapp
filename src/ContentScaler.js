/**
 * Keep content with a logic size inside boundaries.
 * @class ContentScaler
 */
function ContentScaler(content) {
	PIXI.DisplayObjectContainer.call(this);

	this.contentWidth = 100;
	this.contentHeight = 100;

	this.screenWidth = 100;
	this.screenHeight = 100;

	this.theMask = null;

	if (content)
		this.setContent(content);

	this.verticalAlign = ContentScaler.MIDDLE;
	this.horizontalAlign = ContentScaler.CENTER;
	this.scaleMode = ContentScaler.SHOW_ALL;

	this.minScale = -1;
	this.maxScale = -1;

	this.maskContentEnabled = false;
}

ContentScaler.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
ContentScaler.prototype.constructor = ContentScaler;

ContentScaler.TOP = "top";
ContentScaler.MIDDLE = "middle";
ContentScaler.BOTTOM = "bottom";

ContentScaler.LEFT = "left";
ContentScaler.CENTER = "center";
ContentScaler.RIGHT = "right";

ContentScaler.NO_BORDER = "noBorder";
ContentScaler.NO_SCALE = "noScale";
ContentScaler.SHOW_ALL = "showAll";

/**
 * Should the content be masked?
 * @method setMaskContentEnabled
 */
ContentScaler.prototype.setMaskContentEnabled = function(value) {
	this.maskContentEnabled = value;
	this.updateScale();
}

/**
 * Set minimum value for scale.
 * @method setMinScale
 */
ContentScaler.prototype.setMinScale = function(minScale) {
	this.minScale = minScale;
	this.updateScale();
}

/**
 * Set maximum value for scale.
 * @method setMaxScale
 */
ContentScaler.prototype.setMaxScale = function(maxScale) {
	this.maxScale = maxScale;
	this.updateScale();
}

/**
 * Set content to use.
 * @method setContent
 */
ContentScaler.prototype.setContent = function(content) {
	if (this.content)
		throw new Error("Content already set.");

	this.content = content;
	this.addChild(this.content);

	if (this.theMask) {
		this.removeChild(this.theMask);
		this.theMask = null;
	}

	this.theMask = new PIXI.Graphics();
	this.addChild(this.theMask);

	this.updateScale();
}

/**
 * Set logic size of the content.
 * @method setContentSize
 */
ContentScaler.prototype.setContentSize = function(contentWidth, contentHeight) {
	this.contentWidth = contentWidth;
	this.contentHeight = contentHeight;
	this.updateScale();
}

/**
 * Set the actual screen size.
 * @method setScreenSize
 */
ContentScaler.prototype.setScreenSize = function(screenWidth, screenHeight) {
	this.screenWidth = screenWidth;
	this.screenHeight = screenHeight;
	this.updateScale();
}

/**
 * Set how the content should be aligned on the screen.
 * @method setVerticalAlign
 */
ContentScaler.prototype.setVerticalAlign = function(align) {
	this.verticalAlign = align;
	this.updateScale();
}

/**
 * Set how the content should be aligned on the screen.
 * @method setHorizontalAlign
 */
ContentScaler.prototype.setHorizontalAlign = function(align) {
	this.horizontalAlign = align;
	this.updateScale();
}

/**
 * Set scale mode.
 * @method setScaleMode
 */
ContentScaler.prototype.setScaleMode = function(scaleMode) {
	this.scaleMode = scaleMode;
	this.updateScale();
}

/**
 * Update the scaling.
 * @method updateScale
 * @private
 */
ContentScaler.prototype.updateScale = function() {
	var scale;

	if (this.scaleMode == ContentScaler.NO_SCALE) {
		scale = 1;
	} else if (this.scaleMode == ContentScaler.NO_BORDER) {
		if (this.screenWidth / this.contentWidth > this.screenHeight / this.contentHeight)
			scale = this.screenWidth / this.contentWidth;

		else
			scale = this.screenHeight / this.contentHeight;
	} else {
		if (this.screenWidth / this.contentWidth < this.screenHeight / this.contentHeight)
			scale = this.screenWidth / this.contentWidth;

		else
			scale = this.screenHeight / this.contentHeight;
	}

	if (this.minScale > 0 && scale < this.minScale)
		scale = this.minScale;

	if (this.maxScale > 0 && scale > this.maxScale)
		scale = this.maxScale;

	this.content.scale.x = scale;
	this.content.scale.y = scale;

	var scaledWidth = this.contentWidth * scale;
	var scaledHeight = this.contentHeight * scale;

	this.content.position.x = (this.screenWidth - scaledWidth) / 2;

	if (this.verticalAlign == ContentScaler.TOP)
		this.content.position.y = 0;

	else if (this.verticalAlign == ContentScaler.BOTTOM)
		this.content.position.y = this.screenHeight - scaledHeight;

	else
		this.content.position.y = (this.screenHeight - scaledHeight) / 2;

	if (this.horizontalAlign == ContentScaler.LEFT)
		this.content.position.x = 0;

	else if (this.horizontalAlign == ContentScaler.RIGHT)
		this.content.position.x = this.screenWidth - scaledWidth;

	else
		this.content.position.x = (this.screenWidth - scaledWidth) / 2;

	var r = new PIXI.Rectangle(this.content.position.x, this.content.position.y, scaledWidth, scaledHeight);
	var right = r.x + r.width;
	var bottom = r.y + r.height;

	this.theMask.clear();

	if (this.maskContentEnabled) {
		this.theMask.beginFill();
		this.theMask.drawRect(0, 0, this.screenWidth, r.y);
		this.theMask.drawRect(0, 0, r.x, this.screenHeight);
		this.theMask.drawRect(right, 0, this.screenWidth - right, this.screenHeight);
		this.theMask.drawRect(0, bottom, this.screenWidth, this.screenHeight - bottom);
		this.theMask.endFill();
	}
}

/**
 * Get visible rectangle.
 * @method getVisibleRect
 */
ContentScaler.prototype.getVisibleRect = function() {
	var x = -this.content.position.x / this.content.scale.x;
	var y = -this.content.position.y / this.content.scale.y;

	var width = this.screenWidth / this.content.scale.x;
	var height = this.screenHeight / this.content.scale.y;
	// this.content.position, this.content.position, this.screenWidth, this.screenHeight

	return new PIXI.Rectangle(x, y, width, height);
}