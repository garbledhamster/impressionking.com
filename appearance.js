/* Restore saved appearance without exposing theme controls. */
(()=>{
 const defaults={background:'#303030',surface:'#3b3b3b',edge:'#626262',muted:'#d0d0d0',radius:'4px',spacing:'14px'},root=document.documentElement;
 let values={...defaults};try{values={...defaults,...JSON.parse(localStorage.getItem('ik-appearance-v1')||'{}')}}catch{}
 function apply(){for(const[key,value]of Object.entries(values))if(Object.hasOwn(defaults,key))root.style.setProperty('--'+(key==='radius'?'card-radius':key==='spacing'?'layout-gap':key),value);}
 apply();
})();
