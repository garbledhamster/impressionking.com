/* Throwaway prototype: five distinct showcase layouts on one ?variant= route. */
(() => {
  'use strict';
  const variants = {A:'Orbit Grid', B:'Record Rail', C:'Studio Rows', D:'Franchise Shelves', E:'Spotlight'};
  const keys = Object.keys(variants);
  const url = new URL(location.href);
  const mobileLayout=matchMedia('(max-width:740px), (max-height:600px) and (orientation:landscape)');
  mobileLayout.addEventListener('change',()=>{const tools=document.querySelector('#browse-tools');if(tools&&(!mobileLayout.matches||!tools.contains(document.activeElement)))tools.open=!mobileLayout.matches;});
  const state = {variant: variants[url.searchParams.get('variant')] ? url.searchParams.get('variant') : 'A', videos: [], selected: null, section: url.searchParams.get('section') === 'music' ? 'music' : 'voices', category:'All', keyword:'', search:'', ready:false, playing:false, duration:null, currentTime:0, rotating:false, excerptEnd:null, thresholds:[15,30,45,60,90,120], error:null, drawerOpen:false, playerLoaded:false, pendingPlay:false, mediaError:false, playbackSource:'idle', lastPlayerEvent:null};
  const app = document.querySelector('#app');
  const progress=new PlayerSignals.ProgressTracker(playing=>setPlaying(playing,'time-progress'));
  function setPlaying(playing,source){state.playbackSource=source;if(playing)state.ready=true;if(state.playing===playing){debug();return;}state.playing=playing;syncPlayback();renderDuration();document.querySelector('#player-status').textContent=`${title(selected())} · ${playing?'Playing':'Paused'}`;debug();}
  function pausePlayback(){state.pendingPlay=false;state.excerptEnd=null;progress.reset();command('pause');setPlaying(false,'pause-request');}
  function stopPlayback(){pausePlayback();command('seekTo',0);command('pause');state.currentTime=0;document.querySelector('#player-status').textContent=`${title(selected())} · Stopped`;debug();}
  const safe = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name) => `<img src="/assets/icons/${name}.svg" alt="" aria-hidden="true">`;
  const glyph = name => `<span class="ui-icon" style="--icon:url('/assets/icons/${name}.svg')" aria-hidden="true"></span>`;
  const fields = video => [video.title, video.character, video.franchise, video.description, ...(Array.isArray(video.categories)?video.categories:[])].filter(Boolean).join(' ').toLowerCase();
  const validId = video => /^\d+$/.test(String(video?.id || ''));
  const isMusic = v => v.media_kind === 'music' || v.media_kind === 'beat' || (Array.isArray(v.categories) && v.categories.includes('Music'));
  const sectionVideos = () => state.videos.filter(v => state.section === 'music' ? isMusic(v) : !isMusic(v));
  const categories = () => {const counts = new Map(); sectionVideos().forEach(v => {const cats = Array.isArray(v.categories) ? v.categories : []; new Set(cats.filter(x => typeof x === 'string' && x.trim())).forEach(x => counts.set(x,(counts.get(x)||0)+1));}); return [...counts].sort((a,b) => a[0].localeCompare(b[0]));};
  const filtered = () => sectionVideos().filter(v => (state.category === 'All' || (Array.isArray(v.categories) && v.categories.includes(state.category))) && (!state.keyword || v.character === state.keyword || v.franchise === state.keyword) && (!state.search || fields(v).includes(state.search.toLowerCase())));
  const keywords = () => {const counts = new Map(); sectionVideos().forEach(v => new Set([v.character,v.franchise].filter(x=>typeof x==='string' && x.trim())).forEach(x=>counts.set(x,(counts.get(x)||0)+1)));return [...counts].sort((a,b)=>a[0].localeCompare(b[0]));};
  const title = v => v?.title || v?.character || 'Untitled video';
  const brand = `<a class="brand" href="/" aria-label="Impression King home"><img class="brand-lockup" src="/assets/brand/logo-horizontal.svg" width="820" height="256" alt="Impression King"><small>Jacob Williams</small></a>`;
  function intro() {return `<section class="intro"><h1>${state.section === 'music' ? 'Music &amp; Beats' : 'Sample Voices'}</h1><div class="accent-rule" aria-hidden="true"></div><p>${state.section === 'music' ? 'Explore beats and remixes from Jacob.' : 'Explore Jacob’s character impressions. Choose a character to play a sample.'}</p></section>`;}
  function player() {return `<section class="player-wrap video-drawer" id="video-drawer" aria-label="Video drawer" data-open="${state.drawerOpen}" ${state.playerLoaded?'':'hidden'}><button class="drawer-handle" id="drawer-handle" type="button" aria-expanded="${state.drawerOpen}" aria-controls="drawer-content"><span class="handle-line" aria-hidden="true"></span><span id="drawer-handle-label">Hide video</span></button><div class="drawer-content" id="drawer-content"><div class="player-heading"><div><h2 id="selected-title" class="selected-title"></h2></div><a id="original-link" href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener noreferrer" aria-label="Open selected video on TikTok">${icon('arrow-top-right-on-square')}</a></div><div class="player-nav"><button class="control" id="stop-video" type="button">Stop</button><button class="control" id="previous-video" type="button">Previous</button><button class="control" id="next-video" type="button">Next</button><button class="control" id="rotation" type="button" aria-pressed="${state.rotating}">${glyph('arrow-path')}Auto-next: ${state.rotating?'on':'off'}</button></div><div class="player-box" id="player-box"><div class="player-placeholder">Choose a character</div></div><div class="duration" id="duration-display"></div><p class="player-status" id="player-status" role="status">Choose a character.</p><details class="excerpt"><summary>Play an excerpt</summary><p>Uses the visible video; timing is approximate.</p><div class="excerpt-fields"><label>Start (seconds)<input id="start-time" type="number" min="0" step="1" value="0"></label><label>Stop (seconds)<input id="stop-time" type="number" min="1" step="1" value="15"></label><button class="button" id="excerpt-play" type="button">Play excerpt</button></div><p id="excerpt-status" aria-live="polite"></p></details></div></section>`;}
  function catalog() {return `<section class="catalog" id="voices"><div class="filter-shelf"><div class="section-head"><h2>Choose a voice</h2><p>Play a character. The video slides up.</p></div><details id="browse-tools" class="browse-tools" ${mobileLayout.matches?'':'open'}><summary>Search &amp; filters</summary><div class="search-wrap"><label class="search-label" for="search">Search characters and videos</label><input id="search" type="search" placeholder="Search the collection" value="${safe(state.search)}"></div><div class="filters" id="filters" aria-label="Filter videos"></div><details class="keyword-picker"><summary>Characters &amp; series</summary><p class="subtle">Choose a character or series.</p><div class="filters" id="keywords" aria-label="Characters and series"></div></details><button class="control reset-filter" id="reset-filter" type="button">Clear filters</button></details><p class="category-status" id="results-status" role="status"></p></div><div class="list" id="video-list" role="region" aria-label="${state.section === 'music' ? 'Music and beats' : 'Voice samples'}" tabindex="0"></div></section>`;}
  function about() {return `<section class="creator-section" id="about" aria-labelledby="creator-heading"><div class="section-title">${glyph('user-circle')}<h2 id="creator-heading">Meet Jacob</h2></div><article class="creator-callout"><img class="creator-portrait" src="/assets/jacob-tiktok-profile.jpg" width="720" height="720" loading="lazy" alt="Jacob’s avatar from his Impression King TikTok profile"><div class="creator-copy"><h3>Jacob Williams <span>@impressionking30</span></h3><blockquote>“Come check out my TikTok, I also take requests!”</blockquote><p class="preview-note">Draft invitation supplied by Joe for this preview.</p><div class="creator-actions"><a class="cta cta-primary" href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener noreferrer">${glyph('arrow-top-right-on-square')}Follow on TikTok</a><button class="cta" type="button" data-request="voice">${glyph('microphone')}Request a voice</button><button class="cta" type="button" data-request="beat">${glyph('musical-note')}Request a beat</button><button class="cta" type="button" data-request="work">${glyph('briefcase')}Hire for voice work</button></div></div></article><details class="request-panel" id="request-panel"><summary>${glyph('chat-bubble-left-right')}Plan a request</summary><div class="request-content"><h3>What do you have in mind?</h3><p class="preview-note">Demo form with editable sample details. Nothing is sent or saved.</p><form id="request-form"><label>Request<select id="request-kind" name="kind"><option value="voice">Voice request</option><option value="beat">Beat request</option><option value="work">Voice work</option></select></label><label>Details<textarea id="request-details" name="details" rows="4" required></textarea></label><div class="request-actions"><button class="cta cta-primary" type="submit">${glyph('chat-bubble-left-right')}Preview request</button><a href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener noreferrer">Visit Jacob on TikTok ${glyph('arrow-top-right-on-square')}</a></div><p id="request-result" class="request-result" role="status" hidden></p></form></div></details></section>`;}
  function moreSections() {return `<section class="more-sections"><section id="gear"><div class="section-title">${glyph('microphone')}<h2>In the studio</h2></div><p class="preview-note">Mock setup · Jacob’s actual gear is still to be confirmed.</p><dl class="mock-setup"><div><dt>Microphone</dt><dd>Condenser microphone</dd></div><div><dt>Recording</dt><dd>Audio interface + headphones</dd></div><div><dt>Production</dt><dd>Recording and beat-making software</dd></div></dl></section><section id="partners"><div class="section-title">${glyph('user-group')}<h2>Create together</h2></div><p>Have a character, a sound, or a project in mind?</p><p class="preview-note">Sample collaboration invitation. Availability and booking details are not confirmed.</p><button class="cta" type="button" data-request="work">${glyph('briefcase')}Discuss voice work</button></section></section>`;}
  function scrollCue() {return `<div class="scroll-affordance" id="scroll-affordance"><div class="scroll-glow" aria-hidden="true"></div><button class="scroll-cue" id="scroll-cue" type="button" aria-label="Scroll down to more content">${glyph('arrow-down')}<span>Scroll down</span></button></div>`;}
  function stateDetails() {return `<details class="state"><summary>Prototype details</summary><pre id="debug-state"></pre></details>`;}
  function brandFooter() {return `<footer class="brand-footer"><img src="/assets/brand/logo-horizontal.svg" width="820" height="256" alt="Impression King"><p>Jacob Williams · Voices &amp; Music</p><a href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener noreferrer">@impressionking30</a></footer>`;}
  function shell() {
    document.body.className = `variant-${state.variant}`;
    app.innerHTML = `<div class="site"><header class="site-header">${brand}<nav class="header-nav" aria-label="Main navigation"><button class="section-tab" type="button" data-section="voices" aria-pressed="${state.section==='voices'}">${glyph('microphone')}Voices</button><button class="section-tab" type="button" data-section="music" aria-pressed="${state.section==='music'}">${glyph('musical-note')}Music &amp; Beats</button><a href="#about">${glyph('user-circle')}About</a><a href="#gear">${glyph('adjustments-horizontal')}Gear</a><a href="#partners">${glyph('user-group')}Partners</a><a href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener noreferrer">${glyph('arrow-top-right-on-square')}TikTok</a></nav></header><main class="main" id="main">${intro()}<div class="body-content"><div class="experience">${player()}${catalog()}</div>${about()}${moreSections()}${stateDetails()}</div></main>${brandFooter()}${scrollCue()}</div>`;
    document.querySelector('#variant-label').textContent = `${state.variant} — ${variants[state.variant]}`;
    document.querySelectorAll('.section-tab').forEach(button=>button.addEventListener('click',()=>changeSection(button.dataset.section)));
    document.querySelector('#search').addEventListener('input', e => {state.search=e.target.value; renderCatalog();});
    document.querySelector('#reset-filter').addEventListener('click',()=>{state.search='';state.category='All';state.keyword='';document.querySelector('#search').value='';renderCatalog();});
    document.querySelector('#stop-video').addEventListener('click',stopPlayback);
    document.querySelector('#previous-video').addEventListener('click',()=>cycle(-1));
    document.querySelector('#next-video').addEventListener('click',()=>cycle(1));
    document.querySelector('#rotation').addEventListener('click',e=>{state.rotating=!state.rotating;e.currentTarget.setAttribute('aria-pressed',String(state.rotating));e.currentTarget.innerHTML=`${glyph('arrow-path')}Auto-next: ${state.rotating?'on':'off'}`; debug();});
    document.querySelector('#excerpt-play').addEventListener('click', playExcerpt);
    bindDrawer(); renderCatalog(); loadSelected();
    document.dispatchEvent(new Event('showcase:render'));
  }
  function renderCatalog() {
    const active=document.activeElement;
    const resetFocused=active?.id==='reset-filter';
    const focusKey=active?.matches('#filters button')?['category',active.dataset.category]:active?.matches('#keywords button')?['keyword',active.dataset.keyword]:active?.matches('.sample-watch')?['id',active.dataset.id]:null;
    document.querySelector('#reset-filter').hidden=state.category==='All'&&!state.keyword&&!state.search;
    const counts=categories();
    document.querySelector('#filters').innerHTML = `<button class="chip" type="button" data-category="All" aria-pressed="${state.category==='All'}">All <small>${sectionVideos().length}</small></button>` + counts.map(([name,count])=>`<button class="chip" type="button" data-category="${safe(name)}" aria-pressed="${state.category===name}" style="font-size:${Math.min(1.15,.88 + count*.025)}rem">${safe(name)} <small>${count}</small></button>`).join('');
    document.querySelector('#filters').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.category; renderCatalog();}));
    const names=keywords(); const keywordBox=document.querySelector('#keywords'); keywordBox.innerHTML=names.map(([name,count])=>`<button class="chip keyword" type="button" data-keyword="${safe(name)}" aria-pressed="${state.keyword===name}" style="font-size:${Math.min(1.12,.85+count*.045)}rem">${safe(name)} <small>${count}</small></button>`).join(''); keywordBox.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.keyword=state.keyword===b.dataset.keyword?'':b.dataset.keyword;renderCatalog();}));
    const videos=filtered();
    const status=document.querySelector('#results-status');
    if (state.error) {status.textContent='The collection could not be loaded. You can still visit Jacob on TikTok.'; document.querySelector('#video-list').innerHTML=`<p class="empty"><a href="https://www.tiktok.com/@impressionking30" target="_blank" rel="noopener noreferrer">Open TikTok</a></p>`;return;}
    status.textContent=`${videos.length} ${videos.length===1?'video':'videos'}${state.category==='All'?'':` in ${state.category}`}${state.keyword?` · ${state.keyword}`:''}`;
    const sample = v => {
      const playing=String(v.id)===String(state.selected)&&state.playing;
      const name=v.character||title(v), pathId='orbit-'+v.id;
      return `<article class="sample"><h3 class="sample-name">${safe(title(v))}</h3><button type="button" class="sample-watch orbit-button" data-id="${safe(v.id)}" data-selected="${String(String(v.id)===String(state.selected)&&state.playerLoaded)}" data-playing="${playing}" aria-pressed="${playing}" aria-label="${playing?'Pause':'Play'} ${safe(title(v))}"><svg class="orbit-label" viewBox="0 0 132 132" aria-hidden="true"><defs><path id="${pathId}" d="M 17,66 A 49,49 0 1,1 115,66 A 49,49 0 1,1 17,66"/></defs><text ${name.length>18?'textLength="145" lengthAdjust="spacingAndGlyphs"':''}><textPath href="#${pathId}" startOffset="25%" text-anchor="middle">${safe(name)}</textPath></text></svg><span class="orbit-core">${icon(playing?'pause':'play')}</span></button><p class="sample-type">${safe(v.franchise || 'Original sample')}</p><div class="sample-tags">${(Array.isArray(v.categories)?v.categories:[]).map(category=>`<span>${safe(category)}</span>`).join('')}</div></article>`;
    };
    let samples = videos.map(sample).join('');
    if (state.variant === 'D' && videos.length) {
      const groups = new Map();
      videos.forEach(v=>{const name=v.franchise||'Other';if(!groups.has(name))groups.set(name,[]);groups.get(name).push(v);});
      samples = [...groups].sort((a,b)=>a[0].localeCompare(b[0])).map(([name,items])=>`<section class="sample-group"><h3>${safe(name)}</h3><div class="sample-group-list">${items.map(sample).join('')}</div></section>`).join('');
    }
    document.querySelector('#video-list').innerHTML=videos.length ? samples : '<p class="empty">No videos match. Try another search or category.</p>';
    document.querySelector('#video-list').querySelectorAll('.sample-watch').forEach(b=>b.addEventListener('click',()=>activateSample(b.dataset.id)));
    if(focusKey){const next=[...document.querySelectorAll('#filters button,#keywords button,.sample-watch')].find(button=>button.dataset[focusKey[0]]===focusKey[1]);(next||document.querySelector('#video-list')).focus({preventScroll:true});}
    if(resetFocused)document.querySelector('#search').focus({preventScroll:true});
    debug();
  }
  function changeSection(section) {if(section===state.section)return;command('pause');state.section=section;state.category='All';state.keyword='';state.search='';state.selected=sectionVideos()[0]?.id||null;state.playing=false;state.playerLoaded=false;state.drawerOpen=false;state.pendingPlay=false;const next=new URL(location.href);if(section==='music')next.searchParams.set('section','music');else next.searchParams.delete('section');history.replaceState(null,'',next);shell();document.querySelector('.section-tab[data-section="'+section+'"]').focus({preventScroll:true});}
  function selected() {return state.videos.find(v=>String(v.id)===String(state.selected));}
  function syncPlayback(){
    document.querySelectorAll('.orbit-button').forEach(button=>{const current=String(button.dataset.id)===String(state.selected),playing=current&&state.playing;button.dataset.playing=String(playing);button.dataset.selected=String(current&&state.playerLoaded);button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',`${playing?'Pause':'Play'} ${title(state.videos.find(v=>String(v.id)===button.dataset.id))}`);button.setAttribute('aria-busy',String(current&&state.playerLoaded&&!state.ready&&!state.mediaError));button.querySelector('.orbit-core').innerHTML=icon(playing?'pause':'play');});
  }
  function syncDrawer(){
    const drawer=document.querySelector('#video-drawer'),content=document.querySelector('#drawer-content'),handle=document.querySelector('#drawer-handle');
    const entering=drawer.hidden&&state.playerLoaded&&state.drawerOpen;drawer.hidden=!state.playerLoaded;if(entering){drawer.dataset.open='false';drawer.getBoundingClientRect();requestAnimationFrame(()=>{if(drawer.isConnected&&state.drawerOpen)drawer.dataset.open='true';});}else drawer.dataset.open=String(state.drawerOpen);content.inert=!state.drawerOpen;content.setAttribute('aria-hidden',String(!state.drawerOpen));handle.setAttribute('aria-expanded',String(state.drawerOpen));document.querySelector('#drawer-handle-label').textContent=state.drawerOpen?'Hide video':`Show ${title(selected())}`;
  }
  function setDrawerOpen(open){state.drawerOpen=open;if(!open){pausePlayback();if(document.querySelector('#drawer-content').contains(document.activeElement))document.querySelector('#drawer-handle').focus({preventScroll:true});}syncDrawer();debug();}
  function activateSample(id){
    const same=String(id)===String(state.selected);state.drawerOpen=true;
    if(same&&state.playerLoaded&&!state.mediaError){syncDrawer();if(state.playing){pausePlayback();}else if(state.ready){command('play');document.querySelector('#player-status').textContent='Starting… If needed, press Play in the video.';}else state.pendingPlay=true;return;}
    select(id,true);
  }
  function select(id,play=false){command('pause');state.selected=id;state.playerLoaded=true;state.drawerOpen=true;state.pendingPlay=play;state.ready=false;state.playing=false;state.duration=null;state.currentTime=0;state.excerptEnd=null;renderCatalog();loadSelected();}
  function bindDrawer(){
    const handle=document.querySelector('#drawer-handle'),drawer=document.querySelector('#video-drawer');let start=null,delta=0,dragged=false;
    handle.addEventListener('click',event=>{if(dragged){event.preventDefault();dragged=false;return;}setDrawerOpen(!state.drawerOpen);});
    handle.addEventListener('pointerdown',event=>{if(event.button!==0)return;start=event.clientY;delta=0;dragged=false;handle.setPointerCapture(event.pointerId);});
    handle.addEventListener('pointermove',event=>{if(start===null)return;delta=event.clientY-start;if(Math.abs(delta)>8){dragged=true;drawer.style.setProperty('--drag-offset',state.drawerOpen?Math.max(0,delta)+'px':Math.min(0,delta)+'px');drawer.dataset.dragging='true';}});
    const finish=event=>{if(start===null)return;start=null;drawer.style.removeProperty('--drag-offset');delete drawer.dataset.dragging;if(dragged&&Math.abs(delta)>40)setDrawerOpen(delta<0);if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);};
    handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',event=>{dragged=false;delta=0;finish(event);});
  }
  function loadSelected(){
    const v=selected(),box=document.querySelector('#player-box'), link=document.querySelector('#original-link');
    document.querySelector('#selected-title').textContent=v ? title(v) : 'No video selected';
    progress.reset();state.ready=false;state.playing=false;state.mediaError=false;state.duration=null;state.currentTime=0;state.excerptEnd=null;
    syncDrawer();syncPlayback();
    if(!state.playerLoaded||!v||!validId(v)){box.innerHTML='<div class="player-placeholder">Select a video to watch</div>'; document.querySelector('#player-status').textContent='Choose a video from the collection.';link.href='https://www.tiktok.com/@impressionking30';renderDuration();debug();return;}
    const src=`https://www.tiktok.com/player/v1/${encodeURIComponent(v.id)}?controls=1&description=0&autoplay=0`;
    const frame=document.createElement('iframe'); frame.src=src;frame.title=`TikTok video: ${title(v)}`;frame.allow='autoplay; fullscreen; picture-in-picture';frame.setAttribute('allowfullscreen','');
    box.replaceChildren(frame);link.href=`https://www.tiktok.com/@impressionking30/video/${encodeURIComponent(v.id)}`;
    document.querySelector('#player-status').textContent=`Loading ${title(v)}… If it doesn’t load, open it on TikTok.`;renderDuration();syncPlayback();debug();
  }
  function command(type,value){const frame=document.querySelector('#player-box iframe');if(frame?.contentWindow) frame.contentWindow.postMessage({'x-tiktok-player':true,type,...(value===undefined?{}:{value})},'https://www.tiktok.com');}
  function cycle(step){let list=filtered();if(!list.length) return;let i=list.findIndex(v=>String(v.id)===String(state.selected));command('pause'); select(list[i<0?(step<0?list.length-1:0):(i+step+list.length)%list.length].id,state.playing||state.rotating);}
  function playExcerpt(){const a=Number(document.querySelector('#start-time').value),b=Number(document.querySelector('#stop-time').value),status=document.querySelector('#excerpt-status');if(!state.ready){status.textContent='Wait for the video player to become ready.';return;}if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||(state.duration&&b>state.duration)){status.textContent='Choose a stop time after the start and within the video.';return;}state.excerptEnd=b;status.textContent='Playing the requested excerpt. Stop time is approximate.';command('seekTo',a);command('play');}
  const colors=[['Blue','#81bcff'],['Red','#ed8585'],['Yellow','#ecd479'],['Rose','#e8a7c1'],['Green','#a0dcac'],['Purple','#c9b0ed'],['White','#f6f4ed']];
  function renderDuration(){let text='Duration pending',color='#798594';if(Number.isFinite(state.duration)&&state.duration>0){let i=state.thresholds.findIndex(x=>state.duration<x);if(i<0)i=6;color=colors[i][1];text=`${Math.round(state.duration)} seconds · ${colors[i][0]} duration band (draft)`;}document.querySelector('#duration-display').innerHTML=`<div class="duration-bars" data-playing="${state.playing}" aria-hidden="true" style="--band:${color}">${[35,75,50,100,64,88,40,72,52,90,38,67].map(x=>`<i style="--h:${x}%"></i>`).join('')}</div><p>${safe(text)}</p>`;}
  function debug(){const el=document.querySelector('#debug-state');if(el)el.textContent=JSON.stringify({layout:`${state.variant} — ${variants[state.variant]}`,video:selected()?title(selected()):null,section:state.section,category:state.category,keyword:state.keyword,search:state.search,player:state.ready?'ready':'waiting',drawer:state.playerLoaded?(state.drawerOpen?'open':'collapsed'):'unused',playing:state.playing,durationSeconds:state.duration,autoNext:state.rotating,playbackSource:state.playbackSource,lastPlayerEvent:state.lastPlayerEvent,reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches},null,2);}
  window.addEventListener('message',event=>{
    const iframe=document.querySelector('#player-box iframe');
    if(!iframe)return;
    const message=PlayerSignals.normalize(event,iframe.contentWindow);
    if(!message)return;
    const {type,value}=message;state.lastPlayerEvent=type;
    if(type==='onPlayerReady'){
      state.ready=true;
      document.querySelector('#player-status').textContent=`${title(selected())} · Ready. If needed, press Play in the video.`;
      if(state.pendingPlay&&state.drawerOpen){state.pendingPlay=false;command('play');}
      syncPlayback();
    }else if(type==='onCurrentTime'){
      const duration=Number(value.duration),time=Number(value.currentTime);
      if(Number.isFinite(duration)&&duration>0&&Math.abs(duration-(state.duration||0))>.1){state.duration=duration;renderDuration();}
      if(Number.isFinite(time)){
        state.currentTime=time;
        if(!document.hidden)progress.observe(time);
        if(state.excerptEnd!==null&&time>=state.excerptEnd){pausePlayback();document.querySelector('#excerpt-status').textContent='Excerpt finished.';}
      }
    }else if(type==='onStateChange'){
      progress.reset();setPlaying(value===1,'state-event');
      document.querySelector('#player-status').textContent=`${title(selected())} · ${state.playing?'Playing':value===3?'Buffering':value===0?'Finished':'Paused'}`;
      if(value===0&&state.rotating&&state.drawerOpen)cycle(1);
    }else if(type==='onPlayerError'){
      progress.reset();state.ready=false;state.playing=false;state.pendingPlay=false;state.mediaError=true;syncPlayback();renderDuration();
      document.querySelector('#player-status').textContent='TikTok could not play this video here. Use Open on TikTok to try there.';
    }
    debug();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pausePlayback();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&state.drawerOpen&&document.querySelector('#theme-panel')?.hidden){setDrawerOpen(false);document.querySelector('#drawer-handle').focus({preventScroll:true});}});
  function switchVariant(offset){command('pause');const idx=keys.indexOf(state.variant); state.variant=keys[(idx+offset+keys.length)%keys.length];let u=new URL(location.href);u.searchParams.set('variant',state.variant);history.replaceState(null,'',u);shell();}
  document.querySelector('#variant-prev').addEventListener('click',()=>switchVariant(-1));document.querySelector('#variant-next').addEventListener('click',()=>switchVariant(1));
  document.addEventListener('keydown',e=>{const t=e.target;if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||t.closest('input,textarea,select,button,a,iframe,[contenteditable="true"]'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();switchVariant(e.key==='ArrowLeft'?-1:1);}});
  Promise.allSettled([fetch('/data/catalog.json').then(r=>{if(!r.ok)throw Error('catalog unavailable');return r.json();}),Promise.resolve({answers:{duration_thresholds:'15,30,45,60,90,120'}})]).then(([catalog,plan])=>{if(catalog.status==='fulfilled'&&Array.isArray(catalog.value.videos)){state.videos=catalog.value.videos.filter(validId);state.selected=sectionVideos()[0]?.id||null;}else state.error='unavailable';if(plan.status==='fulfilled'){const raw=plan.value?.answers?.duration_thresholds;if(typeof raw==='string'){const n=raw.split(',').map(s=>Number(s.trim()));if(n.length===6&&n.every((v,i)=>Number.isFinite(v)&&v>0&&(i===0||v>n[i-1])))state.thresholds=n;}}shell();});
})();
