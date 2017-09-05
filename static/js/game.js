(function () {
  // 初始化canvas
  var initCanvas = function () {
    var canvas = document.getElementById('game');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var context = canvas.getContext('2d');
    context.width = window.innerWidth;
    context.height = window.innerHeight;
    return context
  }
  // 小球链子的构造函数
  var Chain = function (ball, context) {
    this.context = context
    this.color = '#333333'
    this.initX = 0;
    this.initY = 0;
    this.objX = 200;
    this.objY = 200;
    this.frequency = 6;
    this.initRadius = 10;
    this.radius = 5;
    this._init(ball);
  }
  // 链子的初始化方法
  Chain.prototype._init = function (ball) {
    var ballCenter = ball._computedCenter()
    this.initX = ballCenter.x - this.initRadius;
    this.initY = ballCenter.y - this.initRadius;
  }
  // 绘制圆形方法
  Chain.prototype._drawCircle = function (x, y, radius) {
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2, true);
    this.context.closePath();
    this.context.fill();
  }
  // 绘制链子
  Chain.prototype.draw = function (ball) {
    var ballCenter = ball._computedCenter()
    this.objX = ballCenter.x;
    this.objY = ballCenter.y;
    this._drawCircle(this.initX, this.initY, this.initRadius)
    for (var i = 2, len = this.frequency + 2; i < len; i++) {
      this._drawCircle(this.initX + (this.objX - this.initX) * i / len, this.initY + (this.objY - this.initY) * i / len, this.radius)
    }
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
    this.chain = null;
    this.speed = 0;
    this.runFlag = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this._init();
  }
  // 小球初始化方法
  Ball.prototype._init = function () {
    this.x = this.initX;
    this.y = this.initY;
    this.chain = new Chain(this, this.context)
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
  // 计算距离
  Ball.prototype._computedDistance = function (x, y, objX, objY) {
    return Math.sqrt(Math.pow(objX - x, 2) + Math.pow(objY - y, 2))
  }
  // 判断点击的是否是小球
  Ball.prototype._isClickSelf = function (e) {
    var offset = {
      x: e.clientX - this.x,
      y: e.clientY - this.y,
    }
    var center = this._computedCenter();
    var is = this._computedDistance(e.clientX, e.clientY, center.x, center.y) < this.radius;
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
        console.log('click ball')
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
      mouseDownFlag = false;
      var distance = that._computedDistance(e.clientX, e.clientY, that.initX, that.initY);
      if (distance) {
        that.offsetX = that.initX - e.clientX
        that.offsetY = that.initY - e.clientY
        that.speed = distance / 10;
        that.switchRun(true);
      }
    })
  }
  // 绘制小球
  Ball.prototype.draw = function () {
    this.context.clearRect(0, 0, this.context.width, this.context.height);
    this.context.drawImage(this.image, this.x, this.y, this.radius * 2, this.radius * 2);
    this.chain && this.chain.draw(this)
    this.runFlag && this._run()
  }
  // 小球运动
  Ball.prototype._run = function () {
    var offsetSum = (Math.abs(this.offsetX) + Math.abs(this.offsetY))
    this.x += this.speed * this.offsetX / offsetSum;
    this.y += this.speed * this.offsetY / offsetSum;
    this.speed = this.speed - this.speed / 50
  }
  // 小球运动开关
  Ball.prototype.switchRun = function (bool) {
    this.runFlag = bool
  }
  // 主函数
  var main = function () {
    var context = initCanvas()
    var ball = new Ball(context)
    // 开始动画
    animationId = window.requestAnimationFrame(function step() {
      ball.draw();
      requestAnimationFrame(step);
    })
  }
  window.onload = main
  // 调整窗口大小
  var animationId
  window.addEventListener('resize', function () {
    window.cancelAnimationFrame(animationId);
    main()
  })
})()