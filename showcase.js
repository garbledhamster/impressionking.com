/* Impression King: one gallery, one persistent inquiry, original TikTok playback. */
(()=>{
 'use strict';
 const sections=['welcome','voices','beats','trailers','about','services'];
 const navItems=[...sections,'contact'];
 const email='jacob@impressionking.com';
 const params=new URL(location.href).searchParams;
 const compact=matchMedia('(max-width:700px), (orientation:landscape) and (max-height:600px)');
 const state={variant:'A',section:sections.includes(params.get('section'))?params.get('section'):'welcome',contact:false,category:'All',selected:null,service:'Voice work',context:'',videos:[],playing:false};
 const serviceNames={voices:'Voice work',beats:'Beat request',trailers:'Trailer voiceover',about:'General inquiry',services:'General inquiry'};
 const titles={welcome:'Home',voices:'Voices',beats:'Beats',trailers:'Trailers',about:'About',services:'Services',contact:'Contact'};
 const icons={welcome:'user-circle',voices:'microphone',beats:'musical-note',trailers:'play-circle',about:'user-circle',services:'squares-2x2',contact:'chat-bubble-left-right'};
 const art={welcome:'hoodie-welcome',voices:'hoodie-phone-wired-v2',beats:'hoodie-beats-table-v2',trailers:'hoodie-trailer-standing',about:'hoodie-profile'};
 const copy={voices:['Voice impressions.','Anime, games and cartoons. Hear Jacob’s voices and tell him what you have in mind.','Request a voice'],beats:['Music & beats.','Browse Jacob’s beats and remixes. Choose a track to include it in your request.','Request a beat'],trailers:['Trailer voiceovers.','Tell Jacob about the story, the tone and where your trailer will run.','Discuss a trailer']};
 const bio="I’m Jacob Williams, the voice impressionist and beatmaker behind Impression King. I’ve been creating content since 2007, and I love playing video games. As a legally blind creator, I use assistive technology and my ear for voices to make my videos. I listen to this community and do my best with your ideas and requests. Make yourself at home, and tell me what you’d like to hear next.";
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=n=>`<span class="g-icon" style="--g-icon:url('/assets/icons/${n}.svg')" aria-hidden="true"></span>`;
 const image=(name,cl='g-character')=>`<img class="${cl}" src="/assets/character/jacob-${art[name]}.webp" alt="${name==='about'?'Professional anime portrait of Jacob Williams':name==='beats'?'Jacob’s character making beats':name==='trailers'?'Jacob’s character recording at a studio microphone':'Jacob’s character recording with a phone and wired microphone'}" draggable="false">`;
 const root=document.querySelector('#app');
 if(!document.querySelector('link[href*="/showcase.css"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/showcase.css?v=hoodie-2';document.head.append(link);}
 document.body.className='gallery-study';document.body.dataset.layout=state.variant;
 document.documentElement.classList.add('gallery-document');
 document.querySelector('.prototype-bar')?.remove();document.querySelector('#theme-panel')?.remove();
 root.innerHTML=`<div class="g-shell"><header class="g-header site-header"><a class="brand" href="/" aria-label="Impression King"><img class="brand-lockup" src="/assets/brand/logo-horizontal.svg" alt="Impression King"><span class="g-brand-copy"><strong>Impression King</strong><span>Jacob Williams</span></span></a><a class="g-social" href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener">TikTok ${icon('arrow-top-right-on-square')}</a></header><main class="g-workspace" id="main" tabindex="-1"><nav class="g-picker" role="tablist" aria-label="Explore Jacob">${navItems.map((s,i)=>`<button type="button" class="${s==='contact'?'g-contact-open':''}" aria-label="${titles[s]}" data-help="${titles[s]}" role="tab" id="g-tab-${s}" data-section="${s}" aria-controls="${s==='contact'?'g-contact':'g-viewport'}" aria-selected="${s===state.section}" tabindex="${s===state.section?0:-1}">${icon(icons[s])}<span>${titles[s]}</span></button>`).join('')}</nav><section class="g-gallery" aria-label="Gallery"><header class="g-gallery-nav"><button id="g-prev" class="g-nav-button" type="button" aria-label="Previous section">${icon('arrow-left')}</button><p id="g-position" aria-live="polite"></p><button id="g-next" class="g-nav-button" type="button">Next ${icon('arrow-right')}</button></header><div class="g-viewport" id="g-viewport" role="tabpanel" aria-labelledby="g-tab-${state.section}"></div></section><aside class="g-contact" id="g-contact" role="tabpanel" aria-labelledby="g-tab-contact" aria-label="Contact Jacob" aria-hidden="true" inert hidden><div class="g-contact-top"><div><h2 tabindex="-1">Your project</h2><p>To <a href="mailto:${email}">${email}</a></p></div><button id="g-contact-close" class="g-nav-button" type="button" aria-label="Close contact form">${icon('x-mark')}</button></div><form id="g-form"><div class="g-form-body"><div class="g-identify"><label>Name<input name="name" id="g-name" autocomplete="name" required placeholder="Your name"></label><label>Email<input name="email" id="g-email" type="email" autocomplete="email" required placeholder="you@example.com"></label></div><label>Service<select id="g-service" name="service"><option>Voice work</option><option>Beat request</option><option>Trailer voiceover</option><option>General inquiry</option></select></label><div class="g-context" id="g-context" aria-live="polite">No sample selected.</div><label class="g-message-label">What do you have in mind?<textarea id="g-message" name="message" rows="5" placeholder="Tell Jacob about the project, timing and how you’ll use the recording." required></textarea></label></div><div class="g-form-actions"><button class="g-primary" type="submit">${icon('arrow-top-right-on-square')}Open email draft</button><button id="g-copy" class="g-copy" type="button">Copy draft</button><p id="g-form-note" role="status">Opens your mail app. Review and send there.</p></div></form></aside></main></div>`;
 const viewport=document.querySelector('#g-viewport'),form=document.querySelector('#g-form'),contact=document.querySelector('#g-contact');
 let oldCardTimer,lastPointer=null;
 const isBeat=v=>['beat','music'].includes(v.media_kind)||v.categories?.includes('Music');
 const available=()=>state.videos.filter(v=>state.section==='beats'?isBeat(v):!isBeat(v));
 function samples(){
  if(!['voices','beats'].includes(state.section))return '';
  const list=available().filter(v=>state.category==='All'||v.categories?.includes(state.category));
  const cats=state.section==='voices'?['All',...new Set(available().flatMap(v=>v.categories||[]))]:['All'];
  return `<div class="g-media-picker"><div class="g-media-head"><span>${state.section==='beats'?'Tracks':'Categories'}</span><div class="g-filters" aria-label="Filter samples">${cats.map(c=>`<button type="button" data-filter="${esc(c)}" aria-pressed="${c===state.category}">${esc(c)}</button>`).join('')}</div></div><div class="g-track-strip" role="region" aria-label="${state.section==='beats'?'Beat samples':'Voice samples'}" tabindex="0">${list.length?list.map(v=>`<button class="g-record" type="button" data-video="${v.id}" aria-label="Play ${esc(v.title)}" title="${esc(v.title)}" aria-pressed="${state.selected===v.id}"><span class="g-record-face"><svg class="g-record-orbit" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="ring-${v.id}" d="M18 72 A38 38 0 1 1 82 72"/></defs><text ${String(v.character||v.title).length>24?'textLength="205" lengthAdjust="spacingAndGlyphs"':''}><textPath href="#ring-${v.id}" startOffset="50%" text-anchor="middle">${esc(v.character||v.title)}</textPath></text></svg><span class="g-record-play">${icon('play')}</span></span><small>${esc(v.franchise||'Original')}</small></button>`).join(''):'<p class="g-empty">No samples in this selection.</p>'}</div></div>`;
 }
 function card(){
  if(state.section==='welcome')return `<article class="g-card g-feature g-welcome" data-active="true"><div class="g-callout"><div class="g-feature-copy"><p class="g-eyebrow">Jacob Williams · Impression King</p><h1>Voices. Characters. Beats.</h1><p>Hear Jacob’s impressions, explore his music, and tell him about your next project.</p><button class="g-primary" type="button" data-goto="voices">Hear the voices ${icon('arrow-right')}</button></div>${image('welcome')}</div></article>`;
  if(state.section==='services')return `<article class="g-card g-services" data-active="true"><div class="g-services-heading"><h1>Work with Jacob.</h1><p>Choose the part of your project you want to discuss.</p></div><div class="g-service-list">${['voices','beats','trailers'].map((s,i)=>`<section class="g-small-callout ${i%2?'g-reverse':''}">${image(s)}<div><h2>${titles[s]==='Voices'?'Voice work':titles[s]==='Beats'?'Music & beats':'Trailer voiceovers'}</h2><p>${s==='voices'?'Characters, greetings and voiceovers.':s==='beats'?'Beats, remixes and instrumentals.':'A voice for your next trailer.'}</p><button class="g-text-action" type="button" data-request="${s}">${copy[s][2]} ${icon('arrow-right')}</button></div></section>`).join('')}</div></article>`;
  if(state.section==='about')return `<article class="g-card g-about" data-active="true"><div class="g-about-image">${image('about')}</div><div class="g-about-copy"><div class="g-about-heading"><h1>Jacob Williams.</h1><p class="g-handle">Impression King</p></div><p class="g-bio">${bio}</p><div class="g-about-actions"><button class="g-primary" type="button" data-request="about">Talk to Jacob ${icon('arrow-right')}</button><a href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener">TikTok ${icon('arrow-top-right-on-square')}</a></div></div></article>`;
  const [title,description,cta]=copy[state.section];
  return `<article class="g-card g-feature" data-active="true"><div class="g-callout"><div class="g-feature-copy"><h1>${title}</h1><p>${description}</p><button class="g-primary" type="button" data-request="${state.section}">${cta} ${icon('arrow-right')}</button></div>${image(state.section)}</div>${state.section==='trailers'?`<div class="g-trailer-options" aria-label="Trailer request types">${['Game trailer','Channel intro','Short film'].map(t=>`<button type="button" data-trailer="${t}">${t} ${icon('arrow-right')}</button>`).join('')}</div>`:`<div id="g-samples">${samples()}</div>`}</article>`;
 }
 function syncContext(){document.querySelector('#g-service').value=state.service;document.querySelector('#g-context').textContent=state.context?'Selected: '+state.context:'No sample selected. You can describe your project below.';}
 function updateNavigation(){
  document.querySelectorAll('.g-picker [data-section]').forEach(b=>{const selected=b.dataset.section===(state.contact?'contact':state.section);b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
  viewport.setAttribute('aria-labelledby','g-tab-'+state.section);document.querySelector('#g-position').textContent=titles[state.section]+' · '+(sections.indexOf(state.section)+1)+' / '+sections.length;
  const u=new URL(location.href);u.searchParams.delete('study');u.searchParams.delete('variant');u.searchParams.set('section',state.contact?'contact':state.section);history.replaceState(null,'',u);
 }
 function stopPlayer(){window.CreatorPlayer?.close();}
 function navigate(section,direction=1){
  if(state.contact)hideContact(false);
  if(state.section===section&&viewport.children.length)return;
  stopPlayer();
  state.section=section;state.category='All';
  clearTimeout(oldCardTimer);viewport.querySelectorAll('.g-leaving').forEach(n=>n.remove());
  const old=viewport.querySelector('[data-active]');if(old){old.removeAttribute('data-active');old.classList.add('g-leaving');old.inert=true;old.setAttribute('aria-hidden','true');old.style.setProperty('--direction',direction);}
  viewport.insertAdjacentHTML('beforeend',card());const current=viewport.querySelector('[data-active]');current.style.setProperty('--direction',direction);if(old)current.classList.add('g-entering');requestAnimationFrame(fitArt);document.dispatchEvent(new Event('creator:card'));
  oldCardTimer=setTimeout(()=>{old?.remove();current.classList.remove('g-entering');},420);updateNavigation();
 }
 function next(step=1){navigate(sections[(sections.indexOf(state.section)+step+sections.length)%sections.length],step);}
 let contactOpener=null,contactFrame=0;
 function revealContactField(){
  if(!compact.matches||!contact.classList.contains('g-open'))return;
  const field=document.activeElement;if(!form.contains(field)||!field.matches('input,select,textarea'))return;
  const box=field.getBoundingClientRect(),view=form.getBoundingClientRect(),padding=12;
  if(box.top<view.top+padding)form.scrollTop+=box.top-view.top-padding;
  else if(box.bottom>view.bottom-padding)form.scrollTop+=Math.min(box.bottom-view.bottom+padding,box.top-view.top-padding);
 }
 function fitContact(reveal=true){
  const visual=window.visualViewport,workspace=document.querySelector('.g-workspace');
  workspace.style.setProperty('--visible-height',(visual?.height||innerHeight)+'px');
  workspace.style.setProperty('--visible-top',(visual?.offsetTop||0)+'px');
  workspace.style.setProperty('--visible-left',(visual?.offsetLeft||0)+'px');
  workspace.style.setProperty('--visible-width',(visual?.width||innerWidth)+'px');
  workspace.dataset.shortContact=String((visual?.height||innerHeight)<420);
  contact.style.setProperty('--contact-height',Math.max(120,(visual?.height||innerHeight)-56)+'px');
  if(reveal){cancelAnimationFrame(contactFrame);contactFrame=requestAnimationFrame(revealContactField);}
 }
 function showContact(focusHeading=true){
  if(state.contact)return;contactOpener=document.activeElement;window.CreatorPlayer.close();state.contact=true;
  document.querySelector('.g-workspace').classList.add('contact-open');contact.hidden=false;contact.getBoundingClientRect();contact.classList.add('g-open');contact.inert=false;contact.setAttribute('aria-hidden','false');
  document.querySelector('.g-contact-open').setAttribute('aria-expanded','true');document.querySelector('.g-gallery').inert=true;document.querySelector('.g-header').inert=compact.matches;
  fitContact();updateNavigation();if(focusHeading){contact.getBoundingClientRect();Promise.allSettled(contact.getAnimations().map(animation=>animation.finished)).then(()=>{if(state.contact&&!contact.contains(document.activeElement))contact.querySelector('h2').focus({preventScroll:true});});}
 }
 function hideContact(restoreFocus=true){
  state.contact=false;document.querySelector('.g-workspace').classList.remove('contact-open');contact.classList.remove('g-open');contact.inert=true;contact.setAttribute('aria-hidden','true');document.querySelector('.g-gallery').inert=false;document.querySelector('.g-header').inert=false;
  document.querySelector('.g-contact-open').setAttribute('aria-expanded','false');updateNavigation();contact.getBoundingClientRect();Promise.allSettled(contact.getAnimations().map(animation=>animation.finished)).then(()=>{if(!state.contact)contact.hidden=true;});
  if(restoreFocus){document.activeElement?.blur();const target=contactOpener?.isConnected?contactOpener:document.querySelector('.g-contact-open');target.focus({preventScroll:true});}
 }
 form.addEventListener('focusin',()=>fitContact(true));

 function setService(service){if(service!==state.service){state.selected=null;state.context='';}state.service=service;}
 function request(section,context){setService(serviceNames[section]);if(context!==undefined)state.context=context;syncContext();showContact();}
 function chooseVideo(id){
  const video=state.videos.find(v=>v.id===id);if(!video)return;
  state.selected=id;state.context=(video.character||video.title)+(video.franchise?' · '+video.franchise:'');state.service=serviceNames[state.section];syncContext();
  if(state.playing&&window.CreatorPlayer.isCurrent(id))window.CreatorPlayer.stop();else if(!window.CreatorPlayer.toggle(id))window.CreatorPlayer.open(video,available());
  
 }
 function mail(){
  const name=form.elements.name.value.trim(),reply=form.elements.email.value.trim(),message=form.elements.message.value.trim();
  const subject=`${state.service}${state.context?' — '+state.context:''}`;
  const body=`Hi Jacob,\r\n\r\nI’d like to discuss ${state.service.toLowerCase()}.\r\n\r\nName: ${name}\r\nReply email: ${reply}\r\nService: ${state.service}\r\n${state.context?'Reference: '+state.context+'\r\n':''}\r\nProject details:\r\n${message}\r\n\r\nThanks,\r\n${name}`;
  return {subject,body,href:`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
 }
 document.querySelectorAll('.g-picker [data-section]').forEach(button=>button.addEventListener('click',()=>button.dataset.section==='contact'?showContact():navigate(button.dataset.section)));
 document.querySelector('.g-picker').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const i=navItems.indexOf(state.contact?'contact':state.section),index=e.key==='Home'?0:e.key==='End'?navItems.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+navItems.length)%navItems.length;const section=navItems[index];if(section==='contact')showContact(false);else navigate(section);document.querySelector('#g-tab-'+section).focus({preventScroll:true});});
 document.querySelector('#g-next').onclick=()=>next(1);document.querySelector('#g-prev').onclick=()=>next(-1);
 viewport.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.goto)navigate(b.dataset.goto);else if(b.dataset.request)request(b.dataset.request);else if(b.dataset.trailer)request('trailers',b.dataset.trailer);else if(b.dataset.video)chooseVideo(b.dataset.video);else if(b.dataset.filter){state.category=b.dataset.filter;document.querySelector('#g-samples').innerHTML=samples();}});
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.g-media-picker'))return;lastPointer={x:e.clientX,y:e.clientY};});viewport.addEventListener('pointerup',e=>{if(!lastPointer)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;lastPointer=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)next(dx<0?1:-1);});
 document.querySelector('.g-contact-open').onclick=showContact;document.querySelector('#g-contact-close').onclick=hideContact;
 document.querySelector('#g-service').onchange=e=>{setService(e.target.value);syncContext();};
 form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const draft=mail();document.querySelector('#g-form-note').textContent='Your email app opens a draft. Review it and send there.';location.href=draft.href;};
 document.querySelector('#g-copy').onclick=async()=>{const draft=mail();const text=`To: ${email}\nSubject: ${draft.subject}\n\n${draft.body}`;try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const temp=document.createElement('textarea');temp.value=text;document.body.append(temp);temp.select();document.execCommand('copy');temp.remove();}document.querySelector('#g-form-note').textContent='Draft copied.';}catch{document.querySelector('#g-form-note').textContent='Select your message to copy it, or open the email draft.';}};

 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&contact.classList.contains('g-open'))hideContact();});
 function fitArt(){viewport.querySelectorAll('.g-callout').forEach(card=>{const copy=card.querySelector('.g-feature-copy');if(copy)card.style.setProperty('--copy-height',copy.getBoundingClientRect().height+'px');});}
 document.fonts.ready.then(fitArt);
 function fit(){document.querySelector('.g-header').inert=state.contact&&compact.matches;requestAnimationFrame(fitArt);fitContact();document.documentElement.style.setProperty('--g-height',innerHeight+'px');}
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',()=>fitContact(true));window.visualViewport?.addEventListener('scroll',()=>fitContact(false));fit();
 state.service=serviceNames[state.section]||'General inquiry';syncContext();viewport.innerHTML=card();updateNavigation();document.dispatchEvent(new Event('showcase:render'));
 fetch('/data/catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).then(data=>{state.videos=data.videos||[];const target=document.querySelector('#g-samples');if(target)target.innerHTML=samples();}).catch(()=>{const target=document.querySelector('#g-samples');if(target)target.innerHTML='<p class="g-empty">Samples could not load. You can still contact Jacob.</p>';});
 document.addEventListener('creator:selection',e=>{const video=e.detail;state.selected=video.id;state.service=isBeat(video)?serviceNames.beats:serviceNames.voices;state.context=(video.character||video.title)+(video.franchise?' · '+video.franchise:'');syncContext();});
 document.addEventListener('creator:playback',e=>{
  state.playing=e.detail.playing;
  viewport.querySelectorAll('[data-video]').forEach(button=>{const active=button.dataset.video===e.detail.id,playing=active&&e.detail.playing;button.dataset.playing=String(playing);button.setAttribute('aria-pressed',String(active));button.querySelector('.g-record-play').innerHTML=icon(playing?'stop':'play');button.setAttribute('aria-label',(playing?'Stop ':'Play ')+(state.videos.find(v=>v.id===button.dataset.video)?.title||'sample'));});
 });
 if(params.get('section')==='contact')showContact();
 window.ImpressionKing={getState:()=>({...state}),getDraft:mail};
})();
