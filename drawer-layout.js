/* Contact and video share one measured drawer frame and one mobile navigation stage. */
(()=>{
 'use strict';
 if(!document.querySelector('link[href*="drawer-shell.css"]')){const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/drawer-shell.css?v=drawer-10';sheet.onload=()=>document.documentElement.dataset.drawerReady='true';document.head.append(sheet);}
 const root=document.documentElement,contact=document.querySelector('#g-contact'),player=document.querySelector('#g-player'),workspace=document.querySelector('.g-workspace'),nav=document.querySelector('.g-picker');
 const compact=matchMedia('(max-width:700px), (orientation:landscape) and (max-height:600px)');
 const grip=document.createElement('button');grip.id='g-contact-handle';grip.className='g-player-handle g-contact-handle';grip.type='button';grip.setAttribute('aria-label','Hide contact');grip.innerHTML='<span></span>';contact.prepend(grip);
 let frame=0,lastTop=64,reveal=false;
 function layout(){
  const vv=window.visualViewport,vh=vv?.height||innerHeight,vw=vv?.width||innerWidth,top=vv?.offsetTop||0,left=vv?.offsetLeft||0;
  const active=contact.classList.contains('g-open')||(!player.hidden&&player.dataset.open==='true');
  document.body.classList.toggle('g-drawer-open',active);document.querySelector('.g-header').inert=active&&compact.matches;
  workspace.style.setProperty('--visible-height',vh+'px');workspace.style.setProperty('--visible-top',top+'px');workspace.style.setProperty('--visible-left',left+'px');workspace.style.setProperty('--visible-width',vw+'px');
  const width=Math.min(390,vw-24);
  if(compact.matches){if(active)lastTop=nav.getBoundingClientRect().bottom;else lastTop=top+56;}
  const height=compact.matches?Math.max(120,vh-(lastTop-top)-20):Math.min(900,vh-24);
  const y=compact.matches?lastTop+8:top+(vh-height)/2;
  for(const[key,value]of Object.entries({left:left+(vw-width)/2,top:y,width,height,travel:top+vh-y-44}))root.style.setProperty('--shared-drawer-'+key,value+'px');
  contact.style.setProperty('--contact-height',height+'px');if(reveal&&contact.classList.contains('g-open'))requestAnimationFrame(()=>window.ImpressionKing.revealContactField());reveal=false;
 }
 function schedule(revealField=false){reveal=reveal||revealField;cancelAnimationFrame(frame);frame=requestAnimationFrame(layout);}
 new MutationObserver(()=>schedule(false)).observe(contact,{attributes:true,attributeFilter:['class','hidden']});
 new MutationObserver(()=>schedule(false)).observe(player,{attributes:true,attributeFilter:['data-open','hidden']});
 window.addEventListener('resize',()=>schedule(true));window.visualViewport?.addEventListener('resize',()=>schedule(true));window.visualViewport?.addEventListener('scroll',()=>schedule(false));
 let start=null,dragged=false;
 grip.addEventListener('pointerdown',event=>{start=event.clientY;dragged=false;grip.setPointerCapture(event.pointerId);});
 grip.addEventListener('pointermove',event=>{if(start!==null&&Math.abs(event.clientY-start)>10)dragged=true;});
 grip.addEventListener('pointerup',event=>{if(start===null)return;const delta=event.clientY-start;start=null;if(dragged&&delta>40)window.ImpressionKing.closeContact();if(grip.hasPointerCapture(event.pointerId))grip.releasePointerCapture(event.pointerId);});
 grip.addEventListener('pointercancel',()=>{start=null;dragged=false;});grip.onclick=()=>{if(dragged){dragged=false;return;}window.ImpressionKing.closeContact();};
 if(window.tippy)tippy(grip,{content:'Hide contact',theme:'joe',allowHTML:false,appendTo:()=>document.body,trigger:'mouseenter focus',touch:['hold',450],delay:[250,0],duration:[120,80]});
 layout();if(document.querySelector('link[href*="drawer-shell.css"]')?.sheet)root.dataset.drawerReady='true';
})();
