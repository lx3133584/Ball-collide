(function () {
  // 获取设备的 pixel ratio  (polyfill 提供了这个方法)
  var getPixelRatio = function (context) {
    var backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;

    return (window.devicePixelRatio || 1) / backingStore;
  };
  // 初始化canvas
  var initCanvas = function () {
    var canvas = document.getElementById('game');
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    var context = canvas.getContext('2d');
    context.ratio = getPixelRatio(context);
    context.width = canvas.width;
    context.height = canvas.height;
    return context
  }
  // 小球链子的构造函数
  var Chain = function (context) {
    this.context = context
    this.color = '#333333'
    this.initX = 0;
    this.initY = 0;
    this.objX = 100;
    this.objY = 100;
    this.frequency = 4;
    this.initRadius = 10;
    this.radius = 5;
    this._init()
  }
  // 链子的初始化方法
  Chain.prototype._init = function () {
    this._drawCircle(this.initX, this.initY, this.initRadius)
    for (var i = 0, len = this.frequency; i < len; i++) {
      this._drawCircle(this.initX + (this.initX - this.objX) / i, this.initY + (this.initY - this.objY) / i, this.radius)
    }
  }
  // 绘制圆形方法
  Chain.prototype._drawCircle = function (x, y, radius) {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2, true);
    this.context.closePath();
    this.context.fill();
  }
  // 小球的构造函数
  var Ball = function (context) {
    this.context = context
    this.image = new Image();
    this.radius = 50;
    this.initX = this.context.width / 2 - this.radius;
    this.initY = this.context.height / 2 - this.radius;
    this.x = 0;
    this.y = 0;
    this._init();
  }
  // 小球初始化方法
  Ball.prototype._init = function () {
    this.x = this.initX;
    this.y = this.initY;
    this.image.src = './static/image/ball_2.png';
    this._bindDrag();
  }
  // 计算并返回小球中心坐标
  Ball.prototype._computedCenter = function () {
    return {
      x: this.x + this.radius,
      y: this.y + this.radius,
    }
  }
  // 判断点击的是否是小球
  Ball.prototype._isClickSelf = function (e) {
    var offset = {
      x: e.clientX - this.x,
      y: e.clientY - this.y,
    }
    var center = this._computedCenter();

    var is = Math.sqrt(Math.pow(center.x - e.clientX, 2) + Math.pow(center.y - e.clientY, 2)) < this.radius;
    return {
      is: is,
      offset: offset,
    }
  }
  // 绑定小球拖拽的方法
  Ball.prototype._bindDrag = function () {
    var mouseDownFlag = false
    var that = this
    var offset = {}
    document.body.addEventListener('mousedown', function (e) {
      var result = that._isClickSelf(e)
      if (result.is) {
        mouseDownFlag = true
        offset = result.offset
      }
    })
    document.body.addEventListener('mousemove', function (e) {
      if (mouseDownFlag) {
        that.x = e.clientX - offset.x;
        that.y = e.clientY - offset.y;
      }
    })
    document.body.addEventListener('mouseup', function (e) {
      mouseDownFlag = false
    })
  }
  // 绘制小球
  Ball.prototype.draw = function () {
    this.context.clearRect(0, 0, this.context.width, this.context.height);
    this.context.drawImage(this.image, this.x, this.y, this.radius * this.context.ratio * 2, this.radius * this.context.ratio * 2);
  }
  // 主函数
  var main = function () {
    var context = initCanvas()
    var ball = new Ball(context)
    var chain = new Chain(context)
    window.requestAnimationFrame(function step() {
      ball.draw();
      requestAnimationFrame(step);
    })

  }
  main()
})()
