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
function closeMenu(){ if (mobilePanel) mobilePanel.classList.remove('open'); if (menuToggle) menuToggle.setAttribute('aria-expanded','false'); }
if (menuToggle && mobilePanel){
  menuToggle.addEventListener('click', () => {
    const open = mobilePanel.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobilePanel) mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

// back to top
if (backTop) backTop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

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
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen){
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// gallery filter (visual only - categories are illustrative until real photos are added)
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.textContent.trim();
    document.querySelectorAll('.gal-item').forEach(item => {
      const tag = item.querySelector('.gtag').textContent.trim();
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

  setTimeout(() => {
    var note = wa
      ? 'We’ve opened WhatsApp with your details. Just tap <strong>send</strong> and we’ll take it from there. We reply personally, usually within a few hours.'
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
  document.querySelectorAll('.grid-3,.svc-grid,.pkg-grid,.blog-grid,.values-grid').forEach(function(group){
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

  // Loading screen - dismiss on load, with a hard safety cap
  var loader = document.getElementById('loader');
  function hideLoader(){ if (loader) loader.classList.add('done'); }
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);
  setTimeout(hideLoader, 1800);

  // Gallery lightbox - works the moment a tile holds a real <img>; dormant for gradient placeholders
  var lb = document.getElementById('lightbox');
  var lbImg = lb ? lb.querySelector('img') : null;
  var lbClose = document.getElementById('lbClose');
  if (lb && lbImg){
    document.querySelectorAll('.gal-item').forEach(function(item){
      var img = item.querySelector('img');
      if (!img) return; // placeholder tiles carry no photo yet - stay non-interactive
      item.style.cursor = 'zoom-in';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      var openLb = function(){
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || 'Events by Luwa event';
        lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
        lbClose && lbClose.focus();
      };
      item.addEventListener('click', openLb);
      item.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(); }
      });
    });
    var closeLb = function(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = ''; };
    if (lbClose) lbClose.addEventListener('click', closeLb);
    lb.addEventListener('click', function(e){ if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });
  }

  // Footer newsletter - UI-only, made honest: opens the visitor's email app
  // pre-addressed to Events by Luwa (no backend, nothing silently faked).
  var news = document.getElementById('newsletterForm');
  if (news){
    news.addEventListener('submit', function(e){
      e.preventDefault();
      if (!news.checkValidity()){ news.reportValidity(); return; }
      var email = (document.getElementById('newsEmail').value || '').trim();
      var subject = encodeURIComponent('Newsletter signup');
      var body = encodeURIComponent('Please add this email to the Events by Luwa newsletter: ' + email);
      window.location.href = 'mailto:eventsbyluwa22@gmail.com?subject=' + subject + '&body=' + body;
      var done = document.getElementById('newsDone');
      if (done) done.classList.add('show');
      news.reset();
    });
  }
})();
