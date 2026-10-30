/* Shared Joe tooltip treatment: hover, keyboard focus, touch hold and Escape. */
(()=>{
 if(!window.tippy)return;
 document.querySelectorAll('#g-player [data-help]').forEach(element=>tippy(element,{
  content:element.dataset.help,theme:'joe',allowHTML:false,appendTo:()=>document.body,popperOptions:{strategy:'fixed'},
  hideOnClick:false,trigger:'mouseenter focus',touch:['hold',450],delay:[250,0],
  duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:[120,80],maxWidth:280,interactive:true,
  aria:{content:'describedby',expanded:false},onShow(instance){instance.setContent(instance.reference.dataset.help);}
 }));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')tippy.hideAll();});
})();
