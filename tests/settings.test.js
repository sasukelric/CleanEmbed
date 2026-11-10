const test = require('node:test');
const assert = require('node:assert/strict');
const { OPTIONS } = require('../src/links.js');
const { ALWAYS_ON, enabledOptions, loadDisabled } = require('../src/settings.js');

const cles = (options) => options.map((o) => o.key);

test('par défaut, toutes les options sont affichées, dans l’ordre du menu', () => {
  assert.deepEqual(cles(enabledOptions(OPTIONS, [])), cles(OPTIONS));
  assert.deepEqual(cles(enabledOptions(OPTIONS, undefined)), cles(OPTIONS));
});

test('les options décochées disparaissent, l’ordre reste le même', () => {
  assert.deepEqual(cles(enabledOptions(OPTIONS, ['gallery', 'mosaic', 'oldEmbed'])),
    ['fixupx', 'direct', 'textOnly', 'translate', 'instantView']);
});

test('« Copier le lien FixupX » reste toujours affiché, même décoché', () => {
  assert.equal(ALWAYS_ON, 'fixupx');
  assert.deepEqual(cles(enabledOptions(OPTIONS, cles(OPTIONS))), ['fixupx']);
});

test('une valeur enregistrée inconnue ou abîmée ne casse rien', () => {
  assert.deepEqual(cles(enabledOptions(OPTIONS, ['optionDisparue'])), cles(OPTIONS));
  assert.deepEqual(cles(enabledOptions(OPTIONS, 'pas une liste')), cles(OPTIONS));
});

test('hors de l’extension (pas de stockage), aucun réglage', async () => {
  assert.deepEqual(await loadDisabled(), []);
});
