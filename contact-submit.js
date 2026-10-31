/* Formspree delivery stays inside the existing Contact drawer. No credentials or redirects. */
(()=>{
 'use strict';
 const form=document.querySelector('#g-form'),contact=document.querySelector('#g-contact');
 const submit=form.querySelector('[type=submit]'),label=submit.querySelector('.g-email-label');
 const editable=[...form.querySelectorAll('input,select,textarea,button')];
 const content=[form.querySelector('.g-form-body'),form.querySelector('.g-field-picker'),form.querySelector('.g-form-actions')];
 const feedback=document.createElement('section');feedback.id='g-submit-feedback';feedback.hidden=true;feedback.tabIndex=-1;feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.setAttribute('aria-atomic','true');
 feedback.innerHTML='<span class="g-feedback-symbol" aria-hidden="true"></span><h3 id="g-feedback-title"></h3><p id="g-feedback-message"></p><div class="g-feedback-actions"><button type="button" id="g-feedback-back">Back to message</button><button type="button" id="g-feedback-done">Done</button></div>';
 form.append(feedback);
 const trap=document.createElement('input');trap.type='text';trap.name='_gotcha';trap.tabIndex=-1;trap.autocomplete='off';trap.hidden=true;trap.setAttribute('aria-hidden','true');form.append(trap);
 let pending=false,lastSent='',focusField='message';
 function busy(value){pending=value;form.setAttribute('aria-busy',String(value));editable.forEach(control=>control.disabled=value);label.textContent=value?'Sending…':'Send message';submit.setAttribute('aria-label',value?'Sending message':'Send message');}
 function show(kind,title,message,field='message'){
  focusField=field;contact.dataset.submitFeedback='true';feedback.dataset.kind=kind;
  feedback.querySelector('#g-feedback-title').textContent=title;feedback.querySelector('#g-feedback-message').textContent=message;
  feedback.querySelector('.g-feedback-symbol').style.setProperty('--g-result-icon',`url('/assets/icons/${kind==='success'?'check':'information-circle'}.svg')`);
  content.forEach(part=>part.inert=true);feedback.hidden=false;
  if(!contact.hidden&&contact.classList.contains('g-open'))feedback.focus({preventScroll:true});
 }
 document.querySelector('#g-feedback-back').onclick=()=>{feedback.hidden=true;contact.dataset.submitFeedback='false';content.forEach(part=>part.inert=false);window.ImpressionKing.focusContactField(focusField);};
 document.querySelector('#g-feedback-done').onclick=()=>window.ImpressionKing.closeContact();
 busy(false);
 form.onsubmit=async event=>{
  event.preventDefault();if(pending||!window.ImpressionKing.validateContact())return;
  const values=Object.fromEntries(['name','email','service','message'].map(key=>[key,form.elements[key].value.trim()]));
  const sample=window.ImpressionKing.getState().context;
  const payload={...values,sample,subject:'Impression King: '+values.service,_gotcha:trap.value};
  const fingerprint=JSON.stringify(payload);
  if(fingerprint===lastSent){show('success','Message sent','Thanks for reaching out. Your message is on its way to Jacob.');return;}
  const id=window.ImpressionKingContact?.formId?.trim()||'';
  if(!/^[a-zA-Z0-9]{4,64}$/.test(id)){show('error','Not connected yet','Messaging isn’t connected yet. Nothing was sent.');return;}
  if(trap.value){show('error','Couldn’t send','Your message is still here. Please try again.');return;}
  busy(true);const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('https://formspree.io/f/'+encodeURIComponent(id),{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit',redirect:'error',signal:controller.signal});
   const data=await response.json().catch(()=>null);
   if(response.ok&&!data?.errors?.length&&data?.ok!==false){lastSent=fingerprint;show('success','Message sent','Thanks for reaching out. Your message is on its way to Jacob.');}
   else if(response.status===429)show('error','Please try later','Please wait a little, then try again. Your draft is here.');
   else{const field=data?.errors?.find(error=>['name','email','service','message'].includes(error.field))?.field;show('error',field==='email'?'Check your email':'Couldn’t send','Your message wasn’t sent. Check your details and try again.',field||'message');}
  }catch{show('error','Delivery unconfirmed','Couldn’t confirm delivery. Your message is still here.');}
  finally{clearTimeout(timer);busy(false);}
 };
})();
