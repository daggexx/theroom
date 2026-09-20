'use strict';
// Talks to the server. Commands the player performs are queued and sent together with the room; the server runs the
// same rules from js/rules.js, stores the result and sends back the save it decided on. The browser copy stays as
// the offline fallback, so a dropped connection only means "not saved yet", never a lost room.
{
 const IDLE=1200,RETRY=8000,QUEUE_MAX=50;
 let headers=null,queue=[],sending=false,dirty=false,timer=0,lastRoom='';

 const status=text=>{const el=document.getElementById('sync-state');if(el)el.textContent=text||''};
 // Not being signed in is a normal state, not a failure; say which one it is.
 const idle=()=>status(AUTH.mode==='privy'&&!AUTH.user?'giriş yapılmadı':'çevrimdışı');

 function adopt(state,serverRoom,takeRoom){
  save=state;normalizeSave();
  if(takeRoom&&serverRoom&&Array.isArray(serverRoom.items)){loadRoom(serverRoom);
   if(typeof cacheRoom==='function'){cacheRoom();fit()}}
  lastRoom=JSON.stringify(room);
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));localStorage.setItem(STORE_KEY,JSON.stringify(room))}catch{}
  if(typeof refreshPanel==='function')refreshPanel();
 }

 async function send(){
  if(!headers||sending)return;
  const commands=queue.slice(0,QUEUE_MAX);
  if(!commands.length&&JSON.stringify(room)===lastRoom){dirty=false;return}
  sending=true;
  try{
   const response=await fetch('/api/sync',{method:'POST',headers:{...headers,'content-type':'application/json'},
    body:JSON.stringify({commands,room})});
   if(!response.ok)throw new Error(String(response.status));
   const result=await response.json();
   queue=queue.slice(commands.length);
   // The server refusing something means our copy drifted; take its room back rather than arguing.
   const refused=(result.results||[]).filter(r=>!r.ok);
   adopt(result.save,result.room,refused.length>0);
   if(refused.length&&typeof flash==='function')flash('Sunucu düzeltti: '+refused[0].error);
   dirty=false;status('');
  }catch(error){
   dirty=true;status('kaydedilemedi');clearTimeout(timer);timer=setTimeout(flush,RETRY);
  }finally{sending=false}
 }
 async function flush(){headers=await AUTH.headers();if(!headers)return idle();await send();
  if(dirty||queue.length){clearTimeout(timer);timer=setTimeout(flush,IDLE)}}

 function schedule(){dirty=true;clearTimeout(timer);timer=setTimeout(flush,IDLE)}
 stateChanged.push(schedule);
 window.queueCommand=cmd=>{queue.push(cmd);schedule()};   // game.js calls this after applying a rule locally

 // A normal request dies with the page; keepalive lets this one finish, and it can still carry the auth header.
 addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden'||!headers)return;
  if(!queue.length&&JSON.stringify(room)===lastRoom)return;
  try{fetch('/api/sync',{method:'POST',keepalive:true,headers:{...headers,'content-type':'application/json'},
   body:JSON.stringify({commands:queue.slice(0,QUEUE_MAX),room})});queue=[];dirty=false}catch{}});

 async function begin(){
  headers=await AUTH.headers();
  if(!headers)return idle();
  try{
   const response=await fetch('/api/state',{headers});
   if(!response.ok)throw new Error(String(response.status));
   const {state}=await response.json();
   if(state&&state.save){
    // The account is the record. A room built here before signing in is offered once, and the server keeps
    // whatever of it the player actually owns.
    const mine=room&&room.items&&room.items.length?room:null;
    const serverEmpty=!(state.room&&state.room.items&&state.room.items.length);
    adopt(state.save,state.room,true);
    if(mine&&serverEmpty){loadRoom(mine);if(typeof cacheRoom==='function'){cacheRoom();fit()}schedule()}
   }
   status('');
  }catch(error){idle()}
  if(typeof refreshProfile==='function')refreshProfile();
 }

 if(!SANDBOX)AUTH.init().then(begin);                      // the drawing board stays local
 window.onAuthChanged=()=>{queue=[];lastRoom='';begin()};   // signing in or out swaps which store we talk to
}
