/* Letsai module engine — union of master + memory-playbook.
   totalSteps: CONFIG.totalSteps, else count of .step elements. */

const CONFIG = window.MODULE_CONFIG || {};

let currentStep = 1;
let totalSteps = CONFIG.totalSteps || 3;

function resolveTotalSteps() {
  if (CONFIG.totalSteps) return CONFIG.totalSteps;
  const n = document.querySelectorAll('.step').length;
  return n || 3;
}

function setWaveText(el, text) {
  if (!el || !text) return;
  el.innerHTML = [...String(text)].map(ch => `<span class="wave-letter">${ch}</span>`).join('');
}

function applyConfig() {
  const c = CONFIG;
  if (!c || !Object.keys(c).length) return;

  if (c.title) document.title = c.title;
  if (c.description) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', c.description);
  }

  const hero = c.hero || {};
  const setText = (sel, val) => { const el = document.querySelector(sel); if (el && val != null) el.textContent = val; };
  setText('[data-config="hero.eyebrow"]', hero.eyebrow);
  setText('[data-config="hero.title"]', hero.title);
  setText('[data-config="hero.subtitle"]', hero.subtitle);
  setText('[data-config="hero.lead"]', hero.lead);
  if (hero.cta) {
    const btn = document.querySelector('[data-config="hero.cta"]');
    if (btn) btn.textContent = hero.cta;
  }
  if (hero.badge) {
    const badge = document.querySelector('[data-config="hero.badge"]');
    if (badge) {
      const icon = badge.querySelector('[data-lucide], svg');
      const iconHtml = icon ? icon.outerHTML + ' ' : '';
      badge.innerHTML = iconHtml + hero.badge;
    }
  }

  (c.navGroups || []).forEach((g, gi) => {
    const group = document.querySelectorAll('.nav-group')[gi];
    if (!group) return;
    const label = group.querySelector('.nav-group-label');
    if (label && g.title) {
      const ic = label.querySelector('[data-lucide], svg');
      const iconHtml = ic ? ic.outerHTML + ' ' : '';
      label.innerHTML = iconHtml + g.title;
    }
    (g.steps || []).forEach((labelText, si) => {
      const btn = group.querySelectorAll('.side-step')[si];
      if (!btn) return;
      const span = btn.querySelector('.side-step-num') ? btn.querySelector('.side-step-num').nextElementSibling : null;
      if (span) span.textContent = labelText;
    });
  });

  (c.steps || []).forEach((st, i) => {
    const step = document.getElementById('step' + (i + 1));
    if (!step) return;
    const num = step.querySelector('.step-number');
    if (num && st.number) num.textContent = st.number;
    const title = step.querySelector('.step-title');
    if (title && st.titleHtml) title.innerHTML = st.titleHtml;
    else if (title && st.title) title.textContent = st.title;
    const desc = step.querySelector('.step-header .step-desc');
    if (desc && st.desc != null) desc.textContent = st.desc;
  });

  if (c.completion && c.completion.goodluck) {
    setWaveText(document.querySelector('.completion-goodluck'), c.completion.goodluck);
  }
}

/* ===== ניווט ===== */
function goToStep(n) {
  if (n < 1 || n > totalSteps) return;
  currentStep = n;
  updateStep(n);
}
function nextStep() {
  if (currentStep < totalSteps) {
    currentStep++;
    updateStep(currentStep);
  } else {
    showCompletion();
  }
}
function prevStep() {
  if (currentStep > 1) { currentStep--; updateStep(currentStep); }
}

/* ===== updateStep ===== */
function updateStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n)?.classList.add('active');

  document.querySelectorAll('.side-step').forEach((btn, i) => {
    btn.classList.remove('active','completed');
    const num = btn.querySelector('.side-step-num');
    if (i < n - 1) { btn.classList.add('completed'); num.innerHTML = '<i data-lucide="check"></i>'; }
    else            { num.textContent = (i + 1); }
    if (i === n - 1) btn.classList.add('active');
  });

  const fill = document.getElementById('sideProgressFill');
  const label = document.getElementById('sideProgressLabel');
  if (fill) fill.style.width = (n / totalSteps * 100) + '%';
  if (label) label.textContent = n + ' / ' + totalSteps + ' שלבים';

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.classList.toggle('hidden', n === 1);
  if (nextBtn) nextBtn.innerHTML = n === totalSteps
    ? 'סיום <i data-lucide="check" class="icon-sm"></i>'
    : 'הבא <i data-lucide="arrow-left" class="icon-sm"></i>';

  const activeNav = document.querySelectorAll('.side-step')[n-1];
  if (activeNav) activeNav.scrollIntoView({behavior:'smooth', block:'nearest'});

  window.scrollTo({top:0, behavior:'smooth'});
  setTimeout(triggerReveal, 100);
  setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 0);

  const activeStep = document.getElementById('step' + n);
  const tank = document.getElementById('tankFill');
  if (tank && activeStep && activeStep.contains(tank)) {
    setTimeout(startContextTankLoop, 400);
  } else {
    stopContextTankLoop();
  }
}

/* ===== Context Fill Tank ===== */
let contextTankInterval = null;
function setContextTankLevel(pct) {
  const fill = document.getElementById('tankFill');
  if (!fill) return;
  const h = 200 * pct;
  fill.setAttribute('height', h);
  fill.setAttribute('y', 210 - h);
}
function startContextTankLoop() {
  if (!document.getElementById('tankFill')) return;
  clearInterval(contextTankInterval);
  let full = false;
  setContextTankLevel(0.06);
  setTimeout(() => { full = true; setContextTankLevel(0.88); }, 300);
  contextTankInterval = setInterval(() => {
    full = !full;
    setContextTankLevel(full ? 0.88 : 0.06);
  }, 3300);
}
function stopContextTankLoop() {
  clearInterval(contextTankInterval);
  contextTankInterval = null;
}

/* ===== Sidebar (mobile drawer) ===== */
function sideNav(n) {
  goToStep(n);
  if (window.innerWidth <= 768) closeSidebar();
}
function toggleSidebar() {
  const open = document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarBackdrop').classList.toggle('open');
  const menu = document.getElementById('menuToggle');
  if (menu) menu.setAttribute('aria-expanded', open);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('open');
  const menu = document.getElementById('menuToggle');
  if (menu) menu.setAttribute('aria-expanded', 'false');
}
function toggleSettingsItem(btn) {
  const item = btn.closest('.settings-item');
  const open = item.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
}

/* ===== Risk Gauge ===== */
const RISK_LEVELS = [
  { title:'Plan', text:'קלוד קורא את הפרויקט ומציע תוכנית, אך אינו משנה קבצים עד לקבלת אישור. מצב זה מתאים לפני שינוי משמעותי או כאשר רוצים לבדוק תחילה מה קלוד מתכנן לעשות.' },
  { title:'Manual', text:'קלוד עובד במצב ידני ומבקש אישור כאשר פעולה דורשת הרשאה. זהו המצב הבטוח והברור ביותר בתחילת העבודה.' },
  { title:'Accept Edits', text:'קלוד יכול לבצע שינויי קבצים בלי לעצור לאישור בכל עריכה, אך עדיין עשוי לבקש אישור לפעולות רגישות יותר.' },
  { title:'Auto', text:'קלוד מקבל עצמאות רחבה יותר בביצוע פעולות ובהרצת פקודות. מצב זה מתאים למי שכבר מבין היטב את סביבת העבודה ואת הסיכונים.' },
  { title:'Bypass Permissions', text:'קלוד פועל ללא בדיקות ההרשאה הרגילות. זהו המצב הפתוח והמסוכן ביותר — <strong>ולכן לא נשתמש בו בסדנה</strong>.' },
];
function selectRiskLevel(i, btn) {
  document.querySelectorAll('.risk-segment').forEach(el => { el.classList.remove('active'); el.setAttribute('aria-selected','false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-selected','true');
  const lvl = RISK_LEVELS[i];
  const detail = document.getElementById('riskDetail');
  if (!detail || !lvl) return;
  detail.style.setProperty('--detail-color', btn.style.getPropertyValue('--seg-color'));
  const t = document.getElementById('riskDetailTitle');
  const b = document.getElementById('riskDetailBody');
  if (t) t.textContent = lvl.title;
  if (b) b.innerHTML = lvl.text;
}

/* ===== Model Speed Dial ===== */
const MODEL_LEVELS = [
  { title:'Haiku',  color:'#5CE1E6', angle:90,  text:'מתאים למשימות קצרות, פשוטות ומהירות.' },
  { title:'Sonnet', color:'#749FE3', angle:30,  text:'הבחירה המאוזנת לרוב משימות הבנייה. <strong>זה יהיה המודל המרכזי שלנו בסדנה.</strong>' },
  { title:'Opus',   color:'#8B5CE0', angle:-30, text:'מתאים לתכנון מורכב, פתרון בעיות קשות, איתור תקלות עמוק ושינויים רחבים בפרויקט.' },
  { title:'Fable',  color:'#FF5BC0', angle:-90, text:'מתאים למשימות ארוכות ומורכבות שדורשות עבודה עצמאית לאורך זמן.' },
];
function selectModel(i, btn) {
  document.querySelectorAll('.model-pick').forEach(el => { el.classList.remove('active'); el.setAttribute('aria-selected','false'); });
  btn.classList.add('active');
  btn.setAttribute('aria-selected','true');
  const lvl = MODEL_LEVELS[i];
  if (!lvl) return;
  const needle = document.getElementById('modelNeedle');
  if (needle) needle.style.transform = `rotate(${lvl.angle}deg)`;
  const detail = document.getElementById('modelDetail');
  if (detail) detail.style.setProperty('--detail-color', lvl.color);
  const t = document.getElementById('modelDetailTitle');
  const b = document.getElementById('modelDetailBody');
  if (t) t.textContent = lvl.title;
  if (b) b.innerHTML = lvl.text;
}

/* ===== Reveal ===== */
function triggerReveal() {
  const active = document.querySelector('.step.active');
  if (!active) return;
  active.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 130);
  });
}

/* ===== Checklist ===== */
function toggleCheckItem(item) {
  item.classList.toggle('checked');
}
function toggleStaticCheck(item) {
  const checked = item.classList.toggle('checked');
  item.setAttribute('aria-checked', checked);
}

/* ===== Lightbox ===== */
function openLightbox(btn) {
  const img = btn.closest('.screenshot-frame').querySelector('img');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightboxImg').alt = img.alt;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(e) {
  if (e.target.id === 'lightbox' || e.target.closest('.lightbox-close')) {
    document.getElementById('lightbox').classList.remove('open');
  }
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lb = document.getElementById('lightbox');
    if (lb) lb.classList.remove('open');
  }
});

/* ===== Mini Carousel ===== */
function carouselNav(id, dir) {
  const el = document.querySelector('[data-carousel="' + id + '"]');
  if (!el) return;
  const slides = [...el.querySelectorAll('.mini-carousel-slide')];
  const dots = [...el.querySelectorAll('.mini-carousel-dot')];
  const idx = slides.findIndex(s => s.classList.contains('active'));
  const next = Math.max(0, Math.min(slides.length - 1, idx + dir));
  if (next === idx) return;
  slides[idx].classList.remove('active');
  slides[next].classList.add('active');
  if (dots[idx]) dots[idx].classList.remove('active');
  if (dots[next]) dots[next].classList.add('active');
  const current = el.querySelector('.mini-carousel-current');
  if (current) current.textContent = next + 1;
  const btns = el.querySelectorAll('.mini-carousel-btn');
  if (btns[0]) btns[0].disabled = next === 0;
  if (btns[1]) btns[1].disabled = next === slides.length - 1;
}

/* ===== Copy prompt ===== */
function copyPrompt(btn) {
  const text = btn.closest('.prompt-block').querySelector('.prompt-text').innerText;
  const done = () => {
    const label = btn.querySelector('span');
    const icon  = btn.querySelector('[data-lucide]');
    btn.classList.add('copied');
    if (icon) icon.setAttribute('data-lucide','check');
    if (label) label.textContent = 'הועתק!';
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
      btn.classList.remove('copied');
      if (icon) icon.setAttribute('data-lucide','copy');
      if (label) label.textContent = 'העתק';
      if (window.lucide) lucide.createIcons();
    }, 1800);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
  cb();
}

/* ===== Start / Completion ===== */
function startTutorial() {
  const hero = document.getElementById('hero');
  hero.style.opacity = '0';
  hero.style.transition = 'opacity 0.4s ease';
  setTimeout(() => {
    hero.style.display = 'none';
    document.getElementById('app').classList.add('visible');
    document.getElementById('bottomNav').classList.add('visible');
    updateStep(1);
    window.scrollTo(0,0);
  }, 400);
}
function showCompletion() {
  closeSidebar();
  document.getElementById('app').style.display = 'none';
  document.getElementById('bottomNav').style.display = 'none';
  document.getElementById('completion').classList.add('visible');
  const completionVideo = document.querySelector('.completion-video');
  if (completionVideo) {
    completionVideo.currentTime = 0;
    completionVideo.play();
  }
  if (window.lucide) lucide.createIcons();
}
function restartTutorial() {
  document.getElementById('completion').classList.remove('visible');
  const cv = document.querySelector('.completion-video');
  if (cv) cv.pause();
  document.getElementById('app').style.display = 'flex';
  const bottomNav = document.getElementById('bottomNav');
  bottomNav.style.display = '';
  bottomNav.classList.add('visible');
  currentStep = 1;
  updateStep(1);
  document.querySelectorAll('.check-item').forEach(i => i.classList.remove('checked'));
  document.querySelectorAll('.static-check-item').forEach(i => {
    i.classList.remove('checked');
    i.setAttribute('aria-checked', 'false');
  });
}

function animateEyebrows() {
  document.querySelectorAll('.concept-eyebrow').forEach(el => {
    if (el.querySelector('.eyebrow-letter')) return;
    const text = el.textContent;
    el.innerHTML = [...text].map((ch, i) => `<span class="eyebrow-letter" style="animation-delay:${i * 0.09}s">${ch}</span>`).join('');
  });
}

function bindLottieHover() {
  if (typeof lottie === 'undefined') return;
  document.querySelectorAll('.lottie-icon[data-lottie-src]').forEach(el => {
    const anim = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: el.dataset.lottieSrc
    });
    const link = el.closest('.lottie-link');
    if (!link) return;
    link.addEventListener('mouseenter', () => anim.play());
    link.addEventListener('mouseleave', () => anim.stop());
  });
}

/* ===== Dream timeline (memory-playbook) ===== */
const dreamReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateDreamTimeline(tl) {
  const steps = [...tl.querySelectorAll('.dream-step')];
  const triggerY = window.innerHeight * 0.5;
  const centers = steps.map(s => {
    const node = s.querySelector('.dream-node');
    if (!node) return 0;
    const r = node.getBoundingClientRect();
    return r.top + r.height / 2;
  });
  steps.forEach((step, i) => {
    step.classList.toggle('seen', centers[i] <= triggerY);
    const conn = step.querySelector('.dream-connector');
    if (!conn) return;
    if (i === steps.length - 1) return;
    const total = centers[i + 1] - centers[i];
    const passed = triggerY - centers[i];
    const pct = total > 0 ? Math.max(0, Math.min(1, passed / total)) : 0;
    conn.style.setProperty('--fill', (pct * 100) + '%');
  });
}
function dreamLoop() {
  document.querySelectorAll('.dream-timeline').forEach(updateDreamTimeline);
  if (!dreamReduceMotion) requestAnimationFrame(dreamLoop);
}

window.addEventListener('load', () => {
  totalSteps = resolveTotalSteps();
  applyConfig();
  document.querySelector('.hero')?.classList.add('animate');
  setTimeout(() => {
    const c = document.querySelector('.hero-content');
    const h = document.querySelector('.hero');
    if (!c || !h) return;
    c.style.top = (h.offsetHeight - c.offsetHeight - window.innerHeight * 0.03) + 'px';
  }, 2000);
  animateEyebrows();
  if (window.lucide) lucide.createIcons();
  bindLottieHover();
  if (document.querySelectorAll('.dream-timeline').length) {
    if (dreamReduceMotion) {
      document.querySelectorAll('.dream-timeline').forEach(updateDreamTimeline);
      window.addEventListener('scroll', () => document.querySelectorAll('.dream-timeline').forEach(updateDreamTimeline), { passive: true });
    } else {
      requestAnimationFrame(dreamLoop);
    }
  }
});
