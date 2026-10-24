// ?lang=ja|en に応じて、[data-t] の中身を window.STRINGS から差し込む。[data-img] は popup.<lang>.png などを読む。
(() => {
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ja';
  const s = window.STRINGS[lang];
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-t]')) el.innerHTML = s[el.dataset.t];
  for (const el of document.querySelectorAll('[data-img]'))
    el.src = `${el.dataset.img}.${lang}.png`;
})();
