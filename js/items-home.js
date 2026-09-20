'use strict';
// Second catalogue: home, kitchen, crypto and decoration. Same rules as items.js.
//   variants: n  → the item comes in n looks (item.variant), switched with M in the editor
//   onFloor      → a wall item that always starts at the floor (a door)
{
 const disc=(L,cx,cy,r,z,n=22,squash=1)=>Array.from({length:n},(_,k)=>L.p(cx+Math.cos(k/n*TAU)*r,cy+Math.sin(k/n*TAU)*r*squash,z));
 const front=(L,start,off,z,pw,ph)=>L.sees('front')?L.panel('front',start,off,z,pw,ph):null;

 Object.assign(ITEMS,{
  // ---- home ----
  bed:{name:'Yatak',kind:'floor',w:2,d:3.5,h:1.1,draw(L){L.boxes([[0,0,2,.25,0,1.1,'blue',.75],[0,.25,2,3.25,0,.35,'teal',.7],[.06,.3,1.88,1.15,.35,.22,'paper',.95],[.3,.42,1.4,.7,.57,.12,'paper',1],[.03,1.45,1.94,2.02,.35,.27,'coral',.6]]);
   lines([[L.p(.03,1.75,.625),L.p(1.97,1.75,.625)]],'paper',1.2,.7)}}, // mattress stops where the blanket starts, so the two never fight over depth
  sofa:{name:'Kanepe',kind:'floor',w:3,d:1.5,h:1.25,draw(L){L.boxes([[0,0,3,.4,0,1.25,'teal',.8],[0,.4,3,1.1,0,.45,'teal',.75],[0,.4,.35,1.1,.45,.4,'teal',.8],[2.65,.4,.35,1.1,.45,.4,'teal',.8],[.4,.45,1.1,1,.45,.17,'coral',.6],[1.5,.45,1.1,1,.45,.17,'coral',.6]])}},
  armchair:{name:'Berjer',kind:'floor',w:1.5,d:1.5,h:1.2,draw(L){L.boxes([[0,0,1.5,.4,0,1.2,'sun',.7],[0,.4,1.5,1.1,0,.42,'sun',.65],[0,.4,.3,1.1,.42,.38,'sun',.7],[1.2,.4,.3,1.1,.42,.38,'sun',.7],[.34,.45,.82,1,.42,.16,'paper',.9]])}},
  beanbag:{name:'Armut koltuk',kind:'floor',w:1.5,d:1.5,h:.8,draw(L){const[x,y]=L.p(.75,.75);shape(ellipse(x,y-9,30,17),'coral',.7);shade(ellipse(x+5,y-3,24,11).slice(0,17),.22);shape(ellipse(x-3,y-17,17,8),'coral',.5,.7)}},
  bookshelf:{name:'Kitaplık',kind:'floor',w:2,d:.5,h:2.6,top:2.6,draw(L){L.box(0,.05,2,.45,0,2.6,'coral',.6);const P=front(L,.08,.505,.08,1.84,2.44);if(!P)return;
   shape(quad(P,0,0,1,1),'blue',.92,.8);const r=rng(7),inks=['coral','sun','teal','paper'];
   for(let row=0;row<4;row++){const y=row*.25;fill(quad(P,0,y,1,.02),'coral',.6);for(let x=.03;x<.9;){const wd=.035+r()*.05,ht=.13+r()*.08;if(r()<.85)shape(quad(P,x,y+.02,wd,ht),inks[Math.floor(r()*4)],.55+r()*.35,.45);x+=wd+.006}}}},
  coffeeTable:{name:'Sehpa',...deskOf(2,1,.45,'sun','blue')},
  nightstand:{name:'Komodin',kind:'floor',w:1,d:1,h:.7,top:.7,draw(L){L.box(.1,.1,.8,.8,0,.7,'coral',.6);const P=front(L,.1,.905,0,.8,.7);if(!P)return;
   for(const y of[.1,.55]){line(quad(P,.08,y,.84,.36),'blue',.7,.7,true);dot(...P(.5,y+.18),1.3,'sun')}}},
  wardrobe:{name:'Gardırop',kind:'floor',w:2,d:1,h:2.5,top:2.5,draw(L){L.box(0,.05,2,.9,0,2.5,'coral',.65);const P=front(L,.06,.955,.08,1.88,2.36);if(!P)return;
   shape(quad(P,0,0,.49,1),'coral',.5,.8);shape(quad(P,.51,0,.49,1),'coral',.5,.8);lines([[P(.45,.42),P(.45,.58)],[P(.55,.42),P(.55,.58)]],'blue',2)}},
  floorLamp:{name:'Ayaklı lamba',kind:'floor',w:.5,d:.5,h:2.1,draw(L){const a=L.p(.25,.25,0),b=L.p(.25,.25,1.75);glow(b[0],b[1]+6,30,18,'sun',.3);shape(ellipse(a[0],a[1],7,3.5),'blue',.85);line([a,b],'blue',2.2);
   shape([[b[0]-10,b[1]+3],[b[0]+10,b[1]+3],[b[0]+6,b[1]-12],[b[0]-6,b[1]-12]],'sun',.75)}},
  deskLamp:{name:'Masa lambası',kind:'floor',canStack:true,w:.5,d:.5,h:.75,draw(L){const[x,y]=L.p(.25,.25);glow(x+6,y-6,13,7,'sun',.3);shape(ellipse(x,y,5,2.4),'blue',.85);line([[x,y-1],[x-3,y-12],[x+5,y-19]],'blue',1.8);
   shape([[x+1,y-22],[x+10,y-18],[x+8,y-13],[x+2,y-17]],'coral',.8)}},
  catSleeping:{name:'Uyuyan kedi',kind:'floor',canStack:true,w:1,d:.5,h:.35,draw(L){const[x,y]=L.p(.5,.25);line([[x+9,y-3],[x+15,y-1],[x+16,y-6]],'sun',3,.9);
   shape(ellipse(x+1,y-5,11,6),'sun',.75);shape(ellipse(x-9,y-5,5.5,4.8),'sun',.75);shape([[x-13,y-8],[x-12,y-13],[x-9,y-9]],'sun',.85,.7);shape([[x-8,y-9],[x-5,y-13],[x-5,y-8]],'sun',.85,.7);
   lines([[[x-11,y-5],[x-9.5,y-4.4]],[[x-7.5,y-4.4],[x-6,y-5]]],'blue',.8)}},
  cactus:{name:'Kaktüs',kind:'floor',canStack:true,w:.5,d:.5,h:.8,draw(L){const[x,y]=L.p(.25,.25);shape([[x-5,y-8],[x+5,y-8],[x+4,y],[x-4,y]],'coral',.75);
   shape(ellipse(x,y-16,4,9),'teal',.75);line([[x-4,y-13],[x-8,y-14],[x-8,y-19]],'teal',3,.85);line([[x+4,y-16],[x+8,y-17],[x+8,y-21]],'teal',3,.85);dot(x,y-25,1.4,'coral')}},
  aquarium:{name:'Akvaryum',kind:'floor',canStack:true,w:1.5,d:.5,h:.9,draw(L){L.box(.05,.05,1.4,.4,0,.85,'teal',.3);L.box(.03,.03,1.44,.44,.85,.05,'blue',.85);const P=front(L,.05,.455,0,1.4,.85);if(!P)return;
   fill(quad(P,0,0,1,.12),'sun',.6);lines([[P(.12,.12),P(.1,.5)],[P(.16,.12),P(.19,.42)],[P(.85,.12),P(.88,.55)]],'teal',1.6,.9);
   for(const[fx,fy,ink,dir]of[[.35,.6,'coral',1],[.62,.38,'sun',-1],[.74,.7,'coral',1]]){shape(ring(P,fx,fy,.055,.06,12),ink,.85,.5);shape([P(fx-dir*.05,fy),P(fx-dir*.1,fy+.07),P(fx-dir*.1,fy-.07)],ink,.85,.5)}
   for(const[bx,by]of[[.5,.75],[.52,.85],[.27,.8]])line(ring(P,bx,by,.012,.018,8),'paper',.6,.8,true)}},
  trashBin:{name:'Çöp kutusu',kind:'floor',w:.5,d:.5,h:.7,draw(L){const[x,y]=L.p(.25,.25);shape([[x-6,y-15],[x+6,y-15],[x+5,y],[x-5,y]],'blue',.6);lines([[[x-2,y-13],[x-2,y-2]],[[x+2,y-13],[x+2,y-2]]],'paper',.6,.4);
   shape(ellipse(x,y-15,6,2.6),'blue',.85,.6);for(const[dx,dy]of[[-3,-17],[2,-18],[0,-20]])shape([[x+dx-3,y+dy],[x+dx,y+dy-3],[x+dx+3,y+dy-1],[x+dx+2,y+dy+2],[x+dx-2,y+dy+2]],'paper',1,.6)}},
  rugRound:{name:'Yuvarlak halı',kind:'rug',w:3,d:3,h:.03,draw(L){shape(disc(L,1.5,1.5,1.45,.015,36),'sun',.45);line(disc(L,1.5,1.5,1.15,.02,36),'coral',1.2,.8,true);line(disc(L,1.5,1.5,.6,.02,28),'coral',.9,.6,true)}},
  // ---- kitchen ----
  fridge:{name:'Buzdolabı',kind:'floor',w:1,d:1,h:2.2,top:2.2,draw(L){L.box(.08,.1,.84,.85,0,2.2,'paper',.9);const P=front(L,.08,.955,0,.84,2.2);if(!P)return;
   line([P(0,.62),P(1,.62)],'blue',1.2);lines([[P(.12,.68),P(.12,.9)],[P(.12,.3),P(.12,.55)]],'blue',2.2);dot(...P(.6,.8),1.6,'coral');dot(...P(.75,.74),1.4,'sun');shape(quad(P,.5,.4,.3,.13),'paper',1,.5)}},
  kitchenCounter:{name:'Mutfak tezgâhı',kind:'floor',w:3,d:1,h:1,top:1,draw(L){L.box(0,.05,3,.92,0,.92,'teal',.6);L.box(0,0,3,1,.92,.08,'paper',.95);
   shape(L.tile(.25,.25,.9,.5,1.004),'blue',.5,.7);line([L.p(.7,.3,1.004),L.p(.7,.3,1.2),L.p(.7,.45,1.2)],'blue',1.6);for(const cx of[1.85,2.5]){shape(disc(L,cx,.5,.24,1.004,18),'blue',.9,.6);line(disc(L,cx,.5,.13,1.006,14),'coral',1,.8,true)}
   const P=front(L,0,1.005,.06,3,.82);if(P)for(let k=0;k<3;k++){line(quad(P,.02+k*.33,.04,.3,.9),'blue',.7,.7,true);dot(...P(.17+k*.33,.8),1.3,'sun')}}},
  coffeeMachine:{name:'Kahve makinesi',kind:'floor',canStack:true,w:.5,d:.5,h:.6,draw(L){L.boxes([[.08,.06,.34,.2,0,.55,'blue',.85],[.08,.26,.34,.18,0,.08,'blue',.8],[.08,.26,.34,.18,.42,.13,'blue',.85]]);
   const[x,y]=L.p(.25,.36,.08);shape(rect(x-3,y-6,6,6),'paper',1,.6);dot(...L.p(.25,.45,.5),1.1,'coral')}},
  microwave:{name:'Mikrodalga',kind:'floor',canStack:true,w:1,d:.5,h:.5,draw(L){L.box(.04,.05,.92,.4,0,.45,'paper',.9);const P=front(L,.04,.455,0,.92,.45);if(!P)return;
   shape(quad(P,.06,.15,.6,.7),'blue',.92,.6);fill(quad(P,.1,.22,.52,.2),'sun',.35,false);for(let k=0;k<3;k++)dot(...P(.82,.72-k*.24),1.2,k?'blue':'coral')}},
  pizzaBox:{name:'Pizza kutusu',kind:'floor',canStack:true,w:.5,d:.5,h:.08,draw(L){L.box(.03,.03,.44,.44,0,.06,'paper',.9);shape(disc(L,.25,.25,.13,.064,14),'coral',.8,.5);fill(disc(L,.25,.25,.06,.066,10),'sun',.9)}},
  ramen:{name:'Hazır erişte',kind:'floor',canStack:true,w:.5,d:.5,h:.35,draw(L){const[x,y]=L.p(.25,.25);shape([[x-6,y-10],[x+6,y-10],[x+4,y],[x-4,y]],'paper',1);fill([[x-5.6,y-8],[x+5.6,y-8],[x+5,y-4],[x-5,y-4]],'coral',.75,false);
   shape(ellipse(x,y-10,6,2.4),'sun',.6,.6);lines([[[x-1,y-10],[x+8,y-19]],[[x+1,y-10],[x+10,y-18]]],'blue',1)}},
  // ---- crypto ----
  miningRig:{name:'Madenci kasası',kind:'floor',w:1.5,d:1,h:1.3,draw(L){ // open frame: the cards must be seen from above
   L.boxes([...[0,1.42].flatMap(u=>[0,.92].map(v=>[u,v,.08,.08,0,1.24,'blue',.85])),[0,0,1.5,1,.45,.06,'blue',.75],[0,0,1.5,.08,1.24,.06,'coral',.7],[0,.92,1.5,.08,1.24,.06,'coral',.7],[0,.08,.08,.84,1.24,.06,'coral',.7],[1.42,.08,.08,.84,1.24,.06,'coral',.7],[.1,.15,1.3,.7,.04,.34,'paper',.8],...[0,1,2,3].map(k=>[.13+k*.33,.2,.24,.6,.51,.52,'blue',.9])]);
   const leds=L.sees('front')?'front':null;if(leds)for(let k=0;k<4;k++){const P=L.panel('front',.13+k*.33,.805,.51,.24,.52);shape(ring(P,.5,.62,.36,.2),'teal',.7,.5);line(ring(P,.5,.62,.2,.11),'sun',.8,.8,true);dot(...P(.5,.62),1,'paper');dot(...P(.5,.16),1.2,k%2?'sun':'coral')}
   for(let k=0;k<4;k++)fill(L.tile(.16+k*.33,.26,.18,.48,1.032),'teal',.7); // heat sinks on top of the cards
   for(let k=0;k<4;k++)cable([L.p(.25+k*.33,.85,.38),L.p(.25+k*.33,.9,.46),L.p(.25+k*.33,.82,.53)],k%2?'sun':'coral',1.1)}},
  safe:{name:'Çelik kasa',kind:'floor',w:1,d:1,h:1.2,top:1.2,draw(L){L.box(.08,.08,.84,.84,0,1.2,'blue',.9);const P=front(L,.08,.925,0,.84,1.2);if(!P)return;
   line(quad(P,.08,.06,.84,.88),'paper',.8,.5,true);shape(ring(P,.45,.55,.2,.14),'paper',.9,.6);lines(Array.from({length:8},(_,k)=>{const a=k/8*TAU;return[P(.45+Math.cos(a)*.13,.55+Math.sin(a)*.09),P(.45+Math.cos(a)*.18,.55+Math.sin(a)*.125)]}),'blue',.7);dot(...P(.45,.55),1.5,'coral');line([P(.78,.45),P(.78,.65)],'paper',2.4,.9)}},
  validatorNode:{name:'Doğrulayıcı düğüm',kind:'floor',canStack:true,w:1,d:.5,h:.35,draw(L){L.box(.04,.05,.92,.4,0,.3,'blue',.88);const P=front(L,.04,.455,0,.92,.3);if(!P)return;
   for(let k=0;k<6;k++)dot(...P(.1+k*.09,.5),1.1,k%3===0?'coral':k%3===1?'sun':'teal');lines([[P(.7,.3),P(.92,.3)],[P(.7,.5),P(.92,.5)],[P(.7,.7),P(.92,.7)]],'paper',.6,.5)}},
  hardwareWallet:{name:'Donanım cüzdanı',kind:'floor',canStack:true,w:.5,d:.5,h:.05,draw(L){shape(L.tile(.1,.17,.32,.14,.02),'blue',.92,.6);fill(L.tile(.14,.2,.13,.08,.025),'paper',1);dot(...L.p(.34,.24,.03),1,'coral');line([L.p(.42,.24,.02),L.p(.48,.24,.02)],'paper',1.6,.9)}},
  goldBars:{name:'Külçe altın',kind:'floor',canStack:true,w:.5,d:.5,h:.22,draw(L){L.boxes([[.05,.08,.4,.16,0,.1,'sun',.9],[.05,.27,.4,.16,0,.1,'sun',.9],[.05,.175,.4,.16,.1,.1,'sun',.95]])}},
  trophy:{name:'Kupa ödülü',kind:'floor',canStack:true,w:.5,d:.5,h:.7,draw(L){const[x,y]=L.p(.25,.25);shape(rect(x-5,y-4,10,4),'blue',.85);shape(rect(x-1.5,y-9,3,5),'sun',.85,.6);
   lines([ellipse(x-7,y-15,3,3.5,12),ellipse(x+7,y-15,3,3.5,12)],'sun',1.4,1,true);shape([[x-7,y-20],[x+7,y-20],[x+4,y-10],[x-4,y-10]],'sun',.9);shape(ellipse(x,y-20,7,2.2),'sun',.6,.6)}},
  rocket:{name:'Roket maketi',kind:'floor',canStack:true,w:.5,d:.5,h:1,draw(L){const[x,y]=L.p(.25,.25);shape(ellipse(x,y,6,2.6),'blue',.85);shape([[x-5,y-6],[x-9,y-1],[x-4,y-3]],'coral',.85,.6);shape([[x+5,y-6],[x+9,y-1],[x+4,y-3]],'coral',.85,.6);
   shape([[x-5,y-3],[x-5,y-20],[x,y-29],[x+5,y-20],[x+5,y-3]],'paper',1);fill([[x-5,y-20],[x,y-29],[x+5,y-20]],'coral',.85,false);shape(ellipse(x,y-15,2.4,2.4,12),'teal',.8,.5);fill([[x-3,y-3],[x,y+3],[x+3,y-3]],'sun',.95)}},
  moonLamp:{name:'Ay lambası',kind:'floor',canStack:true,w:.5,d:.5,h:.6,draw(L){const[x,y]=L.p(.25,.25);glow(x,y-10,16,16,'sun',.22);shape(ellipse(x,y-1,4.5,2),'blue',.85);shape(ellipse(x,y-10,8,8,20),'paper',1);
   for(const[dx,dy,r]of[[-3,-13,2],[3,-8,1.6],[-2,-6,1.2],[4,-14,1]])fill(ellipse(x+dx,y+dy,r,r,10),'blue',.18,false)}},
  diamond:{name:'Elmas',kind:'floor',canStack:true,w:.5,d:.5,h:.75,draw(L){L.box(.12,.12,.26,.26,0,.22,'blue',.85);const[x,y]=L.p(.25,.25,.22);glow(x,y-10,12,10,'teal',.2);
   shape([[x-8,y-13],[x-4,y-18],[x+4,y-18],[x+8,y-13],[x,y-3]],'teal',.45);lines([[[x-8,y-13],[x+8,y-13]],[[x-4,y-18],[x-2,y-13],[x,y-3]],[[x+4,y-18],[x+2,y-13],[x,y-3]]],'blue',.7,.8)}},
  // ---- walls ----
  window:{name:'Pencere',kind:'wall',variants:3,w:2,h:1.5,draw(P,it){const v=it.variant||0;shape(quad(P,0,0,1,1),'paper',1,1.4);
   if(v===0){shape(quad(P,.06,.08,.88,.84),'teal',.3,.7);shape(ring(P,.7,.7,.09,.12),'sun',.9,.5);shape([P(.06,.08),P(.06,.3),P(.3,.44),P(.55,.25),P(.8,.42),P(.94,.28),P(.94,.08)],'teal',.65,.6)}
   else if(v===1){shape(quad(P,.06,.08,.88,.84),'blue',.95,.7);shape(ring(P,.3,.7,.08,.105),'paper',1,.5);fill(ring(P,.33,.72,.06,.08),'blue',.95);for(const[sx,sy]of[[.55,.8],[.7,.6],[.82,.78],[.62,.45],[.2,.4],[.45,.62]])dot(...P(sx,sy),.8,'paper')}
   else{shape(quad(P,.06,.08,.88,.84),'coral',.35,.7);const r=rng(5);for(let x=.06;x<.9;){const wd=.08+r()*.08,ht=.25+r()*.5;shape(quad(P,x,.08,Math.min(wd,.94-x),ht),'blue',.85,.5);for(let k=0;k<3;k++)if(r()<.7)dot(...P(x+wd*.5,.14+k*.13),.9,'sun');x+=wd}}
   lines([[P(.5,.08),P(.5,.92)],[P(.06,.5),P(.94,.5)]],'paper',3,1);shape(quad(P,-.03,-.04,1.06,.07),'paper',1,.8)}},
  door:{name:'Kapı',kind:'wall',onFloor:true,w:1.5,h:2.5,draw(P){shape(quad(P,0,0,1,1),'paper',.9,1.2);shape(quad(P,.07,0,.86,.96),'coral',.65,1);lines([quad(P,.17,.08,.66,.36),quad(P,.17,.52,.66,.36)],'blue',.8,.7,true);
   dot(...P(.84,.47),2,'sun');shape(quad(P,.3,.74,.4,.08),'paper',1,.5)}},
  pictureFrame:{name:'NFT çerçevesi',kind:'wall',variants:4,w:1,h:1,draw(P,it){const v=it.variant||0;shape(quad(P,.08,.08,.84,.84),'sun',.8,1.2);shape(quad(P,.17,.17,.66,.66),'paper',1,.6);const Q=(x,y)=>P(.17+x*.66,.17+y*.66);
   if(v===0){fill(quad(Q,0,0,1,1),'teal',.5,false);const face=['..####..','.#....#.','#.#..#.#','#......#','#.####.#','.#....#.','..####..'];face.forEach((row,yy)=>[...row].forEach((ch,xx)=>{if(ch==='#')fill(quad(Q,.1+xx*.1,.85-yy*.1,.1,.1),'blue',.95)}))}
   else if(v===1){fill(quad(Q,0,0,1,1),'coral',.55,false);for(const[rr,ink]of[[.4,'sun'],[.27,'paper'],[.14,'blue']])shape(ring(Q,.5,.5,rr,rr),ink,.85,.5)}
   else if(v===2){fill(quad(Q,0,0,1,1),'blue',.9,false);shape([Q(0,0),Q(.35,.55),Q(.55,.3),Q(.8,.65),Q(1,.35),Q(1,0)],'teal',.75,.5);dot(...Q(.75,.8),2.2,'sun')}
   else for(let a=0;a<4;a++)for(let b=0;b<4;b++)fill(quad(Q,a*.25,b*.25,.25,.25),['coral','sun','teal','blue'][(a*3+b*5)%4],.5+((a+b)%3)*.2)}},
  neon:{name:'Neon yazı',kind:'wall',variants:4,w:2.5,h:1,draw(P,it){const text=['gm','WAGMI','HODL','to the moon'][it.variant||0],ink=['sun','coral','teal','sun'][it.variant||0],m=P(.5,.5);
   glow(m[0],m[1],44,20,ink,.3);wallText(it.wall,P(.06,.3),text,text.length>5?9:15,ink,'bold');line([P(.04,.16),P(.96,.16)],ink,1.4,.9)}},
  chartBoard:{name:'Mum grafiği',kind:'wall',w:2.5,h:1.5,draw(P){shape(quad(P,0,0,1,1),'paper',1,1.3);lines([1,2,3].map(k=>[P(.05,k*.25),P(.95,k*.25)]),'blue',.5,.2);
   const r=rng(11);let level=.25;for(let k=0;k<11;k++){const up=r()<.68,move=.05+r()*.12,open=level,close=Math.max(.08,Math.min(.88,level+(up?move:-move))),x=.08+k*.08,ink=up?'teal':'coral';
    line([P(x+.025,Math.min(open,close)-.05),P(x+.025,Math.max(open,close)+.05)],ink,.9);shape(quad(P,x,Math.min(open,close),.05,Math.max(.03,Math.abs(close-open))),ink,.8,.5);level=close}}},
  wallShelf:{name:'Duvar rafı',kind:'wall',w:2,h:.75,draw(P){const r=rng(3),inks=['coral','sun','teal','paper'];for(let x=.06;x<.62;){const wd=.04+r()*.04,ht=.5+r()*.35;shape(quad(P,x,.16,wd,ht),inks[Math.floor(r()*4)],.7,.5);x+=wd+.008}
   const[x,y]=P(.82,.16);plantAt(x,y,.42);shape(quad(P,0,.04,1,.12),'coral',.65,.9);lines([[P(.12,.04),P(.12,-.12)],[P(.88,.04),P(.88,-.12)]],'blue',1.6)}},
  stringLights:{name:'Işık zinciri',kind:'wall',w:4,h:.5,draw(P){const wire=Array.from({length:41},(_,k)=>P(k/40,.85-.55*Math.sin(Math.PI*((k/40*3)%1))));line(wire,'blue',.8,.8);
   for(let k=2;k<40;k+=3){const[x,y]=wire[k];dot(x,y+2.5,2,['sun','coral','teal'][(k/3|0)%3])}}}
 });
}
// Shop and catalogue sections.
const CATEGORIES=[['office','Ofis'],['home','Ev'],['kitchen','Mutfak'],['crypto','Kripto'],['decor','Süs'],['wall','Duvar'],['rug','Halı']];
const CATEGORY_OF={bed:'home',sofa:'home',armchair:'home',beanbag:'home',bookshelf:'home',coffeeTable:'home',nightstand:'home',wardrobe:'home',floorLamp:'home',deskLamp:'decor',catSleeping:'decor',cactus:'decor',aquarium:'decor',trashBin:'home',
 fridge:'kitchen',kitchenCounter:'kitchen',coffeeMachine:'kitchen',microwave:'kitchen',pizzaBox:'kitchen',ramen:'kitchen',mug:'kitchen',
 miningRig:'crypto',safe:'crypto',validatorNode:'crypto',hardwareWallet:'crypto',goldBars:'crypto',trophy:'crypto',rocket:'crypto',moonLamp:'decor',diamond:'crypto',spark:'crypto',
 plantSmall:'decor',plantLarge:'decor',books:'decor',headphones:'decor',papers:'decor',floppy:'decor',crate:'home'};
const categoryOf=type=>ITEMS[type].kind==='wall'?'wall':ITEMS[type].kind==='rug'?'rug':CATEGORY_OF[type]||'office';
