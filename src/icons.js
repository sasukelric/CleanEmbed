// Icône de chaque option du menu : dessins 24×24 en traits de Lucide (voir THIRD_PARTY_NOTICES.md).
// Partagé par le script de contenu (menu de Twitter) et la page de réglages.
(function (root) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const LOOK = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2',
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
  const ICONS = {
    fixupx: [ // link
      ['path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
      ['path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }],
    ],
    direct: [ // square-play
      ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2' }],
      ['path', { d: 'm9 8 6 4-6 4Z' }],
    ],
    gallery: [ // image
      ['rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }],
      ['circle', { cx: '9', cy: '9', r: '2' }],
      ['path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }],
    ],
    textOnly: [ // text-align-start
      ['path', { d: 'M21 5H3' }],
      ['path', { d: 'M15 12H3' }],
      ['path', { d: 'M17 19H3' }],
    ],
    mosaic: [ // layout-grid
      ['rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }],
      ['rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }],
      ['rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }],
      ['rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }],
    ],
    translate: [ // languages
      ['path', { d: 'm5 8 6 6' }],
      ['path', { d: 'm4 14 6-6 2-3' }],
      ['path', { d: 'M2 5h12' }],
      ['path', { d: 'M7 2h1' }],
      ['path', { d: 'm22 22-5-10-5 10' }],
      ['path', { d: 'M14 18h6' }],
    ],
    instantView: [ // zap
      ['path', { d: 'M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z' }],
    ],
    oldEmbed: [ // rotate-ccw
      ['path', { d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }],
      ['path', { d: 'M3 3v5h5' }],
    ],
  };

  // Icône d'une option ; attrs : attributs en plus (taille, classes reprises de l'icône de Twitter…)
  function iconSvg(key, attrs = {}) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    for (const [k, v] of Object.entries({ ...attrs, ...LOOK })) svg.setAttribute(k, v);
    for (const [tag, shapeAttrs] of ICONS[key]) {
      const shape = document.createElementNS(SVG_NS, tag);
      for (const [k, v] of Object.entries(shapeAttrs)) shape.setAttribute(k, v);
      svg.append(shape);
    }
    return svg;
  }

  const api = { ICONS, iconSvg };
  root.CleanEmbed = Object.assign(root.CleanEmbed || {}, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
