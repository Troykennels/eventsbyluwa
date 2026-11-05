const {test} = require('node:test');
const assert = require('node:assert/strict');
const contact = require('../assets/contact.js');
const reply = (body, ok = true) => async () => ({ok, json:async () => body});
test('accepts provider boolean and string success formats', async () => {
  for (const success of [true, 'true']) await contact.send({name:'Test'}, {fetch:reply({success})});
});
test('rejects failures that previously appeared successful', async () => {
  for (const success of [false, 'false', undefined]) await assert.rejects(contact.send({}, {fetch:reply({success})}));
  await assert.rejects(contact.send({}, {fetch:reply({success:true}, false)}));
  await assert.rejects(contact.send({}, {fetch:async () => {throw new TypeError('Offline');}}));
  await assert.rejects(contact.send({}, {fetch:async () => ({ok:true,json:async () => {throw new SyntaxError('Not JSON');}})}));
});
test('activation instructions are not delivery confirmation', async () => {
  await assert.rejects(contact.send({}, {fetch:reply({success:true,message:'Please activate your form'})}));
});
test('stalled requests time out so forms can recover', async () => {
  const fetch = (_, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('Aborted')));
  });
  await assert.rejects(contact.send({}, {fetch,timeout:10}));
});
test('fallback links preserve punctuation and line breaks', () => {
  const text = 'Name: A & B\nBudget: £5,000?';
  assert.equal(new URL(contact.whatsapp(text)).searchParams.get('text'), text);
  assert.equal(new URL(contact.mailto('Enquiry & request', text)).searchParams.get('body'), text);
});
