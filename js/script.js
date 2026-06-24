/* ===========================================================
   LAKSHMI (ASHWINI) & VIKRAM — WEDDING INVITATION
   script.js  |  Vanilla JS · ES6+ · Zero dependencies
   =========================================================== */

'use strict';

/* ─── Wedding Date ─────────────────────────────────────────── */
const WEDDING_DATE = new Date('2026-10-25T11:02:00');

/* ─── Language State ───────────────────────────────────────── */
let currentLang = localStorage.getItem('weddingLang') || 'kn';

/* ===========================================================
   1.  LOADER — hide after page is ready
=========================================================== */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const hide = () => loader.classList.add('hide');

  if (document.readyState === 'complete') {
    setTimeout(hide, 1400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 1400));
  }
}

/* ===========================================================
   2.  FLOATING HEARTS CANVAS
=========================================================== */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  const SHAPES = ['♥', '💕', '✿', '🌸'];
  let W, H, hearts = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawnHeart() {
    return {
      x     : rand(0, W),
      y     : rand(H + 10, H + 60),
      size  : rand(10, 22),
      speed : rand(0.4, 1.1),
      drift : rand(-0.5, 0.5),
      alpha : rand(0.25, 0.7),
      char  : SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rotate: rand(0, Math.PI * 2),
      rSpeed: rand(-0.015, 0.015),
    };
  }

  function populate() {
    hearts = [];
    const count = Math.min(30, Math.floor(W / 45));
    for (let i = 0; i < count; i++) {
      const h = spawnHeart();
      h.y = rand(0, H);   // scatter on first paint
      hearts.push(h);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    hearts.forEach((h, i) => {
      h.y      -= h.speed;
      h.x      += h.drift;
      h.rotate += h.rSpeed;

      if (h.y < -40) hearts[i] = spawnHeart();

      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rotate);
      ctx.globalAlpha = h.alpha;
      ctx.font        = `${h.size}px serif`;
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(h.char, 0, 0);
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }

  resize();
  populate();
  tick();

  window.addEventListener('resize', () => { resize(); populate(); });
}

/* ===========================================================
   3.  NAVBAR — scroll shrink only (no menu links to manage)
=========================================================== */
function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ===========================================================
   4.  LANGUAGE SWITCHER
=========================================================== */
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('weddingLang', lang);
  document.body.setAttribute('data-lang', lang);

  /* Swap [data-kn] / [data-en] text nodes */
  document.querySelectorAll('[data-kn], [data-en]').forEach(el => {
    const val = el.getAttribute(`data-${lang}`);
    if (val !== null) {
      /* Preserve child elements – only update text if element has no significant children */
      if (el.children.length === 0) {
        el.textContent = val;
      }
    }
  });

  /* Active button state */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function initLangSwitch() {
  const switcher = document.getElementById('langSwitch');
  if (!switcher) return;

  switcher.addEventListener('click', e => {
    const btn = e.target.closest('.lang-btn');
    if (btn && btn.dataset.lang !== currentLang) applyLang(btn.dataset.lang);
  });

  /* Apply saved / default language */
  applyLang(currentLang);
}

/* ===========================================================
   5.  COUNTDOWN TIMER
=========================================================== */
function initCountdown() {
  const ids = {
    days  : document.getElementById('cd-days'),
    hours : document.getElementById('cd-hours'),
    mins  : document.getElementById('cd-mins'),
    secs  : document.getElementById('cd-secs'),
  };
  if (!ids.days) return;

  function pad(n)  { return String(Math.max(0, n)).padStart(2, '0'); }

  /* Animate number flip when value changes */
  function setWithFlip(el, val) {
    if (el.textContent === val) return;
    el.classList.add('flip');
    el.textContent = val;
    el.addEventListener('animationend', () => el.classList.remove('flip'), { once: true });
  }

  function tick() {
    const diff = WEDDING_DATE - Date.now();

    if (diff <= 0) {
      ['days','hours','mins','secs'].forEach(k => ids[k].textContent = '00');
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    setWithFlip(ids.days,  pad(d));
    setWithFlip(ids.hours, pad(h));
    setWithFlip(ids.mins,  pad(m));
    setWithFlip(ids.secs,  pad(s));
  }

  tick();
  setInterval(tick, 1000);
}

/* ===========================================================
   6.  GALLERY LIGHTBOX
=========================================================== */
function initGallery() {
  const overlay  = document.getElementById('lightboxOverlay');
  const closeBtn = document.getElementById('lightboxClose');
  const items    = document.querySelectorAll('.masonry-item');
  if (!overlay) return;

  const openLightbox = (item) => {
    /* If real images are placed later, swap the icon for <img> here */
    const img = item.querySelector('img');
    const content = overlay.querySelector('.lightbox-content');

    content.innerHTML = img
      ? `<img src="${img.src}" alt="${img.alt || ''}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;">`
      : `<i class="bi bi-image" style="font-size:3rem;color:var(--rose-light);"></i>`;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    /* Trap focus to close button */
    closeBtn.focus();
  };

  const closeLightbox = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View photo');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item); }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* Swipe to close on touch devices */
  let touchStartY = 0;
  overlay.addEventListener('touchstart', e => { touchStartY = e.changedTouches[0].clientY; }, { passive: true });
  overlay.addEventListener('touchend', e => {
    if (Math.abs(e.changedTouches[0].clientY - touchStartY) > 80) closeLightbox();
  });
}

/* ===========================================================
   13. COUPLE PHOTO — click-to-flip reveal placeholder text
=========================================================== */
function initCoupleCards() {
  document.querySelectorAll('.couple-photo').forEach(photo => {
    photo.style.cursor = 'pointer';
    photo.title = 'Photo coming soon 🌸';

    photo.addEventListener('click', () => {
      const tip = photo.parentElement.querySelector('.photo-tip');
      if (tip) { tip.remove(); return; }

      const msg = document.createElement('p');
      msg.className = 'photo-tip';
      msg.textContent = '📸 Photo coming soon';
      Object.assign(msg.style, {
        color     : 'var(--rose-light)',
        fontSize  : '.82rem',
        marginTop : '.5rem',
        fontFamily: 'var(--font-display)',
        letterSpacing: '.04em',
        animation : 'fadeInOut 2s ease-in-out forwards',
      });
      photo.insertAdjacentElement('afterend', msg);
      setTimeout(() => msg.remove(), 2200);
    });
  });
}

/* ===========================================================
   7.  BACKGROUND MUSIC
=========================================================== */
function initMusic() {
  const btn   = document.getElementById('musicBtn');
  const audio = document.getElementById('bgMusic');
  const icon  = document.getElementById('musicIcon');
  if (!btn || !audio) return;

  let playing = false;

  const setPlaying = (state) => {
    playing = state;
    btn.classList.toggle('playing', state);
    icon.className = state ? 'bi bi-pause-fill' : 'bi bi-music-note-beamed';
    btn.setAttribute('aria-label', state ? 'Pause music' : 'Play music');
    if (state) audio.play().catch(() => {}); else audio.pause();
  };

  btn.addEventListener('click', () => setPlaying(!playing));

  /* Auto-play on first user interaction anywhere on page */
  const autoPlay = () => {
    if (!playing) setPlaying(true);
    document.removeEventListener('click', autoPlay);
    document.removeEventListener('touchstart', autoPlay);
  };
  document.addEventListener('click', autoPlay, { once: true });
  document.addEventListener('touchstart', autoPlay, { once: true });

  /* Page visibility — pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) audio.pause();
    else if (!document.hidden && playing) audio.play().catch(() => {});
  });
}

/* ===========================================================
   8.  AOS (Animate on Scroll) INIT
=========================================================== */
function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration : 800,
    easing   : 'ease-out-cubic',
    once     : true,
    offset   : 60,
    mirror   : false,
  });
}

/* ===========================================================
   9.  SMOOTH SCROLL (polyfill for Safari)
=========================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ===========================================================
   10. CARD TILT — subtle 3-D on hover (desktop only)
=========================================================== */
function initCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;   // skip touch devices

  const cards = document.querySelectorAll('.couple-card, .detail-card, .venue-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r    = card.getBoundingClientRect();
      const x    = ((e.clientX - r.left) / r.width  - 0.5) * 12;
      const y    = ((e.clientY - r.top)  / r.height - 0.5) * -12;
      card.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform .15s ease';
    });
  });
}

/* ===========================================================
   11. SCROLL-TO-TOP — reveal after scrolling past hero
=========================================================== */
function initScrollTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '<i class="bi bi-chevron-up"></i>';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.className = 'scroll-top-btn';

  /* Inline styles so no CSS changes are needed */
  Object.assign(btn.style, {
    position  : 'fixed',
    left      : '20px',
    bottom    : '25px',
    width     : '46px',
    height    : '46px',
    borderRadius : '50%',
    border    : '2px solid var(--rose-light)',
    background: 'rgba(255,240,245,0.92)',
    color     : 'var(--rose)',
    fontSize  : '1.2rem',
    cursor    : 'pointer',
    zIndex    : '9998',
    display   : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity   : '0',
    transform : 'translateY(20px)',
    transition: 'opacity .35s ease, transform .35s ease',
    boxShadow : '0 4px 14px var(--shadow-pink)',
  });

  document.body.appendChild(btn);

  const update = () => {
    const show = window.scrollY > window.innerHeight * 0.6;
    btn.style.opacity   = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(20px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  };

  window.addEventListener('scroll', update, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===========================================================
   12. PETAL CURSOR TRAIL (desktop only)
=========================================================== */
function initPetalTrail() {
  if (window.matchMedia('(hover: none)').matches) return;

  const EMOJIS = ['🌸', '💕', '✿', '🌺'];
  let lastTime = 0;

  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - lastTime < 130) return;
    lastTime = now;

    const el = document.createElement('span');
    el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    Object.assign(el.style, {
      position  : 'fixed',
      left      : `${e.clientX - 10}px`,
      top       : `${e.clientY - 10}px`,
      fontSize  : `${14 + Math.random() * 10}px`,
      pointerEvents: 'none',
      zIndex    : '9990',
      userSelect: 'none',
      transition: 'opacity .8s ease, transform .8s ease',
    });

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity   = '0';
      el.style.transform = `translateY(-28px) scale(.6) rotate(${Math.random() * 40 - 20}deg)`;
    });

    setTimeout(() => el.remove(), 850);
  });
}

/* ===========================================================
   13. COUPLE PHOTO — click-to-flip reveal placeholder text
=========================================================== */
function initCoupleCards() {
  document.querySelectorAll('.couple-photo').forEach(photo => {
    photo.style.cursor = 'pointer';
    photo.title = 'Photo coming soon 🌸';

    photo.addEventListener('click', () => {
      const tip = photo.parentElement.querySelector('.photo-tip');
      if (tip) { tip.remove(); return; }

      const msg = document.createElement('p');
      msg.className = 'photo-tip';
      msg.textContent = '📸 Photo coming soon';
      Object.assign(msg.style, {
        color     : 'var(--rose-light)',
        fontSize  : '.82rem',
        marginTop : '.5rem',
        fontFamily: 'var(--font-display)',
        letterSpacing: '.04em',
        animation : 'fadeInOut 2s ease-in-out forwards',
      });
      photo.insertAdjacentElement('afterend', msg);
      setTimeout(() => msg.remove(), 2200);
    });
  });
}

/* ===========================================================
   14. COUNTDOWN FLIP ANIMATION — inject CSS rule once
=========================================================== */
function injectFlipCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .count-num.flip {
      animation: numFlip .35s cubic-bezier(.45,0,.55,1) both;
    }
    @keyframes numFlip {
      0%   { opacity:1; transform:translateY(0)   scale(1);   }
      45%  { opacity:0; transform:translateY(-14px) scale(.9); }
      55%  { opacity:0; transform:translateY(14px)  scale(.9); }
      100% { opacity:1; transform:translateY(0)   scale(1);   }
    }
  `;
  document.head.appendChild(style);
}

/* ===========================================================
   15. VENUE SECTION — add Google Maps embed dynamically
=========================================================== */
function initVenueMap() {
  const venueCard = document.querySelector('.venue-card');
  if (!venueCard) return;

  /* Only inject the iframe once; skip if already present */
  if (venueCard.querySelector('iframe')) return;

  const mapWrap = document.createElement('div');
  mapWrap.style.cssText = 'margin-top:1.5rem;border-radius:12px;overflow:hidden;border:1px solid var(--border-pink);';

  const iframe = document.createElement('iframe');
  /* Lalita Bhadrakali Temple, Devatemane, Sirsi — embedded maps link */
  iframe.src    = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3843.0!2d74.8451!3d14.6204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbca3b0e8f50001%3A0x1!2sLalita+Bhadrakali+Temple%2C+Devatemane%2C+Sirsi!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin';
  iframe.width  = '100%';
  iframe.height = '220';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  iframe.style.display = 'block';

  mapWrap.appendChild(iframe);
  venueCard.appendChild(mapWrap);
}

/* ===========================================================
   BOOT
=========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  injectFlipCSS();
  initLoader();
  initParticles();
  initNavbar();
  initLangSwitch();
  initCountdown();
  initGallery();
  initMusic();
  initAOS();
  initSmoothScroll();
  initCardTilt();
  initScrollTop();
  initPetalTrail();
  initCoupleCards();
  initVenueMap();
});