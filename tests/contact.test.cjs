const {test} = require('node:test');
const assert = require('node:assert/strict');
const contact = require('../assets/contact.js');
test('enquiry links use the client business destinations', () => {
  assert.equal(new URL(contact.whatsapp('Test')).pathname, '/447823683189');
  assert.equal(new URL(contact.mailto('Enquiry', 'Test')).pathname, 'eventsbyluwa22@gmail.com');
  assert.equal(contact.send, undefined);
});
test('WhatsApp preserves punctuation, Unicode, and line breaks in form details', () => {
  const text = 'Name: A & B\nBudget: ?5,000?\nNotes: +234 #family';
  assert.equal(new URL(contact.whatsapp(text)).searchParams.get('text'), text);
});
test('email draft preserves subject and full enquiry details', () => {
  const text = 'Test enquiry\nEmail: visitor@example.com\nDetails: A & B + C';
  const link = new URL(contact.mailto('Wedding & consultation', text));
  assert.equal(link.searchParams.get('subject'), 'Wedding & consultation');
  assert.equal(link.searchParams.get('body'), text);
});
