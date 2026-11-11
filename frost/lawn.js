/* Frost sod-roll hero. A pinned (sticky) canvas scene: three rolls of sod unroll across a dirt yard
   as you scroll. Each roll shrinks as it unrolls, casts a shadow, and leaves fresh sod behind.
   Textures: img/dirt.jpg and img/grass.jpg (generated, unbranded). No external services. */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var host=document.getElementById('top'),stage=document.getElementById('lawnStage'),cv=document.getElementById('lawnCv');
 if(!host||!cv)return;
 var g=cv.getContext('2d'),nav=document.querySelector('.nav');
 var cardEl=document.getElementById('lawnCard'),capEl=document.getElementById('lawnCap'),barEl=document.getElementById('lawnBar'),hintEl=document.getElementById('lawnHint');
 var imgD=new Image(),imgG=new Image(),ready=0;
 imgD.src='img/dirt.jpg';imgG.src='img/grass.jpg';
 imgD.onload=imgG.onload=function(){if(++ready===2)(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(init)};
 var CW,CH,dpr,LANES=3,laneH,r0,rc,x0,Ltot,dirtC,grassC,tgt=0,cur=0,raf=0,lanes=[];
 function mirrorTile(img,size){ /* seamless tile: offset copy blended in so edges match, no mirror symmetry */
  var A=document.createElement('canvas');A.width=A.height=size;var a=A.getContext('2d');a.drawImage(img,0,0,size,size);
  var T=document.createElement('canvas');T.width=T.height=size;var t=T.getContext('2d'),h=size/2;
  t.drawImage(A,h,h);t.drawImage(A,-h,h);t.drawImage(A,h,-h);t.drawImage(A,-h,-h);
  var M=document.createElement('canvas');M.width=M.height=size;var m=M.getContext('2d');m.drawImage(A,0,0);
  m.globalCompositeOperation='destination-in';
  var rg=m.createRadialGradient(h,h,size*0.18,h,h,size*0.5);rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(1,'rgba(0,0,0,0)');
  m.fillStyle=rg;m.fillRect(0,0,size,size);
  t.drawImage(M,0,0);return T}
 function setNav(){var h=nav?nav.offsetHeight:58;document.documentElement.style.setProperty('--navh',h+'px')}
 function layout(){
  setNav();
  var r=stage.getBoundingClientRect();CW=Math.round(r.width);CH=Math.round(r.height);
  var mobile=CW<700;dpr=Math.min(devicePixelRatio||1,mobile?1.75:2);
  cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr);
  laneH=CH/LANES;
  r0=Math.min(laneH*0.4,CW*0.2);rc=r0*0.16;x0=r0+4;Ltot=CW-x0+rc;
  lanes=[];for(var i=0;i<LANES;i++){var ry0=r0*0.26;lanes.push({y0:i*laneH,sA:i*laneH+1.5,sB:(i+1)*laneH-1.5,yA:i*laneH+2+ry0,yB:(i+1)*laneH-2-ry0,dir:i%2?-1:1})}
  /* dirt: mirrored tile pattern + gentle tone variation */
  dirtC=document.createElement('canvas');dirtC.width=cv.width;dirtC.height=cv.height;var d=dirtC.getContext('2d');
  var ts=Math.round(512*dpr),tile=mirrorTile(imgD,ts);d.fillStyle=d.createPattern(tile,'repeat');d.fillRect(0,0,dirtC.width,dirtC.height);
  var rg=d.createRadialGradient(dirtC.width*.5,dirtC.height*.5,dirtC.height*.1,dirtC.width*.5,dirtC.height*.5,dirtC.width*.7);rg.addColorStop(0,'rgba(255,200,140,.07)');rg.addColorStop(1,'rgba(0,0,0,.28)');d.fillStyle=rg;d.fillRect(0,0,dirtC.width,dirtC.height);
  /* grass: full-stage sod, slightly different tone per lane, thin seams at lane edges */
  grassC=document.createElement('canvas');grassC.width=cv.width;grassC.height=cv.height;var s=grassC.getContext('2d');
  var gs=Math.round(420*dpr),gt=mirrorTile(imgG,gs);s.fillStyle=s.createPattern(gt,'repeat');s.fillRect(0,0,grassC.width,grassC.height);
  lanes.forEach(function(L,i){
   if(i%2){s.fillStyle='rgba(0,30,0,.10)';s.fillRect(0,L.y0*dpr,grassC.width,laneH*dpr)}
   /* sod piece seams */
   var pl=Math.max(160,r0*3.1),off=(i*97)%pl;
   for(var x=-off;x<CW;x+=pl){s.fillStyle='rgba(10,30,5,.45)';s.fillRect(x*dpr,L.sA*dpr,1.5*dpr,(L.sB-L.sA)*dpr);s.fillStyle='rgba(190,230,120,.18)';s.fillRect((x+1.5)*dpr,L.sA*dpr,1*dpr,(L.sB-L.sA)*dpr)}
  });
  buildMsg();
  draw(cur)
 }
 function sm(t){return t<0?0:t>1?1:t*t*(3-2*t)}
 function rad(l){return Math.sqrt(r0*r0-(r0*r0-rc*rc)*Math.min(1,l/Ltot))}
 function drawLane(L,i,q){
  var yA=L.yA,yB=L.yB,len=yB-yA,dir=L.dir;
  var l=q*Ltot*1.07;var r=rad(l),ry=r*0.26;
  var cx=x0+l;                       /* lane-space centre of the roll */
  var sx=dir>0?cx:CW-cx;             /* screen x */
  var laidW=Math.min(cx,CW);
  var S=dpr;
  /* laid sod (revealed from the grass layer) */
  if(laidW>0){
   var gx=dir>0?0:CW-laidW;
   var sA=L.sA,sB=L.sB;
   g.drawImage(grassC,gx*S,sA*S,laidW*S,(sB-sA)*S,gx,sA,laidW,sB-sA);
   var eg=g.createLinearGradient(0,sA,0,sA+7);eg.addColorStop(0,'rgba(0,0,0,.5)');eg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=eg;g.fillRect(gx,sA,laidW,7);
   eg=g.createLinearGradient(0,sB-7,0,sB);eg.addColorStop(0,'rgba(0,0,0,0)');eg.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=eg;g.fillRect(gx,sB-7,laidW,7);
   /* leading edge of the laid sod, a thin dark lip along the screen edge it ends at */
  }
  if(r<=rc*1.02&&l>Ltot*1.04&&q>0.995){return}
  /* shadow cast by the roll (light from upper left) */
  var sw=r*1.7;
  var sg=g.createLinearGradient(sx-r,0,sx+r+sw,0);
  var k0=0,k1=(2*r)/(2*r+sw);
  sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(Math.max(0.001,k1*0.55),'rgba(0,0,0,.30)');sg.addColorStop(k1,'rgba(0,0,0,.42)');sg.addColorStop(1,'rgba(0,0,0,0)');
  g.save();g.beginPath();g.rect(0,L.y0,CW,laneH);g.clip();
  g.fillStyle=sg;g.beginPath();g.ellipse(sx+r*0.35+sw*0.15,(yA+yB)/2+r*0.12,r+sw*0.5,(len/2)+ry*1.1,0,0,6.2832);g.fill();
  g.restore();
  /* roll body: cylinder-mapped grass slices */
  g.save();
  g.beginPath();g.rect(sx-r,yA,2*r,len);g.ellipse(sx,yA,r,ry,0,0,6.2832);g.rect(sx-r,yA,2*r,0);
  g.moveTo(sx+r,yB);g.ellipse(sx,yB,r,ry,0,0,6.2832);g.clip();
  var step=2,tw=CW;
  var x1=Math.max(sx-r,-4),x2=Math.min(sx+r,CW+4);
  for(var x=x1;x<x2;x+=step){
   var dxs=(x+step/2-sx)*dir;var a=Math.max(-.999,Math.min(.999,dxs/r));
   var th=Math.asin(a),arc=th*r-l;                    /* surface point, rolled by l */
   var tx=((arc%tw)+tw)%tw;
   var span=step/Math.max(0.25,Math.cos(th));
   var sxp=tx*0.0;
   /* sample from the roll texture band (use the lane's own grass strip) */
   var sxx=Math.floor((tx%Math.max(10,CW-span))*S);
   g.drawImage(grassC,Math.max(0,sxx),yA*S,Math.max(2,span*S),len*S,x,yA-ry,step+0.6,len+2*ry);
  }
  /* cylinder shading */
  var sh=g.createLinearGradient(sx-r,0,sx+r,0);
  sh.addColorStop(0,'rgba(0,12,0,.72)');sh.addColorStop(.18,'rgba(0,18,0,.28)');sh.addColorStop(.36,'rgba(230,255,170,.20)');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(.82,'rgba(0,12,0,.40)');sh.addColorStop(1,'rgba(0,8,0,.78)');
  if(dir<0){sh=g.createLinearGradient(sx+r,0,sx-r,0);sh.addColorStop(0,'rgba(0,12,0,.72)');sh.addColorStop(.18,'rgba(0,18,0,.28)');sh.addColorStop(.36,'rgba(230,255,170,.20)');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(.82,'rgba(0,12,0,.40)');sh.addColorStop(1,'rgba(0,8,0,.78)')}
  g.fillStyle=sh;g.fillRect(sx-r,yA-ry,2*r,len+2*ry);
  /* top end falls into shade */
  var tg=g.createLinearGradient(0,yA-ry,0,yA+ry*1.2);tg.addColorStop(0,'rgba(0,0,0,.4)');tg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=tg;g.fillRect(sx-r,yA-ry,2*r,ry*2.3);
  g.restore();
  /* end cap: the spiral cross-section (grass edge, soil, roots) */
  g.save();
  g.beginPath();g.ellipse(sx,yB,r,ry,0,0,6.2832);g.clip();
  g.fillStyle='#3a2616';g.fillRect(sx-r,yB-ry,2*r,2*ry);
  var th2=Math.max(3,(r0-rc)*0.9/Math.max(1,Math.round((r0-rc)/Math.max(8,r0*0.19))));
  var ring=0,rr=r;
  while(rr>rc*0.55){
   var w=th2;
   g.strokeStyle=ring%2?'#2f7d24':'#6b4a2a';g.fillStyle=ring%2?'#2f7d24':'#4a301a';
   g.lineWidth=Math.max(1.5,w*0.38);g.beginPath();g.ellipse(sx,yB,rr,rr*0.26,0,0,6.2832);g.stroke();
   rr-=w*0.5;if(rr<1)break;
   g.strokeStyle='rgba(120,85,50,.55)';g.lineWidth=Math.max(1,w*0.18);g.beginPath();g.ellipse(sx,yB,rr,rr*0.26,0,0,6.2832);g.stroke();
   rr-=w*0.5;ring++;if(rr<1)break;
  }
  var cg=g.createRadialGradient(sx,yB,0,sx,yB,Math.max(2,rc*0.8));cg.addColorStop(0,'rgba(20,10,4,.9)');cg.addColorStop(1,'rgba(20,10,4,0)');g.fillStyle=cg;g.beginPath();g.ellipse(sx,yB,rc*.8,rc*.8*.26,0,0,6.2832);g.fill();
  var cs=g.createLinearGradient(sx-r,0,sx+r,0);cs.addColorStop(0,'rgba(0,0,0,.45)');cs.addColorStop(.4,'rgba(255,230,190,.12)');cs.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=cs;g.fillRect(sx-r,yB-ry,2*r,2*ry);
  g.restore();
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.2;g.beginPath();g.ellipse(sx,yB,r,ry,0,0,6.2832);g.stroke();
 }

 /* ---------- mow phase: a mower drives across the finished lawn as you scroll, cutting stripes that reveal the message ---------- */
 /* RATING: Houzz shows Frost Landscape at 5.0 (frostlandscape listing on houzz.com, seen Nov 2026). Google rating/count NOT verified, VERIFY before using. */
 var RATING_LINE='★★★★★  5.0 on Houzz';
 var ROWS=5,msgC;
 function buildMsg(){
  msgC=document.createElement('canvas');msgC.width=cv.width;msgC.height=cv.height;var m=msgC.getContext('2d');m.setTransform(dpr,0,0,dpr,0,0);
  var big=Math.min(CW*0.115,CH*0.2);m.font='800 '+big+'px Fraunces,Georgia,serif';var tw=m.measureText('FROST LANDSCAPE').width;if(tw>CW*0.9)big=big*CW*0.9/tw;
  m.textAlign='center';m.textBaseline='middle';
  function line(t,y,size,w,color){m.font=w+' '+size+'px Fraunces,Georgia,serif';m.fillStyle='rgba(0,25,0,.55)';m.fillText(t,CW/2+3,y+4);m.fillStyle=color;m.fillText(t,CW/2,y)}
  var cy=CH*0.36;
  line('FROST LANDSCAPE',cy,big,'800','#fffbe6');
  line(RATING_LINE,cy+big*0.92,Math.max(18,big*0.42),'800','#ffd45a');
  line('Making the Valley green since 2002',cy+big*1.5,Math.max(14,big*0.22),'600','#f1ffe6');
 }
 var DECK=function(){return CH/ROWS};
 function mowPos(q){ /* q 0..1 along the whole mow route; returns x,y,heading */
  var rh=DECK(),r=Math.min(ROWS-1,Math.floor(q*ROWS)),t=q*ROWS-r;if(q>=1){r=ROWS-1;t=1}
  var dir=r%2?-1:1,mw=rh*0.55;
  var xs=function(tt){var u=dir>0?tt:1-tt;return -mw+u*(CW+2*mw)};
  var y=(r+0.5)*rh,x=xs(Math.max(0,(t-0.0)));
  if(r>0&&t<0.1){var u=t/0.1;var py=(r-0.5)*rh;y=py+(y-py)*u;x=xs(0)}
  else if(r>0){x=xs((t-0.1)/0.9)}
  else x=xs(t);
  return {x:x,y:y}
 }
 function drawMow(q){
  var rh=DECK(),S=dpr;
  /* mowed region per row: grass looks cut, lighter, with alternating stripe tone, and the message shows through */
  for(var r=0;r<ROWS;r++){
   var qr=Math.min(1,Math.max(0,q*ROWS-r));
   if(qr<=0)continue;var dir=r%2?-1:1;
   var u=r>0?Math.max(0,(qr-0.1)/0.9):qr;
   var cov=Math.min(1,u)*(CW+rh*0.55)-rh*0.27;cov=Math.max(0,Math.min(CW,cov));
   if(cov<=0)continue;
   var x=dir>0?0:CW-cov,y=r*rh;
   g.save();g.beginPath();g.rect(x,y,cov,rh);g.clip();
   g.fillStyle=r%2?'rgba(215,255,140,.46)':'rgba(150,230,90,.30)';g.fillRect(x,y,cov,rh);
   var sh=g.createLinearGradient(0,y,0,y+rh);sh.addColorStop(0,'rgba(0,30,0,.25)');sh.addColorStop(.12,'rgba(0,0,0,0)');sh.addColorStop(.88,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,30,0,.3)');g.fillStyle=sh;g.fillRect(x,y,cov,rh);
   g.setTransform(1,0,0,1,0,0);g.drawImage(msgC,0,0);g.setTransform(S,0,0,S,0,0);
   g.restore();
  }
  /* clippings flying out of the side chute, driven by progress so it reverses cleanly */
  var P=mowPos(q),P2=mowPos(Math.max(0,q-0.002)),hd=Math.atan2(P.y-P2.y,P.x-P2.x);
  if(!(P.x===P2.x&&P.y===P2.y)){hd=Math.atan2(P.y-P2.y,P.x-P2.x)}
  var side=hd+Math.PI/2;
  for(var i=0;i<46;i++){
   var back=i/46*0.012,Q=mowPos(Math.max(0,q-back)),h1=(i*2654435761>>>0)%1000/1000,h2=(i*40503>>>0)%977/977;
   var d=rh*(0.18+h1*0.5),life=1-i/46;
   var px=Q.x+Math.cos(side)*d+Math.cos(hd)*(-h2*rh*0.2),py=Q.y+Math.sin(side)*d+Math.sin(hd)*(-h2*rh*0.2);
   if(px<-4||px>CW+4)continue;
   g.globalAlpha=life*0.9;g.fillStyle=i%3?'#7fd44a':'#c9f08a';g.save();g.translate(px,py);g.rotate(h1*6);g.fillRect(-2.5,-0.8,5,1.6);g.restore()
  }
  g.globalAlpha=1;
  drawMower(P.x,P.y,hd,rh)
 }
 function drawMower(x,y,hd,rh){
  var w=rh*0.8,l=rh*0.82;
  g.save();g.translate(x,y);g.rotate(hd);
  g.fillStyle='rgba(0,0,0,.35)';rr(-l*.5+6,-w*.5+8,l,w,10);g.fill();
  /* grass bag at the back */
  g.fillStyle='#4b5560';rr(-l*.78,-w*.3,l*.34,w*.6,8);g.fill();g.fillStyle='rgba(255,255,255,.12)';rr(-l*.76,-w*.28,l*.3,w*.12,6);g.fill();
  /* handle */
  g.strokeStyle='#22272d';g.lineWidth=Math.max(3,rh*0.03);g.beginPath();g.moveTo(-l*.4,-w*.28);g.lineTo(-l*.95,-w*.4);g.moveTo(-l*.4,w*.28);g.lineTo(-l*.95,w*.4);g.moveTo(-l*.95,-w*.4);g.lineTo(-l*.95,w*.4);g.stroke();
  /* deck */
  var dg=g.createLinearGradient(0,-w*.5,0,w*.5);dg.addColorStop(0,'#ec4a34');dg.addColorStop(.5,'#c9301d');dg.addColorStop(1,'#8f1f12');
  g.fillStyle=dg;rr(-l*.5,-w*.5,l,w,12);g.fill();g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.5;g.stroke();
  /* wheels */
  g.fillStyle='#14181c';[[-l*.32,-w*.54],[-l*.32,w*.54-6],[l*.3,-w*.54],[l*.3,w*.54-6]].forEach(function(p){rr(p[0]-l*.1,p[1],l*.2,6,3);g.fill()});
  /* engine cap */
  var eg=g.createRadialGradient(-l*.05,-w*.06,2,-l*.05,0,w*.26);eg.addColorStop(0,'#e8ecef');eg.addColorStop(1,'#7c858d');
  g.fillStyle=eg;g.beginPath();g.arc(-l*.05,0,w*.24,0,6.2832);g.fill();g.strokeStyle='rgba(0,0,0,.4)';g.stroke();
  g.fillStyle='rgba(255,255,255,.35)';rr(-l*.45,-w*.46,l*.9,w*.07,4);g.fill();
  g.restore()
 }
 function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
 function draw(p){
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  g.drawImage(dirtC,0,0);
  g.setTransform(dpr,0,0,dpr,0,0);
  /* the grass drawImage uses device px for the source and css px for the destination, so reset scale per call */
  for(var i=0;i<LANES;i++){
   var ps=Math.min(1,p/0.5);var q=sm(Math.min(1,Math.max(0,ps*LANES-i)));
   /* linear feel: blend smoothstep with linear so scroll maps 1:1 mid-lane */
   q=0.35*q+0.65*Math.min(1,Math.max(0,ps*LANES-i));
   drawLane(lanes[i],i,q)
  }
  if(p>0.5)drawMow(Math.min(1,(p-0.5)/0.43));
  /* overall light falloff for depth */
  var v=g.createLinearGradient(0,0,0,CH);v.addColorStop(0,'rgba(0,0,0,.18)');v.addColorStop(.5,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=v;g.fillRect(0,0,CW,CH);
  hud(p)
 }
 function hud(p){
  if(barEl)barEl.style.width=Math.round(p*100)+'%';
  if(capEl)capEl.textContent=p<0.02?'Bare dirt. Fresh sod on the way.':p<0.5?'Rolling out the sod':p<0.93?'Mowing the stripes':'Fresh cut.';
  if(hintEl)hintEl.style.opacity=p<0.03?.9:0;
  if(cardEl)cardEl.classList.toggle('compact',p>0.04&&p<0.995);
 }
 function progress(){
  var r=host.getBoundingClientRect(),total=host.offsetHeight-stage.offsetHeight;
  return total<=0?1:Math.min(1,Math.max(0,-r.top/total))
 }
 function tick(){raf=0;cur+=(tgt-cur)*0.22;if(Math.abs(tgt-cur)<0.0004)cur=tgt;draw(cur);if(cur!==tgt)raf=requestAnimationFrame(tick)}
 function onScroll(){tgt=reduce?1:progress();if(reduce){cur=1;draw(1);return}if(!raf)raf=requestAnimationFrame(tick)}
 function init(){
  layout();tgt=cur=reduce?1:progress();draw(cur);document.documentElement.classList.add('lawn-on');
  addEventListener('scroll',onScroll,{passive:true});
  var t;addEventListener('resize',function(){clearTimeout(t);t=setTimeout(function(){layout();onScroll()},150)});
  window.__lawn={set:function(v){tgt=cur=v;draw(v)},get p(){return cur}};
 }
})();
