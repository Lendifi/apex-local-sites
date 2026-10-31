/* Lead forms on blog, free-audit, and checklist pages.
   Same endpoint, key, headers, and body shape as the homepage form in /app.js.
   apex-lead-submit has no "source" field, so the page is recorded via page_url (already stored)
   and a short [tag] at the start of notes. No new tables or functions. */
(()=>{
const FN="https://cevwtjemggmnqprazabj.supabase.co/functions/v1/apex-lead-submit";
const ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnd0amVtZ2dtbnFwcmF6YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzk5NzEsImV4cCI6MjEwNjkxNTk3MX0.EJuoAEn2eAEm_sdilk_pvR69qHWkVrOvv55SclOr4VE";
document.querySelectorAll("form.lf").forEach(F=>{
 const q=s=>F.querySelector(s),qa=s=>[...F.querySelectorAll(s)];
 F.addEventListener("submit",async e=>{e.preventDefault();const err=q(".ferr");err.style.display="none";qa(".bad").forEach(x=>x.classList.remove("bad"));
  const v=n=>(F.elements[n]?F.elements[n].value:"").trim();const bad=[];if(!v("name"))bad.push("name");if(!v("business_name"))bad.push("business_name");const dg=v("phone").replace(/\D/g,"");if(dg.length<10||dg.length>11)bad.push("phone");if(v("email")&&!/^\S+@\S+\.\S+$/.test(v("email")))bad.push("email");
  bad.forEach(n=>F.elements[n].classList.add("bad"));const cons=q(".lconsent").checked;
  if(bad.length||!cons){err.style.display="block";err.textContent=bad.length?"Please check the highlighted fields.":"Please check the consent box so Sam can call you.";return}
  const tag="["+(F.dataset.source||"blog")+"]",site=v("site");
  const notes=[tag,site?"Current website: "+site+".":"",v("notes")].filter(Boolean).join(" ").slice(0,2000);
  const body={name:v("name"),business_name:v("business_name"),phone:v("phone"),email:v("email"),industry:v("industry"),city:v("city"),needs:qa('input[name="needs"]:checked').map(c=>c.value),best_time:v("best_time"),notes,company_website:v("company_website"),consent:true,consent_text:q(".ctext").textContent.trim(),page_url:location.href};
  const btn=q("button[type=submit]"),lbl=btn.textContent;btn.disabled=true;btn.textContent="Sending...";
  try{const r=await fetch(FN,{method:"POST",headers:{"Content-Type":"application/json",apikey:ANON,Authorization:"Bearer "+ANON},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok||!j.ok)throw new Error(j.error||r.status);
   qa("input,select,textarea,fieldset,.consent,button,.fhint").forEach(x=>x.style.display="none");q(".fok").style.display="block"}
  catch(x){err.style.display="block";err.innerHTML='Sorry, something went wrong sending your request. Please call or text <a href="tel:+13853740315">(385) 374-0315</a>.';btn.disabled=false;btn.textContent=lbl}});
});
})();
