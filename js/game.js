'use strict';
// The game layer on top of the room: coins, inventory, shop, room score and quests. Browser-only for now —
// everything here is a stand-in for what the server will own later, so nothing in it should be trusted as final numbers.
// ?sandbox (or ?default) turns the game off: every item is free and unlimited, as a drawing board for us.
const SAVE_KEY='theroom.save.v1';

// ---- ECONOMY TABLE ----------------------------------------------------------
// Price in coins. An item is worth its price in room score. Rarity follows from the price.
const PRICES={deskLarge:400,deskMedium:250,deskLow:180,monitor:300,terminal:350,keyboard:60,mousepad:30,mug:25,books:40,headphones:90,speaker:120,
 plantSmall:50,plantLarge:140,papers:10,floppy:15,chair:200,rack:900,tower:450,crtBig:600,crtSmall:380,printer:220,crate:35,spark:1200,rugLarge:320,rugSmall:150,
 wallScreenS:350,wallScreenM:480,wallScreenL:1100,clock:80,patchboard:260,poster:70,label:40,
 sofa:480,armchair:300,beanbag:160,bookshelf:380,coffeeTable:150,floorLamp:140,deskLamp:80,catSleeping:650,cactus:45,aquarium:700,trashBin:30,rugRound:240,
 coffeeMachine:180,microwave:160,pizzaBox:20,ramen:10,
 miningRig:1500,safe:950,validatorNode:800,hardwareWallet:120,goldBars:1000,trophy:600,rocket:350,moonLamp:220,diamond:2000,
 window:300,door:200,pictureFrame:400,neon:550,chartBoard:320,wallShelf:180,stringLights:130,
 // workstation
 deskL:700,standingDesk:560,ultrawide:900,verticalMonitor:420,monitorWall:2200,laptop:520,mechKeyboard:180,drawingTablet:260,micArm:240,webcam:110,ringLight:190,gamingChair:520,cableTray:70,
 // crypto hardware
 asicMiner:1100,asicRack:2600,immersionTank:3000,halfRack:700,networkSwitch:220,router:160,nas:340,ups:280,piCluster:300,seedPlate:180,pdu:120,
 industrialFan:260,generator:900,solarPanel:800,satelliteDish:750,bitcoinATM:2800,goldBitcoin:3500,dataCube:2400,
 // workshop and showpieces
 printer3d:1200,resinPrinter:700,filamentRack:300,workbench:640,solderStation:280,oscilloscope:560,robotArm:1800,drone:900,vrHeadset:640,
 laserCutter:1900,partsDrawers:260,serverCart:420,quantumComputer:5000,teslaCoil:1600,robotDog:2200,hologram:2600,lamboModel:1400,moonRock:900,
 // lounge and walls
 meetingTable:900,phoneBooth:1600,lockers:420,waterCooler:200,miniFridge:380,vendingMachine:1400,arcade:1700,foosball:1300,roomba:420,hydroRack:850,
 projector:380,projectorScreen:420,ticker:1500,orderBook:600,blockHeight:700,halvingClock:500,worldClocks:400,whiteboard:340,whitepaper:600,
 securityCam:280,cardReader:220,ledStrip:200,plaques:450,vent:90};
const priceOf=type=>PRICES[type]??100;
const rarityOf=type=>priceOf(type)>=800?'epic':priceOf(type)>=340?'rare':'common';
const RARITY_NAME={common:'sıradan',rare:'nadir',epic:'efsane'};
const START={coins:600,inventory:{deskMedium:1,chair:1,crate:2,plantSmall:1,mug:1}};
const DAILY_BASE=150,DAILY_STREAK=25,DAILY_MAX=300,DEAL_COUNT=3,DEAL_OFF=.3;

// ---- SAVE -------------------------------------------------------------------
let save;
// Fills in whatever an older or server-sent save is missing. Kept apart from loading so sync.js can adopt
// a save that came from the server without reading localStorage back over it.
function normalizeSave(){
 if(!save||typeof save.coins!=='number')save={v:1,coins:START.coins,inventory:{...START.inventory},claimed:[],daily:{last:'',streak:0},deals:{day:'',bought:[]}};
 if(!save.player)save.player={id:Math.floor(Math.random()*65536).toString(16).padStart(4,'0'),name:''}; // a guest until sign-in
 save.inventory=save.inventory||{};save.claimed=save.claimed||[];save.daily=save.daily||{last:'',streak:0};save.deals=save.deals||{day:'',bought:[]}}
function loadGame(){try{save=JSON.parse(localStorage.getItem(SAVE_KEY))}catch{save=null}normalizeSave()}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{}notifyChanged()}
const playerTag=()=>(typeof AUTH!=='undefined'&&AUTH.handle)||save.player.name||('misafir #'+save.player.id);
const owned=type=>save.inventory[type]||0;
function give(type,n=1){save.inventory[type]=owned(type)+n;if(save.inventory[type]<=0)delete save.inventory[type];saveGame()}
function earn(n){save.coins+=n;saveGame()}

// ---- SHOP -------------------------------------------------------------------
const today=()=>new Date().toISOString().slice(0,10);
const dayNumber=day=>Math.floor(Date.parse(day)/864e5);
// Three discounted items a day, one of each in stock; the same for everyone on the same date.
function dealsToday(){const day=today();if(save.deals.day!==day){save.deals={day,bought:[]};saveGame()}
 const r=rng(dayNumber(day)*7919),pool=Object.keys(ITEMS).filter(t=>priceOf(t)>=120),out=[];while(out.length<DEAL_COUNT&&pool.length)out.push(pool.splice(Math.floor(r()*pool.length),1)[0]);
 return out.map(type=>({type,price:Math.round(priceOf(type)*(1-DEAL_OFF)/5)*5,sold:save.deals.bought.includes(type)}))}
function buy(type,deal){const offer=deal&&dealsToday().find(d=>d.type===type&&!d.sold),price=offer?offer.price:priceOf(type);if(save.coins<price)return false;
 save.coins-=price;if(offer)save.deals.bought.push(type);give(type);return true}
function dailyReady(){return save.daily.last!==today()}
function claimDaily(){if(!dailyReady())return 0;const day=today(),streak=save.daily.last&&dayNumber(day)-dayNumber(save.daily.last)===1?save.daily.streak+1:1,amount=Math.min(DAILY_MAX,DAILY_BASE+(streak-1)*DAILY_STREAK);
 save.daily={last:day,streak};earn(amount);return amount}

// ---- EXPANSION --------------------------------------------------------------
// Each step adds ROOM_STEP tiles along one open edge. A tile costs more the larger the room already is.
// (Later, with a server: steps beyond the second also ask for invited friends — EXPAND_INVITES — not enforced yet.)
const EXPAND_TILE_BASE=10,EXPAND_TILE_PER_AREA=1/8,EXPAND_INVITES=[0,0,1,1,2,2];
function expansionPrice(side){const added=ROOM_STEP*(side==='i'?ROOM_D:ROOM_W);return SANDBOX?0:Math.round(added*(EXPAND_TILE_BASE+ROOM_W*ROOM_D*EXPAND_TILE_PER_AREA)/10)*10}
function buyExpansion(side){if(!canExpand(side))return false;const price=expansionPrice(side);if(save.coins<price)return false;if(price)earn(-price);
 if(side==='i')room.w+=ROOM_STEP;else room.d+=ROOM_STEP;setRoomSize(room.w,room.d);return true}

// ---- ROOM LOOK --------------------------------------------------------------
// [value, label, price, colour chip]. Price 0 = everyone has it. Bought options are kept in save.unlocked as 'group:value'.
const LOOK_GROUPS=[['wall','Duvar'],['floor','Zemin'],['pattern','Zemin deseni'],['trim','Süpürgelik ve pervaz'],['style','Baskı stili']];
const LOOK_OPTIONS={
 wall:[['blue','Lacivert',0,'blue'],['teal','Petrol',150,'teal'],['coral','Mercan',150,'coral'],['sun','Hardal',150,'sun'],['paper','Açık',200,'paper']],
 floor:[['teal','Gece',0,'teal'],['blue','Koyu',120,'blue'],['wood','Ahşap',250,'sun'],['coral','Kiremit',200,'coral'],['light','Açık',200,'paper']],
 pattern:[['checker','Dama',0],['plain','Düz',80],['planks','Parke',250],['tiles','Karo',250]],
 trim:[['coral','Mercan',0,'coral'],['sun','Sarı',60,'sun'],['teal','Petrol',60,'teal'],['blue','Lacivert',60,'blue'],['paper','Beyaz',60,'paper']],
 style:[['riso','Riso',0],['hard','Sert riso',300],['flat','Düz vektör',300],['gravur','Gravür',800],['comic','Çizgi roman',800],['night','Gece / neon',1200]]};
const lookUnlocked=(group,value)=>SANDBOX||LOOK_OPTIONS[group].find(o=>o[0]===value)?.[2]===0||(save.unlocked||[]).includes(group+':'+value);
function unlockLook(group,value,price){earn(-price);save.unlocked=[...(save.unlocked||[]),group+':'+value];saveGame()}

// ---- ROOM SCORE -------------------------------------------------------------
// Placed items count for their price, every different kind of item adds a little, and complete sets add a bonus each.
const countOf=(items,types)=>items.filter(it=>types.includes(it.type)).length;
// A set is a themed group of items; completing it adds its bonus to the room score.
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
const DESKS=['deskLarge','deskMedium','deskLow','deskL','standingDesk'],SCREENS=['monitor','terminal','ultrawide','verticalMonitor','monitorWall','laptop'],
 KEYS=['keyboard','mechKeyboard'],CHAIRS=['chair','gamingChair'];
const VARIETY_POINTS=20;
function roomScore(items=room.items){const base=items.reduce((sum,it)=>sum+priceOf(it.type),0),kinds=new Set(items.map(it=>it.type)).size,sets=SETS.map(s=>({...s,complete:!!s.done(items)}));
 return{base,variety:kinds*VARIETY_POINTS,kinds,sets,total:base+kinds*VARIETY_POINTS+sets.reduce((sum,s)=>sum+(s.complete?s.bonus:0),0)}}

// ---- QUESTS -----------------------------------------------------------------
const QUESTS=[
 {id:'first',text:'İlk eşyanı yerleştir',reward:50,done:()=>room.items.length>=1},
 {id:'stack',text:'Bir şeyin üstüne bir şey koy',reward:60,done:()=>room.items.some(it=>it.on)},
 {id:'wall',text:'Duvara bir şey as',reward:80,done:()=>room.items.some(it=>it.wall)},
 {id:'five',text:'Odana 5 eşya yerleştir',reward:100,done:()=>room.items.length>=5},
 {id:'set',text:'Bir seti tamamla',reward:250,done:()=>roomScore().sets.some(s=>s.complete)},
 {id:'s1500',text:'Oda puanını 1.500 yap',reward:300,done:()=>roomScore().total>=1500},
 {id:'s4000',text:'Oda puanını 4.000 yap',reward:600,done:()=>roomScore().total>=4000},
 {id:'sets3',text:'Üç seti tamamla',reward:800,done:()=>roomScore().sets.filter(s=>s.complete).length>=3}];
const questState=q=>save.claimed.includes(q.id)?'claimed':q.done()?'ready':'open';
function claimQuest(id){const q=QUESTS.find(x=>x.id===id);if(!q||questState(q)!=='ready')return 0;save.claimed.push(id);earn(q.reward);return q.reward}
const questsReady=()=>QUESTS.filter(q=>questState(q)==='ready').length;
const fmt=n=>n.toLocaleString('tr-TR');
loadGame();
