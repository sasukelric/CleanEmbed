// Ajoute les liens FixupX (normal, direct, galerie, texte seul, mosaïque, traduit, Instant View, ancien style)
// au menu Partager des posts Twitter.
// Repères vérifiés sur x.com le 2026-11-09 (nouvelle interface, menus Base UI), tous indépendants de la langue :
// - le bouton Partager porte data-engagement-action="share" ;
// - le menu ([role="menu"]) est relié à son bouton par aria-labelledby ;
// - l'option « Copier le lien » contient svg[data-icon="icon-link"] : nos options se placent juste après ;
// - un post cité est un <article> imbriqué ; le lien du post lui-même est celui de l'heure (il ouvre une infobulle).
(() => {
  'use strict';
  if (globalThis.__cleanEmbedLoaded) return;
  globalThis.__cleanEmbedLoaded = true;

  const { OPTIONS, parseStatus, linkFor, pickLang, translator, iconSvg, enabledOptions, loadDisabled, onDisabledChange } =
    globalThis.CleanEmbed;
  const MARK = 'data-cleanembed';

  // Options décochées dans les réglages, gardées à jour quand l'utilisateur les change
  let disabled = [];
  loadDisabled().then((list) => { disabled = list; }, () => {});
  onDisabledChange((list) => { disabled = list; });

  const lang = () => pickLang(document.documentElement.lang, navigator.language);
  const t = (key) => translator(lang())(key);
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

  function run(option, trigger) {
    const status = statusOf(trigger);
    if (!status) {
      closeMenu();
      toast(t('noLink'), true);
      return;
    }
    // Traduction vers la langue des textes du menu (« zh-TW » → « zh »)
    const { url, rare } = linkFor(status, option, lang().slice(0, 2));
    const copying = copy(url); // lancé pendant le clic, tant que le navigateur l'autorise
    closeMenu();
    copying.then((ok) => {
      if (!ok) toast(t('copyFailed'), true);
      else toast(rare ? t('copiedRare').replace('{host}', rare) : t('copied'));
    });
  }

  // Notre icône, avec les attributs de l'icône de Twitter qu'elle remplace (taille, classes)
  function makeIcon(key, model) {
    const attrs = { width: '20', height: '20' };
    if (model) {
      for (const attr of model.attributes) {
        if (!['data-icon', 'viewBox', 'fill'].includes(attr.name)) attrs[attr.name] = attr.value;
      }
    }
    return iconSvg(key, attrs);
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
  function makeItem(template, option, trigger) {
    const item = template.cloneNode(true);
    for (const el of [item, ...item.querySelectorAll('[id]')]) el.removeAttribute('id');
    for (const name of ['data-highlighted', 'data-disabled', 'aria-disabled']) item.removeAttribute(name);
    item.setAttribute(MARK, option.key);
    item.setAttribute('tabindex', '-1');
    item.title = t(option.key + 'Hint');
    const oldIcon = item.querySelector('svg');
    const icon = makeIcon(option.key, oldIcon);
    if (oldIcon) oldIcon.replaceWith(icon);
    else item.prepend(icon);
    setLabel(item, t(option.key));
    const activate = (event) => {
      event.preventDefault();
      event.stopPropagation();
      run(option, trigger);
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

  const copyLinkOf = (items) => items.find((item) => item.querySelector('svg[data-icon="icon-link"]'));

  // Nos options juste sous « Copier le lien » (sinon en fin de menu). Rien n'est déplacé si elles y sont déjà,
  // ce qui évite une boucle avec l'observateur ci-dessous.
  function place(menu) {
    const ours = [...menu.querySelectorAll(`[${MARK}]`)];
    const items = [...menu.querySelectorAll('[role="menuitem"]')].filter((item) => !item.hasAttribute(MARK));
    const anchor = copyLinkOf(items) || items[items.length - 1];
    if (!ours.length || !anchor) return;
    const inPlace = ours.every((item, i) => (i === 0 ? anchor : ours[i - 1]).nextElementSibling === item);
    if (!inPlace) anchor.after(...ours);
  }

  function inject(menu, trigger) {
    if (menu.querySelector(`[${MARK}]`)) return;
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    const template = copyLinkOf(items) || items[0];
    menu.append(...enabledOptions(OPTIONS, disabled).map((option) => makeItem(template, option, trigger)));
    place(menu);
    // Une fois connecté, Twitter reconstruit les options du menu juste après l'avoir ouvert : les siennes
    // s'ajoutent alors après les nôtres. On les replace à chaque changement.
    new MutationObserver(() => place(menu)).observe(menu, { childList: true, subtree: true });
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
