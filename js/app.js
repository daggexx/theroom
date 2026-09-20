'use strict';
// The page: cached room picture, camera, frame loop, meters, the screen dialog and the room editor.
const $=id=>document.getElementById(id);
const base=document.createElement('canvas'),paper=document.createElement('canvas'),SCALE=2;
let width=0,height=0,dpr=1,zoom=1,pan={x:0,y:0},paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,last=0,paintAt=0;

// ---- STRESS TEST ---------------------------------------------------------
// ?stress=500 static props · ?live=100 animated props redrawn every frame · ?pan keeps the camera moving · ?hud only shows the meter.
const count=k=>Math.max(0,Math.min(20000,parseInt(QUERY.get(k))||0));
const LIVE=count('live'),AUTOPAN=QUERY.has('pan'),HUD=STRESS||LIVE||AUTOPAN||QUERY.has('hud')?$('hud'):null;
const liveProps=[],stats={build:0,render:[],move:[],gap:0,paints:0,frames:0,slow:0,since:0};
{const r=rng(777),inks=['coral','teal','sun'];for(let n=0;n<LIVE;n++)liveProps.push({i:.4+r()*11,j:.4+r()*11,ph:r()*TAU,ink:inks[n%3]});liveProps.sort((a,b)=>a.i+a.j-b.i-b.j)}
function drawLive(t){for(const o of liveProps){const z=.18+.13*Math.sin(t*2+o.ph);box(o.i,o.j,.35,.35,z,.3,o.ink,.7);if(Math.sin(t*3+o.ph)>0)dot(...p(o.i+.17,o.j+.17,z+.55),1.8,'sun')}}
// Canvas calls return before the graphics card has finished, so the ms figures are only the script's share.
// The honest signal is the frame pacing: how many animation frames arrived late (>25 ms apart).
function updateHud(now){if(!HUD||now-stats.since<1000)return;const mean=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'–',sec=(now-stats.since)/1000,late=100*stats.slow/Math.max(1,stats.frames);
 HUD.textContent=`stil ${styleName} · zoom ${zoom.toFixed(2)} · ${LEGACY?'ESKİ yol':'hızlı yol'}\neşya ${room.items.length} · sabit +${STRESS} · canlı +${LIVE} · ekran ${screens.length} (${screens.filter(s=>s.mask).length} maskeli)\nkurulum         ${stats.build.toFixed(0)} ms\ntam çizim       ${mean(stats.render)} ms · ${(stats.paints/sec).toFixed(1)}/sn\nkaydırma karesi ${mean(stats.move)} ms\nkare hızı       ${(stats.frames/sec).toFixed(0)}/sn\ngeciken kare    %${late.toFixed(0)} · en uzun ${stats.gap.toFixed(0)} ms\n${late<3?'akıcı':late<15?'ara sıra takılıyor':'takılıyor'}`;
 stats.render=[];stats.move=[];stats.gap=0;stats.paints=0;stats.frames=0;stats.slow=0;stats.since=now}

// ---- CACHED PICTURE ------------------------------------------------------
// The whole room is painted once into `base`; `skip` leaves out the items being carried in the editor.
function cacheRoom(skip){const started=performance.now();base.width=B.w*SCALE;base.height=B.h*SCALE;c=base.getContext('2d');c.setTransform(SCALE,0,0,SCALE,-B.x*SCALE,-B.y*SCALE);buildRoom(skip);c=ctx;buildMasks(SCALE);
 stats.build=performance.now()-started;hoveredScreen=null;if(selectedScreen)selectedScreen=screens[selectedScreen.id]||null;refreshScreenPicker();paintAt=0}
function makePaper(){paper.width=paper.height=600;const g=paper.getContext('2d'),r=rng(43);g.fillStyle=INK.paper;g.fillRect(0,0,600,600);for(let n=0;n<10000;n++){g.fillStyle=S.grain[n%3?0:1];g.fillRect(r()*600,r()*600,r()*1.5+.4,r()*1+.3)}}

// ---- SCREEN DIALOG -------------------------------------------------------
const screenDialog=$('screen-dialog'),screenView=$('screen-view'),screenContext=screenView.getContext('2d'),screenPicker=$('screen-picker');
const SCREEN_NAMES={code:'Terminal',wave:'Sinyal dalgaları',map:'Ağ haritası',orbit:'Radar',bars:'Test yayını',grid:'Sistem durumu'};
let hoveredScreen=null,selectedScreen=null,tap=null;
const screenName=s=>`${String(s.id+1).padStart(2,'0')} / ${SCREEN_NAMES[s.mode]}`;
function refreshScreenPicker(){screenPicker.length=1;for(const s of screens){const option=document.createElement('option');option.value=s.id;option.textContent=screenName(s);screenPicker.appendChild(option)}}
function toWorld(clientX,clientY){const b=canvas.getBoundingClientRect();return[(clientX-b.left-width/2-pan.x)/zoom+VIEW_CX,(clientY-b.top-height/2-pan.y-20)/zoom+VIEW_CY]}
function screenAt(clientX,clientY){const[x,y]=toWorld(clientX,clientY);return[...screens].reverse().find(s=>pointInPolygon(s.outer,x,y))||null}
function hover(s){if(editor.on)s=null;hoveredScreen=s;canvas.style.cursor=editor.on?'default':s?'pointer':'grab';canvas.title=s?`${screenName(s)} — açmak için tıkla`:'';paintAt=0}
function openScreen(s){if(!s)return;selectedScreen=s;$('screen-title').textContent=screenName(s);screenView.setAttribute('aria-label',`${screenName(s)} büyütülmüş canlı görünümü`);screenDialog.showModal();paintAt=0}
function drawScreenDetail(){if(!screenDialog.open||!selectedScreen)return;const previous=c;c=screenContext;c.setTransform(3,0,0,3,0,0);c.fillStyle=INK.blue;c.fillRect(0,0,360,220);const P=(u,v)=>[(u-.065)/.835*360,(.93-v)/.8*220];drawDisplay({...selectedScreen,P,inner:rect(0,0,360,220)},time);c=previous}
$('screen-close').onclick=()=>screenDialog.close();
screenDialog.addEventListener('close',()=>{selectedScreen=null;screenPicker.value='';paintAt=0});
screenPicker.onchange=()=>{if(screenPicker.value!=='')openScreen(screens[Number(screenPicker.value)])};

// ---- FRAME ---------------------------------------------------------------
// The catalogue covers the right edge (the bottom on a phone) while editing; the room is centred in what is left.
function fit(){const side=editor.on&&width>700?290:0,below=editor.on&&width<=700?190:0;zoom=Math.max(.18,Math.min((width-side-50)/B.w,(height-below-145)/B.h));pan={x:-side/2,y:-below/2};paintAt=0}
function resize(){width=innerWidth;height=innerHeight;dpr=Math.min(2,devicePixelRatio||1);canvas.width=width*dpr;canvas.height=height*dpr;fit()}
function backdrop(){c=ctx;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=ctx.createPattern(paper,'repeat');ctx.fillRect(0,0,width,height);
 ctx.translate(width/2+pan.x,height/2+pan.y+20);ctx.scale(zoom,zoom);ctx.translate(-VIEW_CX,-VIEW_CY);
 // Subtle paper contact shadow beneath the room slab.
 if(S.blend!=='screen')shade([p(0,0,-.55),p(ROOM_W+.3,0,-.55),p(ROOM_W+.3,ROOM_D+.3,-.55),p(0,ROOM_D+.3,-.55)],.06);
 ctx.drawImage(base,B.x,B.y,B.w,B.h)}
// A screen with something standing in front of it: its content is painted on a scratch copy of that corner of the room,
// the silhouette of whatever is in front is cut out again, and the rest is put back.
const scratch=document.createElement('canvas'),scratchCtx=scratch.getContext('2d');
function drawDisplayMasked(s,t){const m=ctx.getTransform(),bb=s.bb,x0=Math.max(0,Math.floor(m.a*bb.x+m.e)),y0=Math.max(0,Math.floor(m.d*bb.y+m.f)),x1=Math.min(canvas.width,Math.ceil(m.a*(bb.x+bb.w)+m.e)),y1=Math.min(canvas.height,Math.ceil(m.d*(bb.y+bb.h)+m.f)),w=x1-x0,h=y1-y0;if(w<=0||h<=0)return;
 if(scratch.width<w||scratch.height<h){scratch.width=Math.max(scratch.width,w);scratch.height=Math.max(scratch.height,h)}
 const g=scratchCtx;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.setTransform(m.a,0,0,m.d,m.e-x0,m.f-y0);g.drawImage(base,B.x,B.y,B.w,B.h);
 c=g;drawDisplay(s,t);c=ctx;g.globalCompositeOperation='destination-out';g.drawImage(s.mask,bb.x,bb.y,bb.w,bb.h);g.globalCompositeOperation='source-over';
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(scratch,0,0,w,h,x0,y0,w,h);ctx.restore()}
// While the camera moves, frames in between full paints reuse the last finished frame: the cached room is drawn exactly
// and the previous frame, live parts included, is laid over it shifted and scaled.
const snap=document.createElement('canvas'),snapCtx=snap.getContext('2d',{alpha:false});let snapCam=null,camDirty=false;
function renderMoving(){backdrop();const k=zoom/snapCam.z,cx=width/2,cy=height/2+20;
 ctx.setTransform(dpr*k,0,0,dpr*k,dpr*(cx+pan.x-k*(cx+snapCam.x)),dpr*(cy+pan.y-k*(cy+snapCam.y)));ctx.drawImage(snap,0,0,width,height)}
function render(){backdrop();fast=!LEGACY;
 for(const s of screens)if(s.mask&&!LEGACY)drawDisplayMasked(s,time);else drawDisplay(s,time);
 for(const it of liveItems){const def=ITEMS[it.type];def.live(frame(it,def,floorZ(it)),it,time)}
 drawLive(time);
 if(hoveredScreen&&!pointers.size)strokeOutline(hoveredScreen.outer,1.5);
 drawEditor();fast=false;
 if(!LEGACY){if(snap.width!==canvas.width||snap.height!==canvas.height){snap.width=canvas.width;snap.height=canvas.height}snapCtx.drawImage(canvas,0,0);snapCam={x:pan.x,y:pan.y,z:zoom}}}
function strokeOutline(q,w,dash){ctx.save();path(q);ctx.strokeStyle=INK.sun;ctx.lineWidth=w/zoom;if(dash)ctx.setLineDash([4/zoom,3/zoom]);ctx.stroke();ctx.restore()}
function loop(now){requestAnimationFrame(loop);if(last){const gap=now-last;stats.gap=Math.max(stats.gap,gap);stats.frames++;if(gap>25)stats.slow++;if(!paused)time+=Math.min(.1,gap/1000)}last=now;
 if(AUTOPAN){pan.x=Math.sin(now/700)*120;pan.y=Math.cos(now/900)*60;camDirty=true}
 // Full paints run at 12/s; while the camera moves they drop to 6/s and the frames in between are blits.
 const blit=camDirty&&snapCam&&!LEGACY&&!editor.held,started=performance.now();
 if(!paintAt||now-paintAt>(blit?166:83)||camDirty&&!blit){render();fast=!LEGACY;drawScreenDetail();fast=false;stats.render.push(performance.now()-started);stats.paints++;paintAt=now}
 else if(blit){renderMoving();stats.move.push(performance.now()-started)}
 camDirty=false;updateHud(now)}

// ---- STYLE SWITCH --------------------------------------------------------
// New inks and patterns, one rebuild of the cached room, same camera.
const stylePicker=$('style-picker');
for(const k in STYLES){const option=document.createElement('option');option.value=k;option.textContent=STYLES[k].label;stylePicker.appendChild(option)}
function switchStyle(name){setStyle(name);stylePicker.value=styleName;makePaper();cacheRoom(editor.held&&editor.held.ignore);thumbs.clear();refreshPanel();
 const url=new URL(location.href);url.searchParams.set('style',styleName);history.replaceState(null,'',url)}
stylePicker.onchange=()=>switchStyle(stylePicker.value);

// ---- EDITOR --------------------------------------------------------------
// Pick up, move, turn and remove items. While something is carried the room is cached without it and the item is painted live.
const editor={on:false,selected:null,held:null,pending:null,pointer:[0,0]};
const snapTo=(v,step)=>Math.round(v/step)*step,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function itemAt(clientX,clientY){const[x,y]=toWorld(clientX,clientY);for(let k=paintList.length-1;k>=0;k--)if(room.items.includes(paintList[k])&&pointInPolygon(outline(paintList[k]),x,y))return paintList[k];return null}
function select(it){editor.selected=it;$('selection').textContent=it?`${ITEMS[it.type].name}${ITEMS[it.type].modes?' · M: ekran':ITEMS[it.type].variants?' · M: çeşit':''}`:'';paintAt=0}
function hold(it,isNew){disarmLook();const kids=childrenOf(it).map(k=>({it:k,di:k.i-it.i,dj:k.j-it.j}));
 editor.held={it,kids,isNew,sticky:isNew,valid:false,ignore:new Set([it.id,...kids.map(k=>k.it.id)]),origin:JSON.stringify([it,...kids.map(k=>k.it)])};
 select(it);cacheRoom(editor.held.ignore)}
// Where the carried item would land under the pointer: on a wall, on the top of something, or on the floor.
function carry(clientX,clientY){const h=editor.held;if(!h)return;editor.pointer=[clientX,clientY];const it=h.it,def=ITEMS[it.type],[x,y]=toWorld(clientX,clientY),len=w=>w==='i'?ROOM_W:ROOM_D;
 if(def.kind==='wall'){const hits=['i','j'].map(w=>[w,...unprojectWall(w,x,y)]),inside=hits.find(h=>h[1]>=0&&h[1]<=len(h[0])&&h[2]>=0&&h[2]<=WALL_H)||hits.sort((a,b)=>Math.abs(a[1]-len(a[0])/2)-Math.abs(b[1]-len(b[0])/2))[0],along=inside[1],z=inside[2];it.wall=inside[0];it.a=clamp(snapTo(along-def.w/2,SNAP),0,len(it.wall)-def.w);it.z=def.onFloor?0:clamp(snapTo(z-def.h/2,WALL_SNAP_Z),.25,Math.floor((WALL_H-.1-def.h)/WALL_SNAP_Z)*WALL_SNAP_Z)}
 else{const turned=it.r%2===1,fw=turned?def.d:def.w,fd=turned?def.w:def.d;let parent=null;
  if(def.canStack)for(let k=paintList.length-1;k>=0&&!parent;k--){const o=paintList[k],top=ITEMS[o.type].top;if(top==null||o.on||kindOf(o)!=='floor'||!room.items.includes(o))continue;const f=footprint(o);if(pointInPolygon(tile(f.i0,f.j0,f.i1-f.i0,f.j1-f.j0,top),x,y))parent=o}
  const area=parent?footprint(parent):{i0:0,j0:0,i1:ROOM_W,j1:ROOM_D},[ci,cj]=unproject(x,y,parent?ITEMS[parent.type].top:0);
  if(parent)it.on=parent.id;else delete it.on;
  it.i=clamp(snapTo(ci-fw/2,SNAP),area.i0,Math.max(area.i0,area.i1-fw));it.j=clamp(snapTo(cj-fd/2,SNAP),area.j0,Math.max(area.j0,area.j1-fd));
  for(const k of h.kids){k.it.i=it.i+k.di;k.it.j=it.j+k.dj}}
 h.valid=placementOk(it,h.ignore);paintAt=0}
function drop(){const h=editor.held;if(!h)return;
 if(!h.valid){if(h.isNew)return; // keep carrying a new item until it fits or Esc
  const origin=JSON.parse(h.origin);[h.it,...h.kids.map(k=>k.it)].forEach((it,k)=>{for(const key in it)delete it[key];Object.assign(it,origin[k])})}
 if(h.isNew&&!SANDBOX)give(h.it.type,-1); // it leaves the inventory only once it really stands in the room
 editor.held=null;saveRoom();cacheRoom();refreshPanel()}
function cancelHeld(){const h=editor.held;if(!h)return;if(!h.isNew){h.valid=false;drop();return} // an existing item goes back where it was
 room.items=room.items.filter(it=>it!==h.it);select(null);editor.held=null;cacheRoom()}
function addNew(type){if(editor.held)cancelHeld();if(!SANDBOX&&owned(type)<1)return;const it=newItem(type);room.items.push(it);hold(it,true);carry(...editor.pointer)}
function turnSelected(){disarmLook();const h=editor.held,it=h?h.it:editor.selected;if(!it)return;
 if(h){turn(it);for(const k of h.kids){k.di=k.it.i-it.i;k.dj=k.it.j-it.j}carry(...editor.pointer);return}
 const group=[it,...childrenOf(it)],before=JSON.stringify(group);turn(it);
 if(!placementOk(it,new Set(group.map(g=>g.id)))){const old=JSON.parse(before);group.forEach((g,k)=>Object.assign(g,old[k]));flash('Buraya sığmıyor');return}
 saveRoom();cacheRoom()}
function removeSelected(){disarmLook();const it=editor.selected;if(!it||editor.held)return;const gone=new Set([it.id,...childrenOf(it).map(k=>k.id)]);if(!SANDBOX)for(const o of room.items)if(gone.has(o.id))give(o.type); // back into the inventory
 room.items=room.items.filter(o=>!gone.has(o.id));select(null);saveRoom();cacheRoom();refreshPanel();flash(SANDBOX?'Kaldırıldı':'Envantere döndü')}
// M: next programme on a display, or the next look of an item that comes in several variants.
function nextMode(){disarmLook();const it=editor.selected,def=it&&ITEMS[it.type];if(!it||editor.held||!(def.modes||def.variants))return;
 if(def.variants)it.variant=((it.variant||0)+1)%def.variants;else it.mode=SCREEN_MODES[(SCREEN_MODES.indexOf(it.mode)+1)%SCREEN_MODES.length];saveRoom();cacheRoom()}
let flashTimer=0;function flash(text){const el=$('selection'),keep=el.textContent;el.textContent=text;clearTimeout(flashTimer);flashTimer=setTimeout(()=>select(editor.selected),1400)}
function drawEditor(){if(!editor.on)return;const h=editor.held;
 if(h){const it=h.it,f=kindOf(it)==='wall'?null:footprint(it),mark=f?tile(f.i0,f.j0,f.i1-f.i0,f.j1-f.j0,floorZ(it)+.01):outline(it);
  fill(mark,h.valid?'teal':'coral',.6,false);registering=false;ctx.globalAlpha=.9;for(const o of[it,...farToNear(h.kids.map(k=>k.it))])drawItem(o);ctx.globalAlpha=1;registering=true;strokeOutline(mark,1.5)}
 else if(editor.selected&&room.items.includes(editor.selected))strokeOutline(outline(editor.selected),1.5,true);
 drawExpansion()}
function setEditing(on){disarmLook();if(!on&&editor.held)cancelHeld();expand.hover=expand.armed=null;editor.on=on;if(!on)select(null);document.body.classList.toggle('editing',on);$('edit').textContent=on?'Bitti ✓':'Düzenle ✎';$('edit').setAttribute('aria-pressed',String(on));
 $('hint').textContent=on?'Eşyayı sürükle · R döndür · Del kaldır · Esc bırak':'Sürükle · Yakınlaş · Bir ekrana tıkla';hover(null);if(width)fit()}
$('edit').onclick=()=>setEditing(!editor.on);
let resetArmed=0;$('reset-room').onclick=e=>{if(Date.now()-resetArmed>3000){resetArmed=Date.now();e.target.textContent='Emin misin?';setTimeout(()=>e.target.textContent='Odayı sıfırla',3000);return}
 resetArmed=0;e.target.textContent='Odayı sıfırla';editor.held=null;loadRoom(DEFAULT_ROOM);select(null);saveRoom();cacheRoom();refreshPanel();fit()};
$('empty-room').onclick=()=>{if(editor.held)cancelHeld();if(!SANDBOX)for(const it of room.items)give(it.type);loadRoom({v:1,w:room.w,d:room.d,items:[]});select(null);saveRoom();cacheRoom();refreshPanel()};

// ---- PANEL -----------------------------------------------------------------
// Inventory, shop, quests and score in the game; one free catalogue in the sandbox. Item pictures are painted once per style.
const KIND_NOTE={wall:'duvar',rug:'halı'},thumbs=new Map(),thumbStage=document.createElement('canvas'),thumbCtx=thumbStage.getContext('2d');
function thumbOf(type){if(thumbs.has(type))return thumbs.get(type);const W=108,H=78,k=2,def=ITEMS[type],it=def.kind==='wall'?{type,wall:'i',a:0,z:0}:{type,i:0,j:0,r:0},bb=bounds(outline(it)),s=Math.min((W-14)/bb.w,(H-14)/bb.h,1.9),previous=c;
 thumbStage.width=W*k;thumbStage.height=H*k;c=thumbCtx;registering=false;c.fillStyle=INK.paper;c.fillRect(0,0,W*k,H*k);c.setTransform(s*k,0,0,s*k,(W/2-(bb.x+bb.w/2)*s)*k,(H/2-(bb.y+bb.h/2)*s)*k);
 if(def.kind==='wall')fill(quad(wallFrame(it,def),-.06,-.12,1.12,1.24),'blue',.8); // a piece of wall behind it
 drawItem(it);if(def.live)def.live(frame(it,def,0),it,0);registering=true;c=previous;
 const cv=document.createElement('canvas');cv.width=W*k;cv.height=H*k;cv.getContext('2d').drawImage(thumbStage,0,0);thumbs.set(type,cv);return cv}
function card(type,{lines=[],badge='',onClick,disabled=false,cls=''}){const el=document.createElement('button'),pic=document.createElement('canvas'),src=thumbOf(type);el.className='card '+cls;el.dataset.type=type;el.disabled=disabled;
 pic.width=src.width;pic.height=src.height;pic.getContext('2d').drawImage(src,0,0);pic.setAttribute('aria-hidden','true');el.appendChild(pic);
 const name=document.createElement('span');name.textContent=ITEMS[type].name;el.appendChild(name);for(const text of lines){const s=document.createElement('small');s.textContent=text;el.appendChild(s)}
 if(badge){const b=document.createElement('b');b.textContent=badge;el.appendChild(b)}el.onclick=onClick;return el}
const noteOf=type=>{const def=ITEMS[type];return KIND_NOTE[def.kind]||(def.canStack?'üste konur':def.top!=null?'üstü kullanılır':'')};
const TABS=SANDBOX?[['catalog','Katalog'],['look','Oda']]:[['inventory','Envanter'],['shop','Mağaza'],['look','Oda'],['quests','Görevler'],['score','Puan']];let tab=TABS[0][0];
function row(html,cls=''){const el=document.createElement('div');el.className='row '+cls;el.innerHTML=html;return el}
function refreshPanel(){const list=$('catalog-list'),tabs=$('tabs'),score=roomScore();const keepScroll=list.scrollTop;list.textContent='';tabs.textContent='';list.className=tab==='quests'||tab==='score'||tab==='look'?'rows':'';
 $('wallet').textContent=SANDBOX?'serbest mod · her eşya sınırsız':'◉ '+fmt(save.coins)+'  ·  oda puanı '+fmt(score.total);$('reset-room').hidden=!SANDBOX;
 for(const[id,label]of TABS){const b=document.createElement('button');b.textContent=label+(id==='quests'&&questsReady()?' •':'')+(id==='shop'&&dailyReady()?' •':'');b.setAttribute('aria-pressed',String(id===tab));b.onclick=()=>{disarmLook();tab=id;list.scrollTop=0;refreshPanel()};tabs.appendChild(b)}
 const sections=each=>{for(const[id,label]of CATEGORIES){const types=Object.keys(ITEMS).filter(t=>categoryOf(t)===id).sort((x,y)=>priceOf(x)-priceOf(y));if(!types.length)continue;list.appendChild(row(label+' · '+types.length,'head'));types.forEach(each)}};
 if(tab==='catalog')sections(type=>list.appendChild(card(type,{lines:[noteOf(type)].filter(Boolean),onClick:()=>addNew(type)})));
 if(tab==='inventory'){const types=Object.keys(ITEMS).filter(t=>owned(t)>0);if(!types.length)list.appendChild(row('Envanterin boş. Mağazadan eşya al ya da görevlerden para kazan.','note'));
  for(const type of types)list.appendChild(card(type,{lines:[noteOf(type)].filter(Boolean),badge:'×'+owned(type),onClick:()=>addNew(type)}))}
 if(tab==='shop'){const daily=row(dailyReady()?'<span>Günlük ödülün hazır</span><button>Al</button>':'<span>Günlük ödül alındı · seri '+save.daily.streak+' gün</span>','note');if(dailyReady())daily.querySelector('button').onclick=()=>{flash('+'+claimDaily()+' ◉ günlük ödül');refreshPanel()};list.appendChild(daily);
  list.appendChild(row('Odayı genişlet · şimdi '+ROOM_W+' × '+ROOM_D,'head'));
  for(const[side,label]of[['i','Sağa doğru'],['j','Sola doğru']]){if(!canExpand(side)){list.appendChild(row('<span>'+label+'</span><em>en büyük boyut</em>','claimed'));continue}
   const price=expansionPrice(side),el=row('<span>'+label+'<small>+'+ROOM_STEP*(side==='i'?ROOM_D:ROOM_W)+' karo</small></span><button>◉ '+fmt(price)+'</button>');el.onmouseenter=()=>{expand.hover=side;paintAt=0};el.onmouseleave=()=>{expand.hover=expand.armed=null;paintAt=0};
   el.querySelector('button').disabled=save.coins<price;el.querySelector('button').onclick=()=>{expand.armed=side;expand.armedAt=performance.now();clickExpand(side)};list.appendChild(el)}
  list.appendChild(row('Günün fırsatları · %'+Math.round(DEAL_OFF*100)+' indirim · birer adet','head'));
  for(const d of dealsToday())list.appendChild(card(d.type,{cls:'deal '+rarityOf(d.type),lines:[RARITY_NAME[rarityOf(d.type)]],badge:d.sold?'satıldı':'◉ '+fmt(d.price),disabled:d.sold||save.coins<d.price,onClick:()=>{if(buy(d.type,true)){flash(ITEMS[d.type].name+' envanterde');refreshPanel()}}}));
  sections(type=>list.appendChild(card(type,{cls:rarityOf(type),lines:[RARITY_NAME[rarityOf(type)]+(owned(type)?' · sende '+owned(type):'')],badge:'◉ '+fmt(priceOf(type)),disabled:save.coins<priceOf(type),onClick:()=>{if(buy(type)){flash(ITEMS[type].name+' envanterde');refreshPanel()}}})))}
 if(tab==='look')lookPanel(list);
 if(tab==='quests')for(const q of QUESTS){const state=questState(q),el=row('<span>'+q.text+'</span>'+(state==='ready'?'<button>+'+q.reward+' ◉</button>':'<em>'+(state==='claimed'?'alındı ✓':'+'+q.reward+' ◉')+'</em>'),state);if(state==='ready')el.querySelector('button').onclick=()=>{flash('+'+claimQuest(q.id)+' ◉');refreshPanel()};list.appendChild(el)}
 if(tab==='score'){list.appendChild(row('<span>Eşyalar ('+room.items.length+')</span><em>'+fmt(score.base)+'</em>'));list.appendChild(row('<span>Çeşitlilik ('+score.kinds+' tür × '+VARIETY_POINTS+')</span><em>'+fmt(score.variety)+'</em>'));
  list.appendChild(row('Setler','head'));for(const s of score.sets)list.appendChild(row('<span>'+s.name+'<small>'+s.hint+'</small></span><em>'+(s.complete?'+'+s.bonus+' ✓':'+'+s.bonus)+'</em>',s.complete?'claimed':'open'));
  list.appendChild(row('<span>Toplam</span><em>'+fmt(score.total)+'</em>','total'))}
 list.scrollTop=keepScroll}

// ---- ROOM LOOK ---------------------------------------------------------------
// Wall, floor, floor pattern, trim and print style. A locked option is tried on first (the room shows it for a few
// seconds, nothing is saved) and bought with a second click; anything else the player does puts the old look back.
const lookArm={key:null,backup:null,timer:0};
function setLook(group,value){if(group==='style'){room.style=value;switchStyle(value)}else{room.look={...lookOf(),[group]:value};cacheRoom()}}
function disarmLook(){if(!lookArm.key)return;clearTimeout(lookArm.timer);lookArm.key=null;const b=JSON.parse(lookArm.backup);room.look=b.look;room.style=b.style;if(b.style!==styleName)switchStyle(b.style);else cacheRoom()}
function chooseLook(group,value,price){const key=group+':'+value;
 if(lookUnlocked(group,value)){disarmLook();setLook(group,value);saveRoom();refreshPanel();return}
 if(lookArm.key===key){if(save.coins<price){flash('Yetersiz ◉ — '+fmt(price)+' gerekiyor');return}clearTimeout(lookArm.timer);lookArm.key=null;unlockLook(group,value,price);saveRoom();refreshPanel();flash('Açıldı ve uygulandı');return}
 disarmLook();lookArm.key=key;lookArm.backup=JSON.stringify({look:lookOf(),style:room.style||styleName});setLook(group,value);lookArm.timer=setTimeout(()=>{disarmLook();refreshPanel()},7000);refreshPanel();flash('Önizleme — almak için tekrar tıkla')}
function lookPanel(list){const current={...lookOf(),style:styleName};
 for(const[group,title]of LOOK_GROUPS){list.appendChild(row(title,'head'));const box=document.createElement('div');box.className='opts';
  for(const[value,label,price,chip]of LOOK_OPTIONS[group]){const b=document.createElement('button'),open=lookUnlocked(group,value),armed=lookArm.key===group+':'+value;b.className='opt'+(armed?' armed':'');b.setAttribute('aria-pressed',String(current[group]===value&&!armed));
   if(chip){const dot=document.createElement('i');dot.style.background=INK[chip];b.appendChild(dot)}b.appendChild(document.createTextNode(label+(armed?' · onayla ◉ '+fmt(price):open?'':' · ◉ '+fmt(price))));b.onclick=()=>chooseLook(group,value,price);box.appendChild(b)}
  list.appendChild(box)}}

// ---- ROOM EXPANSION ----------------------------------------------------------
// A "+" handle sits on each open edge while editing. Pointing at one previews the strip it would add — floor and the piece
// of wall that comes with it — as a pulsing ghost with a marching outline; the first click arms the purchase, the second pays.
const expand={hover:null,armed:null,armedAt:0};
const handleAt=side=>side==='i'?p(ROOM_W+.9,ROOM_D/2):p(ROOM_W/2,ROOM_D+.9);
function expandSideAt(clientX,clientY){if(!editor.on||editor.held)return null;const[x,y]=toWorld(clientX,clientY);
 for(const side of['i','j'])if(canExpand(side)){const h=handleAt(side);if(Math.hypot(x-h[0],y-h[1])<13)return side}return null}
function setExpandHover(side){if(expand.hover===side)return;expand.hover=side;if(!side)expand.armed=null;canvas.style.cursor=side?'pointer':'default';paintAt=0}
function clickExpand(side){disarmLook();const price=expansionPrice(side);
 if(expand.armed!==side||performance.now()-expand.armedAt>4000){expand.armed=side;expand.armedAt=performance.now();expand.hover=side;paintAt=0;return}
 expand.armed=null;if(!buyExpansion(side)){flash('Yetersiz ◉ — '+fmt(price)+' gerekiyor');return}
 expand.hover=null;saveRoom();cacheRoom();refreshPanel();fit();flash('Oda büyüdü: '+ROOM_W+' × '+ROOM_D)}
function drawExpansion(){if(!editor.on||editor.held)return;const now=performance.now(),W=ROOM_W,D=ROOM_D;
 if(expand.armed&&now-expand.armedAt>4000)expand.armed=null;
 const side=expand.hover;
 if(side&&canExpand(side)){const pulse=.5+.5*Math.sin(now/240),floor=side==='i'?tile(W,0,ROOM_STEP,D):tile(0,D,W,ROOM_STEP),wall=side==='i'?faceI(W,0,ROOM_STEP,0,WALL_H):faceJ(0,D,ROOM_STEP,0,WALL_H);
  fill(wall,'blue',.18+.3*pulse,false);fill(floor,'teal',.2+.35*pulse,false);
  const grid=[];if(side==='i'){for(let a=1;a<ROOM_STEP;a++)grid.push([p(W+a,0),p(W+a,D)]);for(let b=1;b<D;b++)grid.push([p(W,b),p(W+ROOM_STEP,b)])}else{for(let b=1;b<ROOM_STEP;b++)grid.push([p(0,D+b),p(W,D+b)]);for(let a=1;a<W;a++)grid.push([p(a,D),p(a,D+ROOM_STEP)])}
  lines(grid,'blue',.6,.35);
  for(const q of[floor,wall]){ctx.save();path(q);ctx.strokeStyle=INK.sun;ctx.lineWidth=2/zoom;ctx.setLineDash([7/zoom,5/zoom]);ctx.lineDashOffset=-now/45/zoom;ctx.stroke();ctx.restore()}}
 for(const s of['i','j'])if(canExpand(s)){const[x,y]=handleAt(s),on=side===s,r=on?10.5:8.5;shape(ellipse(x,y,r,r,20),on?'coral':'sun',1,1.1);lines([[[x-4.5,y],[x+4.5,y]],[[x,y-4.5],[x,y+4.5]]],on?'paper':'blue',1.8)}
 if(side&&canExpand(side)){const[x,y]=handleAt(side),price=expansionPrice(side),tiles=ROOM_STEP*(side==='i'?D:W),poor=!SANDBOX&&save.coins<price;
  const text=expand.armed===side?(poor?'yetersiz ◉ · '+fmt(price):'onayla · '+(SANDBOX?'ücretsiz':'◉ '+fmt(price))):'+'+tiles+' karo · '+(SANDBOX?'ücretsiz':'◉ '+fmt(price));
  ctx.save();ctx.font=`${11/zoom}px monospace`;const w=ctx.measureText(text).width+14/zoom,h=20/zoom,bx=x-w/2,by=y+16/zoom;ctx.fillStyle=INK.paper;ctx.strokeStyle=poor&&expand.armed===side?INK.coral:INK.blue;ctx.lineWidth=1/zoom;
  ctx.beginPath();ctx.rect(bx,by,w,h);ctx.fill();ctx.stroke();ctx.fillStyle=S.ui||INK.blue;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,by+h/2);ctx.restore()}}

// ---- INPUT ---------------------------------------------------------------
let pointers=new Map(),pinch=null,dragging='pan';
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;{const side=expandSideAt(e.clientX,e.clientY);if(side){clickExpand(side);return}}canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);dragging='pan';tap=null;
 if(editor.on&&pointers.size===1){if(editor.held){dragging='item';carry(e.clientX,e.clientY);return}
  const pick=itemAt(e.clientX,e.clientY);select(pick);if(pick){dragging='item';editor.pending={it:pick,x:e.clientX,y:e.clientY};return}}
 else if(!editor.on&&pointers.size===1)tap={id:e.pointerId,x:e.clientX,y:e.clientY,screen:screenAt(e.clientX,e.clientY),moved:false};
 canvas.classList.add('drag');canvas.style.cursor='grabbing';if(pointers.size===2){const[a,b]=[...pointers.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:zoom}}});
canvas.addEventListener('pointermove',e=>{const prev=pointers.get(e.pointerId);
 if(editor.on){editor.pointer=[e.clientX,e.clientY];if(!prev)setExpandHover(expandSideAt(e.clientX,e.clientY));const pend=editor.pending;if(pend&&prev&&Math.hypot(e.clientX-pend.x,e.clientY-pend.y)>4){editor.pending=null;hold(pend.it,false)}
  if(editor.held&&(dragging==='item'||!prev)){if(prev)pointers.set(e.pointerId,[e.clientX,e.clientY]);carry(e.clientX,e.clientY);return}
  if(dragging==='item')return}
 if(!prev){hover(screenAt(e.clientX,e.clientY));return}if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>5)tap.moved=true;pointers.set(e.pointerId,[e.clientX,e.clientY]);
 if(pointers.size===2&&pinch){const[a,b]=[...pointers.values()];zoom=Math.max(.18,Math.min(4,pinch.z*Math.hypot(a[0]-b[0],a[1]-b[1])/Math.max(1,pinch.d)))}else{pan.x+=e.clientX-prev[0];pan.y+=e.clientY-prev[1]}camDirty=true});
function release(e){if(!pointers.has(e.pointerId))return;const chosen=e.type==='pointerup'&&tap?.id===e.pointerId&&!tap.moved?tap.screen:null;pointers.delete(e.pointerId);tap=null;pinch=null;editor.pending=null;
 if(dragging==='item'){dragging='pan';if(editor.held){if(e.type==='pointerup')drop();else cancelHeld()}return}
 if(!pointers.size){canvas.classList.remove('drag');hover(screenAt(e.clientX,e.clientY))}if(chosen)openScreen(chosen)}
canvas.addEventListener('pointerleave',()=>{if(!pointers.size)hover(null)});
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
canvas.addEventListener('wheel',e=>{e.preventDefault();const old=zoom;zoom=Math.max(.18,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));const k=zoom/old;pan.x=e.clientX-width/2-(e.clientX-width/2-pan.x)*k;pan.y=e.clientY-height/2-20-(e.clientY-height/2-20-pan.y)*k;camDirty=true;if(editor.held)carry(...editor.pointer)},{passive:false});
$('reset').onclick=fit;
function motionLabel(){const b=$('motion');b.textContent=paused?'Hareketi başlat':'Hareketi durdur';b.setAttribute('aria-pressed',String(paused))}
$('motion').onclick=()=>{paused=!paused;motionLabel()};
addEventListener('keydown',e=>{if(screenDialog.open||e.target instanceof HTMLSelectElement||e.ctrlKey||e.metaKey||e.altKey)return;const key=e.key.toLowerCase();
 if(editor.on){if(key==='r'){turnSelected();return}if(key==='delete'||key==='backspace'){removeSelected();e.preventDefault();return}if(key==='m'){nextMode();return}if(key==='escape'){if(editor.held)cancelHeld();else select(null);return}}
 if(e.target instanceof HTMLButtonElement)return;
 if(key==='e')setEditing(!editor.on);if(key==='0')fit();if(key==='+'||key==='=')zoom=Math.min(4,zoom*1.2);if(key==='-')zoom=Math.max(.18,zoom/1.2);
 if(key==='s'&&SANDBOX){const names=Object.keys(STYLES);switchStyle(names[(names.indexOf(styleName)+1)%names.length])}paintAt=0});
addEventListener('resize',resize);

// ---- START ---------------------------------------------------------------
loadRoom(QUERY.has('default')?DEFAULT_ROOM:storedRoom()||(SANDBOX?DEFAULT_ROOM:{v:1,items:[]}));
if(room.style&&!QUERY.has('style'))setStyle(room.style); // the room carries its own print style
document.body.classList.toggle('game',!SANDBOX);
stylePicker.value=styleName;makePaper();cacheRoom();refreshPanel();resize();motionLabel();if(QUERY.has('edit'))setEditing(true);requestAnimationFrame(loop);
