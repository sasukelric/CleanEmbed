const test = require('node:test');
const assert = require('node:assert/strict');
const { parseStatus, buildLink } = require('../src/links.js');

const fixupx = (input, base) => {
  const status = parseStatus(input, base);
  return status && buildLink(status, 'fixupx.com');
};

test("l'exemple du cahier des charges", () => {
  const lien = 'https://x.com/zerowontmiss/status/2119575171459961102?a=CZyMoQ0ZumdziYt2bLY&s=20';
  const status = parseStatus(lien);
  assert.equal(buildLink(status, 'fixupx.com'), 'https://fixupx.com/zerowontmiss/status/2119575171459961102');
  assert.equal(buildLink(status, 'd.fixupx.com'), 'https://d.fixupx.com/zerowontmiss/status/2119575171459961102');
});

test('paramètres de pistage, ancre et suffixes retirés', () => {
  const attendu = 'https://fixupx.com/jack/status/20';
  for (const lien of [
    'https://x.com/jack/status/20?s=20&t=abcDEF',
    'https://x.com/jack/status/20#m',
    'https://x.com/jack/status/20/photo/1',
    'https://x.com/jack/status/20/video/1',
    'https://x.com/jack/status/20/analytics',
    'https://twitter.com/jack/status/20',
    'https://mobile.twitter.com/jack/status/20',
    'https://www.x.com/jack/statuses/20',
    'http://x.com/jack/status/20',
  ]) {
    assert.equal(fixupx(lien), attendu, lien);
  }
});

test('lien relatif, comme dans le href des posts', () => {
  assert.equal(fixupx('/Some_User/status/123', 'https://x.com/home'), 'https://fixupx.com/Some_User/status/123');
});

test('liens sans pseudo', () => {
  assert.equal(fixupx('https://x.com/i/web/status/123'), 'https://fixupx.com/i/status/123');
  assert.equal(fixupx('https://x.com/i/status/123'), 'https://fixupx.com/i/status/123');
});

test("refuse ce qui n'est pas un post Twitter", () => {
  for (const lien of [
    'https://x.com/jack',
    'https://x.com/home',
    'https://x.com/compose/post?in_reply_to=123',
    'https://x.com/jack/status/',
    'https://evil-x.com/jack/status/20',
    'https://x.com.evil.example/jack/status/20',
    'https://fixupx.com/jack/status/20',
    'javascript:alert(1)',
    'pas un lien',
  ]) {
    assert.equal(parseStatus(lien, 'https://example.org/'), null, lien);
  }
});
