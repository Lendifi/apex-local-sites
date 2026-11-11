/* Hakes floor-laying scroll effect. Wood planks are laid down the left and right edges
   of the screen as you scroll. Top of page = bare. Bottom of page = borders fully laid.
   Procedural canvas wood, no external files. Fixed to viewport, pointer-events none. */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var host=document.createElement('div');host.className='floor-edge';host.setAttribute('aria-hidden','true');
 var cL=document.createElement('canvas'),cR=document.createElement('canvas');cL.className='fe-l';cR.className='fe-r';
 host.appendChild(cL);host.appendChild(cR);document.body.appendChild(host);
 var gL=cL.getContext('2d'),gR=cR.getContext('2d');
 var dpr=1,W=0,H=0,ROW=0,N=0,sprites=[],rowsL=[],rowsR=[],lastH=0;
 var PAL=[['#c9a06a','#b98a52'],['#bf9560','#a9794a'],['#d5b07c','#c19863'],['#b4814b','#9c6a3b'],['#c4975c','#ae8049'],['#a97545','#935f35'],['#d0aa75','#bb9259']];
 function rng(seed){var s=seed>>>0||1;return function(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
 function geom(){
  var vw=innerWidth,mobile=vw<700;
  W=mobile?12:vw<1000?52:80;
  ROW=mobile?13:vw<1000?16:20;
  document.documentElement.style.setProperty('--pw',W+'px');
  H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
  N=Math.ceil(H/ROW)+1;
 }
 function makeSprite(len,hgt,seed){
  var r=rng(seed),c=document.createElement('canvas');c.width=Math.ceil(len*dpr);c.height=Math.ceil(hgt*dpr);
  var g=c.getContext('2d');g.scale(dpr,dpr);
  var p=PAL[Math.floor(r()*PAL.length)];
  var gr=g.createLinearGradient(0,0,0,hgt);gr.addColorStop(0,p[0]);gr.addColorStop(1,p[1]);g.fillStyle=gr;g.fillRect(0,0,len,hgt);
  /* grain: long wavy lines */
  var n=Math.round(hgt*1.6);
  for(var i=0;i<n;i++){
   var y0=r()*hgt,amp=r()*1.6+0.2,ph=r()*6.28,fq=r()*0.03+0.01,al=r()*0.22+0.04;
   g.beginPath();g.moveTo(0,y0);
   for(var x=0;x<=len;x+=6){g.lineTo(x,y0+Math.sin(x*fq+ph)*amp+Math.sin(x*fq*2.7+ph*1.7)*amp*.4)}
   g.strokeStyle=(r()<.62?'rgba(70,40,15,':'rgba(255,230,190,')+al+')';g.lineWidth=r()*0.9+0.25;g.stroke();
  }
  /* cathedral figure + occasional knot */
  if(r()<.55&&len>40){var kx=r()*len,ky=hgt*(.25+r()*.5),kr=hgt*(.12+r()*.1);
   for(var j=4;j>0;j--){g.beginPath();g.ellipse(kx,ky,kr*j*1.6,kr*j*.45,0,0,6.28);g.strokeStyle='rgba(80,45,18,'+(.07+.03*j)+')';g.lineWidth=.8;g.stroke()}
   var kg=g.createRadialGradient(kx,ky,0,kx,ky,kr);kg.addColorStop(0,'rgba(60,32,12,.75)');kg.addColorStop(1,'rgba(60,32,12,0)');g.fillStyle=kg;g.beginPath();g.ellipse(kx,ky,kr*1.2,kr*.8,0,0,6.28);g.fill();}
  /* speckle */
  for(i=0;i<len*hgt/90;i++){g.fillStyle='rgba(60,35,12,'+(r()*.18)+')';g.fillRect(r()*len,r()*hgt,1,1)}
  /* soft sheen + bevel edges */
  var sh=g.createLinearGradient(0,0,0,hgt);sh.addColorStop(0,'rgba(255,245,220,.28)');sh.addColorStop(.35,'rgba(255,245,220,0)');sh.addColorStop(1,'rgba(30,15,5,.22)');g.fillStyle=sh;g.fillRect(0,0,len,hgt);
  g.fillStyle='rgba(255,240,210,.35)';g.fillRect(0,0,len,1);
  g.fillStyle='rgba(35,18,6,.7)';g.fillRect(0,hgt-1.3,len,1.3);
  /* end seam */
  g.fillStyle='rgba(35,18,6,.65)';g.fillRect(len-1.2,0,1.2,hgt);g.fillStyle='rgba(255,240,210,.25)';g.fillRect(0,0,1,hgt);
  return c;
 }
 function build(){
  geom();
  sprites=[];var base=Math.max(W*1.7,60);
  for(var i=0;i<16;i++){var L=Math.round(base*(.55+((i*7)%16)/16*.6));sprites.push({c:makeSprite(L,ROW,911+i*37),L:L})}
  function layout(seed){var r=rng(seed),rows=[];
   for(var i=0;i<N;i++){var pcs=[],x=-Math.round(r()*base*.9),k=Math.floor(r()*16);
    while(x<W+2){var s=sprites[k%16];pcs.push({x:x,s:s});x+=s.L;k+=1+Math.floor(r()*5)}
    rows.push({pcs:pcs,o:r()*0.6})}
   return rows}
  rowsL=layout(2026);rowsR=layout(777);
  [cL,cR].forEach(function(c){c.width=Math.round((W+GUT)*dpr);c.height=Math.round(H*dpr);c.style.width=(W+GUT)+'px';c.style.height=H+'px'});
  /* shadow sprite for the page-side edge */
  draw(true);
 }
 function ease(t){return t<0?0:t>1?1:t}
 function easeOut(t){t=ease(t);return 1-Math.pow(1-t,3)}
 function easeIn(t){t=ease(t);return t*t*t}
 var WIN=0.085;
 var GUT=16;
 function drawSide(g,rows,flip,p){
  var CW=W+GUT;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cL.width,cL.height);
  g.setTransform(dpr*(flip?-1:1),0,0,dpr,flip?CW*dpr:0,0);
  for(var i=0;i<N;i++){
   var row=rows[i];
   var st=(i/Math.max(1,N-1))*(1-WIN);   /* top rows first, bottom row completes at p=1 */
   var u=reduce?(p>=st+WIN*.5?1:0):(p-st)/WIN;
   if(p>=0.9995)u=1;
   if(u<=0)continue;
   u=Math.min(1,u);
   var e=easeOut(u),drop=easeIn(u),lift=1-drop;
   var dx=-(1-e)*(W+40);           /* slides in from the screen edge */
   var y=i*ROW;
   g.save();g.globalAlpha=Math.min(1,u*4);
   /* soft shadow on the page, bigger while the plank is still floating */
   var edge=W+dx,sw=8+lift*10;
   var gr=g.createLinearGradient(edge,0,edge+sw,0);gr.addColorStop(0,'rgba(20,10,3,'+(0.34-0.1*lift)+')');gr.addColorStop(1,'rgba(20,10,3,0)');
   g.fillStyle=gr;g.fillRect(edge,y+1+lift*4,sw,ROW);
   /* plank body */
   g.beginPath();g.rect(-2,y,W+4,ROW);g.clip();
   g.translate(dx,-lift*2.5);
   for(var k=0;k<row.pcs.length;k++){var pc=row.pcs[k];g.drawImage(pc.s.c,pc.x,y,pc.s.L,ROW)}
   g.restore();
  }
 }
 function draw(force){
  var p=cur;
  drawSide(gL,rowsL,false,p);drawSide(gR,rowsR,true,p);
 }
 var target=0,cur=0,raf=0;
 function progress(){var d=document.documentElement,max=d.scrollHeight-innerHeight;return max<=0?0:Math.min(1,Math.max(0,scrollY/max))}
 function tick(){
  raf=0;
  if(reduce)cur=target;else cur+=(target-cur)*0.2;
  if(Math.abs(target-cur)<0.0004)cur=target;
  draw();
  if(cur!==target)raf=requestAnimationFrame(tick);
 }
 function onScroll(){target=progress();if(!raf)raf=requestAnimationFrame(tick)}
 addEventListener('scroll',onScroll,{passive:true});
 var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){
  var wChanged=Math.abs(innerWidth-(build.vw||0))>2,hChanged=Math.abs(innerHeight-lastH)>80;
  if(wChanged||hChanged){build.vw=innerWidth;lastH=innerHeight;build();}
  onScroll()},120)});
 window.addEventListener('load',function(){target=progress();cur=target;draw()});
 build.vw=innerWidth;lastH=innerHeight;build();target=progress();cur=target;draw();
 /* expose for testing */
 window.__floor={get p(){return cur},set:function(v){target=cur=v;draw()}};
})();
