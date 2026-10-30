/* Crown interaction. Session memory only; refresh restores the first reveal. */
(() => {
  'use strict';
  const levels = [
    {at:0, key:'yellow', h:49, s:100, l:60, energy:4},
    {at:10, key:'ssj2', h:49, s:100, l:60, energy:8},
    {at:25, key:'ssj3', h:49, s:100, l:60, energy:16},
    {at:45, key:'red', h:0, s:91, l:58, energy:4, god:true},
    {at:70, key:'blue', h:199, s:100, l:60, energy:12, god:true},
    {at:100, key:'silver', h:210, s:14, l:94, energy:24, god:true}
  ];
  const bolts = [
    'M22 10 6 -8 12 20 -12 12 5 44',
    'M234 28 264 12 246 48 274 38 250 76',
    'M242 210 264 226 244 222 250 258 228 240',
    'M28 232 6 258 14 226 -10 236 10 204',
    'M18 70 -12 54 4 82 -22 92 12 108',
    'M238 84 272 64 252 96 282 108 246 122',
    'M66 18 48 -16 76 2 88 -24 102 18',
    'M148 238 160 272 178 248 196 280 206 236',
    'M18 154 -16 142 0 164 -28 180 8 194',
    'M238 178 278 164 254 190 284 212 246 216',
    'M106 16 94 -24 120 -8 134 -34 150 4',
    'M40 238 26 274 56 250 72 282 88 244',
    'M18 38 -22 18 -4 46 -30 56 18 64',
    'M238 42 276 22 260 52 286 58 238 72',
    'M54 74 40 52 48 86 30 96',
    'M198 70 216 48 204 86 226 98',
    'M56 192 38 208 62 204 48 230',
    'M202 192 222 214 198 206 212 232',
    'M12 108 -8 126 20 138',
    'M246 122 268 144 236 154',
    'M8 194 -10 214 24 220',
    'M246 216 266 238 234 236',
    'M150 4 174 -18 166 18',
    'M88 244 110 266 122 238'
  ];
  const state = {clicks:0, awake:false, settled:false};
  let source, revealStarted=false;
  const sheet=document.createElement('link');
  sheet.rel='stylesheet';sheet.href='/crown-motion.css';document.head.append(sheet);
  const query=new URL(location.href).searchParams;
  document.documentElement.dataset.siteTools=String(query.get('tools')==='1'||/^(localhost|127\.|10\.|192\.168\.)/.test(location.hostname));

  function paint() {
    const index=levels.findLastIndex(level=>state.clicks>=level.at);
    const level=levels[index],next=levels[index+1];
    const between=next?(state.clicks-level.at)/(next.at-level.at):1;
    const endEnergy=index===2?24:next?Math.max(level.energy,next.energy):24;
    const energy=level.energy+(endEnergy-level.energy)*between;
    for(const svg of document.querySelectorAll('.crown-svg')) {
      svg.dataset.stage=state.awake?level.key:'original';
      svg.dataset.clicks=state.clicks;
      svg.dataset.awake=String(state.awake);
      svg.dataset.electric=String(state.awake&&(state.settled||state.clicks>0));
      svg.dataset.god=String(!!level.god);
      svg.style.setProperty('--crown-h',level.h);
      svg.style.setProperty('--crown-s',level.s+'%');
      svg.style.setProperty('--crown-l',level.l+'%');
      svg.style.setProperty('--crown-weight',1.5+between*.8);
      svg.querySelectorAll('.crown-bolt').forEach((path,i)=>{
        path.style.strokeDashoffset=100*(1-Math.max(0,Math.min(1,energy-i)));
      });
    }
  }
  function click() {
    state.clicks=Math.min(100,state.clicks+1);
    state.awake=true;
    paint();
  }
  function mount() {
    const brand=document.querySelector('.site-header .brand');
    if(!source||!brand||brand.dataset.crownBound)return;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 820 256');
    svg.setAttribute('class','brand-lockup crown-svg');
    svg.setAttribute('aria-hidden','true');
    svg.dataset.restored=String(state.settled);
    svg.innerHTML=`<g transform="translate(16 22) scale(.828125)"><g class="crown-base">${source.mark}</g><g class="crown-powered">${source.mark}</g><g class="crown-energy">${bolts.map(d=>`<path class="crown-bolt" pathLength="100" d="${d}"/>`).join('')}</g></g>${source.words}`;
    brand.querySelector('.brand-lockup').replaceWith(svg);
    brand.dataset.crownBound='true';
    brand.setAttribute('role','button');
    brand.setAttribute('aria-label','Impression King');
    brand.addEventListener('click',event=>{event.preventDefault();click();});
    brand.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))event.preventDefault();});
    brand.addEventListener('keyup',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();click();}});
    paint();
    if(!revealStarted) {
      revealStarted=true;
      setTimeout(()=>{state.awake=true;paint();},650);
      setTimeout(()=>{state.settled=true;paint();},3650);
    }
  }
  document.addEventListener('showcase:render',mount);
  fetch('/assets/brand/logo-horizontal.svg').then(response=>response.text()).then(text=>{
    const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
    const groups=[...svg.children].filter(element=>element.tagName==='g');
    source={mark:groups[0].innerHTML,words:groups.slice(1).map(element=>element.outerHTML).join('')};
    mount();
  });
})();
