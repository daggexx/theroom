'use strict';
// The game layer, now a thin adapter over js/rules.js. Every change to coins or inventory is applied here first so
// the interface answers at once, then handed to sync.js; the server runs the very same rules and has the last word.
// Without a server — the sandbox, or an offline tab — these local results simply stand.
const SAVE_KEY='theroom.save.v1';
const {priceOf,rarityOf,RARITY_NAME,START,LOOK_GROUPS,LOOK_OPTIONS,SETS,VARIETY_POINTS,QUESTS,PRICES}=RULES;

let save;
// Fills in whatever an older or server-sent save is missing. Kept apart from loading so sync.js can adopt a save
// that came from the server without reading localStorage back over it.
function normalizeSave(){save=RULES.normalize(save);
 if(!save.player)save.player={id:Math.floor(Math.random()*65536).toString(16).padStart(4,'0'),name:''}} // a guest until sign-in
function loadGame(){try{save=JSON.parse(localStorage.getItem(SAVE_KEY))}catch{save=null}normalizeSave()}
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{}notifyChanged()}
const playerTag=()=>(typeof AUTH!=='undefined'&&AUTH.handle)||save.player.name||('misafir #'+save.player.id);

// ---- derived values, recomputed only when the room or the save actually changes ----
let scoreCache=null,questCache=null;
stateChanged.push(()=>{scoreCache=questCache=null});
function roomScore(items){if(items)return RULES.roomScore(items);
 return scoreCache||(scoreCache=RULES.roomScore(room.items))}
const questCtx=()=>questCache||(questCache=RULES.questContext(room.items));

// ---- commands ----------------------------------------------------------------
// The context the rules look at: what is in the room, how big it is, and which item types exist.
const gameCtx=()=>({items:(typeof room==='object'&&room&&room.items)||[],w:ROOM_W,d:ROOM_D,types:Object.keys(ITEMS)});
function command(cmd){
 const out=RULES.apply(save,cmd,gameCtx());
 if(!out.ok)return out;
 save=out.state;saveGame();
 if(typeof queueCommand==='function')queueCommand(cmd);  // sync.js sends it on; the server decides for real
 return out}

const owned=type=>RULES.owned(save,type);
// Placing and removing only move an item between the room and the inventory. The server works the same change out
// from the room it receives, so this is just the local mirror of it.
function give(type,n=1){const next=owned(type)+n;if(next>0)save.inventory[type]=next;else delete save.inventory[type];saveGame()}

// ---- shop --------------------------------------------------------------------
const dealsToday=()=>RULES.dealsFor(RULES.today(),Object.keys(ITEMS)).map(d=>({...d,sold:RULES.dealSold(save,d.type)}));
const buy=(type,deal)=>command({action:'buy',type,deal:!!deal}).ok;
const dailyReady=()=>RULES.dailyReady(save);
function claimDaily(){const out=command({action:'daily'});return out.ok?out.result.amount:0}

// ---- expansion ---------------------------------------------------------------
const expansionPrice=side=>SANDBOX?0:RULES.expansionPrice(ROOM_W,ROOM_D,side);
function buyExpansion(side){if(!canExpand(side))return false;
 if(!SANDBOX&&!command({action:'expand',side}).ok)return false;
 if(side==='i')room.w+=ROOM_STEP;else room.d+=ROOM_STEP;setRoomSize(room.w,room.d);return true}

// ---- room look ---------------------------------------------------------------
const lookUnlocked=(group,value)=>SANDBOX||RULES.lookUnlocked(save,group,value);
const unlockLook=(group,value)=>command({action:'unlock',group,value}).ok;

// ---- quests ------------------------------------------------------------------
const questState=q=>RULES.questState(save,q,questCtx());
const claimQuest=id=>{const out=command({action:'quest',id});return out.ok?out.result.amount:0};
const questsReady=()=>QUESTS.filter(q=>questState(q)==='ready').length;

const fmt=n=>n.toLocaleString('tr-TR');
loadGame();
