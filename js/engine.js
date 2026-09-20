'use strict';
// Drawing engine: style, projection, ink primitives, item frames and live screens.
// Knows nothing about which room is drawn — see items.js (catalogue), room.js (room data) and app.js (camera, UI).
const canvas=document.getElementById('stage'),ctx=canvas.getContext('2d',{alpha:false});
const TAU=Math.PI*2,QUERY=new URLSearchParams(location.search);
const ROOM_SIZE=12,WALL_H=3.4; // ROOM_SIZE is only the size a room starts with
let ROOM_W=ROOM_SIZE,ROOM_D=ROOM_SIZE; // the room being drawn: tiles along i and along j (see setRoomSize)

// ---- STYLE ---------------------------------------------------------------
// Everything that decides the look lives here; item code never names a colour value or a texture number.
// Pick with ?style=name, the footer menu or the S key. Any number can be overridden from the URL: ?style=riso&wobble=.5&shift=2
const STYLES={
 riso:{label:'Riso (yumuşak)',
  ink:{blue:'#344a80',coral:'#ee6852',sun:'#ffd428',teal:'#008c8a',paper:'#f3ebdd'},
  ang:{blue:15,coral:75,sun:0,teal:45,paper:45}, // halftone screen angle per ink
  blend:'multiply',   // 'multiply' = inks darken light paper, 'screen' = inks glow on dark paper
  halftone:'dot',     // 'dot' | 'line'
  patScale:.175,      // halftone size (cell is 15.5px × this)
  soften:.35,         // 0 = hard dots, 1 = flat colour
  wear:1,             // misprint specks in the ink
  shift:1,            // plate misregistration multiplier
  wobble:.16,         // hand-drawn line wander in px
  outlineInk:'blue',outlineW:1,outlineTone:.9,
  shade:[.18,.38],    // darkening of the two side faces of every box
  grain:['rgba(120,96,70,.035)','rgba(255,255,255,.3)'], // paper specks
  tw:32,th:16,tz:32,  // isometric projection: half tile width, half tile height, px per height unit
  view:'iso',         // 'iso' | 'front' (seen from straight ahead, depth only hinted) — also ?view=front
  fw:44,fz:44,fdx:9,fdy:6.5}, // front projection: px per tile across, px per height unit, sideways and downward drift per tile of depth
 hard:{label:'Riso (sert)',patScale:.2,soften:0,shift:1.72,wobble:.25},
 flat:{label:'Düz vektör',soften:1,wear:0,shift:0,wobble:0,outlineW:.75,grain:['rgba(0,0,0,0)','rgba(0,0,0,0)']},
 night:{label:'Gece / neon',blend:'screen',
  ink:{blue:'#3d5bd9',coral:'#ff5a7a',sun:'#ffe14d',teal:'#19d3c5',paper:'#0e1428'},
  shade:[.3,.55],shift:1.3,grain:['rgba(0,0,0,.25)','rgba(140,160,255,.05)'],ui:'#c9d4ff'},
 gravur:{label:'Gravür',halftone:'line',patScale:.15,soften:.1,wobble:.3,outlineW:1.1,shift:.6,
  ink:{blue:'#3b2a20',coral:'#a5522f',sun:'#d9a441',teal:'#5c6b4a',paper:'#e9dcc0'},
  ang:{blue:35,coral:-35,sun:0,teal:80,paper:45},grain:['rgba(70,45,20,.06)','rgba(255,250,235,.25)']},
 comic:{label:'Çizgi roman',patScale:.32,soften:0,wear:.3,shift:.5,wobble:.1,outlineW:2,outlineTone:1,shade:[.3,.55],
  ink:{blue:'#1b1b2f',coral:'#ff4b3a',sun:'#ffd000',teal:'#00a3d7',paper:'#fffdf5'}}
};
const SHIFT={blue:[.32,-.18],coral:[-.35,.26],sun:[.2,.44],teal:[-.26,-.32],paper:[0,0]};
let S,INK,ANG,B,VIEW_CX,VIEW_CY,styleName,patternCache;
function setStyle(name){
 styleName=STYLES[name]?name:'riso';S={...STYLES.riso,...STYLES[styleName]};
 for(const k in S)if(typeof S[k]==='number'&&QUERY.has(k)&&isFinite(parseFloat(QUERY.get(k))))S[k]=parseFloat(QUERY.get(k));
 if(QUERY.get('view')==='front'||QUERY.get('view')==='iso')S.view=QUERY.get('view');
 INK=S.ink;ANG=S.ang;patternCache=new WeakMap();
 measureRoom();
 const css=document.documentElement.style;css.setProperty('--paper',INK.paper);css.setProperty('--ink',S.ui||INK.blue);css.setProperty('--accent',INK.coral);css.setProperty('--frame',INK.blue);
}

// Bounds of the cached room picture, derived from the projection and the room's size so both can change freely.
function measureRoom(){const corners=[];for(const i of[0,ROOM_W])for(const j of[0,ROOM_D])for(const z of[-.8,WALL_H+.45])corners.push(p(i,j,z));
 const bb=bounds(corners),x=Math.floor(bb.x-30),y=Math.floor(bb.y-30);B={x,y,w:Math.ceil(bb.x+bb.w+30)-x,h:Math.ceil(bb.y+bb.h+30)-y};VIEW_CX=B.x+B.w/2;VIEW_CY=B.y+B.h/2-17}
function setRoomSize(w,d){ROOM_W=w;ROOM_D=d;measureRoom()}

// ---- PROJECTION ----------------------------------------------------------
// Room coordinates: i and j run along the floor, z is height. One unit is one floor tile.
const p=(i,j,z=0)=>S.view==='front'?[i*S.fw-j*S.fdx,j*S.fdy-z*S.fz]:[(i-j)*S.tw,(i+j)*S.th-z*S.tz];
// Back from a picture point to a plane of the room. The projection is linear, so this is one 2×2 solve along the plane's two axes.
function solve(x,y,origin,e1,e2){const dx=x-origin[0],dy=y-origin[1],det=e1[0]*e2[1]-e1[1]*e2[0];return[(dx*e2[1]-dy*e2[0])/det,(e1[0]*dy-e1[1]*dx)/det]}
const axis=(i,j,z)=>{const o=p(0,0,0),q=p(i,j,z);return[q[0]-o[0],q[1]-o[1]]};
const unproject=(x,y,z=0)=>solve(x,y,p(0,0,z),axis(1,0,0),axis(0,1,0)); // → [i,j] on the floor plane at height z
const unprojectWall=(wall,x,y)=>solve(x,y,p(0,0,0),wall==='i'?axis(1,0,0):axis(0,1,0),axis(0,0,1)); // → [along,z] on that wall
const tile=(i,j,w,d,z=0)=>[p(i,j,z),p(i+w,j,z),p(i+w,j+d,z),p(i,j+d,z)];
const faceI=(i,j,w,z,h)=>[p(i,j,z),p(i+w,j,z),p(i+w,j,z+h),p(i,j,z+h)];
const faceJ=(i,j,d,z,h)=>[p(i,j,z),p(i,j+d,z),p(i,j+d,z+h),p(i,j,z+h)];
// Outline of an axis-aligned block as seen on screen: used for picking, highlights and overlap tests.
const silhouette=(i,j,w,d,z,h)=>[p(i,j,z+h),p(i+w,j,z+h),p(i+w,j,z),p(i+w,j+d,z),p(i,j+d,z),p(i,j+d,z+h)];
const bounds=q=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const a of q){x0=Math.min(x0,a[0]);y0=Math.min(y0,a[1]);x1=Math.max(x1,a[0]);y1=Math.max(y1,a[1])}return{x:x0,y:y0,w:x1-x0,h:y1-y0}};
const boundsMeet=(a,b)=>a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
function pointInPolygon(q,x,y){let inside=false;for(let i=0,j=q.length-1;i<q.length;j=i++){const a=q[i],b=q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const ellipse=(x,y,rx,ry,n=32)=>Array.from({length:n},(_,k)=>[x+Math.cos(k/n*TAU)*rx,y+Math.sin(k/n*TAU)*ry]);
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
// Shapes on a panel: P maps (0..1 across, 0..1 up) to the picture, so circles come out correctly skewed.
const quad=(P,x,y,w,h)=>[P(x,y),P(x+w,y),P(x+w,y+h),P(x,y+h)];
const ring=(P,cx,cy,rx,ry,n=24)=>Array.from({length:n},(_,k)=>P(cx+Math.cos(k/n*TAU)*rx,cy+Math.sin(k/n*TAU)*ry));

setStyle(QUERY.get('style'));

// ---- INK -----------------------------------------------------------------
// ?legacy switches the per-frame shortcuts off (exact blending everywhere, no camera blit) for before/after comparison.
const LEGACY=QUERY.has('legacy');
// `c` is the context being painted. `fast` is on only while the per-frame layer is painted: blending an ink over a canvas is
// what costs time, so there fills that were just knocked out to paper use the ink colour already blended with paper
// (identical result, plain painting) and strokes of one ink are sent as a single path. The cached room is always exact.
// `maskMode` paints plain silhouettes instead of ink; it is how the engine learns what stands in front of a live screen.
let c=ctx,fast=false,maskMode=false;
const rgb=hex=>[1,3,5].map(k=>parseInt(hex.slice(k,k+2),16));
function inkColor(ink,solid){const a=rgb(INK[ink]);if(!solid)return a;const P=rgb(INK.paper);return a.map((v,k)=>Math.round(S.blend==='screen'?255-(255-v)*(255-P[k])/255:v*P[k]/255))}
function pattern(ink,tone,solid=false){let bank=patternCache.get(c);if(!bank){bank=new Map();patternCache.set(c,bank)}const level=Math.max(1,Math.min(20,Math.round(tone*20))),key=ink+level+(solid?'s':'');if(bank.has(key))return bank.get(key);
 const cv=document.createElement('canvas');cv.width=cv.height=124;const g=cv.getContext('2d'),r=rng(129+level*97+ink.charCodeAt(0)),cell=15.5,t=level/20,color=inkColor(ink,solid);
 g.fillStyle=`rgb(${color})`;
 if(S.halftone==='line'){for(let y=0;y<8;y++)g.fillRect(0,y*cell,124,cell*Math.min(1,t*(t<1?.92+r()*.16:1)))}
 else{if(t>.5){g.fillRect(0,0,124,124);g.globalCompositeOperation='destination-out'}
  if(t<1)for(let y=0;y<=8;y++)for(let x=0;x<=8;x++){g.beginPath();const rad=cell*Math.sqrt((t>.5?1-t:t)/Math.PI)*(.86+r()*.24);g.arc((x+(t>.5?0:.5))*cell,(y+(t>.5?0:.5))*cell,rad,0,TAU);g.fill()}}
 g.globalCompositeOperation='destination-out';for(let k=0;k<105*S.wear;k++){g.globalAlpha=.25+r()*.6;g.fillRect(r()*124,r()*124,.7+r()*1.4,.7+r()*1.4)}
 // Blend the halftone toward its average opacity: retain print texture with gentler contrast.
 if(S.soften>0){const pixels=g.getImageData(0,0,124,124),data=pixels.data,s=Math.min(1,S.soften);
  for(let k=0;k<data.length;k+=4){data[k]=color[0];data[k+1]=color[1];data[k+2]=color[2];data[k+3]=Math.round(data[k+3]*(1-s)+t*255*s)}g.putImageData(pixels,0,0)}
 const out=c.createPattern(cv,'repeat');out.setTransform(new DOMMatrix().rotateSelf(ANG[ink]).scaleSelf(S.patScale));bank.set(key,out);return out;
}
function path(q,dx=0,dy=0){c.beginPath();q.forEach((a,k)=>k?c.lineTo(a[0]+dx,a[1]+dy):c.moveTo(a[0]+dx,a[1]+dy));c.closePath()}
function fill(q,ink='paper',tone=1,knock=true){if(!q.length)return;
 if(maskMode){if(knock){path(q);c.fillStyle='#000';c.fill()}return}
 if(knock){path(q);c.fillStyle=INK.paper;c.fill()}if(tone<=0)return;
 const dx=SHIFT[ink][0]*S.shift,dy=SHIFT[ink][1]*S.shift,solid=fast&&knock&&ink!=='paper';path(q,dx,dy);c.fillStyle=pattern(ink,tone,solid);c.globalCompositeOperation=ink==='paper'||solid?'source-over':S.blend;c.fill();c.globalCompositeOperation='source-over'}
// Darken an already painted area. On dark paper inks add light, so shadow is laid down with the paper colour instead.
function shade(q,tone){if(S.blend==='screen')fill(q,'paper',Math.min(1,tone*1.5),false);else fill(q,S.outlineInk,tone,false)}
function line(q,ink='blue',w=1,tone=1,closed=false){lines([q],ink,w,tone,closed)}
// Several polylines of one ink. Painted as one stroke while `fast`, otherwise one by one so overlaps print twice as on paper.
function lines(list,ink='blue',w=1,tone=1,closed=false){if(!list.length)return;if(!fast&&!maskMode&&list.length>1){for(const q of list)lines([q],ink,w,tone,closed);return}
 c.beginPath();const dx=SHIFT[ink][0]*S.shift,dy=SHIFT[ink][1]*S.shift;
 for(const q of list){for(let k=0;k<q.length;k++){const a=q[k];if(!k)c.moveTo(a[0]+dx,a[1]+dy);else{const b=q[k-1],n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/5));
   for(let z=1;z<=n;z++){const f=z/n,off=Math.sin(f*Math.PI)*Math.sin(k*4.1+f*7)*S.wobble;c.lineTo(b[0]+(a[0]-b[0])*f+off+dx,b[1]+(a[1]-b[1])*f+off+dy)}}}if(closed)c.closePath()}
 c.lineWidth=w;c.lineJoin=c.lineCap='round';
 if(maskMode){c.strokeStyle='#000';c.stroke();return}
 c.strokeStyle=pattern(ink,tone);c.globalCompositeOperation=ink==='paper'?'source-over':S.blend;c.stroke();c.globalCompositeOperation='source-over'}
function shape(q,ink,tone=1,w=.9){fill(q,ink,tone);line(q,S.outlineInk,w*S.outlineW,S.outlineTone,true)}
function clip(q,fn){c.save();path(q);c.clip();fn();c.restore()}
function dot(x,y,r,ink='sun',tone=1){fill(ellipse(x,y,r,r,10),ink,tone)}
function glow(x,y,rx,ry,ink='sun',power=.35){for(let k=7;k>0;k--)fill(ellipse(x,y,rx*k/7,ry*k/7),ink,power*(1-k/8),false)}
function box(i,j,w,d,z,h,ink='coral',tone=.6){const top=tile(i,j,w,d,z+h),a=faceI(i,j+d,w,z,h),b=faceJ(i+w,j,d,z,h);
 if(fast){fill(a,ink,tone);shade(a,S.shade[0]);fill(b,ink,tone);shade(b,S.shade[1]);fill(top,ink,tone*.85);lines([a,b,top],S.outlineInk,.9*S.outlineW,S.outlineTone,true);return top}
 shape(a,ink,tone);shade(a,S.shade[0]);shape(b,ink,tone);shade(b,S.shade[1]);shape(top,ink,tone*.85);return top}
function cable(q,ink='blue',w=1.7){line(q,'paper',w+1,.6);line(q,ink,w,.9)}
// Lettering that lies on a wall. `wall` is 'i' (the right-hand wall) or 'j' (the left-hand one); q is where the text starts on screen.
function wallText(wall,q,text,size=5.5,ink='paper',weight=''){if(maskMode)return;const e=wall==='i'?axis(1,0,0):axis(0,-1,0),squeeze=Math.min(1,Math.abs(e[0])/20);c.save();c.translate(q[0],q[1]);c.transform(squeeze,squeeze*e[1]/e[0],0,1,0,0);c.font=`${weight} ${size}px monospace`;c.fillStyle=INK[ink];c.fillText(text,0,0);c.restore()}

// ---- ITEM FRAMES ---------------------------------------------------------
// An item is drawn in its own local space: u across its width, v along its depth (the front is the +v side), z up.
// The frame turns that into room space for any of the four quarter-turn rotations, so an item is written once.
// Seen from the camera only the +i and +j sides of anything are visible; `sees(face)` tells an item which of its sides that is.
const SEEN=[['front','right'],['front','left'],['back','left'],['back','right']];
function frame(it,def,z0=0){const w=def.w,d=def.d,r=it.r||0,I=it.i,J=it.j;
 const map=(u,v)=>r===0?[I+u,J+v]:r===1?[I+v,J+w-u]:r===2?[I+w-u,J+d-v]:[I+d-v,J+u];
 const L={w,d,r,z0,
  p:(u,v,z=0)=>{const m=map(u,v);return p(m[0],m[1],z0+z)},
  box:(u,v,bw,bd,z,h,ink,tone)=>{const a=map(u,v),b=map(u+bw,v+bd);return box(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]),z0+z,h,ink,tone)},
  // Several boxes, painted far to near whatever the rotation: one goes first if it ends before the other begins along i, j or z.
  boxes:list=>{const E=1e-6,items=list.map(b=>{const a=map(b[0],b[1]),q=map(b[0]+b[2],b[1]+b[3]);return{b,i0:Math.min(a[0],q[0]),i1:Math.max(a[0],q[0]),j0:Math.min(a[1],q[1]),j1:Math.max(a[1],q[1]),z0:b[4],z1:b[4]+b[5]}}),
    behind=(x,y)=>x.i1<=y.i0+E||x.j1<=y.j0+E||x.z1<=y.z0+E,depth=x=>x.i0+x.i1+x.j0+x.j1+x.z0*.01;
   while(items.length){let pick=items.filter(x=>!items.some(y=>y!==x&&behind(y,x)&&!behind(x,y)));if(!pick.length)pick=items;const next=pick.reduce((m,x)=>depth(x)<depth(m)?x:m);items.splice(items.indexOf(next),1);L.box(...next.b)}},
  tile:(u,v,bw,bd,z=0)=>[L.p(u,v,z),L.p(u+bw,v,z),L.p(u+bw,v+bd,z),L.p(u,v+bd,z)],
  sees:face=>SEEN[r].includes(face),
  // A vertical panel on one side. Returns P(across,up), with `across` always running left to right as seen from outside.
  // start: where the panel begins along the side · off: where that side sits on the other axis · z: bottom edge.
  panel:(face,start,off,z,pw,ph)=>{const flip=face==='right'||face==='back',alongU=face==='front'||face==='back';
   return(a,b)=>{const s=start+(flip?1-a:a)*pw;return alongU?L.p(s,off,z+b*ph):L.p(off,s,z+b*ph)}}
 };return L}
// The same for something hung on a wall: P(across,up) over the item's rectangle, a hair in front of the wall.
function wallFrame(it,def){const{wall,a,z}=it,w=def.w,h=def.h;return(x,y)=>wall==='i'?p(a+x*w,.05,z+y*h):p(.05,a+(1-x)*w,z+y*h)}

// ---- LIVE SCREENS --------------------------------------------------------
// Anything that draws a display registers it here while the room is built; the content is painted every frame on top of the cached room.
const screens=[];let registering=true,paintIndex=0;
function screenOn(P,mode='code',bezel='blue',tone=.88){
 const outer=quad(P,0,0,1,1);shape(outer,bezel,tone,1.2);
 const inner=quad(P,.065,.13,.835,.8);shape(inner,'blue',.98,.65);fill(inner,'teal',.22,false);
 line([P(.07,.965),P(.94,.965)],'paper',.7,.5);dot(...P(.95,.07),1.25,'sun');
 if(registering&&!maskMode)screens.push({P,inner,outer,mode,order:paintIndex,id:screens.length,mask:null});
}
const SCREEN_MODES=['code','wave','map','bars','orbit','grid'];
function drawDisplay(s,t){const{P,inner,mode,id}=s;const Q=(u,v)=>P(.075+u*.815,.145+v*.77);clip(inner,()=>{
 if(mode==='bars'){const cols=['paper','sun','teal','coral','blue'];for(let k=0;k<5;k++)fill([Q(k/5,.2),Q((k+1)/5,.2),Q((k+1)/5,.94),Q(k/5,.94)],cols[k],.7);for(let k=0;k<12;k++)fill([Q(k/12,.04),Q((k+.8)/12,.04),Q((k+.8)/12,.14),Q(k/12,.14)],'paper',.3+(k%4)*.15);}
 else if(mode==='code'){const rows={teal:[],coral:[],paper:[]};for(let k=0;k<9;k++){const v=.87-k*.088;rows[k%3?'teal':'coral'].push([Q(.08+(k%3)*.035,v),Q(.14+(k%5)*.09,v)]);rows.paper.push([Q(.48,v),Q(.56+(k%4)*.075,v)]);}lines(rows.teal,'teal',1,.95);lines(rows.coral,'coral',1,.95);lines(rows.paper,'paper',.65,.7);if(Math.floor(t*2+id)%2)line([Q(.09,.055),Q(.18,.055)],'sun',1.8);}
 else if(mode==='wave'){for(let row=0;row<3;row++){const a=[];for(let k=0;k<75;k++){const u=k/74;a.push(Q(u,.24+row*.25+Math.sin(u*17+t*1.1+id+row)*.075*Math.sin(u*5+row)))}line(a,['sun','teal','coral'][row],1.2,.9)}lines(Array.from({length:9},(_,k)=>[Q((k+1)/10,0),Q((k+1)/10,1)]),'paper',.45,.15);}
 else if(mode==='orbit'){lines([.15,.27,.4].map(r=>Array.from({length:45},(_,k)=>Q(.5+Math.cos(k/44*TAU)*r,.5+Math.sin(k/44*TAU)*r))),'teal',.8,.75);lines([[Q(0,.5),Q(1,.5)],[Q(.5,0),Q(.5,1)]],'paper',.5,.4);const a=t*.5+id;line([Q(.5,.5),Q(.5+Math.cos(a)*.4,.5+Math.sin(a)*.4)],'sun',1.4);for(let k=0;k<5;k++)dot(...Q(.2+k*.15,.5+Math.sin(k*2)*.27),1.3,'sun');}
 else if(mode==='map'){const nodes=[[.1,.3],[.3,.7],[.56,.5],[.73,.83],[.91,.4],[.6,.17],[.22,.12]];lines(nodes.map((n,k)=>[Q(...n),Q(...nodes[(k+1)%nodes.length])]),'teal',1.1,.8);lines(nodes.filter((n,k)=>k%2===0).map((n,k)=>[Q(...n),Q(...nodes[(k*2+3)%nodes.length])]),'paper',.7,.45);nodes.forEach((n,k)=>{const[x,y]=Q(...n);dot(x,y,2.6,k%2?'sun':'coral');dot(x,y,.9,'paper')});const a=nodes[Math.floor(t*.4)%7],b=nodes[(Math.floor(t*.4)+1)%7],f=(t*.4)%1;dot(...Q(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f),1.9,'paper');}
 else{for(let a=0;a<7;a++)for(let b=0;b<5;b++){const u=.06+a*.13,v=.08+b*.17;fill([Q(u,v),Q(u+.09,v),Q(u+.09,v+.12),Q(u,v+.12)],(a+b)%3?'teal':'sun',.25+.55*(.5+.5*Math.sin(a+b+t*.5)));}}
 // Faint moving scan line.
 const v=1-((t*.08+id*.137)%1);line([Q(0,v),Q(1,v)],'paper',.6,.3);
 });}
