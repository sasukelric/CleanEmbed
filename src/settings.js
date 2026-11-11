// Réglages : les options du menu que l'utilisateur a décochées. « Copier le lien FixupX » reste toujours affiché.
// On enregistre les options désactivées plutôt que les activées : une option ajoutée par une version future
// apparaît donc d'office. Stockage « sync » : les réglages suivent le compte Firefox ou Chrome.
//
// Les appels écrivent chrome.storage en toutes lettres (Firefox connaît aussi cet espace de noms) : l'examen
// automatique du Chrome Web Store cherche ce nom dans le code et, sans lui, refuse l'extension pour
// « autorisation storage demandée mais pas utilisée ». Rappels plutôt que promesses : même comportement partout.
(function (root) {
  'use strict';

  const STORAGE_KEY = 'disabledOptions';
  const ALWAYS_ON = 'fixupx';

  // Options à afficher, dans l'ordre du menu
  function enabledOptions(options, disabled) {
    const off = new Set(Array.isArray(disabled) ? disabled : []);
    return options.filter((option) => option.key === ALWAYS_ON || !off.has(option.key));
  }

  // faux hors de l'extension (page web, tests Node)
  const hasStorage = () => typeof chrome !== 'undefined' && Boolean(chrome.storage);
  const lastError = () => (chrome.runtime && chrome.runtime.lastError) || null;

  function loadDisabled() {
    if (!hasStorage()) return Promise.resolve([]);
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (stored) => {
        const list = !lastError() && stored && stored[STORAGE_KEY];
        resolve(Array.isArray(list) ? list : []);
      });
    });
  }

  function saveDisabled(disabled) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: disabled.filter((key) => key !== ALWAYS_ON) }, () => {
        const error = lastError();
        if (error) reject(new Error(error.message));
        else resolve();
      });
    });
  }

  function onDisabledChange(callback) {
    if (!hasStorage()) return;
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes[STORAGE_KEY]) callback(changes[STORAGE_KEY].newValue || []);
    });
  }

  const api = { ALWAYS_ON, enabledOptions, loadDisabled, saveDisabled, onDisabledChange };
  root.CleanEmbed = Object.assign(root.CleanEmbed || {}, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
