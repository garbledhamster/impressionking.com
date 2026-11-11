/* Three-step service guide with review-before-send Formspree inquiries. */
(()=>{
 'use strict';
 const {SERVICES,DIRECTIONS,createOrder,definition}=window.CreatorServicesModel,order=createOrder();
 const formId=window.ImpressionKingContact?.formId?.trim()||'',connected=/^[a-zA-Z0-9]{4,64}$/.test(formId);
 const sent=new Set();let pending=false,reviewing=false,reviewed=null;
 const draft={name:'',email:'',message:'',topic:'Hiring inquiry'};
 const steps=['Service','Direction','Project'];
 const directionHelp={
  Cinematic:['A story with a sense of scale.','Example: a measured opening that builds toward the reveal.'],
  Playful:['Light, expressive and full of character.','Example: a mischievous introduction or a cheerful character exchange.'],
  Intense:['Urgency, tension and a stronger delivery.','Example: a final warning before the action begins.'],
  'Let Jacob suggest':['Give Jacob room to find the right approach.','Share your idea or a reference, and discuss the direction together.']
 };
 const projectHelp={
  'Game trailer':'Introduce your game, build anticipation and lead into the reveal.',
  'Film trailer':'Set up the story and the mood of your film.',
  'Channel promo':'Introduce your channel or an upcoming series.',
  'Character dialogue':'Give a character a voice for a scene, game or animation.',
  Narration:'Guide listeners through a story, video or explanation.',
  'Personal message':'Describe the person, occasion and message you have in mind.',
  'Custom beat':'Share the mood, pace and references for your beat.',
  Instrumental:'Describe the sound and feel of an instrumental piece.',
  'Project music':'Tell Jacob where the music will fit in your project.'
 };
 let step=0,notice='',dialog=null,onClose=null,opener=null,initialized=false,topicChosen=false;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=name=>`<span class="g-icon" style="--g-icon:url('/assets/icons/${name}.svg')" aria-hidden="true"></span>`;
 const art=(s,interactive=true)=>`<img class="sc-art g-character" src="/assets/character/jacob-${s.art}.webp" alt="${interactive?s.alt:''}" draggable="false" ${interactive?'role="button" tabindex="0" data-power-trigger aria-label="Jacob Williams"':''}>`;
 const current=()=>definition(order.selection().service);
 function contents(){
  const choice=order.selection(),s=current(),cart=order.cart(),saved=cart.find(x=>x.service===s.id),added=Boolean(saved),changed=added&&JSON.stringify(saved)!==JSON.stringify(choice);
  const title=['Pick your service.','Pick your direction.','Pick your project.'][step];
  const choices=step===0?`<div class="sc-build-services" role="group" aria-label="Choose a service">${SERVICES.map(x=>`<button type="button" data-select="${x.id}" aria-pressed="${s.id===x.id}"><span class="sc-emblem">${art(x,false)}</span><span>${x.name}</span></button>`).join('')}</div>`:step===1?`<div class="sc-directions" role="group" aria-label="Choose a direction">${DIRECTIONS.map(x=>`<button type="button" data-direction="${x}" aria-pressed="${choice.direction===x}">${x}</button>`).join('')}</div>`:`<div class="sc-projects" role="group" aria-label="Choose a project">${s.projects.map(x=>`<button type="button" data-project="${x}" aria-pressed="${choice.project===x}">${x}</button>`).join('')}</div>`;
  const detail=step===0?[s.name,s.description]:step===1?[choice.direction,...directionHelp[choice.direction]]:[choice.project,projectHelp[choice.project]];
  return `<header class="sc-heading"><nav class="sc-steps" aria-label="Request steps">${steps.map((x,i)=>`<button type="button" data-step="${i}" ${step===i?'aria-current="step"':''}><span>${i+1}</span>${x}</button>`).join('')}</nav><button type="button" class="sc-cart-button" data-cart>${icon('shopping-bag')}Cart <span class="sc-count">${cart.length}</span></button></header>
  <div class="g-callout sc-guide" data-service-details="${s.id}"><div class="sc-guide-content"><div class="sc-guide-scroll"><div class="sc-step-heading"><div><h1 class="sc-step-title" tabindex="-1">${title}</h1><p class="sc-step-intro">${['Voiceovers and narration by Jacob Williams. Start with a trailer, character or story.','Choose how you want it to feel.','Choose where this will come to life.'][step]}</p></div><div class="sc-step-art">${art(s)}</div></div>${choices}<div class="sc-explanation" aria-live="polite"><h2>${detail[0]}</h2>${detail.slice(1).map(x=>`<p>${x}</p>`).join('')}</div></div><div class="sc-guide-actions">${step?`<button type="button" class="sc-back" data-step="${step-1}">${icon('arrow-left')}Back</button>`:''}${step<2?`<button type="button" class="sc-primary g-primary" data-step="${step+1}">Next${icon('arrow-right')}</button>`:`<button class="sc-primary g-primary" type="button" data-add ${added&&!changed?'disabled':''}>${changed?'Update in cart':added?'Added to cart':'Add to cart'}${icon(added?'check':'shopping-bag')}</button>`}</div></div></div>
  <footer class="sc-page-bottom"><p class="sc-selection">${s.name} <span>· ${choice.direction} · ${choice.project}</span></p><p class="sc-notice" role="status">${esc(notice||'Quote and delivery to be agreed.')}</p>${cart.length?`<button class="sc-summary-contact" type="button" data-cart>Review request${icon('arrow-right')}</button>`:''}</footer>`;
 }
 function renderCard(){return `<article class="g-card g-services sc-panel" data-active="true">${contents()}</article>`;}
 function help(root){if(!window.tippy)return;for(const b of root.querySelectorAll('[data-help]'))if(!b._tippy)tippy(b,{content:b.dataset.help,theme:'joe',allowHTML:false,appendTo:()=>document.body,trigger:'mouseenter focus',touch:['hold',450]});}
 function refresh(focusSelector){
  const host=document.querySelector('.sc-panel[data-active]');
  if(host){host.querySelectorAll('[data-help]').forEach(b=>b._tippy?.destroy());host.innerHTML=contents();help(host);if(focusSelector){const target=host.querySelector(focusSelector);target?.focus({preventScroll:true});target?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}}
  if(dialog?.open)refreshCart();document.dispatchEvent(new Event('creator:card'));
 }
 function selectService(id,reference,project){order.select(id,reference,project);notice='';step=0;refresh(`[data-select="${id}"]`);}
 function requestText(){const cart=order.cart();return `Hi Jacob,\n\n${cart.length?'I’d like to discuss '+cart.map(x=>definition(x.service).name.toLowerCase()).join(' and ')+'.':'I’d like to get in touch about '+draft.topic.toLowerCase()+'.'}\n\n${cart.map(x=>{const s=definition(x.service);return `${s.name} · ${x.direction} · ${x.project}${x.reference?'\nReference: '+x.reference:''}`;}).join('\n\n')}${cart.length?'\n\n':''}${draft.message||'[Your project details]'}${draft.name?'\n\nThanks,\n'+draft.name:''}`;}
 function ensureDialog(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.id='service-cart-contact';dialog.className='sc-cart';dialog.setAttribute('aria-labelledby','sc-cart-title');dialog.setAttribute('aria-describedby','sc-preview-note');
  dialog.innerHTML=`<div class="sc-cart-top"><div><h2 id="sc-cart-title" tabindex="-1">Build a request</h2><p id="sc-preview-note">${connected?'Review your request, then send it to Jacob. No booking or payment.':'Preview only. Nothing is sent or charged.'}</p></div><button type="button" data-close-cart aria-label="Close cart">${icon('x-mark')}</button></div><p class="sc-cart-status" role="status" aria-atomic="true"></p><div id="sc-contact-content"><div class="sc-cart-body"><section id="sc-cart-items" aria-label="Selected services"></section><form id="sc-cart-form"><input name="_gotcha" type="text" tabindex="-1" autocomplete="off" hidden aria-hidden="true"><h3>Project details</h3><p>Service, direction and project choices are included automatically.</p><div class="sc-contact-fields"><label>Name<input id="sc-name" name="name" autocomplete="name" placeholder="Your name" required></label><label>Email<input id="sc-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required></label></div><label class="sc-topic">Request type<select id="sc-topic"><option>Hiring inquiry</option><option>Creator collaboration</option><option>Say hi</option></select></label><label>Script or project details<textarea id="sc-brief" name="message" rows="3" placeholder="Paste your script or a link. Add the length, intended use and deadline if known." required></textarea></label><button class="sc-primary g-primary" type="submit"><span id="sc-preview-label">${connected?'Review request':'Preview request'}</span>${icon('arrow-right')}</button></form></div><footer class="sc-support"><small>Your draft stays in this page and clears when you reload. Quote and delivery are agreed with Jacob.</small></footer></div><div class="sc-request-preview" hidden><h3>Request to Jacob</h3><pre></pre><p class="sc-reply"></p><div class="sc-demo-notice">${connected?'Nothing was sent yet. Your name, email, selected services and project details will be sent through Formspree to Impression King. Jacob will discuss the quote and delivery before accepting work.':'Nothing was sent. This is a request preview; no order was placed and no payment was taken.'}</div><p class="sc-delivery-status" data-delivery-state="idle" role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></p><button type="button" class="sc-primary g-primary" data-send-request ${connected?'':'hidden'}>Send request${icon('paper-airplane')}</button><button type="button" class="sc-primary g-primary" data-edit-cart>Edit request${icon('arrow-left')}</button><button type="button" class="sc-browse" data-close-cart>Keep browsing</button></div>`;
  document.body.append(dialog);document.querySelector('#g-tab-contact')?.setAttribute('aria-controls',dialog.id);
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeContact();});
  dialog.addEventListener('input',event=>{const key={'sc-name':'name','sc-email':'email','sc-brief':'message','sc-topic':'topic'}[event.target.id];if(key){draft[key]=event.target.value;if(key==='topic')topicChosen=true;event.target.setCustomValidity('');}});
  dialog.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b)return;
   if(b.hasAttribute('data-close-cart'))closeContact();
   else if(b.hasAttribute('data-send-request'))sendRequest();
   else if(pending)return;
   else if(b.hasAttribute('data-edit-cart'))showPreview(false);
   else if(b.dataset.remove){order.remove(b.dataset.remove);notice=definition(b.dataset.remove).name+' removed from your cart.';refresh();dialog.querySelector('[data-clear]:not(:disabled),[data-cart-add],#sc-name')?.focus({preventScroll:true});}
   else if(b.hasAttribute('data-clear')){order.clear();notice='Your cart is empty. Choose a service to start a new request.';refresh();dialog.querySelector('[data-cart-add]')?.focus({preventScroll:true});}
   else if(b.dataset.cartAdd){order.select(b.dataset.cartAdd);order.add();notice=definition(b.dataset.cartAdd).name+' added to your cart.';refresh();dialog.querySelector('#sc-name').focus({preventScroll:true});}
   else if(b.dataset.cartEdit){const id=b.dataset.cartEdit;closeContact();selectService(id);document.querySelector('#g-tab-services')?.click();document.querySelector(`[data-select="${id}"]`)?.focus({preventScroll:true});}
  });
  dialog.querySelector('form').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;for(const id of['sc-name','sc-brief']){const field=document.getElementById(id);field.setCustomValidity(field.value.trim()?'':'Please fill in this field.');}if(!form.reportValidity())return;showPreview(true);});
  window.addEventListener('resize',()=>fitDialog(true));window.visualViewport?.addEventListener('resize',()=>fitDialog(true));window.visualViewport?.addEventListener('scroll',()=>fitDialog(false));
 }
 function refreshCart(){
  const cart=order.cart(),region=dialog.querySelector('#sc-cart-items');
  region.innerHTML=`<div class="sc-cart-section-heading"><h3>${cart.length?'Selected services':'Choose a service'}</h3><button type="button" class="sc-clear" data-clear ${cart.length?'':'disabled'}>Clear cart</button></div><div class="sc-cart-selection">${cart.length?`<ul class="sc-cart-items">${cart.map(x=>{const s=definition(x.service);return `<li><span class="sc-cart-emblem">${art(s)}</span><div><strong>${s.name}</strong><small>${x.direction} · ${x.project}</small>${x.reference?`<small>${esc(x.reference)}</small>`:''}<button type="button" class="sc-edit" data-cart-edit="${s.id}">Edit choices</button></div><button type="button" data-remove="${s.id}" aria-label="Remove ${s.name}">${icon('close-bold')}</button></li>`;}).join('')}</ul>`:`<div class="sc-cart-empty"><p>Your cart is empty. Start with a service.</p><div>${SERVICES.map(s=>`<button type="button" data-cart-add="${s.id}"><span class="sc-mini-emblem">${art(s,false)}</span>${s.name}${icon('plus')}</button>`).join('')}</div></div>`}</div>`;
  // Reserve the request-type row so adding the first item does not move the form.
  const topic=dialog.querySelector('.sc-topic');topic.classList.toggle('sc-topic-reserved',cart.length>0);topic.inert=cart.length>0;topic.setAttribute('aria-hidden',String(cart.length>0));
  dialog.querySelector('.sc-cart-status').textContent=notice;
  fitDialog(false);
 }
 function showPreview(value,retain=false){
  reviewing=value;
  if(value&&!retain){const next=payload();if(JSON.stringify(next)!==JSON.stringify(reviewed))setDelivery('idle','',false);reviewed=next;}
  dialog.querySelector('#sc-contact-content').hidden=value;dialog.querySelector('.sc-request-preview').hidden=!value;
  dialog.querySelector('#sc-cart-title').textContent=value?'Your request preview':'Build a request';
  if(value){dialog.querySelector('pre').textContent=reviewed.message;dialog.querySelector('.sc-reply').textContent='Reply to: '+reviewed.email;}
  syncDelivery();fitDialog(false);dialog.scrollTop=0;dialog.querySelector('#sc-cart-title').focus({preventScroll:true});
 }
 function payload(){
  const items=order.cart();
  return {name:draft.name.trim(),email:draft.email.trim(),message:requestText(),service:items.length?items.map(x=>definition(x.service).name).join(', '):draft.topic,items,subject:'Impression King inquiry',_gotcha:dialog.querySelector('[name="_gotcha"]').value};
 }
 function syncDelivery(){
  const button=dialog.querySelector('[data-send-request]'),alreadySent=sent.has(JSON.stringify(reviewing?reviewed:payload()));
  button.disabled=pending||alreadySent;button.textContent=pending?'Sending…':alreadySent?'Request sent':'Send request';
  dialog.querySelector('[data-edit-cart]').disabled=pending;
  dialog.querySelector('#sc-cart-form').setAttribute('aria-busy',String(pending));
  if(!pending){const status=dialog.querySelector('[data-delivery-state]');if(alreadySent)setDelivery('success','Request sent to Formspree for Impression King. This is an inquiry, not a booking. No payment was taken.',false);else if(status.dataset.deliveryState==='success')setDelivery('idle','',false);}
 }
 function setDelivery(state,message,focus=true){
  const status=dialog.querySelector('[data-delivery-state]');status.dataset.deliveryState=state;status.textContent=message;dialog.querySelector('.sc-demo-notice').hidden=state!=='idle';
  if(focus&&dialog.open){status.focus({preventScroll:true});status.scrollIntoView({block:'nearest'});}
 }
 async function sendRequest(){
  if(pending||!connected||!reviewing)return;
  const form=dialog.querySelector('#sc-cart-form');
  if(!form.checkValidity()||!draft.name.trim()||!draft.message.trim()){showPreview(false);form.reportValidity();return;}
  const values=reviewed,fingerprint=JSON.stringify(values);if(sent.has(fingerprint))return;
  if(values._gotcha){setDelivery('error','Your request was not sent. Please check your details.');return;}
  pending=true;syncDelivery();setDelivery('pending','Sending your request…',false);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('https://formspree.io/f/'+encodeURIComponent(formId),{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify(values),credentials:'omit',redirect:'error',signal:controller.signal});
   const data=await response.json().catch(()=>null);
   if(response.ok&&data?.ok===true&&!data?.errors?.length){sent.add(fingerprint);setDelivery('success','Request sent to Formspree for Impression King. This is an inquiry, not a booking. No payment was taken.');}
   else if(response.status===429)setDelivery('error','Please wait before trying again. Formspree is receiving too many requests. Your draft is still here.');
   else if(response.status>=400&&response.status<500)setDelivery('error','Your request was not accepted. Edit your request and check your details, or email admin@impressionking.com. Your draft is still here.');
   else setDelivery('error','Could not confirm delivery. Your draft is still here. Sending again could create a duplicate. You can check with admin@impressionking.com before retrying.');
  }catch{setDelivery('error','Could not confirm delivery. Your draft is still here. Sending again could create a duplicate. You can check with admin@impressionking.com before retrying.');}
  finally{clearTimeout(timer);pending=false;syncDelivery();}
 }
 function fitDialog(reveal){
  if(!dialog?.open)return;const v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight,top=v?.offsetTop||0,left=v?.offsetLeft||0;
  const height=Math.max(120,Math.min(800,h-24));
  dialog.style.height=height+'px';dialog.style.maxHeight=height+'px';dialog.style.width=Math.max(240,Math.min(680,w-24))+'px';dialog.style.left=left+w/2+'px';dialog.style.top=top+(h-height)/2+'px';
  if(reveal&&dialog.contains(document.activeElement))document.activeElement.scrollIntoView({block:'nearest'});
 }
 function openContact(options={}){ensureDialog();if(dialog.open)return;opener=document.activeElement;onClose=options.onClose||null;if(!topicChosen&&['Hiring inquiry','Creator collaboration','Say hi'].includes(options.topic))draft.topic=options.topic;dialog.querySelector('#sc-topic').value=draft.topic;showPreview(reviewing,true);refreshCart();window.CreatorPlayer?.close();dialog.showModal();document.body.classList.add('service-contact-open');document.querySelector('#g-tab-contact')?.setAttribute('aria-expanded','true');fitDialog(false);dialog.querySelector('#sc-cart-title').focus({preventScroll:true});}
 function closeContact(){if(!dialog?.open)return;dialog.close();document.body.classList.remove('service-contact-open');document.querySelector('#g-tab-contact')?.setAttribute('aria-expanded','false');const callback=onClose;onClose=null;callback?.();const target=opener?.isConnected&&!opener.disabled?opener:document.querySelector('.sc-heading [data-cart]')||document.querySelector('#g-tab-contact');target?.focus({preventScroll:true});}
 function init(){
  if(initialized)return;initialized=true;ensureDialog();const viewport=document.querySelector('#g-viewport');
  viewport.addEventListener('click',event=>{
   if(!event.target.closest('.sc-panel'))return;const b=event.target.closest('button');if(!b)return;
   if(b.dataset.select)selectService(b.dataset.select);
   else if(b.dataset.direction){order.configure({direction:b.dataset.direction});refresh(`[data-direction="${b.dataset.direction}"]`);}
   else if(b.dataset.project){order.configure({project:b.dataset.project});refresh(`[data-project="${b.dataset.project}"]`);}
   else if(b.hasAttribute('data-step')){step=Number(b.dataset.step);refresh('.sc-step-title');}
   else if(b.hasAttribute('data-add')){const result=order.add();notice=current().name+(result.action==='updated'?' updated in your cart.':' added to your cart.');refresh('.sc-heading [data-cart]');}
   else if(b.hasAttribute('data-cart'))document.querySelector('#g-tab-contact').click();
  });
  viewport.addEventListener('pointerdown',event=>{if(event.target.closest('.sc-panel'))event.stopPropagation();},true);
  document.addEventListener('creator:card',()=>{const host=document.querySelector('.sc-panel[data-active]');if(host)help(host);});help(viewport);
 }
 window.CreatorServices={renderCard,init,selectService,openContact,closeContact,isContactOpen:()=>Boolean(dialog?.open),getDraft:()=>({...draft,items:order.cart(),body:requestText()})};
})();
