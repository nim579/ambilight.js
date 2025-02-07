# Ambilight.js

Javascript [Ambilight](http://en.wikipedia.org/wiki/Ambilight) maker

## Init

~~~~~ js
// See Options
var options = {
	deep: 50,
	drawFps: true,
	sides: {		// Ambilight diods on side
		left: 5
		right: 5
		top: 5
		bottom: 5
	}
}
var ambi = new Ambilight(options);
~~~~~

## Methods

* setFrame(domObject, callback) — set image dom object for ambilighting. Return in callback with ambilight data
* setObject(bomObject, callback) *in development* — set image or video for ambilighting (if video, ambilight works in live). Return in callback with ambilight data
* FPS(callback) — returns timings ambilight process. Return 2 arguments — start time and object with steps and timings

## setFrame callback format
~~~~~ js
{
	"left": [
		[255,255,255,1], ... //rgba color
	],
	"right": [
		[123,233,2,1], ...
	],
	"top": [
		[12,5,77,1], ...
	],
	"bottom": [
		[5,7,32,1], ...
	]
}
~~~~~

One side of several possible colors (you have the option **path** for side)

## Options

Path *%ambilight_class%.options*

* deep — pixels for get average color into deep site. Default `50`
* drawFPS — flag for call FPS method callback call. Default `true`
* side.%side_name% — paths average colors for side. Default `4`