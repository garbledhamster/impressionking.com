/* Local preview interactions. Request drafts stay in memory and are never sent. */
(() => {
  'use strict';
  const templates={
    voice:'Sample request: Could you record a short character greeting for a birthday?',
    beat:'Sample request: I’m looking for an anime-inspired instrumental for a short video.',
    work:'Sample inquiry: I’m planning a voice-over project and would like to discuss the character, script, and usage.'
  };
  let draft={kind:'voice',details:templates.voice},frame=0;
  let resizeObserver,drawerObserver;
  const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
  const glyph=name=>`<span class="ui-icon" style="--icon:url('/assets/icons/${name}.svg')" aria-hidden="true"></span>`;
  function update(){
    frame=0;
    const cue=document.querySelector('#scroll-affordance');
    if(!cue)return;
    const root=document.documentElement,scroller=document.scrollingElement;
    const drawer=document.querySelector('#video-drawer');
    const atEnd=scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-8;
    const editing=document.activeElement?.matches('textarea,input,select');
    const drawerOpen=drawer&&!drawer.hidden&&drawer.dataset.open==='true';
    cue.hidden=atEnd||editing||drawerOpen||!document.querySelector('#theme-panel')?.hidden;
    const about=document.querySelector('#about');
    cue.dataset.body=String(Boolean(about&&about.getBoundingClientRect().top<innerHeight*.8));
    const brand=document.querySelector('.site-header .brand'),nav=document.querySelector('.header-nav'),bar=document.querySelector('.prototype-bar');
    if(brand)root.style.setProperty('--brand-row-height',brand.getBoundingClientRect().height+'px');
    if(nav)root.style.setProperty('--nav-height',nav.getBoundingClientRect().height+'px');
    if(bar)root.style.setProperty('--prototype-height',bar.getBoundingClientRect().height+'px');
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function enhance(){
    const form=document.querySelector('#request-form');
    if(!form)return;
    const kind=form.querySelector('#request-kind'),details=form.querySelector('#request-details');
    kind.value=draft.kind;details.value=draft.details;
    kind.addEventListener('change',()=>{draft.kind=kind.value;details.value=templates[kind.value];draft.details=details.value;form.querySelector('#request-result').hidden=true;});
    details.addEventListener('input',()=>{draft.details=details.value;form.querySelector('#request-result').hidden=true;});
    document.querySelectorAll('[data-request]').forEach(button=>button.addEventListener('click',()=>{
      const panel=document.querySelector('#request-panel');panel.open=true;
      if(draft.kind!==button.dataset.request){draft={kind:button.dataset.request,details:templates[button.dataset.request]};}
      kind.value=draft.kind;details.value=draft.details;
      form.querySelector('#request-result').hidden=true;
      panel.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
      kind.focus({preventScroll:true});schedule();
    }));
    form.addEventListener('submit',event=>{
      event.preventDefault();draft={kind:kind.value,details:details.value};
      const result=form.querySelector('#request-result');
      result.textContent='Demo preview — nothing sent.\n\n'+kind.selectedOptions[0].textContent+'\n'+details.value;
      result.hidden=false;schedule();
    });
    document.querySelector('#scroll-cue').addEventListener('click',()=>{
      const list=document.querySelector('#video-list');
      const bounds=list.getBoundingClientRect();
      const remaining=list.scrollHeight-list.clientHeight-list.scrollTop;
      const behavior=reduced()?'instant':'smooth';
      if(remaining>2&&bounds.bottom>100&&bounds.top<innerHeight*.8){list.scrollBy({top:list.clientHeight*.8,behavior});}
      else window.scrollBy({top:innerHeight*.7,behavior});
    });
    const labels={
      'stop-video':['stop','Stop'],
      'previous-video':['arrow-left','Previous'],
      'next-video':['arrow-right','Next'],
      'excerpt-play':['play','Play excerpt']
    };
    for(const [id,[name,label]] of Object.entries(labels)){
      const button=document.getElementById(id);if(button)button.innerHTML=glyph(name)+label;
    }
    resizeObserver?.disconnect();
    resizeObserver=new ResizeObserver(schedule);
    ['.site-header .brand','.header-nav','.prototype-bar','.body-content','#video-list'].forEach(selector=>{const element=document.querySelector(selector);if(element)resizeObserver.observe(element);});
    drawerObserver?.disconnect();
    drawerObserver=new MutationObserver(schedule);
    const drawer=document.querySelector('#video-drawer');if(drawer)drawerObserver.observe(drawer,{attributes:true,attributeFilter:['hidden','data-open']});
    const theme=document.querySelector('#theme-panel');if(theme)drawerObserver.observe(theme,{attributes:true,attributeFilter:['hidden']});
    document.querySelector('#video-list').addEventListener('scroll',schedule,{passive:true});
    schedule();
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('focusin',schedule);
  document.addEventListener('focusout',schedule);
  document.addEventListener('showcase:render',enhance);
  enhance();
})();
