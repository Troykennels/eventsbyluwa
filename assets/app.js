// Keep keyboard navigation inside whichever overlay is open.
function trapFocus(container, event){
  if (event.key !== 'Tab') return;
  var items = Array.from(container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]')).filter(function(el){ return el.getClientRects().length; });
  if (!items.length) return;
  var first = items[0], last = items[items.length-1];
  if (event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
}

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
  document.addEventListener('keydown', (e) => { if (mobilePanel.classList.contains('open')){ if (e.key === 'Escape') closeMenu(); else trapFocus(mobilePanel, e); } });
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

// Team photos rotate every three seconds and stop while the mouse is over them.
(function(){
  document.querySelectorAll('.team-carousel').forEach(function(carousel){
    var slides = Array.from(carousel.querySelectorAll('.team-slide'));
    var dots = Array.from(carousel.querySelectorAll('.team-dot'));
    if (slides.length < 2) return;
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var index = 0, visible = false, hovering = false, timer;
    function prime(i){ slides[i].querySelector('img').loading = 'eager'; }
    function schedule(){
      clearInterval(timer);
      var keyboardFocus = carousel.querySelector('button:focus-visible');
      if (!motion.matches && visible && !hovering && !keyboardFocus && !document.hidden){
        timer = setInterval(function(){ show(index + 1, false); }, 3000);
      }
    }
    function show(next, manual){
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i){ slide.hidden = i !== index; });
      dots.forEach(function(dot, i){ dot.setAttribute('aria-pressed', String(i === index)); });
      prime(index); prime((index + 1) % slides.length);
      if (manual){
        carousel.querySelector('.team-announcement').textContent = 'Photo ' + (index + 1) + ' of ' + slides.length + ': ' + slides[index].querySelector('h3').textContent;
        schedule();
      }
    }
    carousel.querySelector('[data-team-prev]').addEventListener('click', function(){ show(index - 1, true); });
    carousel.querySelector('[data-team-next]').addEventListener('click', function(){ show(index + 1, true); });
    dots.forEach(function(dot, i){ dot.addEventListener('click', function(){ show(i, true); }); });
    carousel.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse'){ hovering = true; schedule(); } });
    carousel.addEventListener('pointerleave', function(e){ if (e.pointerType === 'mouse'){ hovering = false; schedule(); } });
    carousel.addEventListener('focusin', schedule);
    carousel.addEventListener('focusout', function(){ setTimeout(schedule, 0); });
    carousel.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
        e.preventDefault(); show(index + (e.key === 'ArrowRight' ? 1 : -1), true);
      }
    });
    document.addEventListener('visibilitychange', schedule);
    motion.addEventListener('change', schedule);
    new IntersectionObserver(function(entries){ visible = entries[0].isIntersecting; schedule(); }, {threshold:0.1}).observe(carousel);
    carousel.classList.add('ready');
    show(0, false); schedule();
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

// Enquiries keep the visitor's details until the email service accepts them.
const form = document.getElementById('enquiryForm');
if (form) form.addEventListener('submit', async function(e){
  e.preventDefault();
  if (form.dataset.sending || !form.checkValidity()){ form.reportValidity(); return; }
  const val = id => (form.querySelector('#' + id)?.value || '').trim();
  const name = [val('fname'), val('lname')].filter(Boolean).join(' ');
  if (!name){ form.querySelector('#fname').focus(); return; }
  if (form.querySelector('[name="_honey"]')?.value) return;
  const text = ['Hello Events by Luwa, I would like to plan an event.',
    'Name: ' + name, 'Email: ' + val('email'), 'Phone: ' + val('phone'),
    'Event: ' + val('eventType'), 'Preferred date: ' + val('eventDate'),
    'Guests: ' + val('guests'), 'Budget: ' + val('budget'), 'Details: ' + val('message')].join('\n');
  const links = [{label:'Send on WhatsApp', href:EBLContact.whatsapp(text)},
    {label:'Send by email', href:EBLContact.mailto('Event enquiry', text)}];
  const payload = {name:name, email:val('email'), phone:val('phone'), event:val('eventType'),
    date:val('eventDate'), guests:val('guests'), budget:val('budget'), details:val('message'),
    consent:'Visitor agreed to be contacted about this enquiry', _subject:'New event enquiry',
    _template:'table', _url:location.origin + location.pathname};
  const btn = form.querySelector('button[type="submit"]');
  const message = document.getElementById('formMsg');
  form.dataset.sending = 'true'; btn.disabled = true; btn.textContent = 'Sending enquiry';
  try {
    await EBLContact.send(payload);
    EBLContact.render(message, 'Thank you. Your enquiry has been submitted. You can also contact us directly on WhatsApp.', [links[0]], false);
    form.reset();
  } catch (err){
    EBLContact.render(message, 'We could not confirm your enquiry was submitted. Your details are still here. Please retry, or send them directly using one of the options below.', links, true);
  } finally {
    delete form.dataset.sending; btn.disabled = false; btn.textContent = 'Send Enquiry';
  }
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
    var visibleIdx = 0, lightboxFocus = null, previousOverflow = '';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Event photo viewer');

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
      lbImg.removeAttribute('src'); visibleSet = []; document.body.style.overflow = previousOverflow;
      if (lightboxFocus) lightboxFocus.focus();
    };
    if (lbClose) lbClose.addEventListener('click', closeLb);
    if (lbPrev) lbPrev.addEventListener('click', goPrev);
    if (lbNext) lbNext.addEventListener('click', goNext);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('open')) return;
      trapFocus(lb, e);
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
          lightboxFocus = document.activeElement; previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
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
          '<div class="field"><label for="bkPhone">Phone</label><input id="bkPhone" type="tel" required autocomplete="tel"></div>' +
        '</div>' +
        '<div class="field"><label for="bkEmail">Email</label><input id="bkEmail" type="email" autocomplete="email"></div>' +
        '<div class="field"><label for="bkBudget">Budget (optional)</label><input id="bkBudget" type="text" placeholder="e.g. 5,000"></div>' +
        '<div class="field"><label for="bkNotes">Anything else</label><textarea id="bkNotes" placeholder="Your vision, venue or questions"></textarea></div>' +
        '<label class="consent"><input type="checkbox" required> I agree to be contacted about this request.</label>' +
        '<div class="form-trap" aria-hidden="true"><label>Leave empty<input name="_honey" tabindex="-1" autocomplete="off"></label></div>' +
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
  document.addEventListener('keydown', function(e){ if (m.classList.contains('open')){ if (e.key === 'Escape') close(); else trapFocus(m, e); } });
  m.querySelector('.booking-form').addEventListener('submit', async function(e){
    e.preventDefault();
    var booking = e.currentTarget;
    if (booking.dataset.sending || !booking.checkValidity()){ booking.reportValidity(); return; }
    var v = function(id){ return (m.querySelector(id).value || '').trim(); };
    if (!v('#bkName')){ m.querySelector('#bkName').focus(); return; }
    if (booking.querySelector('[name="_honey"]').value) return;
    var lines = ['Hello Events by Luwa, I would like to book a consultation.',
      'Name: ' + v('#bkName'), 'Event: ' + v('#bkService'), 'Preferred date: ' + v('#bkDate'),
      'Guests: ' + v('#bkGuests'), 'Phone: ' + v('#bkPhone'), 'Email: ' + v('#bkEmail'),
      'Budget: ' + v('#bkBudget'), 'Notes: ' + v('#bkNotes')].join('\n');
    var link = EBLContact.whatsapp(lines);
    // The visitor must press Send in WhatsApp; opening a chat is not delivery.
    window.open(link, '_blank', 'noopener');
    var done = m.querySelector('#bkDone');
    var links = [{label:'Open WhatsApp', href:link}, {label:'Send by email', href:EBLContact.mailto('Booking request', lines)}];
    EBLContact.render(done, 'Your details are ready in WhatsApp. Press Send there to contact us. You can reopen the chat below.', links, false);
    var button = booking.querySelector('button[type="submit"]');
    booking.dataset.sending = 'true'; button.disabled = true;
    try {
      await EBLContact.send({name:v('#bkName'), event:v('#bkService'), date:v('#bkDate'), guests:v('#bkGuests'),
        phone:v('#bkPhone'), email:v('#bkEmail'), budget:v('#bkBudget'), notes:v('#bkNotes'),
        consent:'Visitor agreed to be contacted about this booking request',
        _subject:'New booking request', _template:'table', _url:location.origin + location.pathname});
      EBLContact.render(done, 'A copy of your request has been submitted by email. Remember to press Send in WhatsApp if you want to chat there.', links, false);
    } catch (err){
      EBLContact.render(done, 'We could not confirm the email copy. Please press Send in WhatsApp, or use the email link below. Your details are still here.', links, true);
    } finally { delete booking.dataset.sending; button.disabled = false; }
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
if ("serviceWorker" in navigator) { window.addEventListener("load", function(){ navigator.serviceWorker.register("sw.js").catch(function(){}); }); }

// No past dates on any date picker (enquiry + booking modal)
(function(){ try { var t = [new Date().getFullYear(), String(new Date().getMonth()+1).padStart(2,'0'), String(new Date().getDate()).padStart(2,'0')].join('-'); document.querySelectorAll('input[type=date]').forEach(function(d){ d.min = t; }); } catch (e) {} })();

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
        var fragment = document.createDocumentFragment();
        items.forEach(function(it){
          var source;
          try { source = new URL(it.src, document.baseURI); } catch (err){ return; }
          if (source.origin !== location.origin || source.pathname.indexOf('/assets/gallery/') < 0) return;
          var figure = document.createElement('figure'); figure.className = 'gal-item';
          var img = document.createElement('img'); img.loading = 'lazy'; img.decoding = 'async';
          img.src = source.href; img.alt = it.alt || 'Events by Luwa event';
          if (Number(it.width) > 0 && Number(it.height) > 0){ img.width = Number(it.width); img.height = Number(it.height); }
          var caption = document.createElement('figcaption'); caption.className = 'gtag'; caption.textContent = it.category || 'Events';
          figure.append(img, caption); fragment.appendChild(figure);
        });
        if (fragment.childNodes.length) grid.replaceChildren(fragment);
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
          var filters = document.createDocumentFragment();
          cats.forEach(function(category, i){
            var button = document.createElement('button'); button.type = 'button'; button.className = 'filter-btn' + (i === 0 ? ' active' : '');
            button.setAttribute('aria-pressed', String(i === 0)); button.textContent = category; filters.appendChild(button);
          });
          row.replaceChildren(filters);
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
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z"/><path d="m8.5 7 1.5 3-1.1 1.1a9 9 0 0 0 4 4L14 14l3 1.5c-.3 1.4-1.4 2-2.7 1.7-4.2-.9-7.6-4.3-8.5-8.5C5.5 7.4 6.1 6.3 7.5 6Z"/></svg></a>';
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
