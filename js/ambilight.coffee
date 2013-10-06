class window.ambilight
	_FPS_storage: {}
	options:
		deep: 5
		drawFps: true
		sides:
			left: 1
			right: 1
			top: 1
			bottom: 1

		frameCss:
			'position': 'relative'

		ambiCss:
			'position': 'absolute'
			'z-index': -1

	constructor: ->
		_.extend @, Backbone.Events

		@canvasEl = $('<canvas></canvas>')
		@on 'set:frame', @processFrame
		@on 'complite:process', @draw

	FPS: (func, context)->
		@_FPS_storage.callback = func
		@on 'set:fps', =>
			@_FPS_storage.callback.call context || @, @_FPS_storage.start, @_FPS_storage.times if typeof @_FPS_storage.callback is 'function'

	fpsStart: ->
		@_FPS_storage.start = new Date()
		@_FPS_storage.times = {}

	fpsSet: (name)->
		name = _.uniqueId 'timer_' unless name
		@_FPS_storage.times[name] = 
			stop_time: new Date()

		@_FPS_storage.times[name].count = @_FPS_storage.times[name].stop_time - @_FPS_storage.start
		@trigger 'set:fps' if @options.drawFps

	setObject: (obj)->
		throw new Error('Sorry, this mehtod in development :(')

	setFrame: (domObject)->
		@fpsStart()
		width = domObject.videoWidth or domObject.width
		height = domObject.videoHeight or domObject.height

		@canvasEl[0].width = width
		@canvasEl[0].height = height

		canvasObj = @canvasEl[0].getContext('2d')
		canvasObj.drawImage domObject, 0, 0, width, height

		@frame = canvasObj.getImageData 0, 0, width, height

		@fpsSet('parseImg')
		@trigger 'set:frame', @frame

	processFrame: (frame)->
		frame = @frame unless frame

		ft = new Date()
		pixels = @pixelate frame
		# avColor = @averageСolor pixels

		ambi =
			pixels:
				right: @cropPixels pixels, frame, 'right'
				left: @cropPixels pixels, frame, 'left'
				top: @cropPixels pixels, frame, 'top'
				bottom: @cropPixels pixels, frame, 'bottom'

		ambi.colors =
			right: _.map ambi.pixels.right, (side)=>
				return @averageСolor side

			left: _.map ambi.pixels.left, (side)=>
				return @averageСolor side

			top: _.map ambi.pixels.top, (side)=>
				return @averageСolor side

			bottom: _.map ambi.pixels.bottom, (side)=>
				return @averageСolor side

		@fpsSet('process')
		@trigger 'complite:process', ambi.colors

	pixelate: (frame)->
		pixels = []
		for val, i in frame.data
			pixels[Math.floor(i/4)] = [] unless pixels[Math.floor(i/4)]
			pixels[Math.floor(i/4)][i%4] = val

		return pixels

	averageСolor: (pixels)->
		summ = _.reduce pixels, (memo, pixel)->
			memo[0] += pixel[0];
			memo[1] += pixel[1];
			memo[2] += pixel[2];
			memo[3] += pixel[3];
			return memo
		, [0,0,0,0]

		return _.map summ, (uColorSumm)->
			return Math.floor(uColorSumm/pixels.length)

	cropPixels: (pixels, frame, side)->
		parts = @options.sides[side]
		deep = @options.deep
		width = frame.width
		height = frame.height
		pixelsArr = _.clone pixels

		switch side
			when 'top' then croped = _.first pixelsArr, width*deep
			when 'bottom' then croped = _.last pixelsArr, width*deep
			when 'left' then croped = _.filter pixelsArr, (num, i)->
				return i%width < deep
			when 'right' then croped = _.filter pixelsArr, (num, i)->
				return i%width >= width-deep

		return [croped]

	draw: (ambi)->
		$('#ambiRight').css
			"background-color": "rgba(#{ambi.right.join(', ')})"

		$('#ambiLeft').css 
			"background-color": "rgba(#{ambi.left.join(', ')})"

		$('#ambiTop').css 
			"background-color": "rgba(#{ambi.top.join(', ')})"

		$('#ambiBottom').css 
			"background-color": "rgba(#{ambi.bottom.join(', ')})"

		@fpsSet('draw')
