'use strict';
// Keeps the player's save and room on the server. While signed in the server holds the record and the browser
// copy is only a cache; offline, or before sign-in, everything still works out of localStorage alone.
// This is deliberately trusting for now — the server stores whatever the client sends. Moving the rules
// (prices, rewards, placement) to the server is the next step, and this is where that will hook in.
{
 const IDLE=2000,RETRY=8000;
 let headers=null,pushing=false,dirty=false,timer=0,lastSent='';

 const status=text=>{const el=document.getElementById('sync-state');if(el)el.textContent=text||''};
 // Not being signed in is a normal state, not a failure; say which one it is.
 const idle=()=>status(AUTH.mode==='privy'&&!AUTH.user?'giriş yapılmadı':'çevrimdışı');
 const snapshot=()=>JSON.stringify({save,room});

 async function pull(){
  const response=await fetch('/api/state',{headers});
  if(!response.ok)throw new Error('durum alınamadı ('+response.status+')');
  const {state}=await response.json();
  if(!state||!state.save)return false;                       // nothing stored yet: our local copy wins
  save=state.save;normalizeSave();                           // fill in anything an older save is missing
  if(state.room&&Array.isArray(state.room.items))loadRoom(state.room);
  lastSent=snapshot();
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(save));localStorage.setItem(STORE_KEY,JSON.stringify(room))}catch{} // keep the offline cache in step
  if(typeof cacheRoom==='function'){cacheRoom();refreshPanel();fit()}
  return true;
 }

 async function push(){
  if(!headers||pushing)return;
  const body=snapshot();
  if(body===lastSent){dirty=false;return}
  pushing=true;
  try{
   const response=await fetch('/api/state',{method:'PUT',headers:{...headers,'content-type':'application/json'},body});
   if(!response.ok)throw new Error(String(response.status));
   lastSent=body;dirty=false;status('');
  }catch(error){
   status('kaydedilemedi');dirty=true;clearTimeout(timer);timer=setTimeout(flush,RETRY); // keep the local copy and try again
  }finally{pushing=false}
 }
 async function flush(){headers=await AUTH.headers();await push()}

 function schedule(){dirty=true;clearTimeout(timer);timer=setTimeout(flush,IDLE)}
 stateChanged.push(schedule);
 // A normal request dies with the page; keepalive lets this one finish, and it can still carry the auth header.
 addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden'||!dirty||!headers)return;
  const body=snapshot();if(body===lastSent)return;
  try{fetch('/api/state',{method:'PUT',keepalive:true,headers:{...headers,'content-type':'application/json'},body});lastSent=body;dirty=false}catch{}});

 (async()=>{
  if(SANDBOX)return;                                          // the drawing board stays local
  await AUTH.init();
  headers=await AUTH.headers();
  if(!headers)return idle();
  try{
   const had=await pull();
   if(!had)await push();                                      // first sign-in: the room we already built moves across
   status('');
  }catch(error){idle()}
  if(typeof refreshProfile==='function')refreshProfile();
 })();

 // Signing in or out swaps which store we are talking to.
 window.onAuthChanged=async()=>{
  headers=await AUTH.headers();lastSent='';
  if(!headers)return idle();
  try{const had=await pull();if(!had)await push();status('')}catch{idle()}
 };
}
