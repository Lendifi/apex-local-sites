/* GOOCH showpiece: tachometer scroll gauge (optional sound, off by default), pinned truck with parts that
   light up in turn, and an off-road section where mud splats the screen and a wiper clears it. Scroll-driven only. */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function prog(el){var r=el.getBoundingClientRect(),st=el.querySelector('.stage'),tot=el.offsetHeight-st.offsetHeight;return tot<=0?0:Math.min(1,Math.max(0,-r.top/tot))}
 function sm(a,b,x){x=(x-a)/(b-a);x=x<0?0:x>1?1:x;return x*x*(3-2*x)}
 /* ----- nav height var for sticky stages ----- */
 var nav=document.querySelector('.nav');function setNav(){document.documentElement.style.setProperty('--navh',nav.offsetHeight+'px')}setNav();addEventListener('resize',setNav);
 /* ----- truck ----- */
 var truck=document.getElementById('truck'),parts=[].slice.call(document.querySelectorAll('#truckSvg .part')),twords=[].slice.call(document.querySelectorAll('#tWords span')),tlist=document.getElementById('tList'),tcount=document.getElementById('tCount');
 var MAP={engine:['Diesel Repair','Engine Rebuilds and Replacements','Transmission Work','Diagnostics and Electrical'],tires:['Brakes','Oil Change and Maintenance','Off-Road Builds and Installs','Pre-Purchase Inspections'],suspension:['Shock Rebuilds and Recharge','Lift and Level Kits','Diff Gear Swaps and Lockers','Custom Fabrication and Welding']};
 var KEYS=['engine','tires','suspension'],lastT=-1;
 function setTruck(i){lastT=i;parts.forEach(function(e){e.classList.toggle('on',e.dataset.part===KEYS[i])});twords.forEach(function(e,k){e.classList.toggle('on',k===i)});tcount.textContent='0'+(i+1)+' / 03';
  tlist.innerHTML=MAP[KEYS[i]].map(function(n){var d=(SVC.filter(function(s){return s[0]===n})[0]||[])[1]||'';return '<li><b>'+esc(n)+'</b><span>'+esc(d)+'</span></li>'}).join('');
  [].forEach.call(tlist.children,function(li,k){setTimeout(function(){li.classList.add('in')},60+k*90)})}
 setTruck(0);
 /* ----- mud + wiper ----- */
 var off=document.getElementById('offroad'),mc=document.getElementById('mudCv'),mg=mc.getContext('2d'),cap=document.getElementById('offCap'),CW,CH,dpr,splats=[];
 function rngf(seed){var s=seed;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function mudSize(){var r=mc.getBoundingClientRect();CW=Math.round(r.width);CH=Math.round(r.height);dpr=Math.min(devicePixelRatio||1,1.75);mc.width=Math.round(CW*dpr);mc.height=Math.round(CH*dpr);
  var R=rngf(31),cols=CW<700?3:5,rows=CW<700?5:3;splats=[];var cw=CW/cols,rh=CH/rows,k=0;
  for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){var o=[];for(var a=0;a<14;a++)o.push(.62+R()*.5);var sat=[];for(a=0;a<22;a++)sat.push([R()*6.28,1.1+R()*1.5,.03+R()*.1]);
   splats.push({x:(i+.15+R()*.7)*cw,y:(j+.15+R()*.7)*rh,r:Math.max(cw,rh)*(.3+R()*.26),o:o,sat:sat,t:0.05+((k*7)%(cols*rows))/(cols*rows)*0.42,drip:.3+R()*.7,rot:R()*6.28});k++}}
 function blob(s,sc){var n=s.o.length,r=s.r*sc,pts=[];for(var i=0;i<n;i++){var a=i/n*6.2832+s.rot;pts.push([s.x+Math.cos(a)*r*s.o[i],s.y+Math.sin(a)*r*s.o[i]])}
  mg.beginPath();mg.moveTo((pts[0][0]+pts[n-1][0])/2,(pts[0][1]+pts[n-1][1])/2);for(i=0;i<n;i++){var p=pts[i],q=pts[(i+1)%n];mg.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}mg.closePath()}
 function rays(s,sc,t){mg.fillStyle='#4d321c';s.sat.slice(0,9).forEach(function(d,k){var a=d[0]+s.rot,len=s.r*(1.5+d[1]*.55)*Math.min(1,t)*sc,w=s.r*(.05+d[2]*.5);var x0=s.x+Math.cos(a)*s.r*.5,y0=s.y+Math.sin(a)*s.r*.5;
   mg.beginPath();mg.moveTo(x0+Math.cos(a+1.57)*w,y0+Math.sin(a+1.57)*w);mg.lineTo(s.x+Math.cos(a)*len,s.y+Math.sin(a)*len);mg.lineTo(x0+Math.cos(a-1.57)*w,y0+Math.sin(a-1.57)*w);mg.closePath();mg.fill();
   mg.beginPath();mg.arc(s.x+Math.cos(a)*len,s.y+Math.sin(a)*len,w*.7,0,6.2832);mg.fill()})}
 function eob(t){t=t<0?0:t>1?1:t;var c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)}
 function drawMud(p){
  mg.setTransform(1,0,0,1,0,0);mg.clearRect(0,0,mc.width,mc.height);mg.setTransform(dpr,0,0,dpr,0,0);
  splats.forEach(function(s){
   var t=(p-s.t)/0.04;if(t<=0)return;var sc=eob(t);if(sc<=0)return;
   var g=mg.createRadialGradient(s.x-s.r*.2,s.y-s.r*.25,s.r*.1,s.x,s.y,s.r*sc);g.addColorStop(0,'#4a2f1a');g.addColorStop(.7,'#563620');g.addColorStop(1,'#3a2413');
   mg.globalAlpha=.97;
   /* drips run down slowly as you scroll */
   var dl=Math.min(1,Math.max(0,(p-s.t-.03)/.35))*s.r*s.drip*1.2;
   if(dl>2){mg.fillStyle='#4a2f1b';for(var d=-1;d<=1;d+=1){var dx=s.x+d*s.r*.28,w=Math.max(3,s.r*.06);mg.beginPath();mg.moveTo(dx-w,s.y);mg.lineTo(dx+w,s.y);mg.lineTo(dx+w*.6,s.y+s.r*.4+dl*(1-Math.abs(d)*.3));mg.arc(dx,s.y+s.r*.4+dl*(1-Math.abs(d)*.3),w*.8,0,3.1416);mg.lineTo(dx-w*.6,s.y+s.r*.4);mg.closePath();mg.fill()}}
   rays(s,sc,t);mg.fillStyle=g;blob(s,sc);mg.fill();
   s.sat.forEach(function(d){var rr=s.r*d[2]*Math.min(1,t);mg.beginPath();mg.arc(s.x+Math.cos(d[0])*s.r*d[1]*sc,s.y+Math.sin(d[0])*s.r*d[1]*sc,rr,0,6.2832);mg.fillStyle='#4d321c';mg.fill()});
   mg.globalAlpha=.16;mg.fillStyle='#fff';mg.beginPath();mg.ellipse(s.x-s.r*.25*sc,s.y-s.r*.3*sc,s.r*.12*sc,s.r*.045*sc,-.6,0,6.2832);mg.fill();mg.globalAlpha=1
  });
  /* wiper: sweeps left to right (smearing), then right to left (clearing) */
  var px=CW*.5,py=CH*1.04,R=Math.hypot(CW,CH)*1.05,th;
  var s1=sm(.5,.72,p),s2=sm(.74,.94,p);
  var a1=Math.PI+s1*Math.PI,a2=2*Math.PI-s2*Math.PI;
  if(p>.5){
   mg.globalCompositeOperation='destination-out';
   if(s1>0){mg.fillStyle='rgba(0,0,0,.72)';mg.beginPath();mg.moveTo(px,py);mg.arc(px,py,R,Math.PI,a1);mg.closePath();mg.fill()}
   if(s2>0){mg.fillStyle='rgba(0,0,0,1)';mg.beginPath();mg.moveTo(px,py);mg.arc(px,py,R,a2,2*Math.PI);mg.closePath();mg.fill()}
   mg.globalCompositeOperation='source-over';
   th=p<.73?a1:a2;
   var L=Math.min(CH*1.0,Math.hypot(CW*.5,CH));var ex=px+Math.cos(th)*L,ey=py+Math.sin(th)*L;
   mg.lineCap='round';mg.strokeStyle='#0b0b0b';mg.lineWidth=9;mg.beginPath();mg.moveTo(px,py);mg.lineTo(ex,ey);mg.stroke();
   mg.strokeStyle='#222';mg.lineWidth=3;mg.beginPath();mg.moveTo(px,py);mg.lineTo(ex,ey);mg.stroke();
   var bl=L*.62,bx=px+Math.cos(th)*(L-bl),by=py+Math.sin(th)*(L-bl);
   mg.strokeStyle='#111';mg.lineWidth=7;mg.beginPath();mg.moveTo(bx,by);mg.lineTo(ex,ey);mg.stroke();
   mg.strokeStyle='rgba(255,255,255,.18)';mg.lineWidth=1.5;mg.beginPath();mg.moveTo(bx,by);mg.lineTo(ex,ey);mg.stroke();
  }
  cap.textContent=p<.07?'Hold on...':p<.5?'Mud!':p<.94?'Wipers on':'Clean';
 }
 /* ----- tachometer ----- */
 var tach=document.getElementById('tach'),tc=document.getElementById('tachCv'),tg=tc.getContext('2d'),rpmEl=document.getElementById('tachRpm'),sndB=document.getElementById('snd');
 var rpm=900,rpmT=900,ac=null,osc,gain,lp,soundOn=false;
 function rpmFor(p){var seg=Math.min(4,Math.floor(p*5)),fr=Math.min(1,p*5-seg);return 1000+4400*fr+seg*350+(p<.002?-100:0)}
 function drawTach(){
  var S=220,c=S/2,r0=96;tg.clearRect(0,0,S,S);
  var A0=Math.PI*.75,A1=Math.PI*2.25,V=8000;function ang(v){return A0+(A1-A0)*v/V}
  var rg=tg.createRadialGradient(c,c,10,c,c,r0+8);rg.addColorStop(0,'#23282c');rg.addColorStop(1,'#0c0e10');tg.fillStyle=rg;tg.beginPath();tg.arc(c,c,r0+8,0,6.2832);tg.fill();
  tg.lineWidth=5;tg.strokeStyle='#ff6a13';tg.beginPath();tg.arc(c,c,r0+4,0,6.2832);tg.stroke();
  /* redline zone */
  tg.lineWidth=8;tg.strokeStyle='#e0261c';tg.beginPath();tg.arc(c,c,r0-12,ang(6500),ang(8000));tg.stroke();
  tg.strokeStyle='#d9d9d9';
  for(var v=0;v<=8000;v+=500){var big=v%1000===0,a=ang(v),r1=r0-(big?30:22),r2=r0-6;tg.lineWidth=big?3:1.5;tg.strokeStyle=v>=6500?'#ff6b60':'#e6e6e6';tg.beginPath();tg.moveTo(c+Math.cos(a)*r1,c+Math.sin(a)*r1);tg.lineTo(c+Math.cos(a)*r2,c+Math.sin(a)*r2);tg.stroke();
   if(big){tg.fillStyle=v>=6500?'#ff6b60':'#fff';tg.font='800 17px Inter,sans-serif';tg.textAlign='center';tg.textBaseline='middle';tg.fillText(String(v/1000),c+Math.cos(a)*(r0-46),c+Math.sin(a)*(r0-46))}}
  tg.fillStyle='#ff8a45';tg.font='800 9px Inter,sans-serif';tg.fillText('x1000',c,c-30);
  /* needle */
  var an=ang(Math.min(8300,rpm));tg.save();tg.translate(c,c);tg.rotate(an);tg.shadowColor='rgba(255,60,20,.9)';tg.shadowBlur=10;
  tg.fillStyle='#ff3b1d';tg.beginPath();tg.moveTo(-14,-2.5);tg.lineTo(r0-12,-1);tg.lineTo(r0-12,1);tg.lineTo(-14,2.5);tg.closePath();tg.fill();tg.restore();
  tg.fillStyle='#111';tg.beginPath();tg.arc(c,c,10,0,6.2832);tg.fill();tg.strokeStyle='#ff6a13';tg.lineWidth=3;tg.stroke();
  rpmEl.textContent=Math.round(rpm/10)*10;tach.classList.toggle('red',rpm>7000&&!reduce)
 }
 sndB.onclick=function(){soundOn=!soundOn;sndB.textContent='Engine sound: '+(soundOn?'on':'off');sndB.setAttribute('aria-pressed',soundOn);
  if(soundOn){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(!osc){osc=ac.createOscillator();osc.type='sawtooth';gain=ac.createGain();lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;gain.gain.value=0;osc.connect(lp);lp.connect(gain);gain.connect(ac.destination);osc.start()}ac.resume();gain.gain.setTargetAtTime(.05,ac.currentTime,.1)}catch(e){soundOn=false}}
  else if(gain)gain.gain.setTargetAtTime(0,ac.currentTime,.08)};
 /* ----- main loop ----- */
 var raf=0,lastP={};
 function frame(){raf=0;
  var d=document.documentElement,m=d.scrollHeight-innerHeight,p=m>0?Math.min(1,Math.max(0,scrollY/m)):0;
  rpmT=rpmFor(p);var dr=rpmT-rpm;rpm+=dr*(reduce?1:.22);if(Math.abs(dr)<4)rpm=rpmT;
  drawTach();if(soundOn&&osc)osc.frequency.setTargetAtTime(30+rpm/60*2,ac.currentTime,.05);
  var tp=prog(truck),i=tp<.34?0:tp<.67?1:2;if(i!==lastT)setTruck(i);
  var op=prog(off);if(op!==lastP.o||lastP.w!==CW){lastP.o=op;lastP.w=CW;drawMud(op)}
  if(Math.abs(rpmT-rpm)>=4)raf=requestAnimationFrame(frame)
 }
 function kick(){if(!raf)raf=requestAnimationFrame(frame)}
 addEventListener('scroll',kick,{passive:true});addEventListener('resize',function(){mudSize();lastP={};kick()});
 mudSize();kick();window.__g={frame:frame};
})();
