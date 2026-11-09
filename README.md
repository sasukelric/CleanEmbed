# CleanEmbed

Extension Firefox et Chrome qui ajoute deux options au menu **Partager** des posts Twitter (x.com), juste sous « Copier le lien » :

| Option | Exemple pour `https://x.com/zerowontmiss/status/2119575171459961102?a=CZyMoQ0ZumdziYt2bLY&s=20` |
|---|---|
| **Copier le lien FixupX** | `https://fixupx.com/zerowontmiss/status/2119575171459961102` |
| **Copier le lien direct (d.FixupX)** | `https://d.fixupx.com/zerowontmiss/status/2119575171459961102` |

- Les paramètres de pistage (`?s=20`, `?t=…`, `?a=…`) sont toujours retirés.
- Le lien `d.` affiche seulement la vidéo, l'image ou le lien du post, sans le post autour.
- Un message confirme la copie.
- Les options prennent l'apparence du menu de Twitter (thème clair ou sombre) et se pilotent aussi au clavier (flèches, Entrée).

Les textes suivent la langue de l'interface de Twitter, sinon celle du navigateur. Langues disponibles : anglais, français, espagnol, allemand, italien, portugais, néerlandais, polonais, turc, russe, japonais, coréen, chinois simplifié et traditionnel, arabe, indonésien.

## FixupX ne fait pas partie de ce projet

FixupX (`fixupx.com` et `d.fixupx.com`) est un service gratuit et libre du projet [FxEmbed](https://github.com/FxEmbed/FxEmbed), qui gère aussi FxTwitter et FxBluesky.

Cette extension n'est pas FixupX. Elle ajoute seulement au menu de Twitter un raccourci qui fabrique des liens vers ce service. Elle n'a aucun lien avec les auteurs de FixupX, ni avec Twitter/X. Si FixupX ne répond plus, ça vient de leur service, pas de l'extension.

## Vie privée

- Aucune donnée collectée, aucune requête réseau.
- Aucune permission spéciale : seulement l'accès aux pages x.com et twitter.com, pour y ajouter les options.
- Le lien est fabriqué localement, à partir de la page.

## Essayer sans publier

**Firefox** : `about:debugging` → Ce Firefox → « Charger un module complémentaire temporaire… » → choisir `manifest.json`. Le module disparaît au redémarrage de Firefox.

**Chrome / Edge / Brave / Opera** : `chrome://extensions` → activer le mode développeur → « Charger l'extension non empaquetée » → choisir le dossier du projet (celui qui contient `manifest.json`). Chrome signale la clé `browser_specific_settings` comme inconnue : c'est normal, elle ne sert qu'à Firefox.

## Publier

`pwsh scripts/paquet.ps1` fabrique deux fichiers dans `dist/` : `cleanembed-<version>-firefox.zip` pour Firefox, et `cleanembed-<version>-chrome.zip` pour Chrome et Edge. Ce dernier a le même contenu, sans la clé `browser_specific_settings` propre à Firefox.

- **Firefox** : <https://addons.mozilla.org/developers/>, compte gratuit. L'identifiant Firefox est déjà dans le manifest : c'est un GUID neutre, qui ne doit plus changer une fois l'extension publiée. Pour publier une version dérivée de ce code, le remplacer par un nouvel identifiant. Le choix « Sur ce site » rend l'extension publique ; « Par vous-même » la signe pour un usage personnel.
- **Chrome** : <https://chrome.google.com/webstore/devconsole>, inscription unique de 5 $.
- **Edge** : <https://partner.microsoft.com/dashboard/microsoftedge>, gratuit.

Avant chaque publication, augmenter `version` dans `manifest.json`.

## Développement

```powershell
node --test "tests/*.test.js"                     # liens et traductions
npx web-ext lint --source-dir . --ignore-files "tests/**" "scripts/**" "dist/**" README.md .gitignore
python -I scripts/icones.py                       # redessine icons/ (Pillow)
pwsh scripts/paquet.ps1                           # zip pour les boutiques
```

| Fichier | Rôle |
|---|---|
| `src/links.js` | lien Twitter → lien FixupX, sans pistage |
| `src/i18n.js` | textes des options dans chaque langue |
| `src/content.js` | détection du menu Partager et ajout des options |
| `src/content.css` | survol des options, message de confirmation |
| `_locales/` | nom et description de l'extension, pour les navigateurs et les boutiques |

**Si Twitter change son interface**, les repères sont en tête de `src/content.js`. Ils ont été vérifiés sur x.com le 2026-11-09 :
- le bouton Partager porte `data-engagement-action="share"` ;
- le menu est relié à son bouton par `aria-labelledby` ;
- « Copier le lien » contient `svg[data-icon="icon-link"]` ;
- un post cité est un `<article>` imbriqué.

L'ancienne interface (avant 2026) est gérée en secours, mais n'a pas pu être testée.

## Licence

MIT : voir [LICENSE](LICENSE). Les deux icônes du menu viennent de Lucide et Feather, voir [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
