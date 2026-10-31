/* Shared power materials and small, bounded interaction effects. No image variants. */
(()=>{
 'use strict';
 if(!document.querySelector('link[href*="studio-experience.css"]')){const sheet=document.createElement('link');sheet.addEventListener('load',()=>document.documentElement.dataset.experienceReady='true',{once:true});sheet.rel='stylesheet';sheet.href='/studio-experience.css?v=energy-9';document.head.append(sheet);}
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
 const observed=new Set();
 function drawEnergy(button){
  const svg=button.querySelector('.g-action-energy');if(!svg)return;
  const {width,height}=button.getBoundingClientRect();if(width<1||height<1)return;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const outset=4,w=width+outset*2,h=height+outset*2,spike=Math.min(11,height*.24),points=[];let edgeIndex=0;
  // Each edge has the same sharp, backtracking branches as the crown, in actual pixels.
  function edge(length,map){
   const count=Math.max(1,Math.round(length/36)),step=length/count;
   for(let i=0;i<count;i++){
    const start=i*step;
    for(const [along,away]of[[0,0],[.22,1],[.12,spike*.7],[.48,spike*.2],[.34,spike],[.78,0],[1,0]])points.push(map(start+along*step,away*(.7+((i*7+edgeIndex*3)%5)*.075)));
   }
   edgeIndex++;
  }
  edge(w,(x,n)=>[x-outset,-outset-n]);
  edge(h,(y,n)=>[width+outset+n,y-outset]);
  edge(w,(x,n)=>[width+outset-x,height+outset+n]);
  edge(h,(y,n)=>[-outset-n,height+outset-y]);
  const d=points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ')+' Z';
  svg.querySelectorAll('path').forEach(path=>path.setAttribute('d',d));
 }
 const resizeEnergy=new ResizeObserver(entries=>entries.forEach(entry=>drawEnergy(entry.target)));
 function decorate(){
  for(const button of observed)if(!button.isConnected){resizeEnergy.unobserve(button);observed.delete(button);}
  document.querySelectorAll('.g-primary,.g-text-action').forEach(button=>{
   if(button.querySelector('.g-action-energy'))return;
   button.insertAdjacentHTML('beforeend','<svg class="g-action-energy" aria-hidden="true"><path class="g-action-trail" pathLength="100"/><path class="g-action-bolt" pathLength="100"/><path class="g-action-spark" pathLength="100"/></svg>');
   observed.add(button);resizeEnergy.observe(button);drawEnergy(button);
  });
 }
 function navigationHelp(){
  if(!window.tippy)return;
  document.querySelectorAll('.g-picker [data-section]').forEach(button=>{
   if(button.dataset.navTip)return;button.dataset.navTip='true';
   const tip=tippy(button,{content:button.getAttribute('aria-label'),theme:'joe nav',allowHTML:false,placement:'bottom',appendTo:()=>document.body,popperOptions:{strategy:'fixed'},offset:[0,8],animation:'nav-pop',duration:[180,100],delay:[80,0],trigger:'mouseenter focus',touch:false,hideOnClick:true,aria:{content:'describedby',expanded:false}});
   let timer=null,held=false;
   button.addEventListener('pointerdown',event=>{if(event.pointerType!=='touch')return;held=false;timer=setTimeout(()=>{held=true;tip.show();},450);});
   for(const event of['pointerup','pointercancel','pointerleave'])button.addEventListener(event,()=>clearTimeout(timer));
   button.addEventListener('click',event=>{if(!held)return;held=false;event.preventDefault();event.stopImmediatePropagation();tip.show();setTimeout(()=>tip.hide(),1600);},true);
  });
 }
 decorate();navigationHelp();if(document.querySelector('link[href*="studio-experience.css"]')?.sheet)document.documentElement.dataset.experienceReady='true';
 document.addEventListener('creator:card',decorate);
 document.addEventListener('showcase:render',()=>{decorate();navigationHelp();});
})();
