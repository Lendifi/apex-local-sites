(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const svg=id=>`<svg><use href="#${id}"/></svg>`;
$("#yr").textContent=new Date().getFullYear();

/* nav, progress, cursor glow */
addEventListener("scroll",()=>{const h=document.documentElement;$("#nav").classList.toggle("s",scrollY>30);$("#prog").style.width=(scrollY/(h.scrollHeight-innerHeight)*100)+"%";tlFill();},{passive:true});
const cur=$("#cur");addEventListener("pointermove",e=>{cur.style.left=e.clientX+"px";cur.style.top=e.clientY+"px"},{passive:true});

/* hero rotating word */
const words=["book jobs","answer calls","text back","get reviews","win Google"];let wi=0;
setInterval(()=>{const r=$("#rot");r.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-20px)"}],{duration:250}).onfinish=()=>{wi=(wi+1)%words.length;r.textContent=words[wi];r.animate([{opacity:0,transform:"translateY(20px)"},{opacity:1,transform:"none"}],{duration:300})}},2600);

/* hero canvas: mountain mesh */
(function(){const c=$("#mesh"),x=c.getContext("2d");let w,h,t=0,pts=[];
function rs(){w=c.width=c.offsetWidth*devicePixelRatio;h=c.height=c.offsetHeight*devicePixelRatio;pts=[];for(let i=0;i<70;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4})}
rs();addEventListener("resize",rs);
function fr(){t+=.006;x.clearRect(0,0,w,h);
 for(let L=0;L<3;L++){x.beginPath();x.moveTo(0,h);for(let i=0;i<=40;i++){const X=i/40*w,Y=h*(.62+L*.1)-Math.abs(Math.sin(i*.35+L*1.7+t*(L+1)*.5))*h*(.22-L*.05)-Math.sin(i*.9+t)*12;x.lineTo(X,Y)}x.lineTo(w,h);x.closePath();x.fillStyle=["rgba(56,225,255,.05)","rgba(198,255,61,.05)","rgba(255,79,163,.04)"][L];x.fill()}
 pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1});
 x.lineWidth=1;for(let i=0;i<pts.length;i++){for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);if(d<150*devicePixelRatio){x.strokeStyle=`rgba(56,225,255,${.18*(1-d/(150*devicePixelRatio))})`;x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.stroke()}}x.fillStyle="rgba(198,255,61,.6)";x.fillRect(pts[i].x,pts[i].y,2,2)}
 requestAnimationFrame(fr)}fr()})();

/* marquee */
const mq=["Websites","AI chat","AI receptionist","Online booking","Missed-call text-back","Google Business Profile care","Local SEO","Lead reports","Review requests"];
$("#mq").innerHTML=[...mq,...mq].map(m=>`<span>${m}</span><span>&#9650;</span>`).join("");

/* problems */
const P=[["i-miss","Missed calls","You're on a job and can't pick up. Most callers won't leave a voicemail. They call the next company.","An AI receptionist answers every call 24/7, books the job or takes a message, and texts you a summary. Or start simpler with missed-call text-back."],
["i-form","Forms that go nowhere","The contact form sends to an inbox nobody checks, or it quietly broke months ago.","Every form goes to your phone as a text and an email, gets logged in a lead sheet, and we test it at launch and every month."],
["i-cal","No online booking","Customers can only reach you by phone during business hours. At 10 PM they give up.","A Book Now button connected to your Google Calendar, Calendly, Jobber, or Housecall Pro so they can grab a time any hour."],
["i-clock","Slow replies","The first business to respond usually gets the job. Hours-later replies lose.","AI chat on your site answers right away and gathers the job details, and every form gets an auto-reply within a minute."],
["i-pin","Weak Google profile","Old hours, few photos, wrong categories, and reviews nobody answered.","We clean it up once, then keep it fresh with weekly posts, new photos, and a reply to every review."],
["i-star","No reviews or follow-up","Happy customers forget to leave reviews, and open quotes never get a follow-up.","An automatic \"how'd we do?\" link after each job, and reminders on open quotes after 2 and 5 days."],
["i-mob","Bad on mobile","Slow pages, tiny text, and phone numbers you can't tap.","A fast, mobile-first site with tap-to-call, reviews up top, clear services and cities, and a short form."],
["i-chart","No tracking","You don't know which ads or pages actually bring in work.","Call and form tracking plus a one-page monthly report: calls, forms, bookings, and where they came from."]];
$("#pgrid").innerHTML=P.map((p,i)=>`<div class="pc rv" style="transition-delay:${i%4*80}ms" tabindex="0"><div class="in2"><div class="fa"><div class="ic">${svg(p[0])}</div><span class="tg">Problem</span><h3>${p[1]}</h3><p>${p[2]}</p></div><div class="ba"><div class="ic">${svg("i-check")}</div><span class="tg">How we fix it</span><h3>${p[1]}</h3><p>${p[3]}</p></div></div></div>`).join("")+"";
$("#pgrid").insertAdjacentHTML("afterend",'<p class="hint">Tip: tap a card to flip it.</p>');
$$(".pc").forEach(c=>c.addEventListener("click",()=>c.classList.toggle("f")));

/* ===== 1 chat demo ===== */
const chatbd=$("#chatbd"),chips=$("#chatchips");let chatRun=0;
function addMsg(t,who,cls=""){const d=document.createElement("div");d.className="msg "+who+" "+cls;d.innerHTML=t;chatbd.appendChild(d);chatbd.scrollTop=chatbd.scrollHeight}
async function bot(t,cls,id){const ty=document.createElement("div");ty.className="typing";ty.innerHTML="<i></i><i></i><i></i>";chatbd.appendChild(ty);chatbd.scrollTop=chatbd.scrollHeight;await sleep(700+Math.min(t.length*8,900));ty.remove();if(id!==chatRun)return;addMsg(t,"b",cls)}
function setChips(opts,cb){chips.innerHTML="";opts.forEach(o=>{const b=document.createElement("button");b.textContent=o;b.onclick=()=>{chips.innerHTML="";addMsg(esc(o),"u");cb(o)};chips.appendChild(b)})}
const FLOW={start:{t:"Hi! I'm the AI assistant for Example Plumbing Co. I can answer questions or get you booked. What's going on?",o:{"My water heater is leaking":"wh","Do you do drain cleaning?":"drain","What are your hours?":"hours"}},
hours:{t:"We're open Mon to Sat, 7 AM to 6 PM, and we take emergency calls 24/7. Want me to get you on the schedule?",o:{"Yes, book me":"city","Do you do drain cleaning?":"drain"}},
drain:{t:"Yes! Drain cleaning starts at $129 for most sinks and tubs (example price). Main line clogs are quoted on site. Want to book a visit?",o:{"Yes, book me":"city","My water heater is leaking":"wh"}},
wh:{t:"Sorry to hear that. Quick question so the tech comes prepared: is water actively pooling right now?",o:{"Yes, a lot":"urg","Just a small drip":"city"}},
urg:{t:"Got it. If you can, turn the cold water valve on top of the heater to off. I'm flagging this as urgent so the owner sees it right away.",o:{"Ok, done":"city"}},
city:{t:"We serve the whole Wasatch Front, from Salt Lake to Provo. What city are you in?",o:{"Salt Lake City":"slot","Sandy":"slot","Draper":"slot","Lehi":"slot","American Fork":"slot","Orem":"slot","Provo":"slot","Other city (type it)":"cityfree"}},
slot:{t:"Here are the next open times:",o:{"Today 4:00 PM":"name","Tomorrow 8:00 AM":"name","Tomorrow 1:00 PM":"name"}},
name:{t:"Perfect. To lock it in I just need your full name, service address, email, and phone. Fill in the quick form below (or tap \"Use demo info\").",o:{}},
done:{t:"",o:{"Start over":"start"}}};
let chatCtx={};
const CITY_KEYS=Object.keys(FLOW.city.o).filter(c=>FLOW.city.o[c]==="slot");
const DEMO_C={name:"Jordan M.",addr:"123 Example St, Lehi, UT",email:"jordan@example.com",phone:"(555) 010-0177"};
const vEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),vPhone=v=>v.replace(/\D/g,"").replace(/^1(?=\d{10}$)/,"").length===10;
const fmtPhone=v=>{const d=v.replace(/\D/g,"").replace(/^1(?=\d{10}$)/,"");return d.length===10?`(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`:v};
function contactForm(){const id=chatRun;chips.innerHTML=`<form class="cform" novalidate><small class="cfx">Demo form. Nothing is saved or sent.</small>
<label>Full name<input name="name" autocomplete="off" placeholder="First and last name"></label>
<label>Service address<input name="addr" autocomplete="off" placeholder="Street, city"></label>
<label>Email<input name="email" type="email" inputmode="email" autocomplete="off" placeholder="you@example.com"></label>
<label>Phone<input name="phone" type="tel" inputmode="tel" autocomplete="off" placeholder="(555) 010-0000"></label>
<p class="cerr" aria-live="polite"></p><div class="cbtns"><button type="button" class="cdemo">Use demo info</button><button type="submit" class="cgo">Confirm booking</button></div></form>`;
 const f=$("form",chips),err=$(".cerr",f);
 $(".cdemo",f).onclick=()=>{for(const k in DEMO_C)f.elements[k].value=DEMO_C[k];err.textContent="";$$("input",f).forEach(i=>i.classList.remove("bad"))};
 f.onsubmit=e=>{e.preventDefault();if(id!==chatRun)return;const v={};["name","addr","email","phone"].forEach(k=>v[k]=f.elements[k].value.trim().slice(0,80));
  const bad=[];if(v.name.length<2)bad.push(["name","your name"]);if(v.addr.length<5||!/\d/.test(v.addr))bad.push(["addr","a service address with a street number"]);if(!vEmail(v.email))bad.push(["email","a valid email"]);if(!vPhone(v.phone))bad.push(["phone","a 10-digit phone number"]);
  $$("input",f).forEach(i=>i.classList.toggle("bad",bad.some(b=>b[0]===i.name)));
  if(bad.length){err.textContent="Please add "+bad.map(b=>b[1]).join(", ")+".";f.elements[bad[0][0]].focus();return}
  v.phone=fmtPhone(v.phone);Object.assign(chatCtx,v);chips.innerHTML="";addMsg(`${esc(v.name)}<br>${esc(v.addr)}<br>${esc(v.email)}<br>${esc(v.phone)}`,"u");chatStep("done")}}
function cityInput(){const id=chatRun;chips.innerHTML='<input id="chatcity" type="text" placeholder="Type your city" aria-label="Your city" style="flex:1;min-width:140px;padding:8px 12px;border-radius:999px;border:1px solid rgba(127,127,127,.4);font:inherit;background:transparent;color:inherit"><button id="chatcitygo">Send</button>';const inp=$("#chatcity");inp.focus();const go=()=>{const v=inp.value.trim().slice(0,40);if(!v||id!==chatRun)return;chips.innerHTML="";addMsg(esc(v),"u");chatCtx.city=v;chatStep("slot",v)};$("#chatcitygo").onclick=go;inp.onkeydown=e=>{if(e.key==="Enter")go()}}
async function chatStep(k,ans){const id=chatRun;if(k==="cityfree"){cityInput();return}if(k==="slot"&&ans&&CITY_KEYS.includes(ans))chatCtx.city=ans;if(k==="name")chatCtx.time=ans;
 if(k==="slot"&&chatCtx.city){await bot(`Great, we cover ${esc(chatCtx.city)}.`,"",id);if(id!==chatRun)return}
 if(k==="done"){await bot(`<b>&#10003; You're booked!</b><br>${esc(chatCtx.time||"Tomorrow 8:00 AM")} &#183; ${esc(chatCtx.city||"Utah County")}<br>Plumbing visit<dl class="bkd"><dt>Name</dt><dd>${esc(chatCtx.name)}</dd><dt>Address</dt><dd>${esc(chatCtx.addr)}</dd><dt>Email</dt><dd>${esc(chatCtx.email)}</dd><dt>Phone</dt><dd>${esc(chatCtx.phone)}</dd></dl><small>Simulated: a confirmation would go to ${esc(chatCtx.email)} and ${esc(chatCtx.phone)}, and the owner's calendar gets all four details.</small>`,"card",id)}
 else await bot(FLOW[k].t,"",id);if(id!==chatRun)return;
 if(k==="name"){contactForm();return}
 setChips(Object.keys(FLOW[k].o),o=>{const nx=FLOW[k].o[o];if(nx==="start"){resetChat();return}chatStep(nx,o)})}
function resetChat(){chatRun++;chatbd.innerHTML="";chips.innerHTML="";chatCtx={};chatStep("start")}

/* ===== 2 call demo ===== */
const wave=$("#wave");for(let i=0;i<22;i++)wave.appendChild(document.createElement("i"));
let callRun=0,waveT=null,timerT=null;
const CALL=[["ai","Thanks for calling Example Plumbing Co. This is Example Plumbing's AI assistant. I can help you schedule or answer questions. How can I help?"],
["c","Hi, my kitchen sink is backing up and it smells pretty bad."],["ai","Sorry about that. I can get a plumber out. Can I get your name?"],
["c","Jordan M.",{name:"Jordan M."}],["ai","Thanks Jordan. What's the service address?"],["c","123 Example Street in Lehi.",{addr:"123 Example St, Lehi"}],
["ai","Got it, 123 Example Street, Lehi. What's the best email for your confirmation?"],["c","jordan@example.com"],
["ai","Let me spell that back: J O R D A N, at example dot com. Is that right?"],["c","Yes, that's right.",{email:"jordan@example.com"}],
["ai","And is (555) 010-0177, the number you're calling from, the best one to reach you?"],["c","Yep, that one.",{phone:"(555) 010-0177"}],
["ai","Is water overflowing onto the floor, or is it just slow and backing up?",{job:"Kitchen sink backup, odor"}],["c","Just backing up. Not flooding.",{urg:"Standard (not flooding)"}],
["ai","Okay. I have tomorrow at 9 AM or 1 PM open. Which works better?"],["c","9 works.",{appt:"Tomorrow 9:00 AM"}],
["ai","You're booked for tomorrow at 9 AM at 123 Example Street. You'll get a text and an email confirmation, and the tech will text when he's on the way. Anything else?"],["c","Nope, that's it. Thanks!"],["ai","Thanks Jordan, have a good night."]];
function waveOn(on){clearInterval(waveT);$$("#wave i").forEach(i=>i.style.height="6px");if(on)waveT=setInterval(()=>$$("#wave i").forEach(i=>i.style.height=(6+Math.random()*28)+"px"),120)}
function resetCall(){callRun++;waveOn(false);clearInterval(timerT);$("#ring").classList.remove("on");$("#ctimer").textContent="00:00";$("#cstat").textContent="Waiting";$("#tscript").innerHTML='<p style="color:var(--mut)">Press "Play the call" to hear how a call goes. The transcript shows up here line by line.</p>';$$("#capt div").forEach(d=>{d.classList.remove("got");$("b",d).textContent=""});$("#osms").classList.remove("show")}
async function playCall(){resetCall();const id=callRun,ts=$("#tscript");ts.innerHTML="";$("#ring").classList.add("on");$("#cstat").textContent="Ringing...";await sleep(1200);if(id!==callRun)return;
 $("#ring").classList.remove("on");$("#cstat").textContent="Connected \u00b7 AI answering";let s=0;timerT=setInterval(()=>{s++;$("#ctimer").textContent=String(s/60|0).padStart(2,"0")+":"+String(s%60).padStart(2,"0")},1000);
 for(const [w,t,cap] of CALL){if(id!==callRun)return;waveOn(true);const p=document.createElement("p");p.innerHTML=`<b class="${w==="c"?"c":""}">${w==="ai"?"AI assistant":"Caller"}:</b> `;ts.appendChild(p);
  for(const word of t.split(" ")){if(id!==callRun)return;p.append(word+" ");ts.scrollTop=ts.scrollHeight;await sleep(55)}
  if(cap)for(const k in cap){const d=$(`#capt [data-k="${k}"]`);$("b",d).textContent=cap[k];d.classList.add("got")}
  waveOn(false);await sleep(350)}
 clearInterval(timerT);$("#cstat").textContent="Call ended \u00b7 booked";
 $("#osmsb").innerHTML="New booking: Tomorrow 9:00 AM, kitchen sink backup (not flooding). Name: Jordan M. Address: 123 Example St, Lehi. Email: jordan@example.com. Phone: (555) 010-0177. Calendar event created. Full transcript in your dashboard.";$("#osms").classList.add("show")}
$("#callgo").onclick=playCall;

/* ===== 3 booking ===== */
const SV=[["Drain cleaning","1 hr"],["Water heater service","2 hr"],["Leak repair","1 hr"],["Free estimate","30 min"]];
let bk={};const today=new Date();
const workdays=[];{let d=new Date(today);while(workdays.length<5){d.setDate(d.getDate()+1);if(d.getDay()>0&&d.getDay()<6)workdays.push(new Date(d))}}
const SLOTS=["8:00 AM","9:00 AM","10:00 AM","1:00 PM","2:00 PM","3:00 PM"],HRS=["8","9","10","11","12","1","2","3","4"];
const BUSY={0:[0,3],1:[1,2,5],2:[0,4],3:[2,3],4:[1,6]};
function renderBook(){bk={};const bf=$("#bdet");if(bf){bf.reset();$$("input",bf).forEach(i=>i.classList.remove("bad"));$("#berr").textContent=""}$("#svc").innerHTML=SV.map((s,i)=>`<button data-i="${i}"><span>${s[0]}</span><small>${s[1]}</small></button>`).join("");
 $$("#svc button").forEach(b=>b.onclick=()=>{$$("#svc button").forEach(x=>x.classList.remove("on"));b.classList.add("on");bk.s=SV[b.dataset.i][0];chk()});
 const m=new Date(today.getFullYear(),today.getMonth(),1);$("#mon").textContent=today.toLocaleString("en-US",{month:"long",year:"numeric"});
 let h="SMTWTFS".split("").map(c=>`<div class="h">${c}</div>`).join("");for(let i=0;i<m.getDay();i++)h+="<div></div>";
 const dim=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
 for(let d=1;d<=dim;d++){const dt=new Date(today.getFullYear(),today.getMonth(),d);const wi=workdays.findIndex(w=>w.toDateString()===dt.toDateString());h+=`<button ${wi<0?"disabled":""} data-w="${wi}">${d}</button>`}
 if(workdays.some(w=>w.getMonth()!==today.getMonth()))h+=`<div style="grid-column:1/-1;font-size:.7rem;color:#888;text-align:left">More open days next month</div>`;
 $("#cal").innerHTML=h;$$("#cal button:not(:disabled)").forEach(b=>b.onclick=()=>{$$("#cal button").forEach(x=>x.classList.remove("on"));b.classList.add("on");bk.w=+b.dataset.w;bk.t=null;slots();chk()});
 if(!$$("#cal button:not(:disabled)").length){/* month rollover: list next workdays */$("#cal").innerHTML=workdays.map((w,i)=>`<button data-w="${i}" style="aspect-ratio:auto;padding:6px;grid-column:span 7">${w.toDateString()}</button>`).join("");$$("#cal button").forEach(b=>b.onclick=()=>{$$("#cal button").forEach(x=>x.classList.remove("on"));b.classList.add("on");bk.w=+b.dataset.w;bk.t=null;slots();chk()})}
 $("#slots").innerHTML='<small style="color:#888">Pick a day to see open times</small>';$("#btoast").style.display="none";renderWeek();chk()}
function slots(){const busy=BUSY[bk.w]||[];$("#slots").innerHTML=SLOTS.map((s,i)=>busy.includes(i)?"":`<button data-t="${s}">${s}</button>`).join("");$$("#slots button").forEach(b=>b.onclick=()=>{$$("#slots button").forEach(x=>x.classList.remove("on"));b.classList.add("on");bk.t=b.dataset.t;chk()})}
function chk(){const ok=!!(bk.s&&bk.w>=0&&bk.t);$("#bdet").classList.toggle("off",!ok);$("#bconf").disabled=!ok}
const slotRow=t=>({"8:00 AM":0,"9:00 AM":1,"10:00 AM":2,"1:00 PM":5,"2:00 PM":6,"3:00 PM":7})[t];
function renderWeek(nw){const W=$("#week");let h='<div></div>'+workdays.map(w=>`<div class="dh">${w.toLocaleDateString("en-US",{weekday:"short"})} ${w.getDate()}</div>`).join("");
 for(let r=0;r<HRS.length;r++){h+=`<div class="tm">${HRS[r]}</div>`;for(let c=0;c<5;c++){let e="";const bz=(BUSY[c]||[]).map(i=>slotRow(SLOTS[i]));if(bz.includes(r))e='<div class="ev x">Booked job</div>';if(nw&&nw.c===c&&nw.r===r)e=`<div class="ev nw">${esc(nw.s)}</div>`;h+=`<div class="c">${e}</div>`}}W.innerHTML=h}
$("#bdemo").onclick=()=>{const f=$("#bdet");for(const k in DEMO_C)f.elements[k].value=DEMO_C[k];$$("input",f).forEach(i=>i.classList.remove("bad"));$("#berr").textContent=""};
$("#bconf").onclick=()=>{const f=$("#bdet"),v={};["name","addr","email","phone"].forEach(k=>v[k]=f.elements[k].value.trim().slice(0,80));
 const bad=[];if(v.name.length<2)bad.push(["name","name"]);if(v.addr.length<5||!/\d/.test(v.addr))bad.push(["addr","service address"]);if(!vEmail(v.email))bad.push(["email","valid email"]);if(!vPhone(v.phone))bad.push(["phone","10-digit phone"]);
 $$("input",f).forEach(i=>i.classList.toggle("bad",bad.some(b=>b[0]===i.name)));
 if(bad.length){$("#berr").textContent="Please add your "+bad.map(b=>b[1]).join(", ")+".";f.elements[bad[0][0]].focus();return}
 $("#berr").textContent="";v.phone=fmtPhone(v.phone);const d=workdays[bk.w],ds=d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});
 renderWeek({c:bk.w,r:slotRow(bk.t),s:bk.s+": "+v.name});const t=$("#btoast");t.style.display="block";
 t.innerHTML=`<b>&#10003; Booked:</b> ${esc(bk.s)}, ${ds} at ${bk.t}.<div class="evd"><b>Calendar event: ${esc(bk.s)}: ${esc(v.name)}</b><span>Address: ${esc(v.addr)}</span><span>Phone: ${esc(v.phone)}</span><span>Email: ${esc(v.email)}</span></div><small>Simulated: confirmation to ${esc(v.email)} and ${esc(v.phone)}, reminder 24 hours before. Nothing is saved or sent.</small>`;$("#bconf").disabled=true};

/* ===== 4 missed call ===== */
let missRun=0;
async function playMiss(){const id=++missRun,sc=$("#mscr");$$(".bub",sc).forEach(b=>b.remove());$("#mcard").classList.remove("show");const st=$$("#msteps div");st.forEach(s=>s.classList.remove("on"));
 const step=async(i,ms)=>{await sleep(ms);if(id!==missRun)throw 0;st[i].classList.add("on")};
 const bub=(t,side)=>{const b=document.createElement("div");b.className="bub "+side;b.textContent=t;sc.appendChild(b);requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add("show")))};
 try{await step(0,500);await step(1,1100);$("#mcard").classList.add("show");await step(2,1400);
 bub("Hi, this is Example Plumbing Co. Sorry we missed your call! How can we help? Reply STOP to opt out.","r");await step(3,2000);
 bub("Hi! Our toilet keeps running and the shutoff valve is stuck. Can someone come this week?","l");await sleep(1600);if(id!==missRun)return;
 bub("Yes! I can do Thursday at 10 AM. To book it, please reply with your full name, service address, and email.","r");await sleep(1600);if(id!==missRun)return;
 bub("Jordan M., 123 Example St, Lehi, jordan@example.com","l");await sleep(1500);if(id!==missRun)return;
 bub("Booked: Thursday 10 AM for Jordan M. at 123 Example St, Lehi. Confirmation sent to jordan@example.com and (555) 010-0177.","r");await sleep(1200);if(id!==missRun)return;bub("Perfect, thank you!","l");await step(4,600)}catch(e){}}

/* ===== sliders ===== */
function slider(wrap,handle,clipEl){let on=false;const set=x=>{const r=wrap.getBoundingClientRect();let p=Math.max(2,Math.min(98,(x-r.left)/r.width*100));handle.style.left=p+"%";clipEl.style.clipPath=`inset(0 0 0 ${p}%)`};
 wrap.addEventListener("pointerdown",e=>{on=true;wrap.setPointerCapture(e.pointerId);set(e.clientX)});wrap.addEventListener("pointermove",e=>on&&set(e.clientX));wrap.addEventListener("pointerup",()=>on=false);
 return p=>{const r=wrap.getBoundingClientRect();set(r.left+r.width*p/100)}}
const gbpSet=slider($("#gbpba"),$("#gbph"),$("#gbpba .after")),siteSet=slider($("#sitecmp"),$("#siteh"),$("#sitecmp .new"));
function sweep(fn){let t=0;const iv=setInterval(()=>{t+=1;fn(50+Math.sin(t/12)*38);if(t>75){clearInterval(iv);fn(50)}},30)}

/* ===== 6 dashboard ===== */
const WK=[[14,5,2],[17,6,3],[15,4,4],[18,8,3]];
function playDash(){$$("#dash .kpi b").forEach(b=>{const n=+b.dataset.c,t0=performance.now();const f=now=>{const p=Math.min(1,(now-t0)/1400);b.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
 $("#bars").innerHTML=WK.map((w,i)=>`<div>${w.map((v,j)=>`<i style="background:${["#c6ff3d","#38e1ff","#ff4fa3"][j]}" data-h="${v/30*100}"></i>`).join("")}<span>Wk ${i+1}</span></div>`).join("");
 requestAnimationFrame(()=>requestAnimationFrame(()=>$$("#bars i").forEach(i=>i.style.height=i.dataset.h+"%")));
 const src=[["Google profile",38,"#c6ff3d"],["Website",27,"#38e1ff"],["AI receptionist",22,"#ff4fa3"],["Text-back",13,"#ffb020"]];let off=0,C=2*Math.PI*15.9;
 $("#donut").innerHTML=src.map(s=>{const c=`<circle cx="21" cy="21" r="15.9" stroke="${s[2]}" stroke-dasharray="0 ${C}" stroke-dashoffset="${-off/100*C}" data-d="${s[1]/100*C}"/>`;off+=s[1];return c}).join("");
 $("#dleg").innerHTML=src.map(s=>`<span><i style="background:${s[2]}"></i>${s[0]} ${s[1]}%</span>`).join("");
 setTimeout(()=>$$("#donut circle").forEach(c=>c.setAttribute("stroke-dasharray",`${c.dataset.d} ${C}`)),60)}

/* ===== 7 audit ===== */
const AUD={B:[["Mobile speed",38],["Mobile friendly",45],["SEO basics",52],["Tap to call","No"]],A:[["Mobile speed",96],["Mobile friendly",100],["SEO basics",98],["Tap to call","Yes"]]};
function audit(k){$("#aA").classList.toggle("on",k==="A");$("#aB").classList.toggle("on",k==="B");const C=2*Math.PI*30;
 $("#audit").innerHTML=AUD[k].map(([l,v])=>{const n=typeof v==="number"?v:(v==="Yes"?100:0);const col=n>=90?"#c6ff3d":n>=50?"#ffb020":"#ff4fa3";return `<div class="gauge"><svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="30" stroke="#22304d"/><circle cx="35" cy="35" r="30" stroke="${col}" stroke-dasharray="0 ${C}" data-d="${n/100*C}" style="transition:stroke-dasharray 1s"/></svg><div class="v" style="color:${col}">${v}</div>${l}</div>`}).join("")+'<div style="grid-column:1/-1;font-size:.7rem;color:var(--mut)">Example scores for illustration. We run a real audit on your site before we quote.</div>';
 setTimeout(()=>$$("#audit circle[data-d]").forEach(c=>c.setAttribute("stroke-dasharray",`${c.dataset.d} ${C}`)),50)}
$("#aA").onclick=()=>audit("A");$("#aB").onclick=()=>audit("B");

/* replay buttons */
$$(".replay").forEach(b=>b.onclick=()=>({chat:resetChat,call:playCall,book:renderBook,miss:playMiss})[b.dataset.r]());

/* ===== 8 calculator ===== */
const money=n=>"$"+Math.round(n).toLocaleString("en-US");
function calc(){const c=+$("#rC").value,m=+$("#rM").value,j=+$("#rJ").value,b=+$("#rB").value;$("#vC").textContent=c;$("#vM").textContent=m+"%";$("#vJ").textContent=money(j);$("#vB").textContent=b+"%";
 const mo=c*(m/100)*(b/100)*j*4.33,missed=c*m/100*4.33;$("#lost").textContent=money(mo);$("#lostY").textContent=`About ${money(mo*12)} a year, from roughly ${Math.round(missed)} missed calls a month`;
 const jobs=Math.max(1,Math.ceil(500/j));$("#vs").innerHTML=mo>0?`For comparison, the AI Receptionist add-on is $300/mo. At ${money(j)} a job, saving about ${jobs} job${jobs>1?"s":""} a month would cover it.`:"Nice, you're catching every call."}
$$("#calc input").forEach(i=>i.addEventListener("input",calc));calc();

/* ===== pricing from build.py data ===== */
const D=window.D;
$("#pk").innerHTML=D.P.map((p,i)=>`<div class="pcard rv ${p.k==="Local"?"rec":""}" style="transition-delay:${i*90}ms">${p.k==="Local"?'<span class="rb">MOST POPULAR PICK</span>':""}<h3>${p.k==="Growth"?"Growth (SEO)":p.k}</h3><p class="tag">${esc(p.tag)}</p><div class="price">${p.up}<small> upfront</small></div><div class="mo">+ ${p.mo}/month</div>${p.base?`<div class="bf">Everything in ${p.base}, plus:</div>`:""}<ul>${p.items.map(it=>`<li>${esc(it[0])}<div class="tip">${esc(it[1])}</div></li>`).join("")}</ul>${p.note?`<p class="best">${esc(p.note)}</p>`:""}<p class="best">Best for: ${esc(p.best)}</p><a class="btn btn-g" style="margin-top:14px;justify-content:center" href="#contact">Ask about ${p.k}</a></div>`).join("");
$$(".pcard li").forEach(l=>l.onclick=()=>l.classList.toggle("op"));
$("#cmp").innerHTML=`<tr><th>What's included</th>${["Starter","Local","Leads","Growth"].map((n,i)=>`<th class="${i===1?"rc":""}">${n}</th>`).join("")}</tr>`+D.C.map(([l,v])=>`<tr><td>${esc(l)}</td>${v.map((x,i)=>`<td class="${i===1?"rc":""}">${x==="Y"?'<span class="y">&#10003;</span>':x?esc(x):'<span style="color:#33456b">-</span>'}</td>`).join("")}</tr>`).join("");
const AD=[["AI Receptionist","$1,000","$300","Answers your phone 24/7 in your business name and tells callers it's an AI assistant. Books appointments, captures details, sends urgent calls to you, and texts you a summary. Includes 300 phone minutes a month (roughly 100 calls) and website chat. Extra minutes are $0.35 each, and we'll tell you before you get close."],
["Missed-Call Text-Back","$250","$99","When a call goes unanswered, the caller gets a friendly text within about a minute, and their reply comes straight to you. Only texts people who just called. Already included in Leads and Growth."],
["GBP Cleanup &amp; Care","$300","$199","One-time Google Business Profile cleanup (categories, services, hours, areas, description, photos), then weekly posts, new photos, replies to every review, and a short monthly report. Already included in Local and up."]];
$("#addons").innerHTML=AD.map(a=>`<div class="ad rv"><span class="kick" style="margin:0">Add-on</span><h3 style="margin:8px 0">${a[0]}</h3><div class="price">${a[1]}<small> setup</small> + ${a[2]}<small>/mo</small></div><p>${a[3]}</p></div>`).join("");
$("#terms").innerHTML=D.T.map(t=>{const i=t.indexOf(".");return `<div><b>${esc(t.slice(0,i+1))}</b>${esc(t.slice(i+1))}</div>`}).join("");

/* timeline */
const TL=[["Day 1","Free look at your business","Call or fill out the form. Sam reviews your current website and Google profile and tells you what's costing you leads."],
["Day 2 to 3","Free mockup","You see a preview of your new site with your real name, services, and reviews. No commitment."],
["Day 3","Pick a package and get set up","Choose a package, pay the upfront fee, and share access to your domain and Google profile. Your domain stays in your name."],
["Day 3 to 7","We build it","Site, forms, tap-to-call, and any add-ons you picked (AI receptionist, text-back, booking). You approve the greeting and the answers the AI may give."],
["About day 8","Launch and test","We go live within about 5 business days of getting your info and access, then test every form, call path, and booking."],
["Every month","Keep it working","Edits, Google profile upkeep, and a plain-English report on calls, forms, and bookings."]];
$("#tl").insertAdjacentHTML("beforeend",TL.map((s,i)=>`<div class="tst rv" data-n="${i+1}"><div class="when">${s[0]}</div><h3>${s[1]}</h3><p>${s[2]}</p></div>`).join(""));
function tlFill(){const t=$("#tl");if(!t)return;const r=t.getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight*.7-r.top)/r.height));$("#tlf").style.height=p*100+"%"}

/* industries */
const IN=[["Contractors","i-wrench","Roofers, plumbers, HVAC, painters, landscapers, fencing","You're on a roof or under a house when the phone rings. Every missed call can be a job worth hundreds or thousands.",[["AI receptionist","answers while you work"],["Missed-call text-back","saves callers before they move on"],["City pages","show up in every town you serve"],["Review requests","after each job, automatically"]]],
["Med spas","i-spark","Med spas, aesthetics, chiropractors, wellness","Your business runs on bookings and repeat visits. Clients want to book at night, from their phone, without calling.",[["Online booking","into your existing calendar"],["AI chat","answers treatment and pricing questions you approve"],["Reminders","to cut no-shows"],["GBP care","photos, posts, and review replies"]]],
["Auto repair","i-car","Auto repair, detailing, tire shops","Customers want to know if you can fit them in today and roughly what it costs.",[["AI receptionist","handles \"can you look at it today?\" calls"],["Booking","for drop-off slots"],["Quote follow-up","reminders after 2 and 5 days"],["Reviews","asked for after every pickup"]]],
["Restaurants","i-food","Restaurants, bars, cafes, catering","Your phone rings all day with \"are you open?\" and \"do you take reservations?\" while the kitchen is slammed.",[["AI phone help","hours, menu, and reservation questions"],["Menu that's always current","on your site and Google"],["Catering inquiry form","straight to your phone"],["Online ordering links","with fewer delivery app fees where possible"]]],
["Retail","i-bag","Boutiques, specialty shops, local stores","Shoppers check Google before they drive over. Old photos and wrong hours send them somewhere else.",[["GBP care","fresh product photos and correct hours"],["Product photo touch-ups","better lighting and cleanup, never misleading"],["Simple pickup ordering","for top products"],["AI chat","\"do you have this in stock?\" questions"]]]];
$("#tabs").innerHTML=IN.map((x,i)=>`<button class="${i?"":"on"}" data-i="${i}">${svg(x[1])}${x[0]}</button>`).join("");
$("#ipanels").innerHTML=IN.map((x,i)=>`<div class="ipanel ${i?"":"on"}"><div><span class="kick">${x[2]}</span><h3>${x[0]}</h3><p style="margin-top:10px">${x[3]}</p><a class="btn btn-p" style="margin-top:18px" href="#contact">Get a free mockup</a></div><ul>${x[4].map(l=>`<li><b>${l[0]}</b>: ${l[1]}</li>`).join("")}</ul></div>`).join("");
$$("#tabs button").forEach(b=>b.onclick=()=>{$$("#tabs button").forEach(x=>x.classList.remove("on"));b.classList.add("on");$$(".ipanel").forEach((p,i)=>p.classList.toggle("on",i==b.dataset.i))});

/* faq */
const FQ=[["How fast can my site go live?","Within about 5 business days once we have your business info and access to your domain."],
["Do I own my domain?","Yes. It's registered in your name and stays yours."],
["Is there a contract?","Every package has a 12-month minimum. Monthly billing starts when your site goes live."],
["Will the AI pretend to be a person?","No. It tells callers and chatters that it's an AI assistant. It only gives answers and prices you've approved, and it hands urgent calls to you."],
["What if I go over 300 AI phone minutes?","Extra minutes are $0.35 each, and we'll let you know before you get close."],
["Can you guarantee I'll rank #1 on Google?","No, and nobody honestly can. We do the work Google rewards and show you the results every month."],
["What counts as an edit?","Small updates like text, photos, hours, prices, or adding a service. Every package includes up to 30 minutes a month. Bigger projects are $75 an hour, and we always quote first."],
["Do I need a new phone number?","Not necessarily. We can forward your current number to the AI receptionist only when you don't answer, or set up a new tracked number."],
["Will text-back spam my customers?","No. It only texts people who just called you, includes a STOP opt-out, and is registered with the carriers as required."],
["Are the demos on this page real?","They're simulations that run in your browser with a made-up business and example data, so you can see how each piece works."]];
$("#faqs").innerHTML=FQ.map(f=>`<details class="rv"><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("");

/* lead form -> Supabase edge function */
const FN="https://cevwtjemggmnqprazabj.supabase.co/functions/v1/apex-lead-submit";
const ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnd0amVtZ2dtbnFwcmF6YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzk5NzEsImV4cCI6MjEwNjkxNTk3MX0.EJuoAEn2eAEm_sdilk_pvR69qHWkVrOvv55SclOr4VE";
const F=$("#cform");
F.addEventListener("submit",async e=>{e.preventDefault();const err=$("#ferr");err.style.display="none";$$(".bad",F).forEach(x=>x.classList.remove("bad"));
 const v=n=>F.elements[n].value.trim();const bad=[];if(!v("name"))bad.push("name");if(!v("business_name"))bad.push("business_name");const dg=v("phone").replace(/\D/g,"");if(dg.length<10||dg.length>11)bad.push("phone");if(v("email")&&!/^\S+@\S+\.\S+$/.test(v("email")))bad.push("email");
 bad.forEach(n=>F.elements[n].classList.add("bad"));const cons=$("#consent").checked;
 if(bad.length||!cons){err.style.display="block";err.textContent=bad.length?"Please check the highlighted fields.":"Please check the consent box so Sam can call you.";return}
 const body={name:v("name"),business_name:v("business_name"),phone:v("phone"),email:v("email"),industry:v("industry"),city:v("city"),needs:$$('input[name="needs"]:checked',F).map(c=>c.value),best_time:v("best_time"),notes:v("notes"),company_website:v("company_website"),consent:true,consent_text:$("#ctext").textContent.trim(),page_url:location.href};
 const btn=$("#fsub");btn.disabled=true;btn.textContent="Sending...";
 try{const r=await fetch(FN,{method:"POST",headers:{"Content-Type":"application/json",apikey:ANON,Authorization:"Bearer "+ANON},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||r.status);
  $$("input,select,textarea,fieldset,.consent,button",F).forEach(x=>x.style.display="none");$("#fok").style.display="block"}
 catch(x){err.style.display="block";err.innerHTML='Sorry, something went wrong sending your request. Please call or text <a href="tel:+13853740315">(385) 374-0315</a>.';btn.disabled=false;btn.textContent="Get my call back"}});

/* reveal + demo autostart */
const started=new Set();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add("in");const id=e.target.id;if(id&&!started.has(id)){started.add(id);({"d-chat":resetChat,"d-miss":playMiss,"d-dash":playDash,"d-gbp":()=>sweep(gbpSet),"d-site":()=>{sweep(siteSet);audit("A")}})[id]?.()}}),{threshold:.2});
$$(".rv,.demo").forEach(el=>io.observe(el));
renderBook();
window.__demo={playCall,playMiss,resetChat,playDash};
})();
