'use strict';
// Workshop and laboratory, plus the rare showpieces.
{
 const spool=(L,cx,cy,z,r,ink)=>{shape(disc(L,cx,cy,r,z,16),ink,.75);line(disc(L,cx,cy,r*.4,z+.002,12),'paper',1,.8,true)};
 // Four legs and a frame: the shared skeleton of the benches and carts.
 const legs=(L,w,d,h,ink='blue')=>L.boxes([.08,w-.2].flatMap(a=>[.08,d-.2].map(b=>[a,b,.12,.12,0,h,ink,.8])));

 Object.assign(ITEMS,{
  printer3d:{name:'3D yazıcı',kind:'floor',w:1,d:1,h:1.4,draw(L){
   L.boxes([[.04,.04,.92,.92,0,.18,'blue',.9],   // base
    ...[0,.88].flatMap(u=>[0,.88].map(v=>[.04+u,.04+v,.08,.08,.18,1.05,'blue',.85])),
    [.04,.04,.92,.08,1.18,.08,'coral',.7],[.04,.88,.92,.08,1.18,.08,'coral',.7],
    [.14,.2,.72,.6,.18,.04,'paper',.95],       // bed
    [.3,.34,.36,.3,.22,.28,'teal',.6]]);        // the print itself
   const gx=L.p(.5,.5,.86),g2=L.p(.5,.5,.72);line([L.p(.08,.5,.86),L.p(.92,.5,.86)],'blue',2.2);
   L.box(.38,.42,.24,.18,.62,.18,'blue',.88);dot(...L.p(.5,.42,.62),1.4,'coral');
   spool(L,.2,.5,1.28,.16,'sun');line([L.p(.2,.5,1.26),L.p(.5,.5,.8)],'teal',1.1,.9);
   const P=facing(L,.14,.96,.02,.5,.14);if(P){shape(quad(P,0,0,1,1),'teal',.5,.5);for(let k=0;k<3;k++)dot(...P(.2+k*.3,.5),.9,k?'paper':'sun')}}},

  resinPrinter:{name:'Reçine yazıcı',kind:'floor',canStack:true,top:.8,w:.5,d:.5,h:.8,draw(L){
   L.box(.05,.06,.4,.38,0,.22,'blue',.9);
   L.box(.08,.09,.34,.32,.22,.5,'sun',.4);
   line([L.p(.25,.25,.3),L.p(.25,.25,.66)],'blue',1.6);L.box(.14,.15,.22,.2,.28,.05,'paper',.9);
   const P=facing(L,.05,.44,0,.4,.22);if(P){shape(quad(P,.1,.25,.5,.5),'teal',.55,.5);dot(...P(.82,.5),1,'coral')}}},

  filamentRack:{name:'Filament rafı',kind:'floor',w:1.5,d:.5,h:1.5,top:1.5,draw(L){
   L.boxes([[.03,.06,.1,.38,0,1.5,'blue',.85],[1.37,.06,.1,.38,0,1.5,'blue',.85],
    ...[0,1,2].map(k=>[.03,.06,1.44,.38,.4+k*.5,.06,'blue',.7])]);
   const inks=['coral','sun','teal','paper','coral','sun'];
   for(let r=0;r<3;r++)for(let k=0;k<2;k++)spool(L,.42+k*.62,.25,.46+r*.5,.2,inks[r*2+k])}},

  workbench:{name:'Elektronik tezgâhı',kind:'floor',w:2.5,d:1,h:1,top:1,draw(L){
   legs(L,2.5,1,.87);L.box(0,0,2.5,1,.87,.13,'sun',.5);
   L.box(1.5,.12,.9,.76,.1,.72,'blue',.8);
   const P=facing(L,1.5,.88,.1,.9,.72);if(P)for(let r=0;r<3;r++){shape(quad(P,.08,.1+r*.3,.84,.22),'paper',.85,.5);dot(...P(.5,.21+r*.3),1.1,'blue')}
   for(const[u,v,w,d,ink]of[[.25,.25,.5,.35,'teal'],[.9,.3,.35,.3,'coral']])fill(L.tile(u,v,w,d,1.005),ink,.4,false);
   for(let k=0;k<5;k++)dot(...L.p(.3+k*.12,.72,1.01),1.1,k%2?'sun':'coral')}},

  solderStation:{name:'Lehim istasyonu',kind:'floor',canStack:true,w:1,d:.5,h:.45,draw(L){
   L.box(.05,.08,.5,.34,0,.3,'coral',.7);
   const P=facing(L,.05,.42,0,.5,.3);if(P){shape(quad(P,.1,.3,.44,.44),'blue',.9,.5);dot(...P(.78,.5),1.4,'sun');line([P(.2,.42),P(.44,.42)],'teal',1.4,.9)}
   L.box(.62,.14,.3,.22,0,.06,'blue',.85);
   line([L.p(.66,.25,.06),L.p(.9,.25,.3)],'blue',2.2);dot(...L.p(.91,.25,.31),1.6,'coral');
   const[x,y]=L.p(.78,.2,.34);line([[x-4,y-2],[x+4,y-6]],'paper',1.2,.8)}},

  oscilloscope:{name:'Osiloskop',kind:'floor',canStack:true,modes:true,top:.6,w:1,d:.5,h:.6,draw(L,it){
   L.box(.04,.06,.92,.38,0,.58,'paper',.9);
   const P=facing(L,.04,.44,0,.92,.58);if(!P)return;
   screenOn((x,y)=>P(.05+x*.58,.12+y*.76),it.mode||'wave','blue',.9);
   for(let k=0;k<2;k++)for(let n=0;n<2;n++){const[x,y]=P(.74+k*.16,.28+n*.38);shape(ellipse(x,y,3.4,3.4,14),'blue',.8,.5);line([[x,y],[x+2,y-3]],'sun',1.2)}}},

  robotArm:{name:'Robot kol',kind:'floor',w:1,d:1,h:1.7,draw(L){
   L.boxes([[.12,.12,.76,.76,0,.16,'blue',.9],[.28,.28,.44,.44,.16,.3,'coral',.7]]);
   const a=L.p(.5,.5,.46),b=L.p(.5,.5,1.08),c=L.p(.9,.5,1.42);
   line([a,b],'blue',7);line([a,b],'paper',2,.5);line([b,c],'blue',6);line([b,c],'paper',1.6,.5);
   dot(...a,4,'sun');dot(...b,3.6,'sun');dot(...c,3,'sun');
   const[x,y]=c;shape([[x-1,y-3],[x+9,y-7],[x+10,y-4],[x+1,y]],'blue',.9,.6);
   line([[x+9,y-6],[x+15,y-9]],'coral',2.2);line([[x+9,y-2],[x+15,y-5]],'coral',2.2)}},

  drone:{name:'Drone ve pist',kind:'floor',w:1.5,d:1.5,h:.45,draw(L){
   shape(L.tile(0,0,1.5,1.5,.015),'blue',.75);line(L.tile(.12,.12,1.26,1.26,.02),'sun',1.4,.85,true);
   const[cx,cy]=L.p(.75,.75,.3);
   for(const[du,dv]of[[-.32,-.32],[.32,-.32],[-.32,.32],[.32,.32]]){const[x,y]=L.p(.75+du,.75+dv,.28);
    line([[cx,cy],[x,y]],'blue',2.4);shape(ellipse(x,y,7.5,4),'teal',.35,.7);line(ellipse(x,y,7.5,4,16),'blue',.8,.7,true);
    line([L.p(.75+du,.75+dv,.28),L.p(.75+du,.75+dv,.1)],'blue',1.4)}
   shape(ellipse(cx,cy-2,9,6),'coral',.8);dot(cx,cy+3,1.8,'sun')}},

  vrHeadset:{name:'VR başlığı',kind:'floor',canStack:true,w:.5,d:.5,h:.6,draw(L){
   shape(disc(L,.25,.25,.16,0,14,.5),'blue',.85);line([L.p(.25,.25,.02),L.p(.25,.25,.34)],'blue',2);
   const[x,y]=L.p(.25,.25,.5);
   shape([[x-11,y-6],[x+11,y-6],[x+10,y+4],[x-10,y+4]],'blue',.9);
   fill([[x-9,y-4],[x+9,y-4],[x+8,y+1],[x-8,y+1]],'teal',.45,false);
   line([[x-11,y-4],[x-16,y-8]],'coral',2.4);line([[x+11,y-4],[x+16,y-8]],'coral',2.4)}},

  laserCutter:{name:'Lazer kesici',kind:'floor',w:2,d:1,h:1,top:1,draw(L){
   L.box(.04,.05,1.92,.9,0,.62,'blue',.88);
   L.box(.06,.07,1.88,.86,.62,.3,'coral',.55);
   fill(L.tile(.2,.2,1.5,.6,.925),'teal',.3,false);line(L.tile(.2,.2,1.5,.6,.93),'blue',1,.7,true);
   line([L.p(.95,.2,.935),L.p(.95,.8,.935)],'blue',2);dot(...L.p(.95,.5,.94),2,'coral');
   const P=facing(L,.04,.95,0,1.92,.62);if(!P)return;
   shape(quad(P,.06,.2,.3,.5),'paper',.9,.5);for(let k=0;k<3;k++)dot(...P(.5+k*.12,.45),1.2,k?'teal':'sun')}},

  partsDrawers:{name:'Parça çekmeceleri',kind:'floor',canStack:true,top:1,w:1,d:.5,h:1,draw(L){
   L.box(.04,.05,.92,.4,0,.98,'coral',.6);
   const P=facing(L,.04,.45,0,.92,.98);if(!P)return;
   for(let r=0;r<5;r++)for(let k=0;k<3;k++){shape(quad(P,.05+k*.31,.04+r*.19,.27,.15),'paper',.9,.45);line([P(.13+k*.31,.115+r*.19),P(.23+k*.31,.115+r*.19)],'blue',1.4,.8)}}},

  serverCart:{name:'Sunucu arabası',kind:'floor',w:1.5,d:1,h:1.2,top:1.2,draw(L){
   L.boxes([[.06,.08,.1,.1,.12,1.08,'blue',.85],[1.34,.08,.1,.1,.12,1.08,'blue',.85],[.06,.82,.1,.1,.12,1.08,'blue',.85],[1.34,.82,.1,.1,.12,1.08,'blue',.85],
    [.04,.06,1.42,.88,.5,.07,'blue',.7],[0,0,1.5,1,1.13,.07,'blue',.75],
    [.12,.14,1.26,.72,.57,.34,'paper',.86]]);
   for(const[u,v]of[[.11,.13],[1.39,.13],[.11,.87],[1.39,.87]]){const[x,y]=L.p(u,v,.06);shape(ellipse(x,y,3.6,2.4),'blue',.9)}
   const P=facing(L,.12,.86,.57,1.26,.34);if(P){for(let k=0;k<3;k++){shape(quad(P,.06,.1+k*.3,.7,.2),'teal',.45,.5);dot(...P(.86,.2+k*.3),1.1,k?'sun':'coral')}}}},

  // ---- rare ----
  goldBitcoin:{name:'Altın Bitcoin',kind:'floor',w:1,d:1,h:1.6,draw(L){
   L.boxes([[.15,.15,.7,.7,0,.14,'blue',.9],[.25,.25,.5,.5,.14,.3,'paper',.9]]);
   const[x,y]=L.p(.5,.5,1.05);glow(x,y,26,26,'sun',.22);
   shape(ellipse(x,y,22,24),'sun',.95);line(ellipse(x,y,17,19,24),'coral',1.2,.7,true);
   shape([[x-4,y-13],[x+4,y-13],[x+4,y+13],[x-4,y+13]],'coral',.85,.8);
   lines([[[x-1,y-17],[x-1,y+17]],[[x+3,y-17],[x+3,y+17]]],'coral',2.2);
   line([[x-4,y-7],[x+7,y-7]],'sun',3,1);line([[x-4,y+2],[x+7,y+2]],'sun',3,1)}},

  hologram:{name:'Hologram projektörü',kind:'floor',w:1,d:1,h:1.8,draw(L){
   L.boxes([[.14,.14,.72,.72,0,.12,'blue',.9],[.28,.28,.44,.44,.12,.1,'teal',.6]]);
   dot(...L.p(.5,.5,.24),2,'sun')},
   live(L,it,t){const[x,y]=L.p(.5,.5,.24),lift=Math.sin(t*1.4)*3;
    glow(x,y-24+lift,20,26,'teal',.18);
    const r=14+Math.sin(t*2)*1.2;
    for(let k=0;k<3;k++){const yy=y-14-k*11+lift,rr=r*(1-k*.22);line(ellipse(x,yy,rr,rr*.42,18),'teal',1.1,.85,true)}
    lines([[[x,y-2],[x-16,y-34+lift]],[[x,y-2],[x+16,y-34+lift]]],'teal',.8,.4);
    for(let k=0;k<5;k++){const a=t*1.6+k*1.26;dot(x+Math.cos(a)*13,y-24+lift+Math.sin(a)*5,1.2,'sun')}}},

  quantumComputer:{name:'Kuantum bilgisayar',kind:'floor',w:1.5,d:1.5,h:2.6,draw(L){
   L.box(.1,.1,1.3,1.3,0,.2,'blue',.9);
   for(let k=0;k<5;k++){const z=2.3-k*.4,r=.18+k*.11;
    shape(disc(L,.75,.75,r,z,20,.55),'paper',.92);line(disc(L,.75,.75,r*.7,z+.005,16),'teal',.9,.7,true);
    if(k<4)for(const a of[0,1,2,3]){const ang=a/4*TAU+.4,u=.75+Math.cos(ang)*r*.8,v=.75+Math.sin(ang)*r*.8;line([L.p(u,v,z),L.p(u,v,z-.4)],'sun',1.4,.85)}}
   line([L.p(.75,.75,2.6),L.p(.75,.75,2.3)],'blue',3);
   const[x,y]=L.p(.75,.75,.34);glow(x,y,22,12,'teal',.2)}},

  dataCube:{name:'Cam küp veri merkezi',kind:'floor',w:1,d:1,h:1.3,top:1.3,draw(L){
   L.box(.06,.06,.88,.88,0,.14,'blue',.9);
   for(let k=0;k<3;k++)L.box(.18+k*.22,.2,.16,.6,.14,.92,'blue',.85);
   for(let k=0;k<3;k++)for(let r=0;r<5;r++)dot(...L.p(.26+k*.22,.24,.22+r*.17),1,(k+r)%3?'teal':'sun');
   L.box(.04,.04,.92,.92,1.06,.06,'blue',.8);
   // the glass: four upright edges and a faint tint, so the racks stay visible
   for(const[u,v]of[[.06,.06],[.94,.06],[.06,.94],[.94,.94]])line([L.p(u,v,.14),L.p(u,v,1.06)],'paper',1.4,.7);
   fill([L.p(.06,.94,.14),L.p(.94,.94,.14),L.p(.94,.94,1.06),L.p(.06,.94,1.06)],'teal',.12,false)}},

  teslaCoil:{name:'Tesla bobini',kind:'floor',w:1,d:1,h:2.1,draw(L){
   L.boxes([[.18,.18,.64,.64,0,.16,'blue',.9],[.32,.32,.36,.36,.16,.2,'coral',.7]]);
   const a=L.p(.5,.5,.36);
   L.box(.36,.36,.28,.28,.36,1.1,'coral',.55);
   for(let k=0;k<14;k++){const z=.4+k*.078;line([L.p(.34,.5,z),L.p(.66,.5,z)],'sun',1.3,.8)}
   const[x,y]=L.p(.5,.5,1.62);
   shape(ellipse(x,y,20,8),'paper',.95);line(ellipse(x,y,11,4,16),'blue',.8,.5,true);
   for(const dir of[-1,1])line([[x+dir*16,y-4],[x+dir*24,y-14],[x+dir*17,y-16],[x+dir*26,y-28]],'sun',1.6,1);
   glow(x,y-14,22,16,'sun',.2)}},

  lamboModel:{name:'Spor araba maketi',kind:'floor',canStack:true,w:1.5,d:.5,h:.4,draw(L){
   L.boxes([[.08,.08,1.34,.34,.07,.14,'coral',.8],[.45,.1,.6,.3,.21,.12,'blue',.7]]);
   for(const[u,v]of[[.28,.06],[1.18,.06],[.28,.44],[1.18,.44]]){const[x,y]=L.p(u,v,.07);shape(ellipse(x,y,3.4,2.6),'blue',.9);dot(x,y,1,'paper')}
   const[nx,ny]=L.p(.1,.25,.14);dot(nx,ny,1.4,'sun');
   line([L.p(.45,.25,.33),L.p(1.05,.25,.33)],'paper',1,.6)}},

  moonRock:{name:'Ay taşı vitrini',kind:'floor',canStack:true,w:.5,d:.5,h:.7,draw(L){
   L.box(.06,.06,.38,.38,0,.12,'coral',.7);
   const[x,y]=L.p(.25,.25,.12);
   shape([[x-7,y-2],[x-4,y-9],[x+3,y-11],[x+8,y-5],[x+6,y],[x-2,y+2]],'paper',.9);
   for(const[dx,dy,r]of[[-2,-6,1.6],[3,-4,1.2],[-4,-2,1]])fill(ellipse(x+dx,y+dy,r,r*.7,8),'blue',.2,false);
   const g=L.p(.25,.25,.62);line(ellipse(g[0],g[1]+10,13,16,22).slice(0,13),'paper',1.4,.55);
   line([[x-13,y+1],[x+13,y+1]],'paper',1.2,.5)}},

  robotDog:{name:'Robot köpek',kind:'floor',w:1.5,d:.5,h:.9,draw(L){
   L.box(.3,.09,.75,.32,.42,.3,'paper',.88);
   for(const u of[.36,.95])for(const v of[.1,.38]){const hip=L.p(u,v,.45),knee=L.p(u+.06,v,.24),foot=L.p(u-.02,v,.02);
    line([hip,knee],'blue',3.4);line([knee,foot],'blue',2.8);dot(...knee,1.8,'sun')}
   L.box(1.02,.13,.3,.24,.5,.22,'blue',.9);
   const P=facing(L,1.02,.37,.5,.3,.22);if(P){shape(ring(P,.62,.6,.22,.26),'teal',.6,.5);dot(...P(.62,.6),1.2,'coral')}
   line([L.p(1.12,.25,.72),L.p(1.2,.25,.86)],'blue',1.6);dot(...L.p(1.21,.25,.87),1.4,'sun');
   line([L.p(.3,.25,.56),L.p(.16,.25,.68)],'blue',2.4)}},

  trophy:{name:'Kupa ödülü',kind:'floor',canStack:true,w:.5,d:.5,h:.7,draw(L){const[x,y]=L.p(.25,.25);shape(rect(x-5,y-4,10,4),'blue',.85);shape(rect(x-1.5,y-9,3,5),'sun',.85,.6);
   lines([ellipse(x-7,y-15,3,3.5,12),ellipse(x+7,y-15,3,3.5,12)],'sun',1.4,1,true);shape([[x-7,y-20],[x+7,y-20],[x+4,y-10],[x-4,y-10]],'sun',.9);shape(ellipse(x,y-20,7,2.2),'sun',.6,.6)}},

  rocket:{name:'Roket maketi',kind:'floor',canStack:true,w:.5,d:.5,h:1,draw(L){const[x,y]=L.p(.25,.25);shape(ellipse(x,y,6,2.6),'blue',.85);shape([[x-5,y-6],[x-9,y-1],[x-4,y-3]],'coral',.85,.6);shape([[x+5,y-6],[x+9,y-1],[x+4,y-3]],'coral',.85,.6);
   shape([[x-5,y-3],[x-5,y-20],[x,y-29],[x+5,y-20],[x+5,y-3]],'paper',1);fill([[x-5,y-20],[x,y-29],[x+5,y-20]],'coral',.85,false);shape(ellipse(x,y-15,2.4,2.4,12),'teal',.8,.5);fill([[x-3,y-3],[x,y+3],[x+3,y-3]],'sun',.95)}},

  moonLamp:{name:'Ay lambası',kind:'floor',canStack:true,w:.5,d:.5,h:.6,draw(L){const[x,y]=L.p(.25,.25);glow(x,y-10,16,16,'sun',.22);shape(ellipse(x,y-1,4.5,2),'blue',.85);shape(ellipse(x,y-10,8,8,20),'paper',1);
   for(const[dx,dy,r]of[[-3,-13,2],[3,-8,1.6],[-2,-6,1.2],[4,-14,1]])fill(ellipse(x+dx,y+dy,r,r,10),'blue',.18,false)}}
 });
}
Object.assign(CATEGORY_OF,{printer3d:'lab',resinPrinter:'lab',filamentRack:'lab',workbench:'lab',solderStation:'lab',oscilloscope:'lab',robotArm:'lab',drone:'lab',
 vrHeadset:'lab',laserCutter:'lab',partsDrawers:'lab',serverCart:'lab',
 goldBitcoin:'crypto',hologram:'decor',quantumComputer:'lab',dataCube:'crypto',teslaCoil:'lab',lamboModel:'decor',moonRock:'decor',robotDog:'lab',
 trophy:'decor',rocket:'decor',moonLamp:'decor'});
