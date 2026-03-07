// ╔═══════════════════════════════════════════════════════════════════╗
// ║   FRANCIS HACKER ADMIN PANEL v3.0 — MAXIMUM OVERDRIVE            ║
// ║   Ctrl×3 (desktop) | Tap FRANCIS logo ×3 (mobile)                ║
// ╚═══════════════════════════════════════════════════════════════════╝
(function(){
'use strict';

const ADMIN_KEY='francis_admin', PASS_KEY='francis_admin_pass', LOG_KEY='francis_visitor_log';
const NOTE_KEY='francis_notes', VAULT_KEY='francis_vault', DEFAULT_PASS='francis2025';

const ls  = k     => { try{return JSON.parse(localStorage.getItem(k));}catch{return null;} };
const lss = (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch{} };
const GA  = ()    => ls(ADMIN_KEY)||{};
const SA  = d     => lss(ADMIN_KEY, Object.assign(GA(),d));
const GM  = ()    => { try{return JSON.parse(localStorage.getItem('francis_monitor')||'{}');}catch{return{};} };
const fmt = n     => (n||0).toLocaleString();
const esc = s     => String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const fmtT= s     => { if(!s||s<1)return'0s';if(s<60)return s+'s';if(s<3600)return Math.floor(s/60)+'m';return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m'; };
const hex = ()    => Math.random().toString(16).slice(2,10).toUpperCase();
const uid = ()    => [hex(),hex(),hex(),hex()].join('-');

// log visit
(()=>{ const l=ls(LOG_KEY)||[]; l.push({t:Date.now(),ua:navigator.userAgent.slice(0,80),tz:Intl.DateTimeFormat().resolvedOptions().timeZone,scr:screen.width+'x'+screen.height}); if(l.length>300)l.splice(0,l.length-300); lss(LOG_KEY,l); })();

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const CSS = document.createElement('style');
CSS.textContent = `
:root{--g:#00ff41;--g2:#00cc33;--g3:#006615;--g4:#003a0d;--g5:#001a00;--bg:#020a02;--red:#ff3333;--yl:#ffcc00;--bl:#00aaff;--pur:#cc44ff;}
*{box-sizing:border-box;}
#adm{display:none;position:fixed;inset:0;z-index:99999;background:#000;font-family:'Courier New',monospace;overflow:hidden;flex-direction:column;}
#adm.on{display:flex;}

/* SCANLINE OVERLAY */
#adm::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px);pointer-events:none;z-index:1;animation:scanMove 8s linear infinite;}
@keyframes scanMove{from{background-position:0 0}to{background-position:0 100%}}

/* BOOT */
#adm-boot{position:absolute;inset:0;background:#000;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:20px;}
#adm-boot.gone{display:none;}
#boot-ascii{color:var(--g);font-size:.55rem;line-height:1.3;text-align:center;text-shadow:0 0 8px var(--g);margin-bottom:8px;}
#boot-log{width:min(440px,90vw);min-height:200px;font-size:.65rem;color:var(--g);line-height:1.7;text-align:left;}
#boot-bar-wrap{width:min(440px,90vw);background:var(--g5);border:1px solid var(--g4);border-radius:3px;height:6px;overflow:hidden;}
#boot-bar{height:6px;background:var(--g);width:0%;transition:width .08s;}
#boot-status{font-size:.55rem;color:var(--g3);letter-spacing:2px;margin-top:2px;}

/* PASS */
#adm-pass{position:absolute;inset:0;background:rgba(0,0,0,.97);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;}
#adm-pass.gone{display:none;}
.skull-ring{width:80px;height:80px;border-radius:50%;border:2px solid var(--g4);display:flex;align-items:center;justify-content:center;font-size:2.2rem;animation:skullSpin 4s linear infinite;box-shadow:0 0 20px var(--g4);}
@keyframes skullSpin{0%,100%{box-shadow:0 0 10px var(--g4)}50%{box-shadow:0 0 30px var(--g)}}
#pass-title{font-size:1.1rem;font-weight:bold;color:var(--g);text-shadow:0 0 16px var(--g);letter-spacing:4px;animation:glitch 3s infinite;}
@keyframes glitch{0%,92%,100%{text-shadow:0 0 12px var(--g)}93%{text-shadow:-3px 0 var(--red),3px 0 var(--bl);transform:skewX(-3deg)}95%{text-shadow:3px 0 var(--red),-3px 0 var(--bl);transform:skewX(3deg)}97%{text-shadow:0 0 12px var(--g);transform:none}}
#pass-inp{width:240px;padding:12px 16px;background:rgba(0,255,65,.03);border:2px solid var(--g4);border-radius:10px;color:var(--g);font-family:'Courier New',monospace;font-size:1.1rem;text-align:center;outline:none;letter-spacing:6px;}
#pass-inp:focus{border-color:var(--g);box-shadow:0 0 14px rgba(0,255,65,.3);}
#pass-err{font-size:.65rem;color:var(--red);height:16px;letter-spacing:1px;}
#pass-tries{font-size:.58rem;color:var(--g4);letter-spacing:1px;}
.pass-dots{display:flex;gap:6px;justify-content:center;}
.pass-dot{width:8px;height:8px;border-radius:50%;background:var(--g4);transition:all .3s;}
.pass-dot.lit{background:var(--g);box-shadow:0 0 8px var(--g);}

/* BAR */
#adm-bar{display:flex;align-items:center;justify-content:space-between;padding:0 12px;height:46px;background:var(--bg);border-bottom:2px solid var(--g);flex-shrink:0;position:relative;z-index:2;}
#adm-bar::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--g),transparent);animation:topScan 4s infinite;}
@keyframes topScan{0%,100%{opacity:.4}50%{opacity:1}}
.bar-left{display:flex;align-items:center;gap:8px;}
#adm-logo-pill{background:var(--g);color:#000;font-size:.6rem;font-weight:bold;letter-spacing:2px;padding:3px 9px;border-radius:20px;animation:pillPulse 2s infinite;}
@keyframes pillPulse{0%,100%{box-shadow:0 0 6px var(--g)}50%{box-shadow:0 0 18px var(--g),0 0 30px rgba(0,255,65,.3)}}
#adm-bar-title{font-size:.82rem;font-weight:bold;color:var(--g);text-shadow:0 0 10px var(--g);letter-spacing:2px;}
#adm-live-time{font-size:.58rem;color:var(--g3);letter-spacing:1px;}
.bar-right{display:flex;align-items:center;gap:6px;}
#adm-status-row{display:flex;gap:5px;align-items:center;}
.sdot{width:7px;height:7px;border-radius:50%;animation:sdotBlink 2s infinite;}
.sdot.green{background:var(--g);box-shadow:0 0 6px var(--g);}
.sdot.yellow{background:var(--yl);box-shadow:0 0 6px var(--yl);}
.sdot.red{background:var(--red);box-shadow:0 0 6px var(--red);}
@keyframes sdotBlink{0%,100%{opacity:1}50%{opacity:.3}}
#adm-session-time{font-size:.56rem;color:var(--g3);letter-spacing:1px;}
.xbtn{background:none;border:1.5px solid var(--g4);color:var(--g3);width:26px;height:26px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:.8rem;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.xbtn:hover{border-color:var(--red);color:var(--red);}

/* TABS */
#adm-tabs{display:flex;background:rgba(2,10,2,.99);border-bottom:1px solid var(--g4);flex-shrink:0;overflow-x:auto;scrollbar-width:none;z-index:2;}
#adm-tabs::-webkit-scrollbar{display:none;}
.atab{background:none;border:none;border-bottom:2.5px solid transparent;color:var(--g3);font-family:'Courier New',monospace;font-size:.6rem;letter-spacing:1.5px;padding:9px 12px;cursor:pointer;white-space:nowrap;text-transform:uppercase;transition:all .15s;flex-shrink:0;border-right:1px solid var(--g5);}
.atab:hover{color:var(--g2);background:rgba(0,255,65,.03);}
.atab.on{color:var(--g);border-bottom-color:var(--g);background:rgba(0,255,65,.05);text-shadow:0 0 8px var(--g);}

/* BODY */
#adm-body{flex:1;overflow-y:auto;padding:12px;background:var(--bg);scrollbar-width:thin;scrollbar-color:var(--g4) transparent;z-index:2;}
#adm-body::-webkit-scrollbar{width:3px;}
#adm-body::-webkit-scrollbar-thumb{background:var(--g4);border-radius:2px;}
.asec{display:none;}
.asec.on{display:block;}

/* CARDS */
.ac{background:rgba(5,18,5,.65);border:1.5px solid var(--g4);border-radius:12px;padding:13px 12px;margin-bottom:10px;position:relative;overflow:hidden;}
.ac::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:1px;background:linear-gradient(90deg,transparent,var(--g3),transparent);animation:cardScan 6s infinite;}
@keyframes cardScan{from{left:-60%}to{left:160%}}
.act{font-size:.6rem;color:var(--g2);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.abadge{background:rgba(0,255,65,.1);border:1px solid var(--g4);border-radius:3px;padding:1px 5px;font-size:.5rem;color:var(--g3);}

/* STATS GRID */
.as{display:grid;gap:6px;margin-bottom:10px;}
.as2{grid-template-columns:repeat(2,1fr);}
.as3{grid-template-columns:repeat(3,1fr);}
.as4{grid-template-columns:repeat(4,1fr);}
.astat{background:rgba(0,0,0,.6);border:1.5px solid var(--g4);border-radius:9px;padding:9px 6px;text-align:center;transition:all .2s;cursor:default;}
.astat:hover{border-color:var(--g2);transform:translateY(-1px);}
.asn{font-size:1.1rem;font-weight:bold;color:var(--g);text-shadow:0 0 8px var(--g);}
.asl{font-size:.46rem;color:var(--g3);letter-spacing:1.5px;margin-top:1px;}

/* BARS */
.brow{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.blbl{font-size:.6rem;color:var(--g2);min-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.btrack{flex:1;background:rgba(0,0,0,.5);border-radius:3px;height:5px;}
.bfill{height:5px;border-radius:3px;transition:width .6s;}
.bfill.green{background:linear-gradient(90deg,var(--g),var(--g2));}
.bfill.blue{background:linear-gradient(90deg,var(--bl),#0066cc);}
.bfill.red{background:linear-gradient(90deg,var(--red),#cc0000);}
.bfill.purple{background:linear-gradient(90deg,var(--pur),#7c3aed);}
.bval{font-size:.56rem;color:var(--g3);min-width:20px;text-align:right;}

/* INPUTS */
.al{font-size:.57rem;color:var(--g2);letter-spacing:2px;display:block;margin-bottom:4px;}
.ai,.ata,.asel{width:100%;padding:8px 10px;background:rgba(0,0,0,.75);border:1.5px solid var(--g4);border-radius:7px;color:var(--g);font-family:'Courier New',monospace;font-size:.75rem;outline:none;margin-bottom:8px;transition:border-color .18s;}
.ata{resize:vertical;min-height:65px;}
.ai:focus,.ata:focus,.asel:focus{border-color:var(--g);box-shadow:0 0 6px rgba(0,255,65,.15);}
.ai::placeholder,.ata::placeholder{color:var(--g5);}
.asel option{background:#020a02;}

/* BUTTONS */
.ab{padding:8px 14px;background:var(--g);border:none;border-radius:7px;color:#000;font-family:'Courier New',monospace;font-weight:bold;font-size:.7rem;letter-spacing:1.5px;cursor:pointer;transition:all .18s;white-space:nowrap;}
.ab:hover{opacity:.82;box-shadow:0 0 12px rgba(0,255,65,.3);}
.ab.full{width:100%;margin-bottom:6px;}
.ab.ghost{background:transparent;border:1.5px solid var(--g4);color:var(--g3);}
.ab.ghost:hover{border-color:var(--g2);color:var(--g2);}
.ab.red{background:transparent;border:1.5px solid #550000;color:#aa2222;}
.ab.red:hover{border-color:var(--red);color:var(--red);}
.ab.blue{background:#0066cc;color:#fff;}
.ab.yellow{background:var(--yl);color:#000;}
.ab.purple{background:#7c3aed;color:#fff;}
.abrow{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;}

/* TOGGLE */
.atog{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(0,0,0,.4);border:1px solid var(--g4);border-radius:7px;margin-bottom:5px;cursor:pointer;transition:all .15s;}
.atog:hover{border-color:var(--g2);}
.atog-i{flex:1;}
.atog-n{font-size:.72rem;color:var(--g2);}
.atog-s{font-size:.54rem;color:var(--g3);margin-top:1px;}
.asw{width:32px;height:17px;background:var(--g4);border-radius:9px;position:relative;flex-shrink:0;transition:background .2s;}
.asw.on{background:var(--g2);}
.asw::after{content:'';position:absolute;top:2px;left:2px;width:13px;height:13px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.4);}
.asw.on::after{left:17px;}

/* TERMINAL */
#term-out{background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.68rem;color:var(--g);min-height:180px;max-height:280px;overflow-y:auto;white-space:pre-wrap;word-break:break-all;margin-bottom:7px;line-height:1.6;}
#term-out::-webkit-scrollbar{width:3px;}
#term-out::-webkit-scrollbar-thumb{background:var(--g4);}
#term-row{display:flex;gap:6px;align-items:center;}
#term-prompt{font-size:.72rem;color:var(--g);flex-shrink:0;}
#term-inp{flex:1;background:transparent;border:none;color:var(--g);font-family:'Courier New',monospace;font-size:.72rem;outline:none;caret-color:var(--g);}

/* PACKET VISUALIZER */
#packet-canvas{width:100%;height:120px;background:#000;border:1.5px solid var(--g4);border-radius:8px;display:block;margin-bottom:8px;}

/* CODE EDITOR */
#code-editor{width:100%;min-height:220px;background:#000;border:1.5px solid var(--g4);border-radius:8px;color:var(--g);font-family:'Courier New',monospace;font-size:.72rem;padding:10px;outline:none;resize:vertical;line-height:1.7;tab-size:2;}
#code-editor:focus{border-color:var(--g);}
#code-output{background:#000;border:1.5px solid var(--g4);border-left:3px solid var(--g);border-radius:8px;padding:10px;font-size:.68rem;color:var(--g2);min-height:60px;white-space:pre-wrap;word-break:break-all;display:none;margin-top:6px;max-height:160px;overflow-y:auto;}

/* CIPHER */
.cipher-result{background:#000;border:1.5px solid var(--g4);border-left:3px solid var(--g);border-radius:8px;padding:10px;font-size:.7rem;color:var(--g);word-break:break-all;white-space:pre-wrap;margin-top:7px;display:none;max-height:120px;overflow-y:auto;}

/* VAULT */
.vault-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--g5);font-size:.65rem;}
.vault-item:hover{background:rgba(0,255,65,.03);}
.vault-name{color:var(--g);flex:1;font-weight:bold;}
.vault-val{color:var(--g3);flex:2;word-break:break-all;filter:blur(3px);cursor:pointer;transition:filter .2s;}
.vault-val:hover{filter:none;}
.vault-act{display:flex;gap:4px;flex-shrink:0;}

/* THREAT SCANNER */
#threat-out{background:#000;border:1.5px solid var(--g4);border-radius:8px;padding:10px;font-size:.65rem;line-height:1.9;max-height:220px;overflow-y:auto;margin-top:8px;display:none;}
.threat-ok{color:var(--g);}
.threat-warn{color:var(--yl);}
.threat-crit{color:var(--red);}

/* CRYPTO TICKER */
.cticker{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--g5);font-size:.68rem;}
.cticker:hover{background:rgba(0,255,65,.03);}
.cticker-sym{color:var(--g);font-weight:bold;min-width:50px;}
.cticker-price{color:var(--g2);min-width:80px;text-align:right;}
.cticker-chg.up{color:var(--g);}
.cticker-chg.dn{color:var(--red);}
.cticker-bar{flex:1;margin:0 10px;}

/* MATRIX RAIN MINI */
#matrix-mini{border-radius:8px;display:block;width:100%;height:80px;margin-bottom:8px;}

/* LOG */
.alog{display:flex;gap:7px;padding:6px 9px;border-bottom:1px solid var(--g5);font-size:.6rem;}
.alog:hover{background:rgba(0,255,65,.02);}
.alog-t{color:var(--g3);min-width:65px;flex-shrink:0;}
.alog-i{color:var(--g2);flex:1;word-break:break-all;}

/* THEME SWATCHES */
.tswatch-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;}
.tswatch{height:38px;border-radius:7px;cursor:pointer;border:2px solid transparent;display:flex;align-items:center;justify-content:center;font-size:.52rem;font-weight:bold;letter-spacing:1px;transition:all .18s;}
.tswatch.on{border-color:#fff;box-shadow:0 0 14px rgba(255,255,255,.3);}

/* ANNOUNCE PREV */
#ann-prev{display:none;padding:8px 12px;border-radius:7px;text-align:center;font-size:.75rem;font-weight:bold;letter-spacing:1px;margin-bottom:8px;}

/* NOTES */
#notes-ta{width:100%;min-height:200px;background:rgba(0,0,0,.8);border:1.5px solid var(--g4);border-radius:8px;color:var(--g);font-family:'Courier New',monospace;font-size:.72rem;padding:10px;outline:none;resize:vertical;line-height:1.7;}
#notes-ta:focus{border-color:var(--g);}

/* HR */
.ahr{border:none;border-top:1px solid var(--g5);margin:9px 0;}

/* NOTIFICATION */
#adm-notif{position:fixed;top:54px;left:50%;transform:translateX(-50%);background:rgba(5,18,5,.99);border:1.5px solid var(--g);border-radius:8px;padding:7px 18px;font-size:.7rem;color:var(--g);letter-spacing:1px;z-index:100010;display:none;white-space:nowrap;box-shadow:0 0 16px rgba(0,255,65,.3);}

/* PROGRESS RING */
.ring-wrap{display:flex;flex-direction:column;align-items:center;margin-bottom:10px;}
.ring-svg{transform:rotate(-90deg);}
.ring-val{font-size:1.3rem;font-weight:bold;color:var(--g);text-shadow:0 0 8px var(--g);margin-top:4px;}
.ring-lbl{font-size:.52rem;color:var(--g3);letter-spacing:2px;}

/* HEATMAP */
.heatmap{display:grid;grid-template-columns:repeat(24,1fr);gap:2px;margin-bottom:6px;}
.hcell{height:16px;border-radius:2px;background:var(--g5);transition:background .3s;}

/* TYPEWRITER */
.typewriter{overflow:hidden;border-right:2px solid var(--g);white-space:nowrap;animation:typeBlink .8s step-end infinite;}
@keyframes typeBlink{50%{border-color:transparent}}

/* SKILL BARS */
.skill-row{margin-bottom:8px;}
.skill-top{display:flex;justify-content:space-between;font-size:.62rem;color:var(--g2);margin-bottom:3px;}
.skill-track{background:rgba(0,0,0,.5);border-radius:10px;height:8px;overflow:hidden;}
.skill-fill{height:8px;border-radius:10px;background:linear-gradient(90deg,var(--g),var(--g2));animation:skillAnim .8s ease both;}
@keyframes skillAnim{from{width:0%}}

/* RADAR */
#radar-canvas{display:block;margin:0 auto 10px;}
`;
document.head.appendChild(CSS);

// ═══════════════════════════════════════════════
// ANNOUNCE BANNER
// ═══════════════════════════════════════════════
const ANN = document.createElement('div');
ANN.id='fr-ann';
ANN.style.cssText='display:none;width:100%;text-align:center;padding:8px 16px;font-family:Courier New,monospace;font-size:.75rem;font-weight:bold;letter-spacing:1px;position:relative;z-index:8999;';
document.body.prepend(ANN);
applyAnn();

function applyAnn(){const d=GA();ANN.style.display=(d.annOn&&d.annText)?'block':'none';ANN.textContent=d.annText||'';ANN.style.background=d.annBg||'#00ff41';ANN.style.color=d.annFg||'#000';}

// ═══════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════
const THEMES={
  green: ['#00ff41','#00cc33','rgba(5,18,5,.85)','#003a0d','#001a00'],
  blue:  ['#00aaff','#0077cc','rgba(5,10,20,.85)','#003366','#001133'],
  red:   ['#ff4444','#cc2222','rgba(20,5,5,.85)',  '#660000','#330000'],
  purple:['#cc44ff','#8800cc','rgba(15,5,25,.85)', '#440066','#220033'],
  amber: ['#ffaa00','#cc7700','rgba(20,15,5,.85)', '#553300','#221100'],
  cyan:  ['#00ffee','#00aaaa','rgba(5,18,18,.85)', '#003333','#001111'],
  orange:['#ff6600','#cc4400','rgba(20,10,5,.85)', '#553300','#221100'],
  pink:  ['#ff66aa','#cc2277','rgba(20,5,15,.85)', '#550022','#220011'],
};
function applyTheme(t){
  const c=THEMES[t];if(!c)return;
  const R=document.documentElement.style;
  R.setProperty('--g',c[0]);R.setProperty('--g2',c[1]);
  R.setProperty('--g4',c[3]);R.setProperty('--g5',c[4]);
  document.body.style.color=c[0];
}
applyTheme(GA().theme||'green');

// ═══════════════════════════════════════════════
// BUILD PANEL
// ═══════════════════════════════════════════════
const OV=document.createElement('div');
OV.id='adm';
OV.innerHTML=`
<!-- BOOT -->
<div id="adm-boot">
  <pre id="boot-ascii">
███████╗██████╗  █████╗ ███╗   ██╗ ██████╗██╗███████╗
██╔════╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██║██╔════╝
█████╗  ██████╔╝███████║██╔██╗ ██║██║     ██║███████╗
██╔══╝  ██╔══██╗██╔══██║██║╚██╗██║██║     ██║╚════██║
██║     ██║  ██║██║  ██║██║ ╚████║╚██████╗██║███████║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝╚══════╝</pre>
  <div id="boot-log"></div>
  <div id="boot-bar-wrap"><div id="boot-bar"></div></div>
  <div id="boot-status">INITIALIZING...</div>
</div>

<!-- PASS -->
<div id="adm-pass" class="gone">
  <div class="skull-ring">💀</div>
  <div id="pass-title">AUTHENTICATION REQUIRED</div>
  <div style="font-size:.6rem;color:var(--g3);letter-spacing:2px">ENTER ADMIN PASSWORD</div>
  <div class="pass-dots" id="pass-dots"></div>
  <input id="pass-inp" type="password" placeholder="••••••••" autocomplete="off"
    oninput="passInput(this)" onkeydown="if(event.key==='Enter')admUnlock()">
  <button class="ab" onclick="admUnlock()" st
