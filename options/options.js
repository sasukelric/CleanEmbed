// Page de réglages (fenêtre du bouton de l'extension et page d'options) : une case par option du menu Partager.
(async () => {
  'use strict';

  const { OPTIONS, ALWAYS_ON, pickLang, translator, iconSvg, loadDisabled, saveDisabled } = globalThis.CleanEmbed;
  const ext = globalThis.browser || globalThis.chrome;
  const lang = pickLang(ext && ext.i18n && ext.i18n.getUILanguage(), navigator.language);
  const t = translator(lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = 'CleanEmbed : ' + t('settingsTitle');
  document.getElementById('titre').textContent = t('settingsTitle');
  document.getElementById('intro').textContent = t('settingsIntro');

  const disabled = new Set(await loadDisabled());
  const liste = document.getElementById('options');
  const statut = document.getElementById('statut');
  let statutTimer = 0;

  for (const option of OPTIONS) {
    const id = 'option-' + option.key;
    const toujours = option.key === ALWAYS_ON;

    const caseACocher = document.createElement('input');
    caseACocher.type = 'checkbox';
    caseACocher.id = id;
    caseACocher.checked = toujours || !disabled.has(option.key);
    caseACocher.disabled = toujours;
    caseACocher.setAttribute('aria-describedby', id + '-aide');

    const nom = document.createElement('span');
    nom.className = 'nom';
    nom.textContent = t(option.key);
    if (toujours) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = t('alwaysOn');
      nom.append(' ', badge);
    }
    const aide = document.createElement('span');
    aide.className = 'aide';
    aide.id = id + '-aide';
    aide.textContent = t(option.key + 'Hint');
    const textes = document.createElement('span');
    textes.className = 'textes';
    textes.append(nom, aide);

    const etiquette = document.createElement('label');
    etiquette.htmlFor = id;
    etiquette.append(iconSvg(option.key, { width: '20', height: '20', class: 'icone' }), textes);

    const ligne = document.createElement('li');
    ligne.append(caseACocher, etiquette);
    liste.append(ligne);

    caseACocher.addEventListener('change', async () => {
      if (caseACocher.checked) disabled.delete(option.key);
      else disabled.add(option.key);
      await saveDisabled([...disabled]);
      statut.textContent = t('saved');
      clearTimeout(statutTimer);
      statutTimer = setTimeout(() => { statut.textContent = ''; }, 2000);
    });
  }
})();
