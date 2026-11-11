import * as THREE from './three.module.min.js';
(function(){
'use strict';
var clamp=function(x,a,b){a=a===undefined?0:a;b=b===undefined?1:b;return Math.min(b,Math.max(a,x))};
var ss=function(a,b,x){var t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
var lerp=function(a,b,t){return a+(b-a)*t};
var $=function(id){return document.getElementById(id)};
var body=document.body;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var forceFb=/[?&]fallback=1/.test(location.search);

function glOK(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')))}catch(e){return false}}
function fallback(){
  body.classList.add('fallback','is-ready');
  document.querySelectorAll('.fb source[data-srcset]').forEach(function(s){s.srcset=s.dataset.srcset});document.querySelectorAll('.fb img[data-src]').forEach(function(i){i.loading='lazy';i.src=i.dataset.src});
}
if(!glOK()||reduce||forceFb){fallback();return}
try{init()}catch(err){console.warn('3D unavailable, using photos',err&&err.message);fallback()}

function init(){
var T=THREE;
var rngf=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};

/* ---------------- renderer ---------------- */
var canvas=$('gl'),stage=$('stage'),pin=$('walk');
var renderer=new T.WebGLRenderer({canvas:canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=T.SRGBColorSpace;
renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
var maxAniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
var lost=false;canvas.addEventListener('webglcontextlost',function(e){e.preventDefault();lost=true});
var scene=new T.Scene();
var camera=new T.PerspectiveCamera(60,1,0.05,400);

/* ---------------- procedural textures ---------------- */
function mk(s,h){var c=document.createElement('canvas');c.width=s;c.height=h||s;return c}
function fin(c,rep){var t=new T.CanvasTexture(c);t.wrapS=t.wrapT=rep===false?T.ClampToEdgeWrapping:T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=maxAniso;return t}
var small=Math.min(innerWidth,innerHeight)<600&&devicePixelRatio>1.5;
var TS=small?1024:2048,TM=1024;

function texCarpet(){
  var S=TM,c=mk(S),x=c.getContext('2d'),r=rngf(7),n=4,ts=S/n;
  x.fillStyle='#4a4344';x.fillRect(0,0,S,S);
  for(var j=0;j<n;j++)for(var i=0;i<n;i++){
    var l=(r()-.5)*6;x.fillStyle='rgb('+(92+l)+','+(82+l)+','+(83+l)+')';x.fillRect(i*ts,j*ts,ts,ts);
    var ang=(i+j)%2?0:Math.PI/2;
    for(var k=0;k<460;k++){var px=i*ts+r()*ts,py=j*ts+r()*ts,len=8+r()*24;
      x.strokeStyle=r()<.5?'rgba(150,136,130,'+(.05+r()*.12)+')':'rgba(8,8,12,'+(.08+r()*.16)+')';x.lineWidth=1+r()*1.6;
      x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(ang)*len,py+Math.sin(ang)*len);x.stroke()}
    x.strokeStyle='rgba(8,8,10,.22)';x.lineWidth=2;x.strokeRect(i*ts+1,j*ts+1,ts-2,ts-2);
  }
  var id=x.getImageData(0,0,S,S),d=id.data;for(var q=0;q<d.length;q+=4){var v=(r()-.5)*24;d[q]+=v;d[q+1]+=v;d[q+2]+=v}x.putImageData(id,0,0);
  return fin(c)}
function texPlanks(o){
  var S=o.size||TS,c=mk(S),x=c.getContext('2d'),r=rngf(o.seed),cols=o.cols,cw=S/cols;
  x.fillStyle=o.gap;x.fillRect(0,0,S,S);
  function plank(x0,y0,w,h){
    x.save();x.beginPath();x.rect(x0,y0,w,h);x.clip();
    var hh=o.h+(r()-.5)*o.hv,ll=o.l+(r()-.5)*o.lv;
    x.fillStyle='hsl('+hh+' '+(o.s+(r()-.5)*4)+'% '+ll+'%)';x.fillRect(x0,y0,w,h);
    var g=x.createLinearGradient(0,y0,0,y0+h);g.addColorStop(0,'rgba(255,230,190,'+(.03+r()*.05)+')');g.addColorStop(1,'rgba(0,0,0,'+(.04+r()*.06)+')');x.fillStyle=g;x.fillRect(x0,y0,w,h);
    for(var i=0;i<o.grain;i++){var gx=x0+r()*w,amp=w*(.02+r()*.07),ph=r()*6.28,f=(.5+r()*2)/h;
      x.beginPath();for(var k=0;k<=12;k++){var yy=y0+h*k/12,xx=gx+Math.sin(yy*f*6.28+ph)*amp;k?x.lineTo(xx,yy):x.moveTo(xx,yy)}
      x.strokeStyle=r()<.7?'rgba('+o.dark+','+(.05+r()*.14)+')':'rgba(255,238,210,'+(.03+r()*.07)+')';x.lineWidth=.6+r()*1.8;x.stroke()}
    x.restore();
    x.strokeStyle=o.gap;x.lineWidth=o.gw;x.strokeRect(x0+.5,y0+.5,w-1,h-1);
  }
  for(var ci=0;ci<cols;ci++){
    var y=r()*S*.5,end=y+S;
    while(y<end){var len=Math.min(S*(o.seg[0]+r()*(o.seg[1]-o.seg[0])),end-y);if(end-y-len<S*.1)len=end-y;
      for(var off=-S;off<=S;off+=S)plank(ci*cw,y+off,cw,len);y+=len}
  }
  return fin(c)}
function texTile(){
  var S=TS,c=mk(S),x=c.getContext('2d'),r=rngf(23),n=4,ts=S/n;
  x.fillStyle='#8f8a80';x.fillRect(0,0,S,S);
  for(var j=0;j<n;j++)for(var i=0;i<n;i++){
    var l=(r()-.5)*5;x.save();x.beginPath();x.rect(i*ts+4,j*ts+4,ts-8,ts-8);x.clip();
    x.fillStyle='hsl(40 12% '+(78+l)+'%)';x.fillRect(i*ts,j*ts,ts,ts);
    for(var b=0;b<9;b++){var cx=i*ts+r()*ts,cy=j*ts+r()*ts,rad=ts*(.2+r()*.4),g=x.createRadialGradient(cx,cy,0,cx,cy,rad);
      g.addColorStop(0,'rgba('+(r()<.5?'120,112,100':'255,252,244')+','+(.08+r()*.1)+')');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(i*ts,j*ts,ts,ts)}
    for(var v=0;v<3;v++){var vx=i*ts+r()*ts,vy=j*ts+r()*ts;x.beginPath();x.moveTo(vx,vy);
      for(var k=0;k<26;k++){vx+=(r()-.45)*ts*.07;vy+=(r()-.3)*ts*.07;x.lineTo(vx,vy)}
      x.strokeStyle='rgba(110,100,88,'+(.1+r()*.16)+')';x.lineWidth=1+r()*1.8;x.stroke()}
    x.restore();
  }
  return fin(c)}
function texRug(){
  var S=512,c=mk(S),x=c.getContext('2d'),r=rngf(5);
  x.fillStyle='#a69d8f';x.fillRect(0,0,S,S);
  for(var i=0;i<S;i+=3){x.fillStyle='rgba(222,212,194,'+(.18+r()*.2)+')';x.fillRect(i,0,1.5,S);x.fillStyle='rgba(60,50,40,'+(.12+r()*.16)+')';x.fillRect(0,i,S,1.5)}
  x.strokeStyle='#8a8070';x.lineWidth=18;x.strokeRect(14,14,S-28,S-28);
  x.strokeStyle='rgba(215,203,183,.55)';x.lineWidth=3;x.strokeRect(34,34,S-68,S-68);
  var t=fin(c,false);return t}
function texBlob(){
  var c=mk(128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,6,64,64,64);
  g.addColorStop(0,'rgba(0,0,0,.62)');g.addColorStop(.55,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  return fin(c,false)}
function texGlow(){
  var c=mk(128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,210,150,.95)');g.addColorStop(.25,'rgba(255,170,90,.42)');g.addColorStop(1,'rgba(255,150,70,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  return fin(c,false)}
function texConcrete(){
  var S=512,c=mk(S),x=c.getContext('2d'),r=rngf(11);
  x.fillStyle='#bbb7ad';x.fillRect(0,0,S,S);
  var id=x.getImageData(0,0,S,S),d=id.data;for(var q=0;q<d.length;q+=4){var v=(r()-.5)*16;d[q]+=v;d[q+1]+=v;d[q+2]+=v}x.putImageData(id,0,0);
  x.strokeStyle='rgba(60,56,50,.55)';x.lineWidth=4;x.strokeRect(0,0,S,S);
  return fin(c)}
function texAsphalt(){
  var S=512,c=mk(S),x=c.getContext('2d'),r=rngf(13);
  x.fillStyle='#34353a';x.fillRect(0,0,S,S);
  var id=x.getImageData(0,0,S,S),d=id.data;for(var q=0;q<d.length;q+=4){var v=(r()-.5)*26;d[q]+=v;d[q+1]+=v;d[q+2]+=v}x.putImageData(id,0,0);
  return fin(c)}
function texClock(){
  var S=512,c=mk(S),x=c.getContext('2d');
  x.fillStyle='#232628';x.beginPath();x.arc(256,256,256,0,6.283);x.fill();
  x.strokeStyle='#0d0e0f';x.lineWidth=14;x.beginPath();x.arc(256,256,248,0,6.283);x.stroke();
  x.fillStyle='#dedcd4';x.font='600 56px Georgia,serif';x.textAlign='center';x.textBaseline='middle';
  for(var i=1;i<=12;i++){var a=i/12*6.283-1.5708;x.fillText(String(i),256+Math.cos(a)*200,260+Math.sin(a)*200)}
  x.strokeStyle='#dedcd4';x.lineCap='round';x.lineWidth=11;x.beginPath();x.moveTo(256,256);x.lineTo(256+Math.cos(-2.6)*105,256+Math.sin(-2.6)*105);x.stroke();
  x.lineWidth=7;x.beginPath();x.moveTo(256,256);x.lineTo(256+Math.cos(.55)*160,256+Math.sin(.55)*160);x.stroke();
  x.fillStyle='#dedcd4';x.beginPath();x.arc(256,256,10,0,6.283);x.fill();
  return fin(c,false)}
function texText(txt,w,h,font,fg,bg){
  var c=mk(w,h),x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}
  x.fillStyle=fg;x.font=font;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,w/2,h/2+2);return fin(c,false)}
function texSky(){
  var c=mk(4,512),x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,512);
  g.addColorStop(0,'#2a64c4');g.addColorStop(.45,'#5b97dd');g.addColorStop(.8,'#a9cdf0');g.addColorStop(1,'#d9e7f3');x.fillStyle=g;x.fillRect(0,0,4,512);
  var t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function texMountain(seed,base,hi,lo,snow){
  var W=2048,H=384,c=mk(W,H),x=c.getContext('2d'),r=rngf(seed),ph=[r()*6,r()*6,r()*6,r()*6];
  var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,hi);g.addColorStop(.5,base);g.addColorStop(1,lo);x.fillStyle=g;
  x.beginPath();x.moveTo(0,H);
  for(var i=0;i<=W;i+=8){var u=i/W*6.2832,h=.34+.22*Math.sin(u*2+ph[0])+.13*Math.sin(u*5+ph[1])+.07*Math.sin(u*11+ph[2])+.035*Math.sin(u*23+ph[3]);x.lineTo(i,H*(1-h*1.2))}
  x.lineTo(W,H);x.closePath();x.fill();
  if(snow){x.globalCompositeOperation='source-atop';var s=x.createLinearGradient(0,0,0,H);s.addColorStop(0,'rgba(255,255,255,.55)');s.addColorStop(.3,'rgba(255,255,255,0)');x.fillStyle=s;x.fillRect(0,0,W,H)}
  var t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=T.RepeatWrapping;return t}

/* ---------------- photo textures ---------------- */
var loader=new T.TextureLoader();
function ld(url,o){o=o||{};return new Promise(function(res,rej){loader.load(url,function(t){t.colorSpace=T.SRGBColorSpace;t.anisotropy=maxAniso;if(o.mirror){t.wrapS=t.wrapT=T.MirroredRepeatWrapping}res(t)},undefined,function(){rej(new Error('texture '+url))})})}
var names=['wood-a','wood-b','carpet-rack','carpet-grid','mohawk','antrim-sign','quote','rug-front','stone','hakes-logo-white','v-anderson','v-shaw','v-natural'];
var P={};
Promise.all(names.map(function(n){return ld('img/'+n+(n==='hakes-logo-white'?'.png':'.jpg'),{mirror:n==='stone'}).then(function(t){P[n]=t})})).then(function(){build();start()}).catch(function(e){console.warn('3D assets failed',e.message);fallback()});

/* ---------------- geometry batching ---------------- */
function Batch(mat){this.pos=[];this.nor=[];this.uv=[];this.col=[];this.idx=[];this.n=0;this.mat=mat;this.M=new T.Matrix4()}
var _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_v=new T.Vector3(),_s=new T.Vector3(1,1,1);
Batch.prototype.base=function(x,y,z,ry){this.M.compose(_v.set(x,y,z),_q.setFromEuler(_e.set(0,ry||0,0)),_s);return this};
Batch.prototype.box=function(w,h,d,p,r,o){
  o=o||{};var g=new T.BoxGeometry(w,h,d);
  _m.compose(_v.set(p[0],p[1],p[2]),_q.setFromEuler(_e.set(r?r[0]:0,r?r[1]:0,r?r[2]:0)),_s);_m.premultiply(this.M);g.applyMatrix4(_m);
  var P0=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,I=g.index,uv=o.uv,col=o.color||[1,1,1],front=o.front===undefined?4:o.front,dim=o.dim===undefined?.42:o.dim;
  for(var i=0;i<P0.count;i++){
    this.pos.push(P0.getX(i),P0.getY(i),P0.getZ(i));this.nor.push(N.getX(i),N.getY(i),N.getZ(i));
    var u=U.getX(i),v=U.getY(i);if(uv){u=uv[0]+u*uv[2];v=uv[1]+v*uv[3]}this.uv.push(u,v);
    var f=Math.floor(i/4),k=f===front?1:dim;this.col.push(col[0]*k,col[1]*k,col[2]*k)}
  for(var j=0;j<I.count;j++)this.idx.push(I.getX(j)+this.n);this.n+=P0.count;g.dispose();return this};
Batch.prototype.mesh=function(){
  var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.nor,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(this.col,3));g.setIndex(this.idx);
  var m=new T.Mesh(g,this.mat);scene.add(m);return m};

/* ---------------- scene ---------------- */
var X0=-4.6,X1=4.6,ZB=-10.5;
var hAt=function(x){return 3.3+(x-X0)*(1.2/9.2)};
var swapMat,fanGroup,doorL,doorR,sunLight,pend=[],glowSprites=[],sx={};
function std(o){return new T.MeshStandardMaterial(o)}
function add(m,x,y,z){m.position.set(x,y,z);scene.add(m);return m}
function boxMesh(w,h,d,mat,x,y,z,parent){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);(parent||scene).add(m);return m}
function blob(x,z,w,d,rot){var m=new T.Mesh(new T.PlaneGeometry(w,d),sx.blobMat);m.rotation.x=-Math.PI/2;m.rotation.z=rot||0;m.position.set(x,.008,z);scene.add(m);return m}
function glow(x,y,z,s,op){var sp=new T.Sprite(new T.SpriteMaterial({map:sx.glowTex,color:0xffffff,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:op===undefined?.8:op,fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);scene.add(sp);glowSprites.push(sp);return sp}
function shape(pts,mat,z){var s=new T.Shape();pts.forEach(function(p,i){i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1])});var m=new T.Mesh(new T.ShapeGeometry(s),mat);m.position.z=z;scene.add(m);return m}
function plane(w,h,mat,x,y,z,ry,rx){var m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry||0;if(rx)m.rotation.x=rx;scene.add(m);return m}
function photo(t,k){return new T.MeshBasicMaterial({map:t,color:k||0xe2e2e2})}
function plaqueTex(txt,w,h,bg,fg,font,sub,subFont){
  var c=mk(w,h),x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';
  x.font=font;x.fillText(txt,w/2,sub?h*.42:h/2+2);if(sub){x.font=subFont;x.fillText(sub,w/2,h*.78)}
  return fin(c,false)}
function texRoll(hue,sat,lig){
  var S=128,c=mk(S),x=c.getContext('2d'),r=rngf(hue);x.fillStyle='hsl('+hue+' '+sat+'% '+lig+'%)';x.fillRect(0,0,S,S);
  for(var k=60;k>2;k-=3){x.strokeStyle='hsla('+hue+','+sat+'%,'+(lig+(r()-.5)*16)+'%,.9)';x.lineWidth=2.4;x.beginPath();x.arc(64,64,k,0,6.283);x.stroke()}
  x.fillStyle='#2a1d14';x.beginPath();x.arc(64,64,7,0,6.283);x.fill();return fin(c,false)}

function build(){
  sx.blobMat=new T.MeshBasicMaterial({map:texBlob(),transparent:true,depthWrite:false,fog:false});
  sx.glowTex=texGlow();
  var wallMat=std({color:0xeee8dc,roughness:.95,side:T.DoubleSide});
  var ceilMat=std({color:0x100f0f,roughness:.92,side:T.DoubleSide});
  var beamMat=std({color:0x0b0b0b,roughness:.55,metalness:.15});
  var black=std({color:0x141312,roughness:.5,metalness:.25,side:T.DoubleSide});
  var darkMetal=std({color:0x1e1f22,roughness:.55,metalness:.3});
  var brass=std({color:0xb08a46,roughness:.34,metalness:.9,side:T.DoubleSide});
  var mah=std({color:0x3a130e,roughness:.5,metalness:.05});
  var glassMat=new T.MeshStandardMaterial({color:0xaec4da,transparent:true,opacity:.14,roughness:.04,metalness:0,depthWrite:false,side:T.DoubleSide});

  /* sky + mountains */
  var sky=new T.Mesh(new T.SphereGeometry(300,24,16),new T.MeshBasicMaterial({map:texSky(),side:T.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-10;scene.add(sky);
  [[-150,70,'#556b8c','#8aa0bd','#9db2c8',3,1],[-190,60,'#7b8fab','#b3c3d6','#c9d6e3',9,0]].forEach(function(d){
    var m=new T.Mesh(new T.PlaneGeometry(520,d[1]*1.6),new T.MeshBasicMaterial({map:texMountain(d[5]+4,d[2],d[3],d[4],d[6]),transparent:true,fog:false,depthWrite:false}));
    m.position.set(0,d[1]*.62,d[0]);m.renderOrder=-9;scene.add(m)});

  /* floor: dark carpet tile on the left and at the entrance, medium wood plank near the center and right */
  var tex={carpet:texCarpet(),wood:texPlanks({seed:3,cols:12,h:22,hv:4,s:30,l:34,lv:5,seg:[.45,.95],grain:20,dark:'10,4,0',gap:'#1a0e08',gw:2.5}),rug:texRug()};
  swapMat=std({color:0xffffff,roughness:.75});
  swapMat.onBeforeCompile=function(sh){
    sh.uniforms.t0={value:tex.carpet};sh.uniforms.t1={value:tex.wood};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform sampler2D t0,t1;')
    .replace('#include <map_fragment>','float cm=max(1.-smoothstep(.85,.93,vWP.x),smoothstep(-2.5,-2.42,vWP.z));\n'+
      'diffuseColor.rgb*=mix(texture2D(t1,vWP.xz/2.+vec2(.13,.31)).rgb,texture2D(t0,vWP.xz/2.).rgb,cm);')
    .replace('#include <roughnessmap_fragment>','float roughnessFactor=mix(.46,.95,max(1.-smoothstep(.85,.93,vWP.x),smoothstep(-2.5,-2.42,vWP.z)));');
  };
  var floor=new T.Mesh(new T.PlaneGeometry(9.2,-ZB),swapMat);floor.rotation.x=-Math.PI/2;floor.position.set(0,0,ZB/2);scene.add(floor);

  /* walls + ceiling (white walls, black open-truss ceiling) */
  function quad(a,b,c,d,mat){var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([].concat(a,b,c,d),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();var m=new T.Mesh(g,mat);scene.add(m);return m}
  quad([X0,3.3,0],[X0,3.3,ZB],[X1,4.5,ZB],[X1,4.5,0],ceilMat);
  var wl=new T.Mesh(new T.PlaneGeometry(-ZB,3.3),wallMat);wl.rotation.y=Math.PI/2;wl.position.set(X0,1.65,ZB/2);scene.add(wl);
  var wr=new T.Mesh(new T.PlaneGeometry(-ZB,4.5),wallMat);wr.rotation.y=-Math.PI/2;wr.position.set(X1,2.25,ZB/2);scene.add(wr);
  // back wall with a doorway into the storage room (x -1.9 to -0.4)
  var DX0=-1.9,DX1=-.4,DH=2.2;
  shape([[X0,0],[DX0,0],[DX0,hAt(DX0)],[X0,3.3]],wallMat,ZB);
  shape([[DX0,DH],[DX1,DH],[DX1,hAt(DX1)],[DX0,hAt(DX0)]],wallMat,ZB);
  shape([[DX1,0],[X1,0],[X1,4.5],[DX1,hAt(DX1)]],wallMat,ZB);
  // front wall pieces (interior side) around the glass opening
  shape([[X0,0],[-2.3,0],[-2.3,hAt(-2.3)],[X0,3.3]],wallMat,-.02);
  shape([[2.3,0],[X1,0],[X1,4.5],[2.3,hAt(2.3)]],wallMat,-.02);
  shape([[-2.3,3.0],[2.3,3.0],[2.3,hAt(2.3)],[-2.3,hAt(-2.3)]],wallMat,-.02);
  // rafters running across the width, following the slope; purlins; diagonal braces
  var slope=Math.atan2(1.2,9.2),blen=Math.hypot(9.2,1.2);
  for(var bz=-0.9;bz>ZB;bz-=1.5){var b=boxMesh(blen,.3,.14,beamMat,0,(3.3+4.5)/2-.2,bz);b.rotation.z=slope}
  [-3.2,0,3.2].forEach(function(px){var y=hAt(px)-.14;boxMesh(.12,.1,-ZB,beamMat,px,y,ZB/2)});
  for(var bz2=-0.9;bz2>ZB;bz2-=1.5){[-1,1].forEach(function(s){var br=boxMesh(2.6,.09,.1,beamMat,s*1.6,hAt(s*1.6)-.55,bz2);br.rotation.z=slope+s*-.42})}
  // recessed cans
  var canMat=new T.MeshBasicMaterial({color:0xffe4b8});
  for(var cz=-1.6;cz>ZB+.5;cz-=2.1){[-2.4,2.2].forEach(function(cx,i){var m=new T.Mesh(new T.CircleGeometry(.1,16),canMat);m.rotation.x=Math.PI/2;m.position.set(cx+(i?.2:-.2)*Math.sin(cz),hAt(cx)-.01,cz);scene.add(m);glow(m.position.x,m.position.y-.1,m.position.z,.5,.22)})}

  /* storefront glass + door leaves */
  var gz=.1;
  var glassTop=new T.Mesh(new T.PlaneGeometry(4.6,.7),glassMat);glassTop.position.set(0,2.65,gz);glassTop.renderOrder=10;scene.add(glassTop);
  [-1.61,1.61].forEach(function(gx){var m=new T.Mesh(new T.PlaneGeometry(1.38,2.3),glassMat);m.position.set(gx,1.15,gz);m.renderOrder=10;scene.add(m)});
  [-2.3,-.92,.92,2.3].forEach(function(mx){boxMesh(.1,3.04,.12,black,mx,1.52,gz)});
  boxMesh(4.7,.1,.12,black,0,2.3,gz);boxMesh(4.7,.12,.12,black,0,3.0,gz);boxMesh(4.7,.14,.12,black,0,.07,gz);
  var sign105=new T.Mesh(new T.PlaneGeometry(.5,.2),new T.MeshBasicMaterial({map:texText('105',128,48,'600 40px Arial','#f1ece2'),transparent:true,depthWrite:false}));sign105.position.set(0,2.58,gz+.07);scene.add(sign105);
  function leaf(s){
    var g=new T.Group(),w=.9;
    boxMesh(.09,2.3,.07,black,s*.045,1.15,0,g);boxMesh(.09,2.3,.07,black,s*(w-.045),1.15,0,g);boxMesh(w,.11,.07,black,s*w/2,2.24,0,g);boxMesh(w,.28,.07,black,s*w/2,.14,0,g);
    var gl=new T.Mesh(new T.PlaneGeometry(w-.18,1.9),glassMat);gl.position.set(s*w/2,1.22,0);gl.renderOrder=10;g.add(gl);
    var h=new T.Mesh(new T.CylinderGeometry(.018,.018,.7,10),brass);h.position.set(s*(w-.14),1.05,.07);g.add(h);
    g.position.set(s*.92,0,gz);scene.add(g);return g}
  doorL=leaf(1);doorR=leaf(-1);doorL.position.x=-.92;doorR.position.x=.92;
  var ex=new T.Mesh(new T.PlaneGeometry(.34,.14),new T.MeshBasicMaterial({map:texText('EXIT',128,52,'700 38px Arial','#ffffff','#17893b')}));ex.position.set(0,3.2,-.05);scene.add(ex);
  // yellow tactile pad on the sidewalk, as at the real door
  var tc=mk(128,96),tx=tc.getContext('2d');tx.fillStyle='#d2a21c';tx.fillRect(0,0,128,96);tx.fillStyle='#b8860f';for(var tj=6;tj<96;tj+=12)for(var ti=6;ti<128;ti+=12){tx.beginPath();tx.arc(ti,tj,3,0,6.283);tx.fill()}
  var pad=new T.Mesh(new T.PlaneGeometry(1.5,1.0),new T.MeshStandardMaterial({map:fin(tc,false),roughness:.8}));pad.rotation.x=-Math.PI/2;pad.position.set(0,.012,1.55);scene.add(pad);

  /* exterior facade (from Rod's storefront photo) */
  var stucco=std({color:0xd8c8a2,roughness:1}),stone=P['stone'].clone();stone.needsUpdate=true;stone.wrapS=stone.wrapT=T.MirroredRepeatWrapping;stone.repeat.set(1,3.4);
  var stoneMat=std({map:stone,roughness:.95}),red=std({color:0x8a4543,roughness:.9}),batt=std({color:0x7a3a3a,roughness:.9});
  var dark=std({color:0x1b1b1d,roughness:.55,metalness:.3});
  [-1,1].forEach(function(s){
    boxMesh(1.35,3.0,.46,stoneMat,s*3.0,2.8,.23);
    boxMesh(1.6,1.3,.6,stucco,s*3.0,.65,.3);
    boxMesh(1.1,3.2,.4,stoneMat,s*6.4,1.6+.0,.2);
    boxMesh(1.3,.5,.55,stucco,s*6.4,.25,.27);
    boxMesh(8.0,4.5,.45,stucco,s*8.6,2.25,.225);
    boxMesh(9.4,4.5,-ZB,stucco,s*9.4,2.25,ZB/2-.05);
    boxMesh(2.0,4.5,.45,stucco,s*5.0,2.25,.225);
  });
  boxMesh(4.9,.62,.4,stucco,0,3.3,.2);
  boxMesh(5.0,3.2,.36,red,0,5.15,.18);
  for(var bi=-5;bi<=5;bi++)boxMesh(.12,3.2,.05,batt,bi*.46,5.15,.38);
  var plate=new T.Mesh(new T.BoxGeometry(2.7,1.5,.08),std({color:0x0c0c0d,roughness:.6}));plate.position.set(0,4.95,.44);scene.add(plate);
  var lc=mk(1024,570),lx=lc.getContext('2d');lx.fillStyle='#0e0e10';lx.fillRect(0,0,1024,570);
  var il=P['hakes-logo-white'].image,ih=500,iw=ih*il.width/il.height;lx.drawImage(il,512-iw/2,35,iw,ih);
  var lt=new T.CanvasTexture(lc);lt.colorSpace=T.SRGBColorSpace;lt.anisotropy=maxAniso;
  var logoFace=new T.Mesh(new T.PlaneGeometry(2.62,1.45),new T.MeshStandardMaterial({map:lt,emissiveMap:lt,emissive:0xffffff,emissiveIntensity:.35,roughness:.5}));logoFace.position.set(0,4.95,.49);scene.add(logoFace);
  var aw=boxMesh(6.8,.16,1.9,dark,0,3.62,.95);aw.rotation.x=.04;
  for(var ai=-3;ai<=3;ai++)boxMesh(.14,.3,1.9,dark,ai*1.0,3.45,.95);
  [-1,1].forEach(function(s){var br=boxMesh(.12,.12,1.9,dark,s*3.35,3.0,.7);br.rotation.x=.45});
  boxMesh(7.4,.34,1.8,stucco,0,6.95,.7);boxMesh(7.4,.08,1.82,dark,0,6.76,.7);
  [-1.1,0,1.1].forEach(function(lx0){
    var arm=new T.Mesh(new T.CylinderGeometry(.025,.025,.36,8),dark);arm.rotation.x=Math.PI/2;arm.position.set(lx0,6.25,.5);scene.add(arm);
    var sh=new T.Mesh(new T.ConeGeometry(.2,.18,18,1,true),std({color:0x232325,roughness:.5,metalness:.4,side:T.DoubleSide}));sh.position.set(lx0,6.15,.7);scene.add(sh);
    glow(lx0,6.0,.7,.9,.55)});
  var signLight=new T.PointLight(0xffd2a0,16,12,2);signLight.position.set(0,5.7,2.0);scene.add(signLight);sx.signLight=signLight;
  var cT=texConcrete();cT.repeat.set(30,2);var sw=new T.Mesh(new T.PlaneGeometry(60,2.6),std({map:cT,roughness:.95}));sw.rotation.x=-Math.PI/2;sw.position.set(0,0,1.3);scene.add(sw);
  boxMesh(60,.15,.25,std({color:0x9a968c,roughness:1}),0,.07,2.72);
  var aT=texAsphalt();aT.repeat.set(30,40);var as=new T.Mesh(new T.PlaneGeometry(200,200),std({map:aT,roughness:.97}));as.rotation.x=-Math.PI/2;as.position.set(0,-.005,102.8);scene.add(as);
  var paint=std({color:0xe2e0d6,roughness:.9});
  for(var li=-5;li<=5;li++){var pl=new T.Mesh(new T.PlaneGeometry(.1,5.2),paint);pl.rotation.x=-Math.PI/2;pl.position.set(li*2.7+.6,.002,6.0);scene.add(pl)}
  sunLight=new T.DirectionalLight(0xfff0d6,2.7);sunLight.position.set(9,11,16);scene.add(sunLight);

  /* ---------- interior ---------- */
  var fillA=new T.PointLight(0xfff0dc,0,18,1.4);fillA.position.set(0,3.4,-3.5);scene.add(fillA);sx.fill=fillA;var fillB=new T.PointLight(0xfff0dc,10,14,1.6);fillB.position.set(.5,3.4,-8);scene.add(fillB);
  var hemi=new T.HemisphereLight(0xfaf6ee,0xb8ab98,1.5);scene.add(hemi);sx.hemi=hemi;
  var lampMat=std({color:0x16110e,roughness:.45,metalness:.5,side:T.DoubleSide});
  // ceiling fan, brown blades
  fanGroup=new T.Group();var fanY=hAt(-.4)-.35;
  var rod=new T.Mesh(new T.CylinderGeometry(.02,.02,.3,6),black);rod.position.set(-.4,fanY+.2,-7.2);scene.add(rod);
  fanGroup.position.set(-.4,fanY,-7.2);
  fanGroup.add(new T.Mesh(new T.CylinderGeometry(.14,.14,.12,16),std({color:0x3a2416,roughness:.5})));
  var bladeMat=std({color:0x5a3a22,roughness:.55});
  for(var fb=0;fb<5;fb++){var arm=new T.Group();var bl=new T.Mesh(new T.BoxGeometry(.75,.012,.15),bladeMat);bl.position.set(.58,-.05,0);arm.add(bl);arm.rotation.y=fb*Math.PI*2/5;fanGroup.add(arm)}
  scene.add(fanGroup);
  // two brass drum pendants over the desk
  [[1.1,2.45,-9.2],[2.5,2.45,-9.2]].forEach(function(p){
    var g=new T.Group(),sh=new T.Mesh(new T.CylinderGeometry(.34,.34,.36,28,1,true),brass);g.add(sh);
    g.add(new T.Mesh(new T.CylinderGeometry(.325,.325,.35,28,1,true),new T.MeshBasicMaterial({color:0xffa850,side:T.BackSide})));
    var disc=new T.Mesh(new T.CircleGeometry(.33,24),new T.MeshBasicMaterial({color:0xffc27a}));disc.rotation.x=Math.PI/2;disc.position.y=-.12;g.add(disc);
    var ch=hAt(p[0])-p[1]-.18;var chain=new T.Mesh(new T.CylinderGeometry(.008,.008,ch,5),black);chain.position.y=.18+ch/2;g.add(chain);
    g.position.set(p[0],p[1],p[2]);scene.add(g);
    glow(p[0],p[1]-.22,p[2],1.0,.5)});
  var pl1=new T.PointLight(0xffc88a,10,8,2);pl1.position.set(1.8,2.1,-9.0);scene.add(pl1);pend.push(pl1);
  // three small black pendants over the center floor
  [[1.6,3.0,-6.6],[2.5,3.05,-6.6],[3.3,3.1,-6.6]].forEach(function(p){
    var c=new T.Mesh(new T.ConeGeometry(.09,.12,14,1,true),lampMat);c.position.set(p[0],p[1],p[2]);scene.add(c);
    var wr2=new T.Mesh(new T.CylinderGeometry(.004,.004,hAt(p[0])-p[1],4),black);wr2.position.set(p[0],p[1]+(hAt(p[0])-p[1])/2,p[2]);scene.add(wr2);
    glow(p[0],p[1]-.08,p[2],.28,.5)});

  /* ----- batches for sample boards, carpet strips and rugs ----- */
  var woodMatA=std({map:P['wood-a'],vertexColors:true,roughness:.62}),woodMatB=std({map:P['wood-b'],vertexColors:true,roughness:.62});
  var BWA=new Batch(woodMatA),BWB=new Batch(woodMatB),BD=new Batch(std({color:0xffffff,vertexColors:true,roughness:.5,metalness:.2}));
  var tints=[[1.3,1.26,1.2],[1.2,1.08,.95],[1.1,1.1,1.1],[1.4,1.22,1.0],[1,.9,.78],[1.25,1.2,1.15]];
  var wr3=rngf(31);
  function pickT(){return tints[Math.floor(wr3()*tints.length)]}
  function boardRack(cx,cz,ry,len,fan){
    BWA.base(cx,0,cz,ry);BWB.base(cx,0,cz,ry);BD.base(cx,0,cz,ry);
    BD.box(len,.1,.95,[0,.05,.05],null,{color:[.07,.065,.06]});
    var rows=[{h:1.4,z:-.3,a:-.17},{h:1.0,z:.02,a:-.28},{h:.62,z:.3,a:-.48}];
    rows.forEach(function(row){
      var nb=Math.floor(len/.5);
      for(var i=0;i<nb;i++){
        var B=wr3()<.5?BWA:BWB,x=-len/2+.25+i*(len/nb),a=row.a+(fan?(wr3()-.5)*.08:0);
        var u0=wr3()*.35,v0=wr3()*.18,du=.42+wr3()*.12,dv=.6+wr3()*.2;
        B.box(.45,row.h,.022,[x+(fan?(wr3()-.5)*.1:0),.1+row.h/2*Math.cos(a)-.02,row.z-row.h/2*Math.sin(-a)*-1],[a,fan?(wr3()-.5)*.35:0,0],{color:pickT(),uv:[u0,v0,du,dv],dim:.35});
      }
      BD.box(len,.04,.05,[0,.1,row.z+.1],null,{color:[.05,.05,.05]});
    });
    [-1,1].forEach(function(s){BD.box(.05,.9,.9,[s*len/2,.5,0],null,{color:[.06,.05,.05]})});
    blob(cx,cz,len+.8,1.9,ry===0?0:ry+Math.PI/2);
  }
  // center floor: staggered rows of low racks with big flat wood-look boards
  boardRack(2.0,-4.2,0,1.9,false);
  boardRack(2.8,-6.0,0,1.9,false);
  boardRack(1.8,-7.6,0,1.8,false);
  boardRack(2.8,-9.0,0,1.9,false);
  // sample boards leaning on the front glass (right of the door)
  BWA.base(3.35,0,-.55,.25);
  for(var lb=0;lb<5;lb++)BWA.box(.5,1.05,.03,[lb*.075-.15,.54,lb*.03],[-.16,0,0],{color:pickT(),uv:[wr3()*.35,wr3()*.18,.45,.65],dim:.35});

  var carpetTex=P['carpet-rack'],gridTex=P['carpet-grid'];
  var rackMat=photo(carpetTex,0xd8d8d8),gridMat=photo(gridTex,0xd8d8d8);

  /* ----- LEFT WALL (x = X0, faces +x), from the entrance toward the back ----- */
  // 1. Anderson Tuftex tall black rack (photo of the real rack, sign included)
  var aZ=-1.85;
  boxMesh(.5,2.25,1.8,darkMetal,X0+.25,1.125,aZ);
  plane(1.78,2.25,photo(P['v-anderson'],0xdcdcdc),X0+.52,1.13,aZ,Math.PI/2);
  // 2. oak stair-step board display, with a TAS Flooring sign on the wall
  var oakA=std({color:0xb98a52,roughness:.5}),oakB=std({color:0x8c5e34,roughness:.5});
  for(var si=0;si<9;si++)boxMesh(.36,.05,.5,si%2?oakB:oakA,X0+.26+(8-si)*.014,.5+si*.13,-3.05);
  boxMesh(.1,1.7,.52,darkMetal,X0+.06,.9,-3.05);
  plane(.5,.8,new T.MeshBasicMaterial({map:plaqueTex('TAS',128,200,'#8fa9bb','#14222e','800 50px Arial','FLOORING','700 18px Arial')}),X0+.03,2.15,-3.05,Math.PI/2);
  // 3. Dixie Home mahogany unit with a brass plaque
  var dZ=-4.5;
  boxMesh(.6,1.5,2.0,mah,X0+.3,.75,dZ);boxMesh(.66,.06,2.08,mah,X0+.33,1.53,dZ);
  boxMesh(.05,.5,2.0,mah,X0+.04,1.8,dZ);
  plane(.8,.25,new T.MeshBasicMaterial({map:plaqueTex('DIXIE HOME',256,80,'#c9a05a','#2b1a0c','700 38px Georgia,serif')}),X0+.08,1.78,dZ,Math.PI/2);
  var dPanel=photo(carpetTex,0xe0e0e0);
  plane(.62,.95,dPanel,X0+.62,1.0,dZ+.62,Math.PI/2);
  var dPanel2=photo(gridTex,0xd0d0d0);
  plane(.62,.52,dPanel2,X0+.63,1.05,dZ-.05,Math.PI/2);
  plane(.62,.5,dPanel2,X0+.63,.6,dZ-.62,Math.PI/2);
  // 4. Mohawk SmartStrand display beside a blue digital screen
  var mZ=-6.15;
  boxMesh(.5,.05,1.5,std({color:0xf4f1ea,roughness:.5}),X0+.25,1.12,mZ);
  plane(1.25,1.25*(249/640),photo(P['mohawk'],0xf2f2f2),X0+.04,1.55,mZ,Math.PI/2);
  boxMesh(.42,1.05,.5,std({color:0xcfcac0,roughness:.6}),X0+.25,.58,mZ+.45);
  plane(.5,.95,rackMat,X0+.52,.62,mZ+.45,Math.PI/2);
  plane(.5,.8,gridMat,X0+.52,.55,mZ-.35,Math.PI/2);
  boxMesh(.1,.5,.9,darkMetal,X0+.06,.55,mZ-.35);
  var scr=mk(64,96),sxc=scr.getContext('2d'),sg=sxc.createLinearGradient(0,0,64,96);sg.addColorStop(0,'#3c64d8');sg.addColorStop(1,'#2641a8');sxc.fillStyle=sg;sxc.fillRect(0,0,64,96);sxc.fillStyle='rgba(255,255,255,.55)';sxc.fillRect(8,10,20,26);sxc.fillStyle='rgba(255,170,200,.7)';sxc.fillRect(32,14,20,22);
  plane(.42,.62,new T.MeshBasicMaterial({map:fin(scr,false),color:0xe8e8e8}),X0+.05,1.95,mZ-1.15,Math.PI/2);
  boxMesh(.04,.66,.46,black,X0+.03,1.95,mZ-1.15);
  // small white flip stand near the back-left corner
  boxMesh(.4,1.35,.9,std({color:0xe8e4da,roughness:.6}),X0+.28,.68,-7.75);
  plane(.45,.85,rackMat,X0+.5,.8,-7.75,Math.PI/2);
  // gooseneck barn lamps, four on the left wall
  [-1.85,-3.5,-4.8,-6.15].forEach(function(lz,li2){
    var pts=[[0,0],[.14,0],[.3,.1],[.44,.3],[.58,.42],[.74,.34],[.8,.14]].map(function(p){return new T.Vector3(X0+.04+p[0],2.6+p[1],lz)});
    scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.022,8),black));
    var cone=new T.Mesh(new T.ConeGeometry(.17,.2,20,1,true),lampMat);cone.position.set(X0+.84,2.6+.14-.1,lz);cone.rotation.x=Math.PI;scene.add(cone);
    var plate=new T.Mesh(new T.CircleGeometry(.05,10),black);plate.rotation.y=Math.PI/2;plate.position.set(X0+.045,2.6,lz);scene.add(plate);
    glow(X0+.84,2.42,lz,.5,.6);
    if(li2%2===0){var sp=new T.SpotLight(0xffd8a8,22,7,.9,.7,2);sp.position.set(X0+.84,2.5,lz);sp.target.position.set(X0+.2,1.0,lz-.3);scene.add(sp,sp.target)}
  });
  blob(X0+.6,-4.2,1.8,7.4,0);

  /* ----- BACK WALL ----- */
  // closed black door, small plaque above it
  boxMesh(1.05,2.12,.08,black,-3.0,1.06,ZB+.05);
  boxMesh(.9,2.02,.04,std({color:0x1c1c1f,roughness:.45,metalness:.2}),-3.0,1.02,ZB+.1);
  boxMesh(.03,.2,.05,brass,-2.62,1.0,ZB+.14);
  boxMesh(.36,.26,.03,std({color:0x6b4128,roughness:.7}),-3.0,2.55,ZB+.03);
  // storage room behind the open doorway, carpet rolls stacked horizontally
  var SD=2.6,sBack=ZB-SD,dark2=std({color:0x3a322b,roughness:.95,side:T.DoubleSide});
  plane(DX1-DX0,DH,dark2,(DX0+DX1)/2,DH/2,sBack,0);
  plane(SD,DH,dark2,DX0,DH/2,ZB-SD/2,Math.PI/2);plane(SD,DH,dark2,DX1,DH/2,ZB-SD/2,Math.PI/2);
  var sf=new T.Mesh(new T.PlaneGeometry(DX1-DX0,SD),std({color:0x4a443d,roughness:.9}));sf.rotation.x=-Math.PI/2;sf.position.set((DX0+DX1)/2,.01,ZB-SD/2);scene.add(sf);
  var sc=new T.Mesh(new T.PlaneGeometry(DX1-DX0,SD),new T.MeshBasicMaterial({color:0x151313}));sc.rotation.x=Math.PI/2;sc.position.set((DX0+DX1)/2,DH,ZB-SD/2);scene.add(sc);
  var rollHues=[[34,22,62],[210,10,52],[28,34,46],[18,12,70],[200,18,40],[40,30,58]],ri2=0;
  for(var rj=0;rj<3;rj++)for(var rk=0;rk<3;rk++){
    var rh=rollHues[ri2++%rollHues.length],rc=texRoll(rh[0],rh[1],rh[2]);
    var rl=new T.Mesh(new T.CylinderGeometry(.24,.24,1.1,16),[std({color:new T.Color().setHSL(rh[0]/360,rh[1]/100,rh[2]/100*.8),roughness:.95}),std({map:rc,roughness:.95}),std({map:rc,roughness:.95})]);
    rl.rotation.x=Math.PI/2;rl.position.set(DX0+.32+rk*.5,.26+rj*.5,ZB-1.5);scene.add(rl)}
  // a couple of rolls leaning in the corner
  [[DX1-.2,.7],[DX1-.45,.45]].forEach(function(q,i){var r2=new T.Mesh(new T.CylinderGeometry(.14,.14,1.5,12),std({color:i?0xb9a88e:0x6e7680,roughness:.95}));r2.position.set(q[0],q[1],ZB-.6);r2.rotation.z=.06;scene.add(r2)});
  var stl=new T.PointLight(0xffd8a0,5,5,2);stl.position.set((DX0+DX1)/2,1.9,ZB-1.2);scene.add(stl);
  glow((DX0+DX1)/2,2.0,ZB-1.3,1.0,.3);
  // doorway frame
  boxMesh(.07,DH,.08,black,DX0,DH/2,ZB+.02);boxMesh(.07,DH,.08,black,DX1,DH/2,ZB+.02);boxMesh(DX1-DX0+.07,.07,.08,black,(DX0+DX1)/2,DH,ZB+.02);
  // desk (back right) with two brass pendants overhead
  var deskMat=std({color:0x1b1511,roughness:.55}),topMat=std({color:0x3a2a1e,roughness:.4});
  boxMesh(2.7,.9,.7,deskMat,1.75,.45,ZB+.5);boxMesh(2.8,.06,.84,topMat,1.75,.93,ZB+.5);
  boxMesh(.5,.3,.04,black,1.15,1.25,ZB+.5);boxMesh(.05,.18,.05,black,1.15,1.05,ZB+.5);
  boxMesh(.3,.12,.22,std({color:0xf3f0ea,roughness:.8}),2.3,1.02,ZB+.58);boxMesh(.22,.2,.18,std({color:0x2c4f9c,roughness:.7}),2.9,1.06,ZB+.55);
  // framed pictures on the back wall (blank frames, content not confirmed)
  boxMesh(.58,.78,.04,black,.35,1.95,ZB+.03);plane(.5,.7,new T.MeshStandardMaterial({color:0xa9b6bb,roughness:.7}),.35,1.95,ZB+.06,0);
  boxMesh(.22,.28,.03,black,3.6,1.85,ZB+.03);plane(.17,.23,new T.MeshStandardMaterial({color:0xc4c8c4,roughness:.7}),3.6,1.85,ZB+.05,0);

  /* ----- RIGHT WALL (x = X1, faces -x), back to front ----- */
  function skyTex(){var wc=mk(64,256),wx=wc.getContext('2d'),g=wx.createLinearGradient(0,0,0,256);g.addColorStop(0,'#bcd8f5');g.addColorStop(.45,'#c9dcc4');g.addColorStop(.7,'#c88f45');g.addColorStop(1,'#5a6b3c');wx.fillStyle=g;wx.fillRect(0,0,64,256);var wt=new T.CanvasTexture(wc);wt.colorSpace=T.SRGBColorSpace;return wt}
  var winTex=skyTex();
  function rightWindow(zc,w,y0,y1,cols,rows){
    var h=y1-y0,yc=(y0+y1)/2;
    plane(w,h,new T.MeshBasicMaterial({map:winTex,color:0xdcdcdc}),X1-.03,yc,zc,-Math.PI/2);
    var f=function(sz,sy,sw,x,y,z){boxMesh(sz,sy,sw,black,x,y,z)};
    f(.1,.07,w+.1,X1-.06,y1,zc);f(.1,.07,w+.1,X1-.06,y0,zc);f(.1,h,.07,X1-.06,yc,zc-w/2);f(.1,h,.07,X1-.06,yc,zc+w/2);
    for(var c=1;c<cols;c++)f(.08,h,.05,X1-.06,yc,zc-w/2+c*w/cols);
    for(var r=1;r<rows;r++)f(.08,.05,w,X1-.06,y0+r*h/rows,zc)}
  rightWindow(-9.0,2.5,.95,3.35,5,2);                // wide window bank at the back
  var exs=new T.Mesh(new T.PlaneGeometry(.3,.12),new T.MeshBasicMaterial({map:texText('EXIT',128,52,'700 38px Arial','#ffffff','#17893b')}));exs.position.set(X1-.04,3.7,-9.0);exs.rotation.y=-Math.PI/2;scene.add(exs);
  rightWindow(-4.6,1.1,.15,3.0,1,2);                  // tall narrow window behind the Naturally Aged racks
  rightWindow(-2.45,.85,1.0,3.05,1,2);                // window by the clock
  // Shaw rack under the framed quote
  var shZ=-6.4;
  boxMesh(.3,1.5,2.3,std({color:0xe8e4dc,roughness:.6}),X1-.2,.78,shZ);
  plane(2.3,1.55,photo(P['v-shaw'],0xe0e0e0),X1-.37,.83,shZ,-Math.PI/2);
  plane(2.3,.3,new T.MeshBasicMaterial({map:plaqueTex('Shaw',256,34,'#e9dfc9','#6a6a6a','italic 800 26px Arial'),color:0xf0f0f0}),X1-.05,1.8,shZ,-Math.PI/2);
  var qs=new T.Mesh(new T.PlaneGeometry(.82,.82*(766/452)),new T.MeshStandardMaterial({map:P['quote'],roughness:.8,emissive:0x1a1814,emissiveMap:P['quote'],emissiveIntensity:.3}));qs.position.set(X1-.06,2.85,shZ);qs.rotation.y=-Math.PI/2;scene.add(qs);
  boxMesh(.05,.82*(766/452)+.1,.92,black,X1-.03,2.85,shZ);
  // Naturally Aged Flooring: two tall narrow racks by the window
  var nZ=-4.6;
  boxMesh(.3,1.95,1.3,std({color:0xc8c2b6,roughness:.6}),X1-.95,1.0,nZ);
  plane(1.28,1.92,photo(P['v-natural'],0xe2e2e2),X1-1.12,1.0,nZ,-Math.PI/2);
  // clock
  var clock=new T.Mesh(new T.CircleGeometry(.72,48),new T.MeshStandardMaterial({map:texClock(),roughness:.7}));clock.rotation.y=-Math.PI/2;clock.position.set(X1-.04,3.55,-3.5);scene.add(clock);
  var ring=new T.Mesh(new T.TorusGeometry(.72,.035,8,48),black);ring.rotation.y=-Math.PI/2;ring.position.set(X1-.045,3.55,-3.5);scene.add(ring);
  // Antrim Hand-Loomed Carpets & Rugs rack, front right corner
  var anZ=-1.75,anG=new T.Group();anG.position.set(X1-.55,0,anZ);anG.rotation.y=-Math.PI/2;scene.add(anG);
  boxMesh(2.0,.9,.7,darkMetal,0,.45,-.2,anG);
  var rugPhoto=photo(P['rug-front'],0xd8d8d8);
  var up=new T.Mesh(new T.PlaneGeometry(1.9,.95),rugPhoto);up.position.set(0,1.5,.02);anG.add(up);
  boxMesh(2.0,.06,.12,darkMetal,0,.98,.0,anG);boxMesh(.05,1.2,.1,darkMetal,-.97,1.55,0,anG);boxMesh(.05,1.2,.1,darkMetal,.97,1.55,0,anG);
  
  var asign=new T.Mesh(new T.PlaneGeometry(1.9,1.9*(137/640)),photo(P['antrim-sign'],0xf0f0f0));asign.position.set(0,2.18,.02);anG.add(asign);
  boxMesh(1.98,1.9*(137/640)+.06,.07,darkMetal,0,2.18,-.04,anG);
  // 2x2 rug sample board leaning in front of the rack
  var sc2=mk(64,64),sc2x=sc2.getContext('2d');[['#9c7a5b',0,0],['#7a5a40',32,0],['#b49878',0,32],['#5d4332',32,32]].forEach(function(q){sc2x.fillStyle=q[0];sc2x.fillRect(q[1]+1,q[2]+1,30,30)});sc2x.strokeStyle='#d9d0c0';sc2x.lineWidth=2;sc2x.strokeRect(1,1,62,62);
  var sb=new T.Mesh(new T.PlaneGeometry(.62,.62),new T.MeshBasicMaterial({map:fin(sc2,false),color:0xdddddd}));sb.position.set(X1-1.35,.4,anZ+1.05);sb.rotation.set(-.3,-Math.PI/2+.2,0);scene.add(sb);
  // second narrow rack behind the Antrim one (label not confirmed)
  boxMesh(.5,1.7,.9,darkMetal,X1-.4,.85,-3.35);var rt2=P['rug-front'].clone();rt2.needsUpdate=true;rt2.repeat.set(.4,1);rt2.offset.set(.3,0);plane(.8,1.5,photo(rt2,0xd8d8d8),X1-.68,.95,-3.35,-Math.PI/2);
  blob(X1-.9,anZ,1.9,3.0,0);blob(X1-.7,nZ,1.6,1.8,0);blob(X1-.7,shZ,1.6,2.6,0);

  // light gray-beige area rug, right side of the floor
  var rug=new T.Mesh(new T.PlaneGeometry(2.8,1.7),std({map:tex.rug,roughness:1}));rug.rotation.x=-Math.PI/2;rug.rotation.z=.04;rug.position.set(2.9,.012,-5.3);scene.add(rug);
  sx.rug=rug;

  [BWA,BWB,BD].forEach(function(b){if(b.n)b.mesh()});
  // window light + front-door daylight spill
  var wp=new T.PointLight(0xc4dcff,6,9,2);wp.position.set(3.4,2.4,-8.6);scene.add(wp);
  var dl=new T.PointLight(0xcfe0ff,8,8,2);dl.position.set(0,2.4,.6);scene.add(dl);sx.dl=dl;
  sx.tex=tex;
}

/* ---------------- camera path ---------------- */
// [p, [pos], [look], stop]
var K=[
 [0.000,[0.7,1.7,12.4],[0,2.9,0]],
 [0.070,[0.4,1.65,9.0],[0,2.7,0]],
 [0.140,[0.0,1.62,4.6],[0,2.2,0]],
 [0.200,[0.0,1.6,.6],[0,1.5,-6]],
 [0.240,[0.0,1.6,-1.1],[0,1.45,-8],1],
 [0.275,[0.0,1.6,-1.1],[0,1.45,-8],1],
 [0.315,[-0.4,1.6,-1.3],[-4.6,1.5,-3.2]],
 [0.350,[-0.9,1.6,-1.7],[-4.6,1.55,-1.9],1],
 [0.400,[-1.1,1.6,-2.8],[-4.6,1.5,-3.7]],
 [0.445,[-1.2,1.6,-3.8],[-4.6,1.4,-4.7],1],
 [0.500,[-1.3,1.6,-5.0],[-4.6,1.4,-6.2],1],
 [0.550,[-1.0,1.6,-5.8],[-3.0,1.4,-10.5]],
 [0.600,[-0.6,1.6,-5.4],[-1.15,1.3,-11.5],1],
 [0.655,[0.0,1.6,-5.2],[1.6,1.1,-10.5],1],
 [0.710,[0.0,1.6,-4.4],[2.1,.9,-7.4],1],
 [0.770,[0.2,1.6,-4.0],[4.6,1.4,-6.3],1],
 [0.820,[0.5,1.6,-3.4],[4.6,1.3,-4.7],1],
 [0.880,[0.7,1.6,-2.3],[4.6,1.2,-1.9],1],
 [0.940,[0.8,1.6,-1.6],[4.4,1.2,-1.8]],
 [1.000,[0.8,1.6,-1.6],[4.4,1.25,-1.8],1]
];
function hermite(a,b,ma,mb,h,t){var t2=t*t,t3=t2*t;return(2*t3-3*t2+1)*a+(t3-2*t2+t)*h*ma+(-2*t3+3*t2)*b+(t3-t2)*h*mb}
function tangent(i,k,axis){
  var n=K.length;if(K[i][3]===1)return 0;
  var a=K[Math.max(0,i-1)],b=K[Math.min(n-1,i+1)],dt=b[0]-a[0];if(dt<=0)return 0;
  return (b[k][axis]-a[k][axis])/dt}
var tmpP=new T.Vector3(),tmpL=new T.Vector3();
function path(p,out,k){
  var n=K.length,i=0;while(i<n-2&&p>K[i+1][0])i++;
  var a=K[i],b=K[i+1],h=b[0]-a[0],t=clamp((p-a[0])/h);
  for(var ax=0;ax<3;ax++){out.setComponent(ax,hermite(a[k][ax],b[k][ax],tangent(i,k,ax),tangent(i+1,k,ax),h,t))}
  return out}

/* ---------------- labels ---------------- */
var L=[
 {el:'lab-in',w:[.14,.18,.215,.245]},
 {el:'lab-anderson',w:[.30,.325,.375,.395],a:[-4.1,1.6,-1.85]},
 {el:'lab-dixie',w:[.405,.425,.465,.485],a:[-4.0,1.2,-4.5]},
 {el:'lab-mohawk',w:[.49,.505,.535,.55],a:[-4.4,1.6,-6.15]},
 {el:'lab-back',w:[.565,.585,.625,.645],a:[-1.15,1.2,-10.5]},
 {el:'lab-desk',w:[.65,.665,.69,.705],a:[1.75,1.0,-9.95]},
 {el:'lab-boards',w:[.71,.725,.75,.765]},
 {el:'lab-right',w:[.77,.79,.86,.875],a:[4.2,1.1,-6.3]},
 {el:'lab-antrim',w:[.88,.9,.93,.945],a:[3.9,1.5,-1.75]},
 {el:'cta',w:[.95,.97,1.1,1.2]}
];
var hero=$('heroCopy'),h1=$('h1'),shade=$('shade'),leader=$('leader'),ll=$('ll'),lo=$('lo'),li=$('li');
L.forEach(function(o){o.n=$(o.el);o.h2=o.n.querySelector('h2')});

/* grain */
(function(){var c=document.createElement('canvas');c.width=c.height=160;var x=c.getContext('2d'),id=x.createImageData(160,160),r=rngf(3);for(var i=0;i<id.data.length;i+=4){var v=r()*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}x.putImageData(id,0,0);$('grain').style.backgroundImage='url('+c.toDataURL()+')'})();

/* ---------------- scroll engine ---------------- */
var S={y:0,sy:scrollY,vh:innerHeight,top:0,range:1,p:0,lastP:-1,prevY:scrollY,hideNav:false};
var nav=$('nav'),chalk=$('chalk');
function measure(){
  S.vh=innerHeight;var w=stage.clientWidth,h=stage.clientHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.fov=w/h<1?(w/h<.6?86:76):56;camera.updateProjectionMatrix();
  var r=pin.getBoundingClientRect();S.top=r.top+scrollY;S.range=Math.max(1,(pin.offsetHeight-stage.offsetHeight)*.985);
  cardRects();S.lastP=-1}
function cardRects(){L.forEach(function(o){var b=o.n.getBoundingClientRect();o.rect=b})}
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(measure,120)});
var onscreen=true;try{new IntersectionObserver(function(e){onscreen=e[0].isIntersecting},{rootMargin:'10% 0px'}).observe(stage)}catch(e){}

var walk=0,lastCam=new T.Vector3(),ready=false;
var proj=new T.Vector3();
function setLab(o,p){
  var w=o.w,a=ss(w[0],w[1],p)*(1-ss(w[2],w[3],p));o.a_=a;
  if(o.last===a)return;o.last=a;
  var n=o.n;n.style.opacity=a.toFixed(3);n.style.visibility=a<.01?'hidden':'visible';
  n.style.transform='translate3d(0,'+((1-ss(w[0],w[1],p))*18-(ss(w[2],w[3],p))*10).toFixed(1)+'px,0)';
  if(o.h2){var wd=70+34*ss(w[0],w[1]+.02,p);o.h2.style.setProperty('--wdth',wd.toFixed(1))}
  n.setAttribute('aria-hidden',a<.05?'true':'false')}
function update(p,t){
  path(p,tmpP,1);path(p,tmpL,2);
  var spd=lastCam.distanceTo(tmpP);var amp=clamp(spd*14,0,1);walk+=spd;
  camera.position.copy(tmpP);camera.position.y+=Math.sin(walk*9)*.014*amp*(p>.2?1:0);
  camera.position.x+=Math.cos(walk*4.5)*.01*amp*(p>.2?1:0);
  lastCam.copy(tmpP);
  camera.lookAt(tmpL);
  // doors + sun
  var open=ss(.085,.16,p),ang=open*1.5;doorL.rotation.y=ang;doorR.rotation.y=-ang;
  var inside=ss(.13,.2,p);sunLight.intensity=2.7*(1-inside);sx.signLight.intensity=16*(1-inside*.9);sx.hemi.intensity=.62+.95*inside;sx.fill.intensity=26*inside;
  renderer.toneMappingExposure=1.02+.3*inside;
  L.forEach(function(o){setLab(o,p)});
  var ha=1-ss(.02,.07,p);hero.style.opacity=ha.toFixed(3);hero.style.visibility=ha<.01?'hidden':'visible';hero.style.transform='translate3d(0,'+(-ss(.0,.08,p)*40).toFixed(1)+'px,0)';
  var wd=58+(112-58)*(1-Math.pow(1-clamp(1.3*(1-ss(0,.03,p))),3));h1.style.setProperty('--wdth',wd.toFixed(1));
  // leader line to the active anchored label
  var shown=false;
  for(var i=0;i<L.length;i++){var o=L[i];if(o.a&&o.a_>.4){
      proj.set(o.a[0],o.a[1],o.a[2]).project(camera);
      if(proj.z<1&&Math.abs(proj.x)<.96&&Math.abs(proj.y)<.96){
        var W=stage.clientWidth,H=stage.clientHeight,px=(proj.x*.5+.5)*W,py=(-proj.y*.5+.5)*H,rc=o.rect,tx=rc.left+28,ty=rc.top+(parseFloat(o.n.style.transform.split(',')[1])||0);
        ll.setAttribute('x1',px);ll.setAttribute('y1',py);ll.setAttribute('x2',tx);ll.setAttribute('y2',ty);
        lo.setAttribute('cx',px);lo.setAttribute('cy',py);li.setAttribute('cx',px);li.setAttribute('cy',py);
        leader.style.opacity=clamp((o.a_-.4)/.6);shown=true}break}}
  if(!shown)leader.style.opacity=0;
  fanGroup.rotation.y=t*.0016;
  renderer.render(scene,camera)}

function frame(t){
  S.y=scrollY;S.sy+=(S.y-S.sy)*.13;if(Math.abs(S.y-S.sy)<.08)S.sy=S.y;
  var p=clamp((S.sy-S.top)/S.range);
  var total=document.documentElement.scrollHeight-S.vh;chalk.style.transform='scaleY('+clamp(S.sy/total).toFixed(4)+')';
  var dy=S.y-S.prevY;if(Math.abs(dy)>3){S.hideNav=dy>0&&S.y>S.vh*.6;nav.classList.toggle('hide',S.hideNav);S.prevY=S.y}
  if(ready&&onscreen&&!lost)update(p,t);
  requestAnimationFrame(frame)}

function start(){
  body.classList.add('webgl');
  measure();
  var once=false;
  function go(){if(once)return;once=true;ready=true;measure();update(clamp((scrollY-S.top)/S.range),0);S.sy=scrollY;body.classList.add('is-ready');requestAnimationFrame(frame)}
  if(document.fonts&&document.fonts.ready){Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,1500)})]).then(function(){setTimeout(go,350)})}else setTimeout(go,600);
  window.__hk={setP:function(p){scrollTo(0,S.top+p*S.range);S.sy=scrollY}};
}
}
})();
