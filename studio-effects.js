/* Shared power materials and small, bounded interaction effects. No image variants. */
(()=>{
 'use strict';
 if(!document.querySelector('link[href*="studio-experience.css"]')){const sheet=document.createElement('link');sheet.addEventListener('load',()=>document.documentElement.dataset.experienceReady='true',{once:true});sheet.rel='stylesheet';sheet.href='/studio-experience.css?v=experience-8';document.head.append(sheet);}
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
 const energy=`<svg class="g-action-energy" viewBox="0 0 160 48" preserveAspectRatio="none" aria-hidden="true"><path pathLength="100" d="M-3 16 -5 10 2 6 -2 1 15 -2 21 2 35 -1 M125 -2 132 1 145 -2 159 1 156 7 164 11 M164 30 158 34 163 42 149 47 139 44 126 49 M34 49 25 45 13 49 2 45 6 38 -4 34"/></svg>`;
 function decorate(){document.querySelectorAll('.g-primary,.g-text-action').forEach(button=>{if(!button.querySelector('.g-action-energy'))button.insertAdjacentHTML('beforeend',energy);});}
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
