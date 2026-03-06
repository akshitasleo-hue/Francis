
(function () {

const ADMIN_KEY = 'francis_admin';
const PASS_KEY  = 'francis_admin_pass';
const LOG_KEY   = 'francis_visitor_log';
const DEFAULT_PASS = 'francis2025';

// ── UTILS ──────────────────────────────────────────────────────
function ls(k)      { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function lss(k,v)   { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
function getAdmin() { return ls(ADMIN_KEY) || {}; }
function setAdmin(d){ lss(ADMIN_KEY, d); }
function getMon()   { try { return JSON.parse(localStorage.getItem('francis_monitor') || '{}'); } catch { return {}; } }
function fmt(n)     { return (n||0).toLocaleString(); }
function fmtTime(s) { if(!s)return'0s'; if(s<60)return s+'s'; if(s<3600)return Math.floor(s/60)+'m'; return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m'; }

// ── LOG THIS VISIT ──────────────────────────────────────────────
(function logVisit() {
  const logs = ls(LOG_KEY) || [];
  logs.push({ time: Date.now(), date: new Date().toLocaleString(), ua: navigator.userAgent.slice(0,60), path: location.pathname });
  if (logs.length > 200) logs.splice(0, logs.length - 200);
  lss(LOG_KEY, logs);
})();

// ── STYLES ──────────────────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
#adm-overlay {
  display:none; position:fixed; inset:0; z-index:99999;
  background:rgba(0,0,0,.96); font-family:'Courier New',Courier,monospace;
  overflow:hidden;
}
#adm-overlay.on { display:flex; flex-direction:column; }

/* TOP BAR */
#adm-bar {
  display:flex; align-items:center; justify-content:space-between;
  padding:0 16px; height:50px; background:rgba(5,13,5,.99);
  border-bottom:2px solid #00ff41; flex-shrink:0;
}
#adm-bar-left { display:flex; align-items:center; gap:10px; }
#adm-badge {
  background:#00ff41; color:#000; font-size:.62rem; font-weight:bold;
  letter-spacing:2px; padding:3px 9px; border-radius:4px;
}
#adm-bar-title { font-size:.9rem; font-weight:bold; color:#00ff41; text-shadow:0 0 8px #00ff41; letter-spacing:2px; }
#adm-bar-sub { font-size:.55rem; color:#006615; letter-spacing:1px; }
#adm-close {
  background:none; border:1.5px solid #003a0d; color:#006615;
  width:30px; height:30px; border-radius:8px; cursor:pointer;
  font-size:.9rem; font-family:monospace; display:flex; align-items:center; justify-content:center;
  transition:all .18s;
}
#adm-close:hover { border-color:#ff4444; color:#ff4444; }

/* TABS */
#adm-tabs {
  display:flex; gap:4px; padding:10px 14px 0;
  background:rgba(5,13,5,.99); border-bottom:1px solid #003a0d; flex-shrink:0;
  overflow-x:auto;
}
#adm-tabs::-webkit-scrollbar { display:none; }
.adm-tab {
  background:none; border:none; border-bottom:2.5px solid transparent;
  color:#006615; font-family:'Courier New',monospace; font-size:.68rem;
  letter-spacing:1.5px; padding:8px 14px; cursor:pointer; white-space:nowrap;
  text-transform:uppercase; transition:all .15s; flex-shrink:0;
}
.adm-tab:hover { color:#00cc33; }
.adm-tab.on { color:#00ff41; border-bottom-color:#00ff41; text-shadow:0 0 6px #00ff41; }

/* BODY */
#adm-body {
  flex:1; overflow-y:auto; padding:16px;
  background:transparent;
}
#adm-body::-webkit-scrollbar { width:4px; }
#adm-body::-webkit-scrollbar-thumb { background:#006615; border-radius:2px; }

/* SECTIONS */
.adm-section { display:none; }
.adm-section.on { display:block; }

/* CARDS */
.adm-card {
  background:rgba(5,18,5,.88); border:1.5px solid #003a0d;
  border-radius:14px; padding:15px 14px; margin-bottom:12px;
}
.adm-card-title {
  font-size:.72rem; color:#00aa22; letter-spacing:2px;
  text-transform:uppercase; margin-bottom:12px;
  display:flex; align-items:center; gap:8px;
}

/* STAT GRID */
.adm-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-bottom:12px; }
.adm-stats.four { grid-template-columns:repeat(4,1fr); }
.adm-stat {
  background:rgba(0,0,0,.5); border:1.5px solid #003a0d; border-radius:10px;
  padding:10px 8px; text-align:center;
}
.adm-stat-n { font-size:1.3rem; font-weight:bold; color:#00ff41; text-shadow:0 0 8px #00ff41; }
.adm-stat-l { font-size:.52rem; color:#006615; letter-spacing:1.5px; margin-top:2px; }

/* CHART BAR */
.adm-bar-wrap { margin-bottom:6px; }
.adm-bar-row { display:flex; align-items:center; gap:8px; margin-bottom:5px; }
.adm-bar-lbl { font-size:.65rem; color:#00cc33; min-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.adm-bar-track { flex:1; background:rgba(0,0,0,.4); border-radius:3px; height:7px; }
.adm-bar-fill { height:7px; border-radius:3px; background:linear-gradient(to right,#00ff41,#00aa22); transition:width .5s; }
.adm-bar-val { font-size:.6rem; color:#006615; min-width:24px; text-align:right; }

/* INPUTS */
.adm-lbl { font-size:.6rem; color:#00aa22; letter-spacing:2px; display:block; margin-bottom:5px; }
.adm-input, .adm-textarea, .adm-select {
  width:100%; padding:9px 11px; background:rgba(0,0,0,.6);
  border:1.5px solid #003a0d; border-radius:8px; color:#00ff41;
  font-family:'Courier New',monospace; font-size:.78rem; outline:none;
  margin-bottom:10px; transition:border-color .18s;
}
.adm-textarea { resize:vertical; min-height:70px; }
.adm-input:focus,.adm-textarea:focus,.adm-select:focus { border-color:#00ff41; }
.adm-input::placeholder,.adm-textarea::placeholder { color:#003a0d; }
.adm-select option { background:#050d05; }

/* BUTTONS */
.adm-btn {
  padding:10px 18px; background:#00ff41; border:none; border-radius:8px;
  color:#000; font-family:'Courier New',monospace; font-weight:bold;
  font-size:.78rem; letter-spacing:1.5px; cursor:pointer;
  transition:opacity .18s; box-shadow:0 0 12px rgba(0,255,65,.25);
}
.adm-btn:hover { opacity:.82; }
.adm-btn.ghost {
  background:transparent; border:1.5px solid #003a0d; color:#006615;
  box-shadow:none;
}
.adm-btn.ghost:hover { border-color:#00aa22; color:#00aa22; }
.adm-btn.danger {
  background:transparent; border:1.5px solid #660000; color:#aa2222; box-shadow:none;
}
.adm-btn.danger:hover { border-color:#ff4444; color:#ff4444; }
.adm-btn.full { width:100%; margin-bottom:8px; }
.adm-btn-row { display:flex; gap:8px; flex-wrap:wrap; }

/* TOGGLE SWITCH */
.adm-toggle-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:9px 12px; background:rgba(0,0,0,.35); border:1px solid #003a0d;
  border-radius:8px; margin-bottom:6px; cursor:pointer; transition:all .15s;
}
.adm-toggle-row:hover { border-color:#00aa22; }
.adm-toggle-info { flex:1; }
.adm-toggle-name { font-size:.78rem; color:#00cc33; }
.adm-toggle-cat  { font-size:.58rem; color:#006615; margin-top:1px; }
.adm-switch {
  width:36px; height:20px; background:#003a0d; border-radius:10px;
  position:relative; flex-shrink:0; transition:background .2s;
}
.adm-switch.on { background:#00aa22; }
.adm-switch::after {
  content:''; position:absolute; top:3px; left:3px;
  width:14px; height:14px; background:#fff; border-radius:50%;
  transition:left .2s;
}
.adm-switch.on::after { left:19px; }

/* LOG TABLE */
.adm-log-row {
  display:flex; gap:8px; padding:7px 10px; border-bottom:1px solid #001a00;
  font-size:.65rem; align-items:flex-start;
}
.adm-log-row:hover { background:rgba(0,255,65,.03); }
.adm-log-time { color:#006615; min-width:90px; flex-shrink:0; }
.adm-log-info { color:#00aa22; flex:1; word-break:break-all; }

/* COLOR SWATCH */
.adm-color-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px; }
.adm-swatch {
  height:42px; border-radius:8px; cursor:pointer; border:2px solid transparent;
  transition:all .18s; position:relative; display:flex; align-items:center; justify-content:center;
  font-size:.55rem; font-weight:bold; letter-spacing:1px;
}
.adm-swatch.selected { border-color:#ffffff; box-shadow:0 0 12px rgba(255,255,255,.3); }

/* ANNOUNCE */
.adm-announce-preview {
  padding:10px 14px; border-radius:8px; margin-top:8px;
  font-size:.78rem; font-weight:bold; text-align:center;
  letter-spacing:1px; display:none;
}

/* PASS SCREEN */
#adm-pass-screen {
  display:none; position:absolute; inset:0; z-index:10;
  background:rgba(5,13,5,.99); align-items:center; justify-content:center;
  flex-direction:column; gap:14px;
}
#adm-pass-screen.on { display:flex; }
#adm-pass-title { font-size:1.1rem; font-weight:bold; color:#00ff41; text-shadow:0 0 12px #00ff41; letter-spacing:2px; }
#adm-pass-sub { font-size:.65rem; color:#006615; letter-spacing:1px; }
#adm-pass-input {
  width:240px; padding:12px 14px; background:rgba(0,0,0,.7);
  border:2px solid #00aa22; border-radius:10px; color:#00ff41;
  font-family:'Courier New',monospace; font-size:1rem; text-align:center;
  outline:none; letter-spacing:4px;
}
#adm-pass-input:focus { border-color:#00ff41; box-shadow:0 0 10px rgba(0,255,65,.3); }
#adm-pass-err { font-size:.68rem; color:#ff4444; height:18px; letter-spacing:1px; }

/* NOTIFICATION */
#adm-notif {
  position:fixed; top:60px; left:50%; transform:translateX(-50%);
  background:rgba(5,18,5,.99); border:1.5px solid #00ff41; border-radius:10px;
  padding:9px 20px; font-size:.75rem; color:#00ff41; letter-spacing:1px;
  z-index:100001; display:none; white-space:nowrap;
  box-shadow:0 0 16px rgba(0,255,65,.3);
}

/* SITE BANNER (announcement shown on page) */
#francis-announce {
  display:none; width:100%; text-align:center;
  padding:10px 16px; font-family:'Courier New',monospace;
  font-size:.8rem; font-weight:bold; letter-spacing:1px;
  position:relative; z-index:8999;
}
`;
document.head.appendChild(style);

// ── ANNOUNCEMENT BANNER (live on page) ─────────────────────────
const announceBanner = document.createElement('div');
announceBanner.id = 'francis-announce';
document.body.prepend(announceBanner);
applyAnnounce();

function applyAnnounce() {
  const d = getAdmin();
  const el = document.getElementById('francis-announce');
  if (!el) return;
  if (d.announceText && d.announceOn) {
    el.style.display = 'block';
    el.textContent = d.announceText;
    el.style.background = d.announceBg || '#00ff41';
    el.style.color = d.announceColor || '#000';
  } else {
    el.style.display = 'none';
  }
}

// ── THEME APPLY ────────────────────────────────────────────────
function applyTheme() {
  const d = getAdmin();
  if (!d.theme) return;
  const themes = {
    green:  { '--tc':'#00ff41', '--tb':'rgba(5,18,5,.88)', '--tbd':'#003a0d', '--ta':'#00aa22' },
    blue:   { '--tc':'#00aaff', '--tb':'rgba(5,10,20,.88)', '--tbd':'#003a6b', '--ta':'#0066cc' },
    red:    { '--tc':'#ff4444', '--tb':'rgba(20,5,5,.88)', '--tbd':'#6b0000', '--ta':'#cc2222' },
    purple: { '--tc':'#cc44ff', '--tb':'rgba(15,5,25,.88)', '--tbd':'#4a0080', '--ta':'#8800cc' },
    amber:  { '--tc':'#ffaa00', '--tb':'rgba(20,15,5,.88)', '--tbd':'#5a3a00', '--ta':'#cc8800' },
    cyan:   { '--tc':'#00ffee', '--tb':'rgba(5,18,18,.88)', '--tbd':'#003a38', '--ta':'#00aaaa' },
    white:  { '--tc':'#ffffff', '--tb':'rgba(10,10,10,.88)', '--tbd':'#333333', '--ta':'#aaaaaa' },
    pink:   { '--tc':'#ff66aa', '--tb':'rgba(20,5,15,.88)', '--tbd':'#5a0030', '--ta':'#cc2277' },
  };
  const t = themes[d.theme];
  if (!t) return;
  Object.entries(t).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  document.body.style.color = t['--tc'];
}
applyTheme();

// ── BUILD PANEL HTML ───────────────────────────────────────────
const overlay = document.createElement('div');
overlay.id = 'adm-overlay';
overlay.innerHTML = `
  <div id="adm-pass-screen" class="on">
    <div style="font-size:2rem">🔐</div>
    <div id="adm-pass-title">ADMIN ACCESS</div>
    <div id="adm-pass-sub">ENTER PASSWORD</div>
    <input id="adm-pass-input" type="password" placeholder="••••••••••"
      onkeydown="if(event.key==='Enter')admCheckPass()"
      autocomplete="off">
    <button class="adm-btn" onclick="admCheckPass()">UNLOCK</button>
    <div id="adm-pass-err"></div>
    <button class="adm-btn ghost" onclick="admClose()" style="font-size:.65rem;padding:6px 14px">CANCEL</button>
  </div>

  <div id="adm-bar">
    <div id="adm-bar-left">
      <span id="adm-badge">ADMIN</span>
      <div>
        <div id="adm-bar-title">FRANCIS ADMIN</div>
        <div id="adm-bar-sub">CONTROL PANEL</div>
      </div>
    </div>
    <button id="adm-close" onclick="admClose()">✕</button>
  </div>

  <div id="adm-tabs">
    <button class="adm-tab on" onclick="admTab('analytics')">📊 Analytics</button>
    <button class="adm-tab" onclick="admTab('tools')">🛠️ Tools</button>
    <button class="adm-tab" onclick="admTab('theme')">🎨 Theme</button>
    <button class="adm-tab" onclick="admTab('announce')">📢 Announce</button>
    <button class="adm-tab" onclick="admTab('content')">📝 Content</button>
    <button class="adm-tab" onclick="admTab('logs')">👥 Logs</button>
    <button class="adm-tab" onclick="admTab('data')">💾 Data</button>
    <button class="adm-tab" onclick="admTab('settings')">⚙️ Settings</button>
  </div>

  <div id="adm-body">

    <!-- ── ANALYTICS ── -->
    <div class="adm-section on" id="adm-analytics">
      <div class="adm-stats four" id="adm-top-stats"></div>
      <div class="adm-card">
        <div class="adm-card-title">📈 TOP TOOLS</div>
        <div id="adm-top-tools"></div>
      </div>
      <div class="adm-card">
        <div class="adm-card-title">🕐 HOURLY ACTIVITY</div>
        <div id="adm-hourly"></div>
      </div>
      <div class="adm-card">
        <div class="adm-card-title">📅 7-DAY VISITS</div>
        <div id="adm-daily"></div>
      </div>
      <div class="adm-card">
        <div class="adm-card-title">🔍 TOP SEARCHES</div>
        <div id="adm-searches"></div>
      </div>
    </div>

    <!-- ── TOOLS MANAGER ── -->
    <div class="adm-section" id="adm-tools">
      <div class="adm-card">
        <div class="adm-card-title">🛠️ ENABLE / DISABLE TOOLS</div>
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <button class="adm-btn ghost" onclick="admToggleAll(true)" style="flex:1;font-size:.65rem">ENABLE ALL</button>
          <button class="adm-btn ghost" onclick="admToggleAll(false)" style="flex:1;font-size:.65rem">DISABLE ALL</button>
        </div>
        <div id="adm-tool-list"></div>
      </div>
    </div>

    <!-- ── THEME ── -->
    <div class="adm-section" id="adm-theme">
      <div class="adm-card">
        <div class="adm-card-title">🎨 COLOR THEME</div>
        <div class="adm-color-grid" id="adm-theme-grid"></div>
        <button class="adm-btn full" onclick="admSaveTheme()">APPLY THEME</button>
      </div>
      <div class="adm-card">
        <div class="adm-card-title">✨ EFFECTS</div>
        <div class="adm-toggle-row" onclick="admToggleEffect('matrix')">
          <div class="adm-toggle-info">
            <div class="adm-toggle-name">Matrix Rain Animation</div>
            <div class="adm-toggle-cat">Background falling code effect</div>
          </div>
          <div class="adm-switch on" id="fx-matrix"></div>
        </div>
        <div class="adm-toggle-row" onclick="admToggleEffect('scanline')">
          <div class="adm-toggle-info">
            <div class="adm-toggle-name">Scanline Overlay</div>
            <div class="adm-toggle-cat">CRT screen scanline effect</div>
          </div>
          <div class="adm-switch on" id="fx-scanline"></div>
        </div>
        <div class="adm-toggle-row" onclick="admToggleEffect('glow')">
          <div class="adm-toggle-info">
            <div class="adm-toggle-name">Text Glow Effects</div>
            <div class="adm-toggle-cat">Neon glow on headings</div>
          </div>
          <div class="adm-switch on" id="fx-glow"></div>
        </div>
      </div>
    </div>

    <!-- ── ANNOUNCEMENT ── -->
    <div class="adm-section" id="adm-announce">
      <div class="adm-card">
        <div class="adm-card-title">📢 ANNOUNCEMENT BANNER</div>
        <label class="adm-lbl">BANNER TEXT</label>
        <textarea class="adm-textarea" id="ann-text" placeholder="Type your announcement..."></textarea>
        <label class="adm-lbl">BACKGROUND COLOR</label>
        <input class="adm-input" id="ann-bg" type="color" value="#00ff41" style="height:42px;padding:4px;cursor:pointer">
        <label class="adm-lbl">TEXT COLOR</label>
        <input class="adm-input" id="ann-color" type="color" value="#000000" style="height:42px;padding:4px;cursor:pointer">
        <div class="adm-announce-preview" id="ann-preview">Preview text</div>
        <div class="adm-btn-row" style="margin-top:8px">
          <button class="adm-btn" onclick="admPreviewAnn()" style="flex:1">PREVIEW</button>
          <button class="adm-btn" onclick="admSaveAnn(true)" style="flex:1">SHOW ON SITE</button>
          <button class="adm-btn danger" onclick="admSaveAnn(false)" style="flex:1">HIDE</button>
        </div>
      </div>
    </div>

    <!-- ── CONTENT ── -->
    <div class="adm-section" id="adm-content">
      <div class="adm-card">
        <div class="adm-card-title">📝 SITE CONTENT</div>
        <label class="adm-lbl">SITE TITLE (hero heading)</label>
        <input class="adm-input" id="cnt-title" placeholder="Hey, I am FRANCIS">
        <label class="adm-lbl">SITE DESCRIPTION</label>
        <textarea class="adm-textarea" id="cnt-desc" placeholder="This is my website..."></textarea>
        <label class="adm-lbl">FOOTER TEXT</label>
        <input class="adm-input" id="cnt-footer" placeholder="FRANCIS // ALL TOOLS RUN OFFLINE">
        <label class="adm-lbl">DESIGNER NAME</label>
        <input class="adm-input" id="cnt-designer" placeholder="Akshit Singh">
        <button class="adm-btn full" onclick="admSaveContent()">SAVE & APPLY</button>
      </div>
    </div>

    <!-- ── VISITOR LOGS ── -->
    <div class="adm-section" id="adm-logs">
      <div class="adm-card">
        <div class="adm-card-title">👥 VISITOR LOG <span id="adm-log-count" style="color:#006615;font-size:.6rem"></span></div>
        <div class="adm-btn-row" style="margin-bottom:10px">
          <button class="adm-btn ghost" onclick="admRefreshLogs()" style="flex:1;font-size:.65rem">REFRESH</button>
          <button class="adm-btn danger" onclick="admClearLogs()" style="flex:1;font-size:.65rem">CLEAR LOGS</button>
        </div>
        <div id="adm-log-list" style="max-height:360px;overflow-y:auto;border:1px solid #003a0d;border-radius:8px"></div>
      </div>
    </div>

    <!-- ── DATA ── -->
    <div class="adm-section" id="adm-data">
      <div class="adm-card">
        <div class="adm-card-title">💾 EXPORT DATA</div>
        <button class="adm-btn full" onclick="admExport('all')">EXPORT ALL DATA (JSON)</button>
        <button class="adm-btn full ghost" onclick="admExport('analytics')">EXPORT ANALYTICS ONLY</button>
        <button class="adm-btn full ghost" onclick="admExport('logs')">EXPORT VISITOR LOGS</button>
        <button class="adm-btn full ghost" onclick="admExport('settings')">EXPORT SETTINGS</button>
      </div>
      <div class="adm-card">
        <div class="adm-card-title">📂 IMPORT DATA</div>
        <label class="adm-lbl">PASTE JSON DATA</label>
        <textarea class="adm-textarea" id="imp-data" placeholder='{"key":"value"}'></textarea>
        <button class="adm-btn full" onclick="admImport()">IMPORT & APPLY</button>
      </div>
      <div class="adm-card">
        <div class="adm-card-title">🗑️ RESET DATA</div>
        <button class="adm-btn full danger" onclick="admReset('analytics')">RESET ANALYTICS</button>
        <button class="adm-btn full danger" onclick="admReset('logs')">CLEAR ALL LOGS</button>
        <button class="adm-btn full danger" onclick="admReset('all')">FACTORY RESET ALL DATA</button>
      </div>
    </div>

    <!-- ── SETTINGS ── -->
    <div class="adm-section" id="adm-settings">
      <div class="adm-card">
        <div class="adm-card-title">🔐 CHANGE PASSWORD</div>
        <label class="adm-lbl">CURRENT PASSWORD</label>
        <input class="adm-input" id="pass-old" type="password" placeholder="Current password">
        <label
