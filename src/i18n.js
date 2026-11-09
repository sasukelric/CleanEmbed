// Textes des options ajoutées au menu, dans la langue de Twitter (attribut lang de la page),
// sinon celle du navigateur, sinon l'anglais.
(function (root) {
  'use strict';

  const STRINGS = {
    en: {
      fixupx: 'Copy FixupX link',
      direct: 'Copy direct link (d.FixupX)',
      fixupxHint: 'Link that shows a proper preview on Discord, Telegram…',
      directHint: 'Shows only the video, image or link, without the post',
      copied: 'Link copied to clipboard',
      copyFailed: "Couldn't copy the link",
      noLink: "Couldn't find this post's link",
    },
    fr: {
      fixupx: 'Copier le lien FixupX',
      direct: 'Copier le lien direct (d.FixupX)',
      fixupxHint: 'Lien avec un vrai aperçu sur Discord, Telegram…',
      directHint: "Affiche seulement la vidéo, l'image ou le lien, sans le post",
      copied: 'Lien copié dans le presse-papiers',
      copyFailed: 'Impossible de copier le lien',
      noLink: 'Impossible de trouver le lien de ce post',
    },
    es: {
      fixupx: 'Copiar enlace de FixupX',
      direct: 'Copiar enlace directo (d.FixupX)',
      fixupxHint: 'Enlace con una buena vista previa en Discord, Telegram…',
      directHint: 'Muestra solo el vídeo, la imagen o el enlace, sin el post',
      copied: 'Enlace copiado al portapapeles',
      copyFailed: 'No se pudo copiar el enlace',
      noLink: 'No se encontró el enlace de este post',
    },
    de: {
      fixupx: 'FixupX-Link kopieren',
      direct: 'Direktlink kopieren (d.FixupX)',
      fixupxHint: 'Link mit richtiger Vorschau in Discord, Telegram …',
      directHint: 'Zeigt nur das Video, Bild oder den Link, ohne den Post',
      copied: 'Link in die Zwischenablage kopiert',
      copyFailed: 'Link konnte nicht kopiert werden',
      noLink: 'Link zu diesem Post nicht gefunden',
    },
    it: {
      fixupx: 'Copia link FixupX',
      direct: 'Copia link diretto (d.FixupX)',
      fixupxHint: "Link con un'anteprima completa su Discord, Telegram…",
      directHint: "Mostra solo il video, l'immagine o il link, senza il post",
      copied: 'Link copiato negli appunti',
      copyFailed: 'Impossibile copiare il link',
      noLink: 'Impossibile trovare il link di questo post',
    },
    pt: {
      fixupx: 'Copiar link do FixupX',
      direct: 'Copiar link direto (d.FixupX)',
      fixupxHint: 'Link com uma prévia completa no Discord, Telegram…',
      directHint: 'Mostra só o vídeo, a imagem ou o link, sem o post',
      copied: 'Link copiado para a área de transferência',
      copyFailed: 'Não foi possível copiar o link',
      noLink: 'Não foi possível encontrar o link deste post',
    },
    nl: {
      fixupx: 'FixupX-link kopiëren',
      direct: 'Directe link kopiëren (d.FixupX)',
      fixupxHint: 'Link met een volledige preview in Discord, Telegram…',
      directHint: 'Toont alleen de video, afbeelding of link, zonder de post',
      copied: 'Link gekopieerd naar klembord',
      copyFailed: 'Kan de link niet kopiëren',
      noLink: 'Kan de link van deze post niet vinden',
    },
    pl: {
      fixupx: 'Kopiuj link FixupX',
      direct: 'Kopiuj link bezpośredni (d.FixupX)',
      fixupxHint: 'Link z pełnym podglądem na Discordzie, Telegramie…',
      directHint: 'Pokazuje tylko film, obraz lub link, bez posta',
      copied: 'Skopiowano link do schowka',
      copyFailed: 'Nie udało się skopiować linku',
      noLink: 'Nie znaleziono linku do tego posta',
    },
    tr: {
      fixupx: 'FixupX bağlantısını kopyala',
      direct: 'Doğrudan bağlantıyı kopyala (d.FixupX)',
      fixupxHint: 'Discord, Telegram vb. üzerinde tam önizleme gösteren bağlantı',
      directHint: 'Gönderi olmadan yalnızca videoyu, görseli veya bağlantıyı gösterir',
      copied: 'Bağlantı panoya kopyalandı',
      copyFailed: 'Bağlantı kopyalanamadı',
      noLink: 'Bu gönderinin bağlantısı bulunamadı',
    },
    ru: {
      fixupx: 'Копировать ссылку FixupX',
      direct: 'Копировать прямую ссылку (d.FixupX)',
      fixupxHint: 'Ссылка с полноценным превью в Discord, Telegram…',
      directHint: 'Показывает только видео, изображение или ссылку, без поста',
      copied: 'Ссылка скопирована в буфер обмена',
      copyFailed: 'Не удалось скопировать ссылку',
      noLink: 'Не удалось найти ссылку на этот пост',
    },
    ja: {
      fixupx: 'FixupXのリンクをコピー',
      direct: '直接リンクをコピー（d.FixupX）',
      fixupxHint: 'Discord や Telegram などできちんとプレビューされるリンク',
      directHint: 'ポストなしで動画・画像・リンクだけを表示します',
      copied: 'リンクをクリップボードにコピーしました',
      copyFailed: 'リンクをコピーできませんでした',
      noLink: 'このポストのリンクが見つかりませんでした',
    },
    ko: {
      fixupx: 'FixupX 링크 복사',
      direct: '직접 링크 복사 (d.FixupX)',
      fixupxHint: 'Discord, Telegram 등에서 미리보기가 제대로 보이는 링크',
      directHint: '게시물 없이 동영상, 이미지 또는 링크만 표시합니다',
      copied: '링크가 클립보드에 복사되었습니다',
      copyFailed: '링크를 복사할 수 없습니다',
      noLink: '이 게시물의 링크를 찾을 수 없습니다',
    },
    'zh-CN': {
      fixupx: '复制 FixupX 链接',
      direct: '复制直链（d.FixupX）',
      fixupxHint: '在 Discord、Telegram 等平台显示完整预览的链接',
      directHint: '只显示视频、图片或链接，不显示帖子',
      copied: '链接已复制到剪贴板',
      copyFailed: '无法复制链接',
      noLink: '找不到这条帖子的链接',
    },
    'zh-TW': {
      fixupx: '複製 FixupX 連結',
      direct: '複製直接連結（d.FixupX）',
      fixupxHint: '在 Discord、Telegram 等平台顯示完整預覽的連結',
      directHint: '只顯示影片、圖片或連結，不顯示貼文',
      copied: '連結已複製到剪貼簿',
      copyFailed: '無法複製連結',
      noLink: '找不到這則貼文的連結',
    },
    ar: {
      fixupx: 'نسخ رابط FixupX',
      direct: 'نسخ الرابط المباشر (d.FixupX)',
      fixupxHint: 'رابط بمعاينة كاملة في Discord وTelegram وغيرها',
      directHint: 'يعرض الفيديو أو الصورة أو الرابط فقط، بدون المنشور',
      copied: 'تم نسخ الرابط إلى الحافظة',
      copyFailed: 'تعذّر نسخ الرابط',
      noLink: 'تعذّر العثور على رابط هذا المنشور',
    },
    id: {
      fixupx: 'Salin tautan FixupX',
      direct: 'Salin tautan langsung (d.FixupX)',
      fixupxHint: 'Tautan dengan pratinjau lengkap di Discord, Telegram, dll.',
      directHint: 'Hanya menampilkan video, gambar, atau tautan, tanpa postingan',
      copied: 'Tautan disalin ke papan klip',
      copyFailed: 'Tidak dapat menyalin tautan',
      noLink: 'Tautan postingan ini tidak ditemukan',
    },
  };

  // Premier code de langue reconnu parmi les candidats (« fr », « pt-BR », « zh-Hant »…), sinon « en ».
  function pickLang(...candidates) {
    for (const c of candidates) {
      if (!c) continue;
      const l = String(c).toLowerCase().replace('_', '-');
      if (l === 'zh' || l.startsWith('zh-')) return /tw|hk|mo|hant/.test(l) ? 'zh-TW' : 'zh-CN';
      if (STRINGS[l]) return l;
      const base = l.split('-')[0];
      if (STRINGS[base]) return base;
    }
    return 'en';
  }

  function translator(...candidates) {
    const table = STRINGS[pickLang(...candidates)];
    return (key) => table[key] ?? STRINGS.en[key] ?? key;
  }

  const api = { STRINGS, pickLang, translator };
  root.CleanEmbed = Object.assign(root.CleanEmbed || {}, api);
  if (typeof module === 'object' && module.exports) module.exports = api;
})(globalThis);
