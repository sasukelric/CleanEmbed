const test = require('node:test');
const assert = require('node:assert/strict');
const { OPTIONS } = require('../src/links.js');
const fs = require('node:fs');
const path = require('node:path');
const { ALWAYS_ON, enabledOptions, loadDisabled, saveDisabled, onDisabledChange } = require('../src/settings.js');

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

test('chrome.storage est appelé en toutes lettres (exigé par l’examen du Chrome Web Store)', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'settings.js'), 'utf8');
  for (const appel of ['chrome.storage.sync.get(', 'chrome.storage.sync.set(', 'chrome.storage.onChanged.addListener(']) {
    assert.ok(source.includes(appel), appel);
  }
});

test('lecture, enregistrement et changements avec un stockage chrome.* à rappels', async () => {
  const magasin = { disabledOptions: ['mosaic'] };
  const ecouteurs = [];
  globalThis.chrome = {
    runtime: {},
    storage: {
      sync: {
        get: (defaults, rappel) => rappel({ ...defaults, ...magasin }),
        set: (valeurs, rappel) => { Object.assign(magasin, valeurs); rappel(); },
      },
      onChanged: { addListener: (fn) => ecouteurs.push(fn) },
    },
  };
  try {
    assert.deepEqual(await loadDisabled(), ['mosaic']);
    await saveDisabled(['gallery', 'fixupx', 'mosaic']);
    assert.deepEqual(magasin.disabledOptions, ['gallery', 'mosaic'], 'fixupx n’est jamais enregistré');
    const recus = [];
    onDisabledChange((liste) => recus.push(liste));
    ecouteurs[0]({ disabledOptions: { newValue: ['direct'] } }, 'sync');
    ecouteurs[0]({ disabledOptions: { newValue: ['oldEmbed'] } }, 'local');
    ecouteurs[0]({ autreCle: { newValue: 1 } }, 'sync');
    assert.deepEqual(recus, [['direct']], 'seuls les changements de nos réglages en sync comptent');
    magasin.disabledOptions = 'abîmé';
    assert.deepEqual(await loadDisabled(), []);
    globalThis.chrome.runtime.lastError = { message: 'quota' };
    await assert.rejects(saveDisabled(['direct']), /quota/);
  } finally {
    delete globalThis.chrome;
  }
});
