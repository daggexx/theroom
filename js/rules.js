'use strict';
// The rules of the game, in one place, run by both sides: the browser applies them so the interface answers at once,
// and the server applies the same code to decide what actually happened. Nothing here touches the DOM, the canvas or
// localStorage, so it loads as a plain script in the page and as a module in Node.
(function(root){

// ---- prices ------------------------------------------------------------------
const PRICES={deskLarge:400,deskMedium:250,deskLow:180,monitor:300,terminal:350,keyboard:60,mousepad:30,mug:25,books:40,headphones:90,speaker:120,
 plantSmall:50,plantLarge:140,papers:10,floppy:15,chair:200,rack:900,tower:450,crtBig:600,crtSmall:380,printer:220,crate:35,spark:1200,rugLarge:320,rugSmall:150,
 wallScreenS:350,wallScreenM:480,wallScreenL:1100,clock:80,patchboard:260,poster:70,label:40,
 sofa:480,armchair:300,beanbag:160,bookshelf:380,coffeeTable:150,floorLamp:140,deskLamp:80,catSleeping:650,cactus:45,aquarium:700,trashBin:30,rugRound:240,
 coffeeMachine:180,microwave:160,pizzaBox:20,ramen:10,
 miningRig:1500,safe:950,validatorNode:800,hardwareWallet:120,goldBars:1000,trophy:600,rocket:350,moonLamp:220,diamond:2000,
 window:300,door:200,pictureFrame:400,neon:550,chartBoard:320,wallShelf:180,stringLights:130,
 deskL:700,standingDesk:560,ultrawide:900,verticalMonitor:420,monitorWall:2200,laptop:520,mechKeyboard:180,drawingTablet:260,micArm:240,webcam:110,ringLight:190,gamingChair:520,cableTray:70,
 asicMiner:1100,asicRack:2600,immersionTank:3000,halfRack:700,networkSwitch:220,router:160,nas:340,ups:280,piCluster:300,seedPlate:180,pdu:120,
 industrialFan:260,generator:900,solarPanel:800,satelliteDish:750,bitcoinATM:2800,goldBitcoin:3500,dataCube:2400,
 printer3d:1200,resinPrinter:700,filamentRack:300,workbench:640,solderStation:280,oscilloscope:560,robotArm:1800,drone:900,vrHeadset:640,
 laserCutter:1900,partsDrawers:260,serverCart:420,quantumComputer:5000,teslaCoil:1600,robotDog:2200,hologram:2600,lamboModel:1400,moonRock:900,
 meetingTable:900,phoneBooth:1600,lockers:420,waterCooler:200,miniFridge:380,vendingMachine:1400,arcade:1700,foosball:1300,roomba:420,hydroRack:850,
 projector:380,projectorScreen:420,ticker:1500,orderBook:600,blockHeight:700,halvingClock:500,worldClocks:400,whiteboard:340,whitepaper:600,
 securityCam:280,cardReader:220,ledStrip:200,plaques:450,vent:90,
 // agent lab
 brainTank:4200,brainPod:1500,pumpUnit:900,pipeRun:150,valveStack:340,signalMast:1900,gantry:1100,coolantTank:700,specimenShelf:620};
const priceOf=type=>PRICES[type]??100;
const rarityOf=type=>priceOf(type)>=800?'epic':priceOf(type)>=340?'rare':'common';
const RARITY_NAME={common:'sıradan',rare:'nadir',epic:'efsane'};
const START={coins:600,inventory:{deskMedium:1,chair:1,crate:2,plantSmall:1,mug:1}};
const DAILY_BASE=150,DAILY_STREAK=25,DAILY_MAX=300,DEAL_COUNT=3,DEAL_OFF=.3;
const ROOM_SIZE=12,ROOM_STEP=2,ROOM_MAX=18,WALL_H=3.4,SNAP=.5,WALL_SNAP_Z=.25;
const EXPAND_TILE_BASE=10,EXPAND_TILE_PER_AREA=1/8;

// The same small generator the drawing engine uses: the same seed has to give the same run on both sides.
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

// ---- state -------------------------------------------------------------------
const freshState=()=>({v:1,coins:START.coins,inventory:{...START.inventory},claimed:[],daily:{last:'',streak:0},deals:{day:'',bought:[]},unlocked:[]});
function normalize(state){const s=state&&typeof state.coins==='number'?{...state}:freshState();
 s.inventory=s.inventory&&typeof s.inventory==='object'?{...s.inventory}:{};
 s.claimed=Array.isArray(s.claimed)?[...s.claimed]:[];
 s.unlocked=Array.isArray(s.unlocked)?[...s.unlocked]:[];
 s.daily=s.daily&&typeof s.daily==='object'?{...s.daily}:{last:'',streak:0};
 s.deals=s.deals&&typeof s.deals==='object'?{...s.deals,bought:Array.isArray(s.deals.bought)?[...s.deals.bought]:[]}:{day:'',bought:[]};
 s.coins=Math.max(0,Math.floor(s.coins));
 return s}
const owned=(state,type)=>state.inventory[type]||0;

// ---- shop --------------------------------------------------------------------
const today=()=>new Date().toISOString().slice(0,10);
const dayNumber=day=>Math.floor(Date.parse(day)/864e5);
// Three discounted items a day, one of each in stock, the same for everyone on the same date.
function dealsFor(day,types){const r=rng(dayNumber(day)*7919),pool=types.filter(t=>priceOf(t)>=120).sort(),out=[];
 while(out.length<DEAL_COUNT&&pool.length)out.push(pool.splice(Math.floor(r()*pool.length),1)[0]);
 return out.map(type=>({type,price:Math.round(priceOf(type)*(1-DEAL_OFF)/5)*5}))}
const dealSold=(state,type)=>state.deals.day===today()&&state.deals.bought.includes(type);
const dailyReady=state=>state.daily.last!==today();

// ---- looks -------------------------------------------------------------------
const LOOK_GROUPS=[['wall','Duvar'],['floor','Zemin'],['pattern','Zemin deseni'],['trim','Süpürgelik ve pervaz'],['style','Baskı stili']];
const LOOK_OPTIONS={
 wall:[['blue','Lacivert',0,'blue'],['teal','Petrol',150,'teal'],['coral','Mercan',150,'coral'],['sun','Hardal',150,'sun'],['paper','Açık',200,'paper']],
 floor:[['teal','Gece',0,'teal'],['blue','Koyu',120,'blue'],['wood','Ahşap',250,'sun'],['coral','Kiremit',200,'coral'],['light','Açık',200,'paper']],
 pattern:[['checker','Dama',0],['plain','Düz',80],['planks','Parke',250],['tiles','Karo',250]],
 trim:[['coral','Mercan',0,'coral'],['sun','Sarı',60,'sun'],['teal','Petrol',60,'teal'],['blue','Lacivert',60,'blue'],['paper','Beyaz',60,'paper']],
 style:[['riso','Riso',0],['hard','Sert riso',300],['flat','Düz vektör',300],['gravur','Gravür',800],['comic','Çizgi roman',800],['night','Gece / neon',1200]]};
const lookOption=(group,value)=>(LOOK_OPTIONS[group]||[]).find(o=>o[0]===value);
const lookUnlocked=(state,group,value)=>{const o=lookOption(group,value);return!!o&&(o[2]===0||state.unlocked.includes(group+':'+value))};

// ---- room score --------------------------------------------------------------
const DESKS=['deskLarge','deskMedium','deskLow','deskL','standingDesk'],SCREENS=['monitor','terminal','ultrawide','verticalMonitor','monitorWall','laptop'],
 KEYS=['keyboard','mechKeyboard'],CHAIRS=['chair','gamingChair'];
const countOf=(items,types)=>items.filter(it=>types.includes(it.type)).length;
const SETS=[
 {name:'Çalışma masası',bonus:300,hint:'masa + ekran + klavye + koltuk',done:it=>countOf(it,DESKS)&&countOf(it,SCREENS)&&countOf(it,KEYS)&&countOf(it,CHAIRS)},
 {name:'Trader masası',bonus:900,hint:'masa + üç ekran + mum grafiği panosu + koltuk',done:it=>countOf(it,DESKS)&&countOf(it,SCREENS)>=3&&countOf(it,['chartBoard'])&&countOf(it,CHAIRS)},
 {name:'Yayıncı köşesi',bonus:500,hint:'mikrofon kolu + halka ışık + webcam + kulaklık',done:it=>countOf(it,['micArm'])&&countOf(it,['ringLight'])&&countOf(it,['webcam'])&&countOf(it,['headphones'])},
 {name:'Ekran duvarı',bonus:350,hint:'büyük TV + küçük TV + hoparlör',done:it=>countOf(it,['crtBig'])&&countOf(it,['crtSmall'])&&countOf(it,['speaker'])},
 {name:'Sunucu odası',bonus:500,hint:'sunucu rafı + kasa + bağlantı paneli',done:it=>countOf(it,['rack'])&&countOf(it,['tower'])&&countOf(it,['patchboard'])},
 {name:'Yeşil köşe',bonus:200,hint:'üç bitki',done:it=>countOf(it,['plantSmall','plantLarge'])>=3},
 {name:'Komuta duvarı',bonus:400,hint:'üç duvar ekranı',done:it=>countOf(it,['wallScreenS','wallScreenM','wallScreenL'])>=3},
 {name:'Oturma köşesi',bonus:350,hint:'kanepe ya da berjer + sehpa + ayaklı lamba',done:it=>countOf(it,['sofa','armchair'])&&countOf(it,['coffeeTable'])&&countOf(it,['floorLamp'])},
 {name:'Maden ocağı',bonus:700,hint:'iki madenci ya da ASIC + doğrulayıcı düğüm',done:it=>countOf(it,['miningRig','asicMiner','asicRack'])>=2&&countOf(it,['validatorNode'])},
 {name:'Ağ merkezi',bonus:450,hint:'router + ağ anahtarı + NAS',done:it=>countOf(it,['router'])&&countOf(it,['networkSwitch'])&&countOf(it,['nas'])},
 {name:'Enerji hattı',bonus:600,hint:'UPS + güç dağıtımı + jeneratör ya da güneş paneli',done:it=>countOf(it,['ups'])&&countOf(it,['pdu'])&&countOf(it,['generator','solarPanel'])},
 {name:'Atölye',bonus:650,hint:'3D yazıcı + lehim istasyonu + parça çekmeceleri',done:it=>countOf(it,['printer3d','resinPrinter'])&&countOf(it,['solderStation'])&&countOf(it,['partsDrawers'])},
 {name:'Toplantı odası',bonus:550,hint:'toplantı masası + projektör + perde',done:it=>countOf(it,['meetingTable'])&&countOf(it,['projector'])&&countOf(it,['projectorScreen'])},
 {name:'Mola alanı',bonus:400,hint:'kahve makinesi + mini buzdolabı + su sebili',done:it=>countOf(it,['coffeeMachine'])&&countOf(it,['miniFridge'])&&countOf(it,['waterCooler'])},
 {name:'Oyun köşesi',bonus:500,hint:'arcade + langırt + armut koltuk',done:it=>countOf(it,['arcade'])&&countOf(it,['foosball'])&&countOf(it,['beanbag'])},
 {name:'Veri katedrali',bonus:1500,hint:'kuantum bilgisayar + cam küp + hologram',done:it=>countOf(it,['quantumComputer'])&&countOf(it,['dataCube'])&&countOf(it,['hologram'])},
 {name:'Soğuk cüzdan',bonus:600,hint:'çelik kasa + donanım cüzdanı + külçe altın ya da seed plakası',done:it=>countOf(it,['safe'])&&countOf(it,['hardwareWallet'])&&countOf(it,['goldBars','seedPlate'])},
 {name:'Ayı sezonu',bonus:150,hint:'hazır erişte + pizza kutusu + çöp kutusu',done:it=>countOf(it,['ramen'])&&countOf(it,['pizzaBox'])&&countOf(it,['trashBin'])}];
const VARIETY_POINTS=20;
function roomScore(items){const list=items||[],base=list.reduce((sum,it)=>sum+priceOf(it.type),0),kinds=new Set(list.map(it=>it.type)).size,
 sets=SETS.map(s=>({...s,complete:!!s.done(list)}));
 return{base,variety:kinds*VARIETY_POINTS,kinds,sets,total:base+kinds*VARIETY_POINTS+sets.reduce((sum,s)=>sum+(s.complete?s.bonus:0),0)}}

// ---- quests ------------------------------------------------------------------
// `done` reads a context rather than globals, so the server can judge a quest without a room on screen.
const QUESTS=[
 {id:'first',text:'İlk eşyanı yerleştir',reward:50,done:c=>c.items.length>=1},
 {id:'stack',text:'Bir şeyin üstüne bir şey koy',reward:60,done:c=>c.items.some(it=>it.on)},
 {id:'wall',text:'Duvara bir şey as',reward:80,done:c=>c.items.some(it=>it.wall)},
 {id:'five',text:'Odana 5 eşya yerleştir',reward:100,done:c=>c.items.length>=5},
 {id:'set',text:'Bir seti tamamla',reward:250,done:c=>c.score.sets.some(s=>s.complete)},
 {id:'s1500',text:'Oda puanını 1.500 yap',reward:300,done:c=>c.score.total>=1500},
 {id:'s4000',text:'Oda puanını 4.000 yap',reward:600,done:c=>c.score.total>=4000},
 {id:'sets3',text:'Üç seti tamamla',reward:800,done:c=>c.score.sets.filter(s=>s.complete).length>=3}];
const questContext=items=>({items:items||[],score:roomScore(items)});
const questState=(state,q,ctx)=>state.claimed.includes(q.id)?'claimed':q.done(ctx)?'ready':'open';

// ---- geometry ----------------------------------------------------------------
const EPS=1e-6;
const kindOf=(defs,it)=>(defs[it.type]||{}).kind;
function footprint(defs,it){const def=defs[it.type]||{w:0,d:0},turned=(it.r||0)%2===1;
 return{i0:it.i,j0:it.j,i1:it.i+(turned?def.d:def.w),j1:it.j+(turned?def.w:def.d)}}
const wallSpan=(defs,it)=>{const def=defs[it.type]||{w:0,h:0};return{a0:it.a,a1:it.a+def.w,z0:it.z,z1:it.z+def.h}};
const meet=(a,b)=>a.i0<b.i1-EPS&&b.i0<a.i1-EPS&&a.j0<b.j1-EPS&&b.j0<a.j1-EPS;
const inside=(a,b)=>a.i0>=b.i0-EPS&&a.j0>=b.j0-EPS&&a.i1<=b.i1+EPS&&a.j1<=b.j1+EPS;
const expansionPrice=(w,d,side)=>Math.round(ROOM_STEP*(side==='i'?d:w)*(EXPAND_TILE_BASE+w*d*EXPAND_TILE_PER_AREA)/10)*10;
const canExpand=(w,d,side)=>(side==='i'?w:d)+ROOM_STEP<=ROOM_MAX;

// May `it` stand where it says it does? `items` is every other item in the room.
// `skip` holds ids that should not count as obstacles - the item itself, and whatever is being carried with it.
function placementOk(defs,items,it,w,d,skip){const def=defs[it.type];if(!def)return false;
 const hide=skip||new Set([it.id]);
 const others=items.filter(o=>o!==it&&!hide.has(o.id));
 if(def.kind==='wall'){if(it.wall!=='i'&&it.wall!=='j')return false;
  const s=wallSpan(defs,it),len=it.wall==='i'?w:d;
  if(s.a0<-EPS||s.a1>len+EPS||s.z0<(def.onFloor?0:.25)-EPS||s.z1>WALL_H-.1+EPS)return false;
  return!others.some(o=>kindOf(defs,o)==='wall'&&o.wall===it.wall&&(t=>s.a0<t.a1-EPS&&t.a0<s.a1-EPS&&s.z0<t.z1-EPS&&t.z0<s.z1-EPS)(wallSpan(defs,o)))}
 const f=footprint(defs,it);
 if(!inside(f,{i0:0,j0:0,i1:w,j1:d}))return false;
 if(it.on){const parent=items.find(o=>o.id===it.on);
  if(!parent||!def.canStack||(defs[parent.type]||{}).top==null||!inside(f,footprint(defs,parent)))return false;
  return!others.some(o=>o.on===it.on&&meet(f,footprint(defs,o)))}
 return!others.some(o=>kindOf(defs,o)===def.kind&&!o.on&&meet(f,footprint(defs,o)))}

const onGrid=(v,step)=>Math.abs(v/step-Math.round(v/step))<1e-6;
// Everything a room has to satisfy before it is stored: known items, legal geometry, and a look the player owns.
function validateRoom(defs,state,room,size){
 if(!room||!Array.isArray(room.items))return'oda okunamadı';
 if(room.items.length>600)return'çok fazla eşya';
 if(room.w!==size.w||room.d!==size.d)return'oda boyutu sunucudakiyle uyuşmuyor';
 const seen=new Set();
 for(const it of room.items){
  const def=defs[it.type];
  if(!def)return'bilinmeyen eşya: '+it.type;
  if(!it.id||seen.has(it.id))return'eşya kimliği tekrar ediyor';
  seen.add(it.id);
  if(def.kind==='wall'){if(!onGrid(it.a,SNAP)||!onGrid(it.z,WALL_SNAP_Z))return'duvar eşyası ızgaraya oturmuyor'}
  else if(!onGrid(it.i,SNAP)||!onGrid(it.j,SNAP))return'eşya ızgaraya oturmuyor';
  if(!placementOk(defs,room.items,it,size.w,size.d))return'eşya buraya konamaz: '+it.type;
 }
 for(const[group,value]of Object.entries(room.look||{}))
  if(!lookUnlocked(state,group,value))return'bu görünüm açık değil: '+group+'/'+value;
 if(room.style&&!lookUnlocked(state,'style',room.style))return'bu stil açık değil: '+room.style;
 return null}

// Placing and removing move items between the room and the inventory; the counts have to add up.
function reconcile(state,beforeItems,afterItems){
 const tally=items=>{const out={};for(const it of items)out[it.type]=(out[it.type]||0)+1;return out};
 const before=tally(beforeItems),after=tally(afterItems),next=normalize(state);
 for(const type of new Set([...Object.keys(before),...Object.keys(after)])){
  const delta=(after[type]||0)-(before[type]||0);          // how many more are now placed
  const left=(next.inventory[type]||0)-delta;
  if(left<0)return{ok:false,error:'elinde bu kadar yok: '+type};
  if(left)next.inventory[type]=left;else delete next.inventory[type];
 }
 return{ok:true,state:next}}

// ---- commands ----------------------------------------------------------------
// One transition, run the same way on both sides. `ctx` carries what the rules need to look at:
// the room's items and size, and which item types exist.
function apply(state,cmd,ctx){
 const next=normalize(state),day=today();
 const fail=error=>({ok:false,error});
 const spend=price=>{if(next.coins<price)return false;next.coins-=price;return true};
 switch(cmd&&cmd.action){
  case'buy':{
   const type=cmd.type;
   if(!ctx.types.includes(type))return fail('böyle bir eşya yok');
   const deal=cmd.deal?dealsFor(day,ctx.types).find(d=>d.type===type):null;
   if(cmd.deal&&!deal)return fail('bugünün fırsatı değil');
   if(deal&&dealSold(next,type))return fail('bugünlük satıldı');
   const price=deal?deal.price:priceOf(type);
   if(!spend(price))return fail('yetersiz ◉');
   if(deal){if(next.deals.day!==day)next.deals={day,bought:[]};next.deals.bought=[...next.deals.bought,type]}
   next.inventory[type]=(next.inventory[type]||0)+1;
   return{ok:true,state:next,result:{price}}}

  case'daily':{
   if(!dailyReady(next))return fail('bugünkü ödül alındı');
   const streak=next.daily.last&&dayNumber(day)-dayNumber(next.daily.last)===1?next.daily.streak+1:1;
   const amount=Math.min(DAILY_MAX,DAILY_BASE+(streak-1)*DAILY_STREAK);
   next.daily={last:day,streak};next.coins+=amount;
   return{ok:true,state:next,result:{amount,streak}}}

  case'quest':{
   const quest=QUESTS.find(q=>q.id===cmd.id);
   if(!quest)return fail('böyle bir görev yok');
   if(next.claimed.includes(quest.id))return fail('bu görev alınmış');
   if(!quest.done(questContext(ctx.items)))return fail('görev tamamlanmadı');
   next.claimed=[...next.claimed,quest.id];next.coins+=quest.reward;
   return{ok:true,state:next,result:{amount:quest.reward}}}

  case'expand':{
   const side=cmd.side;
   if(side!=='i'&&side!=='j')return fail('yön geçersiz');
   if(!canExpand(ctx.w,ctx.d,side))return fail('oda en büyük boyutta');
   if(!spend(expansionPrice(ctx.w,ctx.d,side)))return fail('yetersiz ◉');
   return{ok:true,state:next,result:{w:ctx.w+(side==='i'?ROOM_STEP:0),d:ctx.d+(side==='j'?ROOM_STEP:0)}}}

  case'unlock':{
   const option=lookOption(cmd.group,cmd.value);
   if(!option)return fail('böyle bir seçenek yok');
   if(lookUnlocked(next,cmd.group,cmd.value))return fail('zaten açık');
   if(!spend(option[2]))return fail('yetersiz ◉');
   next.unlocked=[...next.unlocked,cmd.group+':'+cmd.value];
   return{ok:true,state:next,result:{price:option[2]}}}
 }
 return fail('bilinmeyen komut')}

const RULES={PRICES,priceOf,rarityOf,RARITY_NAME,START,DAILY_BASE,DAILY_STREAK,DAILY_MAX,DEAL_COUNT,DEAL_OFF,
 ROOM_SIZE,ROOM_STEP,ROOM_MAX,WALL_H,SNAP,WALL_SNAP_Z,EXPAND_TILE_BASE,EXPAND_TILE_PER_AREA,
 rng,freshState,normalize,owned,today,dayNumber,dealsFor,dealSold,dailyReady,
 LOOK_GROUPS,LOOK_OPTIONS,lookOption,lookUnlocked,
 DESKS,SCREENS,KEYS,CHAIRS,SETS,VARIETY_POINTS,countOf,roomScore,
 QUESTS,questContext,questState,
 footprint,wallSpan,placementOk,validateRoom,reconcile,expansionPrice,canExpand,apply};

if(typeof module==='object'&&module.exports)module.exports=RULES;else root.RULES=RULES;
})(typeof globalThis!=='undefined'?globalThis:this);
