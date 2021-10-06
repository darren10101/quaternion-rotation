var focal = 1000, near = 10, th = {x:0,y:0,z:0};
var pi = Math.PI;

var canvas = document.getElementById('cnvs');
canvas.context = ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.origin = {x:canvas.width/2, y:canvas.height/2};

function color(r,g,b) {return {r:r,g:g,b:b};}

class Point {
  constructor(a) {
    this.x = a[0];
    this.y = a[1];
  }
  floor() {return P.$(Math.floor(this.x),Math.floor(this.y));}
}

class Vector {
  constructor(p) {
    this.x = p[0];
    this.y = p[1];
    this.z = p[2];
  }
  unit() {
    let len = Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
    return V.$(this.x/len,this.y/len,this.z/len)
  }
  len() {
    return Math.sqrt(this.x**2+this.y**2+this.z**2);
  }
  R(axis, th) {
    let sin = -Math.sin(th/2),
        cos = Math.cos(th/2),
        w = -sin*axis.x*this.x-sin*axis.y*this.y-sin*axis.z*this.z,
        x = cos*this.x+sin*axis.y*this.z-sin*axis.z*this.y,
        y = cos*this.y-sin*axis.x*this.z+sin*axis.z*this.x,
        z = cos*this.z+sin*axis.x*this.y-sin*axis.y*this.x;
        return V.$(x*cos-sin*(w*axis.x+y*axis.z-z*axis.y),y*cos-sin*(w*axis.y-x*axis.z+z*axis.x),z*cos-sin*(w*axis.z+x*axis.y-y*axis.x));
  }
  Rx(th) {
    let sin = -Math.sin(th/2),
    cos = Math.cos(th/2),
    w = -sin*this.x,
    x = cos*this.x,
    y = cos*this.y-sin*this.z,
    z = cos*this.z+sin*this.y;
    return V.$(-w*sin+x*cos,y*cos-z*sin,y*sin+z*cos);
  }
  Ry(th) {
    let sin = -Math.sin(th/2),
    cos = Math.cos(th/2),
    w = -sin*this.y,
    x = cos*this.x+sin*this.z,
    y = cos*this.y,
    z = cos*this.z-sin*this.x;
    return V.$(x*cos+z*sin,-w*sin+y*cos,-x*sin+z*cos);
  }
  Rz(th) {
    let sin = -Math.sin(th/2),
    cos = Math.cos(th/2),
    w = -sin*this.z,
    x = cos*this.x-sin*this.y,
    y = cos*this.y+sin*this.x,
    z = cos*this.z;
    return V.$(x*cos-y*sin,x*sin+y*cos,-w*sin+z*cos);
  }
  plot() {
    let sl = Math.abs((focal-near)/(focal-this.z));
    return V.$(canvas.origin.x+this.x*sl, canvas.origin.y-this.y*sl, this.z);
  }
  point() {return P.$(this.x,this.y);}
}

class PriorityQueue {
  constructor() {
    this.a = [];
    this.obj = [];
  }
  push(obj,x=obj) {
    let low = 0, high = this.a.length, mid = Math.floor((low+high)/2);
    while (low<high) {
      mid = Math.floor((low+high)/2);
      if (x<=this.a[mid]) high = mid;
      else low=mid+1;
    }
    if (low<this.a.length-1 && this.a[low]<x) {
      this.a.splice(low+1,0,x);
      this.obj.splice(low+1,0,obj);
    } else {
      this.a.splice(low,0,x);
      this.obj.splice(low,0,obj);
    }
  }
  run() {for (let i of this.obj) i();}
}

// Functions

const P = {};
P.$ = function (x,y) {return new Point([x,y]);}
P.add = function () {
  let x, y;
  for (let i of arguments) {
    x+=i.x; y+=i.y;
  }
  return P.$(x,y);
}

const V = {};
V.$ = function (x,y,z) {return new Vector([x,y,z]);}
V.multiply = function () {
  let a = arguments;
  if (a[0] instanceof Array) a = a[0];
  let x = a[0].y*a[1].z-a[0].z*a[1].y,
      y = a[0].z*a[1].x-a[0].x*a[1].z,
      z = a[0].x*a[1].y-a[0].y*a[1].x,
      v = V.$(x, y, z);
  if (a.length==2) return v;
  let b = Array.prototype.slice.call(a,1); b[0]=v;
  return V.multiply(b);
}
V.normal = function (a) {
  let p = V.$(a[0].x-a[1].x,a[0].y-a[1].y,a[0].z-a[1].z),
      q = V.$(a[2].x-a[1].x,a[2].y-a[1].y,a[2].z-a[1].z);
  return V.multiply(p,q);
}
V.plot = function (a) {return a.map(v => v.plot());}
V.R = function (a) {
  for (let i=0; i<a.length; i++) a[i] = a[i].Ry(th.x).Rx(th.y);
  return a;
}