/** Inline in <head> before paint — docs/web/hydration-and-persistence.md. */
export const transliterateInitScript = `(function(){try{var r=localStorage.getItem('tipitaka-reader-preferences');if(!r)return;var s=JSON.parse(r);var sc=s&&s.state&&s.state.script;if(sc&&sc!=='latn')document.documentElement.setAttribute('data-pending-script',sc);}catch(e){}})();`;
