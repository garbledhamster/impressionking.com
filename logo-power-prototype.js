/* THROWAWAY: five vector-logo transformations on /?study=logo&variant=A–E.
   Question: which hard fill + electrical treatment fits Jacob's framed crown? */
(() => {
  'use strict';
  if(new URL(location.href).searchParams.get('study')!=='logo')return;
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/logo-power-prototype.css';document.head.append(sheet);
  const samples={A:['Hard rise','A straight edge climbs through the crown. Each form adds its own color and lightning level.'],B:['Staircase','Three offset steps climb upward. The same escalating lightning surrounds the frame.'],C:['Three signals','The middle rises first, followed by the two outer signals.'],D:['Angled cut','A sharp diagonal slices upward through the crown.'],E:['Signal ladder','Eight crisp horizontal levels fill the mark, one after another.']};
  const forms=['base','yellow','yellow2','yellow3','red','blue','ultra'];
  const names={base:'Original',yellow:'Super Saiyan',yellow2:'Super Saiyan 2',yellow3:'Super Saiyan 3',red:'God Red',blue:'God Blue',ultra:'Ultra Instinct'};
  const colors={base:[197.447,100,72.353],yellow:[49,100,60],yellow2:[49,100,60],yellow3:[49,100,60],red:[0,91,58],blue:[199,100,60],ultra:[210,14,94]};
  const config={taps:{yellow:5,yellow2:7,yellow3:9},hold:1200,wait:60000,fill:950};
  const nextForm={yellow:'yellow2',yellow2:'yellow3',yellow3:'red'};
  const intensity={base:0,yellow:1,yellow2:2,yellow3:3,red:1,blue:2,ultra:3};
  const state={form:'base',charging:false,charge:0,taps:0,tapStart:0,blueTime:0,holding:false,holdStart:0,last:performance.now(),preview:false};
  let sources,frame=0,painted=0,editForm='yellow',activePointer=null,suppressClick=false;
  const hue=f=>`hsl(${colors[f][0]} ${colors[f][1]}% ${colors[f][2]}%)`;
  const currentVariant=()=>new URL(location.href).searchParams.get('variant')||'A';
  const svg=(id,header=false)=>{
    const shape=sources.symbol;
    const bolts={A:'M22 10 6 -8 12 20 -12 12 5 44 M234 28 264 12 246 48 274 38 250 76 M242 210 264 226 244 222 250 258 228 240 M28 232 6 258 14 226 -10 236 10 204'};
    const extra='M18 70 -12 54 4 82 -22 92 12 108 -8 126 20 138 M238 84 272 64 252 96 282 108 246 122 268 144 236 154 M66 18 48 -16 76 2 88 -24 102 18 M148 238 160 272 178 248 196 280 206 236';
    const storm='M18 154 -16 142 0 164 -28 180 8 194 -10 214 24 220 M238 178 278 164 254 190 284 212 246 216 266 238 234 236 M106 16 94 -24 120 -8 134 -34 150 4 174 -18 166 18 M40 238 26 274 56 250 72 282 88 244 110 266 122 238 M18 38 -22 18 -4 46 -30 56 18 64 M238 42 276 22 260 52 286 58 238 72 M54 74 40 52 48 86 30 96 M198 70 216 48 204 86 226 98 M56 192 38 208 62 204 48 230 M202 192 222 214 198 206 212 232';
    // Start with A's perimeter branches; higher levels add independent forks.
    const layers=[bolts.A,extra,storm].map((d,i)=>`<g class="power-bolt-layer" data-density="${i+1}"><path class="power-electric" d="${d}"/><path class="power-spark" d="${d}"/></g>`).join('');
    const content=`<g class="power-base">${shape}</g><g class="power-fill">${shape}</g>${layers}`;
    return header?`<svg class="brand-lockup power-svg power-header-svg" viewBox="0 0 820 256" role="img" aria-label="Impression King"><g transform="translate(16 22) scale(.828125)">${content}</g>${sources.words}</svg>`:`<svg class="power-svg" viewBox="-30 -30 316 316" aria-hidden="true">${content}</svg>`;
  };
  function transition(form,preview=false){
    state.form=form;state.preview=preview;state.charging=false;state.charge=form==='base'?0:1;state.taps=0;state.holding=false;state.blueTime=0;state.last=performance.now();
    paint();schedule();
  }
  function charge(){if(state.form!=='base'||state.charging)return;state.charging=true;state.chargeStart=performance.now();state.preview=false;paint();schedule();}
  function activate(){
    if(suppressClick){suppressClick=false;return;}
    if(state.form==='base'){charge();return;}
    if(!nextForm[state.form])return;
    const now=performance.now();if(now-state.tapStart>5000){state.taps=0;state.tapStart=now;}
    if(!state.taps)state.tapStart=now;
    state.taps++;if(state.taps>=config.taps[state.form])transition(nextForm[state.form]);else paint();
  }
  function cancelHold(){state.holding=false;activePointer=null;paint();}
  function bind(button){
    button.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen')charge();});
    button.addEventListener('click',e=>{e.preventDefault();activate();});
    button.addEventListener('pointerdown',e=>{if(e.button!==0)return;suppressClick=false;activePointer={id:e.pointerId,x:e.clientX,y:e.clientY};if(state.form==='red'){state.holding=true;state.holdStart=performance.now();schedule();} });
    button.addEventListener('pointermove',e=>{if(activePointer&&Math.hypot(e.clientX-activePointer.x,e.clientY-activePointer.y)>14)cancelHold();});
    button.addEventListener('pointerup',()=>{state.holding=false;activePointer=null;paint();});
    button.addEventListener('pointercancel',cancelHold);
    button.addEventListener('pointerleave',()=>{if(state.holding)cancelHold();});
    button.addEventListener('contextmenu',e=>e.preventDefault());
    button.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;e.preventDefault();if(e.repeat)return;if(state.form==='red'){state.holding=true;state.holdStart=performance.now();schedule();}});
    button.addEventListener('keyup',e=>{if(!['Enter',' '].includes(e.key))return;e.preventDefault();state.holding=false;activate();paint();});
    button.addEventListener('blur',cancelHold);
  }
  function mask(p){
    const y=100-p*100,clamp=v=>Math.max(0,Math.min(100,v));
    switch(currentVariant()){
      case 'B':return `polygon(0 ${clamp(y+14)}%,33% ${clamp(y+14)}%,33% ${y}%,67% ${y}%,67% ${clamp(y-14)}%,100% ${clamp(y-14)}%,100% 100%,0 100%)`;
      case 'C':return `polygon(0 ${clamp(y+18)}%,33% ${clamp(y+18)}%,33% ${clamp(y-18)}%,67% ${clamp(y-18)}%,67% ${clamp(y+18)}%,100% ${clamp(y+18)}%,100% 100%,0 100%)`;
      case 'D':return `polygon(0 ${clamp(y+24)}%,100% ${clamp(y-24)}%,100% 100%,0 100%)`;
      case 'E':return `inset(${100-Math.floor(p*8)/8*100}% 0 0)`;
      default:return `inset(${y}% 0 0)`;
    }
  }
  function paint(){
    const root=document.documentElement,form=state.charging?'yellow':state.form;
    root.style.setProperty('--power-tone',hue(form));root.style.setProperty('--power-base',hue('base'));
    root.style.setProperty('--power-electric',hue(form));
    // Fully charged forms must cover all three tips, regardless of fill geometry.
    root.style.setProperty('--power-mask',state.charge>=1?'inset(0)':state.charge<=0?'inset(100% 0 0)':mask(state.charge));
    document.querySelectorAll('.power-svg').forEach(el=>{el.dataset.energized=String(state.form!=='base');el.dataset.form=state.form;el.dataset.intensity=intensity[state.form];});
    const status=document.querySelector('#power-status');if(!status)return;
    const remaining=Math.max(0,Math.ceil((config.wait-state.blueTime)/1000));
    status.textContent=state.charging?`Charging · ${Math.round(state.charge*100)}%`:names[state.form];
    document.querySelector('#power-hint').textContent=state.charging?'A hard edge fills the original vector shape.':state.form==='base'?'Hover, tap or press Enter to start.':nextForm[state.form]?`Tap ${config.taps[state.form]-state.taps} more times within 5 seconds to reach ${names[nextForm[state.form]]}.`:state.form==='red'?(state.holding?'Hold steady…':'Press and hold for '+(config.hold/1000).toFixed(1)+' seconds to reach God Blue.'):state.form==='blue'?`${remaining}s of visible time until Ultra Instinct${document.hidden?' · paused while hidden':''}.`:'Ultra Instinct stays until refresh or Reset.';
    document.querySelector('#power-readout').textContent=JSON.stringify({variant:currentVariant(),form:state.form,lightning:intensity[state.form],charging:state.charging,taps:state.taps,holding:state.holding,blueSeconds:+(state.blueTime/1000).toFixed(1),visible:!document.hidden,preview:state.preview},null,2);
    document.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preview===state.form&&!state.charging)));
    const progress=state.holding?Math.min(1,(performance.now()-state.holdStart)/config.hold):state.form==='blue'?state.blueTime/config.wait:state.charging?state.charge:state.form==='base'?0:1;
    const meter=document.querySelector('#power-progress');meter.value=progress;meter.setAttribute('aria-label',state.holding?'Hold progress':state.form==='blue'?'Ultra Instinct countdown':'Transformation progress');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=0;const delta=now-state.last;state.last=now;
    if(!document.hidden){
      if(state.charging){state.charge=Math.min(1,(now-state.chargeStart)/config.fill);if(state.charge>=1)transition('yellow');}
      if(state.holding&&state.form==='red'&&now-state.holdStart>=config.hold){suppressClick=true;transition('blue');}
      if(state.form==='blue'){state.blueTime+=Math.min(delta,250);if(state.blueTime>=config.wait)transition('ultra');}
    }
    if(state.charging||now-painted>120){paint();painted=now;}
    if(state.charging||state.holding||state.form==='blue')schedule();
  }
  function colorEditor(){
    const values=colors[editForm];['h','s','l'].forEach((key,i)=>{document.querySelector('#power-'+key).value=values[i];document.querySelector('#power-'+key+'-value').textContent=values[i]+(i?'%':'°');});
    document.querySelector('#power-color-code').textContent=hue(editForm);paint();
  }
  function mount(){
    if(!sources||!document.querySelector('.intro'))return;
    const variant=samples[currentVariant()]?currentVariant():'A',[name,note]=samples[variant];
    document.body.classList.add('logo-power-study');
    const intro=document.querySelector('.intro');intro.className='intro power-study';
    intro.innerHTML=`<div class="power-title"><span class="power-eyebrow">Motion prototype · ${variant} / 5</span><h1>${name}</h1><p>${note}</p></div><div class="power-workspace"><section class="power-stage" aria-label="Interactive crown"><button id="power-crown" class="power-trigger" type="button" aria-label="Transform Impression King crown">${svg('hero')}</button><div class="power-status"><h2 id="power-status" aria-live="polite"></h2><p id="power-hint"></p><progress id="power-progress" value="0" max="1"></progress></div><button id="power-reset" class="power-reset" type="button">Reset</button></section><aside class="power-console" aria-label="Prototype controls"><div class="power-sequence"><span>Hover / tap</span><span>5 / 7 / 9 taps</span><span>Hold</span><span>60 seconds</span></div><details open><summary>Preview a form</summary><p class="power-detail">Jump ahead to compare colors. The real gesture sequence works on the crown above and in the header.</p><div class="power-forms">${forms.map(f=>`<button type="button" data-preview="${f}">${names[f]}</button>`).join('')}</div><button id="power-skip" type="button">Preview +10 seconds</button></details><details><summary>Color &amp; timing</summary><label>Color to edit<select id="power-edit">${forms.map(f=>`<option value="${f}" ${f===editForm?'selected':''}>${names[f]}</option>`).join('')}</select></label>${[['h','Hue',360],['s','Saturation',100],['l','Lightness',100]].map(([key,label,max])=>`<label>${label}<output id="power-${key}-value"></output><input id="power-${key}" type="range" min="0" max="${max}" step="1"></label>`).join('')}<code id="power-color-code"></code><label>Blue → Ultra wait (seconds)<input id="power-wait" type="number" min="1" max="180" value="${config.wait/1000}"></label><label>Hold (seconds)<input id="power-hold" type="number" min="0.3" max="5" step="0.1" value="${config.hold/1000}"></label></details><details><summary>Live state</summary><pre id="power-readout"></pre></details><p class="power-footnote">Vector + CSS + JavaScript. Changes stay in memory; refresh restores Original. No flashing strobe; reduced motion keeps the colors.</p></aside></div>`;
    const brand=document.querySelector('.site-header .brand');brand.querySelector('.brand-lockup').outerHTML=svg('header',true);brand.setAttribute('aria-label','Transform Impression King crown');brand.setAttribute('role','button');bind(brand);bind(document.querySelector('#power-crown'));
    document.querySelector('#variant-label').textContent=`${variant} — ${name}`;
    document.querySelector('#power-reset').onclick=()=>transition('base');
    document.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>transition(b.dataset.preview,true));
    document.querySelector('#power-skip').onclick=()=>{if(state.form==='blue'){state.blueTime+=10000;state.preview=true;if(state.blueTime>=config.wait)transition('ultra',true);paint();}};
    document.querySelector('#power-edit').onchange=e=>{editForm=e.target.value;transition(editForm,true);colorEditor();};
    ['h','s','l'].forEach((key,i)=>document.querySelector('#power-'+key).oninput=e=>{colors[editForm][i]=+e.target.value;if(state.form!==editForm||state.charging)transition(editForm,true);colorEditor();});
    document.querySelector('#power-wait').onchange=e=>{config.wait=Math.max(1000,Math.min(180000,(+e.target.value||60)*1000));state.blueTime=0;paint();};
    document.querySelector('#power-hold').onchange=e=>{config.hold=Math.max(300,Math.min(5000,(+e.target.value||1.2)*1000));paint();};
    colorEditor();paint();schedule();
  }
  document.addEventListener('visibilitychange',()=>{state.last=performance.now();cancelHold();schedule();});
  document.addEventListener('showcase:render',mount);
  fetch('/assets/brand/logo-horizontal.svg').then(r=>r.text()).then(horizontal=>{
    const parse=text=>new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
    const h=parse(horizontal);sources={symbol:h.querySelector('g').innerHTML,words:[...h.children].filter(e=>e.tagName==='g').slice(1).map(e=>e.outerHTML).join('')};mount();
  });
})();
