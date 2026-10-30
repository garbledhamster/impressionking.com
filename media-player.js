/* Original TikTok embeds. UI state follows player messages and actual time progress. */
(()=>{
 'use strict';
 const icon=n=>`<span class="g-icon" style="--g-icon:url('/assets/icons/${n}.svg')" aria-hidden="true"></span>`;
 const drawer=document.createElement('section');drawer.id='g-player';drawer.className='g-player';drawer.hidden=true;drawer.dataset.open='false';drawer.setAttribute('aria-label','Video player');
 drawer.innerHTML=`<button id="g-player-handle" class="g-player-handle" type="button" aria-expanded="false" aria-controls="g-player-content"><span></span><b>Hide video</b></button><div id="g-player-content"><div class="g-player-top"><h2 id="g-player-title">Sample</h2><button id="g-player-close" class="g-nav-button" type="button" aria-label="Close video">${icon('x-mark')}</button></div><div class="g-player-body"><div id="g-player-frame"></div><div class="g-player-tools"><div class="g-player-actions"><button id="g-toggle" type="button">${icon('play')}Play</button><button id="g-stop" type="button">${icon('stop')}Stop</button><button id="g-video-prev" type="button" aria-label="Previous video">${icon('arrow-left')}</button><button id="g-video-next" type="button" aria-label="Next video">${icon('arrow-right')}</button></div><div class="g-bars" aria-hidden="true">${[.4,.8,.55,1,.65,.85,.45,.7,.55,.9,.4,.65].map((h,i)=>`<i style="--h:${h};--delay:${i*-.11}s"></i>`).join('')}</div><p id="g-play-status" role="status">Press Play in the video if needed.</p><div class="g-player-links"><button id="g-auto-next" type="button" aria-pressed="false">Auto-next: off</button><a id="g-original" target="_blank" rel="noopener noreferrer">TikTok ${icon('arrow-top-right-on-square')}</a></div><details class="g-excerpt"><summary>Play a section</summary><div><label>Start, sec<input id="g-excerpt-start" type="number" min="0" value="0"></label><label>End, sec<input id="g-excerpt-end" type="number" min="1" value="15"></label><button id="g-excerpt-play" type="button">Play section</button></div><small>Uses this video. End time is approximate.</small></details></div></div></div>`;
 document.body.append(drawer);
 const frameBox=drawer.querySelector('#g-player-frame'),content=drawer.querySelector('#g-player-content'),handle=drawer.querySelector('#g-player-handle'),status=drawer.querySelector('#g-play-status');
 let video=null,queue=[],playing=false,ready=false,currentTime=0,duration=null,autoNext=false,excerptEnd=null;
 const thresholds=[15,30,45,60,90,120],bands=['#55bfff','#f05252','#f4d650','#f07a9c','#56d693','#b690f5','#f5f5f5'];
 const command=(type,value)=>frameBox.querySelector('iframe')?.contentWindow?.postMessage({'x-tiktok-player':true,type,...(value===undefined?{}:{value})},'https://www.tiktok.com');
 function sync(){
  drawer.querySelector('#g-toggle').innerHTML=icon(playing?'pause':'play')+(playing?'Pause':'Play');drawer.querySelector('.g-bars').dataset.playing=String(playing);
  let band=duration?thresholds.findIndex(n=>duration<n):-2;if(band===-1)band=6;drawer.querySelector('.g-bars').style.setProperty('--band',band>=0?bands[band]:'#9a9a9a');
  document.dispatchEvent(new CustomEvent('creator:playback',{detail:{id:video?.id||null,playing,ready,currentTime,duration}}));
 }
 const progress=new PlayerSignals.ProgressTracker(value=>{if(drawer.dataset.open==='true'){playing=value;sync();}});
 function setPlaying(value){playing=value;if(!value)progress.reset();sync();}
 function setOpen(open){drawer.dataset.open=String(open);handle.setAttribute('aria-expanded',String(open));handle.querySelector('b').textContent=open?'Hide video':'Show '+(video?.character||video?.title||'video');content.inert=!open;content.setAttribute('aria-hidden',String(!open));if(!open){command('pause');setPlaying(false);handle.focus({preventScroll:true});}}
 function close(){command('pause');progress.reset();frameBox.replaceChildren();drawer.hidden=true;video=null;ready=false;playing=false;currentTime=0;duration=null;excerptEnd=null;sync();}
 function open(item,items){
  close();video=item;queue=items||[item];drawer.querySelector('#g-player-title').textContent=item.title;drawer.querySelector('#g-original').href=`https://www.tiktok.com/@impressionking30/video/${item.id}`;
  const frame=document.createElement('iframe');frame.src=`https://www.tiktok.com/player/v1/${item.id}?autoplay=1&controls=1&description=0`;frame.title=item.title;frame.allow='autoplay; fullscreen';frame.allowFullscreen=true;frameBox.append(frame);drawer.hidden=false;drawer.dataset.open='false';drawer.getBoundingClientRect();requestAnimationFrame(()=>setOpen(true));status.textContent='Press Play in the video if needed.';sync();
 }
 function cycle(step,explicit=true){if(!video||!queue.length)return;const item=queue[(queue.findIndex(v=>v.id===video.id)+step+queue.length)%queue.length];open(item,queue);if(explicit)document.dispatchEvent(new CustomEvent('creator:selection',{detail:item}));}
 function toggle(id){if(!video||video.id!==id)return false;if(drawer.dataset.open!=='true')setOpen(true);command(playing?'pause':'play');return true;}
 function stop(){command('pause');command('seekTo',0);progress.reset();currentTime=0;excerptEnd=null;setPlaying(false);status.textContent='Stopped · 0 seconds';}
 drawer.querySelector('#g-toggle').onclick=()=>{if(video)toggle(video.id);};drawer.querySelector('#g-stop').onclick=stop;drawer.querySelector('#g-player-close').onclick=close;
 drawer.querySelector('#g-video-prev').onclick=()=>cycle(-1);drawer.querySelector('#g-video-next').onclick=()=>cycle(1);drawer.querySelector('#g-auto-next').onclick=e=>{autoNext=!autoNext;e.currentTarget.setAttribute('aria-pressed',String(autoNext));e.currentTarget.textContent='Auto-next: '+(autoNext?'on':'off');};
 drawer.querySelector('#g-excerpt-play').onclick=()=>{const a=Number(drawer.querySelector('#g-excerpt-start').value),b=Number(drawer.querySelector('#g-excerpt-end').value);if(!ready){status.textContent='Wait for the video to load first.';return;}if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||(duration&&b>duration)){status.textContent='Choose an end after the start, within this video.';return;}excerptEnd=b;command('seekTo',a);command('play');status.textContent='Playing the selected section.';};
 let start=null,dragged=false;
 handle.addEventListener('pointerdown',e=>{start=e.clientY;dragged=false;handle.setPointerCapture(e.pointerId);});handle.addEventListener('pointermove',e=>{if(start!==null&&Math.abs(e.clientY-start)>10)dragged=true;});
 handle.addEventListener('pointerup',e=>{if(start===null)return;const delta=e.clientY-start;start=null;if(dragged&&Math.abs(delta)>40)setOpen(delta<0);if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);});handle.addEventListener('pointercancel',()=>{start=null;dragged=false;});handle.onclick=()=>{if(dragged){dragged=false;return;}setOpen(drawer.dataset.open!=='true');};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden&&drawer.dataset.open==='true')setOpen(false);});
 window.addEventListener('message',e=>{
  const frame=frameBox.querySelector('iframe');if(!frame)return;const message=PlayerSignals.normalize(e,frame.contentWindow);if(!message)return;
  if(message.type==='onPlayerReady'){ready=true;command('play');sync();}
  else if(message.type==='onStateChange'){setPlaying(message.value===1);if(message.value===0&&autoNext)cycle(1,false);}
  else if(message.type==='onCurrentTime'){
   const t=Number(message.value.currentTime),d=Number(message.value.duration);if(Number.isFinite(d)&&d>0)duration=d;if(Number.isFinite(t)&&t>=0){currentTime=t;progress.observe(t);if(excerptEnd!==null&&t>=excerptEnd){excerptEnd=null;command('pause');setPlaying(false);status.textContent='Section finished.';}else status.textContent=`${Math.floor(t)}${duration?' / '+Math.round(duration):''} seconds`;}sync();
  }else if(message.type==='onPlayerError'){playing=false;status.textContent='This embed is unavailable. Open the original on TikTok.';sync();}
 });
 window.CreatorPlayer={open,toggle,close,stop};
})();
