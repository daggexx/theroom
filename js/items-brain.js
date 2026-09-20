'use strict';
// The agent lab: tanks that hold a brain in fluid, the pumps and pipes that feed them, and the masts that carry
// the signal. These are the heart of the theme — an agent's room is where its mind is kept running.
{
 // A round body standing on the floor: the hull of the rings at its two ends is exactly its silhouette.
 const tube=(L,cx,cy,r,z0,z1,n=22,squash=1)=>hull([...disc(L,cx,cy,r,z0,n,squash),...disc(L,cx,cy,r,z1,n,squash)]);
 // A stylised brain: one mass split down the middle, with folds curling out to each side. `beat` swells it a little.
 const brain=(x,y,s,beat=1)=>{const S=s*beat;
  shape(ellipse(x,y-S*.06,S,S*.78,22),'coral',.62);            // the two hemispheres together
  shape(ellipse(x,y+S*.72,S*.2,S*.26,12),'coral',.72,.7);      // the stem below
  line([[x,y-S*.8],[x,y+S*.6]],'blue',1.1,.45);                // the split down the middle
  for(const side of[-1,1])for(let k=0;k<3;k++){const yy=y-S*.46+k*S*.4;
   line([[x+side*S*.1,yy],[x+side*S*.46,yy-S*.15],[x+side*S*.88,yy+S*.07]],'blue',.95,.5)}};
 const bubbles=(x,y,h,t,seed)=>{const r=rng(seed);
  for(let k=0;k<5;k++){const speed=.35+r()*.5,off=r(),rise=((t*speed+off)%1),size=.9+r()*1.3;
   line(ellipse(x+(r()-.5)*14+Math.sin(rise*7+k)*2,y-rise*h,size,size,7),'paper',.8,.85-rise*.5,true)}};

 Object.assign(ITEMS,{
  brainTank:{name:'Beyin tankı',kind:'floor',w:1.5,d:1.5,h:3,draw(L){
   L.box(.1,.1,1.3,1.3,0,.34,'blue',.9);                          // plinth
   shape(disc(L,.75,.75,.56,.34,22),'blue',.75);                  // tank floor
   const glass=tube(L,.75,.75,.56,.36,2.5);
   fill(glass,'teal',.16,false);line(glass,'paper',1.3,.55,true);  // the glass itself
   const fluid=tube(L,.75,.75,.56,.36,2.1);fill(fluid,'teal',.3,false);
   line(disc(L,.75,.75,.56,2.1,22),'teal',1.2,.8,true);            // fluid line
   shape(disc(L,.75,.75,.6,2.5,22),'blue',.85);                    // lid
   L.boxes([[.6,.6,.3,.3,2.5,.22,'blue',.9]]);
   for(const[u,v]of[[.3,.75],[1.2,.75]])line([L.p(u,v,2.62),L.p(u,v,2.96)],'blue',2.6);
   for(let k=0;k<3;k++)dot(...L.p(.52+k*.23,.16,.5),1.2,k===1?'sun':'teal')},
   live(L,it,t){const[x,y]=L.p(.75,.75,1.35);
    fill(ellipse(x,y,25,29,14),'teal',.1,false);   // a cheap halo: one ellipse, not glow's seven
    brain(x,y,13,1+Math.sin(t*1.6)*.045);
    bubbles(x,y+16,52,t,7);
    dot(...L.p(.75,.16,.5),1.2,Math.floor(t*2)%2?'sun':'coral')}},

  brainPod:{name:'Beyin kapsülü',kind:'floor',canStack:true,w:1,d:1,h:1.3,draw(L){
   L.box(.14,.14,.72,.72,0,.18,'blue',.9);
   const glass=tube(L,.5,.5,.34,.2,1.05);fill(glass,'teal',.15,false);line(glass,'paper',1,.5,true);
   shape(disc(L,.5,.5,.36,1.05,18),'blue',.85);
   line([L.p(.5,.5,1.08),L.p(.5,.5,1.28)],'blue',2.2)},
   live(L,it,t){const[x,y]=L.p(.5,.5,.6);brain(x,y,6,1+Math.sin(t*2.2)*.06);bubbles(x,y+7,22,t,11)}},

  pumpUnit:{name:'Pompa ünitesi',kind:'floor',w:1.5,d:1,h:1.2,top:1.2,draw(L){
   L.boxes([[.05,.05,1.4,.9,0,.24,'blue',.9],[.15,.15,.7,.7,.24,.7,'teal',.55],[.95,.2,.42,.6,.24,.5,'blue',.8]]);
   const[cx,cy]=L.p(.5,.5,.96);
   shape(ellipse(cx,cy,15,9),'paper',.95);line(ellipse(cx,cy,10,6,16),'blue',.8,.5,true);
   for(let k=0;k<8;k++){const a=k/8*TAU;line([[cx+Math.cos(a)*4,cy+Math.sin(a)*2.4],[cx+Math.cos(a)*9,cy+Math.sin(a)*5.4]],'blue',1.1,.7)}
   const P=facing(L,.95,.82,.24,.42,.5);if(P){shape(ring(P,.5,.55,.3,.3),'paper',.95,.6);line([P(.5,.55),P(.66,.75)],'coral',1.4);dot(...P(.5,.55),1.2,'blue')}
   line([L.p(1.16,.2,.74),L.p(1.16,-.1,.74)],'blue',3)},
   live(L,it,t){const[cx,cy]=L.p(.5,.5,.98),a=t*2.4;
    for(let k=0;k<3;k++){const b=a+k/3*TAU;line([[cx,cy],[cx+Math.cos(b)*8,cy+Math.sin(b)*4.8]],'coral',1.8,.9)}
    dot(...L.p(1.16,.5,.76),1.3,Math.floor(t*3)%2?'sun':'teal')}},

  // A length of floor pipe. Signal and coolant both travel along these; the pulse shows which way they run.
  pipeRun:{name:'Boru hattı',kind:'floor',w:2,d:.5,h:.26,draw(L){
   for(const v of[.16,.34]){const a=L.p(0,v,.1),b=L.p(2,v,.1);
    line([a,b],'blue',5.4,.9);line([a,b],'paper',1.8,.45)}
   for(const u of[.12,.7,1.3,1.88])L.box(u,.1,.1,.3,0,.12,'blue',.85)},
   live(L,it,t){for(const[v,speed,ink]of[[.16,.5,'sun'],[.34,.36,'teal']]){
    const f=(t*speed+(v>.25?.4:0))%1,[x,y]=L.p(f*2,v,.13);
    fill(ellipse(x,y,6.5,3.6,10),ink,.22,false);dot(x,y,1.7,ink)}}},

  valveStack:{name:'Vana kolonu',kind:'floor',w:1,d:.5,h:1.6,draw(L){
   L.box(.34,.14,.32,.26,0,1.5,'blue',.88);
   for(let k=0;k<3;k++){const z=.32+k*.42,[x,y]=L.p(.66,.27,z);
    line([L.p(.34,.27,z),L.p(.86,.27,z)],'blue',3.4);
    shape(ellipse(x+6,y,4.6,4.6,12),'coral',.8,.6);line([[x+2,y],[x+10,y]],'blue',1)}
   shape(disc(L,.5,.27,.2,1.5,14),'blue',.8)}},

  signalMast:{name:'Sinyal direği',kind:'floor',w:1,d:1,h:3.2,draw(L){
   shape(disc(L,.5,.5,.4,0,16,.6),'blue',.85);
   for(const[du,dv]of[[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]])line([L.p(.5+du,.5+dv,.05),L.p(.5,.5,2.6)],'blue',1.8);
   for(let k=0;k<5;k++){const z=.3+k*.46,r=.3-k*.045;line(disc(L,.5,.5,r,z,14,.6),'blue',1,.6,true)}
   line([L.p(.5,.5,2.6),L.p(.5,.5,3.05)],'blue',2.6)},
   live(L,it,t){const[x,y]=L.p(.5,.5,3.05),beat=(t*.8)%1;
    glow(x,y,16+beat*10,16+beat*10,'sun',.26*(1-beat));dot(x,y,2.4,'sun');
    for(let k=0;k<3;k++){const f=((t*.6+k/3)%1),[px,py]=L.p(.5,.5,.4+f*2.2);dot(px,py,1.4,'teal')}}},

  // Two posts and a beam: the lights hang over the tanks without needing a ceiling.
  gantry:{name:'Işık köprüsü',kind:'floor',w:4,d:1,h:3.2,draw(L){
   L.boxes([[.05,.3,.36,.36,0,2.9,'blue',.88],[3.59,.3,.36,.36,0,2.9,'blue',.88],
    [.05,.3,.36,.36,0,.14,'blue',.9],[3.59,.3,.36,.36,0,.14,'blue',.9]]);
   L.box(0,.38,4,.2,2.9,.22,'coral',.6);
   for(let k=0;k<3;k++){const u=.7+k*1.3;line([L.p(u,.48,2.9),L.p(u,.48,2.62)],'blue',2);
    const[x,y]=L.p(u,.48,2.6);shape([[x-13,y],[x+13,y],[x+8,y+9],[x-8,y+9]],'sun',.7);
    glow(x,y+22,26,16,'sun',.17)}}},

  coolantTank:{name:'Soğutucu tankı',kind:'floor',w:1,d:1,h:2.2,draw(L){
   const body=tube(L,.5,.5,.4,.12,2);fill(body,'paper',.95);line(body,'blue',1,.9,true);
   shape(disc(L,.5,.5,.4,2,18),'paper',.9);shape(disc(L,.5,.5,.44,2,18),'blue',.7,1.1);
   for(let k=0;k<2;k++)line(disc(L,.5,.5,.4,.7+k*.6,18),'blue',.9,.5,true);
   const P=facing(L,.22,.9,.9,.56,.5);if(P){shape(quad(P,0,0,1,1),'teal',.5,.6);
    for(let k=0;k<4;k++)line([P(.1+k*.22,.2),P(.1+k*.22,.8)],'blue',.8,.7)}
   line([L.p(.5,.1,1.8),L.p(.5,-.2,1.8)],'blue',3)}},

  specimenShelf:{name:'Numune rafı',kind:'floor',w:2,d:.5,h:1.6,top:1.6,draw(L){
   L.boxes([[.03,.06,.1,.38,0,1.6,'blue',.85],[1.87,.06,.1,.38,0,1.6,'blue',.85],
    ...[0,1,2].map(k=>[.03,.06,1.94,.38,.42+k*.52,.06,'blue',.7])]);
   for(let r=0;r<3;r++)for(let k=0;k<5;k++){const z=.48+r*.52,cx=.22+k*.38;
    const jar=tube(L,cx,.25,.12,z,z+.3,12);fill(jar,'teal',.22,false);line(jar,'paper',.7,.5,true);
    shape(disc(L,cx,.25,.13,z+.3,12),'coral',.7);
    if((k+r)%2===0){const[x,y]=L.p(cx,.25,z+.14);shape(ellipse(x,y,3,2.2,10),'coral',.55,.5)}}}}
 });
}
Object.assign(CATEGORY_OF,{brainTank:'agent',brainPod:'agent',pumpUnit:'agent',pipeRun:'agent',valveStack:'agent',
 signalMast:'agent',gantry:'agent',coolantTank:'agent',specimenShelf:'agent'});
CATEGORIES.splice(2,0,['agent','Ajan laboratuvarı']);
