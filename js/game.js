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
 bed:520,sofa:480,armchair:300,beanbag:160,bookshelf:380,coffeeTable:150,nightstand:120,wardrobe:420,floorLamp:140,deskLamp:80,catSleeping:650,cactus:45,aquarium:700,trashBin:30,rugRound:240,
 fridge:460,kitchenCounter:520,coffeeMachine:180,microwave:160,pizzaBox:20,ramen:10,
 miningRig:1500,safe:950,validatorNode:800,hardwareWallet:120,goldBars:1000,trophy:600,rocket:350,moonLamp:220,diamond:2000,
 window:300,door:200,pictureFrame:400,neon:550,chartBoard:320,wallShelf:180,stringLights:130};
const priceOf=type=>PRICES[type]??100;
const rarityOf=type=>priceOf(type)>=800?'epic':priceOf(type)>=340?'rare':'common';
const RARITY_NAME={common:'sıradan',rare:'nadir',epic:'efsane'};
const START={coins:600,inventory:{deskMedium:1,chair:1,crate:2,plantSmall:1,mug:1}};
const DAILY_BASE=150,DAILY_STREAK=25,DAILY_MAX=300,DEAL_COUNT=3,DEAL_OFF=.3;

// ---- SAVE -------------------------------------------------------------------
let save;
function loadGame(){try{save=JSON.parse(localStorage.getItem(SAVE_KEY))}catch{save=null}
 if(!save||typeof save.coins!=='number')save={v:1,coins:START.coins,inventory:{...START.inventory},claimed:[],daily:{last:'',streak:0},deals:{day:'',bought:[]}};
 save.inventory=save.inventory||{};save.claimed=save.claimed||[];save.daily=save.daily||{last:'',streak:0};save.deals=save.deals||{day:'',bought:[]}}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{}}
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

// ---- ROOM SCORE -------------------------------------------------------------
// Placed items count for their price, every different kind of item adds a little, and complete sets add a bonus each.
const countOf=(items,types)=>items.filter(it=>types.includes(it.type)).length;
const SETS=[
 {name:'Çalışma masası',bonus:300,hint:'masa + monitör ya da terminal + klavye + koltuk',done:it=>countOf(it,['deskLarge','deskMedium','deskLow'])&&countOf(it,['monitor','terminal'])&&countOf(it,['keyboard'])&&countOf(it,['chair'])},
 {name:'Yayın köşesi',bonus:350,hint:'büyük TV + küçük TV + hoparlör',done:it=>countOf(it,['crtBig'])&&countOf(it,['crtSmall'])&&countOf(it,['speaker'])},
 {name:'Sunucu odası',bonus:500,hint:'sunucu rafı + kasa + bağlantı paneli',done:it=>countOf(it,['rack'])&&countOf(it,['tower'])&&countOf(it,['patchboard'])},
 {name:'Yeşil köşe',bonus:200,hint:'üç bitki',done:it=>countOf(it,['plantSmall','plantLarge'])>=3},
 {name:'Komuta duvarı',bonus:400,hint:'üç duvar ekranı',done:it=>countOf(it,['wallScreenS','wallScreenM','wallScreenL'])>=3},
 {name:'Oturma köşesi',bonus:350,hint:'kanepe ya da berjer + sehpa + ayaklı lamba',done:it=>countOf(it,['sofa','armchair'])&&countOf(it,['coffeeTable'])&&countOf(it,['floorLamp'])},
 {name:'Yatak odası',bonus:400,hint:'yatak + komodin + gardırop',done:it=>countOf(it,['bed'])&&countOf(it,['nightstand'])&&countOf(it,['wardrobe'])},
 {name:'Mutfak',bonus:400,hint:'buzdolabı + tezgâh + kahve makinesi',done:it=>countOf(it,['fridge'])&&countOf(it,['kitchenCounter'])&&countOf(it,['coffeeMachine'])},
 {name:'Maden ocağı',bonus:700,hint:'iki madenci kasası + doğrulayıcı düğüm',done:it=>countOf(it,['miningRig'])>=2&&countOf(it,['validatorNode'])},
 {name:'Soğuk cüzdan',bonus:600,hint:'çelik kasa + donanım cüzdanı + külçe altın',done:it=>countOf(it,['safe'])&&countOf(it,['hardwareWallet'])&&countOf(it,['goldBars'])},
 {name:'Ayı sezonu',bonus:150,hint:'hazır erişte + pizza kutusu + çöp kutusu',done:it=>countOf(it,['ramen'])&&countOf(it,['pizzaBox'])&&countOf(it,['trashBin'])}];
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
