(function() {
  window.ambilight = (function() {
    ambilight.prototype._FPS_storage = {};

    ambilight.prototype.options = {
      deep: 5,
      drawFps: true,
      sides: {
        left: 1,
        right: 1,
        top: 1,
        bottom: 1
      },
      frameCss: {
        'position': 'relative'
      },
      ambiCss: {
        'position': 'absolute',
        'z-index': -1
      }
    };

    function ambilight() {
      _.extend(this, Backbone.Events);
      this.canvasEl = $('<canvas></canvas>');
      this.on('set:frame', this.processFrame);
      this.on('complite:process', this.draw);
    }

    ambilight.prototype.FPS = function(func, context) {
      var _this = this;
      this._FPS_storage.callback = func;
      return this.on('set:fps', function() {
        if (typeof _this._FPS_storage.callback === 'function') {
          return _this._FPS_storage.callback.call(context || _this, _this._FPS_storage.start, _this._FPS_storage.times);
        }
      });
    };

    ambilight.prototype.fpsStart = function() {
      this._FPS_storage.start = new Date();
      return this._FPS_storage.times = {};
    };

    ambilight.prototype.fpsSet = function(name) {
      if (!name) {
        name = _.uniqueId('timer_');
      }
      this._FPS_storage.times[name] = {
        stop_time: new Date()
      };
      this._FPS_storage.times[name].count = this._FPS_storage.times[name].stop_time - this._FPS_storage.start;
      if (this.options.drawFps) {
        return this.trigger('set:fps');
      }
    };

    ambilight.prototype.setObject = function(obj) {
      throw new Error('Sorry, this mehtod in development :(');
    };

    ambilight.prototype.setFrame = function(domObject) {
      var canvasObj, height, width;
      this.fpsStart();
      width = domObject.videoWidth || domObject.width;
      height = domObject.videoHeight || domObject.height;
      this.canvasEl[0].width = width;
      this.canvasEl[0].height = height;
      canvasObj = this.canvasEl[0].getContext('2d');
      canvasObj.drawImage(domObject, 0, 0, width, height);
      this.frame = canvasObj.getImageData(0, 0, width, height);
      this.fpsSet('parseImg');
      return this.trigger('set:frame', this.frame);
    };

    ambilight.prototype.processFrame = function(frame) {
      var ambi, ft, pixels,
        _this = this;
      if (!frame) {
        frame = this.frame;
      }
      ft = new Date();
      pixels = this.pixelate(frame);
      ambi = {
        pixels: {
          right: this.cropPixels(pixels, frame, 'right'),
          left: this.cropPixels(pixels, frame, 'left'),
          top: this.cropPixels(pixels, frame, 'top'),
          bottom: this.cropPixels(pixels, frame, 'bottom')
        }
      };
      ambi.colors = {
        right: _.map(ambi.pixels.right, function(side) {
          return _this.averageСolor(side);
        }),
        left: _.map(ambi.pixels.left, function(side) {
          return _this.averageСolor(side);
        }),
        top: _.map(ambi.pixels.top, function(side) {
          return _this.averageСolor(side);
        }),
        bottom: _.map(ambi.pixels.bottom, function(side) {
          return _this.averageСolor(side);
        })
      };
      this.fpsSet('process');
      return this.trigger('complite:process', ambi.colors);
    };

    ambilight.prototype.pixelate = function(frame) {
      var i, pixels, val, _i, _len, _ref;
      pixels = [];
      _ref = frame.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        val = _ref[i];
        if (!pixels[Math.floor(i / 4)]) {
          pixels[Math.floor(i / 4)] = [];
        }
        pixels[Math.floor(i / 4)][i % 4] = val;
      }
      return pixels;
    };

    ambilight.prototype.averageСolor = function(pixels) {
      var summ;
      summ = _.reduce(pixels, function(memo, pixel) {
        memo[0] += pixel[0];
        memo[1] += pixel[1];
        memo[2] += pixel[2];
        memo[3] += pixel[3];
        return memo;
      }, [0, 0, 0, 0]);
      return _.map(summ, function(uColorSumm) {
        return Math.floor(uColorSumm / pixels.length);
      });
    };

    ambilight.prototype.cropPixels = function(pixels, frame, side) {
      var croped, deep, height, parts, pixelsArr, width;
      parts = this.options.sides[side];
      deep = this.options.deep;
      width = frame.width;
      height = frame.height;
      pixelsArr = _.clone(pixels);
      switch (side) {
        case 'top':
          croped = _.first(pixelsArr, width * deep);
          break;
        case 'bottom':
          croped = _.last(pixelsArr, width * deep);
          break;
        case 'left':
          croped = _.filter(pixelsArr, function(num, i) {
            return i % width < deep;
          });
          break;
        case 'right':
          croped = _.filter(pixelsArr, function(num, i) {
            return i % width >= width - deep;
          });
      }
      return [croped];
    };

    ambilight.prototype.draw = function(ambi) {
      $('#ambiRight').css({
        "background-color": "rgba(" + (ambi.right.join(', ')) + ")"
      });
      $('#ambiLeft').css({
        "background-color": "rgba(" + (ambi.left.join(', ')) + ")"
      });
      $('#ambiTop').css({
        "background-color": "rgba(" + (ambi.top.join(', ')) + ")"
      });
      $('#ambiBottom').css({
        "background-color": "rgba(" + (ambi.bottom.join(', ')) + ")"
      });
      return this.fpsSet('draw');
    };

    return ambilight;

  })();

}).call(this);
