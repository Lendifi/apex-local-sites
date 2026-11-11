(()=>{
"use strict";
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)), lerp=(a,b,t)=>a+(b-a)*t;
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const eo=t=>1-Math.pow(1-t,3);
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const root=document.documentElement;

/* ============ procedural surface textures (all tile seamlessly) ============ */
const seedRng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const mk=S=>{const c=document.createElement("canvas");c.width=c.height=S;return c};
const wrap=(S,x,y,m,f)=>{for(const dx of[-S,0,S])for(const dy of[-S,0,S]){const nx=x+dx,ny=y+dy;if(nx>-m&&nx<S+m&&ny>-m&&ny<S+m)f(nx,ny)}};
const grainPass=(x,S,amt,seed)=>{
  const im=x.getImageData(0,0,S,S),d=im.data,r=seedRng(seed);
  for(let i=0;i<d.length;i+=4){const n=(r()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n}
  x.putImageData(im,0,0);
};
function texSod(S){
  const c=mk(S),x=c.getContext("2d"),r=seedRng(31),B=4;
  for(let b=0;b<B;b++){x.fillStyle=b%2?"#3b7424":"#4b8c2c";x.fillRect(0,b*S/B,S,S/B+1)}
  x.lineCap="round";
  for(let i=0;i<22000;i++){
    const px=r()*S,py=r()*S,band=Math.floor(py/(S/B))%2,len=9+r()*20;
    const a=-Math.PI/2+(band?.5:-.5)+(r()-.5)*.9,col=r()<.5?`hsla(${92+r()*22},${48+r()*20}%,${(band?24:31)+r()*16}%,.55)`:`hsla(${70+r()*20},${40+r()*20}%,${(band?32:42)+r()*14}%,.4)`;
    x.strokeStyle=col;x.lineWidth=1+r()*1.6;
    wrap(S,px,py,30,(nx,ny)=>{x.beginPath();x.moveTo(nx,ny);x.quadraticCurveTo(nx+Math.cos(a)*len*.5+(r()-.5)*4,ny+Math.sin(a)*len*.5,nx+Math.cos(a)*len,ny+Math.sin(a)*len);x.stroke()});
  }
  grainPass(x,S,18,5);
  return {c,size:[2.4,2.4]};
}
function texRock(S){
  const c=mk(S),x=c.getContext("2d"),r=seedRng(77);
  x.fillStyle="#23201b";x.fillRect(0,0,S,S);
  const pal=["#b8a07e","#9d8c77","#7f766b","#c8b592","#a77a5c","#8c9090","#b09474","#6f675e"];
  const stones=[];for(let i=0;i<1500;i++)stones.push({x:r()*S,y:r()*S,s:(i<500?26:16)+r()*(i<500?30:18),e:1+r()*.5,a:r()*Math.PI,c:pal[r()*pal.length|0]});
  stones.forEach(s=>wrap(S,s.x,s.y,70,(nx,ny)=>{
    x.save();x.translate(nx,ny);x.rotate(s.a);
    x.fillStyle="rgba(8,6,4,.55)";x.beginPath();x.ellipse(s.s*.12,s.s*.2,s.s*s.e,s.s*.92,0,0,6.283);x.fill();
    const g=x.createRadialGradient(-s.s*.3,-s.s*.35,s.s*.1,0,0,s.s*1.15);
    g.addColorStop(0,"rgba(255,248,232,.55)");g.addColorStop(.35,s.c);g.addColorStop(1,"rgba(20,14,8,.85)");
    x.fillStyle=s.c;x.beginPath();x.ellipse(0,0,s.s*s.e,s.s*.9,0,0,6.283);x.fill();
    x.fillStyle=g;x.fill();x.restore();
  }));
  grainPass(x,S,16,9);
  return {c,size:[1.5,1.5]};
}
function texPavers(S){
  const c=mk(S),x=c.getContext("2d"),r=seedRng(52),cols=8,rows=12,W=S/cols,H=S/rows,gap=3;
  x.fillStyle="#3a352f";x.fillRect(0,0,S,S);
  const pal=[[34,14,60],[30,12,52],[28,10,44],[26,18,66],[24,22,58],[210,6,50]];
  for(let j=0;j<rows;j++)for(let i=-1;i<cols+1;i++){
    const ox=(j%2?W/2:0)+i*W,oy=j*H,p=pal[r()*pal.length|0];
    wrap(S,ox,oy,W+4,(nx,ny)=>{
      x.fillStyle=`hsl(${p[0]+(r()-.5)*6} ${p[1]}% ${p[2]+(r()-.5)*7}%)`;x.fillRect(nx+gap/2,ny+gap/2,W-gap,H-gap);
      const g=x.createLinearGradient(nx,ny,nx+W,ny+H);g.addColorStop(0,"rgba(255,255,255,.14)");g.addColorStop(1,"rgba(0,0,0,.12)");x.fillStyle=g;x.fillRect(nx+gap/2,ny+gap/2,W-gap,H-gap);
    });
  }
  grainPass(x,S,26,13);
  return {c,size:[1.8,1.8]};
}
function texMulch(S){
  const c=mk(S),x=c.getContext("2d"),r=seedRng(88);
  x.fillStyle="#1f130b";x.fillRect(0,0,S,S);
  for(let i=0;i<9000;i++){
    const px=r()*S,py=r()*S,L=18+r()*40,Wd=6+r()*10,a=r()*Math.PI,l=14+r()*18;
    wrap(S,px,py,50,(nx,ny)=>{
      x.save();x.translate(nx,ny);x.rotate(a);
      x.fillStyle="rgba(0,0,0,.4)";x.fillRect(-L/2+2,-Wd/2+3,L,Wd);
      x.fillStyle=`hsl(${18+r()*10} ${42+r()*20}% ${l}%)`;x.fillRect(-L/2,-Wd/2,L,Wd);
      x.fillStyle="rgba(255,220,170,.14)";x.fillRect(-L/2,-Wd/2,L,Wd*.3);
      x.restore();
    });
  }
  grainPass(x,S,18,17);
  return {c,size:[1.5,1.5]};
}
function texFlag(S){
  const c=mk(S),x=c.getContext("2d"),r=seedRng(64),N=6,im=x.createImageData(S,S),d=im.data;
  const pts=[],cols=[[150,138,118],[132,128,124],[160,120,92],[118,124,132],[170,152,122],[142,110,88]];
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const h=r;pts.push({x:(i+.15+r()*.7)/N,y:(j+.15+r()*.7)/N,c:cols[r()*cols.length|0],t:(r()-.5)*22})}
  const rn=seedRng(3);
  for(let py=0;py<S;py++)for(let px=0;px<S;px++){
    const u=px/S,v=py/S,ci=Math.floor(u*N),cj=Math.floor(v*N);let d1=9,d2=9,best=null;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){
      const ii=((ci+di)%N+N)%N,jj=((cj+dj)%N+N)%N,p=pts[jj*N+ii];
      const dx=u-(p.x+Math.floor((ci+di)/N)),dy=v-(p.y+Math.floor((cj+dj)/N)),dd=Math.sqrt(dx*dx+dy*dy);
      if(dd<d1){d2=d1;d1=dd;best=p}else if(dd<d2)d2=dd;
    }
    const e=(d2-d1)*N,i=(py*S+px)*4,n=(rn()-.5)*26+best.t,shade=e<.045?.22:e<.09?.8+.2*(e-.045)/.045:1;
    d[i]=(best.c[0]+n)*shade;d[i+1]=(best.c[1]+n)*shade;d[i+2]=(best.c[2]+n)*shade;d[i+3]=255;
  }
  x.putImageData(im,0,0);
  return {c,size:[2.4,2.4]};
}
const SURF=[
  {id:"sod",name:"Sod",sub:"striped lawn",gen:texSod},
  {id:"rock",name:"Rock",sub:"river rock",gen:texRock},
  {id:"pavers",name:"Pavers",sub:"tumbled pavers",gen:texPavers},
  {id:"mulch",name:"Mulch",sub:"dark bark mulch",gen:texMulch},
  {id:"flag",name:"Flagstone",sub:"irregular flagstone",gen:texFlag}
];
const nf=n=>Math.round(n).toLocaleString("en-US");
const f1=n=>(Math.round(n*10)/10).toLocaleString("en-US",{minimumFractionDigits:1,maximumFractionDigits:1});
const CALC={
  sod:a=>{const n=a*1.1;return{t:`Plan on about ${nf(Math.ceil(n/10))} rolls of sod (about ${f1(n/450)} pallets) once you add 10% for cuts and waste.`,
    n:["Rolls of 10 sq ft each","About 450 sq ft per pallet. Sod farms differ","10% extra for cuts and waste"]}},
  rock:a=>{const cy=a*.25/27;return{t:`Plan on about ${f1(cy*1.4)} tons of rock (${f1(cy)} cubic yards) laid 3 inches deep.`,
    n:["3 inches deep","About 1.4 tons per cubic yard. Rock type changes this","No waste added. Beds get topped off on site"]}},
  pavers:a=>{const n=a*1.1,cy=a*.5/27;return{t:`Plan on about ${nf(n*2.67)} pavers and ${f1(cy*1.4)} tons of base rock once you add 10% for cuts.`,
    n:["6 x 9 in pavers, about 2.7 per sq ft","6 inches of compacted base at about 1.4 tons per cubic yard","10% extra for cuts. Patterns need more"]}},
  mulch:a=>{const cy=a*.25/27;return{t:`Plan on about ${f1(cy)} cubic yards of mulch, or about ${nf(Math.ceil(cy*13.5))} two-cubic-foot bags, laid 3 inches deep.`,
    n:["3 inches deep","13.5 two-cubic-foot bags per cubic yard","Real beds are curved, so we measure them on site"]}},
  flag:a=>{const n=a*1.15;return{t:`Plan on about ${nf(n)} sq ft of flagstone once you add 15% for irregular cuts.`,
    n:["15% extra since each stone is cut to fit","Thickness and weight depend on the stone. We confirm when we measure"]}}
};
const CHIP={sod:"New lawn or sod",rock:"Xeriscape and rock",pavers:"Patio or pavers",mulch:"Trees, shrubs or lighting",flag:"Patio or pavers"};
function buildTextures(){
  const small=Math.min(innerWidth,innerHeight)<700&&(navigator.deviceMemory||8)<4;
  SURF.forEach(m=>{const t=m.gen(1024);m.c=t.c;m.size=t.size;m.url=t.c.toDataURL("image/jpeg",.8)});
}

/* ============ WebGL yard renderer ============ */
const VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;uniform sampler2D uA,uB;uniform vec2 uSA,uSB;uniform float uMix;
uniform vec3 uCam;uniform float uPitch,uYaw,uFocal,uFog,uExpo,uTime;uniform vec2 uRoom;
const vec3 SUN=vec3(-.4583,.8147,-.3564);
const float FH=1.8;
float h1(float n){return fract(sin(n*127.1+3.7)*43758.5453);}
vec3 backdrop(vec3 rd){
  float el=rd.y/max(length(rd.xz),1e-3),az=atan(rd.x,rd.z);
  vec3 sky=mix(vec3(2.1,2.3,2.4),vec3(.3,.85,2.6),smoothstep(0.,.5,el));
  float ridge=.14+.07*sin(az*3.+1.3)+.04*sin(az*8.+.4)+.016*sin(az*19.+2.)+.007*sin(az*43.);
  vec3 mtn=mix(vec3(.28,.4,.62),vec3(1.7,1.8,2.1),smoothstep(ridge-.035,ridge-.004,el));
  vec3 col=mix(mtn,sky,smoothstep(ridge-.004,ridge+.004,el));
  float tl=.016+.016*sin(az*17.+.7)+.01*sin(az*41.+1.)+.008*sin(az*89.)+.006*h1(floor(az*140.));
  vec3 tr=vec3(.08,.16,.07)*(.8+.5*h1(floor(az*55.)));
  col=mix(tr,col,smoothstep(tl-.004,tl+.004,el));
  return col;
}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 rd=normalize(vec3(p.x,p.y,uFocal));
  float c=cos(uPitch),s=sin(uPitch);rd=vec3(rd.x,rd.y*c-rd.z*s,rd.y*s+rd.z*c);
  c=cos(uYaw);s=sin(uYaw);rd=vec3(rd.x*c+rd.z*s,rd.y,-rd.x*s+rd.z*c);
  vec3 ro=uCam;float hw=uRoom.x,D=uRoom.y;
  float tF=rd.y<-1e-4?-ro.y/rd.y:1e9;
  float tB=rd.z>1e-4?(D-ro.z)/rd.z:1e9;
  float tL=rd.x<-1e-4?(-hw-ro.x)/rd.x:1e9;
  float tR=rd.x>1e-4?(hw-ro.x)/rd.x:1e9;
  if(ro.y+rd.y*tB>FH)tB=1e9;if(ro.y+rd.y*tL>FH)tL=1e9;if(ro.y+rd.y*tR>FH)tR=1e9;
  float t=min(min(tF,tB),min(tL,tR));
  vec3 pos=ro+rd*t;vec3 L;
  vec3 amb=vec3(.17,.19,.23),sunc=vec3(3.1,2.55,1.85);
  bool sky=t>=1e8;
  if(sky){L=backdrop(rd);}
  else if(t==tF){
    float w=pos.z+pos.x*.35,e=mix(.5,D+hw*.35+.4,uMix);
    float m=smoothstep(e-.015,e+.015,w);
    vec3 a=texture2D(uA,pos.xz/uSA).rgb,b=texture2D(uB,pos.xz/uSB).rgb;
    vec3 alb=pow(mix(b,a,m),vec3(2.2));
    float aoF=(.55+.45*smoothstep(0.,.8,hw-abs(pos.x)))*(.6+.4*smoothstep(0.,1.,D-pos.z));
    float lit=smoothstep(-hw+.55,-hw+1.35,pos.x)*smoothstep(-.4,.4,D-pos.z)*(pos.z>-1.?1.:1.);
    L=alb*(amb*1.3*aoF+sunc*.6*lit*(.75+.25*aoF));
    float edge=exp(-abs(w-e)*16.)*step(.002,uMix)*step(uMix,.998);
    L+=vec3(.2,.42,1.5)*edge;
  }else{
    float cc=(t==tB)?pos.x:pos.z;float bw=.14;
    float id=floor(cc/bw),fr=fract(cc/bw),rr=h1(id+(t==tB?0.:41.));
    vec3 wood=mix(vec3(.4,.24,.13),vec3(.56,.36,.2),rr);
    wood*=.86+.28*h1(floor(pos.y*4.)*.61+id*1.7);
    wood*=.35+.65*smoothstep(0.,.05,fr)*smoothstep(1.,.95,fr);
    float pc=fract(cc/1.9);if(pc<.045||pc>.985)wood=vec3(.52,.4,.29)*(.9+.2*h1(floor(cc/1.9)));
    if(pos.y>FH-.07)wood=vec3(.6,.47,.34);
    wood*=.55+.45*smoothstep(0.,.25,pos.y);
    float ndl=t==tB?SUN.z*-1.:(t==tR?-SUN.x:SUN.x);ndl=max(ndl,0.);
    L=wood*(amb*1.5+sunc*ndl*.55);
  }
  if(!sky)L=mix(vec3(1.5,1.55,1.5)*.4,L,exp(-t*uFog));
  L*=uExpo;L=L/(1.+L);L=pow(L,vec3(1./2.2));
  L*=1.-.32*dot(p,p);
  L+=(fract(sin(dot(gl_FragCoord.xy+uTime,vec2(12.9898,78.233)))*43758.5453)-.5)*.022;
  gl_FragColor=vec4(L,1.);
}`;
class Yard{
  constructor(cv){
    this.cv=cv;
    const gl=this.gl=cv.getContext("webgl",{antialias:false,alpha:false,powerPreference:"high-performance"})||cv.getContext("experimental-webgl");
    if(!gl)throw new Error("no webgl");
    const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
    const pr=this.pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const l=gl.getAttribLocation(pr,"p");gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
    this.u={};["uRes","uA","uB","uSA","uSB","uMix","uCam","uPitch","uYaw","uFocal","uFog","uExpo","uTime","uRoom"].forEach(n=>this.u[n]=gl.getUniformLocation(pr,n));
    this.aniso=gl.getExtension("EXT_texture_filter_anisotropic")||gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    this.lost=false;cv.addEventListener("webglcontextlost",e=>{e.preventDefault();this.lost=true});
  }
  tex(canvas){
    const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
    if(this.aniso)gl.texParameterf(gl.TEXTURE_2D,this.aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    return t;
  }
  size(){
    const d=Math.min(devicePixelRatio||1,2),w=Math.max(2,Math.round(this.cv.clientWidth*d)),h=Math.max(2,Math.round(this.cv.clientHeight*d));
    if(this.cv.width!==w||this.cv.height!==h){this.cv.width=w;this.cv.height=h}
    this.gl.viewport(0,0,w,h);
  }
  draw(o){
    if(this.lost)return;const gl=this.gl,u=this.u;this.size();
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.a.t);gl.uniform1i(u.uA,0);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,o.b.t);gl.uniform1i(u.uB,1);
    gl.uniform2f(u.uRes,this.cv.width,this.cv.height);
    gl.uniform2f(u.uSA,o.a.size[0],o.a.size[1]);gl.uniform2f(u.uSB,o.b.size[0],o.b.size[1]);
    gl.uniform1f(u.uMix,o.mix||0);
    gl.uniform3f(u.uCam,o.cam[0],o.cam[1],o.cam[2]);gl.uniform1f(u.uPitch,o.pitch);gl.uniform1f(u.uYaw,o.yaw||0);gl.uniform1f(u.uFocal,o.focal);
    gl.uniform1f(u.uFog,o.fog);gl.uniform1f(u.uExpo,o.expo);gl.uniform1f(u.uTime,o.time||0);
    gl.uniform2f(u.uRoom,o.room[0],o.room[1]);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
}

/* ============ scroll state ============ */
const S={y:scrollY,sy:scrollY,v:0,vh:innerHeight,vw:root.clientWidth,max:1,t:0};
const pins=$$(".pin").map(el=>({el,stage:$(".pin-stage",el),top:0,len:1,p:0}));
const pinOf=id=>pins.find(o=>o.el.id===id);
const tones=$$("[data-tone]").map(el=>({el,top:0,bottom:0,light:el.dataset.tone==="light"}));
const nav=$("#nav"),chalk=$(".chalk");

$$("[data-words]").forEach(el=>{el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="w">${w}</span>`).join(" ")});
const words=$$(".manifesto .w");

const ORDER=[3,0,6,2,8,5,1,7,4,9,6,2,10,4];
const pws=$$(".pw").map(el=>{
  const n=innerWidth<700?9:16;el.innerHTML="<i></i>".repeat(n);
  return {el,cols:$$("i",el),vis:false,last:-1};
});
const stretches=$$(".stretch").map(el=>({el,vis:false,wd:100,min:+el.dataset.min||58,last:-1}));
const fits=$$("[data-fit]");
function fit(){
  fits.forEach(el=>{
    const target=+el.dataset.fit,max=+el.dataset.max||160;
    el.style.fontSize="100px";el.style.setProperty("--wdth",target);
    const avail=el.clientWidth-2;let w=1;
    $$(".ln>span",el).forEach(s=>{w=Math.max(w,s.getBoundingClientRect().width)});
    el.style.fontSize=Math.min(max,avail/w*100,el.dataset.vh?innerHeight*el.dataset.vh:1e4).toFixed(2)+"px";
    el._wd=target;
  });
  stretches.forEach(o=>{o.wd=o.el._wd||100;o.last=-1});
}

const io=new IntersectionObserver(es=>es.forEach(e=>{
  const t=e.target;
  if(t._pw)t._pw.vis=e.isIntersecting;
  if(t._st)t._st.vis=e.isIntersecting;
  if(t._gl)t._gl.vis=e.isIntersecting,t._gl.dirty=true;
}),{rootMargin:"12% 0px 12% 0px"});
pws.forEach(o=>{o.el._pw=o;io.observe(o.el)});
stretches.forEach(o=>{o.el._st=o;io.observe(o.el)});
const secIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");secIO.unobserve(e.target)}}),{rootMargin:"0px 0px -18% 0px"});
$$(".sec,.pin:not(.hero)").forEach(el=>secIO.observe(el));

/* ============ hero: real photo pushes in, then the manifesto lights up ============ */
const hero={pin:pinOf("top"),intro:0,t0:0,
  a:$(".hero-a"),h1:$(".hero h1"),photo:$(".hero-photo"),shade:$(".hero-shade"),b:$(".hero-b"),rule:$(".hero-b .rule"),hint:$(".hint"),lastW:-1,lastWd:-1,vis:true};
function heroUpdate(time){
  const p=hero.pin.p,H=hero;
  const fadeA=1-ss(.1,.34,p);
  H.a.style.opacity=fadeA.toFixed(3);H.a.style.transform=`translate3d(0,${(-p*S.vh*.5).toFixed(1)}px,0)`;
  H.a.style.visibility=fadeA<.005?"hidden":"visible";
  H.hint.style.opacity=(.8*(1-ss(0,.05,p))).toFixed(3);
  const tw=H.h1._wd||100,wd=Math.round(lerp(lerp(56,tw,eo(H.intro)),56,ss(.06,.34,p))*2)/2;
  if(wd!==H.lastWd){H.h1.style.setProperty("--wdth",wd);H.lastWd=wd}
  const breathe=RM?0:Math.sin(time*.0004)*.008;
  H.photo.style.transform=`translate3d(0,${(-p*5).toFixed(2)}%,0) scale(${(1.02+.34*ss(0,.85,p)+breathe).toFixed(4)})`;
  H.shade.style.opacity=(ss(.42,.7,p)*.72).toFixed(3);
  const ob=ss(.5,.62,p);H.b.style.opacity=ob.toFixed(3);H.b.style.visibility=ob<.005?"hidden":"visible";
  H.rule.style.transform=`scaleX(${ss(.5,.64,p).toFixed(4)})`;
  const q=clamp((p-.6)/.32)*words.length,wi=Math.round(q*20);
  if(wi!==H.lastW){H.lastW=wi;for(let i=0;i<words.length;i++)words[i].style.opacity=(RM?1:.16+.84*clamp(q-i)).toFixed(2)}
}
/* ambient motes: a few pollen specks drifting through the light (hero only, skipped for reduced motion) */
const motes=(()=>{
  const cv=$("#motes");if(!cv||RM)return null;
  const g=cv.getContext("2d"),n=innerWidth<700?22:42,r=seedRng(5),P=[];
  for(let i=0;i<n;i++)P.push({x:r(),y:r(),z:.3+r()*.7,ph:r()*6.28,sp:.4+r()});
  return {draw(time){
    const w=cv.clientWidth,h=cv.clientHeight,d=1;
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
    g.clearRect(0,0,w,h);
    P.forEach(m=>{
      const x=((m.x+time*.000012*m.sp+Math.sin(time*.0004*m.sp+m.ph)*.01)%1)*w,y=((m.y-time*.000009*m.sp+1)%1)*h,rad=(1+m.z*2.6)*(w<700?.8:1);
      const gr=g.createRadialGradient(x,y,0,x,y,rad*3);gr.addColorStop(0,`rgba(255,244,205,${.55*m.z})`);gr.addColorStop(1,"rgba(255,244,205,0)");
      g.fillStyle=gr;g.beginPath();g.arc(x,y,rad*3,0,6.283);g.fill();
    });
  }};
})();

/* ============ services rail ============ */
const mats={pin:pinOf("services"),track:$("#track"),hangs:$$(".board-hang"),max:0,sp:[]};
mats.sp=mats.hangs.map((_,i)=>({a:0,v:0,k:.07+i*.006}));
function matsUpdate(){
  const p=mats.pin.p;
  mats.track.style.transform=`translate3d(${(-ss(.04,.96,p)*mats.max).toFixed(1)}px,0,0)`;
  const target=RM?0:clamp(S.v*.32,-11,11);
  mats.sp.forEach((s,i)=>{
    s.v+=(target-s.a)*s.k;s.v*=.9;s.a+=s.v;
    if(Math.abs(s.a)>.01||Math.abs(s.v)>.01)mats.hangs[i].style.transform=`rotate(${s.a.toFixed(2)}deg)`;
  });
}

/* ============ process plan ============ */
const proc={pin:pinOf("process"),steps:$$(".step"),bar:$(".proc-bar"),outline:$("#outline"),house:$("#house"),houseT:$("#houseT"),dims:$("#dimsG"),chalk:$("#chalkPlan"),done:$("#doneG"),sheen:$("#sheenR"),bedA:$("#bedA"),bedB:$("#bedB"),patio:$("#patio"),patioL:$("#patioLines"),pk:[],chips:[],cur:0,count:-1};
(()=>{
  const NS="http://www.w3.org/2000/svg",g=$("#planks"),r=seedRng(77),tones=["#5d9a35","#4f8c2d","#6aa63f","#58943a","#4a8429","#659f3b"];
  for(let y=70;y<330;y+=20){
    let x=50-r()*50;
    while(x<430){const w=60+r()*80,e=document.createElementNS(NS,"rect");
      e.setAttribute("x",x.toFixed(1));e.setAttribute("y",y);e.setAttribute("width",(w-1.5).toFixed(1));e.setAttribute("height",18.5);e.setAttribute("fill",tones[r()*tones.length|0]);e.setAttribute("class","pk");
      g.appendChild(e);proc.pk.push(e);x+=w}
  }
  const cg=$("#chips"),cols=["#5d9a35","#a89478","#b9a58a","#5b3a24","#8c93a0"];
  cols.forEach((c,i)=>{const e=document.createElementNS(NS,"rect");
    e.setAttribute("x",120+i*50);e.setAttribute("y",120);e.setAttribute("width",40);e.setAttribute("height",150);e.setAttribute("rx",3);e.setAttribute("fill",c);e.setAttribute("stroke","#10241a");e.setAttribute("stroke-width",2);e.setAttribute("class","chip");
    e.style.transitionDelay=(i*60)+"ms";cg.appendChild(e);proc.chips.push(e)});
})();
function procUpdate(){
  const p=proc.pin.p,step=Math.min(3,Math.floor(p*4));
  if(step!==proc.cur){proc.steps[proc.cur].classList.remove("on");proc.steps[step].classList.add("on");proc.cur=step}
  proc.bar.style.transform=`scaleY(${p.toFixed(4)})`;
  const chipsOn=p<.235;
  proc.chips.forEach((c,i)=>{c.style.opacity=chipsOn?1:0;c.style.transform=chipsOn?`rotate(${(i-2)*5}deg)`:`translateY(-40px) rotate(${(i-2)*14}deg) scale(.7)`});
  proc.outline.style.strokeDashoffset=(1-ss(.25,.42,p)).toFixed(4);
  proc.house.style.strokeDashoffset=(1-ss(.3,.45,p)).toFixed(4);
  proc.houseT.classList.toggle("on",p>.44&&p<.9);
  proc.dims.classList.toggle("on",p>.36&&p<.9);
  proc.chalk.style.strokeDashoffset=(1-ss(.46,.53,p)).toFixed(4);
  proc.chalk.style.opacity=(1-ss(.6,.72,p)).toFixed(3);
  const n=Math.round(proc.pk.length*clamp((p-.52)/.2));
  if(n!==proc.count){const a=Math.min(n,proc.count<0?0:proc.count),b=Math.max(n,proc.count);for(let i=a;i<b;i++)proc.pk[i].classList.toggle("on",i<n);proc.count=n}
  proc.bedA.classList.toggle("on",p>.7);proc.bedB.classList.toggle("on",p>.73);
  proc.patio.classList.toggle("on",p>.76);proc.patioL.classList.toggle("on",p>.78);
  proc.done.classList.toggle("on",p>.8);
  const sh=clamp((p-.78)/.2);proc.sheen.setAttribute("x",(-200+sh*900).toFixed(0));proc.sheen.setAttribute("opacity",sh>0&&sh<1?1:0);
}

/* ============ yard visualizer + calculator ============ */
const viz={gl:null,vis:false,dirty:true,cur:0,next:0,mix:0,t0:0,anim:false,w:30,d:40,yaw:0,cv:$("#yardGL")};
function vizDraw(time){
  if(!viz.gl||!viz.vis)return;
  if(viz.anim){
    const k=clamp((time-viz.t0)/(RM?1:1250));viz.mix=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
    if(k>=1){viz.anim=false;viz.cur=viz.next;viz.mix=0}
    viz.dirty=true;
  }
  if(!viz.dirty)return;viz.dirty=false;
  const hw=viz.w*.3048/2,dep=viz.d*.3048,a=SURF[viz.cur],b=SURF[viz.next];
  const portrait=viz.cv.clientHeight>viz.cv.clientWidth;
  viz.gl.draw({a,b,mix:viz.mix,cam:[0,portrait?2.1:1.85,.2],pitch:portrait?.32:.27,yaw:viz.yaw,focal:portrait?1.0:.9,fog:.006,expo:1.25,time:time*.001,room:[hw,dep]});
}
function vizPick(i){
  if(i===viz.next&&!viz.anim&&i===viz.cur)return;
  if(viz.anim){viz.cur=viz.next;viz.mix=0}
  viz.next=i;viz.anim=true;viz.t0=performance.now();
  if(!viz.gl){viz.cur=i;viz.anim=false;$(".viz-view").style.backgroundImage=`url(${SURF[i].url})`}
  $$(".sw").forEach((b,k)=>b.setAttribute("aria-pressed",k===i));
  $$("#swNames span").forEach((s,k)=>s.classList.toggle("on",k===i));
  $("#vizName").textContent=`${SURF[i].name}, ${SURF[i].sub}`;
  vizDims();
}
function vizDims(){
  viz.w=+$("#rw").value;viz.d=+$("#rd").value;
  $("#rwo").textContent=viz.w+" ft";$("#rdo").textContent=viz.d+" ft";
  const a=viz.w*viz.d,m=SURF[viz.next],o=CALC[m.id](a);
  $("#sqft").textContent=nf(a)+" sq ft";$("#vizDim").textContent=`${viz.w} x ${viz.d} ft`;
  $("#order").textContent=o.t;$("#assume").innerHTML=o.n.map(s=>`<li>${s}</li>`).join("");
  viz.dirty=true;
}
$("#rw").addEventListener("input",vizDims);$("#rd").addEventListener("input",vizDims);
if(matchMedia("(pointer:fine)").matches)viz.cv.addEventListener("pointermove",e=>{const r=viz.cv.getBoundingClientRect();viz.yaw=((e.clientX-r.left)/r.width-.5)*.14;viz.dirty=true});

/* ============ reviews fill ============ */
const themes=$$("#themes span");

/* ============ estimate form (demo only) ============ */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DEMO={name:"Jordan M.",phone:"(555) 010-0177",email:"jordan@example.com",address:"123 Example St, Sandy, UT"};
const form=$("#estimate");
$("#fillDemo").addEventListener("click",()=>{for(const k in DEMO)form[k].value=DEMO[k]});
$("#sendSize").addEventListener("click",()=>{
  const m=SURF[viz.next],a=viz.w*viz.d;
  $$("input[name=svc]",form).forEach(i=>{if(i.value===CHIP[m.id])i.checked=true});
  form.notes.value=`Area about ${viz.w} x ${viz.d} ft (${nf(a)} sq ft). Thinking about ${m.sub}.`;
  $("#estimate").scrollIntoView({behavior:RM?"auto":"smooth",block:"start"});
});
form.addEventListener("submit",e=>{
  e.preventDefault();
  const msg=$("#formMsg"),out=$("#formOut"),d={};
  const miss=["name","phone","email","address"].filter(k=>!(d[k]=form[k].value.trim()));
  if(miss.length){msg.textContent="Please add your "+miss.join(", ").replace(/, ([^,]*)$/," and $1")+".";out.innerHTML="";return}
  if(!/^\S+@\S+\.\S+$/.test(d.email)){msg.textContent="That email looks off.";return}
  msg.textContent="";
  const svc=$$("input[name=svc]:checked",form).map(i=>i.value).join(", ")||"Not sure yet",slot=form.slot.value,notes=form.notes.value.trim();
  out.innerHTML=`<div class="conf"><b>Estimate booked: ${esc(slot)}</b><br>What: ${esc(svc)}<br>Name: ${esc(d.name)}<br>Phone: ${esc(d.phone)}<br>Email: ${esc(d.email)}<br>Address: ${esc(d.address)}${notes?`<br>Notes: ${esc(notes)}`:""}</div>
<div class="cal"><b>Calendar event: Frost yard estimate</b><br>${esc(slot)}. On site at ${esc(d.address)}<br>Customer: ${esc(d.name)}, ${esc(d.phone)}, ${esc(d.email)}<br>Job: ${esc(svc)}<br><span class="fn">Concept demo. Nothing is sent or stored.</span></div>`;
  out.scrollIntoView({behavior:RM?"auto":"smooth",block:"center"});
});

/* ============ measure + loop ============ */
function measure(){
  S.vh=innerHeight;S.vw=root.clientWidth;S.max=Math.max(1,root.scrollHeight-S.vh);
  const y=scrollY;
  pins.forEach(o=>{o.top=o.el.getBoundingClientRect().top+y;o.len=Math.max(1,o.el.offsetHeight-o.stage.offsetHeight*1.26)});
  tones.forEach(o=>{const r=o.el.getBoundingClientRect();o.top=r.top+y;o.bottom=r.bottom+y});
  mats.max=Math.max(0,mats.track.scrollWidth-S.vw);
  viz.dirty=true;
}
let lastY=scrollY,navHidden=false;
function frame(time){
  S.y=scrollY;const prev=S.sy;
  S.sy=RM?S.y:S.sy+(S.y-S.sy)*.13;if(Math.abs(S.y-S.sy)<.08)S.sy=S.y;
  S.v=S.sy-prev;
  pins.forEach(o=>{o.p=clamp((S.sy-o.top)/o.len)});

  const pwR=pws.map(o=>o.vis?o.el.getBoundingClientRect().top:null);
  const stR=stretches.map(o=>o.vis?o.el.getBoundingClientRect().top:null);
  const thR=themes.map(el=>el.getBoundingClientRect().top);

  chalk.style.transform=`scaleY(${clamp(S.sy/S.max).toFixed(4)})`;
  const probe=S.y+30;let light=false;
  for(const t of tones)if(probe>=t.top&&probe<t.bottom){light=t.light;break}
  nav.classList.toggle("on-light",light);
  const dy=S.y-lastY;if(Math.abs(dy)>4){const hide=dy>0&&S.y>S.vh*.6;if(hide!==navHidden){navHidden=hide;nav.classList.toggle("hide",hide)}lastY=S.y}

  if(hero.intro<1&&document.body.classList.contains("is-ready"))hero.intro=clamp((time-hero.t0-550)/1300);
  heroUpdate(time);matsUpdate();procUpdate();vizDraw(time);
  if(motes&&hero.pin.p<.7)motes.draw(time);

  pws.forEach((o,i)=>{
    if(pwR[i]===null)return;
    const pr=clamp((S.vh-pwR[i])/S.vh),key=Math.round(pr*600);
    if(key===o.last)return;o.last=key;
    o.cols.forEach((c,k)=>{c.style.transform=`scaleY(${ss(0,1,pr*2.6-ORDER[k%ORDER.length]*.16).toFixed(4)})`});
  });
  stretches.forEach((o,i)=>{
    if(stR[i]===null)return;
    const t=clamp(1-(stR[i]-S.vh*.42)/(S.vh*.58)),wd=Math.round(lerp(o.min,o.wd,eo(t))*2)/2;
    if(wd!==o.last){o.last=wd;o.el.style.setProperty("--wdth",wd)}
  });
  themes.forEach((el,i)=>{el.style.setProperty("--f",RM?1:clamp(1-(thR[i]-S.vh*.5)/(S.vh*.32)).toFixed(3))});
  requestAnimationFrame(frame);
}

/* ============ boot ============ */
function boot(){
  try{buildTextures()}catch(e){console.warn("texture build failed",e)}
  const sw=$("#swatches"),sn=$("#swNames");
  SURF.forEach((m,i)=>{
    const b=document.createElement("button");b.type="button";b.className="sw";b.setAttribute("aria-pressed",i===0);b.setAttribute("aria-label",`${m.name}, ${m.sub}`);
    if(m.url)b.style.backgroundImage=`url(${m.url})`;b.addEventListener("click",()=>vizPick(i));sw.appendChild(b);
    const s=document.createElement("span");s.textContent=m.name;if(i===0)s.className="on";sn.appendChild(s);
  });
  try{
    viz.gl=new Yard(viz.cv);SURF.forEach(m=>{m.t=viz.gl.tex(m.c)});viz.cv._gl=viz;io.observe(viz.cv);
  }catch(e){
    console.warn("yard webgl unavailable",e);viz.gl=null;
    const v=$(".viz-view");v.style.backgroundSize="420px";
    if(SURF[0].url)v.style.backgroundImage=`url(${SURF[0].url})`;
  }
  const go=()=>{
    fit();measure();vizDims();
    hero.t0=performance.now();document.body.classList.remove("is-loading");document.body.classList.add("is-ready");
    requestAnimationFrame(frame);
  };
  const fontsReady=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  Promise.race([fontsReady,new Promise(r=>setTimeout(r,1500))]).then(()=>setTimeout(go,RM?0:650));
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{fit();measure()},120)});
  addEventListener("load",()=>{fit();measure()});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
