(function() {
  window.Ambilight = (function() {
    function Ambilight(options) {
      _.extend(this, Backbone.Events);
      this._FPS_storage = {};
      this.options = _.extend({}, options, {
        deep: 50,
        drawFps: true,
        sides: {
          left: 4,
          right: 4,
          top: 4,
          bottom: 4
        }
      });
      this.canvasEl = $('<canvas></canvas>');
      this.on('set:frame', this.processFrame);
      this.on('complite:process', this.draw);
    }

    Ambilight.prototype.FPS = function(func, context) {
      this._FPS_storage.callback = func;
      return this.on('set:fps', (function(_this) {
        return function() {
          if (typeof _this._FPS_storage.callback === 'function') {
            return _this._FPS_storage.callback.call(context || _this, _this._FPS_storage.start, _this._FPS_storage.times);
          }
        };
      })(this));
    };

    Ambilight.prototype.fpsStart = function() {
      this._FPS_storage.start = new Date();
      return this._FPS_storage.times = {};
    };

    Ambilight.prototype.fpsSet = function(name) {
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

    Ambilight.prototype.setObject = function(obj) {
      throw new Error('Sorry, this mehtod in development :(');
    };

    Ambilight.prototype.setFrame = function(domObject, callback) {
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
      if (_.isFunction(callback)) {
        this.one('complite:process', callback);
      }
      return this.trigger('set:frame', this.frame);
    };

    Ambilight.prototype.processFrame = function(frame) {
      var ambi, ft, pixels;
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
        right: _.map(ambi.pixels.right, this.averageColor),
        left: _.map(ambi.pixels.left, this.averageColor),
        top: _.map(ambi.pixels.top, this.averageColor),
        bottom: _.map(ambi.pixels.bottom, this.averageColor)
      };
      this.fpsSet('process');
      return this.trigger('complite:process', ambi.colors);
    };

    Ambilight.prototype.pixelate = function(frame) {
      var i, pixelTable, width, _i, _ref;
      pixelTable = [];
      width = frame.width * 4;
      for (i = _i = 0, _ref = frame.height; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        pixelTable.push(Array.prototype.slice.call(frame.data, width * i, width * (i + 1)));
      }
      return pixelTable;
    };

    Ambilight.prototype.averageColor = function(pixels) {
      var a, b, g, i, length, pic, pics, r, _i, _len;
      if (_.isArray(_.first(pixels))) {
        pics = Array.prototype.concat.apply([], pixels);
      } else {
        pics = _.clone(pixels);
      }
      length = pics.length / 4;
      r = 0;
      g = 0;
      b = 0;
      a = 0;
      for (i = _i = 0, _len = pics.length; _i < _len; i = _i += 4) {
        pic = pics[i];
        r += pics[i];
        g += pics[i + 1];
        b += pics[i + 2];
        a += pics[i + 3];
      }
      return [Math.floor(r / length), Math.floor(g / length), Math.floor(b / length), Math.floor(a / length)];
    };

    Ambilight.prototype.cropPixels = function(pixels, frame, side) {
      var croped, deep, deepPics, height, part, partHeight, partWidth, parts, width, _i, _j, _k, _l;
      parts = this.options.sides[side];
      deep = this.options.deep;
      deepPics = deep * 4;
      width = frame.width;
      height = frame.height;
      croped = [];
      partWidth = Math.floor(width / parts);
      partHeight = Math.floor(height / parts);
      switch (side) {
        case 'top':
          for (part = _i = 0; 0 <= parts ? _i < parts : _i > parts; part = 0 <= parts ? ++_i : --_i) {
            croped.push(_.map(pixels.slice(0, deep), function(row, i) {
              return row.slice(part * partWidth * 4, (part + 1) * partWidth * 4);
            }));
          }
          break;
        case 'bottom':
          for (part = _j = 0; 0 <= parts ? _j < parts : _j > parts; part = 0 <= parts ? ++_j : --_j) {
            croped.push(_.map(pixels.slice(-deep), function(row, i) {
              return row.slice(part * partWidth * 4, (part + 1) * partWidth * 4);
            }));
          }
          break;
        case 'left':
          for (part = _k = 0; 0 <= parts ? _k < parts : _k > parts; part = 0 <= parts ? ++_k : --_k) {
            croped.push(_.map(pixels.slice(partHeight * part, partHeight * (part + 1)), function(row, i) {
              return row.slice(0, deepPics);
            }));
          }
          break;
        case 'right':
          for (part = _l = 0; 0 <= parts ? _l < parts : _l > parts; part = 0 <= parts ? ++_l : --_l) {
            croped.push(_.map(pixels.slice(partHeight * part, partHeight * (part + 1)), function(row, i) {
              return row.slice(-deepPics);
            }));
          }
      }
      return croped;
    };

    Ambilight.prototype.templateHorizontal = _.template("<div class=\"bColorHor\" style=\"width: <%= part %>%; background-color: rgba(<%= color %>); box-shadow: 0 0 150px 10px rgba(<%= color %>)\">");

    Ambilight.prototype.templateVertical = _.template("<div class=\"bColorVer\" style=\"height: <%= part %>%; background-color: rgba(<%= color %>); box-shadow: 0 0 150px 10px rgba(<%= color %>)\">");

    Ambilight.prototype.draw = function(ambi) {
      var bottomPart, color, i, leftPart, rightPart, topPart, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      $('#ambiPic').html(this.canvasEl);
      topPart = 100 / ambi.top.length;
      _ref = ambi.top;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        color = _ref[i];
        if ($('.bTop div').eq(i).length > 0) {
          $('.bTop div').eq(i).css({
            "background-color": "rgba(" + (color.join(',')) + ")",
            "box-shadow": "0 0 150px 10px rgba(" + color + ")"
          });
        } else {
          $('.bTop').append(this.templateHorizontal({
            part: topPart,
            color: color.join(',')
          }));
        }
      }
      bottomPart = 100 / ambi.bottom.length;
      _ref1 = ambi.bottom;
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        color = _ref1[i];
        if ($('.bBottom div').eq(i).length > 0) {
          $('.bBottom div').eq(i).css({
            "background-color": "rgba(" + (color.join(',')) + ")",
            "box-shadow": "0 0 150px 10px rgba(" + color + ")"
          });
        } else {
          $('.bBottom').append(this.templateHorizontal({
            part: bottomPart,
            color: color.join(',')
          }));
        }
      }
      leftPart = 100 / ambi.left.length;
      _ref2 = ambi.left;
      for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
        color = _ref2[i];
        if ($('.bLeft div').eq(i).length > 0) {
          $('.bLeft div').eq(i).css({
            "background-color": "rgba(" + (color.join(',')) + ")",
            "box-shadow": "0 0 150px 10px rgba(" + color + ")"
          });
        } else {
          $('.bLeft').append(this.templateVertical({
            part: leftPart,
            color: color.join(',')
          }));
        }
      }
      rightPart = 100 / ambi.right.length;
      _ref3 = ambi.right;
      for (i = _l = 0, _len3 = _ref3.length; _l < _len3; i = ++_l) {
        color = _ref3[i];
        if ($('.bRight div').eq(i).length > 0) {
          $('.bRight div').eq(i).css({
            "background-color": "rgba(" + (color.join(',')) + ")",
            "box-shadow": "0 0 150px 10px rgba(" + color + ")"
          });
        } else {
          $('.bRight').append(this.templateVertical({
            part: rightPart,
            color: color.join(',')
          }));
        }
      }
      return this.fpsSet('draw');
    };

    return Ambilight;

  })();

}).call(this);
