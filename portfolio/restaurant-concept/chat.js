/* Fictional concept. Example data only. */
(function(){
const TOAST='#order';
const PHONE='(555) 010-0123',TEL='tel:+15550100123',ADDR='123 Main St, Your City, UT';
const MAPS='#visit';
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],FULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const BAR={Sun:'10AM-12AM',Mon:'11AM-12AM',Tue:'11AM-12AM',Wed:'11AM-1AM',Thu:'11AM-1AM',Fri:'11AM-1AM',Sat:'10AM-1AM'};
const KIT={Sun:'10AM-10PM',Mon:'11AM-10PM',Tue:'11AM-10PM',Wed:'11AM-11PM',Thu:'11AM-11PM',Fri:'11AM-12AM',Sat:'10AM-12AM'};
const WEEK={1:'Poker Night at 7PM, free to play, $100 cash prize per table',2:'Trivia Tuesdays at 7:30PM (the team is confirming it is still running)',3:'Karaoke Night 8 to 11PM ',4:'Bingo Night at 8PM',5:'Live Music, usually 8PM and free',6:'Brunch Bingo at 1PM (doors at 10AM)',0:'Sunday Funday: brunch from 10AM, games all day'};
const M=window.MENU||[];
const f=t=>t.replace('12AM','midnight').replace(/(\d+)(AM|PM)/g,'$1 $2').replace('-',' to ');
const today=()=>DAYS.indexOf(new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',weekday:'short'}).format(new Date()));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const card=x=>`<div class="bkc__card">${x.img?`<img src="${x.img}" alt="">`:''}<div><b>${esc(x.n)}</b>${x.p?`<span>$${x.p.toFixed(2)}</span> `:''}${esc((x.d||'').slice(0,70))}${(x.d||'').length>70?'...':''}</div></div>`;

document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="chat.css">');
document.body.insertAdjacentHTML('beforeend',`
<button class="bkc-fab" aria-label="Open demo assistant"><span class="wordmark" style="font-weight:900;letter-spacing:.06em;font-size:1.05rem;color:#f5c542">YOUR RESTAURANT</span><span>Ask Your Restaurant<small>DEMO ASSISTANT</small></span></button>
<section class="bkc" role="dialog" aria-label="Your Restaurant demo assistant">
 <header class="bkc__head"><div class="bkc__av"><span class="wordmark" style="font-weight:900;letter-spacing:.06em;font-size:1.05rem;color:#f5c542">YOUR RESTAURANT</span></div><div><b>Your Restaurant Assistant</b><small><i></i>Instant answers, 24/7</small></div><button class="bkc__x" aria-label="Close">&times;</button></header>
 <div class="bkc__demo">DEMO ASSISTANT &middot; SAMPLE BY APEX LEAD GROUP &middot; NOTHING IS SENT</div>
 <div class="bkc__log" aria-live="polite"></div>
 <div class="bkc__chips"></div>
 <form class="bkc__form"><input placeholder="Ask about hours, wings, events..." aria-label="Message"><button>Send</button></form>
</section>`);
const $=s=>document.querySelector(s),box=$('.bkc'),log=$('.bkc__log'),chips=$('.bkc__chips'),inp=$('.bkc__form input');
let flow=null,bk={};
const CH=['Are you open?','Book a private event','Best sellers','Wing sauces','Tonight\'s event','Order online','Where are you?'];
function setChips(a){chips.innerHTML=a.map(c=>`<button type="button">${c}</button>`).join('');chips.querySelectorAll('button').forEach(b=>b.onclick=()=>send(b.textContent))}
function add(h,me){const d=document.createElement('div');d.className='bkc__m bkc__m--'+(me?'me':'bot');d.innerHTML=h;log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
function bot(h,c){const t=add('<div class="bkc__typing"><i></i><i></i><i></i></div>');t.style.padding=0;setTimeout(()=>{t.style.padding='';t.innerHTML=h;log.scrollTop=log.scrollHeight;setChips(c||CH)},window.BKC_FAST?0:550)}
function open(){box.classList.add('open');$('.bkc-fab').style.display='none';if(!log.children.length)bot(`Hey! I'm Your Restaurant's assistant. I can help with <b>hours, the menu, wings, events</b>, ordering, or <b>booking a private event</b>. What's up?`)}
$('.bkc-fab').onclick=open;$('.bkc__x').onclick=()=>{box.classList.remove('open');$('.bkc-fab').style.display=''};
window.BKC_open=open;

function hoursAns(){const d=today(),k=DAYS[d];return `Today (${FULL[d]}) the <b>bar is open ${f(BAR[k])}</b> and the <b>kitchen ${f(KIT[k])}</b>, Mountain Time. 21+ only, valid ID required.<br><br>The live open/closed light is at the top of the page.`}
function weekHours(){return '<b>Bar / Kitchen</b><ul>'+[1,2,3,4,5,6,0].map(i=>`<li>${DAYS[i]}: ${f(BAR[DAYS[i]])} / ${f(KIT[DAYS[i]])}</li>`).join('')+'</ul>'}
function menuSearch(t){const w=t.split(/\W+/).filter(x=>x.length>3&&!/what|have|your|with|does|price|much|cost|menu|there|food|about|tell/.test(x));if(!w.length)return[];return M.filter(x=>w.some(q=>(x.n+' '+x.d).toLowerCase().includes(q.replace(/s$/,''))))}

function answer(raw){
 const t=raw.toLowerCase();
 if(flow)return booking(raw);
 if(/private|party|book|reserv|birthday|corporate|group|event space/.test(t)&&!/tonight/.test(t)){flow='name';bk={};return bot(`Love it. Birthdays, corporate events and group celebrations, with packages built around you.<br><br>Let's start a request. <b>What name should it go under?</b>`,['Cancel'])}
 if(/open|hour|close|kitchen|late/.test(t))return bot(/week|every|all|sunday|monday|tuesday|wednesday|thursday|friday|saturday|weekend/.test(t)?weekHours():hoursAns());
 if(/order|takeout|take out|pickup|pick up|deliver|toast/.test(t))return bot(`You can order takeout online through online ordering page:<br><a href="${TOAST}" target="_blank" rel="noopener">Order online &rarr;</a>`);
 if(/where|address|locat|direction|park|map/.test(t))return bot(`We're at <b>${ADDR}</b>, (example address).<br><a href="${MAPS}" target="_blank" rel="noopener">Open in Google Maps &rarr;</a>`);
 if(/phone|call|number|talk|human|person|manager|email/.test(t))return bot(`Call the team at <a href="${TEL}">${PHONE}</a> or email <a href="mailto:hello@example.com">hello@example.com</a>.`);
 if(/tonight|today|event|trivia|karaoke|bingo|poker|music|band|week|what.?s on/.test(t)){const d=today();if(/tonight|today|what.?s on/.test(t))return bot(`Tonight (${FULL[d]}): <b>${WEEK[d]}</b>.<br><br>Full lineup and tickets on the <a href="#week" target="_blank" rel="noopener">events page</a>.`);return bot('<b>Every week at Your Restaurant</b><ul>'+[1,2,3,4,5,6,0].map(i=>`<li>${DAYS[i]}: ${WEEK[i]}</li>`).join('')+'</ul>')}
 if(/sauce|wing|rub/.test(t)){const w=M.find(x=>x.n==='Wings, Bone-In');return bot(`Wings come <b>bone-in or boneless</b> in sauces like: ${w.d.split(': ')[1].replace(' Full order.','')}${card(w)}`)}
 if(/21|kid|child|minor|age|family/.test(t))return bot(`Your Restaurant is <b>21+ only</b>, valid ID required.`);
 if(/drink|beer|cocktail|wine|margarita|happy hour|special|deal|game day/.test(t))return bot(`The drink list and game-day specials aren't posted online yet, so I don't want to guess. Call <a href="${TEL}">${PHONE}</a> and the bar team will fill you in.`);
 if(/sports|game|tv|screen|watch|nfl|ufc|jazz|football/.test(t))return bot(`Wall-to-wall screens and every game on. For whether a specific game is on, call <a href="${TEL}">${PHONE}</a>.`);
 if(/best|popular|recommend|favorite|signature|good|must/.test(t)){const fav=M.filter(x=>x.c==='Favorites').slice(0,3);return bot(`Here are a few example favorites. A few house favorites:${fav.map(card).join('')}`)}
 if(/brunch|breakfast|waffle|pancake/.test(t)){const b=M.filter(x=>x.c==='Brunch');return bot(`Weekend brunch has <b>${b.length} items</b>, doors at 10AM Sat and Sun. A couple:${b.slice(0,2).map(card).join('')}`)}
 if(/vegetarian|vegan|gluten|allerg|dairy|nut/.test(t))return bot(`For allergies and dietary needs, please check with the kitchen directly at <a href="${TEL}">${PHONE}</a> so you get an accurate answer.`);
 const hits=menuSearch(t);if(hits.length)return bot(`Here's what I found on the menu:${hits.slice(0,3).map(card).join('')}${hits.length>3?`<br>Plus ${hits.length-3} more in the menu section above.`:''}`);
 if(/menu|food|eat|hungry/.test(t))return bot(`The menu has <b>${M.length} items</b>: appetizers, burgers, mac n' cheese, tacos, salads, sandwiches, brunch and desserts. Try asking "burgers" or "tacos".`);
 if(/^(hi|hey|hello|yo|sup)/.test(t))return bot(`Hey! Ask me about hours, wings, tonight's event, or booking a party.`);
 bot(`I'm not sure about that one, and I'd rather not guess. The team can help at <a href="${TEL}">${PHONE}</a>.`);
}
function booking(raw){
 const v=raw.trim();
 if(/^cancel$/i.test(v)){flow=null;return bot('No problem, request canceled. Anything else?')}
 if(flow==='name'){bk.name=v;flow='date';return bot(`Thanks, ${esc(v.split(' ')[0])}! <b>What date are you thinking?</b>`,['This Friday','Next Saturday','Not sure yet','Cancel'])}
 if(flow==='date'){bk.date=v;flow='size';return bot(`Got it. <b>About how many people?</b>`,['10 to 20','20 to 40','40+','Cancel'])}
 if(flow==='size'){bk.size=v;flow=null;return bot(`<div class="bkc__ok"><h4>Request ready (demo)</h4>Name: <b>${esc(bk.name)}</b><br>Date: <b>${esc(bk.date)}</b><br>Party size: <b>${esc(bk.size)}</b><br><br><span class="verify">DEMO</span> This is a sample. Nothing was sent. On the live site, this request would go straight to the manager with a text alert, and you'd get a confirmation.</div>`)}
}
function send(v){v=v.trim();if(!v)return;add(esc(v),1);inp.value='';answer(v)}
$('.bkc__form').onsubmit=e=>{e.preventDefault();send(inp.value)};
})();
