/* Impression King: one gallery, one persistent inquiry, original TikTok playback. */
(()=>{
 'use strict';
 const sections=['welcome','voices','beats','trailers','about','services'];
 const email='jacob@impressionking.com';
 const params=new URL(location.href).searchParams;
 const compact=matchMedia('(max-width:700px), (orientation:landscape) and (max-height:600px)');
 const state={variant:'A',section:sections.includes(params.get('section'))?params.get('section'):'welcome',category:'All',selected:null,service:'Voice work',context:'',videos:[],playing:false};
 const serviceNames={voices:'Voice work',beats:'Beat request',trailers:'Trailer voiceover',about:'General inquiry',services:'General inquiry'};
 const titles={welcome:'Home',voices:'Voices',beats:'Beats',trailers:'Trailers',about:'About',services:'Services'};
 const icons={welcome:'user-circle',voices:'microphone',beats:'musical-note',trailers:'play-circle',about:'user-circle',services:'squares-2x2'};
 const art={welcome:'hoodie-welcome',voices:'hoodie-phone-wired-v2',beats:'hoodie-beats-table-v2',trailers:'hoodie-trailer-standing',about:'hoodie-profile'};
 const copy={voices:['Voice impressions.','Anime, games and cartoons. Hear Jacob’s voices and tell him what you have in mind.','Request a voice'],beats:['Music & beats.','Browse Jacob’s beats and remixes. Choose a track to include it in your request.','Request a beat'],trailers:['Trailer voiceovers.','Tell Jacob about the story, the tone and where your trailer will run.','Discuss a trailer']};
 const bio='Jacob Williams, known online as Impression King, makes character impressions, voice recordings and beats. Anime, games and cartoons inspire his performances. He shares his work on TikTok and welcomes inquiries about character recordings, voiceovers and trailers.';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=n=>`<span class="g-icon" style="--g-icon:url('/assets/icons/${n}.svg')" aria-hidden="true"></span>`;
 const image=(name,cl='g-character')=>`<img class="${cl}" src="/assets/character/jacob-${art[name]}.webp" alt="${name==='about'?'Professional anime portrait of Jacob Williams':name==='beats'?'Jacob’s character making beats':name==='trailers'?'Jacob’s character recording at a studio microphone':'Jacob’s character recording with a phone and wired microphone'}" draggable="false">`;
 const root=document.querySelector('#app');
 if(!document.querySelector('link[href*="/showcase.css"]')){const link=document.createElement('link');link.rel='stylesheet';link.href='/showcase.css?v=hoodie-2';document.head.append(link);}
 document.body.className='gallery-study';document.body.dataset.layout=state.variant;
 document.documentElement.classList.add('gallery-document');
 document.querySelector('.prototype-bar')?.remove();document.querySelector('#theme-panel')?.remove();
 root.innerHTML=`<div class="g-shell"><header class="g-header site-header"><a class="brand" href="/" aria-label="Impression King"><img class="brand-lockup" src="/assets/brand/logo-horizontal.svg" alt="Impression King"><small>Jacob Williams</small></a><a class="g-social" href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener">TikTok ${icon('arrow-top-right-on-square')}</a><button class="g-contact-open" type="button">${icon('chat-bubble-left-right')}<span>Contact</span></button></header><main class="g-workspace" id="main" tabindex="-1"><nav class="g-picker" role="tablist" aria-label="Explore Jacob">${sections.map((s,i)=>`<button type="button" role="tab" id="g-tab-${s}" data-section="${s}" aria-controls="g-viewport" aria-selected="${s===state.section}" tabindex="${s===state.section?0:-1}">${icon(icons[s])}<span>${titles[s]}</span></button>`).join('')}</nav><section class="g-gallery" aria-label="Gallery"><div class="g-viewport" id="g-viewport" role="tabpanel" aria-labelledby="g-tab-${state.section}"></div><footer class="g-gallery-nav"><button id="g-prev" class="g-nav-button" type="button" aria-label="Previous section">${icon('arrow-left')}</button><p id="g-position" aria-live="polite"></p><button id="g-next" class="g-nav-button" type="button">Next ${icon('arrow-right')}</button></footer></section><aside class="g-contact" id="g-contact" aria-label="Contact Jacob"><div class="g-contact-top"><div><h2>Your project</h2><p>To <a href="mailto:${email}">${email}</a></p></div><button id="g-contact-close" class="g-nav-button" type="button" aria-label="Close contact form">${icon('x-mark')}</button></div><form id="g-form"><div class="g-form-body"><div class="g-identify"><label>Name<input name="name" id="g-name" autocomplete="name" required placeholder="Your name"></label><label>Email<input name="email" id="g-email" type="email" autocomplete="email" required placeholder="you@example.com"></label></div><label>Service<select id="g-service" name="service"><option>Voice work</option><option>Beat request</option><option>Trailer voiceover</option><option>General inquiry</option></select></label><div class="g-context" id="g-context" aria-live="polite">No sample selected.</div><label class="g-message-label">What do you have in mind?<textarea id="g-message" name="message" rows="5" placeholder="Tell Jacob about the project, timing and how you’ll use the recording." required></textarea></label></div><div class="g-form-actions"><button class="g-primary" type="submit">${icon('arrow-top-right-on-square')}Open email draft</button><button id="g-copy" class="g-copy" type="button">Copy draft</button><p id="g-form-note" role="status">Opens your mail app. Review and send there.</p></div></form></aside></main></div>`;
 const viewport=document.querySelector('#g-viewport'),form=document.querySelector('#g-form'),contact=document.querySelector('#g-contact');
 let oldCardTimer,lastPointer=null;
 const isBeat=v=>['beat','music'].includes(v.media_kind)||v.categories?.includes('Music');
 const available=()=>state.videos.filter(v=>state.section==='beats'?isBeat(v):!isBeat(v));
 function samples(){
  if(!['voices','beats'].includes(state.section))return '';
  const list=available().filter(v=>state.category==='All'||v.categories?.includes(state.category));
  const cats=state.section==='voices'?['All',...new Set(available().flatMap(v=>v.categories||[]))]:['All'];
  return `<div class="g-media-picker"><div class="g-media-head"><span>${state.section==='beats'?'Tracks':'Characters'}</span><div class="g-filters" aria-label="Filter samples">${cats.map(c=>`<button type="button" data-filter="${esc(c)}" aria-pressed="${c===state.category}">${esc(c)}</button>`).join('')}</div></div><div class="g-track-strip" role="region" aria-label="${state.section==='beats'?'Beat samples':'Voice samples'}" tabindex="0">${list.length?list.map(v=>`<button class="g-record" type="button" data-video="${v.id}" aria-label="Play ${esc(v.title)}" title="${esc(v.title)}" aria-pressed="${state.selected===v.id}"><span class="g-record-face"><svg class="g-record-orbit" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="ring-${v.id}" d="M18 72 A38 38 0 1 1 82 72"/></defs><text><textPath href="#ring-${v.id}" startOffset="50%" text-anchor="middle">${esc(v.character||v.title)}</textPath></text></svg><span class="g-record-play">${icon('play')}</span></span><small>${esc(v.franchise||'Original')}</small></button>`).join(''):'<p class="g-empty">No samples in this selection.</p>'}</div></div>`;
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
  document.querySelectorAll('.g-picker [data-section]').forEach(b=>{const selected=b.dataset.section===state.section;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
  viewport.setAttribute('aria-labelledby','g-tab-'+state.section);document.querySelector('#g-position').textContent=titles[state.section]+' · '+(sections.indexOf(state.section)+1)+' / '+sections.length;
  const u=new URL(location.href);u.searchParams.delete('study');u.searchParams.delete('variant');u.searchParams.set('section',state.section);history.replaceState(null,'',u);
 }
 function stopPlayer(){window.CreatorPlayer?.close();}
 function navigate(section,direction=1){
  if(state.section===section&&viewport.children.length)return;
  stopPlayer();
  state.section=section;state.category='All';
  clearTimeout(oldCardTimer);viewport.querySelectorAll('.g-leaving').forEach(n=>n.remove());
  const old=viewport.querySelector('[data-active]');if(old){old.removeAttribute('data-active');old.classList.add('g-leaving');old.inert=true;old.setAttribute('aria-hidden','true');old.style.setProperty('--direction',direction);}
  viewport.insertAdjacentHTML('beforeend',card());const current=viewport.querySelector('[data-active]');current.style.setProperty('--direction',direction);if(old)current.classList.add('g-entering');requestAnimationFrame(fitArt);
  oldCardTimer=setTimeout(()=>{old?.remove();current.classList.remove('g-entering');},420);updateNavigation();
 }
 function next(step=1){navigate(sections[(sections.indexOf(state.section)+step+sections.length)%sections.length],step);}
 function showContact(){window.CreatorPlayer.close();contact.classList.add('g-open');document.querySelector('.g-contact-open').setAttribute('aria-expanded','true');if(compact.matches){contact.setAttribute('role','dialog');contact.setAttribute('aria-modal','true');document.querySelector('.g-gallery').inert=true;document.querySelector('.g-picker').inert=true;}document.querySelector('#g-message').focus({preventScroll:true});}
 function hideContact(){contact.classList.remove('g-open');contact.removeAttribute('role');contact.removeAttribute('aria-modal');document.querySelector('.g-gallery').inert=false;document.querySelector('.g-picker').inert=false;document.querySelector('.g-contact-open').setAttribute('aria-expanded','false');document.querySelector('.g-contact-open').focus({preventScroll:true});}
 function setService(service){if(service!==state.service){state.selected=null;state.context='';}state.service=service;}
 function request(section,context){setService(serviceNames[section]);if(context!==undefined)state.context=context;syncContext();showContact();}
 function chooseVideo(id){
  const video=state.videos.find(v=>v.id===id);if(!video)return;
  state.selected=id;state.context=(video.character||video.title)+(video.franchise?' · '+video.franchise:'');state.service=serviceNames[state.section];syncContext();
  if(!window.CreatorPlayer.toggle(id))window.CreatorPlayer.open(video,available());
  
 }
 function mail(){
  const name=form.elements.name.value.trim(),reply=form.elements.email.value.trim(),message=form.elements.message.value.trim();
  const subject=`${state.service}${state.context?' — '+state.context:''}`;
  const body=`Hi Jacob,\r\n\r\nI’d like to discuss ${state.service.toLowerCase()}.\r\n\r\nName: ${name}\r\nReply email: ${reply}\r\nService: ${state.service}\r\n${state.context?'Reference: '+state.context+'\r\n':''}\r\nProject details:\r\n${message}\r\n\r\nThanks,\r\n${name}`;
  return {subject,body,href:`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
 }
 document.querySelectorAll('.g-picker [data-section]').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.section)));
 document.querySelector('.g-picker').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;e.preventDefault();const i=sections.indexOf(state.section),index=e.key==='Home'?0:e.key==='End'?sections.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+sections.length)%sections.length;navigate(sections[index]);document.querySelector('#g-tab-'+state.section).focus({preventScroll:true});});
 document.querySelector('#g-next').onclick=()=>next(1);document.querySelector('#g-prev').onclick=()=>next(-1);
 viewport.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.goto)navigate(b.dataset.goto);else if(b.dataset.request)request(b.dataset.request);else if(b.dataset.trailer)request('trailers',b.dataset.trailer);else if(b.dataset.video)chooseVideo(b.dataset.video);else if(b.dataset.filter){state.category=b.dataset.filter;document.querySelector('#g-samples').innerHTML=samples();}});
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.g-media-picker'))return;lastPointer={x:e.clientX,y:e.clientY};});viewport.addEventListener('pointerup',e=>{if(!lastPointer)return;const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y;lastPointer=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)next(dx<0?1:-1);});
 document.querySelector('.g-contact-open').onclick=showContact;document.querySelector('#g-contact-close').onclick=hideContact;
 document.querySelector('#g-service').onchange=e=>{setService(e.target.value);syncContext();};
 form.onsubmit=e=>{e.preventDefault();if(!form.reportValidity())return;const draft=mail();document.querySelector('#g-form-note').textContent='Your email app opens a draft. Review it and send there.';location.href=draft.href;};
 document.querySelector('#g-copy').onclick=async()=>{const draft=mail();const text=`To: ${email}\nSubject: ${draft.subject}\n\n${draft.body}`;try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const temp=document.createElement('textarea');temp.value=text;document.body.append(temp);temp.select();document.execCommand('copy');temp.remove();}document.querySelector('#g-form-note').textContent='Draft copied.';}catch{document.querySelector('#g-form-note').textContent='Select your message to copy it, or open the email draft.';}};

 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&contact.classList.contains('g-open'))hideContact();});
 contact.addEventListener('keydown',e=>{if(e.key!=='Tab'||!contact.classList.contains('g-open')||!compact.matches)return;const fields=[...contact.querySelectorAll('a,button,input,textarea,select')].filter(n=>n.getClientRects().length);const first=fields[0],last=fields.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 function fitArt(){viewport.querySelectorAll('.g-callout').forEach(card=>{const copy=card.querySelector('.g-feature-copy');if(copy)card.style.setProperty('--copy-height',copy.getBoundingClientRect().height+'px');});}
 document.fonts.ready.then(fitArt);
 function fit(){requestAnimationFrame(fitArt);document.documentElement.style.setProperty('--g-height',(window.visualViewport?.height||innerHeight)+'px');if(!compact.matches){document.querySelector('.g-gallery').inert=false;document.querySelector('.g-picker').inert=false;contact.removeAttribute('aria-modal');}}
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);fit();
 state.service=serviceNames[state.section]||'General inquiry';syncContext();viewport.innerHTML=card();updateNavigation();document.dispatchEvent(new Event('showcase:render'));
 fetch('/data/catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).then(data=>{state.videos=data.videos||[];const target=document.querySelector('#g-samples');if(target)target.innerHTML=samples();}).catch(()=>{const target=document.querySelector('#g-samples');if(target)target.innerHTML='<p class="g-empty">Samples could not load. You can still contact Jacob.</p>';});
 document.addEventListener('creator:selection',e=>{const video=e.detail;state.selected=video.id;state.service=isBeat(video)?serviceNames.beats:serviceNames.voices;state.context=(video.character||video.title)+(video.franchise?' · '+video.franchise:'');syncContext();});
 document.addEventListener('creator:playback',e=>{
  state.playing=e.detail.playing;
  viewport.querySelectorAll('[data-video]').forEach(button=>{const active=button.dataset.video===e.detail.id,playing=active&&e.detail.playing;button.dataset.playing=String(playing);button.setAttribute('aria-pressed',String(active));button.querySelector('.g-record-play').innerHTML=icon(playing?'pause':'play');button.setAttribute('aria-label',(playing?'Pause ':'Play ')+(state.videos.find(v=>v.id===button.dataset.video)?.title||'sample'));});
 });
 window.ImpressionKing={getState:()=>({...state}),getDraft:mail};
})();
