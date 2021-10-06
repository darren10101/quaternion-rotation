var MAX = Number.MAX_VALUE, MIN = Number.MIN_VALUE;


var canvas = document.getElementById('cnvs');
canvas.context = ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.origin = {x:canvas.width/2, y:canvas.height/2};


var z_buffer = new Map();

function z_buffer_reset() {z_buffer = new Map()}

class Path {
  constructor() {
    this.pt = [];
    this.vis;
    this.minX = MAX;
    this.maxX = MIN;
    this.minY = MAX;
    this.maxY = MIN;
  }
  move(v) {
    this.pt = [...this.pt,v];
    this.x = v.x;
    this.X = v.x;
    this.y = v.y;
    this.Y = v.y;
  }
  line(v) {
    this.pt = [...this.pt,v];
    if (v.x>this.X) this.X = v.x;
    else if (v.x<this.x) this.x = v.x;
    if (v.y>this.Y) this.Y = v.y;
    else if (v.y<this.y) this.y = v.y;
  }
  stroke() {
    // ctx.fillStyle = 'rgb('+color.r+', '+color.g+', '+color.b+')';
    for (let i=1; i<this.pt.length; i++) {
      let a = this.pt[i-1], mx = a.x-this.pt[i].x, mz = a.z-this.pt[i].z,
      dx = Math.abs(a.x-this.pt[i].x),
      sx = a.x<this.pt[i].x?1:-1,
      dy = -Math.abs(a.y-this.pt[i].y),
      sy = a.y<this.pt[i].y?1:-1,
      err = dx+dy,
      v = a;
      a.x = Math.floor(a.x); a.y = Math.floor(a.y);
      if (a.x<0 || a.y<0 || this.pt[i].x<0 || this.pt[i].y<0) break;
      for (;;) {
        let t = (a.x-v.x)/mx, z = v.z+t*mz;
        if (z>z_buffer[a.x][a.y]) {
          z_buffer[a.x][a.y]=z;
          ctx.fillRect(a.x,a.y,1,1);
        }
        if (a.x==Math.floor(this.pt[i].x) && a.y==Math.floor(this.pt[i].y)) break;
        let errr = 2*err;
        if (errr>=dy) {
          err+=dy;
          a.x+=sx;
        }
        if (errr<=dx) {
          err+=dx;
          a.y+=sy;
        }
      }
    }
  }
  fill(n) {
    let vis = new Map();
    for (let i=1; i<this.pt.length; i++) {
      let a = this.pt[i-1],
      dx = Math.abs(a.x-this.pt[i].x),
      sx = a.x<this.pt[i].x?1:-1,
      dy = -Math.abs(a.y-this.pt[i].y),
      sy = a.y<this.pt[i].y?1:-1,
      err = dx+dy;
      for (;;) {
        vis[a.x-this.x][a.y-this.y]=false;
        if (a.x==this.pt[i].x && a.y==this.pt[i].y) break;
        let errr = 2*err;
        if (errr>=dy) {
          err+=dy;
          a.x+=sx;
        }
        if (errr<=dx) {
          err+=dx;
          a.y+=sy;
        }
      }
    }
    let d = -n.x*this.pt[0].x-n.y*this.pt[0].y-n.z*this.pt[0].z, 
    midX = (this.X+this.x)/2, midY = (this.Y+this.y)/2;
    // ctx.fillStyle = 'rgb('+color.r+', '+color.g+', '+color.b+')';
    fill(V.$(midX,midY,-(n.x*midX+n.y*midY+d)/n.z),vis,n.x,n.y,n.z)
  }
  close() {this.pt = [...this.pt,this.pt[0]];}
}

function fill(v,vis,a,b,c) {
  vis[v.x][v.y] = false;
  if (v.z>z_buffer[v.x][v.y]) ctx.fillRect(v.x,v.y,1,1);
  if (!vis[v.x+1][v.y]) fillR(V.$(v.x+1,v.y,v.z-a/c),vis,a,b,c);
  if (!vis[v.x-1][v.y]) fillL(V.$(v.x-1,v.y,v.z+a/c),vis,a,b,c);
  if (!vis[v.x][v.y+1]) fillD(V.$(v.x,v.y+1,v.z-b/c),vis,a,b,c);
  if (!vis[v.x][v.y-1]) fillU(V.$(v.x,v.y-1,v.z+b/c),vis,a,b,c);
}
function fillU(v,vis,a,b,c) {
  vis[v.x][v.y] = false;
  if (v.z>z_buffer[v.x][v.y]) ctx.fillRect(v.x,v.y,1,1);
  if (!vis[v.x+1][v.y]) fillR(V.$(v.x+1,v.y,v.z-a/c),vis,a,b,c);
  if (!vis[v.x-1][v.y]) fillL(V.$(v.x-1,v.y,v.z+a/c),vis,a,b,c);
  if (!vis[v.x][v.y-1]) fillU(V.$(v.x,v.y-1,v.z+b/c),vis,a,b,c);
}
function fillD(v,vis,a,b,c) {
  vis[v.x][v.y] = false;
  if (v.z>z_buffer[v.x][v.y]) ctx.fillRect(v.x,v.y,1,1);
  if (!vis[v.x+1][v.y]) fillR(V.$(v.x+1,v.y,v.z-a/c),vis,a,b,c);
  if (!vis[v.x-1][v.y]) fillL(V.$(v.x-1,v.y,v.z+a/c),vis,a,b,c);
  if (!vis[v.x][v.y+1]) fillD(V.$(v.x,v.y+1,v.z-b/c),vis,a,b,c);

}
function fillL(v,vis,a,b,c) {
  vis[v.x][v.y] = false;
  if (v.z>z_buffer[v.x][v.y]) ctx.fillRect(v.x,v.y,1,1);
  if (!vis[v.x][v.y+1]) fillD(V.$(v.x,v.y+1,v.z-b/c),vis,a,b,c);
  if (!vis[v.x][v.y-1]) fillU(V.$(v.x,v.y-1,v.z+b/c),vis,a,b,c);
  if (!vis[v.x-1][v.y]) fillL(V.$(v.x-1,v.y,v.z+a/c),vis,a,b,c);

}
function fillR(v,vis,a,b,c) {
  vis[v.x][v.y] = false;
  if (v.z>z_buffer[v.x][v.y]) ctx.fillRect(v.x,v.y,1,1);
  if (!vis[v.x][v.y+1]) fillD(V.$(v.x,v.y+1,v.z-b/c),vis,a,b,c);
  if (!vis[v.x][v.y-1]) fillU(V.$(v.x,v.y-1,v.z+b/c),vis,a,b,c);
  if (!vis[v.x+1][v.y]) fillR(V.$(v.x+1,v.y,v.z-a/c),vis,a,b,c);
}