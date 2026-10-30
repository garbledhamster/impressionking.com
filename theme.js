/* Prototype tooling. Shared settings are separate from workshop answers. */
(() => {
  'use strict';
  const root=document.documentElement, panel=document.querySelector('#theme-panel'), toggle=document.querySelector('#theme-toggle');
  let config, saved, draft, busy=false;
  const tokenNames={canvasMax:'canvas-max',desktopSidebar:'desktop-sidebar',desktopGridMin:'desktop-grid-min',catalogMin:'catalog-min',desktopDrawerWidth:'desktop-drawer-width',landscapeDrawerWidth:'landscape-drawer-width',orbitSize:'orbit-size',drawerWidth:'drawer-width',orbitDuration:'orbit-duration',drawerMotion:'drawer-motion',background:'background',surface:'surface',input:'input',selected:'selected',edge:'edge',light:'light',muted:'muted',border:'border',divider:'divider',tag:'tag',tagText:'tag-text',button:'button',player:'player',compactGap:'compact-gap',sampleGap:'sample-gap',samplePadding:'sample-padding',controlPadding:'control-padding',radius:'radius',watchRadius:'watch-radius',headingFont:'heading-font'};
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const status=text=>{panel.querySelector('#theme-status').textContent=text;};
  function luminance(hex){const rgb=hex.slice(1).match(/../g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
  function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  function apply(){
    const tokens={...config.palettes[draft.palette].tokens,...(config.components||{})};
    for(const key of Object.keys(config.choices))Object.assign(tokens,config.choices[key][draft[key]].tokens||{});
    for(const [key,value] of Object.entries(tokens))root.style.setProperty('--'+tokenNames[key],value);
    root.style.setProperty('--blue',draft.accent);root.style.setProperty('--red',draft.hover);root.dataset.filters=draft.filters;
    root.style.setProperty('--primary-icon-filter',ratio(draft.accent,'#171717')>=ratio(draft.accent,'#ffffff')?'brightness(0)':'brightness(0) invert(1)');
    root.style.setProperty('--primary-ink',ratio(draft.accent,'#171717')>=ratio(draft.accent,'#ffffff')?'#171717':'#ffffff');
    root.style.setProperty('--hover-icon-filter',ratio(draft.hover,'#171717')>=ratio(draft.hover,'#ffffff')?'brightness(0)':'brightness(0) invert(1)');
    root.style.setProperty('--hover-ink',ratio(draft.hover,'#171717')>=ratio(draft.hover,'#ffffff')?'#171717':'#ffffff');
    document.querySelector('meta[name=theme-color]').content=tokens.background;
    const weakest=Math.min(ratio(draft.accent,tokens.background),ratio(draft.accent,tokens.selected));
    const feedback=panel.querySelector('#theme-contrast');feedback.dataset.warning=String(weakest<4.5);feedback.textContent=weakest<4.5?'Accent contrast is low. Try a lighter color.':'Accent contrast: '+weakest.toFixed(1)+':1';
  }
  function fill(){for(const field of panel.querySelectorAll('[data-setting]'))field.value=draft[field.dataset.setting];apply();}
  function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus({preventScroll:true});}
  async function load(){
    const response=await fetch('/data/theme.json');if(!response.ok)throw Error('Could not load the saved theme.');
    saved=await response.json();const local=localStorage.getItem('impression-king-theme');if(local){try{const value=JSON.parse(local);if(Object.keys(saved.settings).every(k=>typeof value[k]==='string'))saved.settings=value;}catch{}}draft={...saved.settings};fill();status('Theme for this browser');
  }
  async function save(){
    localStorage.setItem('impression-king-theme',JSON.stringify(draft));saved.settings={...draft};status('Saved in this browser');
  }
  function build(){
    panel.innerHTML='<div class="theme-top"><h2>Theme</h2><button id="theme-close" type="button">Close</button></div><p>Preview across all five layouts. Theme changes save in this browser.</p><label>Palette<select data-setting="palette"></select></label><div class="theme-colors"><label>Accent<input data-setting="accent" type="color"></label><label>Hover<input data-setting="hover" type="color"></label></div><label>Spacing<select data-setting="density"></select></label><label>Corners<select data-setting="corners"></select></label><label>Filters<select data-setting="filters"></select></label><label>Headings<select data-setting="headings"></select></label><p id="theme-contrast" aria-live="polite"></p><div class="theme-actions"><button id="theme-save" type="button">Save theme</button><button id="theme-revert" type="button">Revert</button><button id="theme-reset" type="button">Reset</button></div><p id="theme-status" role="status"></p>';
    const options={palette:config.palettes,...config.choices};
    for(const select of panel.querySelectorAll('select'))for(const [value,choice] of Object.entries(options[select.dataset.setting])){const option=document.createElement('option');option.value=value;option.textContent=choice.label;select.append(option);}
    panel.addEventListener('input',event=>{const key=event.target.dataset.setting;if(!key)return;draft[key]=event.target.value;apply();status(same(draft,saved.settings)?'Theme for this browser':'Unsaved preview');});
    panel.querySelector('#theme-close').addEventListener('click',close);
    panel.querySelector('#theme-save').addEventListener('click',save);
    panel.querySelector('#theme-revert').addEventListener('click',()=>load().catch(error=>status(error.message)));
    panel.querySelector('#theme-reset').addEventListener('click',()=>{draft={...config.defaults};fill();status('Default preview · save to keep it');});
  }
  toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelector('button')?.focus({preventScroll:true});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden)close();});
  fetch('/theme.config.json').then(response=>{if(!response.ok)throw Error('Theme configuration unavailable.');return response.json();}).then(async value=>{config=value;build();await load();}).catch(error=>{panel.textContent=error.message;});
})();
