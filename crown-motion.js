/* Crown interaction. Session memory only; refresh restores the first reveal. */
(() => {
  'use strict';
  const palettes={yellow:{h:49,s:100,l:60},red:{h:0,s:91,l:58},blue:{h:199,s:100,l:60},silver:{h:210,s:14,l:94}};
  // Click thresholds, density and aura are deliberately kept together for tuning.
  const levels = [
    {at:0, key:'yellow',family:'yellow',tier:1,energy:4, logo:0, electric:0, speed:4.2},
    {at:10,key:'ssj2',  family:'yellow',tier:2,energy:10,logo:1, electric:0, speed:3.2},
    {at:20,key:'ssj3',  family:'yellow',tier:3,energy:20,logo:1.7,electric:1.2,speed:2.5},
    {at:30,key:'red',   family:'red',tier:1,energy:6, logo:1.7,electric:.7, speed:2.2},
    {at:40,key:'red2',  family:'red',tier:2,energy:14,logo:2.1,electric:1.2,speed:1.9},
    {at:50,key:'red3',  family:'red',tier:3,energy:24,logo:2.5,electric:1.7,speed:1.6},
    {at:60,key:'blue',  family:'blue',tier:1,energy:10,logo:2.2,electric:1.4,speed:1.35},
    {at:70,key:'blue2', family:'blue',tier:2,energy:18,logo:2.6,electric:1.9,speed:1.1},
    {at:80,key:'blue3', family:'blue',tier:3,energy:28,logo:3, electric:2.3,speed:.88},
    {at:90,key:'silver',family:'silver',tier:1,energy:14,logo:2.5,electric:1.8,speed:.7},
    {at:95,key:'silver2',family:'silver',tier:2,energy:24,logo:3,electric:2.3,speed:.5},
    {at:100,key:'silver3',family:'silver',tier:3,energy:32,logo:3.5,electric:2.8,speed:.32}
  ];
  const bolts = [
    'M22 10 6 -8 12 20 -12 12 5 44',
    'M210 18 222 -12 232 12 258 -10 242 26 272 12 246 48',
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
    'M88 244 110 266 122 238',
    'M184 14 196 -10 210 8 218 -18 230 14',
    'M232 112 268 120 250 132 280 144',
    'M224 224 240 270 216 254 208 278',
    'M112 240 126 274 136 250 146 282',
    'M28 112 -10 104 8 126 -22 136',
    'M40 28 26 -14 48 6 62 -18',
    'M20 212 -18 224 4 240 -12 258',
    'M232 148 274 138 252 158 282 174'
  ];
  const state = {clicks:0, awake:false, settled:false};
  let source;
  if(!document.querySelector('link[href*="/crown-motion.css"]')){const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/crown-motion.css';document.head.append(sheet);}
  const query=new URL(location.href).searchParams;
  document.documentElement.dataset.siteTools=String(query.get('tools')==='1'||/^(localhost|127\.|10\.|192\.168\.)/.test(location.hostname));

  function paint() {
    const index=levels.findLastIndex(level=>state.clicks>=level.at);
    const level=levels[index],next=levels[index+1];
    const between=next?(state.clicks-level.at)/(next.at-level.at):1;
    const endEnergy=next?.family===level.family?next.energy:Math.min(bolts.length,level.energy+4);
    const energy=level.energy+(endEnergy-level.energy)*between;
    const color=palettes[level.family];
    const accent=state.awake?`hsl(${color.h} ${color.s}% ${color.l}%)`:'#72d6ff';
    document.documentElement.style.setProperty('--blue',accent);
    document.documentElement.style.setProperty('--red',state.awake?`hsl(${color.h} ${color.s}% ${Math.min(95,color.l+7)}%)`:'#ef6269');
    document.documentElement.style.setProperty('--primary-ink','#171717');
    document.documentElement.style.setProperty('--primary-icon-filter','brightness(0)');
    for(const svg of document.querySelectorAll('.crown-svg')) {
      svg.dataset.stage=state.awake?level.key:'original';
      svg.dataset.clicks=state.clicks;
      svg.dataset.family=level.family;svg.dataset.tier=level.tier;
      svg.dataset.awake=String(state.awake);
      svg.dataset.electric=String(state.awake&&(state.settled||state.clicks>0));
      svg.dataset.god=String(level.family!=='yellow');
      svg.style.setProperty('--crown-h',color.h);
      svg.style.setProperty('--crown-s',color.s+'%');
      svg.style.setProperty('--crown-l',color.l+'%');
      svg.style.setProperty('--crown-weight',1.25+level.tier*.35+between*.25);
      svg.style.setProperty('--crown-logo-glow',level.logo);
      svg.style.setProperty('--crown-electric-glow',level.electric);
      svg.style.setProperty('--crown-speed',level.speed*(1-between*.12)+'s');
      svg.querySelectorAll('.crown-arc').forEach((arc,i)=>arc.style.setProperty('--presence',Math.max(0,Math.min(1,energy-i))));
      svg.querySelectorAll('.crown-bolt,.crown-bolt-trail').forEach((path,i)=>{
        i=Math.floor(i/2);
        path.style.strokeDashoffset=100*(1-Math.max(0,Math.min(1,energy-i)));
      });
    }
  }
  function click() {
    if(!state.awake)setTimeout(()=>{state.settled=true;paint();},3000);
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
    svg.innerHTML=`<g transform="translate(16 22) scale(.828125)"><g class="crown-logo-echo">${source.mark}</g><rect class="crown-backplate" x="16" y="16" width="224" height="224"/><g class="crown-base">${source.mark}</g><g class="crown-powered">${source.mark}</g><g class="crown-energy">${bolts.map(d=>`<g class="crown-arc"><path class="crown-bolt-trail" pathLength="100" d="${d}"/><path class="crown-bolt" pathLength="100" d="${d}"/><path class="crown-spark" pathLength="100" d="${d}"/></g>`).join('')}</g></g>${source.words}`;
    // Energy stays behind the mark so dense silver trails cannot fill its cutouts.
    const energyLayer=svg.querySelector('.crown-energy');
    energyLayer.parentNode.insertBefore(energyLayer,svg.querySelector('.crown-backplate'));
    brand.querySelector('.brand-lockup').replaceWith(svg);
    brand.dataset.crownBound='true';
    brand.setAttribute('role','button');
    brand.setAttribute('aria-label','Impression King');
    brand.addEventListener('click',event=>event.preventDefault());
    brand.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key))event.preventDefault();});
    brand.addEventListener('keyup',event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();brand.click();}});
    paint();

  }
  document.addEventListener('click',event=>{if(!(event.target instanceof Element))return;const target=event.target;if(!state.awake&&!target.closest('.site-header .brand'))return;if(target.closest('button,a,input,select,textarea,summary,[role=button],[data-active],.g-small-callout'))click();});
  document.addEventListener('showcase:render',mount);
  fetch('/assets/brand/logo-horizontal.svg').then(response=>response.text()).then(text=>{
    const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
    const groups=[...svg.children].filter(element=>element.tagName==='g');
    source={mark:groups[0].innerHTML,words:groups.slice(1).map(element=>element.outerHTML).join('')};
    mount();
  });
})();
