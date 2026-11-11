/* Hakes cinematic concept. Everything is ambient (CSS loops, canvas dust) or driven by scroll. No clicks or drags needed. */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var vh=function(){return window.innerHeight};
 function clamp(v){return v<0?0:v>1?1:v}
 function ease(t){t=clamp(t);return t*t*(3-2*t)}

 /* hero dust: warm light motes drifting up through the room. Pauses when off screen. */
 var cv=document.getElementById('dust'),hero=document.getElementById('top'),visible=true,raf=0;
 if(cv&&!reduce){
  var ctx=cv.getContext('2d'),W=0,H=0,dpr=Math.min(devicePixelRatio||1,2),P=[],N=innerWidth<860?26:60;
  var size=function(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  size();addEventListener('resize',size);
  for(var i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),r:Math.random()*1.8+.5,s:Math.random()*.00006+.00002,d:Math.random()*.00003-.000015,a:Math.random()*.5+.15,t:Math.random()*6.28});
  var last=0;
  var frame=function(ts){
   raf=0;if(!visible)return;
   var dt=Math.min(40,ts-last||16);last=ts;
   ctx.clearRect(0,0,W,H);
   for(var i=0;i<N;i++){var p=P[i];p.y-=p.s*dt;p.x+=p.d*dt+Math.sin(ts*.0004+p.t)*.00004*dt;p.t+=.001*dt;
    if(p.y<-.02){p.y=1.02;p.x=Math.random()}
    var tw=.6+.4*Math.sin(ts*.0013+p.t*3);
    var g=ctx.createRadialGradient(p.x*W,p.y*H,0,p.x*W,p.y*H,p.r*4);
    g.addColorStop(0,'rgba(255,232,190,'+(p.a*tw)+')');g.addColorStop(1,'rgba(255,232,190,0)');
    ctx.fillStyle=g;ctx.fillRect(p.x*W-p.r*4,p.y*H-p.r*4,p.r*8,p.r*8)}
   raf=requestAnimationFrame(frame)};
  new IntersectionObserver(function(e){visible=e[0].isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(frame)}).observe(hero);
  raf=requestAnimationFrame(frame);
 }

 /* scroll-driven pieces */
 var nav=document.getElementById('nav');var media=document.getElementById('heroMedia'),heroIn=document.getElementById('heroIn'),cue=document.getElementById('cue');
 var svc=[].slice.call(document.querySelectorAll('#svcList li'));
 var cards=[].slice.call(document.querySelectorAll('.card'));
 var wipe=document.getElementById('wipe'),baA=document.getElementById('baA'),baE=document.getElementById('baE');
 var rev=document.getElementById('quote-text');
 var words=[];
 if(rev){var txt=rev.textContent;rev.setAttribute('aria-label',txt);rev.innerHTML=txt.split(/\s+/).map(function(w){return '<span aria-hidden="true">'+w.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'}).join(' ');words=[].slice.call(rev.children)}
 function update(){
  var y=window.scrollY,h=vh();nav.classList.toggle('solid',y>h*.7);
  /* hero: background drifts slower than the page, headline lifts and fades */
  if(y<h*1.2){var p=clamp(y/h);media.style.setProperty('--py',(y*.28)+'px');
   if(!reduce){heroIn.style.setProperty('--hy',(-y*.18)+'px');heroIn.style.setProperty('--ho',1-clamp(p*1.5))}}
  /* services: each word slides in and lights up as it nears the middle of the screen */
  if(!reduce)svc.forEach(function(li){var r=li.getBoundingClientRect(),c=r.top+r.height/2,t=1-Math.abs(c-h*.52)/(h*.42);t=ease(t);
   li.style.setProperty('--o',(.2+.8*t).toFixed(3));li.style.setProperty('--x',((1-t)*-48).toFixed(1)+'px');li.style.setProperty('--s',t.toFixed(3))});
  /* project cards: rise open, photo drifts inside */
  if(!reduce)cards.forEach(function(cd){var r=cd.getBoundingClientRect();
   var a=ease((h*.98-r.top)/(h*.5));cd.style.setProperty('--r',a.toFixed(3));
   var q=clamp((h-r.top)/(h+r.height));cd.style.setProperty('--ty',((.5-q)*r.height*.1).toFixed(1)+'px')});
  /* carpet to oak wipe, pinned, with a glowing slanted edge */
  var wr=wipe.getBoundingClientRect(),tot=wipe.offsetHeight-h,wp=tot>0?clamp(-wr.top/tot):0;
  var w=reduce?(wp>.5?1:0):ease((wp-.08)/.72),s=4,x=w*(100+2*s)-s;
  baA.style.clipPath='polygon(0 0,'+(x+s)+'% 0,'+(x-s)+'% 100%,0 100%)';
  baE.style.left=x+'%';baE.style.opacity=(w>.01&&w<.99)?1:0;
  /* review words */
  if(words.length&&!reduce){var rr=rev.getBoundingClientRect(),q2=clamp((h*.85-rr.top)/(h*.4+rr.height*.45));
   var n=words.length,pos=q2*(n+6);words.forEach(function(sp,i){var t=clamp((pos-i)/4);sp.style.setProperty('--o',(.18+.82*t).toFixed(3))})}
 }
 var ticking=0;function on(){if(!ticking){ticking=1;requestAnimationFrame(function(){ticking=0;update()})}}
 addEventListener('scroll',on,{passive:true});addEventListener('resize',on);
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(on);
 update();

 /* fade-up for the contact block */
 var rv=[].slice.call(document.querySelectorAll('.visit-l,.form'));rv.forEach(function(e){e.classList.add('reveal')});
 if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});rv.forEach(function(e){io.observe(e)})}else rv.forEach(function(e){e.classList.add('in')});

 /* demo booking form: name, address, email and phone are collected and all four show in the confirmation and the calendar event */
 var f=document.getElementById('qf'),out=document.getElementById('qout'),err=document.getElementById('qerr');
 var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
 document.getElementById('qfill').onclick=function(){f.name.value='Jordan M.';f.phone.value='(555) 010-0177';f.email.value='jordan@example.com';f.address.value='123 Example St, Lehi, UT'};
 f.onsubmit=function(e){e.preventDefault();var d={},miss=[];['name','address','email','phone'].forEach(function(k){d[k]=f[k].value.trim();if(!d[k])miss.push(k)});
  if(miss.length){err.textContent='Please add your '+miss.join(', ')+'.';return}
  if(!/^\S+@\S+\.\S+$/.test(d.email)){err.textContent='That email looks off.';return}
  err.textContent='';var sl=f.slot.value;
  out.innerHTML='<div class="conf"><b>Estimate booked (demo)</b><br>'+esc(sl)+'<br>Name: '+esc(d.name)+'<br>Address: '+esc(d.address)+'<br>Email: '+esc(d.email)+'<br>Phone: '+esc(d.phone)+'</div><div class="cal"><b>Calendar event</b><br>Hakes Flooring: free in-home estimate<br>'+esc(sl)+'<br>'+esc(d.name)+' · '+esc(d.phone)+'<br>'+esc(d.address)+' · '+esc(d.email)+'</div><p class="fine">Demo only. Nothing is sent or stored.</p>'};
})();
