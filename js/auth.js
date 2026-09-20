'use strict';
// Sign-in through Privy. The server decides whether a Privy app is configured (/api/config); with none we stay a
// local guest so the game is still playable offline. The Privy SDK is an ES module loaded on demand — nothing is
// fetched until the player actually opens the dialog — and the app id is public, so nothing secret lives here.
const AUTH={mode:'guest',ready:false,user:null,handle:null,privy:null,config:null,error:null};
const SDK_DEFAULT='https://esm.sh/@privy-io/js-sdk-core@0.68';

const guestId=()=>{try{let id=localStorage.getItem('theroom.guest');
 if(!id){id=(crypto.randomUUID&&crypto.randomUUID())||('g-'+Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('theroom.guest',id)}
 return id.toLowerCase()}catch{return 'local-guest-fallback'}};

// What to call the player. Privy's user shape has changed across versions, so read it defensively.
function handleOf(user){if(!user)return null;
 const accounts=user.linked_accounts||user.linkedAccounts||[];
 const wallet=accounts.find(a=>String(a.type||'').includes('wallet')&&a.address);
 if(wallet)return wallet.address.slice(0,6)+'…'+wallet.address.slice(-4);
 const email=accounts.find(a=>String(a.type||'').includes('email'));
 const address=email&&(email.address||email.email||email.detail);
 if(address)return String(address).split('@')[0];
 return String(user.id||user.did||'').replace('did:privy:','').slice(0,10)||null}

// The headers that identify this player to our own API, or null when there is nobody to identify.
AUTH.headers=async()=>{
 if(AUTH.mode==='privy'){if(!AUTH.user)return null;
  try{const token=await AUTH.privy.getAccessToken();return token?{authorization:'Bearer '+token}:null}catch{return null}}
 return{'x-guest-id':guestId()}};

async function loadSdk(){const url=(AUTH.config.privy&&AUTH.config.privy.sdkUrl)||SDK_DEFAULT;
 const mod=await import(url);return mod.default?mod:{...mod,default:mod.Privy}}

async function startPrivy(){const mod=await loadSdk(),Privy=mod.default,{LocalStorage}=mod;
 AUTH.privy=new Privy({appId:AUTH.config.privy.appId,clientId:AUTH.config.privy.clientId||undefined,storage:new LocalStorage()});
 await AUTH.privy.initialize();
 try{const{user}=await AUTH.privy.user.get();setUser(user)}catch{setUser(null)}
 return AUTH.privy}

function setUser(user){AUTH.user=user||null;AUTH.handle=handleOf(user);
 if(typeof refreshProfile==='function')refreshProfile();
 if(typeof onAuthChanged==='function')onAuthChanged()}

AUTH.init=async()=>{
 try{AUTH.config=await(await fetch('/api/config')).json()}catch{AUTH.config={mode:'guest',privy:null}}
 AUTH.mode=AUTH.config.mode==='privy'?'privy':'guest';
 // A configured app still restores in the background; a failure here only means "signed out".
 if(AUTH.mode==='privy'){try{await startPrivy()}catch(error){AUTH.error=error.message}}
 AUTH.ready=true;return AUTH};

AUTH.logout=async()=>{try{if(AUTH.privy&&AUTH.user)await AUTH.privy.auth.logout({userId:AUTH.user.id})}catch{}
 setUser(null)};

// ---- dialog -------------------------------------------------------------------
{
 const $=id=>document.getElementById(id);
 const dialog=$('login-dialog'),note=$('login-note'),form=$('login-form'),
  emailBox=$('login-email'),codeBox=$('login-code'),submit=$('login-submit'),back=$('login-back');
 let step='email',email='',busy=false;

 const say=(text,bad=false)=>{note.textContent=text;note.classList.toggle('bad',bad)};
 function render(){
  emailBox.parentElement.hidden=step!=='email';codeBox.parentElement.hidden=step!=='code';
  back.hidden=step!=='code';submit.textContent=busy?'…':step==='email'?'Kod gönder':'Giriş yap';
  submit.disabled=busy;(step==='email'?emailBox:codeBox).focus()}

 AUTH.open=async()=>{
  if(AUTH.user){await AUTH.logout();if(typeof flash==='function')flash('Çıkış yapıldı');return}
  step='email';busy=false;codeBox.value='';
  if(AUTH.mode!=='privy'){
   say('Privy henüz yapılandırılmadı. config.example.json dosyasını config.json olarak kopyalayıp panelden aldığın App ID ile doğrulama anahtarını yazman yeterli; sunucuyu yeniden başlatınca giriş açılır.');
   form.hidden=true;dialog.showModal();return}
  form.hidden=false;say('E-posta adresine altı haneli bir kod göndereceğiz.');render();dialog.showModal()};

 form.addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;render();
  try{
   if(step==='email'){email=emailBox.value.trim();await AUTH.privy.auth.email.sendCode(email);
    step='code';say('Kodu '+email+' adresine gönderdik.')}
   else{const{user}=await AUTH.privy.auth.email.loginWithCode(email,codeBox.value.trim());
    setUser(user);await ensureWallet();dialog.close();
    if(typeof flash==='function')flash('Giriş yapıldı · '+(AUTH.handle||''))}
  }catch(error){say(error&&error.message?error.message:'Bir şeyler ters gitti, tekrar dene.',true)}
  busy=false;render()});

 back.onclick=()=>{step='email';say('E-posta adresine altı haneli bir kod göndereceğiz.');render()};
 $('login-close').onclick=()=>dialog.close();

 // A Privy account starts without a wallet; make one so the room has an address to belong to.
 async function ensureWallet(){try{
   if(handleOf(AUTH.user)&&String(AUTH.handle).startsWith('0x'))return;
   const result=await AUTH.privy.embeddedWallet.create({});
   if(result&&result.user)setUser(result.user);
  }catch(error){console.warn('embedded wallet:',error.message)}}
}
