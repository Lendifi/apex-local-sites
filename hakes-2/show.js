/* Hakes scroll showpiece: pinned before/after wipe, pinned floor picker, quote form. Scroll-driven only. */
(function(){
 var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 var nav=document.getElementById('nav');
 function setNav(){document.documentElement.style.setProperty('--navh',(nav.offsetHeight+(innerWidth<700?0:0))+'px')}
 /* the concept bar scrolls away, the fixed nav sits at the top */
 setNav();addEventListener('resize',setNav);
 function prog(el){var r=el.getBoundingClientRect(),tot=el.offsetHeight-innerHeight;return tot<=0?0:Math.min(1,Math.max(0,-r.top/tot))}
 var ba=document.getElementById('before-after'),fl=document.getElementById('floors');
 var baA=document.getElementById('baAfter'),baE=document.getElementById('baEdge'),baP=document.getElementById('baPct');
 var f2=document.querySelector('.f2'),f3=document.querySelector('.f3'),words=[].slice.call(document.querySelectorAll('#flWords span')),dots=[].slice.call(document.querySelectorAll('#flDots li')),note=document.getElementById('flNote');
 var NOTES=['Real wood with warmth that lasts for decades. Oak is a classic starting point.','Hickory brings bold grain and big color swings, board to board.','Luxury vinyl plank looks like wood and shrugs off spills and pets.'];
 var lastIdx=-1;
 function ease(t){return t<0?0:t>1?1:t*t*(3-2*t)}
 function update(){
  /* before / after: wipe left to right, a slanted plank edge leads the wipe */
  var p=prog(ba);var w=reduce?(p>.5?1:0):ease((p-.06)/.8);
  var s=4,x=w*(100+2*s)-s; /* % */
  baA.style.clipPath='polygon(0 0,'+(x+s)+'% 0,'+(x-s)+'% 100%,0 100%)';
  baE.style.left=x+'%';baE.style.opacity=(w>0.01&&w<0.99)?1:0;
  baP.textContent=Math.round(w*100)+'%';
  /* floor picker: oak, then hickory, then LVP, each swapped in with a rising wipe */
  var q=prog(fl);var a=ease((q-.28)/.12),b=ease((q-.62)/.12);
  f2.style.clipPath='inset('+(100-a*100)+'% 0 0 0)';f3.style.clipPath='inset('+(100-b*100)+'% 0 0 0)';
  var idx=q>=.62?2:q>=.28?1:0;
  if(idx!==lastIdx){lastIdx=idx;words.forEach(function(e,i){e.classList.toggle('on',i===idx)});dots.forEach(function(e,i){e.classList.toggle('on',i===idx)});note.textContent=NOTES[idx]}
 }
 var raf=0;function on(){if(!raf)raf=requestAnimationFrame(function(){raf=0;update()})}
 addEventListener('scroll',on,{passive:true});addEventListener('resize',on);update();
 /* demo booking form: all four contact fields are collected and shown in the confirmation and the calendar event */
 var f=document.getElementById('qf'),out=document.getElementById('qout'),err=document.getElementById('qerr');
 var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
 document.getElementById('qfill').onclick=function(){f.name.value='Jordan M.';f.phone.value='(555) 010-0177';f.email.value='jordan@example.com';f.address.value='123 Example St, Lehi, UT'};
 f.onsubmit=function(e){e.preventDefault();var d={};var miss=[];['name','address','email','phone'].forEach(function(k){d[k]=f[k].value.trim();if(!d[k])miss.push(k)});
  if(miss.length){err.textContent='Please add your '+miss.join(', ')+'.';return}
  if(!/^\S+@\S+\.\S+$/.test(d.email)){err.textContent='That email looks off.';return}
  err.textContent='';var sl=f.slot.value;
  out.innerHTML='<div class="conf"><b>✅ Estimate booked (demo)</b><br>'+esc(sl)+'<br>Name: '+esc(d.name)+'<br>Address: '+esc(d.address)+'<br>Email: '+esc(d.email)+'<br>Phone: '+esc(d.phone)+'</div><div class="cal"><b>📅 Calendar event</b><br>Hakes Flooring: free in-home estimate<br>'+esc(sl)+'<br>'+esc(d.name)+' · '+esc(d.phone)+'<br>'+esc(d.address)+' · '+esc(d.email)+'</div><p class="fine" style="color:#cdbca4;margin-top:8px">Demo only. Nothing is sent or stored.</p>'};
})();
