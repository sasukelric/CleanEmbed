const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { STRINGS, pickLang, translator } = require('../src/i18n.js');

test('chaque langue a exactement les mêmes textes que l’anglais, non vides', () => {
  const cles = Object.keys(STRINGS.en).sort();
  for (const [langue, textes] of Object.entries(STRINGS)) {
    assert.deepEqual(Object.keys(textes).sort(), cles, langue);
    for (const [cle, texte] of Object.entries(textes)) assert.ok(texte.trim(), `${langue}.${cle} vide`);
  }
});

test('choix de la langue', () => {
  assert.equal(pickLang('fr'), 'fr');
  assert.equal(pickLang('pt-BR'), 'pt');
  assert.equal(pickLang('en-GB'), 'en');
  assert.equal(pickLang('ar-x-fm'), 'ar');
  assert.equal(pickLang('zh'), 'zh-CN');
  assert.equal(pickLang('zh-Hant'), 'zh-TW');
  assert.equal(pickLang('zh_TW'), 'zh-TW');
  assert.equal(pickLang('', undefined, 'de-AT'), 'de', 'page sans lang : langue du navigateur');
  assert.equal(pickLang('xx', 'yy'), 'en');
  assert.equal(translator('fr')('fixupx'), 'Copier le lien FixupX');
  assert.equal(translator('xx')('noLink'), STRINGS.en.noLink);
});

test('chaque langue du script a son dossier _locales, et inversement', () => {
  const dossiers = fs.readdirSync(path.join(__dirname, '..', '_locales')).sort();
  const versLocale = { pt: 'pt_BR', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW' };
  const attendus = Object.keys(STRINGS).map((l) => versLocale[l] || l).sort();
  assert.deepEqual(dossiers, attendus);
});

test('chaque option du menu a son libellé et son infobulle', () => {
  const { OPTIONS } = require('../src/links.js');
  for (const option of OPTIONS) {
    assert.ok(STRINGS.en[option.key], option.key);
    assert.ok(STRINGS.en[option.key + 'Hint'], option.key + 'Hint');
  }
});

test("le message de l'easter egg garde la place du domaine dans chaque langue", () => {
  for (const [langue, textes] of Object.entries(STRINGS)) assert.ok(textes.copiedRare.includes('{host}'), langue);
});
