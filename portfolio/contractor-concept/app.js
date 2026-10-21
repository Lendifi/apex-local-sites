(()=>{const R=matchMedia('(prefers-reduced-motion: reduce)').matches;
// grass blades
const g=document.querySelector('.blades');if(g){let s='';for(let x=0;x<1440;x+=7){const h=40+Math.random()*70,w=5+Math.random()*4;s+=`<path d="M${x} 120 Q${x+w/2} ${120-h} ${x+w+3} ${120-h-8} Q${x+w} ${120-h/2} ${x+w} 120Z" style="animation-delay:${(-Math.random()*3.6).toFixed(2)}s"/>`}g.innerHTML=s}
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%4)*80+'ms';R?el.classList.add('in'):io.observe(el)});
// counters
const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,t=+el.dataset.count,d=+(el.dataset.dec||0),t0=performance.now();co.unobserve(el);
const step=n=>{const p=R?1:Math.min((n-t0)/1400,1);el.textContent=(t*(1-Math.pow(1-p,3))).toFixed(d);if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
// parallax
const L=[...document.querySelectorAll('.layer[data-speed]')];if(!R){let tk=0;addEventListener('scroll',()=>{if(tk)return;tk=requestAnimationFrame(()=>{const y=scrollY;if(y<1200)L.forEach(l=>l.style.transform=`translate3d(0,${y*l.dataset.speed}px,0)`);tk=0})},{passive:true})}
// slider
document.querySelectorAll('.slider').forEach(s=>{const i=s.querySelector('input');i.addEventListener('input',()=>s.style.setProperty('--p',i.value+'%'))});
// builder (EXAMPLE pricing only)
const b=document.querySelector('.builder');if(b){const calc=()=>{const m=+b.querySelector('[name=lot]:checked').value;let lo=0;b.querySelectorAll('.opts input:checked').forEach(c=>lo+=+c.value*m);
const hi=lo*1.35,f=v=>'$'+Math.round(v/5)*5;document.getElementById('range').textContent=lo?`${f(lo)} to ${f(hi)}`:'$0';};b.addEventListener('change',calc);calc()}
// drag scroll
const h=document.querySelector('.hscroll');if(h){let d=0,x0,s0;h.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;d=1;x0=e.clientX;s0=h.scrollLeft;h.style.scrollSnapType='none'});addEventListener('pointerup',()=>{d=0;h.style.scrollSnapType=''});h.addEventListener('pointermove',e=>{if(d)h.scrollLeft=s0-(e.clientX-x0)})}
// cursor + magnetic
const c=document.querySelector('.cursor');if(c&&matchMedia('(pointer:fine)').matches&&!R){addEventListener('pointermove',e=>c.style.transform=`translate(${e.clientX}px,${e.clientY}px)`);
document.querySelectorAll('a,button,label,.svc').forEach(el=>{el.addEventListener('pointerenter',()=>c.classList.add('big'));el.addEventListener('pointerleave',()=>c.classList.remove('big'))});
document.querySelectorAll('.mag').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.3}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')})}
})();
