// One shared, locally served tooltip treatment for Joe’s interfaces.
export function help(root=document){
 root.querySelectorAll('[title]').forEach(el=>{el.dataset.help=el.getAttribute('title');el.removeAttribute('title');});
 root.querySelectorAll('[data-help]').forEach(el=>{
  if(el._tippy){el._tippy.setContent(el.dataset.help);return;}
  window.tippy(el,{content:el.dataset.help,theme:'joe',allowHTML:false,appendTo:()=>el.closest('dialog,[popover]')||document.body,popperOptions:{strategy:'fixed'},
   hideOnClick:false,trigger:'mouseenter focus',touch:['hold',450],delay:[250,0],duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:[120,80],
   maxWidth:320,interactive:true,aria:{content:'describedby',expanded:false},
   onShow(instance){if(el.disabled)return false;},
  });
 });
}
document.addEventListener('keydown',event=>{if(event.key==='Escape')window.tippy.hideAll();});
