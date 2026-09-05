var _yr = document.getElementById('yr'); if (_yr) _yr.textContent = new Date().getFullYear();

// nav scroll state
const nav = document.getElementById('siteNav');
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (nav) nav.classList.toggle('scrolled', y > 40);
  if (backTop) backTop.classList.toggle('show', y > 480);
}, {passive:true});

// mobile menu
const menuToggle = document.getElementById('menuToggle');
const mobilePanel = document.getElementById('mobilePanel');
const mobileClose = document.getElementById('mobileClose');
function closeMenu(){
  if (mobilePanel) mobilePanel.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (menuToggle){ menuToggle.setAttribute('aria-expanded','false'); menuToggle.focus(); }
}
if (menuToggle && mobilePanel){
  menuToggle.addEventListener('click', () => {
    const open = mobilePanel.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && mobileClose) mobileClose.focus();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobilePanel.classList.contains('open')) closeMenu(); });
}
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobilePanel) mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// back to top
if (backTop) backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

// hero background slideshow (auto-rotates, pauses for reduced-motion users)
(function(){
  var layers = document.querySelectorAll('.hero-bg-layer');
  if (layers.length < 2) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0;
  setInterval(function(){
    layers[i].classList.remove('active');
    i = (i + 1) % layers.length;
    layers[i].classList.add('active');
  }, 6000);
})();

// "Our Story" photo frame slideshow (auto-rotates, pauses for reduced-motion users)
(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.story-frame').forEach(function(frame){
    var slides = frame.querySelectorAll('.story-frame-img');
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function(){
      slides[i].classList.remove('active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('active');
    }, 5000);
  });
})();

// scrollspy (anchor links only - multi-page nav links like about.html are skipped)
const navLinks = document.querySelectorAll('[data-nav]');
const sections = Array.from(navLinks).map(l => {
  const href = l.getAttribute('href') || '';
  return href.charAt(0) === '#' ? document.querySelector(href) : null;
});
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = '#' + entry.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
    }
  });
}, {rootMargin:'-45% 0px -50% 0px'});
sections.forEach(s => s && spy.observe(s));

// reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); ro.unobserve(e.target); } });
}, {threshold:0.12});
reveals.forEach(el => ro.observe(el));

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  if (!q || !a) return;
  q.setAttribute('aria-expanded', 'false');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      const oa = other.querySelector('.faq-a'); if (oa) oa.style.maxHeight = null;
      const oq = other.querySelector('.faq-q'); if (oq) oq.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen){
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
      q.setAttribute('aria-expanded', 'true');
    }
  });
});

// gallery filter (visual only - categories are illustrative until real photos are added)
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
    const cat = btn.textContent.trim();
    document.querySelectorAll('.gal-item').forEach(item => {
      const tagEl = item.querySelector('.gtag');
      const tag = tagEl ? tagEl.textContent.trim() : '';
      item.style.display = (cat === 'All' || tag === cat) ? '' : 'none';
    });
  });
});

// Enquiry form -> opens a pre-filled WhatsApp chat (the conversion spine of
// the strategy: every enquiry becomes a real, human conversation). No backend
// needed. If the browser blocks the pop-up, we fall back to a tap-to-send link
// plus email, so an enquiry is never lost.
const form = document.getElementById('enquiryForm');
const formMsg = document.getElementById('formMsg');
const WA_NUMBER = '447823683189';
const ENQUIRY_EMAIL = 'eventsbyluwa22@gmail.com';
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.checkValidity()){ form.reportValidity(); return; }
  const val = id => (document.getElementById(id)?.value || '').trim();
  const name = [val('fname'), val('lname')].filter(Boolean).join(' ');
  const lines = [
    'Hello Events by Luwa, I would like to plan an event.',
    '',
    'Name: ' + name,
    'Email: ' + val('email'),
    'Phone: ' + val('phone'),
    'Event: ' + val('eventType'),
    val('eventDate') ? 'Preferred date: ' + val('eventDate') : '',
    val('guests')    ? 'Estimated guests: ' + val('guests') : '',
    val('budget')    ? 'Estimated budget: ' + val('budget') : '',
    '',
    'Details: ' + val('message')
  ].filter(l => l !== '');
  const text = encodeURIComponent(lines.join('\n'));
  const waLink = 'https://wa.me/' + WA_NUMBER + '?text=' + text;

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Opening WhatsApp';

  // Fire synchronously inside the click gesture so the browser allows it.
  const wa = window.open(waLink, '_blank', 'noopener');

  // Background: email a copy to Events by Luwa and auto-reply to the enquirer,
  // so a lead is captured even if the visitor never taps send in WhatsApp.
  try {
    fetch('https://formsubmit.co/ajax/eventsbyluwa22@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: name, email: val('email'), phone: val('phone'), event: val('eventType'),
        date: val('eventDate'), guests: val('guests'), budget: val('budget'), details: val('message'),
        _subject: 'New event enquiry from ' + (name || 'the website'),
        _template: 'table',
        _autoresponse: 'Thank you for reaching out to Events by Luwa. We have received your enquiry and will reply personally, usually within a few hours. Warm regards, the Events by Luwa team.'
      })
    }).catch(function(){});
  } catch (err) {}

  setTimeout(() => {
    var note = wa
      ? "We've opened WhatsApp with your details. Just tap <strong>send</strong> and we'll take it from there. We reply personally, usually within a few hours."
      : 'Your enquiry is ready. <a href="' + waLink + '" target="_blank" rel="noopener" style="color:var(--teal-deep);font-weight:700;text-decoration:underline;">Tap to send it on WhatsApp</a>, or email <a href="mailto:' + ENQUIRY_EMAIL + '" style="color:var(--teal-deep);font-weight:700;text-decoration:underline;">' + ENQUIRY_EMAIL + '</a>.';
    formMsg.innerHTML =
      '<div style="display:flex;gap:13px;align-items:flex-start;text-align:left;">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" style="width:28px;height:28px;color:var(--teal-deep);flex:none;margin-top:2px;"><path d="M2 13c3-3.4 5.3-4.4 7-3.2.4.3.7.7 1 1.2.3-.5.6-.9 1-1.2 1.7-1.2 4-.2 7 3.2-2.4-1.1-4.2-1.4-5.5-1-1 .3-1.8 1-2.5 2-.7-1-1.5-1.7-2.5-2-1.3-.4-3.1-.1-5.5 1Z"/></svg>' +
        '<div><strong style="display:block;font-family:\'Playfair Display\',serif;font-size:1.1rem;color:var(--teal-deep);margin-bottom:3px;">Thank you. Your enquiry is on its way.</strong>' +
        '<span>' + note + '</span></div>' +
      '</div>';
    formMsg.classList.add('show');
    formMsg.setAttribute('role', 'status');
    formMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    btn.disabled = false; btn.textContent = 'Send Enquiry';
    form.reset();
  }, 700);
});

// ---- Elevation layer (Orion Soft) ----
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cinematic hero entrance (fires once the page has settled)
  function loaded(){ document.body.classList.add('loaded'); }
  if (document.readyState === 'complete') loaded();
  else window.addEventListener('load', loaded);
  setTimeout(loaded, 1400); // safety net so the hero can never stay hidden

  // Stagger reveals within each grid so cards arrive in sequence, not all at once
  document.querySelectorAll('.grid-3,.svc-grid,.pkg-grid,.blog-grid,.values-grid,.testi-grid').forEach(function(group){
    var i = 0;
    Array.prototype.forEach.call(group.children, function(el){
      if (el.classList && el.classList.contains('reveal')) { el.style.setProperty('--i', i++); }
    });
  });

  // Gold scroll thread tracks reading progress
  var sp = document.getElementById('scrollProgress');
  function progress(){
    var d = document.documentElement, max = d.scrollHeight - d.clientHeight;
    var p = max > 0 ? (window.scrollY / max) : 0;
    if (sp) sp.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }
  window.addEventListener('scroll', progress, {passive:true});
  window.addEventListener('resize', progress); progress();

  // Subtle parallax tilt on the diamond lattice (desktop, motion-friendly only)
  if (!reduce){
    var hero = document.querySelector('.hero'), lat = document.querySelector('.lattice');
    if (hero && lat && window.matchMedia('(min-width:981px)').matches){
      hero.addEventListener('mousemove', function(e){
        var r = hero.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        lat.style.transform = 'translate(' + (dx*16).toFixed(1) + 'px,' + (dy*16).toFixed(1) + 'px)';
      });
      hero.addEventListener('mouseleave', function(){ lat.style.transform = ''; });
    }
  }

  // Loading screen: show once per session only, then dismiss fast (no fake delay on every click)
  var loader = document.getElementById('loader');
  try {
    if (sessionStorage.getItem('ebl_seen') && loader) { if (loader.parentNode) loader.parentNode.removeChild(loader); loader = null; }
    else { sessionStorage.setItem('ebl_seen', '1'); }
  } catch (e) {}
  function hideLoader(){ if (loader) loader.classList.add('done'); }
  if (loader) {
    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 900);
  }

  // Gallery lightbox - works the moment a tile holds a real <img>; dormant for
  // gradient placeholders. Swipeable/arrow-navigable through whichever photos
  // are currently visible in that grid (i.e. scoped to the active category
  // filter - "swipe through a section" rather than the whole gallery at once).
  var lb = document.getElementById('lightbox');
  var lbImg = lb ? lb.querySelector('img') : null;
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCount = document.getElementById('lbCount');
  if (lb && lbImg){
    var visibleSet = [];   // <img> elements currently swipeable through
    var visibleIdx = 0;

    function setSlide(i){
      if (!visibleSet.length) return;
      visibleIdx = (i + visibleSet.length) % visibleSet.length;
      var img = visibleSet[visibleIdx];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || 'Events by Luwa event';
      if (lbCount) lbCount.textContent = visibleSet.length > 1 ? (visibleIdx + 1) + ' / ' + visibleSet.length : '';
      var multi = visibleSet.length > 1;
      if (lbPrev) lbPrev.hidden = !multi;
      if (lbNext) lbNext.hidden = !multi;
    }
    var goPrev = function(){ setSlide(visibleIdx - 1); };
    var goNext = function(){ setSlide(visibleIdx + 1); };

    var closeLb = function(){
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
      lbImg.src = ''; visibleSet = [];
    };
    if (lbClose) lbClose.addEventListener('click', closeLb);
    if (lbPrev) lbPrev.addEventListener('click', goPrev);
    if (lbNext) lbNext.addEventListener('click', goNext);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    });

    // Touch swipe: the image follows the finger, then either completes the
    // swipe to the next/prev photo or springs back if the drag was too short.
    var touchStartX = 0, touchDeltaX = 0, dragging = false;
    lb.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX; touchDeltaX = 0; dragging = true;
      lb.classList.add('swiping');
    }, {passive:true});
    lb.addEventListener('touchmove', function(e){
      if (!dragging) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
      lbImg.style.transform = 'translateX(' + touchDeltaX + 'px)';
      lbImg.style.opacity = String(Math.max(0.4, 1 - Math.abs(touchDeltaX) / 400));
    }, {passive:true});
    lb.addEventListener('touchend', function(){
      if (!dragging) return;
      dragging = false;
      lb.classList.remove('swiping');
      lbImg.style.transform = ''; lbImg.style.opacity = '';
      var THRESHOLD = 55;
      if (touchDeltaX > THRESHOLD) goPrev();
      else if (touchDeltaX < -THRESHOLD) goNext();
      touchDeltaX = 0;
    });

    // Reusable so dynamically-loaded photos become clickable too. Idempotent.
    window.EBL_bindLightbox = function(scope){
      (scope || document).querySelectorAll('.gal-item').forEach(function(item){
        if (item.dataset.lbBound) return;
        var img = item.querySelector('img');
        if (!img) return; // placeholder tiles carry no photo yet
        item.dataset.lbBound = '1';
        item.style.cursor = 'zoom-in';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        var openLb = function(){
          var grid = item.closest('[data-gallery]') || document;
          visibleSet = Array.prototype.filter.call(grid.querySelectorAll('.gal-item'), function(it){
            return it.style.display !== 'none' && it.querySelector('img');
          }).map(function(it){ return it.querySelector('img'); });
          var startIdx = visibleSet.indexOf(img);
          lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
          setSlide(startIdx >= 0 ? startIdx : 0);
          if (lbClose) lbClose.focus();
        };
        item.addEventListener('click', openLb);
        item.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); } });
      });
    };
    window.EBL_bindLightbox(document);
  }

  // Footer newsletter - one-tap subscribe. Posts the subscriber straight to
  // Events by Luwa via FormSubmit (free, no backend). The visitor never has to
  // open their own email. Falls back to a mailto link only if the request fails.
  var news = document.getElementById('newsletterForm');
  if (news){
    news.addEventListener('submit', function(e){
      e.preventDefault();
      if (!news.checkValidity()){ news.reportValidity(); return; }
      var email = (document.getElementById('newsEmail').value || '').trim();
      var done = document.getElementById('newsDone');
      var btn = news.querySelector('button[type="submit"]');
      if (btn){ btn.disabled = true; btn.textContent = 'Subscribing'; }
      fetch('https://formsubmit.co/ajax/eventsbyluwa22@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: email,
          _subject: 'New newsletter subscriber',
          _template: 'table',
          message: 'New newsletter subscriber: ' + email
        })
      })
      .then(function(r){ return r.json(); })
      .then(function(){
        if (done){ done.textContent = 'Thank you. You are on the list, we will be in touch with lovely things.'; done.classList.add('show'); }
        news.reset();
      })
      .catch(function(){
        if (done){ done.innerHTML = 'Almost there. Please email <a href="mailto:eventsbyluwa22@gmail.com" style="color:var(--gold-pale);font-weight:700;">eventsbyluwa22@gmail.com</a> to subscribe.'; done.classList.add('show'); }
      })
      .finally(function(){ if (btn){ btn.disabled = false; btn.textContent = 'Subscribe'; } });
    });
  }
})();

// ---- Booking modal (progressive enhancement: CTAs still navigate without JS) ----
(function(){
  var WA = '447823683189', EMAIL = 'eventsbyluwa22@gmail.com';
  var services = ['Wedding','Birthday','Corporate Event','Anniversary','Surprise Party','Burial','Vendor Management','Ushering','Other'];
  var m = document.createElement('div');
  m.className = 'booking-modal';
  m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
  m.setAttribute('aria-label','Book a free consultation'); m.setAttribute('aria-hidden','true');
  var opts = services.map(function(s){ return '<option value="'+s+'">'+s+'</option>'; }).join('');
  m.innerHTML =
    '<div class="booking-card">' +
      '<div class="booking-head"><div><h3>Book a free consultation</h3>' +
      '<p>Tell us a little about your event and we will reply personally, usually within a few hours.</p></div>' +
      '<button type="button" class="booking-close" aria-label="Close">&times;</button></div>' +
      '<form class="booking-form" novalidate>' +
        '<div class="field"><label for="bkService">Type of event</label><select id="bkService" required>'+opts+'</select></div>' +
        '<div class="form-row">' +
          '<div class="field"><label for="bkDate">Preferred date</label><input id="bkDate" type="date"></div>' +
          '<div class="field"><label for="bkGuests">Guests (approx.)</label><input id="bkGuests" type="number" min="1"></div>' +
        '</div>' +
        '<div class="form-row">' +
          '<div class="field"><label for="bkName">Your name</label><input id="bkName" type="text" required autocomplete="name"></div>' +
          '<div class="field"><label for="bkPhone">Phone</label><input id="bkPhone" type="tel" autocomplete="tel"></div>' +
        '</div>' +
        '<div class="field"><label for="bkEmail">Email</label><input id="bkEmail" type="email" autocomplete="email"></div>' +
        '<div class="field"><label for="bkBudget">Budget (optional)</label><input id="bkBudget" type="text" placeholder="e.g. 5,000"></div>' +
        '<div class="field"><label for="bkNotes">Anything else</label><textarea id="bkNotes" placeholder="Your vision, venue or questions"></textarea></div>' +
        '<button type="submit" class="btn btn-primary" style="width:100%;">Send on WhatsApp</button>' +
        '<div class="booking-msg" id="bkDone"></div>' +
      '</form>' +
    '</div>';
  document.body.appendChild(m);
  var lastFocus = null;
  function open(service){
    var sel = m.querySelector('#bkService');
    if (service){
      var key = service.toLowerCase().split(/[^a-z]+/)[0].slice(0,5);
      for (var i=0;i<sel.options.length;i++){
        var ok = sel.options[i].value.toLowerCase().split(/[^a-z]+/)[0].slice(0,5);
        if (ok && key && ok === key){ sel.selectedIndex=i; break; }
      }
    }
    lastFocus = document.activeElement;
    m.classList.add('open'); m.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(function(){ var n=m.querySelector('#bkName'); if(n) n.focus(); }, 60);
  }
  function close(){ m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; if(lastFocus&&lastFocus.focus) lastFocus.focus(); }
  m.querySelector('.booking-close').addEventListener('click', close);
  m.addEventListener('click', function(e){ if (e.target === m) close(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && m.classList.contains('open')) close(); });
  m.querySelector('.booking-form').addEventListener('submit', function(e){
    e.preventDefault();
    var nameEl = m.querySelector('#bkName');
    if (!nameEl.value.trim()){ nameEl.reportValidity(); return; }
    var v = function(id){ var el=m.querySelector(id); return el ? (el.value||'').trim() : ''; };
    var lines = [
      'Hello Events by Luwa, I would like to book a consultation.', '',
      'Name: ' + v('#bkName'),
      'Event: ' + v('#bkService'),
      v('#bkDate')   ? 'Preferred date: ' + v('#bkDate') : '',
      v('#bkGuests') ? 'Guests: ' + v('#bkGuests') : '',
      v('#bkPhone')  ? 'Phone: ' + v('#bkPhone') : '',
      v('#bkEmail')  ? 'Email: ' + v('#bkEmail') : '',
      v('#bkBudget') ? 'Budget: ' + v('#bkBudget') : '',
      v('#bkNotes')  ? 'Notes: ' + v('#bkNotes') : ''
    ].filter(function(l){ return l !== ''; });
    var link = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
    var w = window.open(link, '_blank', 'noopener');
    // Background: capture the booking to email, and auto-reply if an email was given
    try {
      var payload = { name: v('#bkName'), event: v('#bkService'), date: v('#bkDate'), guests: v('#bkGuests'), phone: v('#bkPhone'), email: v('#bkEmail'), budget: v('#bkBudget'), notes: v('#bkNotes'), _subject: 'New booking request from ' + (v('#bkName') || 'the website'), _template: 'table' };
      if (v('#bkEmail')) payload._autoresponse = 'Thank you for your booking request with Events by Luwa. We have received it and will reply personally, usually within a few hours. Warm regards, the Events by Luwa team.';
      fetch('https://formsubmit.co/ajax/' + EMAIL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) }).catch(function(){});
    } catch (err) {}
    var done = m.querySelector('#bkDone');
    done.innerHTML = w
      ? 'Wonderful. We have opened WhatsApp with your details. Just tap send and we will take it from there.'
      : 'Your request is ready. <a href="' + link + '" target="_blank" rel="noopener" style="color:#0A5C52;font-weight:700;">Tap to send on WhatsApp</a> or email <a href="mailto:' + EMAIL + '" style="color:#0A5C52;font-weight:700;">' + EMAIL + '</a>.';
    done.classList.add('show');
  });
  // Booking-intent CTAs open the modal (href stays as the no-JS fallback)
  document.querySelectorAll('a.btn').forEach(function(a){
    var t = a.textContent.trim().toLowerCase();
    if (t.indexOf('book') > -1 || t.indexOf('plan your event') > -1 || t.indexOf('consultation') > -1){
      a.addEventListener('click', function(e){ e.preventDefault(); open(); });
    }
  });
  // Whole service card opens booking pre-set to that service
  document.querySelectorAll('.svc-card').forEach(function(card){
    var link = card.querySelector('.svc-link'); if (!link) return;
    var svc = (card.querySelector('h3') || {}).textContent || '';
    link.addEventListener('click', function(e){ e.preventDefault(); open(svc.trim()); });
  });
  window.EBL_openBooking = open;
})();


// ---- PWA: installable + offline (network-first, never stale) ----
if ("serviceWorker" in navigator) { window.addEventListener("load", function(){ navigator.serviceWorker.register("/eventsbyluwa/sw.js").catch(function(){}); }); }

// No past dates on any date picker (enquiry + booking modal)
(function(){ try { var t = new Date().toISOString().split('T')[0]; document.querySelectorAll('input[type=date]').forEach(function(d){ d.min = t; }); } catch (e) {} })();

// ---- Data-driven gallery: render owner-uploaded photos from the manifest ----
// Keeps the designed placeholder tiles when the manifest is empty or unreachable.
(function(){
  var grids = document.querySelectorAll('[data-gallery]');
  if (!grids.length) return;
  fetch('assets/gallery/gallery.json', { cache: 'no-cache' })
    .then(function(r){ return r.ok ? r.json() : []; })
    .then(function(items){
      if (!items || !items.length) return; // graceful fallback: keep placeholders
      var cats = ['All'];
      items.forEach(function(it){ if (it.category && cats.indexOf(it.category) < 0) cats.push(it.category); });
      grids.forEach(function(grid){
        // No forced h1_-h4_ height class here - true masonry, each photo
        // keeps its own aspect ratio instead of being cropped into a box
        // sized by array index. width/height (from the manifest, when
        // present) reserve the correct box in the CSS-columns layout before
        // the lazy-loaded image itself arrives - without them the browser
        // has no idea how tall a given photo will be, so every card starts
        // near-collapsed and some never visibly recover once the image does
        // load, especially several columns deep on a slow connection.
        grid.innerHTML = items.map(function(it){
          var dims = (it.width && it.height)
            ? ' width="' + it.width + '" height="' + it.height + '" style="aspect-ratio:' + it.width + '/' + it.height + '"'
            : '';
          return '<figure class="gal-item">' +
            '<img loading="lazy" decoding="async"' + dims + ' src="' + it.src + '" alt="' + (it.alt || 'Events by Luwa event') + '">' +
            '<figcaption class="gtag">' + (it.category || 'Events') + '</figcaption></figure>';
        }).join('');
        // Force the CSS multi-column layout to fully re-fragment and repaint.
        // Replacing a large batch of items inside a `columns:` container can
        // leave items correctly laid out (clickable) but not actually
        // painted - invisible until something invalidates the column
        // fragmentation itself. A generic reflow (e.g. toggling display)
        // isn't always enough; toggling the column count is.
        grid.style.columns = '1';
        void grid.offsetHeight;
        requestAnimationFrame(function(){ grid.style.columns = ''; });
        if (window.EBL_bindLightbox) window.EBL_bindLightbox(grid);
        var section = grid.closest('section');
        var row = section ? section.querySelector('.filter-row') : null;
        if (row){
          row.innerHTML = cats.map(function(c,i){ return '<button class="filter-btn' + (i===0?' active':'') + '" aria-pressed="' + (i===0?'true':'false') + '">' + c + '</button>'; }).join('');
          row.querySelectorAll('.filter-btn').forEach(function(btn){
            btn.addEventListener('click', function(){
              row.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
              btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
              var cat = btn.textContent.trim();
              grid.querySelectorAll('.gal-item').forEach(function(it){
                var t = it.querySelector('.gtag'); var tag = t ? t.textContent.trim() : '';
                it.style.display = (cat === 'All' || tag === cat) ? '' : 'none';
              });
            });
          });
        }
      });
    })
    .catch(function(){});
})();

// ---- Sticky mobile booking bar (persistent CTA on phones) ----
(function(){
  if (document.querySelector('.book-bar')) return;
  var bar = document.createElement('div');
  bar.className = 'book-bar';
  bar.innerHTML =
    '<button type="button" class="btn btn-primary" id="bbBook">Start your booking</button>' +
    '<a class="bb-wa" href="https://wa.me/447823683189" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg></a>';
  document.body.appendChild(bar);
  bar.querySelector('#bbBook').addEventListener('click', function(){
    if (window.EBL_openBooking) window.EBL_openBooking();
    else window.location.href = 'contact.html';
  });
})();

// ---- Package matcher (retention): three taps recommend Silver/Gold/Diamond ----
(function(){
  var mx = document.getElementById('matcher'); if (!mx) return;
  var ans = {}, WA = '447823683189';
  function pick(){
    if (Object.keys(ans).length < 3) return;
    var rec = (ans.q3 === 'yes') ? 'Diamond' : (ans.q1 === 'yes' && ans.q2 !== 'no') ? 'Silver' : 'Gold';
    var card = null;
    document.querySelectorAll('.pkg-card').forEach(function(c){
      var n = c.querySelector('.pkg-name');
      var isRec = n && n.textContent.trim() === rec;
      c.classList.toggle('match', isRec);
      if (isRec) card = c;
    });
    var link = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hello Events by Luwa, the ' + rec + ' package looks like my fit. I would like to book a consultation.');
    var res = document.getElementById('matcherResult');
    res.hidden = false;
    res.innerHTML = 'Your best fit looks like the <strong>' + rec + '</strong> package.' +
      '<div style="margin-top:14px;"><a class="btn btn-primary" href="' + link + '" target="_blank" rel="noopener">This looks like my fit</a></div>';
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  mx.querySelectorAll('.matcher-row').forEach(function(row){
    var q = row.getAttribute('data-q');
    row.querySelectorAll('.matcher-opts button').forEach(function(b){
      b.addEventListener('click', function(){
        row.querySelectorAll('.matcher-opts button').forEach(function(x){ x.classList.remove('sel'); });
        b.classList.add('sel'); ans[q] = b.getAttribute('data-v'); pick();
      });
    });
  });
})();

// ---- Cookie consent + privacy-first analytics ----
// Dormant until a Measurement ID is set below. Set GA_ID to your GA4 id
// (looks like G-XXXXXXXXXX) to switch analytics on. No cookies until then.
(function(){
  var GA_ID = ''; // <-- paste your Google Analytics 4 Measurement ID here to enable analytics
  if (!GA_ID) return;
  function loadGA(){
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag; gtag('js', new Date()); gtag('config', GA_ID, { anonymize_ip: true });
  }
  var c = null; try { c = localStorage.getItem('ebl_consent'); } catch (e) {}
  if (c === 'granted'){ loadGA(); return; }
  if (c === 'denied'){ return; }
  var bar = document.createElement('div');
  bar.className = 'consent-bar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Cookie choice');
  bar.innerHTML = '<p>We use a little analytics to see which pages people love, so we can keep improving. Is that okay? See our <a href="privacy.html">Privacy Policy</a>.</p>' +
    '<div class="cc-btns"><button type="button" class="cc-decline">No thanks</button><button type="button" class="cc-accept">Yes, that is fine</button></div>';
  document.body.appendChild(bar);
  function done(v){ try { localStorage.setItem('ebl_consent', v); } catch (e) {} if (bar.parentNode) bar.parentNode.removeChild(bar); if (v === 'granted') loadGA(); }
  bar.querySelector('.cc-accept').addEventListener('click', function(){ done('granted'); });
  bar.querySelector('.cc-decline').addEventListener('click', function(){ done('denied'); });
})();
