/* The Break mockup. Sample by Apex Lead Group. */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- HOURS (REAL, from their site footer) ---------- */
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const BAR={Sun:'10AM-12AM',Mon:'11AM-12AM',Tue:'11AM-12AM',Wed:'11AM-1AM',Thu:'11AM-1AM',Fri:'11AM-1AM',Sat:'10AM-1AM'}; // Tue listed as "11AM-12M" on their site, read as 12AM
const KIT={Sun:'10AM-10PM',Mon:'11AM-10PM',Tue:'11AM-10PM',Wed:'11AM-11PM',Thu:'11AM-11PM',Fri:'11AM-12AM',Sat:'10AM-12AM'};
const toMin=t=>{const m=t.match(/(\d+)(AM|PM)/);let h=+m[1]%12;if(m[2]==='PM')h+=12;return h*60};
const rng=s=>{const [a,b]=s.split('-');let o=toMin(a),c=toMin(b);if(c<=o)c+=1440;return[o,c]};
const fmt=t=>t.replace('12AM','midnight').replace(/(\d+)(AM|PM)/,(_,h,p)=>h+' '+p);
function denverNow(){
  const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());
  const g=k=>p.find(x=>x.type===k).value;return{d:DAYS.indexOf(g('weekday')),m:(+g('hour')%24)*60+ +g('minute')};
}
function status(tbl){
  const {d,m}=denverNow();
  for(const [off,dd] of [[0,d],[1440,(d+6)%7]]){ // today, or yesterday's late close
    const [o,c]=rng(tbl[DAYS[dd]]);const t=m+off;
    if(t>=o&&t<c){return{open:true,until:tbl[DAYS[dd]].split('-')[1]}}
  }
  const [o]=rng(tbl[DAYS[d]]);
  if(m<o) return{open:false,next:'today at '+tbl[DAYS[d]].split('-')[0]};
  return{open:false,next:DAYS[(d+1)%7]+' at '+tbl[DAYS[(d+1)%7]].split('-')[0]};
}
function paintStatus(){
  const b=status(BAR),k=status(KIT),{d}=denverNow();
  const nav=$('[data-status]'),card=$('[data-open-card]');
  [nav,card].forEach(el=>{el.classList.toggle('is-open',b.open);el.classList.toggle('is-closed',!b.open)});
  $('[data-status-text]').textContent=b.open?('Open now · til '+fmt(b.until)):'Closed · opens '+b.next.replace('today at ','');
  $('[data-open-title]').textContent=b.open?'Open now':'Closed right now';
  $('[data-open-sub]').textContent=b.open?('Bar until '+fmt(b.until)+(k.open?' · Kitchen until '+fmt(k.until):' · Kitchen closed for the night')):'Doors open '+b.next+' (Mountain Time)';
  $('[data-hours]').innerHTML=[1,2,3,4,5,6,0].map(i=>`<tr class="${i===d?'today':''}"><td>${DAYS[i]}</td><td>${fmt(BAR[DAYS[i]]).replace('-',' to ')}</td><td>${fmt(KIT[DAYS[i]]).replace('-',' to ')}</td></tr>`).join('');
  $$('[data-week] article').forEach(a=>a.classList.toggle('today',+a.dataset.day===d));
}
paintStatus();setInterval(paintStatus,60000);

/* ---------- HERO STAGE ---------- */
const plates=$$('.plate'),dots=$('[data-dots]'),word=$('[data-hero-word]');let cur=0,timer,RMstop=false;
plates.forEach((p,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Show '+p.querySelector('img').alt);b.onclick=()=>go(i,true);dots.appendChild(b)});
function go(i,user){
  plates[cur].classList.remove('is-on');cur=(i+plates.length)%plates.length;plates[cur].classList.add('is-on');
  $$('button',dots).forEach((b,j)=>{b.classList.remove('on');void b.offsetWidth;b.classList.toggle('on',j===cur)});
  word.classList.add('swap');setTimeout(()=>{word.textContent=plates[cur].dataset.word;word.classList.remove('swap')},300);
  if(!RM&&!RMstop){clearInterval(timer);timer=setInterval(()=>go(cur+1),5000)}
}
$('[data-prev]').onclick=()=>go(cur-1,true);$('[data-next]').onclick=()=>go(cur+1,true);
go(0);
window.breakHeroStop=()=>{clearInterval(timer);RMstop=true};
// tilt on pointer
const stage=$('[data-stage]');
if(!RM&&matchMedia('(pointer:fine)').matches){stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;$('.stage__plates').style.transform=`perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translate(${x*14}px,${y*14}px)`});stage.addEventListener('pointerleave',()=>$('.stage__plates').style.transform='')}
$('.stage__plates').style.transition='transform .6s cubic-bezier(.2,.8,.2,1)';

/* ticker + strip: duplicate content for seamless loop */
[$('[data-ticker]'),$('.strip__track')].forEach(t=>t.innerHTML+=t.innerHTML);

/* ---------- MENU ---------- */
const M=window.MENU||[];const CATS=['Favorites','Appetizers','Brunch','Burgers',"Mac n' Cheese",'Salads','Sandwiches','Desserts','All'];
const tabs=$('[data-tabs]'),grid=$('[data-grid]'),q=$('[data-search]');let cat='Favorites';
tabs.setAttribute('role','tablist');
CATS.forEach(c=>{const n=c==='All'?M.length:M.filter(x=>x.c===c).length;const b=document.createElement('button');b.className='tab';b.role='tab';b.innerHTML=`${c}<small>${n}</small>`;b.setAttribute('aria-selected',c===cat);b.onclick=()=>{cat=c;q.value='';$$('.tab').forEach(t=>t.setAttribute('aria-selected',t===b));render()};tabs.appendChild(b)});
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(){
  const term=q.value.trim().toLowerCase();
  let list=term?M.filter(x=>(x.n+' '+x.d+' '+x.c).toLowerCase().includes(term)):(cat==='All'?M:M.filter(x=>x.c===cat));
  grid.innerHTML=list.length?list.map((x,i)=>`<article class="dish${(cat==='All'||term)&&x.c==='Favorites'?' dish--fav':''}" style="animation-delay:${Math.min(i,12)*40}ms">
    <div class="dish__img">${x.img?`<img src="${x.img}" alt="${esc(x.n)}" loading="lazy" width="666" height="375">`:`<div class="dish__noimg">THE BREAK</div>`}</div>
    <div class="dish__body"><div class="dish__top"><h3>${esc(x.n)}</h3>${x.p?`<span class="dish__price">$${x.p.toFixed(2)}</span>`:`<span class="verify">Ask</span>`}</div>
    <p>${esc(x.d||'')}</p>${x.t&&x.t.length?`<div class="dish__tags">${x.t.map(t=>`<span>${t}</span>`).join('')}</div>`:''}</div></article>`).join('')
  :`<p class="menu__empty">Nothing matches "${esc(term)}". Try burger, tacos or waffles.</p>`;
}
q.addEventListener('input',()=>{if(q.value)$$('.tab').forEach(t=>t.setAttribute('aria-selected',false));render()});
render();

/* ---------- MAC LAB (real macs + real sampler price) ---------- */
const macs=M.filter(x=>x.c==="Mac n' Cheese"&&!/Sampler/.test(x.n));
const macBox=$('[data-macs]'),slots=$$('.sampler__slots span'),sampler=$('[data-sampler]'),mImg=$('[data-mac-img]'),mLab=$('[data-mac-label]');let picks=[];
const short=n=>n.replace(/ Mac N' Cheese/i,'').replace("The Break","Classic");
slots.forEach((s,i)=>s.textContent='Pick '+(i+1));
macs.forEach(x=>{const b=document.createElement('button');b.className='mac';b.setAttribute('aria-pressed','false');b.innerHTML=`${esc(short(x.n))}<small>$${x.p.toFixed(2)} solo</small>`;
  b.onclick=()=>{const k=picks.indexOf(x);if(k>-1)picks.splice(k,1);else{if(picks.length===3)picks.shift();picks.push(x)}
    $$('.mac',macBox).forEach((el,j)=>el.setAttribute('aria-pressed',picks.includes(macs[j])));
    slots.forEach((s,i)=>{s.textContent=picks[i]?short(picks[i].n):'Pick '+(i+1);s.classList.toggle('full',!!picks[i])});
    sampler.classList.toggle('done',picks.length===3);
    if(x.img&&picks.includes(x)){mImg.classList.add('swap');setTimeout(()=>{mImg.src=x.img;mLab.textContent=x.n+' · $'+x.p.toFixed(2);mImg.classList.remove('swap')},250)}
  };macBox.appendChild(b)});

/* ---------- SAUCES (real list from their wings description) ---------- */
const wing=M.find(x=>x.n==='Wings Bone-in');
const sauces=wing?wing.d.split(':')[1].split('.')[0].replace(/ or /,', ').split(',').map(s=>s.trim()).filter(Boolean):[];
const sBox=$('[data-sauces]'),pick=$('[data-sauce-pick] b');
sauces.forEach(s=>{const b=document.createElement('button');b.className='sauce';b.textContent=s;b.setAttribute('aria-pressed','false');b.onclick=()=>{$$('.sauce').forEach(x=>x.setAttribute('aria-pressed',x===b));pick.textContent=s};sBox.appendChild(b)});

/* ---------- REVEAL ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
$$('.reveal,.pour').forEach((el,i)=>{el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});

/* ---------- PARALLAX ---------- */
const px=$$('[data-parallax]');
if(!RM){let tick=false;const run=()=>{px.forEach(el=>{const r=el.parentElement.getBoundingClientRect();const p=(r.top+r.height/2-innerHeight/2)/innerHeight;el.style.transform=`translate3d(0,${p*-60}px,0)`});tick=false};addEventListener('scroll',()=>{if(!tick){requestAnimationFrame(run);tick=true}},{passive:true});run()}

/* ---------- VIDEO ---------- */
const v=$('[data-video]'),vt=$('[data-video-toggle]');
if(RM){v.removeAttribute('autoplay');v.pause()}
const sync=()=>{vt.textContent=v.paused?'Play video':'Pause video';vt.setAttribute('aria-pressed',!v.paused)};
vt.onclick=()=>{v.paused?v.play():v.pause();sync()};v.addEventListener('play',sync);v.addEventListener('pause',sync);sync();

/* ---------- LIGHTBOX ---------- */
const lb=$('[data-lightbox]'),lbImg=$('[data-lb-img]'),lbCap=$('[data-lb-cap]'),gi=$$('[data-gallery] img');let li=0;
const open=i=>{li=(i+gi.length)%gi.length;lbImg.src=gi[li].src;lbImg.alt=gi[li].alt;lbCap.textContent=gi[li].alt;lb.hidden=false;document.body.style.overflow='hidden'};
const close=()=>{lb.hidden=true;document.body.style.overflow=''};
gi.forEach((im,i)=>im.parentElement.onclick=()=>open(i));
$('[data-lb-close]').onclick=close;$('[data-lb-prev]').onclick=()=>open(li-1);$('[data-lb-next]').onclick=()=>open(li+1);
lb.onclick=e=>{if(e.target===lb)close()};
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')open(li-1);if(e.key==='ArrowRight')open(li+1)});
})();
