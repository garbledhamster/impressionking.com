/* Service choices and cart snapshots. No storage, network or contact details. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CreatorServicesModel=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const DIRECTIONS=Object.freeze(['Cinematic','Playful','Intense','Let Jacob suggest']);
 const SERVICES=Object.freeze([
  {id:'trailers',name:'Trailer voiceover',short:'Trailers',icon:'play-circle',art:'hoodie-trailer-standing',alt:'Jacob’s avatar at a studio microphone',projects:['Game trailer','Film trailer','Channel promo'],description:'For game reveals, film trailers and channel promos.'},
  {id:'voices',name:'Voice work',short:'Voices',icon:'microphone',art:'hoodie-phone-wired-v2',alt:'Jacob’s avatar rehearsing lines from a phone',projects:['Character dialogue','Narration','Personal message'],description:'Character dialogue, narration and personal messages.'},
  {id:'beats',name:'Music & beats',short:'Beats',icon:'musical-note',art:'hoodie-beats-table-v2',alt:'Jacob’s avatar working at a beat controller',projects:['Custom beat','Instrumental','Project music'],description:'Custom beats, instrumentals and project music.'}
 ].map(s=>Object.freeze({...s,projects:Object.freeze(s.projects)})));
 const definition=id=>{const service=SERVICES.find(s=>s.id===id);if(!service)throw new RangeError('Unknown service');return service;};
 function createOrder(){
  let current='trailers';const choices=new Map(SERVICES.map(s=>[s.id,{service:s.id,direction:'Let Jacob suggest',project:s.projects[0],reference:''}])),items=new Map();
  const selection=()=>({...choices.get(current)}),cart=()=>[...items.values()].map(s=>({...s}));
  function select(id,reference,project){const service=definition(id);if(project!==undefined&&!service.projects.includes(project))throw new RangeError('Unknown project');current=id;const next=choices.get(id);if(reference!==undefined)next.reference=String(reference);if(project!==undefined)next.project=project;return selection();}
  function configure({direction,project}){const service=definition(current);if(direction!==undefined&&!DIRECTIONS.includes(direction))throw new RangeError('Unknown direction');if(project!==undefined&&!service.projects.includes(project))throw new RangeError('Unknown project');Object.assign(choices.get(current),direction===undefined?{}:{direction},project===undefined?{}:{project});return selection();}
  function add(){const next=selection(),before=items.get(current),action=!before?'added':JSON.stringify(before)===JSON.stringify(next)?'unchanged':'updated';items.set(current,next);return{action,item:{...next}};}
  return{selection,cart,select,configure,add,remove:id=>items.delete(id),clear:()=>items.clear(),definition};
 }
 return{SERVICES,DIRECTIONS,createOrder,definition};
});
