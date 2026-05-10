/* =====================================================
   ATCKR — Dev Toolbar  (dev-toolbar.js)
   Drop one script tag before </body> on any ATCKR page:

     <script src="../dev/dev-toolbar.js"></script>

   A collapsible tab appears at the bottom.
   DEV USE ONLY — remove before student release.
===================================================== */
(function () {
  'use strict';

  /* ── PATH RESOLVER ──────────────────────────────────
     Figures out how many directories deep we are and
     builds a path back to the project root so links
     work from any page regardless of folder depth.
  ──────────────────────────────────────────────────── */
  function resolvePath(target) {
    const parts  = window.location.pathname.split('/').filter(Boolean);
    const depth  = parts.length - 1; // subtract the filename
    const prefix = depth > 0 ? '../'.repeat(depth) : './';
    return prefix + target;
  }

  /* ── PAGE / GAME REGISTRY ───────────────────────────
     label      — display name (no file paths shown)
     file       — path relative to project root
     endGameFn  — window function name to call for skip-to-end
     quiz       — path to the relevant quiz page
     divider    — section header string (no link)
  ──────────────────────────────────────────────────── */
  const PAGES = [
    { divider: '— SITE —' },
    { label: '🏠 Home',              file: 'pages/index.html' },
    { label: '📖 Vocab',             file: 'pages/vocab.html' },
    { label: '🛡️ Prevention',        file: 'pages/prevention.html' },
    { label: '💬 About',             file: 'pages/about.html' },
    { label: '🔐 Login',             file: 'pages/login.html' },

    { divider: '— GAMES —' },
    {
      label: '🎣 Text or Trap',
      file: '../pages/textortrap.html',
      endGameFn: 'endGame',
      quiz: 'quiz1.html'
    },
    {
      label: '🧱 Cyber Defense',
      file: 'cyberdefense.html',
      endGameFn: 'endGame',
      quiz: 'quiz2.html'
    },
    {
      label: '💻 Vocab Blast',
      file: 'vocabblast.html',
      endGameFn: 'endGame',
      quiz: 'finalquiz.html'
    }
  ];

  /* ── STYLES ─────────────────────────────────────────── */
  const css = `
    #__devtb {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2147483647;
      font-family: 'Share Tech Mono', 'Courier New', monospace;
      user-select: none;
    }

    /* ── Tab handle ── */
    #__devtb-tab {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 auto;
      width: fit-content;
      background: #080f08;
      border: 1.5px solid #52d63a;
      border-bottom: none;
      border-radius: 10px 10px 0 0;
      padding: 5px 20px 6px;
      font-size: 0.66rem;
      color: #52d63a;
      cursor: pointer;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      transition: background 0.18s;
      box-shadow: 0 -4px 20px rgba(82,214,58,0.12);
    }
    #__devtb-tab:hover { background: #0f1f0f; }

    .dt-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #52d63a;
      box-shadow: 0 0 5px #52d63a;
      animation: __dtpulse 1.6s ease-in-out infinite;
    }
    @keyframes __dtpulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.3; transform:scale(0.7); }
    }

    /* ── Panel ── */
    #__devtb-panel {
      background: #060e06;
      border: 1.5px solid #52d63a;
      border-bottom: none;
      border-radius: 12px 12px 0 0;
      width: min(800px, 98vw);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.38s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 -12px 50px rgba(82,214,58,0.18);
    }
    #__devtb-panel.open { max-height: 440px; }

    #__devtb-inner {
      padding: 14px 16px 12px;
      overflow-y: auto;
      max-height: 420px;
    }
    #__devtb-inner::-webkit-scrollbar { width: 4px; }
    #__devtb-inner::-webkit-scrollbar-track { background: #060e06; }
    #__devtb-inner::-webkit-scrollbar-thumb { background: #52d63a44; border-radius: 2px; }

    /* ── Header ── */
    .dt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #52d63a22;
    }
    .dt-title { font-size: 0.7rem; color: #52d63a; letter-spacing: 0.18em; }
    .dt-badge {
      font-size: 0.55rem;
      background: #ff000018;
      border: 1px solid #ff4444;
      color: #ff7777;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.1em;
    }

    /* ── Quick actions ── */
    .dt-quick {
      display: flex;
      gap: 7px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .dt-qbtn {
      font-family: inherit;
      font-size: 0.62rem;
      padding: 5px 13px;
      border-radius: 6px;
      border: 1px solid;
      cursor: pointer;
      letter-spacing: 0.07em;
      transition: filter 0.15s, transform 0.12s;
      white-space: nowrap;
    }
    .dt-qbtn:hover { filter: brightness(1.35); transform: translateY(-1px); }
    .dt-qbtn.green  { background:#52d63a14; border-color:#52d63a88; color:#52d63a; }
    .dt-qbtn.yellow { background:#ffd32a14; border-color:#ffd32a88; color:#ffd32a; }
    .dt-qbtn.cyan   { background:#00e5ff14; border-color:#00e5ff88; color:#00e5ff; }
    .dt-qbtn.red    { background:#ff474714; border-color:#ff474788; color:#ff7777; }

    /* ── Dividers ── */
    .dt-div {
      font-size: 0.53rem;
      color: #2a4a2a;
      letter-spacing: 0.14em;
      padding: 7px 0 4px;
      grid-column: 1 / -1;
    }

    /* ── Page grid ── */
    .dt-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
      gap: 6px;
      margin-bottom: 4px;
    }

    /* ── Page card ── */
    .dt-card {
      background: #0a160a;
      border: 1px solid #1e381e;
      border-radius: 8px;
      padding: 7px 9px 7px;
      cursor: default;
      transition: border-color 0.15s, background 0.15s;
    }
    .dt-card:hover { border-color: #52d63a66; background: #0f1f0f; }
    .dt-card.current { border-color: #52d63a; background: #52d63a10; }

    .dt-card-name {
      display: block;
      font-size: 0.65rem;
      color: #b8d8b8;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dt-card.current .dt-card-name { color: #52d63a; }

    .dt-card-btns { display: flex; gap: 4px; flex-wrap: wrap; }
    .dt-cbtn {
      font-family: inherit;
      font-size: 0.5rem;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid;
      cursor: pointer;
      letter-spacing: 0.06em;
      transition: filter 0.14s;
      white-space: nowrap;
    }
    .dt-cbtn:hover { filter: brightness(1.5); }
    .dt-cbtn.go   { background:#52d63a10; border-color:#52d63a55; color:#52d63a; }
    .dt-cbtn.end  { background:#ffd32a10; border-color:#ffd32a55; color:#ffd32a; }
    .dt-cbtn.quiz { background:#00e5ff10; border-color:#00e5ff55; color:#00e5ff; }

    /* ── Toast ── */
    #__devtb-toast {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #0a160a;
      border: 1px solid #52d63a;
      color: #52d63a;
      font-family: 'Share Tech Mono','Courier New',monospace;
      font-size: 0.7rem;
      padding: 6px 16px;
      border-radius: 8px;
      z-index: 2147483646;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.22s;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }
    #__devtb-toast.show { opacity: 1; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── HELPERS ─────────────────────────────────────────── */
  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById('__devtb-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function currentFilename() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  /* ── GLOBAL ACTIONS (called by onclick strings) ───────── */
  window.__dtNav = function (file) {
    window.location.href = resolvePath(file);
  };

  window.__dtEnd = function (fnName) {
    fnName = fnName || 'endGame';
    if (typeof window[fnName] === 'function') {
      showToast('⏭ Jumping to end screen…');
      setTimeout(() => window[fnName](), 80);
    } else {
      showToast('⚠️ ' + fnName + '() not found on this page.');
    }
  };

  window.__dtQuiz = function (file) {
    showToast('📝 Opening quiz…');
    setTimeout(() => { window.location.href = resolvePath(file); }, 300);
  };

  /* ── BUILD ────────────────────────────────────────────── */
  function build() {
    /* Toast */
    const toast = document.createElement('div');
    toast.id = '__devtb-toast';
    document.body.appendChild(toast);

    /* Wrapper */
    const wrap = document.createElement('div');
    wrap.id = '__devtb';

    /* Tab */
    const tab = document.createElement('div');
    tab.id = '__devtb-tab';
    tab.innerHTML = '<span class="dt-dot"></span>&nbsp;DEV TOOLBAR&nbsp;<span class="dt-dot"></span>';

    /* Panel */
    const panel = document.createElement('div');
    panel.id = '__devtb-panel';

    const inner = document.createElement('div');
    inner.id = '__devtb-inner';

    /* Header */
    const hdr = document.createElement('div');
    hdr.className = 'dt-header';
    hdr.innerHTML = `
      <span class="dt-title">⚙️ ATCKR Dev Toolbar</span>
      <span class="dt-badge">DEV ONLY — REMOVE BEFORE RELEASE</span>
    `;
    inner.appendChild(hdr);

    /* Quick actions */
    const quick = document.createElement('div');
    quick.className = 'dt-quick';
    quick.innerHTML = `
      <button class="dt-qbtn green"  onclick="__dtNav('pages/index.html')">🏠 Home</button>
      <button class="dt-qbtn cyan"   onclick="__dtNav('pages/finalquiz.html')">📝 Final Quiz</button>
      <button class="dt-qbtn yellow" onclick="__dtNav('pages/assessment.html')">📋 Assessment</button>
      <button class="dt-qbtn red"    onclick="__dtEnd()">⏭ Skip to End (this page)</button>
    `;
    inner.appendChild(quick);

    /* Grid */
    const grid = document.createElement('div');
    grid.className = 'dt-grid';

    PAGES.forEach(entry => {
      if (entry.divider) {
        const d = document.createElement('div');
        d.className = 'dt-div';
        d.textContent = entry.divider;
        grid.appendChild(d);
        return;
      }

      const isCurrent = entry.file.split('/').pop() === currentFilename();
      const card = document.createElement('div');
      card.className = 'dt-card' + (isCurrent ? ' current' : '');

      let btns = `<button class="dt-cbtn go" onclick="__dtNav('${entry.file}')">▶ Go</button>`;
      if (entry.endGameFn) {
        btns += `<button class="dt-cbtn end" onclick="__dtEnd('${entry.endGameFn}')">⏭ End</button>`;
      }
      if (entry.quiz) {
        btns += `<button class="dt-cbtn quiz" onclick="__dtQuiz('${entry.quiz}')">📝 Quiz</button>`;
      }

      card.innerHTML = `
        <span class="dt-card-name">${entry.label}${isCurrent ? ' ◀' : ''}</span>
        <div class="dt-card-btns">${btns}</div>
      `;
      grid.appendChild(card);
    });

    inner.appendChild(grid);
    panel.appendChild(inner);
    wrap.appendChild(tab);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    /* Toggle */
    let open = false;
    tab.addEventListener('click', () => {
      open = !open;
      panel.classList.toggle('open', open);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

})();
