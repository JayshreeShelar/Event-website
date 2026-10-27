/* Event - vanilla JS: includes, nav, reveal, counters, slider, gallery, form */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var WA_NUMBER = '918830532500'; // enquiry WhatsApp number (country code + number, no + or spaces)
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 1. Optional shared components: <div data-include="components/header.html"></div> ---- */
  var includes = $$('[data-include]');
  includes.forEach(function (el) {
    fetch(el.getAttribute('data-include')).then(function (r) { return r.text(); })
      .then(function (html) { el.outerHTML = html; init(); })
      .catch(function () { /* opened via file:// - inline markup in index.html is used instead */ });
  });
  init();

  var started = false;
  function init() {
    if (started && !includes.length) return;
    started = true;
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    mobileNav(); activeNav(); reveal(); counters(); slider(); gallery(); form(); eventLinks(); fx();
  }

  /* ---- 2. Mobile drawer ---- */
  function mobileNav() {
    var burger = $('#burger'), side = $('#sidebar'), scrim = $('#scrim');
    if (!burger || burger._b) return; burger._b = true;
    function set(open) {
      side.classList.toggle('is-open', open); scrim.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    burger.addEventListener('click', function () { set(!side.classList.contains('is-open')); });
    scrim.addEventListener('click', function () { set(false); });
    $$('a', side).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  }

  /* ---- 3. Active nav while scrolling ---- */
  function activeNav() {
    var links = $$('.nav__link'); if (!links.length) return;
    var map = {};
    links.forEach(function (l) { map[l.getAttribute('href').slice(1)] = l; });
    var secs = $$('[data-section]');
    function update() {
      var mid = window.scrollY + window.innerHeight * 0.35, cur = secs[0];
      secs.forEach(function (s) { if (s.offsetTop <= mid) cur = s; });
      var id = cur.id === 'process' ? 'events' : cur.id; // process has no own link
      links.forEach(function (l) { l.classList.remove('is-active'); });
      if (map[id]) map[id].classList.add('is-active');
    }
    window.addEventListener('scroll', update, { passive: true }); update();
  }

  /* ---- 4. Scroll reveal ---- */
  function reveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e, i) { e.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(e); });
  }

  /* ---- 5. Stat counters ---- */
  function counters() {
    var els = $$('[data-count]');
    if (!('IntersectionObserver' in window) || reduce) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return; io.unobserve(x.target);
        var el = x.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
        (function tick(t) {
          var p = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- 6. Event slider ---- */
  function slider() {
    var track = $('#track'); if (!track || track._s) return; track._s = true;
    var cards = $$('.ecard', track), now = $('#slideNow'), total = $('#slideTotal');
    total.textContent = pad(cards.length);
    function step() { return cards[0].getBoundingClientRect().width + 16; }
    function idx() { return Math.min(cards.length, Math.round(track.scrollLeft / step()) + 1); }
    function go(d) {
      var max = track.scrollWidth - track.clientWidth;
      if (d > 0 && track.scrollLeft >= max - 4) track.scrollTo({ left: 0 });
      else if (d < 0 && track.scrollLeft <= 4) track.scrollTo({ left: max });
      else track.scrollBy({ left: d * step() });
    }
    $('#next').addEventListener('click', function () { go(1); });
    $('#prev').addEventListener('click', function () { go(-1); });
    track.addEventListener('scroll', function () { now.textContent = pad(idx()); }, { passive: true });
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---- 7. Gallery lightbox ---- */
  function gallery() {
    var lb = $('#lightbox'); if (!lb || lb._g) return; lb._g = true;
    var imgs = $$('.collage__item img').map(function (i) { return { src: i.getAttribute('src'), alt: i.getAttribute('alt') }; });
    var cur = 0, last = null, big = $('#lbImg');
    function show(i) { cur = (i + imgs.length) % imgs.length; big.src = imgs[cur].src; big.alt = imgs[cur].alt; }
    function open(i) { last = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); }
    $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { open(+b.dataset.open); }); });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { show(cur - 1); });
    $('#lbNext').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---- 8. Service / event buttons preselect the enquiry type ---- */
  function eventLinks() {
    var sel = $('#f-type'); if (!sel) return;
    $$('[data-event]').forEach(function (a) {
      if (a._e) return; a._e = true;
      a.addEventListener('click', function () { sel.value = a.dataset.event; });
    });
  }

  /* ---- 10. Premium effects: scroll bar, hero parallax, 3D tilt, cursor spotlight, magnetic buttons ---- */
  function fx() {
    if (document.body._fx) return; document.body._fx = true;
    var bar = $('#scroll-bar'), bg = $('.hero__bg'), ticking = false;
    function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
      if (bg && !reduce && scrollY < 900) bg.style.translate = '0 ' + (scrollY * 0.12) + 'px';
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();
    if (reduce || !matchMedia('(hover: hover)').matches) return;
    $$('.spot').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty('--mx', x + 'px'); el.style.setProperty('--my', y + 'px');
      });
    });
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.classList.add('is-tilting');
        el.style.transform = 'perspective(800px) rotateX(' + (-py * 8) + 'deg) rotateY(' + (px * 10) + 'deg) translateY(-8px) scale(1.02)';
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
    $$('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .3 - 3) + 'px) scale(1.04)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---- 9. Contact form: validation + mailto hand-off (no fake "sent" message) ---- */
  function form() {
    var f = $('#enquiry'); if (!f || f._f) return; f._f = true;
    var status = $('#status');
    var d = $('#f-date'); var t = new Date(); d.min = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      type: function (v) { return v ? '' : 'Please choose an event type.'; },
      date: function (v) { return !v ? 'Please pick an event date.' : (v < d.min ? 'Date cannot be in the past.' : ''); },
      msg: function (v) { return v.trim().length >= 10 ? '' : 'Please tell us a little more (10+ characters).'; }
    };
    var ids = { name: 'f-name', email: 'f-email', type: 'f-type', date: 'f-date', msg: 'f-msg' };
    function check(k) {
      var el = $('#' + ids[k]), m = rules[k](el.value);
      $('#e-' + k).textContent = m; el.closest('.field').classList.toggle('invalid', !!m);
      el.setAttribute('aria-invalid', !!m); if (m) el.setAttribute('aria-describedby', 'e-' + k);
      return !m;
    }
    Object.keys(ids).forEach(function (k) {
      var el = $('#' + ids[k]);
      el.addEventListener('blur', function () { check(k); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('invalid')) check(k); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = Object.keys(ids).map(check).every(Boolean);
      status.className = 'form__status';
      if (!ok) {
        status.textContent = 'Please fix the highlighted fields.'; status.classList.add('bad');
        var bad = $('.invalid input, .invalid select, .invalid textarea', f); if (bad) bad.focus(); return;
      }
      var msg = [
        '*New Event Enquiry* 🎉', '',
        'Hello Event team, I would like to enquire about an event.', '',
        '*Name:* ' + $('#f-name').value.trim(),
        '*Email:* ' + $('#f-email').value.trim(),
        '*Event Type:* ' + $('#f-type').value,
        '*Event Date:* ' + $('#f-date').value, '',
        '*Details:*', $('#f-msg').value.trim(), '',
        'Please get in touch. Thank you!'
      ].join('\n');
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
      status.textContent = 'Opening WhatsApp with your enquiry filled in. Press Send there to deliver it.';
    });
  }
})();
