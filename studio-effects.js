/* Shared power materials and small, bounded interaction effects. No image variants. */
(()=>{
 'use strict';
 if(!document.querySelector('link[href*="studio-experience.css"]')){const sheet=document.createElement('link');sheet.addEventListener('load',()=>document.documentElement.dataset.experienceReady='true',{once:true});sheet.rel='stylesheet';sheet.href='/studio-experience.css?v=nav-logo-12';document.head.append(sheet);}
 // Chroma keys the saturated orange fabric; neutral equipment and skin stay original.
 // Both channel tests must match. Source alpha clips the result at the real cutout edge.
 const filters=document.createElementNS('http://www.w3.org/2000/svg','svg');
 filters.setAttribute('aria-hidden','true');filters.classList.add('g-material-defs');
 filters.innerHTML=`<defs><filter id="hoodie-power" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
 <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  8 -14.4 0 0 -.12" result="orangeHue"/>
 <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.52 0 -7 0 -.03" result="orangeChroma"/>
 <feComposite in="orangeHue" in2="orangeChroma" operator="in" result="fabric"/>
 <feComposite in="fabric" in2="SourceAlpha" operator="in" result="clothMask"/>
 <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="shade"/>
 <feComponentTransfer in="shade" result="litShade"><feFuncR type="linear" slope="1.7" intercept=".04"/><feFuncG type="linear" slope="1.7" intercept=".04"/><feFuncB type="linear" slope="1.7" intercept=".04"/></feComponentTransfer>
 <feFlood class="g-fabric-color" flood-color="white" result="powerColor"/>
 <feBlend in="litShade" in2="powerColor" mode="multiply" result="tintedFabric"/>
 <feComposite in="tintedFabric" in2="clothMask" operator="in" result="newFabric"/>
 <feComposite in="SourceGraphic" in2="fabric" operator="out" result="untouched"/>
 <feComposite in="untouched" in2="newFabric" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
 </filter></defs>`;
 document.body.prepend(filters);
 const observed=new Set(),visible=new Set(),motion=matchMedia('(prefers-reduced-motion:reduce)');
 function syncEnergy(button){
  const svg=button.querySelector('.g-action-energy');if(!svg)return;
  const speed=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--energy-speed'))||4.2;
  const previous=Number(svg.dataset.speed)||speed;
  if(previous!==speed){const time=svg.getCurrentTime();svg.querySelectorAll('animate').forEach(a=>a.setAttribute('dur',speed+'s'));svg.setCurrentTime(time/previous*speed);}
  svg.dataset.speed=String(speed);
  const running=document.documentElement.dataset.powered==='true'&&!motion.matches&&!document.hidden&&visible.has(button)&&!button.closest('[hidden],[inert],.g-leaving')&&getComputedStyle(button).visibility==='visible';
  svg.dataset.paused=String(!running);
  if(running)svg.unpauseAnimations();else{svg.pauseAnimations();if(motion.matches||document.documentElement.dataset.powered!=='true')svg.setCurrentTime(0);}
 }
 function syncAll(){observed.forEach(syncEnergy);}
 function drawEnergy(button){
  const svg=button.querySelector('.g-action-energy');if(!svg)return;
  const {width,height}=button.getBoundingClientRect();if(width<1||height<1)return;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  function geometry(phase,spread=1){
   const outset=4,w=width+outset*2,h=height+outset*2,spike=Math.min(11,height*.24),points=[];let edgeIndex=0;
   function edge(length,map){
    const count=Math.max(1,Math.round(length/36)),step=length/count;
    for(let i=0;i<count;i++){
     const start=i*step,wave=.65+.7*(.5+.5*Math.sin(phase-i*.9+edgeIndex*.7)),lean=Math.sin(phase-i*.6+edgeIndex)*.08;
     for(const [along,away]of[[0,0],[.22,1],[.12,spike*.7],[.48,spike*.2],[.34,spike],[.78,0],[1,0]]){
      const drift=along>0&&along<1?lean*Math.min(1,away/spike):0;
      points.push(map(start+(along+drift)*step,away*(.7+((i*7+edgeIndex*3)%5)*.075)*wave*spread));
     }
    }
    edgeIndex++;
   }
   edge(w,(x,n)=>[x-outset,-outset-n]);edge(h,(y,n)=>[width+outset+n,y-outset]);
   edge(w,(x,n)=>[width+outset-x,height+outset+n]);edge(h,(y,n)=>[-outset-n,height+outset-y]);
   return points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ')+' Z';
  }
  const speed=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--energy-speed'))||4.2;
  svg.querySelectorAll('path').forEach(path=>{
   const echo=path.classList.contains('g-action-wave'),offset=echo ? .9 : 0;
   const values=Array.from({length:9},(_,i)=>geometry(i*Math.PI/4+offset,echo?1.12:1));
   path.setAttribute('d',values[0]);let animate=path.querySelector('animate');
   if(!animate){animate=document.createElementNS('http://www.w3.org/2000/svg','animate');animate.setAttribute('attributeName','d');animate.setAttribute('repeatCount','indefinite');animate.setAttribute('calcMode','linear');path.append(animate);}
   animate.setAttribute('values',values.join(';'));animate.setAttribute('dur',speed+'s');
  });
  svg.dataset.speed=String(speed);syncEnergy(button);
 }
 const resizeEnergy=new ResizeObserver(entries=>entries.forEach(entry=>drawEnergy(entry.target)));
 const intersectionEnergy=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);syncEnergy(entry.target);}));
 new MutationObserver(syncAll).observe(document.documentElement,{attributes:true,attributeFilter:['style','data-powered']});
 new MutationObserver(syncAll).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',syncAll);motion.addEventListener('change',syncAll);
 function decorate(){
  for(const button of observed)if(!button.isConnected){resizeEnergy.unobserve(button);intersectionEnergy.unobserve(button);observed.delete(button);visible.delete(button);}
  document.querySelectorAll('.g-header-actions .g-primary').forEach(button=>{
   if(button.querySelector('.g-action-energy'))return;
   button.insertAdjacentHTML('beforeend','<svg class="g-action-energy" aria-hidden="true"><path class="g-action-wave" pathLength="100"/><path class="g-action-trail" pathLength="100"/><path class="g-action-bolt" pathLength="100"/><path class="g-action-spark" pathLength="100"/></svg>');
   observed.add(button);resizeEnergy.observe(button);intersectionEnergy.observe(button);drawEnergy(button);
  });
 }
 function navigationHelp(){
  if(!window.tippy)return;
  document.querySelectorAll('.g-picker [data-section]').forEach(button=>{
   if(button.dataset.navTip)return;button.dataset.navTip='true';
   const tip=tippy(button,{onShow(){return button.getAttribute('aria-selected')!=='true';},content:button.getAttribute('aria-label'),theme:'joe nav',allowHTML:false,placement:'bottom',appendTo:()=>document.body,popperOptions:{strategy:'fixed'},offset:[0,8],animation:'nav-pop',duration:[180,100],delay:[80,0],trigger:'mouseenter focus',touch:false,hideOnClick:true,aria:{content:'describedby',expanded:false}});
   let timer=null,held=false;
   button.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')return;held=false;timer=setTimeout(()=>{held=true;tip.show();},450);});
   for(const event of['pointerup','pointercancel','pointerleave'])button.addEventListener(event,()=>clearTimeout(timer));
   button.addEventListener('click',event=>{if(!held)return;held=false;event.preventDefault();event.stopImmediatePropagation();tip.show();setTimeout(()=>tip.hide(),1600);},true);
  });
 }
 for(const[id,label]of Object.entries({'g-prev':'Previous section','g-next':'Next section'})){const button=document.getElementById(id);if(window.tippy&&button&&!button._tippy)tippy(button,{content:label,theme:'joe',allowHTML:false,appendTo:()=>document.body,trigger:'mouseenter focus',touch:['hold',450],delay:[250,0],duration:[120,80]});}
 decorate();navigationHelp();if(document.querySelector('link[href*="studio-experience.css"]')?.sheet)document.documentElement.dataset.experienceReady='true';
 document.addEventListener('creator:card',decorate);
 document.addEventListener('showcase:render',()=>{decorate();navigationHelp();});
})();
