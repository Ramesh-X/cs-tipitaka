/**
 * Inline this in <head> before first paint to prevent a flash of Roman text
 * for users who have a non-Roman script persisted in localStorage.
 *
 * Sets data-pending-script on <html> when a non-latn script is found.
 * CSS hides [data-pali] spans while that attribute is present.
 * The Transliterator island removes it after rewriting the spans.
 *
 * SEO: crawlers never execute JavaScript, so they always see the canonical
 * Roman/IAST text — no transliteration or translation is visible to them.
 */
export const transliterateInitScript = `(function(){try{var r=localStorage.getItem('tipitaka-reader-preferences');if(!r)return;var s=JSON.parse(r);var sc=s&&s.state&&s.state.script;if(sc&&sc!=='latn')document.documentElement.setAttribute('data-pending-script',sc);}catch(e){}})();`;
