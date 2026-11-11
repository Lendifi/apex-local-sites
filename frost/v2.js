const $=(s,r=document)=>r.querySelector(s);
const DEMO={name:'Jordan M.',address:'123 Example St, Sandy, UT',email:'jordan@example.com',phone:'(555) 010-0177'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SVC=[['🌱','New Lawns (Sod)'],['💧','Sprinkler Systems'],['🪨','Stone Patios'],['🧱','Paver Patios'],['🌵','Xeriscaping'],['⛰️','Retaining Walls'],['⛲','Water Features'],['🏗️','Stamped Concrete'],['🌳','Trees and Shrubs'],['💡','Outdoor Lighting'],['🌧️','Drainage and Erosion Control'],['🍃','Organic Fertilization'],['🏢','Commercial Maintenance'],['❄️','Snow and Ice Management']];
$('#svcGrid').innerHTML=SVC.map(s=>`<div class="s"><i>${s[0]}</i><span>${s[1]}</span></div>`).join('');
$('#quoteSvc').innerHTML=SVC.map(s=>`<option>${s[1]}</option>`).join('');
const qf=$('#quoteForm');$('.fill',qf).onclick=()=>{for(const k in DEMO)qf[k].value=DEMO[k]};
qf.onsubmit=e=>{e.preventDefault();const o=$('.out',qf),er=$('.err',qf);const d={};const miss=['name','phone','email','address'].filter(k=>!(d[k]=qf[k].value.trim()));
 if(miss.length){er.textContent='Please add your '+miss.join(', ')+'.';return}
 if(!/^\S+@\S+\.\S+$/.test(d.email)){er.textContent='That email looks off.';return}
 er.textContent='';const svc=qf.svc.value,slot=qf.slot.value;
 o.innerHTML=`<div class="conf"><b>✅ Estimate booked: ${esc(svc)}</b><br>${esc(slot)}<br>Name: ${esc(d.name)}<br>Address: ${esc(d.address)}<br>Email: ${esc(d.email)}<br>Phone: ${esc(d.phone)}</div><div class="cal"><b>📅 Calendar event: Frost estimate</b><br>${esc(slot)} · On site at ${esc(d.address)}<br>Customer: ${esc(d.name)} · ${esc(d.phone)} · ${esc(d.email)}<br><span class="fine">Demo only. Nothing is sent or stored.</span></div>`};
