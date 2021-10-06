var interval;
var currX, currY, prevX, prevY, lastScrollTop = 0;

function start() {
  display();
  window.addEventListener('mousedown', function (e) {
    if (e.preventDefault) e.preventDefault();
    cancelAnimationFrame(interval);
    interval = requestAnimationFrame(update);
    currX = prevX = e.pageX;
    currY = prevY = e.pageY;
    window.onmousemove = function (f) {
      currX = f.pageX;
      currY = f.pageY;
    }
  });
  window.addEventListener('mouseup', function () {
    cancelAnimationFrame(interval);
  });
  canvas.onmousewheel = function (e) {
    let w = e.wheelDelta;
    if (w>0 && (focal-near)/focal<10) {
      near-=50;
      focal-=50;
    } else {
      near+=50;
      focal+=50;
    }
    clear(); draw();
  };
}

function display() {document.getElementById('th').innerHTML = th.x.toFixed(2) + ', ' + th.y.toFixed(2) + ', ' + th.z.toFixed(2);}
function clear() {ctx.clearRect(0,0,window.innerWidth, window.innerHeight);}

function update(nt) {
  clear();
  if (currX && currY) {
    th.x-=(currX-prevX)/200;
    th.y-=(currY-prevY)/200;
    th.x%=2*pi; th.y%=2*pi
  }
  prevX = currX;
  prevY = currY;
  display();
  interval = requestAnimationFrame(update);
  draw();
}
start();


(function() {
    initialize();
    function initialize() {
        window.addEventListener('resize', resizeCanvas, false);
        resizeCanvas();
    }
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.origin = {x:canvas.width/2,y:canvas.height/2};
        cancelAnimationFrame(interval);
        draw();
    }
})();
