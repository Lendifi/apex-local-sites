const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SHOP='1536 E 3500 N, Suite 105, Lehi, UT 84043';
const DEMO={name:'Jordan M.',address:'123 Example St, Saratoga Springs, UT',email:'jordan@example.com',phone:'(555) 010-0177'};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- nav, fab, hours ---------- */
const nav=$('#nav'),fab=$('#fab');
const demosEl=document.querySelector('#demos');
function onScroll(){const y=scrollY;nav.classList.toggle('stuck',y>40);const dr=demosEl.getBoundingClientRect();const inDemos=dr.top<innerHeight*.6&&dr.bottom>innerHeight*.3;fab.classList.toggle('show',y>innerHeight*.8&&!inDemos);par()}
$('#burger').onclick=()=>{const o=nav.classList.toggle('open');$('#burger').setAttribute('aria-expanded',o)};
$$('#links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const HOURS={0:null,1:[10,18],2:[10,18],3:[10,18],4:[10,18],5:[10,18],6:[10,14]};
function denver(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t).value;return{d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),h:(+g('hour')%24)+(+g('minute'))/60}}
(function(){const n=denver(),h=HOURS[n.d];const open=h&&n.h>=h[0]&&n.h<h[1];
 const fmt=x=>(x>12?x-12:x)+(x>=12?' PM':' AM');
 $('#openNow').textContent=open?'Open now':'Closed';
 $('#openSub').textContent=open?'Until '+fmt(h[1])+' today':'Mon to Fri 10 to 6, Sat 10 to 2';
 const p=$('#openPill');p.textContent=open?'Open now · until '+fmt(h[1]):'Closed right now';p.classList.toggle('closed',!open);
 const tr=$(`#hours tr[data-d="${n.d}"]`);if(tr)tr.classList.add('today')})();

/* ---------- parallax + reveal ---------- */
const parEls=$$('[data-par]');
function par(){if(reduce)return;const y=scrollY;
 if(y<innerHeight*1.3)$('#heroBg').style.transform=`translate3d(0,${y*.22}px,0) scale(${1+Math.min(y/4000,.06)})`;
 parEls.forEach(el=>{const pe=el.parentElement,r=pe.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)return;const p=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));el.style.transform=`translate3d(0,${p*-r.height*(+el.dataset.par)}px,0)`})}
addEventListener('scroll',onScroll,{passive:true});onScroll();
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
$$('.reveal').forEach(x=>io.observe(x));

/* ---------- materials ---------- */
$$('#mats .mat').forEach(m=>{const on=()=>{$$('#mats .mat').forEach(x=>x.classList.toggle('on',x===m))};m.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)on()});m.addEventListener('click',on);m.addEventListener('focus',on)});

/* ---------- before / after ---------- */
(function(){const b=$('#ba'),r=$('#baRange');const set=v=>b.style.setProperty('--p',v+'%');set(50);r.oninput=()=>set(r.value);
 if(!reduce){const o=new IntersectionObserver(es=>{if(es[0].isIntersecting){o.disconnect();let t=0;const a=setInterval(()=>{t+=.05;const v=50+Math.sin(t*3)*22*Math.max(0,1-t/2);set(v);r.value=v;if(t>2){clearInterval(a);set(50);r.value=50}},16)}},{threshold:.6});o.observe(b)}})();

/* ---------- reviews (real, verbatim) ---------- */
const REV=[
 ['Brandon W.','Google · Feb 2026',"Working with Hakes Flooring was a breeze! We needed some carpet installed on our basement stairs and they were great to work with from start to finish (which wasn't very long because they were really quick to install). Rod answered all our questions and gave us direction on the best carpet for our needs. He's more than fair with the cost and you can tell he really cares about his customers. Kyle installed our carpet and he was super friendly and very skilled - he put a lot of care into his work and we're very happy with how it turned out. Would definitely use Hakes Flooring again.",1],
 ['Troy M.','Google · Mar 2026',"This company is amazing. I own a service company that I refer a lot of my own customers to Hakes. All of them tell me that Hakes always takes care of them and is so nice and professional and the quality of their work is the best. Thanks Guys!"],
 ['Jasmine T.','Google · Jan 2026',"If you need new carpets, there isn’t a better place to go. … We shopped around and got a few estimates, and Rod’s estimate beat everyone else by quite a bit."],
 ['Google reviewer','Google · Feb 2026',"Rod and his crews are amazing!!! First class company! High quality and great pricing!!! I highly recommend them!!"],
 ['Carrie G.','HomeAdvisor · Jun 2020',"The individuals at Hakes Flooring are true professionals. They are skilled tradesmen and know their craft well."],
 ['Google reviewer','Google · Dec 2025',"After some of the LVP in our bathroom was ruined, I went into Hakes Flooring for help. Rod and his staff were awesome, they helped us get new flooring down and truly saved our bathroom. I’d recommend Hakes Flooring to anyone!"],
 ['Google reviewer','Google · May 2025',"We used Hakes Flooring recently to completely redo our entire house. Rod & his staff were very helpful and patient, even as we had to make some changes midway through the process. We are extremely happy with their service, and with our new floors!"],
 ['Hannah K.','HomeAdvisor · Mar 2021',"They were honest, friendly and helpful. They were so knowledgeable about our options. Would recommend them to everyone!"]
];
$('#rGrid').innerHTML=REV.map((r,i)=>`<div class="rv reveal${r[3]?' big':''}" style="--d:${(i%3)*.1}s"><span class="stars">★★★★★</span><p>"${esc(r[2])}"</p><div class="who"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div></div>`).join('');
$$('#rGrid .reveal').forEach(x=>io.observe(x));

/* ---------- gallery lightbox ---------- */
$$('.gal figure').forEach(f=>f.onclick=()=>{const l=$('#lb');$('img',l).src=$('img',f).src;l.classList.add('on')});
$('#lb').onclick=()=>$('#lb').classList.remove('on');addEventListener('keydown',e=>{if(e.key==='Escape')$('#lb').classList.remove('on')});

/* ---------- shared demo helpers ---------- */
const SERVICES=['Free in-home estimate: Hardwood','Free in-home estimate: LVP','Free in-home estimate: Carpet','Free in-home estimate: Tile','Free in-home estimate: Laminate','Free in-home estimate: Not sure yet'];
const MATS=['Hardwood','LVP','Carpet','Tile','Laminate','Not sure yet'];
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function openDays(n){const out=[];const d=new Date();d.setHours(12,0,0,0);while(out.length<n){d.setDate(d.getDate()+1);if(d.getDay()!==0)out.push(new Date(d))}return out}
function slotsFor(date){const base=date.getDay()===6?[10,11,12,13]:[10,11,12,13,14,15,16,17];const seed=date.getDate()*7+date.getMonth();return base.map((h,i)=>({h,off:((seed+i*5)%7)===0||((seed+i)%11)===3}))}
const hl=h=>(h>12?h-12:h)+':00 '+(h>=12?'PM':'AM');
const dl=d=>DOW[d.getDay()]+', '+MON[d.getMonth()]+' '+d.getDate();
function contactForm(onDone,btn='Confirm appointment'){
 const f=document.createElement('form');f.className='cf';f.noValidate=true;
 f.innerHTML=`<div class="row"><label>Full name<input name="name" autocomplete="off"></label><label>Phone<input name="phone" type="tel" autocomplete="off"></label></div><div class="row"><label>Email<input name="email" type="email" autocomplete="off"></label><label>Address of the project<input name="address" autocomplete="off"></label></div><div class="row"><button type="button" class="btn line fill">Use demo info</button><button class="btn">${btn}</button></div><p class="fine err" role="alert"></p>`;
 $('.fill',f).onclick=()=>{for(const k in DEMO)f[k].value=DEMO[k]};
 f.onsubmit=e=>{e.preventDefault();const d={};const miss=[];for(const k of ['name','address','email','phone']){d[k]=f[k].value.trim();if(!d[k])miss.push(k)}
  if(miss.length){$('.err',f).textContent='Please add your '+miss.join(', ')+'.';return}
  if(!/^\S+@\S+\.\S+$/.test(d.email)){$('.err',f).textContent='That email looks off.';return}
  onDone(d,f)};
 return f}
function calHTML(d,title,when,note='Added to the Hakes calendar, text reminder queued (simulated)'){return `<div class="cal"><div class="hd"><span>📅 OWNER CALENDAR</span><span>New event</span></div><div class="bd"><div class="bar"></div><div><h5>${esc(title)}</h5><p>${esc(when)}</p><p>📍 ${esc(d.address)}</p><div class="d"><b>${esc(d.name)}</b><br>${esc(d.phone)} · ${esc(d.email)}<br>Address: ${esc(d.address)}<br><span class="fine">${esc(note)}</span></div></div></div></div>`}
function confHTML(d,title,when,heading='Estimate booked'){return `<div class="conf"><h4>✓ ${esc(heading)}</h4><b>${esc(title)}</b><br>${esc(when)}<dl><dt>Name</dt><dd>${esc(d.name)}</dd><dt>Address</dt><dd>${esc(d.address)}</dd><dt>Email</dt><dd>${esc(d.email)}</dd><dt>Phone</dt><dd>${esc(d.phone)}</dd></dl></div>${calHTML(d,title,when)}`}

/* ---------- Panels ---------- */
const TABS=[['book','Book a free estimate'],['chat','AI assistant'],['calc','Cost estimator'],['sms','Missed-call text-back'],['rev','Review requests'],['web','Your website today']];
$('#tabs').innerHTML=TABS.map((t,i)=>`<button role="tab" data-t="${t[0]}"${i?'':' class="on"'}>${t[1]}</button>`).join('');
$('#panels').innerHTML=`
<div class="panel on" id="p-book"><div class="two"><div class="card" id="bk"><span class="tag">Simulated</span><h3 style="margin-bottom:6px">Book a free in-home estimate</h3><p class="fine" style="margin-bottom:18px">Pick a day, a time, and what you are thinking about.</p><div class="stepper"><i class="on"></i><i></i><i></i></div><div id="bkBody"></div></div>
<aside><h3>Customers book at 11 PM. You wake up to a full calendar.</h3><p>No phone tag. Every booking collects the four things you need to show up prepared.</p><ul><li>Name, address, email, and phone required</li><li>Lands in your calendar with all four</li><li>Customer gets a confirmation instantly</li><li>Closed Sundays handled automatically</li></ul></aside></div></div>
<div class="panel" id="p-chat"><div class="two"><div class="card chatbox"><div class="chat-hd"><div class="avatar">H</div><div><b>Hakes Flooring assistant</b><span>Online 24/7 · Simulated</span></div></div><div class="msgs" id="msgs"></div><div class="qr" id="qr"></div><form class="chat-in" id="chatIn"><input placeholder="Ask about LVP, carpet, hardwood, tile..." aria-label="Message"><button class="btn">Send</button></form></div>
<aside><h3>Answers the common questions, day or night.</h3><p>LVP versus hardwood, carpet for stairs, what happens at an estimate, who they serve. Then it books the visit.</p><ul><li>Understands cities from Salt Lake City to Provo</li><li>Books straight into the calendar</li><li>Hands tricky questions to the team</li></ul><p class="fine" style="margin-top:14px">Try: "LVP or hardwood?" or "Do you work in Draper?"</p></aside></div></div>
<div class="panel" id="p-calc"><div class="est"><div class="card"><span class="tag">Estimate only</span><h3 style="margin-bottom:16px">Flooring cost estimator</h3><div class="mtabs" id="mtabs"></div>
<div class="sqrow"><label style="margin:0">Room size (sq ft)</label><output id="sqOut">400</output></div><input class="range" id="sq" type="range" min="50" max="3000" step="10" value="400" aria-label="Square feet">
<label style="margin-top:14px">Quality tier</label><div class="tiers" id="tiers"></div>
<label class="chk"><input type="checkbox" id="rm"> Remove and haul away old flooring</label><label>Stairs to cover or finish (steps)<input id="stairs" type="number" min="0" max="40" value="0"></label></div>
<div class="result"><span class="tag" style="background:rgba(255,255,255,.1);color:#e2b985">Your estimate</span><div class="big" id="estOut">$0</div><small id="estPer"></small><table id="estTbl"></table><a class="btn arrow" href="#demos" id="estBook">Book a free measure to get an exact price</a><p class="disc">Sample pricing for demonstration only. These are rough ballpark ranges, not a quote. Hakes sets real pricing after a free in-home measure.</p></div></div></div>
<div class="panel" id="p-sms"><div class="two"><div class="phone"><div class="scr" id="sms"><div class="hdr"><b>Hakes Flooring Company</b>(801) 692-1977 · Simulated</div><div class="missed"><i>✕</i><div><b>Missed call</b><br>(555) 010-0177 · 2:14 PM, Rod is on a job</div></div></div></div>
<aside><h3>Rod is on a job. The customer is not lost.</h3><p>A missed call gets a text within seconds. It answers, offers times, and books a free estimate with the four details you need.</p><div class="ctl"><button class="btn dk" id="playSms">▶ Play</button></div></aside></div></div>
<div class="panel" id="p-rev"><div class="two"><div class="phone"><div class="scr" id="rv"><div class="hdr"><b>Hakes Flooring Company</b>Sent 2 days after the install · Simulated</div><div class="sms out">Hi Jordan, thanks for choosing Hakes Flooring! How do your new floors look? Tap a star.</div><div class="rate" id="rate">${[1,2,3,4,5].map(n=>`<button type="button" data-n="${n}" aria-label="${n} stars">★</button>`).join('')}</div><div id="rvOut"></div></div></div>
<aside><h3>Turn happy homeowners into reviews.</h3><p>Hakes already has a 5.0. A follow-up text keeps the count climbing, and an unhappy customer reaches Rod privately first. Tap 5 stars, then try 2.</p></aside></div></div>
<div class="panel" id="p-web"><div class="two"><div><div class="cmp"><div><div class="lbl">Today</div><div class="browser"><div class="bbar"><i></i><i></i><i></i><span>hakesflooringcompany.com</span></div><div class="bbody"><b>This site can't be reached</b><p>hakesflooringcompany.com's server IP address could not be found. DNS_PROBE_FINISHED_NXDOMAIN</p></div></div></div>
<div><div class="lbl g">With Apex</div><div class="browser"><div class="bbar"><i></i><i></i><i></i><span>Your Hakes website</span></div><div class="bbody ok"><h4>Floors you will love</h4><p>Book a free estimate, ask the assistant, get a ballpark price.</p><a class="btn sm" style="margin-top:14px" href="#top">Book a free estimate</a></div></div></div></div>
<p class="fine" style="margin-top:14px">Checked Nov 10, 2026. The address on public listings does not load, and a Canva address on another directory returns "Not found."</p></div>
<aside><h3>Right now, the website button leads nowhere.</h3><p>Google, LinkedIn, and HomeAdvisor point to a web address that does not load. Every curious customer who taps it hits a dead end and calls the next shop.</p><ul><li>One working site, one clear next step</li><li>Shows on phones the way people search</li><li>Collects the lead around the clock</li></ul></aside></div></div>`;
const showTab=id=>{$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===id));$$('.panel').forEach(p=>p.classList.toggle('on',p.id==='p-'+id))};
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(b)showTab(b.dataset.t)};
$$('[data-open-book]').forEach(a=>a.addEventListener('click',()=>showTab('book')));
$$('[data-open-chat]').forEach(a=>a.addEventListener('click',()=>showTab('chat')));

/* ---------- booking ---------- */
const B={mat:'Hardwood',day:null,slot:null};
function bkRender(step=1){const body=$('#bkBody');$$('#bk .stepper i').forEach((i,k)=>i.classList.toggle('on',k<step));
 if(step===1){const days=openDays(12);
  body.innerHTML=`<label>What are you thinking about?</label><div class="chips" id="bkMat">${MATS.map(m=>`<button type="button" class="${m===B.mat?'on':''}">${m}</button>`).join('')}</div>
  <label>Pick a day</label><div class="days" id="bkDays">${days.map((d,i)=>`<button type="button" class="day" data-i="${i}"><small>${DOW[d.getDay()]}</small><b>${d.getDate()}</b><span>${MON[d.getMonth()]}</span></button>`).join('')}</div>
  <label>Pick a time</label><div class="slots" id="bkSlots"><p class="fine" style="grid-column:1/-1">Choose a day first.</p></div><div class="summary" id="bkSum" style="display:none"></div><button class="btn" id="bkNext" disabled>Continue</button>`;
  $('#bkMat').onclick=e=>{const b=e.target.closest('button');if(!b)return;B.mat=b.textContent;$$('#bkMat button').forEach(x=>x.classList.toggle('on',x===b))};
  $('#bkDays').onclick=e=>{const b=e.target.closest('.day');if(!b)return;$$('#bkDays .day').forEach(x=>x.classList.toggle('on',x===b));B.day=days[+b.dataset.i];B.slot=null;$('#bkNext').disabled=true;$('#bkSum').style.display='none';
   $('#bkSlots').innerHTML=slotsFor(B.day).map(s=>`<button type="button" data-h="${s.h}"${s.off?' disabled':''}>${hl(s.h)}</button>`).join('')};
  $('#bkSlots').onclick=e=>{const b=e.target.closest('button');if(!b||b.disabled)return;$$('#bkSlots button').forEach(x=>x.classList.toggle('on',x===b));B.slot=+b.dataset.h;$('#bkNext').disabled=false;const s=$('#bkSum');s.style.display='block';s.innerHTML=`<b>${dl(B.day)} at ${hl(B.slot)}</b> · Free in-home estimate · ${esc(B.mat)}`};
  $('#bkNext').onclick=()=>bkRender(2)}
 else if(step===2){body.innerHTML=`<div class="summary"><b>${dl(B.day)} at ${hl(B.slot)}</b> · Free in-home estimate · ${esc(B.mat)} <a href="#" id="bkBack" style="margin-left:8px">Change</a></div><p class="fine" style="margin-bottom:12px">Where should we come, and how do we reach you?</p>`;
  body.appendChild(contactForm(d=>{bkRender(3);const when=`${dl(B.day)}, ${hl(B.slot)} to ${hl(B.slot+1)}`;$('#bkBody').innerHTML=confHTML(d,'Free in-home estimate: '+B.mat,when)+`<p style="margin-top:14px"><button class="btn line sm" id="bkAgain">Book another</button></p>`;$('#bkAgain').onclick=()=>{B.day=B.slot=null;bkRender(1)}},'Confirm my estimate'));
  $('#bkBack').onclick=e=>{e.preventDefault();bkRender(1)}}
 else $$('#bk .stepper i').forEach(i=>i.classList.add('on'))}
bkRender(1);

/* ---------- chat ---------- */
const msgs=$('#msgs'),qr=$('#qr');const cs={};
function say(t,w='b',html=true){const m=document.createElement('div');m.className='m '+w;m.innerHTML=html?t:esc(t);msgs.appendChild(m);msgs.scrollTop=msgs.scrollHeight;return m}
function botSay(t,then,delay=700){qr.innerHTML='';const ty=document.createElement('div');ty.className='m b typing';ty.innerHTML='<i></i><i></i><i></i>';msgs.appendChild(ty);msgs.scrollTop=msgs.scrollHeight;setTimeout(()=>{ty.remove();const m=say(t);then&&then(m)},delay)}
function quick(arr){qr.innerHTML='';arr.forEach(([t,f])=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{say(esc(t),'u');qr.innerHTML='';f()};qr.appendChild(b)});requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight})}
const bookQ=()=>quick([['Book a free estimate',chatBook],['Cost estimator',()=>{botSay('Opening the cost estimator for you. It gives a ballpark, and a free measure gives the real number.',()=>setTimeout(()=>{showTab('calc')},500))}],['LVP or hardwood?',()=>answer('lvp vs hardwood')]]);
const CITIES=['Salt Lake City','Murray','Midvale','Sandy','Draper','South Jordan','Riverton','Herriman','West Jordan','Lehi','Saratoga Springs','Eagle Mountain','American Fork','Pleasant Grove','Highland','Alpine','Orem','Vineyard','Lindon','Provo','Springville','Spanish Fork','Cedar Hills','Lehi'];
const A=[
 [/lvp.*(vs|or|versus).*hardwood|hardwood.*(vs|or|versus).*lvp|compare|difference|which (is )?better|vinyl plank vs|laminate vs/i,()=>'Quick version. <b>Hardwood</b> is real wood: warm, long-lived, and it can be refinished, but it does not love standing water. <b>LVP</b> is waterproof, tough with kids and pets, and great in kitchens and basements. <b>Laminate</b> is a budget-friendly wood look. <b>Carpet</b> is the softest and quietest. <b>Tile</b> is the most durable for baths and entries. Want Rod to look at your space?'],
 [/water|pets?|dog|cat|kids|spill|basement|moisture|kitchen/i,()=>'For busy homes with pets, kids, or spills, <b>LVP</b> is a favorite because it is waterproof and tough. Tile is great too. For basements, LVP and laminate are common picks. Rod can confirm what fits your space at a free estimate.'],
 [/stair/i,()=>'Stairs are most often done in <b>carpet</b>, which is grippy and quieter, though hardwood and LVP can work too. A free in-home measure counts steps and checks the details.'],
 [/carpet/i,()=>'<b>Carpet</b> is soft, warm, and quiet, and a great fit for bedrooms, basements, and stairs. Customers say Rod helps them pick the right carpet for their needs. Want to book a free estimate?'],
 [/tile|stone|bath|shower|entry/i,()=>'<b>Tile and natural stone</b> are durable and great for bathrooms, entryways, and kitchens. Hakes offers tile, natural stone, and vinyl. A free estimate can cover layout and options.'],
 [/hardwood|wood floor|oak|walnut|herringbone/i,()=>'<b>Hardwood</b> gives lasting warmth and can be refinished over the years. Solid and engineered options exist. Want a free in-home estimate?'],
 [/laminate/i,()=>'<b>Laminate</b> is a smart-value wood look with a scratch-resistant surface. Popular in basements, offices, and rentals.'],
 [/price|cost|how much|quote|budget|cheap|afford/i,()=>'Pricing depends on the material, the room, and prep work. I can give you a ballpark in the <b>cost estimator</b>, and Rod gives an exact number after a free in-home measure.'],
 [/hour|open|close|saturday|sunday|weekend|when/i,()=>'The showroom is open <b>Monday to Friday 10 AM to 6 PM</b> and <b>Saturday 10 AM to 2 PM</b>. Closed Sunday. I can book a free estimate any time, even after hours.'],
 [/how long|timeline|process|how does|what happens|steps/i,()=>'It goes in four steps: a <b>free in-home estimate</b>, choose your floor at the showroom, a skilled install, then a follow-up to make sure you are happy. The schedule depends on the material and your project, and the team confirms it at the estimate.'],
 [/free|estimate|measure/i,()=>'Estimates are free. Someone comes to measure and talk through your project. Want to pick a time?'],
 [/where|address|location|find you|showroom|directions|located/i,()=>`The showroom is at <b>${SHOP}</b>. Which city are you in? I can tell you if we can come out.`],
 [/phone|call|number|talk to/i,()=>'You can call the team at <b>(801) 692-1977</b>. Or I can book a free estimate right here.'],
 [/hi\b|hello|hey|thanks|thank you/i,()=>'Happy to help! Ask me about flooring types, the process, or where we work.']
];
function answer(text){
 const city=CITIES.find(c=>new RegExp('\\b'+c+'\\b','i').test(text))||(/\bslc\b/i.test(text)?'Salt Lake City':null);
 if(city){botSay(`Yes, we can help in <b>${city}</b>. Hakes is based at ${SHOP}, and the team works across northern Utah County and the Salt Lake to Provo area. Want a free in-home estimate there?`,()=>bookQ());return}
 if(/\b(book|appoint|schedule|reserve)\b/i.test(text)){chatBook();return}
 const hit=A.find(a=>a[0].test(text));
 if(hit){botSay(hit[1](),()=>bookQ());return}
 botSay('Good question. The Hakes team can answer that best, call <b>(801) 692-1977</b> or I can book a free estimate so Rod can talk it through with you.',()=>bookQ())}
function chatBook(){botSay('Great, a free in-home estimate. What are you thinking about?',()=>quick(['Hardwood','LVP','Carpet','Tile','Laminate','Not sure yet'].map(m=>[m,()=>{cs.mat=m;chatDay()}])))}
function chatDay(){const days=openDays(4);botSay(`${esc(cs.mat)}, nice. Which day works?`,()=>quick(days.map(d=>[dl(d),()=>{cs.day=d;chatSlot()}])))}
function chatSlot(){const s=slotsFor(cs.day).filter(x=>!x.off).slice(0,4);botSay('Here are the open times:',()=>quick(s.map(x=>[hl(x.h),()=>{cs.h=x.h;chatInfo()}])))}
function chatInfo(){botSay('Perfect. To lock it in I need your name, address, email, and phone:',m=>{m.appendChild(contactForm((d,f)=>{f.remove();say(esc(d.name)+' · '+esc(d.phone),'u');const when=`${dl(cs.day)}, ${hl(cs.h)} to ${hl(cs.h+1)}`;botSay("You're all set! Rod's team will see you then.",mm=>{mm.insertAdjacentHTML('beforeend',confHTML(d,'Free in-home estimate: '+cs.mat,when));msgs.scrollTop=msgs.scrollHeight},600)},'Confirm'))})}
$('#chatIn').onsubmit=e=>{e.preventDefault();const i=$('input',e.target),t=i.value.trim();if(!t)return;say(esc(t),'u');i.value='';answer(t)};
say("Hi! I'm the Hakes Flooring assistant. Ask me about flooring, the process, or where we work, or I can book you a free in-home estimate.");quick([['LVP or hardwood?',()=>answer('lvp vs hardwood')],['Do you work in Draper?',()=>answer('Do you work in Draper?')],['Book a free estimate',chatBook]]);

/* ---------- estimator ---------- */
const P={Hardwood:{img:'herringbone',t:[[8,11],[11,15],[15,22]]},LVP:{img:'lvp',t:[[4.5,6],[6,8.5],[8.5,11]]},Carpet:{img:'carpet',t:[[3.5,5],[5,7.5],[7.5,11]]},Tile:{img:'tile',t:[[8,12],[12,17],[17,26]]},Laminate:{img:'laminate',t:[[3.5,5],[5,7],[7,9]]}};
const TN=['Value','Popular','Premium'],TS=['Solid basics','Most chosen','Top shelf'];
const E={m:'Hardwood',t:1};
$('#mtabs').innerHTML=Object.keys(P).map(k=>`<button type="button" data-m="${k}" class="${k===E.m?'on':''}"><img src="img/${P[k].img}.jpg" alt=""><span>${k}</span></button>`).join('');
$('#tiers').innerHTML=TN.map((n,i)=>`<button type="button" data-t="${i}" class="${i===E.t?'on':''}">${n}<small>${TS[i]}</small></button>`).join('');
const mny=n=>'$'+(Math.round(n/50)*50).toLocaleString('en-US');
function calc(){const sf=+$('#sq').value,st=Math.max(0,+$('#stairs').value||0),rm=$('#rm').checked;$('#sqOut').textContent=sf.toLocaleString('en-US');
 const [lo,hi]=P[E.m].t[E.t];const matLo=lo*sf*1.1,matHi=hi*sf*1.1;const rmv=rm?sf*1.25:0;const stp=st*(E.m==='Carpet'?45:75);
 const L=matLo+rmv+stp,H=matHi+rmv*1.3+stp*1.3;$('#estOut').textContent=mny(L)+' to '+mny(H);
 $('#estPer').textContent=`About ${'$'+(L/sf).toFixed(2)} to ${'$'+(H/sf).toFixed(2)} per sq ft, installed`;
 $('#estTbl').innerHTML=`<tr><td>${E.m}, ${TN[E.t]}</td><td>${sf.toLocaleString('en-US')} sq ft</td></tr><tr><td>Waste and cuts</td><td>10% included</td></tr>${rm?'<tr><td>Old floor removal</td><td>Included</td></tr>':''}${st?`<tr><td>Stairs</td><td>${st} steps</td></tr>`:''}`}
$('#mtabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;E.m=b.dataset.m;$$('#mtabs button').forEach(x=>x.classList.toggle('on',x===b));calc()};
$('#tiers').onclick=e=>{const b=e.target.closest('button');if(!b)return;E.t=+b.dataset.t;$$('#tiers button').forEach(x=>x.classList.toggle('on',x===b));calc()};
['sq','stairs','rm'].forEach(i=>$('#'+i).addEventListener('input',calc));calc();
$('#estBook').onclick=()=>{B.mat=E.m;showTab('book');bkRender(1)};

/* ---------- missed-call text back ---------- */
$('#playSms').onclick=function(){const s=$('#sms');$$('.sms,.conf,.cal',s).forEach(x=>x.remove());this.disabled=true;
 const d0=openDays(2)[1],h=11,when=`${dl(d0)}, ${hl(h)} to ${hl(h+1)}`;
 const L=[['out','Hi, this is Hakes Flooring Company in Lehi. Sorry we missed your call, we are on a job. How can we help?'],['in','Looking at new LVP for my basement, about 600 sq ft'],['out',`We can help with that! Want a free in-home estimate? ${dl(d0)} at ${hl(h)} is open.`],['in','Yes please'],['out','Great. Reply with your name, address, email, and phone to lock it in.'],['in',`${DEMO.name}, ${DEMO.address}, ${DEMO.email}, ${DEMO.phone}`],['out',`You're booked for ${dl(d0)} at ${hl(h)}. See you then!`]];
 L.forEach(([c,t],i)=>setTimeout(()=>{s.insertAdjacentHTML('beforeend',`<div class="sms ${c}">${esc(t)}</div>`);if(i===L.length-1){s.insertAdjacentHTML('beforeend',confHTML(DEMO,'Free in-home estimate: LVP',when));this.disabled=false;this.textContent='▶ Replay'}s.scrollTop=s.scrollHeight},i*750))};

/* ---------- review requests ---------- */
$('#rate').onclick=e=>{const b=e.target.closest('button');if(!b)return;const n=+b.dataset.n;$$('#rate button').forEach(x=>x.classList.toggle('on',+x.dataset.n<=n));
 $('#rvOut').innerHTML=n>=4?`<div class="sms in">Love it! ${'★'.repeat(n)}</div><div class="sms out">Thank you, Jordan! Would you share that on Google? It helps a small local shop a lot. One tap:</div><div class="conf"><h4>⭐ Google review link sent</h4>Opens the Hakes Google review box (simulated)</div>`:`<div class="sms in">${'★'.repeat(n)}</div><div class="sms out">We are sorry we missed the mark. Tell us what happened and the owner will call you personally.</div><div class="cal"><div class="hd"><span>🔔 OWNER ALERT</span><span>Private</span></div><div class="bd"><div class="bar" style="background:#b0443a"></div><div><h5>${n}-star private feedback from ${esc(DEMO.name)}</h5><p>Call back before it goes public (simulated)</p></div></div></div>`;$('#rv').scrollTop=$('#rv').scrollHeight};

/* ---------- quote form ---------- */
(function(){const f=document.createElement('form');f.className='card';f.noValidate=true;
 f.innerHTML=`<div class="row"><label>Full name<input name="name"></label><label>Phone<input name="phone" type="tel"></label></div><div class="row"><label>Email<input name="email" type="email"></label><label>Project address<input name="address"></label></div>
 <div class="row"><label>Material<select name="mat"><option>Hardwood</option><option>LVP</option><option>Carpet</option><option>Tile</option><option>Laminate</option><option>Not sure yet</option></select></label><label>Approx. square feet<input name="sf" type="number" placeholder="e.g. 600"></label></div>
 <label>Tell us about the project<textarea name="msg" rows="3" placeholder="Rooms, timing, anything we should know..."></textarea></label>
 <div class="row"><button type="button" class="btn line fill">Use demo info</button><button class="btn">Request my quote</button></div><p class="fine err" role="alert"></p><div class="out"></div>`;
 $('.fill',f).onclick=()=>{for(const k in DEMO)f[k].value=DEMO[k];f.sf.value=600;f.mat.value='LVP';f.msg.value='Basement and stairs. Sample request.'};
 f.onsubmit=e=>{e.preventDefault();const miss=['name','phone','email','address'].filter(k=>!f[k].value.trim());const er=$('.err',f);if(miss.length){er.textContent='Please add your '+miss.join(', ')+'.';return}er.textContent='';
  $('.out',f).innerHTML=`<div class="conf"><h4>✓ Quote request received</h4><dl><dt>Name</dt><dd>${esc(f.name.value)}</dd><dt>Phone</dt><dd>${esc(f.phone.value)}</dd><dt>Email</dt><dd>${esc(f.email.value)}</dd><dt>Address</dt><dd>${esc(f.address.value)}</dd><dt>Project</dt><dd>${esc(f.mat.value)}${f.sf.value?', about '+esc(f.sf.value)+' sq ft':''}</dd></dl><p class="fine" style="margin-top:10px">Hakes would get an instant text and email with these details. Nothing was stored or sent.</p></div>`};
 $('#quoteHost').appendChild(f)})();
