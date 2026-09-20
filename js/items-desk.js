'use strict';
// Workstation catalogue: desks, screens and the things that sit on a desk.
// Same rules as items.js — every item is drawn once in its own local space and works in all four rotations.
{
 // Keycaps for the two keyboards: `rgb` cycles the ink per column instead of the plain blue field.
 const keys=(L,u,v,w,d,z,rgb)=>{for(let a=0;a<10;a++)for(let b=0;b<3;b++)
  fill(L.tile(u+.05+a*w*.088,v+.035+b*d*.25,w*.058,d*.15,z),rgb?['coral','sun','teal','blue'][(a+b)%4]:a===9?'coral':'blue',rgb?.75:.6)};

 Object.assign(ITEMS,{
  deskL:{name:'L masa',kind:'floor',w:3,d:3,h:1,top:1,draw(L){
   L.boxes([[.1,.1,.13,.13,0,.87,'teal',.7],[2.77,.1,.13,.13,0,.87,'teal',.7],[.1,2.77,.13,.13,0,.87,'teal',.7],[1.4,1.4,.13,.13,0,.87,'teal',.7],
    [0,0,3,1.5,.87,.13,'coral',.55],[0,1.5,1.5,1.5,.87,.13,'coral',.55]]);
   lines([...Array.from({length:4},(_,k)=>[L.p(.06,.2+k*.3,1.004),L.p(2.94,.2+k*.3,1.004)]),...Array.from({length:4},(_,k)=>[L.p(.06,1.6+k*.3,1.004),L.p(1.44,1.6+k*.3,1.004)])],'blue',.5,.25)}},

  standingDesk:{name:'Ayakta çalışma masası',kind:'floor',w:2.5,d:1.2,h:1.5,top:1.5,draw(L){
   L.boxes([[.25,.15,.25,.9,0,.12,'blue',.8],[1.75,.15,.25,.9,0,.12,'blue',.8],   // feet
    [.32,.42,.12,.36,.12,1.25,'blue',.85],[1.82,.42,.12,.36,.12,1.25,'blue',.85], // columns
    [0,0,2.5,1.2,1.37,.13,'coral',.55]]);
   lines(Array.from({length:4},(_,k)=>[L.p(.06,.2+k*.25,1.504),L.p(2.44,.2+k*.25,1.504)]),'blue',.5,.25);
   const P=facing(L,1.9,1.205,1.15,.45,.16);if(!P)return;
   shape(quad(P,0,0,1,1),'blue',.9,.7);for(let k=0;k<3;k++)dot(...P(.24+k*.26,.5),1.1,k===1?'sun':'paper')}},

  ultrawide:{name:'Ultra geniş monitör',kind:'floor',canStack:true,modes:true,w:2.5,d:.5,h:1.4,draw(L,it){
   L.boxes([[.9,.08,.7,.34,0,.05,'blue',.75],[1.16,.18,.18,.16,.05,.35,'blue',.8]]);
   // Three panels, the middle one set further back: a curved screen without bending the projection.
   for(const[start,off,w]of[[0,.3,.85],[.85,.22,.8],[1.65,.3,.85]]){
    const P=L.sees('front')?L.panel('front',start,off,.4,w,.95):null;
    if(P)screenOn(P,it.mode||'wave','blue',.88);else shape(quad(L.panel('back',start,off-.06,.4,w,.95),0,0,1,1),'blue',.82,1.1)}}},

  verticalMonitor:{name:'Dikey monitör',kind:'floor',canStack:true,modes:true,w:1,d:.5,h:1.9,draw(L,it){
   L.boxes([[.28,.08,.44,.32,0,.05,'blue',.75],[.42,.16,.16,.16,.05,.5,'blue',.8]]);
   const P=L.sees('front')?L.panel('front',.05,.3,.55,.9,1.3):null;
   if(P)screenOn(P,it.mode||'code','blue',.88);else{shape(quad(L.panel('back',.05,.24,.55,.9,1.3),0,0,1,1),'blue',.82,1.1);shape(quad(L.panel('back',.32,.24,.95,.35,.35),0,0,1,1),'blue',.6,.6)}}},

  monitorWall:{name:'Monitör duvarı',kind:'floor',modes:true,w:3,d:.75,h:2.5,draw(L,it){
   L.boxes([[.4,.1,2.2,.55,0,.1,'blue',.8],[1.35,.25,.3,.28,.1,.6,'blue',.85],[.1,.28,2.8,.16,.7,.1,'blue',.8]]);
   for(let row=0;row<2;row++)for(let k=0;k<3;k++){const start=.08+k*.98,z=.78+row*.85;
    const P=L.sees('front')?L.panel('front',start,.44,z,.9,.8):null;
    if(P)screenOn(P,it.mode||['code','wave','map','bars','orbit','grid'][row*3+k],'blue',.9);
    else shape(quad(L.panel('back',start,.38,z,.9,.8),0,0,1,1),'blue',.8,1)}}},

  laptop:{name:'Dizüstü bilgisayar',kind:'floor',canStack:true,modes:true,w:1,d:1,h:.65,draw(L,it){
   L.box(.05,.3,.9,.62,0,.05,'paper',.9);keys(L,.05,.34,.9,.5,.055,false);
   line([L.p(.3,.83,.055),L.p(.7,.83,.055)],'blue',1.4,.6);
   const P=L.sees('front')?L.panel('front',.05,.28,.05,.9,.58):null;
   if(P)screenOn(P,it.mode||'code','paper',.95);else{shape(quad(L.panel('back',.05,.26,.05,.9,.58),0,0,1,1),'paper',.9,1.1);shape(ring(L.panel('back',.05,.26,.05,.9,.58),.5,.5,.12,.12),'coral',.8,.5)}}},

  mechKeyboard:{name:'Mekanik klavye',kind:'floor',canStack:true,w:1,d:.5,h:.09,draw(L){
   L.box(.02,.05,.96,.4,0,.06,'blue',.88);keys(L,.02,.05,.96,.4,.065,true);
   const[x,y]=L.p(.5,.47,.03);glow(x,y,16,5,'coral',.22)}},

  drawingTablet:{name:'Çizim tableti',kind:'floor',canStack:true,w:1,d:.5,h:.06,draw(L){
   L.box(.03,.06,.94,.38,0,.035,'blue',.85);fill(L.tile(.1,.1,.66,.3,.038),'teal',.35,false);
   for(let k=0;k<4;k++)dot(...L.p(.86,.14+k*.08,.038),1.1,k?'paper':'coral');
   line([L.p(.24,.3,.05),L.p(.6,.18,.05)],'coral',2.2);dot(...L.p(.62,.17,.05),1.3,'blue')}},

  micArm:{name:'Mikrofon kolu',kind:'floor',canStack:true,w:.5,d:.5,h:1.5,draw(L){
   L.box(.17,.17,.18,.18,0,.12,'blue',.85);
   const a=L.p(.26,.26,.12),b=L.p(.26,.26,.95),c=L.p(.26,.05,1.2);
   line([a,b],'blue',2.6);line([b,c],'blue',2.2);dot(...b,2.2,'blue');
   const[x,y]=c;shape(ellipse(x,y-7,4.5,7.5),'blue',.9);lines([0,1,2].map(k=>[[x-3.6,y-11+k*3.4],[x+3.6,y-11+k*3.4]]),'paper',.7,.6);
   shape([[x-6,y+1],[x+6,y+1],[x+5,y+5],[x-5,y+5]],'coral',.8,.6)}},

  webcam:{name:'Webcam',kind:'floor',canStack:true,w:.5,d:.5,h:.3,draw(L){
   L.box(.13,.18,.24,.14,.12,.16,'blue',.88);L.box(.17,.2,.16,.1,0,.12,'blue',.7);
   const P=facing(L,.13,.32,.12,.24,.16);if(!P)return;
   shape(ring(P,.5,.5,.26,.3),'blue',1,.6);shape(ring(P,.5,.5,.13,.15),'teal',.8,.5);dot(...P(.5,.5),1,'paper');dot(...P(.86,.82),.9,'coral')}},

  ringLight:{name:'Halka ışık',kind:'floor',w:1,d:1,h:2,draw(L){
   shape(disc(L,.5,.5,.3,0,20,.5),'blue',.85);
   const a=L.p(.5,.5,.05),b=L.p(.5,.5,1.3),[x,y]=L.p(.5,.5,1.65);
   line([a,b],'blue',2.4);glow(x,y,30,30,'sun',.24);
   line(ellipse(x,y,17,17,28),'sun',3.4,.95,true);line(ellipse(x,y,17,17,28),'paper',1.2,.7,true);
   line([b,[x,y+17]],'blue',2)}},

  gamingChair:{name:'Oyuncu koltuğu',kind:'floor',w:1,d:1,h:2.2,draw(L){const[x,y]=L.p(.5,.45);
   for(let k=0;k<5;k++){const a=k/5*TAU;line([[x,y-8],[x+Math.cos(a)*24,y+Math.sin(a)*10]],'blue',2.6);dot(x+Math.cos(a)*24,y+Math.sin(a)*10,2.8,'coral')}
   line([[x,y-8],[x,y-28]],'blue',4.2);
   L.boxes([[.02,0,.96,.88,.7,.17,'blue',.85],[.02,.74,.96,.16,.87,1.15,'blue',.85],[.05,.72,.9,.14,2.02,.18,'coral',.7]]);
   const side=L.sees('front')?'front':'back',P=L.panel(side,.02,side==='front'?.9:.74,.87,.96,1.15);
   fill(quad(P,.22,.04,.56,.92),'coral',.6);lines([1,2,3,4].map(k=>[P(.22+k*.112,.08),P(.22+k*.112,.88)]),'blue',.7,.5);
   for(const u of[-.05,1.05]){line([L.p(u,.3,.8),L.p(u,.3,1.2)],'blue',2);line([L.p(u,.04,1.2),L.p(u,.7,1.2)],'coral',3.4)}}},

  cableTray:{name:'Kablo kanalı',kind:'floor',canStack:true,w:1.5,d:.5,h:.2,draw(L){
   L.box(.05,.1,1.4,.32,0,.14,'blue',.8);
   for(let k=0;k<4;k++)cable([L.p(.15+k*.35,.12,.15),L.p(.3+k*.3,.26,.17),L.p(.5+k*.28,.4,.15)],['coral','sun','teal','paper'][k],1.1)}}
 });
}
Object.assign(CATEGORY_OF,{deskL:'workstation',standingDesk:'workstation',ultrawide:'workstation',verticalMonitor:'workstation',monitorWall:'workstation',
 laptop:'workstation',mechKeyboard:'workstation',drawingTablet:'workstation',micArm:'workstation',webcam:'workstation',ringLight:'workstation',gamingChair:'workstation',cableTray:'workstation'});
