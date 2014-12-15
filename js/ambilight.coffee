class window.Ambilight
	constructor: (options)->
		_.extend @, Backbone.Events
		@_FPS_storage = {}

		@options = _.extend {}, options,
			deep: 50
			drawFps: true
			sides:
				left: 4
				right: 4
				top: 4
				bottom: 4

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

	setFrame: (domObject, callback)->
		@fpsStart()
		width = domObject.videoWidth or domObject.width
		height = domObject.videoHeight or domObject.height

		@canvasEl[0].width = width
		@canvasEl[0].height = height

		canvasObj = @canvasEl[0].getContext('2d')
		canvasObj.drawImage domObject, 0, 0, width, height

		@frame = canvasObj.getImageData 0, 0, width, height

		@fpsSet('parseImg')
		@one('complite:process', callback) if _.isFunction callback
		@trigger 'set:frame', @frame

	processFrame: (frame)->
		frame = @frame unless frame

		ft = new Date()
		pixels = @pixelate frame

		ambi =
			pixels:
				right: @cropPixels pixels, frame, 'right'
				left: @cropPixels pixels, frame, 'left'
				top: @cropPixels pixels, frame, 'top'
				bottom: @cropPixels pixels, frame, 'bottom'

		ambi.colors =
			right: _.map ambi.pixels.right, @averageColor 
			left: _.map ambi.pixels.left, @averageColor
			top: _.map ambi.pixels.top, @averageColor
			bottom: _.map ambi.pixels.bottom, @averageColor

		@fpsSet('process')
		@trigger 'complite:process', ambi.colors

	pixelate: (frame)->
		pixelTable = []
		width = frame.width * 4
		for i in [0...frame.height]
			pixelTable.push Array::slice.call frame.data, width * i, width * (i + 1)

		return pixelTable

	averageColor: (pixels)->
		if _.isArray _.first pixels
			pics = Array::concat.apply [], pixels

		else
			pics = _.clone pixels

		length = pics.length/4
		r = 0
		g = 0
		b = 0
		a = 0

		for pic, i in pics by 4
			r += pics[i]
			g += pics[i+1]
			b += pics[i+2]
			a += pics[i+3]

		return [r // length, g // length, b // length, a // length]

	cropPixels: (pixels, frame, side)->
		parts = @options.sides[side]
		deep = @options.deep
		deepPics = deep * 4
		width = frame.width
		height = frame.height
		croped = []

		partWidth = width // parts
		partHeight = height // parts

		switch side
			when 'top'
				for part in [0...parts]
					croped.push _.map pixels[0...deep], (row, i)->
						return row.slice part*partWidth*4, (part+1)*partWidth*4

			when 'bottom'
				for part in [0...parts]
					croped.push _.map pixels[-deep..], (row, i)->
						return row.slice part*partWidth*4, (part+1)*partWidth*4

			when 'left'
				for part in [0...parts]
					croped.push _.map pixels.slice(partHeight*part, partHeight*(part+1)), (row, i)->
						return row[0...deepPics]

			when 'right'
				for part in [0...parts]
					croped.push _.map pixels.slice(partHeight*part, partHeight*(part+1)), (row, i)->
						return row[-deepPics..]

		return croped

	templateHorizontal: _.template "<div class=\"bColorHor\" style=\"width: <%= part %>%; background-color: rgba(<%= color %>); box-shadow: 0 0 150px 10px rgba(<%= color %>)\">"
	templateVertical: _.template "<div class=\"bColorVer\" style=\"height: <%= part %>%; background-color: rgba(<%= color %>); box-shadow: 0 0 150px 10px rgba(<%= color %>)\">"
	draw: (ambi)->
		$('#ambiPic').html @canvasEl

		topPart = 100 / ambi.top.length
		for color, i in ambi.top
			if $('.bTop div').eq(i).length > 0
				$('.bTop div').eq(i).css "background-color": "rgba(#{color.join(',')})", "box-shadow": "0 0 150px 10px rgba(#{color})"

			else
				$('.bTop').append @templateHorizontal part: topPart, color: color.join(',')

		bottomPart = 100 / ambi.bottom.length
		for color, i in ambi.bottom
			if $('.bBottom div').eq(i).length > 0
				$('.bBottom div').eq(i).css "background-color": "rgba(#{color.join(',')})", "box-shadow": "0 0 150px 10px rgba(#{color})"

			else
				$('.bBottom').append @templateHorizontal part: bottomPart, color: color.join(',')

		leftPart = 100 / ambi.left.length
		for color, i in ambi.left
			if $('.bLeft div').eq(i).length > 0
				$('.bLeft div').eq(i).css "background-color": "rgba(#{color.join(',')})", "box-shadow": "0 0 150px 10px rgba(#{color})"

			else
				$('.bLeft').append @templateVertical part: leftPart, color: color.join(',')

		rightPart = 100 / ambi.right.length
		for color, i in ambi.right
			if $('.bRight div').eq(i).length > 0
				$('.bRight div').eq(i).css "background-color": "rgba(#{color.join(',')})", "box-shadow": "0 0 150px 10px rgba(#{color})"

			else
				$('.bRight').append @templateVertical part: rightPart, color: color.join(',')

		@fpsSet('draw')
