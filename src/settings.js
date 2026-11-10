// Réglages : les options du menu que l'utilisateur a décochées. « Copier le lien FixupX » reste toujours affiché.
// On enregistre les options désactivées plutôt que les activées : une option ajoutée par une version future
// apparaît donc d'office. Stockage « sync » : les réglages suivent le compte Firefox ou Chrome.
(function (root) {
  'use strict';

  const STORAGE_KEY = 'disabledOptions';
  const ALWAYS_ON = 'fixupx';

  // Options à afficher, dans l'ordre du menu
  function enabledOptions(options, disabled) {
    const off = new Set(Array.isArray(disabled) ? disabled : []);
    return options.filter((option) => option.key === ALWAYS_ON || !off.has(option.key));
  }

  // undefined hors de l'extension (page web, tests Node)
  function storageApi() {
    const ext = root.browser || root.chrome;
    return ext && ext.storage;
  }

  async function loadDisabled() {
    const storage = storageApi();
    if (!storage) return [];
    const stored = await storage.sync.get({ [STORAGE_KEY]: [] });
    return Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  }

  function saveDisabled(disabled) {
    return storageApi().sync.set({ [STORAGE_KEY]: disabled.filter((key) => key !== ALWAYS_ON) });
  }

  function onDisabledChange(callback) {
    const storage = storageApi();
    if (!storage) return;
    storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes[STORAGE_KEY]) callback(changes[STORAGE_KEY].newValue || []);
    });
  }

  const api = { ALWAYS_ON, enabledOptions, loadDisabled, saveDisabled, onDisabledChange };
  root.CleanEmbed = Object.assign(root.CleanEmbed || {}, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
