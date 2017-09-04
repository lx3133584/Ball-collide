(function() {
  var initCanvas = function() {
    var canvas = document.getElementById('game');
    var context = canvas.getContext('2d');
    context.width = canvas.offsetWidth;
    context.height = canvas.offsetHeight;
    return context
  }
  var Ball = function() {
    this.image = new Image();
    this.width = 20;
    this.height = 20;
    this.x = 0;
    this.y = 0;
    this._init();
  }
  Ball.prototype._init = function() {
    this.image.src = './static/image/ball_2.png';
    this._drag();
  }
  Ball.prototype._isClickSelf = function(e) {
    var offset = {
      x: e.clientX - this.x,
      y: e.clientY - this.y,
    }
    var is = offset.x < this.width 
    && offset.y < this.height
    return {
      is: is,
      offset: offset,
    }
  }
  Ball.prototype._drag = function() {
    var mouseDownFlag = false
    var that = this
    var offset = {}
    document.body.addEventListener('mousedown', function(e) {
      var result = that._isClickSelf(e)
      if (result.is) {
        mouseDownFlag = true
        offset = result.offset
      }
    })
    document.body.addEventListener('mousemove', function(e) {
      if (mouseDownFlag) {
        that.x = e.clientX + offset.x;
        that.y = e.clientY + offset.y;
      }
    })
    document.body.addEventListener('mouseup', function(e) {
      mouseDownFlag = false
    })
  }
  Ball.prototype.draw = function(context) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
  
  var main = function() {
    var context = initCanvas()
    var ball = new Ball()
    window.requestAnimationFrame(function step() {
      context.clearRect(0, 0, context.width, context.height);
      ball.draw(context);
      context.fillStyle="#000000";
      context.beginPath();
      context.arc(50, 50, 50, 0, Math.PI*2, true);
      context.closePath();
      context.fill();
      requestAnimationFrame(step);
    })
    
  }
  main()
})()
