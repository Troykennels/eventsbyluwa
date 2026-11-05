/* Shared delivery settings. Public recipient details, never API credentials. */
(function(root){
  'use strict';
  var email = 'eventsbyluwa22@gmail.com';
  var phone = '447823683189';
  async function send(payload, options){
    options = options || {};
    var controller = new AbortController();
    var timer = setTimeout(function(){ controller.abort(); }, options.timeout || 12000);
    try {
      var response = await (options.fetch || root.fetch)('https://formsubmit.co/ajax/' + email, {
        method:'POST', headers:{'Content-Type':'application/json', 'Accept':'application/json'},
        body:JSON.stringify(payload), signal:controller.signal
      });
      if (!response.ok) throw new Error('The email service could not accept this request.');
      var result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error('The email service did not confirm this request.');
      // A queued request or activation instruction is not a confirmed submission.
      if (/activat|confirm your email|verify your email/i.test(String(result.message || ''))) {
        throw new Error('The receiving email address needs activation.');
      }
      return result;
    } finally { clearTimeout(timer); }
  }
  function whatsapp(text){ return 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text); }
  function mailto(subject, text){ return 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text); }
  function render(node, text, links, failed){
    node.replaceChildren();
    var message = root.document.createElement('p'); message.textContent = text; node.appendChild(message);
    if (links && links.length){
      var actions = root.document.createElement('div'); actions.className = 'contact-actions';
      links.forEach(function(item){
        var a = root.document.createElement('a'); a.href = item.href; a.textContent = item.label;
        a.className = 'btn btn-outline';
        if (item.href.indexOf('https://') === 0){ a.target = '_blank'; a.rel = 'noopener'; }
        actions.appendChild(a);
      });
      node.appendChild(actions);
    }
    node.classList.add('show'); node.classList.toggle('failed', !!failed);
    node.setAttribute('role', failed ? 'alert' : 'status');
  }
  var api = {email:email, phone:phone, send:send, whatsapp:whatsapp, mailto:mailto, render:render};
  root.EBLContact = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
