/* ==========================================================================
   NovaMc.uz — Premium Animation Layer
   Ported from the reference React portfolio's real source (Lenis smooth
   scroll + GSAP/ScrollTrigger patterns: SectionReveal, ProjectCard alt-slide,
   SkillCard flip, Timeline self-drawing line) into vanilla JS for this
   Django/HTML project.
   Author: Zero_dev
   ========================================================================== */

(function () {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var hasST = typeof ScrollTrigger !== 'undefined';

  gsap.defaults({ ease: 'power3.out' });
  document.documentElement.classList.add('js-ready');

  /* -------------------------------------------------------
     0. Lenis — smooth scroll, synced into ScrollTrigger
        (identical config/easing to the source useLenis hook)
  ------------------------------------------------------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !reduceMotion && !isTouch) {
    lenis = new Lenis({
      duration: 0.6,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1.25,
      touchMultiplier: 1.5
    });

    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    if (hasST) lenis.on('scroll', ScrollTrigger.update);
  }

  /* -------------------------------------------------------
     1. Hero heading — word-mask reveal
        (source: opacity/y/scale, ease [0.16,1,0.3,1] ~= expo.out)
  ------------------------------------------------------- */
  function splitWords(el) {
    var text = el.textContent.trim();
    el.innerHTML = text
      .split(' ')
      .map(function (w) {
        return '<span class="word-mask"><span class="word">' + w + '</span></span>';
      })
      .join(' ');
    return el.querySelectorAll('.word');
  }

  var heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  var heroTitle = document.querySelector('.hero h1');

  if (heroTitle && !reduceMotion) {
    var words = splitWords(heroTitle);
    heroTl.fromTo(words, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, delay: 0.2 });
  }

  var heroSubtitle = document.querySelector('.hero .subtitle');
  if (heroSubtitle) {
    heroTl.fromTo(heroSubtitle, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, reduceMotion ? 0 : '-=0.5');
  }

  var heroIpBox = document.querySelector('.server-ip-box');
  if (heroIpBox) {
    heroTl.fromTo(heroIpBox, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.55');
  }

  var hero3d = document.querySelector('.hero-3d-wrapper');
  if (hero3d) {
    heroTl.fromTo(hero3d, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.9');
  }

  var subpageHeader = document.querySelector('.subpage-3d-header');
  if (subpageHeader) {
    gsap.fromTo(subpageHeader, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
  }

  /* -------------------------------------------------------
     2. Header — sticky blur state on scroll
  ------------------------------------------------------- */
  var header = document.querySelector('header');
  if (header && hasST) {
    ScrollTrigger.create({
      start: 'top -60',
      end: 99999,
      onUpdate: function (self) {
        header.classList.toggle('is-scrolled', self.scroll() > 60);
      }
    });
  }

  /* -------------------------------------------------------
     3. SectionReveal — generic fade + translateY on enter
        (source: opacity 0->1, y 40->0, duration 1, power3.out,
        start 'top 85%', toggleActions 'play none none reverse')
  ------------------------------------------------------- */
  /* -------------------------------------------------------
     3. Section & Card reveals (Clean render, no ST opacity trapping)
  ------------------------------------------------------- */

  /* -------------------------------------------------------
     5. SkillCard-style hover effect for support cards
  ------------------------------------------------------- */
  if (hasST) {
    gsap.utils.toArray('.support-card').forEach(function (el) {
      if (!isTouch && !reduceMotion) {
        el.style.transformStyle = 'preserve-3d';
        el.addEventListener('mouseenter', function () {
          gsap.to(el, { rotateY: 6, rotateX: -4, duration: 0.3, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', function () {
          gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.4, ease: 'power2.out' });
        });
      }
    });
  }

  /* -------------------------------------------------------
     6. Timeline-style self-drawing connector line
        (source: SVG path, stroke-dashoffset scrubbed 0->length
        via ScrollTrigger — applied to the buy-steps guide, the
        page whose step-item list matches Timeline's structure)
  ------------------------------------------------------- */
  if (hasST && !reduceMotion) {
    var guide = document.querySelector('.guide-container');
    var steps = guide ? guide.querySelectorAll('.step-item') : [];
    if (guide && steps.length > 1) {
      if (getComputedStyle(guide).position === 'static') guide.style.position = 'relative';

      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '2');
      svg.style.position = 'absolute';
      svg.style.overflow = 'visible';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '0';

      var defs = document.createElementNS(svgNS, 'defs');
      var gradient = document.createElementNS(svgNS, 'linearGradient');
      gradient.setAttribute('id', 'novaStepLineGradient');
      gradient.setAttribute('x1', '0');
      gradient.setAttribute('y1', '0');
      gradient.setAttribute('x2', '0');
      gradient.setAttribute('y2', '1');
      [
        ['0%', '#9b51e0'],
        ['50%', '#03dac6'],
        ['100%', '#ffb86c']
      ].forEach(function (stop) {
        var s = document.createElementNS(svgNS, 'stop');
        s.setAttribute('offset', stop[0]);
        s.setAttribute('stop-color', stop[1]);
        gradient.appendChild(s);
      });
      defs.appendChild(gradient);

      var trackPath = document.createElementNS(svgNS, 'path');
      trackPath.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      trackPath.setAttribute('stroke-width', '2');
      trackPath.setAttribute('fill', 'none');

      var linePath = document.createElementNS(svgNS, 'path');
      linePath.setAttribute('stroke', 'url(#novaStepLineGradient)');
      linePath.setAttribute('stroke-width', '2');
      linePath.setAttribute('fill', 'none');

      svg.appendChild(defs);
      svg.appendChild(trackPath);
      svg.appendChild(linePath);
      guide.insertBefore(svg, guide.firstChild);

      steps.forEach(function (s) {
        var num = s.querySelector('.step-number');
        if (num && getComputedStyle(num).position === 'static') {
          num.style.position = 'relative';
          num.style.zIndex = '2';
        }
      });

      var pathLength = 0;
      function layoutLine() {
        var containerRect = guide.getBoundingClientRect();
        var firstNum = steps[0].querySelector('.step-number');
        var lastNum = steps[steps.length - 1].querySelector('.step-number');
        if (!firstNum || !lastNum) return;
        var firstRect = firstNum.getBoundingClientRect();
        var lastRect = lastNum.getBoundingClientRect();
        var x = firstRect.left - containerRect.left + firstRect.width / 2;
        var yTop = firstRect.top - containerRect.top + firstRect.height / 2;
        var yBottom = lastRect.top - containerRect.top + lastRect.height / 2;
        var h = Math.max(1, yBottom - yTop);

        svg.style.left = x - 1 + 'px';
        svg.style.top = yTop + 'px';
        svg.setAttribute('height', h);
        var d = 'M1 0 V' + h;
        trackPath.setAttribute('d', d);
        linePath.setAttribute('d', d);

        pathLength = linePath.getTotalLength();
        linePath.style.strokeDasharray = pathLength;
        linePath.style.strokeDashoffset = pathLength;
      }

      layoutLine();
      window.addEventListener('resize', layoutLine);
      if (lenis) lenis.on('scroll', layoutLine);

      ScrollTrigger.create({
        trigger: guide,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6,
        onUpdate: function (self) {
          linePath.style.strokeDashoffset = pathLength * (1 - self.progress);
        }
      });
    }
  }

  /* -------------------------------------------------------
     7. Subpage 3D header — parallax drift
        (source: About section's model parallax, y 80 + rotation 6,
        scrubbed across the trigger's full viewport pass)
  ------------------------------------------------------- */
  if (hasST && !reduceMotion && subpageHeader) {
    var container3d = subpageHeader.querySelector('.subpage-3d-container');
    if (container3d) {
      gsap.to(container3d, {
        y: 30,
        rotation: 3,
        ease: 'none',
        scrollTrigger: { trigger: subpageHeader, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    }
  }

  /* -------------------------------------------------------
     8. Buttons — press-scale micro-interaction
        (source: whileHover scale 1.02-1.03, whileTap scale 0.98)
  ------------------------------------------------------- */
  if (!reduceMotion) {
    document.querySelectorAll('.btn-primary, .mode-btn').forEach(function (btn) {
      btn.addEventListener('pointerdown', function () {
        gsap.to(btn, { scale: 0.97, duration: 0.15, ease: 'power2.out' });
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (evt) {
        btn.addEventListener(evt, function () {
          gsap.to(btn, { scale: 1, duration: 0.3, ease: 'power2.out' });
        });
      });
    });
  }

  /* -------------------------------------------------------
     9. Online player counter — count-up
  ------------------------------------------------------- */
  var playerCountEl = document.getElementById('player-count');
  if (playerCountEl && !reduceMotion) {
    var raw = playerCountEl.textContent;
    var match = raw.match(/\d+/);
    if (match) {
      var target = parseInt(match[0], 10);
      var counter = { val: 0 };
      gsap.to(counter, {
        val: target,
        duration: 1.2,
        delay: 0.6,
        ease: 'power2.out',
        onUpdate: function () {
          playerCountEl.textContent = raw.replace(match[0], Math.floor(counter.val));
        }
      });
    }
  }

  /* -------------------------------------------------------
     10. IP modal / chat window — pop-in on open
  ------------------------------------------------------- */
  function watchOpen(elId, innerSelector) {
    var el = document.getElementById(elId);
    if (!el) return;
    var inner = innerSelector ? el.querySelector(innerSelector) : el;
    var observer = new MutationObserver(function () {
      if (el.classList.contains('active') && inner) {
        gsap.fromTo(inner, { opacity: 0, y: 24, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.6)' });
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  }
  watchOpen('ipModal', '.modal-content');
  watchOpen('chatWindow');

  /* -------------------------------------------------------
     11. Form inputs — focus glow
  ------------------------------------------------------- */
  document.querySelectorAll('.input-wrapper input, .input-wrapper select').forEach(function (inp) {
    inp.addEventListener('focus', function () {
      gsap.to(inp, { boxShadow: '0 0 0 3px rgba(3,218,198,0.18)', duration: 0.3 });
    });
    inp.addEventListener('blur', function () {
      gsap.to(inp, { boxShadow: '0 0 0 0px rgba(3,218,198,0)', duration: 0.3 });
    });
  });
})();
