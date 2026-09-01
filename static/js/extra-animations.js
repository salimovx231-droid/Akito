/* ==========================================================================
   NovaMc.uz — Extra Animation Layer #2
   Adds: tsParticles ambient background, custom magnetic cursor, magnetic
   buttons, click-ripple, confetti celebration, animated page transitions,
   text-scramble hover, count-up numbers, chat pulse-in. All modules are
   defensive (feature-detect each library) and fully respect
   prefers-reduced-motion + touch devices.
   Author: Zero_dev
   ========================================================================== */

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var hasGSAP = typeof gsap !== 'undefined';

  if (reduceMotion) return;

  /* -------------------------------------------------------
     1. tsParticles — ambient floating spark/block particles
  ------------------------------------------------------- */
  function initParticles() {
    if (typeof tsParticles === 'undefined') return;
    var host = document.createElement('div');
    host.id = 'tsparticles';
    document.body.prepend(host);

    tsParticles.load('tsparticles', {
      fpsLimit: 60,
      fullScreen: { enable: false },
      particles: {
        number: { value: isTouch ? 22 : 46, density: { enable: true, area: 900 } },
        color: { value: ['#9b51e0', '#03dac6', '#ffb86c'] },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.08, max: 0.45 },
          animation: { enable: true, speed: 0.5, sync: false }
        },
        size: { value: { min: 1, max: 3 } },
        links: {
          enable: true,
          distance: 130,
          color: '#9b51e0',
          opacity: 0.08,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' }
        }
      },
      interactivity: {
        events: {
          onHover: { enable: !isTouch, mode: 'grab' },
          resize: true
        },
        modes: {
          grab: { distance: 140, links: { opacity: 0.35 } }
        }
      },
      detectRetina: true
    }).catch(function () {});
  }

  /* -------------------------------------------------------
     2. Custom cursor — dot + trailing ring, magnetic snap
        on interactive elements
  ------------------------------------------------------- */
  function initCustomCursor() {
    if (isTouch || !hasGSAP) return;
    document.documentElement.classList.add('custom-cursor-on');

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
    var dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
    var ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    var ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    window.addEventListener('pointermove', function (e) {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    });

    var interactiveSel = 'a, button, .btn-primary, .mode-btn, .server-ip-box, input, select, textarea, .support-card, [data-tilt]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSel)) ring.classList.add('is-active');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSel)) ring.classList.remove('is-active');
    });

    document.addEventListener('mousedown', function () {
      gsap.to(dot, { scale: 1.8, duration: 0.15 });
    });
    document.addEventListener('mouseup', function () {
      gsap.to(dot, { scale: 1, duration: 0.25 });
    });
  }

  /* -------------------------------------------------------
     3. Magnetic buttons — pulls toward cursor within radius
  ------------------------------------------------------- */
  function initMagneticButtons() {
    if (isTouch || !hasGSAP) return;
    var targets = document.querySelectorAll('.btn-primary, .mode-btn, .chat-floating-btn, .nav-social-btn');
    targets.forEach(function (el) {
      var strength = 18;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var relX = e.clientX - (r.left + r.width / 2);
        var relY = e.clientY - (r.top + r.height / 2);
        gsap.to(el, {
          x: (relX / r.width) * strength,
          y: (relY / r.height) * strength,
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* -------------------------------------------------------
     4. Click ripple — Material-style expanding circle
  ------------------------------------------------------- */
  function initRipple() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('.btn-primary, .buy-btn, .mode-btn');
      if (!el) return;
      var rect = el.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var ripple = document.createElement('span');
      ripple.className = 'nova-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      el.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 650);
    });
  }

  /* -------------------------------------------------------
     5. Text scramble — nav links & hero title on hover
        (lightweight character-shuffle, no dependency)
  ------------------------------------------------------- */
  function scramble(el) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
    var original = el.dataset.originalText || el.textContent;
    el.dataset.originalText = original;
    var frame = 0;
    var totalFrames = 10;
    if (el._scrambleTimer) clearInterval(el._scrambleTimer);
    el._scrambleTimer = setInterval(function () {
      var out = '';
      for (var i = 0; i < original.length; i++) {
        if (original[i] === ' ') { out += ' '; continue; }
        if (i < (frame / totalFrames) * original.length) out += original[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      frame++;
      if (frame > totalFrames) {
        clearInterval(el._scrambleTimer);
        el.textContent = original;
      }
    }, 30);
  }

  function initTextScramble() {
    if (isTouch) return;
    document.querySelectorAll('nav ul a').forEach(function (a) {
      a.addEventListener('mouseenter', function () { scramble(a); });
    });
  }

  /* -------------------------------------------------------
     6. Confetti celebration hook — call window.novaCelebrate()
        (wired into the buy-form success path in index.html)
  ------------------------------------------------------- */
  window.novaCelebrate = function () {
    if (typeof confetti === 'undefined') return;
    var colors = ['#9b51e0', '#03dac6', '#ffb86c'];
    confetti({ particleCount: 90, spread: 75, startVelocity: 45, origin: { y: 0.65 }, colors: colors });
    setTimeout(function () {
      confetti({ particleCount: 50, spread: 100, startVelocity: 30, origin: { x: 0.2, y: 0.7 }, colors: colors });
      confetti({ particleCount: 50, spread: 100, startVelocity: 30, origin: { x: 0.8, y: 0.7 }, colors: colors });
    }, 180);
  };

  /* -------------------------------------------------------
     7. Animated page transition — fade/wipe overlay on
        internal navigation so route changes feel like SPA
  ------------------------------------------------------- */
  function initPageTransitions() {
    if (!hasGSAP) return;
    var overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    // NOTE: overlay starts hidden (scaleX 0 via CSS) — the site-loader
    // already owns the initial-load wipe, so this only fires on outgoing
    // internal navigation to avoid the two overlays fighting each other.

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (link.hostname && link.hostname !== window.location.hostname) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      overlay.classList.remove('is-entering');
      overlay.classList.add('is-leaving');
      gsap.fromTo(overlay, { scaleX: 0 }, {
        scaleX: 1, duration: 0.5, ease: 'power3.inOut', transformOrigin: 'left',
        onComplete: function () { window.location.href = href; }
      });
    });
  }

  /* -------------------------------------------------------
     8. Marquee-style tiny floating icons drifting in hero
        (pure CSS-independent GSAP loop, cheap on perf)
  ------------------------------------------------------- */
  function initFloatingOrbs() {
    if (!hasGSAP) return;
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;';
    hero.style.position = hero.style.position || 'relative';
    hero.prepend(wrap);

    var palette = ['#9b51e0', '#03dac6', '#ffb86c'];
    for (var i = 0; i < 10; i++) {
      var orb = document.createElement('span');
      var s = 4 + Math.random() * 10;
      orb.style.cssText = 'position:absolute;border-radius:50%;filter:blur(1px);opacity:' + (0.15 + Math.random() * 0.25) + ';';
      orb.style.width = s + 'px';
      orb.style.height = s + 'px';
      orb.style.background = palette[i % palette.length];
      orb.style.left = Math.random() * 100 + '%';
      orb.style.top = Math.random() * 100 + '%';
      wrap.appendChild(orb);

      gsap.to(orb, {
        y: '+=' + (30 + Math.random() * 60) * (Math.random() > 0.5 ? 1 : -1),
        x: '+=' + (20 + Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1),
        duration: 6 + Math.random() * 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
      });
    }
  }

  /* -------------------------------------------------------
     9. Chat window entrance micro-bounce for unread badge
  ------------------------------------------------------- */
  function initBadgeWatcher() {
    if (!hasGSAP) return;
    var badge = document.querySelector('.chat-unread-badge');
    if (!badge) return;
    var observer = new MutationObserver(function () {
      if (badge.style.display === 'flex') {
        gsap.fromTo(badge, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
      }
    });
    observer.observe(badge, { attributes: true, attributeFilter: ['style'] });
  }

  /* -------------------------------------------------------
     10. Re-apply .shimmer-text to the hero's split word-span
         (animations.js's splitWords rebuilds h1 innerHTML from
         plain textContent, so any inline span markup is lost —
         reattach the gradient shimmer to the matching word here)
  ------------------------------------------------------- */
  function initHeroShimmer() {
    document.querySelectorAll('.hero h1 .word').forEach(function (w) {
      if (w.textContent.replace(/[.,]/g, '').toLowerCase().indexOf('novamc') !== -1) {
        w.classList.add('shimmer-text');
      }
    });
  }

  /* -------------------------------------------------------
     Boot
  ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initCustomCursor();
    initMagneticButtons();
    initRipple();
    initTextScramble();
    initPageTransitions();
    initFloatingOrbs();
    initBadgeWatcher();
    initHeroShimmer();
  });
})();
