/* Normalize the official iframe boundary; recover missing state events from time. */
(() => {
  const known=new Set(['onPlayerReady','onStateChange','onCurrentTime','onPlayerError']);
  function normalize(event,source){
    if(event.origin!=='https://www.tiktok.com'||event.source!==source)return null;
    let data=event.data;
    if(typeof data==='string'){
      if(data.length>65536)return null;
      try{data=JSON.parse(data);}catch{return null;}
    }
    if(!data||typeof data!=='object'||!known.has(data.type))return null;
    let value=data.value;
    if(data.type==='onStateChange'){
      if(value&&typeof value==='object')value=value.state;
      if(typeof value==='string'&&/^[0-3]$/.test(value))value=Number(value);
      if(![0,1,2,3].includes(value))return null;
    }
    if(data.type==='onCurrentTime'&&(!value||typeof value!=='object'))return null;
    return {type:data.type,value};
  }
  class ProgressTracker{
    constructor(onChange){this.onChange=onChange;this.previous=null;this.steps=0;this.timer=null;}
    reset(){clearTimeout(this.timer);this.timer=null;this.previous=null;this.steps=0;}
    observe(time){
      if(!Number.isFinite(time)||time<0)return;
      const delta=this.previous===null?null:time-this.previous;
      this.previous=time;
      if(delta!==null&&delta>.01&&delta<2.5){
        this.steps++;
        clearTimeout(this.timer);
        this.timer=setTimeout(()=>{this.steps=0;this.onChange(false);},1800);
        if(this.steps>=2)this.onChange(true);
      }else if(delta!==null&&(delta<0||delta>=2.5)){
        clearTimeout(this.timer);this.steps=0;
      }
    }
  }
  globalThis.PlayerSignals={normalize,ProgressTracker};
})();
