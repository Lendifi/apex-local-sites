(()=>{
 const rm=matchMedia('(prefers-reduced-motion: reduce)');
 const scenes=[...document.querySelectorAll('[data-scene]')];
 const nav=document.getElementById('nav');
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 let ticking=false;
 function update(){
  ticking=false;
  nav.classList.toggle('solid',scrollY>40);
  if(rm.matches) return;
  const vh=innerHeight;
  for(const s of scenes){
   const r=s.getBoundingClientRect();
   if(r.bottom<-vh||r.top>vh*2) continue;
   const p=clamp(-r.top/(r.height-vh));
   s.style.setProperty('--e',ease(clamp((p-.12)/.7)).toFixed(4));
  }
 }
 function onScroll(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
 function apply(){
  document.documentElement.classList.toggle('rm',rm.matches);
  if(rm.matches) scenes.forEach(s=>s.style.setProperty('--e',1));
  update();
 }
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
 rm.addEventListener?rm.addEventListener('change',apply):rm.addListener(apply);
 apply();
 const f=document.getElementById('quoteForm');
 f.addEventListener('submit',e=>{e.preventDefault();f.querySelector('.out').textContent='Thanks! On the live site this goes straight to Frost. (Demo: nothing was sent.)'});
})();
