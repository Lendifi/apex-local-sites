/* One yard, four seasons. Scroll-driven: winter, spring bloom (grass and flowers grow), fall color,
   then day turns to night and the landscape lights switch on one by one. */
(function(){
 var host=document.getElementById('seasons'),stage=document.getElementById('seasonStage'),frame=document.getElementById('sFrame'),cv=document.getElementById('sCv');
 if(!host||!cv)return;
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var imgs=[].slice.call(frame.querySelectorAll('img')),words=[].slice.call(document.querySelectorAll('#sWords span')),dots=[].slice.call(document.querySelectorAll('#sDots li')),note=document.getElementById('sNote');
 var NOTES=['Snow and ice management keeps lots and walks clear all winter.','Sod, beds, and planting come alive. Fresh growth, kept healthy.','Fall cleanup and care before the cold returns.','Outdoor lighting turns a finished yard into an evening one.'];
 /* light positions on the night photo (fractions of the 1024x768 image) */
 var LIGHTS=[[.375,.83],[.49,.795],[.615,.70],[.53,.65],[.43,.53],[.60,.60],[.835,.52],[.78,.60],[.47,.66],[.14,.93],[.32,.40],[.10,.30],[.19,.28],[.62,.57],[.86,.56],[.43,.51]];
 var g=cv.getContext('2d'),CW,CH,dpr,P=0,tgtP=0,raf=0,vis=true,t0=performance.now(),last=-1;
 function rngf(seed){var s=seed;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 var plants=[],flakes=[],petals=[],leaves=[];
 function size(){var r=frame.getBoundingClientRect();CW=Math.round(r.width);CH=Math.round(r.height);dpr=Math.min(devicePixelRatio||1,1.75);cv.width=Math.round(CW*dpr);cv.height=Math.round(CH*dpr);
  var R=rngf(77),n=Math.round(CW/16);plants=[];
  for(var i=0;i<n;i++){plants.push({x:(i+R()*0.8)/n*CW,h:CH*(0.10+R()*0.16),flower:R()<0.55,hue:[330,45,285,0,52][Math.floor(R()*5)],ph:R()*6.28,w:1.5+R()*1.5,lean:(R()-.5)*14})}
  flakes=[];for(i=0;i<110;i++)flakes.push({x:R()*CW,y:R()*CH,s:1+R()*2.6,v:30+R()*50,d:R()*6});
  petals=[];for(i=0;i<46;i++)petals.push({x:R()*CW,y:R()*CH,s:3+R()*4,v:24+R()*30,d:R()*6,c:R()<.5?'#ffd3e2':'#fff2f6'});
  leaves=[];for(i=0;i<46;i++)leaves.push({x:R()*CW,y:R()*CH,s:5+R()*6,v:34+R()*40,d:R()*6,c:['#d9531e','#e8932a','#b8341c','#f2b544'][Math.floor(R()*4)]});
 }
 function sm(a,b,x){x=(x-a)/(b-a);x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
 function prog(){var r=host.getBoundingClientRect(),tot=host.offsetHeight-stage.offsetHeight;return tot<=0?1:Math.min(1,Math.max(0,-r.top/tot))}
 /* map a point of the 1024x768 photo to the frame (object-fit cover) */
 function map(fx,fy){var ar=1024/768,fa=CW/CH,w,h,ox=0,oy=0;if(fa>ar){w=CW;h=CW/ar;oy=(CH-h)/2}else{h=CH;w=CH*ar;ox=(CW-w)/2}return [ox+fx*w,oy+fy*h,w]}
 function season(p){return p<.24?0:p<.5?1:p<.74?2:3}
 function draw(now){
  var p=P,t=(now-t0)/1000;
  /* crossfades: winter > spring > fall > night */
  var a1=sm(.17,.27,p),a2=sm(.43,.53,p),a3=sm(.68,.80,p);
  imgs[0].style.opacity=1;imgs[1].style.opacity=a1;imgs[2].style.opacity=a2;imgs[3].style.opacity=a3;
  var idx=season(p);if(idx!==last){last=idx;words.forEach(function(e,i){e.classList.toggle('on',i===idx)});dots.forEach(function(e,i){e.classList.toggle('on',i===idx)});note.textContent=NOTES[idx]}
  g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,CW,CH);
  /* snow, petals, leaves */
  var wi=1-sm(.2,.3,p);if(wi>0.01){g.fillStyle='rgba(255,255,255,'+(.85*wi)+')';flakes.forEach(function(f){var y=(f.y+t*f.v*(reduce?0:1))%CH,x=f.x+Math.sin(t*.8+f.d)*14*(reduce?0:1);g.beginPath();g.arc(x,y,f.s,0,6.2832);g.fill()})}
  var pet=sm(.2,.3,p)*(1-sm(.44,.52,p));if(pet>0.01)petals.forEach(function(f){var y=(f.y+t*f.v*(reduce?0:1))%CH,x=f.x+Math.sin(t*.7+f.d)*30*(reduce?0:1);g.globalAlpha=.85*pet;g.fillStyle=f.c;g.save();g.translate(x,y);g.rotate(t*.9+f.d);g.beginPath();g.ellipse(0,0,f.s,f.s*.55,0,0,6.2832);g.fill();g.restore()});
  var lf=sm(.44,.54,p)*(1-sm(.72,.8,p));if(lf>0.01)leaves.forEach(function(f){var y=(f.y+t*f.v*(reduce?0:1))%CH,x=f.x+Math.sin(t*.6+f.d)*40*(reduce?0:1);g.globalAlpha=.9*lf;g.fillStyle=f.c;g.save();g.translate(x,y);g.rotate(t*1.1+f.d);g.beginPath();g.ellipse(0,0,f.s,f.s*.5,0,0,6.2832);g.fill();g.restore()});
  g.globalAlpha=1;
  /* grass and flowers growing along the front edge of the yard through spring, ripening to gold in fall */
  var grow=sm(.2,.46,p);
  if(grow>0.005){
   var gold=sm(.5,.62,p);
   plants.forEach(function(pl,i){
    var gr=Math.min(1,Math.max(0,grow*1.25-(i%7)*0.03));if(gr<=0)return;
    var h=pl.h*gr,x=pl.x,y=CH+2,sway=Math.sin(t*1.3+pl.ph)*(reduce?0:3)*gr;
    /* blade */
    var gc=gold>0?'hsl('+(120-gold*70)+','+(55-gold*8)+'%,'+(32+gold*8)+'%)':'hsl(120,58%,32%)';
    g.strokeStyle=gc;g.lineWidth=pl.w;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+pl.lean*.4+sway,y-h*.55,x+pl.lean+sway,y-h);g.stroke();
    if(i%2===0){g.beginPath();g.moveTo(x+4,y);g.quadraticCurveTo(x+4-pl.lean*.3+sway,y-h*.5,x+4-pl.lean*.9+sway,y-h*.85);g.stroke()}
    if(pl.flower&&gr>0.62&&gold<0.7){
     var fs=(gr-.62)/.38,r=Math.max(2,CH*0.012)*fs*(1-gold),cx=x+pl.lean+sway,cy=y-h;
     g.globalAlpha=1-gold;
     for(var k=0;k<5;k++){var an=k/5*6.2832+pl.ph;g.fillStyle='hsl('+pl.hue+',80%,'+(pl.hue===52?62:58)+'%)';g.beginPath();g.ellipse(cx+Math.cos(an)*r*1.1,cy+Math.sin(an)*r*1.1,r,r*.8,an,0,6.2832);g.fill()}
     g.fillStyle='#ffe27a';g.beginPath();g.arc(cx,cy,r*.6,0,6.2832);g.fill();g.globalAlpha=1}
   });
  }
  /* day to night, then the lights come on one at a time */
  var nt=sm(.68,.8,p);
  if(nt>0.01){g.fillStyle='rgba(4,10,32,'+(.38*nt)+')';g.fillRect(0,0,CW,CH);
   /* stars */
   g.fillStyle='rgba(255,255,255,'+(.8*nt)+')';var R=rngf(5);for(var i=0;i<60;i++){var sx=R()*CW,sy=R()*CH*.3,tw=.5+.5*Math.sin(t*2+i);g.globalAlpha=nt*(.4+.6*tw*(reduce?1:1));g.fillRect(sx,sy,1.6,1.6)}g.globalAlpha=1}
  var m0=map(0,0);
  LIGHTS.forEach(function(L,i){var on=sm(.76+i*.012,.8+i*.012,p);if(on<=0.01)return;var m=map(L[0],L[1]),r=m[2]*(0.032+(i%3)*.01);
   g.globalCompositeOperation='lighter';var rg=g.createRadialGradient(m[0],m[1],0,m[0],m[1],r);rg.addColorStop(0,'rgba(255,200,110,'+(.65*on)+')');rg.addColorStop(.35,'rgba(255,170,70,'+(.28*on)+')');rg.addColorStop(1,'rgba(255,150,40,0)');g.fillStyle=rg;g.beginPath();g.arc(m[0],m[1],r,0,6.2832);g.fill();g.globalCompositeOperation='source-over'});
 }
 function loop(now){raf=0;var d=tgtP-P;if(Math.abs(d)>0.0004)P+=d*(reduce?1:.2);else P=tgtP;draw(now);if(vis&&(Math.abs(tgtP-P)>0.0004||(!reduce&&P<.8&&P>0.01)||(!reduce&&P>=0.2)))raf=requestAnimationFrame(loop)}
 function kick(){if(!raf)raf=requestAnimationFrame(loop)}
 function onScroll(){tgtP=prog();kick()}
 addEventListener('scroll',onScroll,{passive:true});
 addEventListener('resize',function(){size();onScroll()});
 new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)kick()},{threshold:0}).observe(host);
 function init(){size();tgtP=P=prog();draw(performance.now());kick();window.__seasons={set:function(v){tgtP=P=v;draw(performance.now())}}}
 if(document.readyState==='complete')init();else addEventListener('load',init);
})();
