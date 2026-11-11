/* Detailed side-profile lifted diesel pickup (SVG, built here so wheels, lugs and springs stay consistent).
   Anatomy: engine bay under the hood, chunky tires, and suspension (coil-over shock + control arms) sitting
   between each axle/hub and the frame, directly above and inside each tire. */
(function(){
 var RX=232,FX=840,CY=290,R=82;
 function coil(cx,y0,y1,w,n){var p='M'+(cx-w)+' '+y0,st=(y1-y0)/n;for(var i=0;i<n;i++){p+=' L'+(cx+(i%2?-w:w))+' '+(y0+st*(i+.5))}return p+' L'+cx+' '+y1}
 function lugs(r,w,da){return '<circle r="'+r+'" fill="none" stroke="#050505" stroke-width="'+w+'" stroke-dasharray="'+da+'"/>'}
 function wheel(cx){
  var s='<g transform="translate('+cx+' '+CY+')">';
  s+='<circle r="'+R+'" fill="#08090a"/>'+lugs(R-5,10,'9 6')+'<circle r="'+(R-11)+'" fill="url(#tireG)"/>';
  s+='<circle r="'+(R-12)+'" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="2"/><circle r="52" fill="#101214"/>';
  s+='<circle r="47" fill="url(#rimG)"/><circle r="47" fill="none" stroke="#5c646b" stroke-width="2"/>';
  for(var i=0;i<8;i++){var a=i*45;s+='<g transform="rotate('+a+')"><rect x="-5" y="-45" width="10" height="26" rx="3" fill="#2a2e32"/><rect x="-3" y="-43" width="3" height="22" rx="1.5" fill="rgba(255,255,255,.35)"/></g>'}
  s+='<circle r="22" fill="#171a1d" stroke="#8a9299" stroke-width="2"/><circle r="9" fill="url(#rimG)"/>';
  for(i=0;i<8;i++){var b=i*45*Math.PI/180;s+='<circle cx="'+(Math.cos(b)*35).toFixed(1)+'" cy="'+(Math.sin(b)*35).toFixed(1)+'" r="2.6" fill="#cfd5da"/>'}
  s+='<path d="M-60 -50 A78 78 0 0 1 20 -76" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="6" stroke-linecap="round"/>';
  return s+'</g>'}
 function susp(cx,front){
  var s='<g class="part" data-part="suspension"><g class="ghost">';
  s+='<rect x="'+(cx-30)+'" y="226" width="60" height="66" rx="8" fill="rgba(6,8,10,.62)"/>';
  /* control arms: frame pivot to knuckle/hub, below the frame and above the axle */
  s+='<path d="M'+(cx-88)+' 250 L'+(cx-4)+' 284" stroke="#8b939a" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M'+(cx-88)+' 250 L'+(cx-4)+' 284" stroke="#3a4046" stroke-width="3" stroke-linecap="round" fill="none"/>';
  s+='<path d="M'+(cx-74)+' 234 L'+(cx-2)+' 268" stroke="#8b939a" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M'+(cx-74)+' 234 L'+(cx-2)+' 268" stroke="#3a4046" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  s+='<circle cx="'+(cx-88)+'" cy="250" r="6" fill="#c3c9ce" stroke="#2a2e32" stroke-width="2"/><circle cx="'+(cx-74)+'" cy="234" r="5" fill="#c3c9ce" stroke="#2a2e32" stroke-width="2"/>';
  /* coil-over shock: body + coil spring, mounted frame-to-axle right above the hub */
  s+='<rect x="'+(cx-5)+'" y="236" width="10" height="52" rx="3" fill="#b9bfc4" stroke="#2a2e32" stroke-width="1.5"/><rect x="'+(cx-2)+'" y="240" width="3" height="44" rx="1.5" fill="rgba(255,255,255,.55)"/>';
  s+='<path d="'+coil(cx,240,286,19,8)+'" fill="none" stroke="#e0e4e7" stroke-width="3.4" stroke-linejoin="round"/><path d="'+coil(cx,240,286,19,8)+'" fill="none" stroke="#5b6269" stroke-width="1.2" stroke-linejoin="round"/>';
  s+='<rect x="'+(cx-14)+'" y="228" width="28" height="9" rx="2" fill="#d0d5d9" stroke="#2a2e32" stroke-width="1.5"/><rect x="'+(cx-12)+'" y="286" width="24" height="9" rx="2" fill="#d0d5d9" stroke="#2a2e32" stroke-width="1.5"/>';
  s+='</g><g class="hl" fill="none" stroke="#ff6a13" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">';
  s+='<path d="'+coil(cx,240,286,19,8)+'"/><path d="M'+(cx-88)+' 250 L'+(cx-4)+' 284"/><path d="M'+(cx-74)+' 234 L'+(cx-2)+' 268"/><rect x="'+(cx-5)+'" y="236" width="10" height="52" rx="3"/><rect x="'+(cx-14)+'" y="228" width="28" height="9" rx="2"/><rect x="'+(cx-12)+'" y="286" width="24" height="9" rx="2"/>';
  s+='<circle class="pulse" cx="'+cx+'" cy="262" r="40" stroke-width="2"/></g></g>';
  return s}
 var defs='<defs>'
 +'<linearGradient id="paintG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#555c64"/><stop offset=".3" stop-color="#2c3036"/><stop offset=".72" stop-color="#17191c"/><stop offset="1" stop-color="#0c0d0f"/></linearGradient>'
 +'<linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fb0c6"/><stop offset=".5" stop-color="#2b3d4b"/><stop offset="1" stop-color="#0f1820"/></linearGradient>'
 +'<linearGradient id="chromeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c7378"/><stop offset=".35" stop-color="#f4f6f7"/><stop offset=".7" stop-color="#9aa1a6"/><stop offset="1" stop-color="#555b60"/></linearGradient>'
 +'<linearGradient id="steelG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a828a"/><stop offset="1" stop-color="#2a2e32"/></linearGradient>'
 +'<radialGradient id="tireG" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#2d3135"/><stop offset="1" stop-color="#0b0c0d"/></radialGradient>'
 +'<radialGradient id="rimG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f1f4f6"/><stop offset="1" stop-color="#7d868d"/></radialGradient>'
 +'<radialGradient id="headG" cx=".7" cy=".5" r=".8"><stop offset="0" stop-color="#ffffe8"/><stop offset="1" stop-color="#c8a94a"/></radialGradient>'
 +'<linearGradient id="tailG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6a5a"/><stop offset="1" stop-color="#8f1209"/></linearGradient>'
 +'<radialGradient id="shadowG"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'
 +'<linearGradient id="shineG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
 +'</defs>';
 var s=defs;
 s+='<line x1="10" y1="372" x2="1030" y2="372" stroke="#2b3237" stroke-width="3"/>';
 s+='<ellipse cx="'+RX+'" cy="373" rx="110" ry="9" fill="url(#shadowG)"/><ellipse cx="'+FX+'" cy="373" rx="110" ry="9" fill="url(#shadowG)"/><ellipse cx="540" cy="373" rx="360" ry="8" fill="url(#shadowG)" opacity=".6"/>';
 /* underbody visible below the rocker: exhaust, driveshaft, diffs */
 s+='<path d="M420 300 H770" stroke="#4a5158" stroke-width="7" fill="none"/><path d="M420 298 H770" stroke="rgba(255,255,255,.18)" stroke-width="2" fill="none"/>';
 s+='<path d="M338 318 H700 Q712 318 712 326 V336" stroke="#6a7178" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M338 316 H700" stroke="rgba(255,255,255,.2)" stroke-width="2" fill="none"/>';
 s+='<ellipse cx="'+RX+'" cy="292" rx="22" ry="17" fill="#2a2e32" stroke="#4a5158" stroke-width="2"/><ellipse cx="'+FX+'" cy="292" rx="22" ry="17" fill="#2a2e32" stroke="#4a5158" stroke-width="2"/>';
 /* body */
 s+='<path d="M96 268 L96 180 Q96 176 102 176 L474 176 L482 176 L486 112 Q488 100 502 100 L680 100 Q692 100 700 110 L764 176 Q770 183 780 184 L932 190 Q958 192 964 210 L972 262 L966 276 L930 276 L930 268 Z" fill="url(#paintG)" stroke="#05060a" stroke-width="2" stroke-linejoin="round"/>';
 s+='<path d="M102 180 H472" stroke="rgba(255,255,255,.28)" stroke-width="2.4" fill="none"/><path d="M110 214 H470" stroke="rgba(255,255,255,.1)" stroke-width="2" fill="none"/><path d="M110 216 H470" stroke="rgba(0,0,0,.5)" stroke-width="2" fill="none"/>';
 s+='<path d="M496 106 H680 Q690 106 696 114" stroke="rgba(255,255,255,.3)" stroke-width="2.2" fill="none"/><path d="M776 188 L930 194" stroke="rgba(255,255,255,.3)" stroke-width="2.4" fill="none"/>';
 s+='<path d="M478 176 V268 M620 180 V268 M758 182 V268" stroke="rgba(0,0,0,.7)" stroke-width="2" fill="none"/><path d="M478 177 V268" stroke="rgba(255,255,255,.12)" stroke-width="1" fill="none" transform="translate(2 0)"/>';
 /* windows */
 s+='<path d="M494 172 L496 118 L614 118 L614 172 Z" fill="url(#glassG)" stroke="#05060a" stroke-width="2"/><path d="M626 172 L626 118 L676 118 Q686 118 692 126 L746 172 Z" fill="url(#glassG)" stroke="#05060a" stroke-width="2"/>';
 s+='<path d="M508 168 L520 122 L540 122 L528 168 Z M628 168 L640 122 L660 122 L648 168 Z" fill="url(#shineG)"/>';
 /* handles, mirror, fuel door, step bar */
 s+='<rect x="578" y="188" width="28" height="6" rx="3" fill="#aeb4b9" stroke="#05060a"/><rect x="716" y="190" width="28" height="6" rx="3" fill="#aeb4b9" stroke="#05060a"/>';
 s+='<path d="M758 150 Q770 150 772 142 Q772 134 760 134 L748 134 Z" fill="#14171a" stroke="#05060a" stroke-width="2"/><path d="M748 134 L742 150" stroke="#333" stroke-width="3"/>';
 s+='<rect x="440" y="196" width="22" height="26" rx="4" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>';
 s+='<rect x="500" y="264" width="258" height="12" rx="5" fill="url(#steelG)" stroke="#05060a" stroke-width="1.6"/><path d="M510 267 H748" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>';
 /* roof light bar, exhaust stack */
 s+='<rect x="548" y="86" width="116" height="12" rx="4" fill="#15181b" stroke="#05060a" stroke-width="1.5"/>';for(var i=0;i<9;i++)s+='<circle cx="'+(560+i*12)+'" cy="92" r="3.4" fill="#fff7c8"/>';
 s+='<rect x="548" y="98" width="6" height="4" fill="#0a0a0a"/><rect x="658" y="98" width="6" height="4" fill="#0a0a0a"/>';
 /* bumpers + lights + grille edge */
 s+='<rect x="82" y="276" width="30" height="40" rx="5" fill="url(#steelG)" stroke="#05060a" stroke-width="1.6"/><rect x="92" y="316" width="12" height="16" fill="#1a1d20" stroke="#05060a"/>';
 s+='<rect x="94" y="194" width="10" height="44" rx="3" fill="url(#tailG)" stroke="#05060a" stroke-width="1.5"/>';
 s+='<path d="M944 268 H986 Q992 268 992 276 V300 Q992 308 984 308 H942 Z" fill="url(#steelG)" stroke="#05060a" stroke-width="2"/><path d="M948 274 H986" stroke="rgba(255,255,255,.5)" stroke-width="2"/><circle cx="978" cy="296" r="5" fill="none" stroke="#0a0a0a" stroke-width="2.5"/>';
 s+='<path d="M946 198 Q962 198 966 208 L972 262 L944 262 Z" fill="#0c0d0f" stroke="#05060a" stroke-width="1.5"/>';for(i=0;i<7;i++)s+='<path d="M951 '+(216+i*7)+' H969" stroke="#3a4046" stroke-width="2.4"/>';
 s+='<path d="M934 196 L962 198 Q968 200 968 206 L966 214 L936 212 Z" fill="url(#headG)" stroke="#05060a" stroke-width="1.8"/><rect x="950" y="240" width="18" height="9" rx="3" fill="#ffc34a" stroke="#05060a" stroke-width="1.4"/>';
 s+='<path d="M820 186 L830 176 H872 L882 188" fill="#16191c" stroke="#05060a" stroke-width="1.6"/><path d="M836 180 H868" stroke="#000" stroke-width="3"/>';
 /* wheels + flares */
 s+='<circle cx="'+RX+'" cy="'+CY+'" r="94" fill="#050607"/><circle cx="'+FX+'" cy="'+CY+'" r="94" fill="#050607"/>';
 s+=wheel(RX)+wheel(FX);
 s+='<path d="M'+(RX-100)+' 292 A100 100 0 0 1 '+(RX+100)+' 292" fill="none" stroke="#0d0f11" stroke-width="12"/><path d="M'+(RX-100)+' 292 A100 100 0 0 1 '+(RX+100)+' 292" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2" transform="translate(0 -5)"/>';
 s+='<path d="M'+(FX-100)+' 292 A100 100 0 0 1 '+(FX+100)+' 292" fill="none" stroke="#0d0f11" stroke-width="12"/><path d="M'+(FX-100)+' 292 A100 100 0 0 1 '+(FX+100)+' 292" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2" transform="translate(0 -5)"/>';
 s+='<ellipse cx="'+(RX+8)+'" cy="372" rx="70" ry="3" fill="#000" opacity=".5"/><ellipse cx="'+(FX+8)+'" cy="372" rx="70" ry="3" fill="#000" opacity=".5"/>';
 /* x-ray: chassis frame rail ghost, between the springs */
 s+='<g opacity=".5"><rect x="118" y="222" width="820" height="14" rx="3" fill="#55606a" stroke="#05060a" stroke-width="1.5"/><path d="M122 226 H934" stroke="rgba(255,255,255,.3)"/></g>';
 /* x-ray: engine bay under the hood */
 s+='<g class="part" data-part="engine"><g class="ghost">';
 s+='<rect x="772" y="193" width="178" height="74" rx="10" fill="rgba(6,8,10,.7)" stroke="#93a0aa" stroke-width="1.6" stroke-dasharray="6 4"/>';
 s+='<rect x="916" y="200" width="20" height="60" rx="3" fill="#2a2e32" stroke="#9aa4ac" stroke-width="1.5"/>';for(i=0;i<9;i++)s+='<path d="M918 '+(204+i*6.4)+' H934" stroke="#9aa4ac" stroke-width="1"/>';
 s+='<circle cx="896" cy="230" r="21" fill="rgba(0,0,0,.4)" stroke="#9aa4ac" stroke-width="1.6"/><g transform="translate(896 230)">';for(i=0;i<5;i++)s+='<ellipse cx="0" cy="-11" rx="4.5" ry="10" fill="#6a737b" transform="rotate('+(i*72)+')"/>';s+='<circle r="4" fill="#cfd5da"/></g>';
 s+='<rect x="806" y="206" width="70" height="17" rx="4" fill="#4b545c" stroke="#9aa4ac" stroke-width="1.5"/>';for(i=0;i<6;i++)s+='<circle cx="'+(814+i*11)+'" cy="214" r="2" fill="#cfd5da"/>';
 s+='<rect x="802" y="223" width="78" height="36" rx="4" fill="#394047" stroke="#9aa4ac" stroke-width="1.5"/>';for(i=0;i<4;i++)s+='<rect x="'+(808+i*18)+'" y="228" width="12" height="24" rx="2" fill="rgba(255,255,255,.07)"/>';
 s+='<path d="M814 259 H868 L862 266 H820 Z" fill="#2a2e32" stroke="#9aa4ac" stroke-width="1.4"/>';
 s+='<rect x="814" y="196" width="46" height="9" rx="3" fill="#59626a" stroke="#9aa4ac" stroke-width="1.3"/><path d="M806 214 H792 V226" stroke="#9aa4ac" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="784" cy="234" r="12" fill="#2a2e32" stroke="#9aa4ac" stroke-width="1.8"/><circle cx="784" cy="234" r="5" fill="#9aa4ac"/>';
 s+='<circle cx="888" cy="250" r="6" fill="none" stroke="#9aa4ac" stroke-width="1.5"/><path d="M880 238 L888 244" stroke="#9aa4ac" stroke-width="1.5"/>';
 s+='</g><g class="hl" fill="none" stroke="#ff6a13" stroke-width="3" stroke-linejoin="round"><rect x="772" y="193" width="178" height="74" rx="10"/><rect x="806" y="206" width="70" height="17" rx="4"/><rect x="802" y="223" width="78" height="36" rx="4"/><circle cx="896" cy="230" r="21"/><circle cx="784" cy="234" r="12"/><rect x="916" y="200" width="20" height="60" rx="3"/><circle class="pulse" cx="860" cy="230" r="80" stroke-width="2"/></g></g>';
 /* tires highlight */
 s+='<g class="part" data-part="tires"><g class="hl" fill="none" stroke="#ff6a13" stroke-width="4"><circle cx="'+RX+'" cy="'+CY+'" r="'+(R+4)+'"/><circle cx="'+FX+'" cy="'+CY+'" r="'+(R+4)+'"/><circle cx="'+RX+'" cy="'+CY+'" r="49" stroke-width="3"/><circle cx="'+FX+'" cy="'+CY+'" r="49" stroke-width="3"/></g></g>';
 /* suspension at each wheel */
 s+=susp(RX,false)+susp(FX,true);
 /* exhaust stack (diesel) drawn last so it reads over the bed rail */
 s+='<rect x="462" y="64" width="10" height="132" rx="3" fill="url(#chromeG)" stroke="#05060a" stroke-width="1.2"/><rect x="460" y="60" width="14" height="8" rx="2" fill="url(#chromeG)" stroke="#05060a"/>';
 document.getElementById('truckSvg').innerHTML=s;
})();
