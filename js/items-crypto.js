'use strict';
// Crypto hardware: miners, racks, network gear, power and cold storage.
{
 // A row of ventilation slots on a panel, and a round fan seen head-on.
 const vents=(P,x,y,w,h,n=7)=>lines(Array.from({length:n},(_,k)=>[P(x+k*w/n,y),P(x+k*w/n,y+h)]),'blue',.9,.8);
 const fan=(P,cx,cy,r,ink='teal')=>{shape(ring(P,cx,cy,r,r),ink,.7,.5);line(ring(P,cx,cy,r*.62,r*.62),'sun',.9,.8,true);
  lines(Array.from({length:5},(_,k)=>{const a=k/5*TAU;return[P(cx+Math.cos(a)*r*.12,cy+Math.sin(a)*r*.12),P(cx+Math.cos(a+.9)*r*.58,cy+Math.sin(a+.9)*r*.58)]}),'blue',1.1,.7);
  dot(...P(cx,cy),1.2,'paper')};

 Object.assign(ITEMS,{
  miningRig:{name:'Madenci kasası',kind:'floor',w:1.5,d:1,h:1.3,draw(L){ // open frame: the cards must be seen from above
   L.boxes([...[0,1.42].flatMap(u=>[0,.92].map(v=>[u,v,.08,.08,0,1.24,'blue',.85])),[0,0,1.5,1,.45,.06,'blue',.75],[0,0,1.5,.08,1.24,.06,'coral',.7],[0,.92,1.5,.08,1.24,.06,'coral',.7],[0,.08,.08,.84,1.24,.06,'coral',.7],[1.42,.08,.08,.84,1.24,.06,'coral',.7],[.1,.15,1.3,.7,.04,.34,'paper',.8],...[0,1,2,3].map(k=>[.13+k*.33,.2,.24,.6,.51,.52,'blue',.9])]);
   const leds=L.sees('front')?'front':null;if(leds)for(let k=0;k<4;k++){const P=L.panel('front',.13+k*.33,.805,.51,.24,.52);shape(ring(P,.5,.62,.36,.2),'teal',.7,.5);line(ring(P,.5,.62,.2,.11),'sun',.8,.8,true);dot(...P(.5,.62),1,'paper');dot(...P(.5,.16),1.2,k%2?'sun':'coral')}
   for(let k=0;k<4;k++)fill(L.tile(.16+k*.33,.26,.18,.48,1.032),'teal',.7); // heat sinks on top of the cards
   for(let k=0;k<4;k++)cable([L.p(.25+k*.33,.85,.38),L.p(.25+k*.33,.9,.46),L.p(.25+k*.33,.82,.53)],k%2?'sun':'coral',1.1)}},

  asicMiner:{name:'ASIC madenci',kind:'floor',canStack:true,top:.6,w:1.5,d:.5,h:.6,draw(L){
   L.box(.03,.04,1.44,.42,0,.58,'paper',.88);
   const P=facing(L,.03,.46,0,1.44,.58);if(!P){const B=L.panel(L.sees('back')?'back':'right',.03,.04,0,1.44,.58);vents(B,.1,.15,.8,.7,12);return}
   for(const cx of[.27,.73])fan(P,cx,.5,.19);
   shape(quad(P,.88,.2,.09,.6),'blue',.9,.5);for(let k=0;k<3;k++)dot(...P(.925,.3+k*.2),1,k===0?'coral':'sun')}},

  asicRack:{name:'ASIC rafı',kind:'floor',w:1.5,d:1,h:2.4,top:2.4,draw(L){
   L.boxes([...[0,1.42].flatMap(u=>[0,.92].map(v=>[u,v,.08,.08,0,2.4,'blue',.85])),
    ...[0,1,2,3].map(k=>[.06,.06,1.38,.88,.16+k*.56,.05,'blue',.7]),
    ...[0,1,2,3].map(k=>[.08,.1,1.34,.8,.21+k*.56,.4,'paper',.86])]);
   if(!L.sees('front'))return;
   for(let k=0;k<4;k++){const P=L.panel('front',.08,.9,.21+k*.56,1.34,.4);for(const cx of[.28,.72])fan(P,cx,.5,.26);dot(...P(.93,.68),1.1,'coral');dot(...P(.93,.34),1.1,'sun')}}},

  immersionTank:{name:'Sıvı soğutma tankı',kind:'floor',w:2,d:1,h:1,top:1,draw(L){
   L.box(.05,.05,1.9,.9,0,.88,'blue',.55);
   fill(L.tile(.12,.12,1.76,.76,.9),'teal',.45);line(L.tile(.12,.12,1.76,.76,.9),'sun',1.1,.8,true);
   for(let k=0;k<5;k++){fill(L.tile(.22+k*.33,.2,.2,.6,.905),'blue',.8);lines([[L.p(.24+k*.33,.28,.91),L.p(.4+k*.33,.28,.91)],[L.p(.24+k*.33,.45,.91),L.p(.4+k*.33,.45,.91)]],'sun',.8,.7)}
   for(const[u,v]of[[.5,.3],[1.1,.6],[1.6,.35],[.85,.72]]){const[x,y]=L.p(u,v,.92);line(ellipse(x,y,2.4,1.3,10),'paper',.7,.8,true)}
   L.box(0,0,2,1,.88,.1,'blue',.8)}},

  halfRack:{name:'Yarım raf',kind:'floor',w:1.5,d:1,h:1.5,top:1.5,draw(L){
   L.box(.06,.08,1.38,.84,0,1.5,'blue',.86);
   const P=facing(L,.14,.925,.1,1.22,1.32);if(!P)return;shape(quad(P,0,0,1,1),'blue',1);
   for(let r=0;r<5;r++){const y=.04+r*.19;shape(quad(P,.05,y,.9,.14),'teal',.45,.6);vents(P,.12,y+.03,.45,.08,6);for(let n=0;n<3;n++)dot(...P(.74+n*.07,y+.07),1,n?'sun':'coral')}}},

  networkSwitch:{name:'Ağ anahtarı',kind:'floor',canStack:true,top:.2,w:1,d:.5,h:.2,draw(L){
   L.box(.03,.06,.94,.38,0,.18,'blue',.88);
   const P=facing(L,.03,.44,0,.94,.18);if(!P)return;
   for(let k=0;k<8;k++){shape(quad(P,.06+k*.1,.22,.07,.4),'blue',.6,.4);dot(...P(.095+k*.1,.78),.9,k%3===0?'sun':'teal')}}},

  router:{name:'Router',kind:'floor',canStack:true,top:.22,w:1,d:.5,h:.6,draw(L){
   L.box(.06,.08,.88,.34,0,.2,'paper',.9);
   for(const[u,lean]of[[.18,-.12],[.5,0],[.82,.12]])line([L.p(u,.2,.2),L.p(u+lean,.2,.58)],'blue',2.4);
   const P=facing(L,.06,.42,0,.88,.2);if(!P)return;
   for(let k=0;k<4;k++)dot(...P(.2+k*.16,.5),1.1,k===0?'coral':'teal')}},

  nas:{name:'NAS',kind:'floor',canStack:true,top:.75,w:.5,d:.5,h:.75,draw(L){
   L.box(.06,.08,.38,.34,0,.73,'blue',.88);
   const P=facing(L,.06,.42,0,.38,.73);if(!P)return;
   for(let k=0;k<4;k++){shape(quad(P,.1,.08+k*.22,.66,.16),'paper',.85,.5);dot(...P(.85,.16+k*.22),.9,k?'teal':'sun')}}},

  ups:{name:'UPS akü',kind:'floor',w:1,d:.5,h:.5,top:.5,draw(L){
   L.box(.04,.05,.92,.4,0,.48,'blue',.9);
   const P=facing(L,.04,.45,0,.92,.48);if(!P)return;
   shape(quad(P,.08,.25,.34,.5),'teal',.5,.5);lines([0,1,2].map(k=>[P(.13+k*.1,.34),P(.13+k*.1,.66)]),'sun',1.4,.9);
   for(let k=0;k<3;k++)dot(...P(.58+k*.12,.5),1.3,k===0?'coral':k===1?'sun':'teal')}},

  piCluster:{name:'Pi kümesi',kind:'floor',canStack:true,w:.5,d:.5,h:.5,draw(L){
   for(let k=0;k<4;k++){L.box(.08,.1,.34,.3,k*.11,.04,'teal',.75);
    const[x,y]=L.p(.14,.16,k*.11+.045);fill(rect(x,y-3,5,3),'blue',.9,false);dot(...L.p(.36,.34,k*.11+.05),.8,k%2?'sun':'coral')}
   for(const u of[.1,.4])line([L.p(u,.12,0),L.p(u,.12,.44)],'blue',1.4)}},

  seedPlate:{name:'Çelik seed plakası',kind:'floor',canStack:true,w:.5,d:.5,h:.05,draw(L){
   L.box(.08,.12,.34,.26,0,.03,'paper',.95);
   const[x,y]=L.p(.25,.25,.035);for(let r=0;r<3;r++)for(let k=0;k<6;k++)fill(rect(x-9+k*3,y-5+r*3.2,1.8,1.8),'blue',.85,false);
   line([L.p(.08,.24,.035),L.p(.42,.24,.035)],'blue',.6,.5)}},

  pdu:{name:'Güç dağıtımı',kind:'floor',canStack:true,top:.15,w:1.5,d:.5,h:.15,draw(L){
   L.box(.03,.1,1.44,.3,0,.13,'blue',.9);
   const P=facing(L,.03,.4,0,1.44,.13);if(!P)return;
   for(let k=0;k<8;k++){shape(quad(P,.05+k*.115,.22,.075,.56),'paper',.9,.4);dot(...P(.0875+k*.115,.5),.8,'blue')}
   dot(...P(.97,.5),1.2,'coral')}},

  industrialFan:{name:'Endüstriyel fan',kind:'floor',w:1,d:1,h:1.5,draw(L){
   L.box(.28,.3,.44,.4,0,.1,'blue',.85);line([L.p(.5,.5,.1),L.p(.5,.5,.72)],'blue',3);
   const P=L.sees('front')?L.panel('front',.05,.72,.6,.9,.9):L.panel('back',.05,.28,.6,.9,.9);
   shape(ring(P,.5,.5,.45,.45),'blue',.35,1.2);
   lines([0,1,2].map(k=>ring(P,.5,.5,.15+k*.14,.15+k*.14,20)),'blue',.8,.6);
   lines(Array.from({length:4},(_,k)=>{const a=k/4*TAU;return[P(.5+Math.cos(a)*.08,.5+Math.sin(a)*.08),P(.5+Math.cos(a+1)*.4,.5+Math.sin(a+1)*.4)]}),'teal',3,.8);
   dot(...P(.5,.5),2.4,'coral')}},

  generator:{name:'Jeneratör',kind:'floor',w:1.5,d:1,h:1,top:1,draw(L){
   L.boxes([[.05,.06,1.4,.88,0,.16,'blue',.9],[.1,.12,1.1,.76,.16,.62,'sun',.6],[1.2,.2,.24,.6,.16,.44,'blue',.8]]);
   line([L.p(1.32,.35,.6),L.p(1.32,.35,1)],'blue',3.2);dot(...L.p(1.32,.35,1),2.6,'blue');
   const P=facing(L,.1,.88,.16,1.1,.62);if(!P)return;
   for(let k=0;k<5;k++)line([P(.08+k*.06,.2),P(.08+k*.06,.8)],'blue',1.2,.8);
   shape(ring(P,.62,.5,.16,.22),'paper',.95,.6);line([P(.62,.5),P(.7,.62)],'blue',1.2);
   for(let k=0;k<2;k++)dot(...P(.86,.35+k*.3),1.2,k?'coral':'sun')}},

  solarPanel:{name:'Güneş paneli',kind:'floor',w:2,d:1.5,h:.9,draw(L){
   L.boxes([[.1,1.15,.14,.3,0,.2,'blue',.85],[1.76,1.15,.14,.3,0,.2,'blue',.85],[.1,.1,.14,.3,0,.75,'blue',.85],[1.76,.1,.14,.3,0,.75,'blue',.85]]);
   // One tilted plane: low at the front edge, high at the back. p() is linear, so the quad comes out right.
   const plane=(a,b,c,d)=>[L.p(a,1.4,.22),L.p(b,1.4,.22),L.p(c,.15,.85),L.p(d,.15,.85)];
   shape(plane(.05,1.95,1.95,.05),'blue',.92);
   for(let k=1;k<4;k++)line([L.p(.05+k*.475,1.4,.225),L.p(.05+k*.475,.15,.855)],'teal',1,.7);
   for(let k=1;k<3;k++)line([L.p(.05,1.4-k*.42,.22+k*.21),L.p(1.95,1.4-k*.42,.22+k*.21)],'teal',1,.7);
   fill([L.p(.15,1.25,.31),L.p(.75,1.25,.31),L.p(.75,.95,.46),L.p(.15,.95,.46)],'sun',.5,false)}},

  satelliteDish:{name:'Uydu çanağı',kind:'floor',w:1.5,d:1.5,h:2,draw(L){
   shape(disc(L,.75,.75,.4,0,18,.55),'blue',.85);line([L.p(.75,.75,.05),L.p(.75,.75,1.1)],'blue',3);
   const[x,y]=L.p(.75,.6,1.5);
   shape(ellipse(x,y,26,30),'paper',.95);fill(ellipse(x+3,y+2,21,25),'blue',.22,false);
   line(ellipse(x,y,26,30,28),'coral',2.4,.8,true);
   lines([[[x-24,y],[x+24,y]],[[x,y-28],[x,y+28]]],'blue',.6,.35);
   line(ellipse(x,y,13,15,20),'blue',.7,.45,true);
   line([[x,y],[x+16,y+16]],'blue',2);dot(x+17,y+17,3,'coral')}},

  bitcoinATM:{name:'Bitcoin ATM',kind:'floor',modes:true,w:1,d:1,h:2.2,top:2.2,draw(L,it){
   L.box(.05,.1,.9,.82,0,2.2,'blue',.9);
   const P=facing(L,.1,.925,.05,.8,2.1);if(!P){shape(quad(L.panel('back',.1,.09,.05,.8,2.1),.1,.1,.8,.8),'blue',.6,.6);return}
   screenOn((x,y)=>P(.06+x*.88,.52+y*.42),it.mode||'bars','paper',.85);
   shape(quad(P,.18,.34,.64,.06),'paper',.9,.5);          // note slot
   shape(ring(P,.5,.2,.17,.07),'sun',.9,.6);dot(...P(.5,.2),1.4,'blue');  // coin tray
   for(let k=0;k<3;k++)dot(...P(.2+k*.3,.46),1,k===1?'coral':'teal')}},

  safe:{name:'Çelik kasa',kind:'floor',w:1,d:1,h:1.2,top:1.2,draw(L){L.box(.08,.08,.84,.84,0,1.2,'blue',.9);const P=facing(L,.08,.925,0,.84,1.2);if(!P)return;
   line(quad(P,.08,.06,.84,.88),'paper',.8,.5,true);shape(ring(P,.45,.55,.2,.14),'paper',.9,.6);lines(Array.from({length:8},(_,k)=>{const a=k/8*TAU;return[P(.45+Math.cos(a)*.13,.55+Math.sin(a)*.09),P(.45+Math.cos(a)*.18,.55+Math.sin(a)*.125)]}),'blue',.7);dot(...P(.45,.55),1.5,'coral');line([P(.78,.45),P(.78,.65)],'paper',2.4,.9)}},

  validatorNode:{name:'Doğrulayıcı düğüm',kind:'floor',canStack:true,top:.35,w:1,d:.5,h:.35,draw(L){L.box(.04,.05,.92,.4,0,.3,'blue',.88);const P=facing(L,.04,.45,0,.92,.3);if(!P)return;
   for(let k=0;k<6;k++)dot(...P(.1+k*.09,.5),1.1,k%3===0?'coral':k%3===1?'sun':'teal');lines([[P(.7,.3),P(.92,.3)],[P(.7,.5),P(.92,.5)],[P(.7,.7),P(.92,.7)]],'paper',.6,.5)}},

  hardwareWallet:{name:'Donanım cüzdanı',kind:'floor',canStack:true,w:.5,d:.5,h:.05,draw(L){shape(L.tile(.1,.17,.32,.14,.02),'blue',.92,.6);fill(L.tile(.14,.2,.13,.08,.025),'paper',1);dot(...L.p(.34,.24,.03),1,'coral');line([L.p(.42,.24,.02),L.p(.48,.24,.02)],'paper',1.6,.9)}},

  goldBars:{name:'Külçe altın',kind:'floor',canStack:true,w:.5,d:.5,h:.22,draw(L){L.boxes([[.05,.08,.4,.16,0,.1,'sun',.9],[.05,.27,.4,.16,0,.1,'sun',.9],[.05,.175,.4,.16,.1,.1,'sun',.95]])}},

  diamond:{name:'Elmas',kind:'floor',canStack:true,w:.5,d:.5,h:.75,draw(L){L.box(.12,.12,.26,.26,0,.22,'blue',.85);const[x,y]=L.p(.25,.25,.22);glow(x,y-10,12,10,'teal',.2);
   shape([[x-8,y-13],[x-4,y-18],[x+4,y-18],[x+8,y-13],[x,y-3]],'teal',.45);lines([[[x-8,y-13],[x+8,y-13]],[[x-4,y-18],[x-2,y-13],[x,y-3]],[[x+4,y-18],[x+2,y-13],[x,y-3]]],'blue',.7,.8)}}
 });
}
Object.assign(CATEGORY_OF,{miningRig:'crypto',asicMiner:'crypto',asicRack:'crypto',immersionTank:'crypto',halfRack:'crypto',networkSwitch:'crypto',router:'crypto',
 nas:'crypto',ups:'crypto',piCluster:'crypto',seedPlate:'crypto',pdu:'crypto',industrialFan:'crypto',generator:'crypto',solarPanel:'crypto',satelliteDish:'crypto',
 bitcoinATM:'crypto',safe:'crypto',validatorNode:'crypto',hardwareWallet:'crypto',goldBars:'crypto',diamond:'crypto'});
