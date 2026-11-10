const test = require('node:test');
const assert = require('node:assert/strict');
const { OPTIONS, EASTER_EGG_CHANCE, EASTER_EGG_HOSTS, parseStatus, buildLink, linkFor } = require('../src/links.js');

const jamaisRare = () => 0.99; // tirage qui ne déclenche jamais l'easter egg

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

test('un lien par option du menu, pour le post de l’exemple', () => {
  const status = parseStatus('https://x.com/zerowontmiss/status/2119575171459961102?a=CZyMoQ0ZumdziYt2bLY&s=20');
  const chemin = '/zerowontmiss/status/2119575171459961102';
  const liens = Object.fromEntries(OPTIONS.map((o) => [o.key, linkFor(status, o, 'fr', jamaisRare).url]));
  assert.deepEqual(liens, {
    fixupx: 'https://fixupx.com' + chemin,
    direct: 'https://d.fixupx.com' + chemin,
    gallery: 'https://g.fixupx.com' + chemin,
    textOnly: 'https://t.fixupx.com' + chemin,
    mosaic: 'https://m.fixupx.com' + chemin,
    translate: 'https://fixupx.com' + chemin + '/fr',
    instantView: 'https://i.fixupx.com' + chemin,
    oldEmbed: 'https://o.fixupx.com' + chemin,
  });
});

test('traduction : code à deux lettres, sinon anglais', () => {
  const traduit = OPTIONS.find((o) => o.translate);
  const status = { user: 'jack', id: '20' };
  assert.equal(linkFor(status, traduit, 'zh', jamaisRare).url, 'https://fixupx.com/jack/status/20/zh');
  assert.equal(linkFor(status, traduit, 'fil', jamaisRare).url, 'https://fixupx.com/jack/status/20/en');
  assert.equal(linkFor(status, traduit, '', jamaisRare).url, 'https://fixupx.com/jack/status/20/en');
});

test('easter egg : seulement sur « Copier le lien FixupX »', () => {
  const status = { user: 'jack', id: '20' };
  for (const option of OPTIONS) {
    const { url, rare } = linkFor(status, option, 'fr', () => 0); // tirage qui le déclenche toujours
    if (option.key === 'fixupx') {
      assert.equal(rare, EASTER_EGG_HOSTS[0]);
      assert.equal(url, 'https://' + EASTER_EGG_HOSTS[0] + '/jack/status/20');
    } else {
      assert.equal(rare, null, option.key);
    }
  }
});

test('easter egg : chaque service peut sortir, et rarement', () => {
  const status = { user: 'jack', id: '20' };
  const sortis = EASTER_EGG_HOSTS.map((_, i) => {
    const tirages = [0, (i + 0.5) / EASTER_EGG_HOSTS.length];
    return linkFor(status, OPTIONS[0], 'fr', () => tirages.shift()).rare;
  });
  assert.deepEqual(sortis, EASTER_EGG_HOSTS);
  let rares = 0;
  for (let i = 0; i < 100000; i++) if (linkFor(status, OPTIONS[0]).rare) rares++;
  assert.ok(Math.abs(rares / 100000 - EASTER_EGG_CHANCE) < 0.005, `${rares} sur 100000`);
});

test('easter egg : uniquement les services validés (aucun nom vulgaire ou haineux)', () => {
  assert.deepEqual(EASTER_EGG_HOSTS, ['fxtwitter.com', 'twittpr.com', 'vxtwitter.com', 'fixvx.com']);
});
