var checked = false;
function check() {checked=checked?false:true; clear(); draw();}

const Obj = {};
Obj.plane = function (pq, pts, culling=false, color={r:0,g:0,b:0}) {
  let pt = V.plot(V.R(pts)),
  normal = V.normal(pt),
  avg = pt.reduce((a,b) => a+b.z,0)/pt.length;
  if (culling && normal.z>0) return;
  for (let i of pt) if (i.z>focal) return;
  let dot = normal.z/normal.len(),
  shading = Math.floor(Math.abs(80*dot));
  pq.push(function () {
    ctx.fillStyle = 'rgb('+(shading+color.r)+', '+(shading+color.g)+', '+(shading+color.b)+')',
    ctx.beginPath();
    ctx.moveTo(pt[0].x,pt[0].y);
    for (let i=1; i<pt.length; i++) ctx.lineTo(pt[i].x,pt[i].y);
    ctx.closePath();
    if (checked) ctx.stroke();
    ctx.fill();
  },avg);
}

Obj.prism = function (pq,a,b,culling=true,color={r:0,g:0,b:0}) {
  let temp;
  if (a.x<b.x) {
    temp = a.x;
    a.x = b.x;
    b.x = temp;
  }
  if (a.y<b.y) {
    temp = a.y;
    a.y = b.y;
    b.y = temp;
  }
  if (a.z<b.z) {
    temp = a.z;
    a.z = b.z;
    b.z = temp;
  }
  let p1 = V.$(b.x,a.y,a.z), p2 = V.$(a.x,b.y,a.z), p3 = V.$(a.x,a.y,b.z),
  p4 = V.$(a.x,b.y,b.z), p5 = V.$(b.x,a.y,b.z), p6 = V.$(b.x,b.y,a.z);
  Obj.plane(pq,[a,p1,p5,p3],culling,color);
  Obj.plane(pq,[a,p2,p6,p1],culling,color);
  Obj.plane(pq,[a,p3,p4,p2],culling,color);
  Obj.plane(pq,[b,p6,p2,p4],culling,color);
  Obj.plane(pq,[b,p5,p1,p6],culling,color);
  Obj.plane(pq,[b,p4,p3,p5],culling,color);
}

function draw() {
  let z_paint = new PriorityQueue();
  Obj.prism(z_paint,V.$(100,100,100),V.$(-100,-100,-100),false,color(150,0,0));
  Obj.prism(z_paint,V.$(500,100,100),V.$(300,-100,-100),true,color(0,150,0));
  Obj.prism(z_paint,V.$(-300,100,100),V.$(-500,-100,-100),true,color(0,0,150));
  Obj.prism(z_paint,V.$(100,500,100),V.$(-100,300,-100),true,color(150,150,0));
  Obj.prism(z_paint,V.$(100,-300,100),V.$(-100,-500,-100),true,color(150,0,150));
  Obj.prism(z_paint,V.$(100,100,500),V.$(-100,-100,300),true,color(0,150,150));
  Obj.prism(z_paint,V.$(100,100,-300),V.$(-100,-100,-500),true,color(150,150,150));
  z_paint.run();
}
