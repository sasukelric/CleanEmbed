// Transforme le lien d'un post Twitter en lien FixupX, sans les paramètres de pistage (?s=20, ?t=…, ?a=…).
// Partagé par le script de contenu (globalThis.CleanEmbed) et par les tests Node (module.exports).
(function (root) {
  'use strict';

  const TWITTER_HOST = /^(?:(?:www|mobile)\.)?(?:x|twitter)\.com$/i;
  // /pseudo/status/123…, /i/status/123…, /i/web/status/123…, et ce qui suit (/photo/1, /video/1, /analytics) est ignoré
  const STATUS_PATH = /^\/(?:i\/web|([A-Za-z0-9_]{1,30}))\/status(?:es)?\/(\d{1,25})(?:\/|$)/;

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

  function buildLink(status, host) {
    return 'https://' + host + '/' + status.user + '/status/' + status.id;
  }

  const api = { parseStatus, buildLink };
  root.CleanEmbed = Object.assign(root.CleanEmbed || {}, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
