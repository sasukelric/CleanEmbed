// Transforme le lien d'un post Twitter en lien FixupX, sans les paramètres de pistage (?s=20, ?t=…, ?a=…).
// Partagé par le script de contenu (globalThis.CleanEmbed) et par les tests Node (module.exports).
(function (root) {
  'use strict';

  const TWITTER_HOST = /^(?:(?:www|mobile)\.)?(?:x|twitter)\.com$/i;
  // /pseudo/status/123…, /i/status/123…, /i/web/status/123…, et ce qui suit (/photo/1, /video/1, /analytics) est ignoré
  const STATUS_PATH = /^\/(?:i\/web|([A-Za-z0-9_]{1,30}))\/status(?:es)?\/(\d{1,25})(?:\/|$)/;
  const FIXUPX = 'fixupx.com';

  // Options du menu, dans l'ordre d'affichage. Préfixes et suffixe documentés par FxEmbed :
  // https://docs.fxembed.com/guide/url-modifiers/
  const OPTIONS = [
    { key: 'fixupx', prefix: '', easterEgg: true },
    { key: 'direct', prefix: 'd.' }, // fichier média seul
    { key: 'gallery', prefix: 'g.' }, // média et auteur, sans le texte
    { key: 'textOnly', prefix: 't.' }, // texte seul, sans média
    { key: 'mosaic', prefix: 'm.' }, // toutes les images réunies en une
    { key: 'translate', prefix: '', translate: true }, // suffixe /{langue}, code ISO 639-1
    { key: 'instantView', prefix: 'i.' }, // vue instantanée de Telegram
    { key: 'oldEmbed', prefix: 'o.' }, // ancien style d'embed Discord
  ];

  // Easter egg : environ une copie sur 50 de « Copier le lien FixupX » donne le lien d'un autre service
  // équivalent. Le message de confirmation le signale. Seulement des services aux noms corrects.
  const EASTER_EGG_CHANCE = 1 / 50;
  const EASTER_EGG_HOSTS = ['fxtwitter.com', 'twittpr.com', 'vxtwitter.com', 'fixvx.com'];

  // Renvoie { user, id } pour un lien de post Twitter (absolu ou relatif à base), sinon null.
  function parseStatus(input, base) {
    let url;
    try {
      url = new URL(input, base || 'https://x.com/');
    } catch (_) {
      return null;
    }
    if (!/^https?:$/.test(url.protocol) || !TWITTER_HOST.test(url.hostname)) return null;
    const m = url.pathname.match(STATUS_PATH);
    return m ? { user: m[1] || 'i', id: m[2] } : null;
  }

  function buildLink(status, host, suffix = '') {
    return 'https://' + host + '/' + status.user + '/status/' + status.id + suffix;
  }

  function easterEggHost(random = Math.random) {
    return random() < EASTER_EGG_CHANCE ? EASTER_EGG_HOSTS[Math.floor(random() * EASTER_EGG_HOSTS.length)] : null;
  }

  // Lien à copier pour une option. lang : code à deux lettres pour la traduction (« fr », « ja »…).
  // rare : domaine tiré par l'easter egg, sinon null.
  function linkFor(status, option, lang = 'en', random = Math.random) {
    const rare = option.easterEgg ? easterEggHost(random) : null;
    const host = rare || option.prefix + FIXUPX;
    const suffix = option.translate ? '/' + (/^[a-z]{2}$/.test(lang) ? lang : 'en') : '';
    return { url: buildLink(status, host, suffix), rare };
  }

  const api = { OPTIONS, EASTER_EGG_CHANCE, EASTER_EGG_HOSTS, parseStatus, buildLink, easterEggHost, linkFor };
  root.CleanEmbed = Object.assign(root.CleanEmbed || {}, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
