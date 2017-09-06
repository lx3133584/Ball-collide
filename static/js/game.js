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
    this.x = 0;
    this.y = 0;
    this.objX = 200;
    this.objY = 200;
    this.frequency = 6;
    this.initRadius = 10;
    this.radius = 5;
    this.life = true
    this._init(ball);
  }
  // 链子的初始化方法
  Chain.prototype._init = function (ball) {
    var ballCenter = ball._computedCenter()
    this.x = ballCenter.x - this.initRadius;
    this.y = ballCenter.y - this.initRadius;
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
    if(!this.life) return
    var ballCenter = ball._computedCenter()
    this.objX = ballCenter.x;
    this.objY = ballCenter.y;
    this._drawCircle(this.x, this.y, this.initRadius)
    for (var i = 2, len = this.frequency + 2; i < len; i++) {
      this._drawCircle(this.x + (this.objX - this.x) * i / len, this.y + (this.objY - this.y) * i / len, this.radius)
    }
  }
  // 回收链子
  Chain.prototype.impact = function (ball) {
    this.life = false
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
    this.impactObj = [];
    this._init();
  }
  // 小球初始化方法
  Ball.prototype._init = function () {
    this.x = this.initX;
    this.y = this.initY;
    this.image.src = './static/image/ball_2.png';
    this._bindDrag();
    this._addImpactObj({x: 0}, true)
    this._addImpactObj({x: this.context.width}, true)
    this._addImpactObj({y: 0}, true)
    this._addImpactObj({y: this.context.height}, true)
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
    if (objX === undefined) return Math.abs(y - objY)
    if (objY === undefined) return Math.abs(x - objX)
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
    var _this = this
    var offset = {}
    document.body.addEventListener('mousedown', function (e) {
      var result = _this._isClickSelf(e)
      if (result.is) {
        console.log('click ball')
        _this.chain = new Chain(_this, _this.context)
        mouseDownFlag = true
        offset = result.offset
      }
    })
    document.body.addEventListener('mousemove', function (e) {
      if (mouseDownFlag) {
        _this.x = e.clientX - offset.x;
        _this.y = e.clientY - offset.y;
      }
    })
    document.body.addEventListener('mouseup', function (e) {
      mouseDownFlag = false;
      var distance = _this._computedDistance(e.clientX, e.clientY, _this.chain.x, _this.chain.y);
      if (distance) {
        _this.offsetX = _this.chain.x - e.clientX
        _this.offsetY = _this.chain.y - e.clientY
        _this.speed = distance / 5;
        _this.switchRun(true);
        _this._addImpactObj(_this.chain, false)
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
    this.speed = this.speed - this.speed / 100;
    this._impactCheckingList()
  }
  // 小球运动开关
  Ball.prototype.switchRun = function (bool) {
    this.runFlag = bool
  }
  // 小球碰撞检测
  Ball.prototype._impactChecking = function (Obj) {
    var center = this._computedCenter();
    var obj = Obj.obj
    var radius = obj.radius || 0;
    return this._computedDistance(center.x, center.y, obj.x, obj.y) < this.radius + radius;
  }
  // 批量碰撞检测
  Ball.prototype._impactCheckingList = function () {
    for(var i = 0, len = this.impactObj.length; i < len; i++) {
      var obj = this.impactObj[i]
      if (this._impactChecking(obj)) {
        console.log('impacting')
        if (obj.bounce) {
          this.speed *= -1
        } else {
          obj.obj.impact()
          this._removeImpactObj(obj)
        }
      }
    }
  }
  // 添加碰撞检测的对象
  Ball.prototype._addImpactObj = function (obj, bounce) {
    this.impactObj.push({
      obj: obj,
      bounce: bounce
    })
  }
  // 移除碰撞检测的对象
  Ball.prototype._removeImpactObj = function (obj) {
    this.impactObj.splice(this.impactObj.indexOf(obj), 1)
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