'use strict';
// Room data and everything derived from it: placement rules, paint order, the cached picture and the screen masks.
// A room is plain JSON: {v, style?, items:[{id,type,i,j,r,on?} | {id,type,wall,a,z}], ...}. `on` is the id of the item it stands on.
// Sandbox = the free drawing board (every item unlimited, starts from the demo room). Otherwise the game rules in game.js apply.
const SANDBOX=['sandbox','default','stress','live'].some(k=>QUERY.has(k));
const STORE_KEY=SANDBOX?'theroom.room.v1':'theroom.game.room.v1',SNAP=.5,WALL_SNAP_Z=.25;
// A room starts ROOM_SIZE × ROOM_SIZE and can be pushed out along either open edge, ROOM_STEP tiles at a time.
const ROOM_STEP=2,ROOM_MAX=18,roomSide=v=>Math.max(ROOM_SIZE,Math.min(ROOM_MAX,Math.round(+v)||ROOM_SIZE));
const canExpand=side=>(side==='i'?ROOM_W:ROOM_D)+ROOM_STEP<=ROOM_MAX;
const DEFAULT_ROOM={v:1,items:[
 // left wall (constant i), a = position along j
 ...[0,1].flatMap(row=>[0,1,2].map(k=>({type:'wallScreenS',wall:'j',a:.5+k*2,z:1.25+row*1,mode:['bars','orbit','grid','code','wave','map'][row*3+k]}))),
 {type:'label',wall:'j',a:7,z:2.75,text:'SIGNAL ARCHIVE / 06'},
 // right wall (constant j)
 {type:'wallScreenL',wall:'i',a:1,z:1.5,mode:'map'},{type:'label',wall:'i',a:1,z:.75,text:'NETWORK / NIGHT SHIFT'},
 {type:'wallScreenM',wall:'i',a:6,z:2.25,mode:'bars'},{type:'wallScreenM',wall:'i',a:9,z:2.25,mode:'wave'},
 {type:'patchboard',wall:'i',a:6,z:1.5},{type:'clock',wall:'i',a:11,z:1.25},
 {type:'rugLarge',i:3.5,j:4,r:0},
 // back workbench
 {id:'bench',type:'deskLarge',i:6,j:.5,r:0},
 {type:'monitor',on:'bench',i:6,j:.5,r:0,mode:'code'},{type:'monitor',on:'bench',i:8,j:.5,r:0,mode:'grid'},
 {type:'keyboard',on:'bench',i:6.5,j:1.5,r:0},{type:'keyboard',on:'bench',i:8,j:1.5,r:0},
 {type:'speaker',on:'bench',i:10,j:.5,r:0},{type:'mug',on:'bench',i:9.5,j:1.5,r:0},{type:'books',on:'bench',i:11,j:.5,r:0},
 // server corner
 {id:'rack',type:'rack',i:0,j:7.5,r:1},{type:'plantSmall',on:'rack',i:.5,j:9.5,r:0},
 // main desk
 {id:'main',type:'deskLarge',i:3.5,j:4.5,r:0},
 {type:'monitor',on:'main',i:3.5,j:4.5,r:0,mode:'code'},{type:'monitor',on:'main',i:5.5,j:4.5,r:0,mode:'orbit'},{type:'monitor',on:'main',i:7.5,j:4.5,r:0,mode:'wave'},
 {type:'keyboard',on:'main',i:4.5,j:5.5,r:0},{type:'keyboard',on:'main',i:7,j:5.5,r:0},{type:'mousepad',on:'main',i:6,j:5.5,r:0},
 {type:'speaker',on:'main',i:3.5,j:5,r:0},{type:'mug',on:'main',i:8.5,j:5.5,r:0},{type:'books',on:'main',i:8.5,j:5,r:0},{type:'headphones',on:'main',i:8,j:5.5,r:0},
 {type:'spark',on:'main',i:7,j:5,r:0},
 {type:'chair',i:5.5,j:7,r:0},{type:'tower',i:9.5,j:6,r:0},
 // television corner
 {id:'tv',type:'crtBig',i:9,j:9,r:0,mode:'bars'},{type:'crtSmall',on:'tv',i:9,j:9.5,r:0,mode:'orbit'},
 // spare terminal
 {id:'spare',type:'deskLow',i:2.5,j:9.5,r:0},{type:'terminal',on:'spare',i:2.5,j:9.5,r:0,mode:'code'},
 {type:'keyboard',on:'spare',i:2.5,j:10.5,r:0},{type:'mug',on:'spare',i:4.5,j:10.5,r:0},{type:'books',on:'spare',i:4,j:9.5,r:0},
 {type:'plantLarge',i:.5,j:10.5,r:0},{type:'printer',i:10,j:3,r:0},{type:'plantLarge',i:11,j:2,r:0},
 {type:'papers',i:7,j:9.5,r:0},{type:'floppy',i:8,j:10,r:0}
]};
let room,nextId=1;
function loadRoom(data){room=JSON.parse(JSON.stringify(data));room.w=roomSide(room.w);room.d=roomSide(room.d);setRoomSize(room.w,room.d);room.items=room.items.filter(it=>ITEMS[it.type]);for(const it of room.items)if(!it.id)it.id='n'+nextId++;
 for(const it of room.items){const n=/^n(\d+)$/.exec(it.id);if(n)nextId=Math.max(nextId,+n[1]+1)}
 for(const it of room.items)if(it.on&&!itemById(it.on))delete it.on}
function saveRoom(){try{localStorage.setItem(STORE_KEY,JSON.stringify(room))}catch{}}
function storedRoom(){try{const data=JSON.parse(localStorage.getItem(STORE_KEY));return data&&Array.isArray(data.items)?data:null}catch{return null}}
const itemById=id=>room.items.find(it=>it.id===id);
const childrenOf=it=>room.items.filter(other=>other.on===it.id);
const newItem=type=>ITEMS[type].kind==='wall'?{id:'n'+nextId++,type,wall:'i',a:0,z:1}:{id:'n'+nextId++,type,i:0,j:0,r:0};

// ---- GEOMETRY OF A PLACED ITEM ---------------------------------------------
const kindOf=it=>ITEMS[it.type].kind;
const floorZ=it=>it.on?ITEMS[itemById(it.on).type].top:0;
function footprint(it){const def=ITEMS[it.type],turned=it.r%2===1;return{i0:it.i,j0:it.j,i1:it.i+(turned?def.d:def.w),j1:it.j+(turned?def.w:def.d)}}
const wallSpan=it=>({a0:it.a,a1:it.a+ITEMS[it.type].w,z0:it.z,z1:it.z+ITEMS[it.type].h});
const EPS=1e-6,meet=(a,b)=>a.i0<b.i1-EPS&&b.i0<a.i1-EPS&&a.j0<b.j1-EPS&&b.j0<a.j1-EPS,inside=(a,b)=>a.i0>=b.i0-EPS&&a.j0>=b.j0-EPS&&a.i1<=b.i1+EPS&&a.j1<=b.j1+EPS;
function outline(it){const def=ITEMS[it.type];if(def.kind==='wall')return quad(wallFrame(it,def),0,0,1,1);const f=footprint(it);return silhouette(f.i0,f.j0,f.i1-f.i0,f.j1-f.j0,floorZ(it),def.h)}

// May `it` stand where it is now? `ignore` is a set of ids left out of the check (the item itself and whatever moves with it).
function placementOk(it,ignore=new Set([it.id])){const def=ITEMS[it.type],others=room.items.filter(o=>!ignore.has(o.id));
 if(def.kind==='wall'){const s=wallSpan(it);if(s.a0<-EPS||s.a1>(it.wall==='i'?ROOM_W:ROOM_D)+EPS||s.z0<(def.onFloor?0:.25)-EPS||s.z1>WALL_H-.1+EPS)return false;
  return!others.some(o=>kindOf(o)==='wall'&&o.wall===it.wall&&(t=>s.a0<t.a1-EPS&&t.a0<s.a1-EPS&&s.z0<t.z1-EPS&&t.z0<s.z1-EPS)(wallSpan(o)))}
 const f=footprint(it);if(!inside(f,{i0:0,j0:0,i1:ROOM_W,j1:ROOM_D}))return false;
 if(it.on){const parent=itemById(it.on);if(!parent||!def.canStack||ITEMS[parent.type].top==null||!inside(f,footprint(parent)))return false;return!others.some(o=>o.on===it.on&&meet(f,footprint(o)))}
 return!others.some(o=>kindOf(o)===def.kind&&!o.on&&meet(f,footprint(o)))}

// Quarter turn. Whatever stands on the item turns with it, around the item's own corner.
function turn(it){if(kindOf(it)==='wall'){it.wall=it.wall==='i'?'j':'i';return}
 const f=footprint(it),W=f.i1-f.i0;for(const k of childrenOf(it)){const g=footprint(k),x=g.i0-f.i0,y=g.j0-f.j0,cw=g.i1-g.i0;k.i=f.i0+y;k.j=f.j0+W-(x+cw);k.r=(k.r+1)%4}it.r=(it.r+1)%4}

// ---- PAINT ORDER -----------------------------------------------------------
// Far things first. For boxes that do not intersect, A is behind B when A ends before B begins along i or along j;
// the pairs where that is one-sided form a graph, which is walked in order with the plain depth as tie-break.
function farToNear(items){const n=items.length,F=items.map(footprint),depth=f=>f.i0+f.i1+f.j0+f.j1,byDepth=(a,b)=>depth(F[a])-depth(F[b]);
 if(n>400)return items.map((_,k)=>k).sort(byDepth).map(k=>items[k]);
 const after=items.map(()=>[]),waiting=new Array(n).fill(0);
 for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const ab=F[a].i1<=F[b].i0+EPS||F[a].j1<=F[b].j0+EPS,ba=F[b].i1<=F[a].i0+EPS||F[b].j1<=F[a].j0+EPS;
  if(ab&&!ba){after[a].push(b);waiting[b]++}else if(ba&&!ab){after[b].push(a);waiting[a]++}}
 const left=new Set(items.map((_,k)=>k)),out=[];
 while(left.size){let pick=-1;for(const k of left)if(!waiting[k]&&(pick<0||byDepth(k,pick)<0))pick=k;if(pick<0)for(const k of left)if(pick<0||byDepth(k,pick)<0)pick=k; // a cycle: take the farthest
  left.delete(pick);out.push(items[pick]);for(const k of after[pick])waiting[k]--}
 return out}
function paintOrderOf(items){const floor=items.filter(it=>kindOf(it)==='floor'&&!it.on);
 return[...items.filter(it=>kindOf(it)==='wall'),...items.filter(it=>kindOf(it)==='rug'),...farToNear(floor).flatMap(it=>[it,...farToNear(items.filter(k=>k.on===it.id))])]}

// ---- BUILDING THE PICTURE ----------------------------------------------------
const paintList=[],liveItems=[];
function drawItem(it){const def=ITEMS[it.type];if(def.kind==='wall')def.draw(wallFrame(it,def),it);else def.draw(frame(it,def,floorZ(it)),it)}
function drawShell(){const W=ROOM_W,D=ROOM_D;
 box(0,0,W,D,-.4,.4,'blue',.6);fill(tile(0,0,W,D),'teal',.23,false);
 for(let a=0;a<=W;a++)line([p(a,0),p(a,D)],'blue',.65,.38);for(let b=0;b<=D;b++)line([p(0,b),p(W,b)],'blue',.65,.38);
 for(let a=0;a<W;a++)for(let b=0;b<D;b++)if((a+b)%2===0)shade(tile(a+.035,b+.035,.93,.93),.06);
 shape(faceJ(0,0,D,0,WALL_H),'blue',.72);fill(faceJ(0,0,D,0,WALL_H),'teal',.24,false);
 shape(faceI(0,0,W,0,WALL_H),'blue',.8);
 box(-.13,-.13,.13,D+.13,WALL_H,.12,'coral',.55);box(0,-.13,W,.13,WALL_H,.12,'coral',.5);
 line([p(0,D-.2,.12),p(0,0,.12),p(W-.2,0,.12)],'coral',3,.75);
 for(let b=1;b<D;b++)line([p(0,b,.2),p(0,b,WALL_H)],'paper',.6,.12);for(let a=1;a<W;a++)line([p(a,0,.2),p(a,0,WALL_H)],'paper',.6,.12)}
// ?stress=N scatters N extra static props; they land in the cached picture like any other furniture.
const STRESS=Math.max(0,Math.min(20000,parseInt(QUERY.get('stress'))||0));
function stressProps(){const r=rng(9001),kinds=['crate','plantSmall','speaker','books','mug'],out=[];for(let n=0;n<STRESS;n++)out.push({id:'s'+n,type:kinds[Math.floor(r()*kinds.length)],i:Math.round(r()*22)/2,j:Math.round(r()*22)/2,r:Math.floor(r()*4)});return out}
function buildRoom(skip){screens.length=0;paintList.length=0;liveItems.length=0;drawShell();
 let list=paintOrderOf(room.items.filter(it=>!skip||!skip.has(it.id)));
 if(STRESS){const depth=it=>kindOf(it)!=='floor'?-1:(f=>f.i0+f.i1+f.j0+f.j1)(footprint(it.on?itemById(it.on):it));list=[...list,...stressProps()].map((it,k)=>[it,k]).sort((a,b)=>depth(a[0])-depth(b[0])||a[1]-b[1]).map(a=>a[0])}
 list.forEach((it,k)=>{paintIndex=k;drawItem(it);if(ITEMS[it.type].live)liveItems.push(it)});paintList.push(...list)}
// What stands in front of each screen, as a small bitmap per screen. Most screens have nothing in front and get none.
function buildMasks(scale){const previous=c;for(const s of screens){s.mask=null;const bb=bounds(s.outer),front=paintList.filter((it,k)=>k>s.order&&boundsMeet(bb,bounds(outline(it))));if(!front.length)continue;
  const cv=document.createElement('canvas');cv.width=Math.ceil(bb.w*scale);cv.height=Math.ceil(bb.h*scale);const g=cv.getContext('2d',{willReadFrequently:true});g.setTransform(scale,0,0,scale,-bb.x*scale,-bb.y*scale);
  c=g;path(s.outer);g.clip(); // only what covers the screen itself counts
  maskMode=true;registering=false;for(const it of front)drawItem(it);maskMode=false;registering=true;
  const data=g.getImageData(0,0,cv.width,cv.height).data;let covered=false;for(let k=3;k<data.length;k+=12)if(data[k]){covered=true;break}
  if(covered){s.mask=cv;s.bb=bb}}c=previous}
