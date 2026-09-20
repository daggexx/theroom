'use strict';
// Item catalogue. Every entry is drawn once, in its own local space (see frame() in engine.js), and works in all four rotations.
//   kind   'floor' stands on the floor grid · 'rug' lies under furniture · 'wall' hangs on a wall
//   w,d,h  footprint and overall height in tiles (multiples of .5 so things snap). For wall items: width and height on the wall.
//   top    height of a flat surface other things may be put on · canStack: may be put on such a surface
//   modes  true if it has a display whose programme can be changed (item.mode)
//   draw(L,item) static picture · live(L,item,t) optional, painted every frame
const ITEMS={};
const plantAt=(x,y,s)=>{shape([[x-7*s,y-12*s],[x+7*s,y-12*s],[x+5*s,y],[x-5*s,y]],'coral',.75);for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.33,len=(17+(k%3)*5)*s,tx=x+Math.cos(a)*len,ty=y-11*s+Math.sin(a)*len;shape([[x,y-11*s],[tx-5*s,ty+7*s],[tx,ty],[tx+4*s,ty+8*s]],'teal',.65+(k%2)*.15,.7)}};
const deskOf=(w,d,h,topInk='coral',legInk='teal')=>({kind:'floor',w,d,h,top:h,draw(L){
  L.boxes([.1,w-.23].flatMap(a=>[.1,d-.23].map(b=>[a,b,.13,.13,0,h-.13,legInk,.7])));L.box(0,0,w,d,h-.13,.13,topInk,.55);
  for(let k=0;k<5;k++)line([L.p(.06,.13+k*d/5,h+.004),L.p(w-.06,.15+k*d/5,h+.004)],'blue',.5,.25)}});
 // A free-standing display panel on the front side; from behind only its back is seen.
const display=(L,it,start,off,z,pw,ph,bezel,tone,fallback)=>{const P=L.panel(L.sees('front')?'front':'back',start,off,z,pw,ph);
  if(L.sees('front'))screenOn(P,it.mode||fallback,bezel,tone);else{shape(quad(P,0,0,1,1),bezel==='paper'?'paper':'blue',.8,1.2);shape(quad(P,.3,.25,.4,.4),'blue',.55,.6)}};

 Object.assign(ITEMS,{
  deskLarge:{name:'Büyük masa',...deskOf(5.5,1.5,1)},
  deskMedium:{name:'Masa',...deskOf(3,1.5,1)},
  deskLow:{name:'Alçak masa',...deskOf(2.5,1.5,.8)},
  monitor:{name:'Monitör',kind:'floor',canStack:true,modes:true,w:1.5,d:.5,h:1.35,draw(L,it){
   L.box(.58,.06,.34,.35,0,.045,'blue',.7);line([L.p(.75,.2,0),L.p(.75,.2,.32)],'blue',3);display(L,it,0,.19,.3,1.5,1,'blue',.88,'code')}},
  terminal:{name:'Eski terminal',kind:'floor',canStack:true,modes:true,w:1.5,d:1,h:.75,draw(L,it){
   L.box(.13,.12,1.24,.72,0,.73,'paper',.9);if(L.sees('front'))screenOn(L.panel('front',.19,.845,.08,1.12,.59),it.mode||'code','paper',1)}},
  keyboard:{name:'Klavye',kind:'floor',canStack:true,w:1,d:.5,h:.06,draw(L){
   shape(L.tile(.02,.05,.96,.4,.02),'paper',1,.7);for(let a=0;a<10;a++)for(let b=0;b<3;b++)fill(L.tile(.07+a*.088,.085+b*.1,.058,.06,.025),a===9?'coral':'blue',.6);
   line([L.p(.26,.39,.03),L.p(.72,.39,.03)],'blue',1.8,.65)}},
  mousepad:{name:'Mouse altlığı',kind:'floor',canStack:true,w:.5,d:.5,h:.05,draw(L){
   shape(L.tile(0,.05,.5,.4,.012),'blue',.75);const[x,y]=L.p(.25,.25,.03);shape(ellipse(x,y,3,4),'paper',1,.6)}},
  mug:{name:'Kupa',kind:'floor',canStack:true,w:.5,d:.5,h:.3,draw(L){const[x,y]=L.p(.25,.25);
   shape(rect(x-4,y-9,8,9),'paper',1);fill(rect(x-3,y-7,6,5),'coral',.55,false);line(ellipse(x+5,y-5,3,3,14),'blue',.8,1,true);shape(ellipse(x,y-9,4,1.7),'blue',.8,.6)}},
  books:{name:'Kitap yığını',kind:'floor',canStack:true,w:.5,d:.5,h:.22,draw(L){for(let k=0;k<3;k++)L.box(.03+k*.01,.05,.44,.4,k*.07,.065,['coral','blue','sun'][k],.6)}},
  headphones:{name:'Kulaklık',kind:'floor',canStack:true,w:.5,d:.5,h:.4,draw(L){const[x,y]=L.p(.25,.25);
   line(ellipse(x,y-3,8,9,24).slice(11),'blue',2.4);shape(rect(x-9,y-5,4,9),'coral',.8);shape(rect(x+5,y-5,4,9),'coral',.8)}},
  speaker:{name:'Hoparlör',kind:'floor',canStack:true,w:.5,d:.5,h:.8,draw(L){L.box(.05,.06,.4,.38,0,.8,'blue',.8);
   if(L.sees('front')){const P=L.panel('front',.05,.445,0,.4,.8);for(const[y,r]of[[.3,.31],[.75,.17]]){shape(ring(P,.5,y,r,r*.56),'blue',1,.6);line(ring(P,.5,y,r*.6,r*.34),'paper',.6,.7,true);dot(...P(.5,y),1.1,'coral',.8)}}}},
  plantSmall:{name:'Küçük bitki',kind:'floor',canStack:true,w:.5,d:.5,h:.7,draw(L){const[x,y]=L.p(.25,.25);plantAt(x,y,.62)}},
  plantLarge:{name:'Büyük bitki',kind:'floor',w:1,d:1,h:1.6,draw(L){const[x,y]=L.p(.5,.5);plantAt(x,y,1.35)}},
  papers:{name:'Notlar',kind:'floor',canStack:true,w:.5,d:.5,h:.03,draw(L){shape(L.tile(.02,.02,.46,.42,.015),'paper',1);for(let k=0;k<4;k++)line([L.p(.08,.1+k*.08,.02),L.p(.42,.1+k*.08,.02)],'blue',.7,.45)}},
  floppy:{name:'Disket',kind:'floor',canStack:true,w:.5,d:.5,h:.03,draw(L){shape(L.tile(.05,.04,.4,.42,.02),'blue',.8);fill(L.tile(.13,.04,.25,.13,.025),'paper',1);fill(L.tile(.12,.27,.26,.15,.025),'coral',.7)}},
  chair:{name:'Döner koltuk',kind:'floor',w:1,d:1,h:1.9,draw(L){const[x,y]=L.p(.5,.45);
   for(let k=0;k<5;k++){const a=k/5*TAU;line([[x,y-8],[x+Math.cos(a)*23,y+Math.sin(a)*9]],'blue',2.5);dot(x+Math.cos(a)*23,y+Math.sin(a)*9,2.5,'blue')}
   line([[x,y-8],[x,y-27]],'blue',4);L.boxes([[.03,0,.94,.85,.66,.15,'coral',.65],[.03,.73,.94,.14,.82,1.05,'teal',.7]]);
   const side=L.sees('front')?'front':'back',P=L.panel(side,.03,side==='front'?.875:.725,.82,.94,1.05);lines([1,2,3].map(k=>[P(k*.25,.12),P(k*.25,.88)]),'blue',.8,.6);
   for(const u of[-.04,1.04]){line([L.p(u,.33,.76),L.p(u,.33,1.15)],'blue',1.9);line([L.p(u,.07,1.15),L.p(u,.69,1.15)],'blue',3)}}},
  rack:{name:'Sunucu rafı',kind:'floor',w:2.5,d:1,h:2.85,top:2.85,draw(L){L.box(.08,.1,2.34,.82,0,2.85,'blue',.86);
   if(L.sees('front')){const P=L.panel('front',.18,.925,.14,2.14,2.57);shape(quad(P,0,0,1,1),'blue',1);
    for(let r=0;r<8;r++){const y=.035+r*.113;shape(quad(P,.04,y,.92,.085),'teal',.45,.65);lines(Array.from({length:7},(_,n)=>[P(.1+n*.085,y+.02),P(.1+n*.085,y+.065)]),'blue',.9);for(let n=0;n<3;n++)dot(...P(.78+n*.06,y+.045),1,n?'sun':'coral')}
    for(let k=0;k<5;k++)cable([P(.08+k*.11,.95),P(.08+k*.11,.74),P(.37+k*.06,.66),P(.39+k*.06,.45)],k%2?'sun':'coral',1.2)}
   L.box(.95,.2,.6,.6,2.85,.14,'paper',.8)}},
  tower:{name:'Kasa',kind:'floor',w:1,d:1,h:1.3,top:1.3,draw(L){L.box(.14,0,.72,.97,0,1.3,'paper',.85);
   if(L.sees('front')){const P=L.panel('front',.19,.975,.1,.62,1.05);shape(quad(P,0,0,1,1),'blue',.94);for(const y of[.31,.72]){shape(ring(P,.5,y,.35,.21),'teal',.7);line(ring(P,.5,y,.22,.13),'sun',1,.8,true);dot(...P(.5,y),1.4,'paper')}dot(...P(.5,1.04),1.6,'coral')}}},
  crtBig:{name:'Büyük TV',kind:'floor',modes:true,w:2,d:1.5,h:1.43,top:1.43,draw(L,it){L.box(0,0,2,1.5,0,.35,'coral',.66);L.box(.05,.1,1.9,1.3,.35,1.08,'sun',.65);
   if(L.sees('front'))screenOn(L.panel('front',.13,1.405,.48,1.74,.83),it.mode||'bars','paper',.85)}},
  crtSmall:{name:'Küçük TV',kind:'floor',canStack:true,modes:true,w:1.5,d:1,h:1.5,draw(L,it){L.box(.03,.02,1.43,.95,0,.9,'coral',.7);
   if(L.sees('front'))screenOn(L.panel('front',.12,.975,.07,1.25,.71),it.mode||'orbit');
   const a=L.p(.75,.45,.9);line([a,L.p(.1,.45,1.5)],'blue',1.2);line([a,L.p(1.4,.45,1.5)],'blue',1.2);dot(...a,2,'blue')}},
  printer:{name:'Yazıcı',kind:'floor',w:1,d:1,h:.62,top:.62,draw(L){L.box(0,.1,1,.8,0,.4,'coral',.6);L.box(.05,.16,.9,.68,.4,.22,'paper',.8);
   lines(Array.from({length:7},(_,k)=>[L.p(.15,.3+k*.05,.63),L.p(.85,.3+k*.05,.63)]),'blue',.8,.8)}},
  crate:{name:'Sandık',kind:'floor',w:1,d:1,h:.8,top:.8,draw(L){L.box(.05,.05,.9,.9,0,.8,'sun',.6);
   for(const face of['front','right','back','left'])if(L.sees(face)){const P=L.panel(face,.05,face==='front'||face==='right'?.95:.05,0,.9,.8);lines([[P(0,.33),P(1,.33)],[P(0,.66),P(1,.66)]],'blue',.7,.5)}}},
  spark:{name:'Sinyal ışığı',kind:'floor',canStack:true,w:.5,d:.5,h:1.6,draw(L){L.box(.17,.17,.16,.16,0,.05,'blue',.8)},
   live(L,it,t){const[x,y]=L.p(.25,.25,1.35+Math.sin(t*1.5)*.05);glow(x,y,24,24,'sun',.2);const star=[];for(let k=0;k<24;k++){const a=k/24*TAU+t*.2,r=k%2?3.2:8+(k%3);star.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}fill(star,'coral',1);dot(x,y,2,'sun')}},
  rugLarge:{name:'Büyük halı',kind:'rug',w:7,d:4,h:.03,draw(L){shape(L.tile(0,0,7,4,.015),'teal',.42);line(L.tile(.2,.2,6.6,3.6,.02),'sun',1.2,.8,true);
   lines(Array.from({length:20},(_,k)=>[L.p(.15+k*.352,4.02,.02),L.p(.15+k*.352,4.22,.02)]),'coral',.9,.65)}},
  rugSmall:{name:'Küçük halı',kind:'rug',w:3,d:2,h:.03,draw(L){shape(L.tile(0,0,3,2,.015),'coral',.4);line(L.tile(.2,.2,2.6,1.6,.02),'paper',1.2,.8,true)}},

  wallScreenS:{name:'Duvar ekranı',kind:'wall',modes:true,w:2,h:1,draw(P,it){screenOn((x,y)=>P(.015+x*.97,.06+y*.88),it.mode||'wave')}},
  wallScreenM:{name:'Geniş duvar ekranı',kind:'wall',modes:true,w:2.5,h:1,draw(P,it){screenOn((x,y)=>P(.03+x*.94,.08+y*.84),it.mode||'bars','paper',.8)}},
  wallScreenL:{name:'Dev duvar ekranı',kind:'wall',modes:true,w:4.5,h:1.5,draw(P,it){screenOn(P,it.mode||'map')}},
  clock:{name:'Duvar saati',kind:'wall',w:1,h:1,draw(P){shape(ring(P,.5,.5,.33,.4,32),'paper',1);for(let k=0;k<12;k++){const a=k/12*TAU;dot(...P(.5+Math.sin(a)*.24,.5+Math.cos(a)*.3),.75,'blue')}line([P(.5,.72),P(.5,.5),P(.64,.4)],'blue',1.3)}},
  patchboard:{name:'Bağlantı paneli',kind:'wall',w:5,h:.5,draw(P){shape(quad(P,.02,0,.96,1),'teal',.6);
   for(let a=0;a<14;a++){const x=.06+a*.067,top=P(x,.62),low=P(x,.22);dot(...top,1.6,a%4===0?'sun':'paper',.9);dot(...low,1.5,'blue');if(a%3===0)cable([top,[top[0]+2,top[1]+7],[low[0]+8,low[1]+8],low],'coral',1.15)}}},
  poster:{name:'Afiş',kind:'wall',w:1.5,h:2,draw(P){shape(quad(P,.06,.04,.88,.92),'paper',1);fill(quad(P,.12,.1,.76,.8),'sun',.35,false);shape(ring(P,.5,.62,.2,.15),'coral',.8,.6);
   shape([P(.12,.1),P(.4,.42),P(.58,.26),P(.88,.5),P(.88,.1)],'teal',.7,.6)}},
  label:{name:'Duvar yazısı',kind:'wall',w:3,h:.5,draw(P,it){wallText(it.wall,P(.02,.3),it.text||'NIGHT SHIFT',5.6,lightWalls()?'blue':'paper')}}
 });
