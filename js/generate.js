'use strict';
// Furnishes a room from a number: same seed, same room. `amount` runs from 0 (to let) through .2 (just moved in) to 1 (full).
// First rough version, used by the building sketches; the wallet-derived rooms will grow out of this.
function generateRoom(seed,amount){const r=rng(seed),items=[];room={v:1,items};let n=0;
 const half=v=>Math.round(v*2)/2,keep=it=>{it.id='g'+n++;items.push(it);if(placementOk(it))return it;items.pop();return null};
 const floorItem=(type,turn,tries=30)=>{const def=ITEMS[type];for(let t=0;t<tries;t++){const rr=turn??Math.floor(r()*4),fw=rr%2?def.d:def.w,fd=rr%2?def.w:def.d,it=keep({type,r:rr,i:half(r()*(12-fw)),j:half(r()*(12-fd))});if(it)return it}return null};
 const on=(parent,type,turn,where)=>{const def=ITEMS[type],f=footprint(parent);for(let t=0;t<25;t++){const rr=turn??Math.floor(r()*4),fw=rr%2?def.d:def.w,fd=rr%2?def.w:def.d;if(fw>f.i1-f.i0||fd>f.j1-f.j0)return null;
   let i=f.i0+half(r()*(f.i1-f.i0-fw)),j=f.j0+half(r()*(f.j1-f.j0-fd));if(where==='back'){if(parent.r%2)i=f.i0;else j=f.j0}if(where==='front'){if(parent.r%2)i=f.i1-fw;else j=f.j1-fd}
   const it=keep({type,on:parent.id,r:rr,i,j});if(it)return it}return null};
 const wall=(type,mode)=>{const def=ITEMS[type];for(let t=0;t<25;t++){const it=keep({type,wall:r()<.5?'i':'j',a:half(r()*(12-def.w)),z:.75+Math.round(r()*(2.5-def.h)*4)/4,mode});if(it)return it}return null};
 const pick=list=>list[Math.floor(r()*list.length)],mode=()=>pick(SCREEN_MODES);
 if(amount<=0){const sign=wall('label');if(sign)sign.text='KİRALIK';return room}
 if(amount<.25){for(let k=0;k<3;k++)floorItem('crate');floorItem('plantLarge');return room} // just moved in
 if(r()<.8)floorItem(pick(['rugLarge','rugSmall']),Math.floor(r()*2));
 const desks=1+Math.floor(amount*2.2);
 for(let d=0;d<desks;d++){const turn=Math.floor(r()*2),desk=floorItem(pick(['deskLarge','deskMedium','deskMedium','deskLow']),turn);if(!desk)continue;
  const f=footprint(desk),len=Math.max(f.i1-f.i0,f.j1-f.j0);for(let m=0;m<Math.floor(len/2);m++)if(r()<.5+amount*.5){const m=on(desk,pick(['monitor','monitor','terminal']),turn,'back');if(m)m.mode=mode()}
  for(let m=0;m<1+Math.floor(amount*2);m++)on(desk,'keyboard',turn,'front');
  for(const extra of['mug','books','speaker','plantSmall','headphones','mousepad','spark'])if(r()<amount*.6)on(desk,extra);
  keep({type:'chair',r:turn,i:turn?f.i1:f.i0+half(r()*(f.i1-f.i0-1)),j:turn?f.j0+half(r()*(f.j1-f.j0-1)):f.j1})}
 if(r()<amount){const rack=floorItem('rack',Math.floor(r()*2));if(rack&&r()<.6)on(rack,'plantSmall')}
 if(r()<amount*.8){const tv=floorItem('crtBig',Math.floor(r()*2));if(tv){tv.mode=mode();const top=on(tv,'crtSmall',tv.r);if(top)top.mode=mode()}}
 for(const type of['tower','printer','crate','plantLarge','plantLarge'])if(r()<amount*.7)floorItem(type,Math.floor(r()*2));
 for(let k=0;k<Math.floor(amount*7);k++)wall(pick(['wallScreenS','wallScreenS','wallScreenM','wallScreenL','poster','clock','patchboard']),mode());
 return room}
