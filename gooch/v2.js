const $=(s,r=document)=>r.querySelector(s);
const DEMO={name:'Jordan M.',address:'123 Example St, Lehi, UT',email:'jordan@example.com',phone:'(555) 010-0177',veh:'Sample truck'};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SHOP='1180 N Geneva Rd, Orem, UT 84057';
/* Services come from the shop's own Google listing text and customer reviews (same list as the main concept). */
const SVC=[['Diesel Repair','Diesel trucks and engines, right in the shop name.'],['Engine Rebuilds and Replacements','Complete engine swaps and rebuilds.'],['Transmission Work','Transmission replacements and rebuilds.'],['Off-Road Builds and Installs','Aftermarket part installs and full builds.'],['Shock Rebuilds and Recharge','Get your suspension back to 100%.'],['Diff Gear Swaps and Lockers','Gear swaps and locker installs.'],['Custom Fabrication and Welding','Bumpers, brackets, and custom work.'],['Lift and Level Kits','Level kits and lift installs.'],['Brakes','Brake service and repair.'],['Oil Change and Maintenance','Oil changes, A/C recharge, tire rotation.'],['Diagnostics and Electrical','Find the real problem first.'],['Pre-Purchase Inspections','Know what you are buying.']];
$('#qsvc').innerHTML=SVC.map(s=>`<option>${s[0]}</option>`).join('');
const f=$('#qf');$('#qfill').onclick=()=>{for(const k in DEMO)if(f[k])f[k].value=DEMO[k]};
f.onsubmit=e=>{e.preventDefault();const d={};const miss=['name','phone','email','address'].filter(k=>!(d[k]=f[k].value.trim()));
 if(miss.length){$('#qerr').textContent='Please add your '+miss.join(', ')+'.';return}
 if(!/^\S+@\S+\.\S+$/.test(d.email)){$('#qerr').textContent='That email looks off.';return}
 $('#qerr').textContent='';const svc=f.svc.value,slot=f.slot.value,veh=f.veh.value.trim()||'Vehicle not given';
 $('#qout').innerHTML=`<div class="conf"><b>✅ Appointment booked (demo): ${esc(svc)}</b><br>${esc(slot)} · Drop-off at ${SHOP}<br>${esc(veh)}<br>Name: ${esc(d.name)}<br>Address: ${esc(d.address)}<br>Email: ${esc(d.email)}<br>Phone: ${esc(d.phone)}</div><div class="cal"><b>📅 Owner calendar: ${esc(svc)}</b><br>${esc(slot)} · Customer drop-off at the shop<br>Customer: ${esc(d.name)} · ${esc(d.phone)} · ${esc(d.email)}<br>Customer address: ${esc(d.address)}<br><span class="fine">Added to the Gooch calendar, text reminder queued (simulated). Nothing is sent or stored.</span></div>`};
