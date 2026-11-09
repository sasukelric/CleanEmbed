// Ajoute « Copier le lien FixupX » et « Copier le lien direct (d.FixupX) » au menu Partager des posts Twitter.
// Repères vérifiés sur x.com le 2026-11-09 (nouvelle interface, menus Base UI), tous indépendants de la langue :
// - le bouton Partager porte data-engagement-action="share" ;
// - le menu ([role="menu"]) est relié à son bouton par aria-labelledby ;
// - l'option « Copier le lien » contient svg[data-icon="icon-link"] : nos options se placent juste après ;
// - un post cité est un <article> imbriqué ; le lien du post lui-même est celui de l'heure (il ouvre une infobulle).
(() => {
  'use strict';
  if (globalThis.__cleanEmbedLoaded) return;
  globalThis.__cleanEmbedLoaded = true;

  const { parseStatus, buildLink, translator } = globalThis.CleanEmbed;
  const MARK = 'data-cleanembed';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ACTIONS = [
    { key: 'fixupx', host: 'fixupx.com', icon: 'link' },
    { key: 'direct', host: 'd.fixupx.com', icon: 'media' },
  ];
  // Icônes 24×24 en traits, d'après Lucide (licence ISC)
  const ICONS = {
    link: [
      ['path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
      ['path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }],
    ],
    media: [
      ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
      ['path', { d: 'm9 8 6 4-6 4Z' }],
    ],
  };

  const t = (key) => translator(document.documentElement.lang, navigator.language)(key);
  let lastShare = null; // dernier bouton Partager pressé, pour un menu qui ne dirait pas à quel bouton il appartient

  function isShareTrigger(el) {
    if (el.matches('[data-engagement-action="share"]')) return true;
    // Ancienne interface (sans data-engagement-action) : dernier bouton à menu de la barre d'actions, hors repost
    if (el.getAttribute('aria-haspopup') !== 'menu' || /retweet/i.test(el.dataset.testid || '')) return false;
    const bar = el.closest('article [role="group"]');
    if (!bar || bar.querySelector('[data-engagement-action]')) return false;
    const withMenu = bar.querySelectorAll('[aria-haspopup="menu"]');
    return withMenu[withMenu.length - 1] === el;
  }

  function triggerOf(menu) {
    const id = menu.getAttribute('aria-labelledby');
    const byId = id && document.getElementById(id);
    if (byId) return byId;
    if (lastShare && lastShare.el.isConnected && Date.now() - lastShare.time < 2000) return lastShare.el;
    return null;
  }

  // Post auquel appartient le bouton : on écarte les liens du post cité (article imbriqué) et on préfère
  // le lien de l'heure (infobulle, ou <time> dans l'ancienne interface) à une mention de source de vidéo.
  function statusOf(trigger) {
    const article = trigger.closest('article');
    if (article) {
      const own = [...article.querySelectorAll('a[href*="/status/"]')].filter((a) => a.closest('article') === article);
      const isTime = (a) => a.hasAttribute('data-base-ui-tooltip-trigger') || a.querySelector('time');
      for (const a of [...own.filter(isTime), ...own]) {
        const status = parseStatus(a.href);
        if (status) return status;
      }
    }
    return parseStatus(location.href); // visionneuse photo/vidéo, page du post
  }

  function copy(text) {
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.append(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (_) {
        // refusé par le navigateur
      }
      area.remove();
      return ok;
    };
    if (!navigator.clipboard || !navigator.clipboard.writeText) return Promise.resolve(fallback());
    return navigator.clipboard.writeText(text).then(() => true, fallback);
  }

  // Base UI ferme ses menus sur Échap (écouteur posé sur document) ; nos options n'ont pas ses gestionnaires de clic.
  function closeMenu() {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true, cancelable: true })
    );
  }

  let toastTimer = 0;
  function toast(text, isError) {
    let el = document.getElementById('cleanembed-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cleanembed-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.append(el);
    }
    el.textContent = text;
    el.classList.toggle('cleanembed-error', Boolean(isError));
    el.classList.add('cleanembed-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('cleanembed-visible'), 2500);
  }

  function run(action, trigger) {
    const status = statusOf(trigger);
    if (!status) {
      closeMenu();
      toast(t('noLink'), true);
      return;
    }
    const copying = copy(buildLink(status, action.host)); // lancé pendant le clic, tant que le navigateur l'autorise
    closeMenu();
    copying.then((ok) => toast(ok ? t('copied') : t('copyFailed'), !ok));
  }

  function makeIcon(name, model) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    if (model) {
      for (const attr of model.attributes) {
        if (!['data-icon', 'viewBox', 'fill'].includes(attr.name)) svg.setAttribute(attr.name, attr.value);
      }
    } else {
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
    }
    const look = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
    for (const [k, v] of Object.entries(look)) svg.setAttribute(k, v);
    for (const [tag, attrs] of ICONS[name]) {
      const shape = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(attrs)) shape.setAttribute(k, v);
      svg.append(shape);
    }
    return svg;
  }

  function setLabel(item, text) {
    const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
    const texts = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) texts.push(n);
    if (!texts.length) {
      item.append(text);
      return;
    }
    texts[0].nodeValue = text;
    for (const n of texts.slice(1)) n.nodeValue = '';
  }

  // Copie d'une option de Twitter (mêmes classes, donc même apparence dans tous les thèmes), sans ses identifiants.
  function makeItem(template, action, trigger) {
    const item = template.cloneNode(true);
    for (const el of [item, ...item.querySelectorAll('[id]')]) el.removeAttribute('id');
    for (const name of ['data-highlighted', 'data-disabled', 'aria-disabled']) item.removeAttribute(name);
    item.setAttribute(MARK, action.key);
    item.setAttribute('tabindex', '-1');
    item.title = t(action.key + 'Hint');
    const oldIcon = item.querySelector('svg');
    const icon = makeIcon(action.icon, oldIcon);
    if (oldIcon) oldIcon.replaceWith(icon);
    else item.prepend(icon);
    setLabel(item, t(action.key));
    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      run(action, trigger);
    };
    item.addEventListener('click', activate);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') activate(event);
    });
    return item;
  }

  // Flèches haut/bas : Base UI ne connaît pas nos options, on fait passer le focus vers elles et depuis elles.
  function onMenuKeydown(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const items = [...event.currentTarget.querySelectorAll('[role="menuitem"]')];
    const current = items.indexOf(document.activeElement);
    if (current === -1) return;
    const next = items[(current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
    if (!items[current].hasAttribute(MARK) && !next.hasAttribute(MARK)) return; // entre deux options de Twitter
    event.preventDefault();
    event.stopPropagation();
    next.focus();
  }

  function inject(menu, trigger) {
    if (menu.querySelector(`[${MARK}]`)) return;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const copyLink = items.find((item) => item.querySelector('svg[data-icon="icon-link"]'));
    const template = copyLink || items[0];
    let after = copyLink || items[items.length - 1];
    for (const action of ACTIONS) {
      const item = makeItem(template, action, trigger);
      after.after(item);
      after = item;
    }
    menu.addEventListener('keydown', onMenuKeydown, true);
  }

  function handleMenu(menu, tries = 0) {
    const trigger = triggerOf(menu);
    if (!trigger || !isShareTrigger(trigger)) return;
    if (!menu.querySelector('[role="menuitem"]')) {
      // menu affiché avant ses options : on réessaie pendant une demi-seconde environ
      if (tries < 30 && menu.isConnected) requestAnimationFrame(() => handleMenu(menu, tries + 1));
      return;
    }
    inject(menu, trigger);
  }

  const remember = (event) => {
    const target = event.target;
    const el = target && typeof target.closest === 'function' && target.closest('button, [role="button"]');
    if (el && isShareTrigger(el)) lastShare = { el, time: Date.now() };
  };
  document.addEventListener('pointerdown', remember, true);
  document.addEventListener('click', remember, true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') remember(event);
  }, true);

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.matches('[role="menu"]')) handleMenu(node);
        else if (node.firstElementChild) node.querySelectorAll('[role="menu"]').forEach((menu) => handleMenu(menu));
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
