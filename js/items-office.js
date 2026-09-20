'use strict';
// The rest of the office: lounge, kitchenette, decoration and everything that hangs on a wall.
//   variants: n  → the item comes in n looks (item.variant), switched with M in the editor
//   onFloor      → a wall item that always starts at the floor (a door)
// Wall items are drawn with P(across, up); those that stick out into the room use Q(across, up, out) from wallFrameOut.
{
 const shelfBooks=(P,seed,x0,x1,y,h)=>{const r=rng(seed),inks=['coral','sun','teal','paper'];
  for(let x=x0;x<x1;){const w=.035+r()*.05,ht=h*(.6+r()*.4);if(r()<.85)shape(quad(P,x,y,w,ht),inks[Math.floor(r()*4)],.55+r()*.35,.45);x+=w+.006}};

 Object.assign(ITEMS,{
  // ---- lounge ----
  sofa:{name:'Kanepe',kind:'floor',w:3,d:1.5,h:1.25,draw(L){L.boxes([[0,0,3,.4,0,1.25,'teal',.8],[0,.4,3,1.1,0,.45,'teal',.75],[0,.4,.35,1.1,.45,.4,'teal',.8],[2.65,.4,.35,1.1,.45,.4,'teal',.8],[.4,.45,1.1,1,.45,.17,'coral',.6],[1.5,.45,1.1,1,.45,.17,'coral',.6]])}},
  armchair:{name:'Berjer',kind:'floor',w:1.5,d:1.5,h:1.2,draw(L){L.boxes([[0,0,1.5,.4,0,1.2,'sun',.7],[0,.4,1.5,1.1,0,.42,'sun',.65],[0,.4,.3,1.1,.42,.38,'sun',.7],[1.2,.4,.3,1.1,.42,.38,'sun',.7],[.34,.45,.82,1,.42,.16,'paper',.9]])}},
  beanbag:{name:'Armut koltuk',kind:'floor',w:1.5,d:1.5,h:.8,draw(L){const[x,y]=L.p(.75,.75);shape(ellipse(x,y-9,30,17),'coral',.7);shade(ellipse(x+5,y-3,24,11).slice(0,17),.22);shape(ellipse(x-3,y-17,17,8),'coral',.5,.7)}},
  coffeeTable:{name:'Sehpa',...deskOf(2,1,.45,'sun','blue')},
  bookshelf:{name:'Kitaplık',kind:'floor',w:2,d:.5,h:2.6,top:2.6,draw(L){L.box(0,.05,2,.45,0,2.6,'coral',.6);const P=facing(L,.08,.505,.08,1.84,2.44);if(!P)return;
   shape(quad(P,0,0,1,1),'blue',.92,.8);for(let row=0;row<4;row++){const y=row*.25;fill(quad(P,0,y,1,.02),'coral',.6);shelfBooks(P,7+row,.03,.9,y+.02,.21)}}},

  meetingTable:{name:'Toplantı masası',kind:'floor',w:3,d:2,h:1,top:1,draw(L){
   L.boxes([[1.2,.7,.6,.6,0,.1,'blue',.85],[1.34,.84,.32,.32,.1,.77,'blue',.9]]);
   shape(L.tile(0,0,3,2,.87),'teal',.22);line(L.tile(0,0,3,2,.875),'blue',1.1,.8,true);
   line(L.tile(.12,.12,2.76,1.76,.878),'paper',.8,.5,true);
   for(const[u,v]of[[.6,.35],[2.4,.35],[.6,1.65],[2.4,1.65]])fill(L.tile(u-.22,v-.14,.44,.28,.882),'paper',.7,false)}},

  phoneBooth:{name:'Telefon kabini',kind:'floor',w:1.5,d:1.5,h:2.6,top:2.6,draw(L){
   L.boxes([[0,0,1.5,.12,0,2.6,'blue',.85],[0,0,.12,1.5,0,2.6,'blue',.85],[1.38,0,.12,1.5,0,2.6,'blue',.85],[0,1.38,1.5,.12,0,.3,'blue',.85],[0,0,1.5,1.5,2.6,.1,'coral',.6]]);
   const P=L.sees('front')?L.panel('front',.12,1.44,.3,1.26,2.3):null;
   if(P){fill(quad(P,0,0,1,1),'teal',.14,false);line(quad(P,.03,.02,.94,.96),'paper',1.4,.7,true);line([P(.5,.02),P(.5,.98)],'paper',1.2,.6);dot(...P(.44,.42),1.6,'sun')}
   L.box(.2,.2,.9,.5,.5,.06,'paper',.9);L.box(.75,.3,.3,.3,.56,.3,'blue',.8)}},

  lockers:{name:'Dolaplar',kind:'floor',w:1.5,d:.5,h:2,top:2,draw(L){
   L.box(.03,.05,1.44,.42,0,2,'teal',.6);
   const P=facing(L,.03,.47,0,1.44,2);if(!P)return;
   for(let k=0;k<3;k++)for(let r=0;r<2;r++){shape(quad(P,.04+k*.32,.04+r*.48,.28,.44),'teal',.5,.5);
    lines([0,1,2].map(n=>[P(.1+k*.32,.4+r*.48-n*.025),P(.22+k*.32,.4+r*.48-n*.025)]),'blue',.8,.7);dot(...P(.24+k*.32,.2+r*.48),1,'sun')}}},

  waterCooler:{name:'Su sebili',kind:'floor',w:.5,d:.5,h:1.5,draw(L){
   L.box(.07,.08,.36,.34,0,.95,'paper',.9);
   const[x,y]=L.p(.25,.25,.95);shape([[x-9,y-2],[x+9,y-2],[x+7,y-20],[x-7,y-20]],'teal',.35);shape(ellipse(x,y-20,7,2.6),'teal',.5,.6);
   const P=facing(L,.07,.42,0,.36,.95);if(!P)return;
   shape(quad(P,.3,.42,.4,.16),'blue',.85,.5);for(let k=0;k<2;k++)dot(...P(.38+k*.24,.5),1.2,k?'teal':'coral');
   shape(quad(P,.32,.08,.36,.2),'blue',.5,.4)}},

  miniFridge:{name:'Mini buzdolabı',kind:'floor',w:1,d:1,h:1,top:1,draw(L){
   L.box(.08,.1,.84,.82,0,1,'paper',.9);
   const P=facing(L,.08,.92,0,.84,1);if(!P)return;
   line([P(0,.7),P(1,.7)],'blue',1.1);lines([[P(.12,.76),P(.12,.92)],[P(.12,.24),P(.12,.58)]],'blue',2);
   fill(quad(P,.4,.78,.34,.14),'coral',.5,false);dot(...P(.8,.84),1.2,'sun')}},

  vendingMachine:{name:'Otomat',kind:'floor',w:1,d:1,h:2.2,top:2.2,draw(L){
   L.box(.05,.1,.9,.84,0,2.2,'coral',.65);
   const P=facing(L,.1,.945,.05,.8,2.1);if(!P)return;
   shape(quad(P,.04,.3,.62,.66),'blue',.9,.7);fill(quad(P,.06,.32,.58,.62),'teal',.2,false);
   for(let r=0;r<4;r++){line([P(.06,.34+r*.155),P(.64,.34+r*.155)],'paper',.8,.5);
    for(let k=0;k<4;k++)fill(quad(P,.09+k*.14,.36+r*.155,.09,.1),['sun','coral','paper','teal'][(k+r)%4],.7)}
   for(let r=0;r<4;r++)for(let k=0;k<2;k++)shape(quad(P,.72+k*.12,.62+r*.09,.09,.06),'paper',.85,.4);
   shape(quad(P,.7,.32,.26,.2),'blue',.85,.5);shape(quad(P,.06,.06,.5,.18),'blue',.7,.5);dot(...P(.82,.5),1.2,'sun')}},

  arcade:{name:'Arcade makinesi',kind:'floor',modes:true,w:1,d:1,h:2,top:2,draw(L,it){
   L.boxes([[.06,.12,.88,.8,0,1.1,'coral',.7],[.06,.12,.88,.8,1.1,.9,'blue',.85]]);
   const P=facing(L,.06,.93,1.1,.88,.9);
   if(P){screenOn((x,y)=>P(.08+x*.84,.3+y*.6),it.mode||'orbit','paper',.9);
    fill(quad(P,.1,.06,.7,.16),'sun',.6,false)}
   const T=L.sees('front')?L.tile(.14,.24,.72,.34,1.115):null;
   if(T){shape(T,'blue',.6);const[x,y]=L.p(.34,.4,1.12);line([[x,y],[x-1,y-9]],'coral',2.6);dot(x-1,y-11,2.6,'coral');
    for(let k=0;k<3;k++)dot(...L.p(.58+k*.1,.4,1.12),1.6,['sun','teal','coral'][k])}}},

  foosball:{name:'Langırt',kind:'floor',w:2.5,d:1.5,h:1,top:1,draw(L){
   L.boxes([[.1,.1,.2,.2,0,.85,'blue',.85],[2.2,.1,.2,.2,0,.85,'blue',.85],[.1,1.2,.2,.2,0,.85,'blue',.85],[2.2,1.2,.2,.2,0,.85,'blue',.85],[0,0,2.5,1.5,.85,.13,'coral',.6]]);
   fill(L.tile(.12,.12,2.26,1.26,.985),'teal',.45,false);line(L.tile(.12,.12,2.26,1.26,.99),'paper',1,.8,true);
   line([L.p(1.25,.12,.99),L.p(1.25,1.38,.99)],'paper',.9,.7);
   for(let k=0;k<6;k++){const u=.35+k*.36;line([L.p(u,-.1,1.07),L.p(u,1.6,1.07)],'blue',2.2);
    for(let n=0;n<3;n++)L.box(u-.05,.3+n*.42,.1,.14,1,.12,k%2?'sun':'coral',.85)}
   dot(...L.p(1.25,.75,.995),1.6,'paper')}},

  roomba:{name:'Robot süpürge',kind:'floor',canStack:true,w:.5,d:.5,h:.15,draw(L){
   shape(disc(L,.25,.25,.21,0,20,.55),'blue',.88);line(disc(L,.25,.25,.13,.11,16,.55),'paper',.8,.6,true);
   dot(...L.p(.25,.25,.115),1.6,'teal');dot(...L.p(.25,.12,.115),1.1,'coral')}},

  hydroRack:{name:'Hidroponik raf',kind:'floor',w:1.5,d:.5,h:1.8,top:1.8,draw(L){
   L.boxes([[.03,.05,.1,.4,0,1.8,'blue',.85],[1.37,.05,.1,.4,0,1.8,'blue',.85],
    ...[0,1,2].map(k=>[.03,.05,1.44,.4,.5+k*.6,.06,'blue',.7])]);
   for(let r=0;r<3;r++){const z=.56+r*.6;
    fill(L.tile(.1,.1,1.3,.3,z),'teal',.3,false);
    for(let k=0;k<5;k++){const[x,y]=L.p(.24+k*.25,.25,z);
     for(let n=0;n<3;n++){const a=-Math.PI/2+(n-1)*.7;line([[x,y],[x+Math.cos(a)*6,y+Math.sin(a)*7]],'teal',2,.85)}}
    if(r<2){const[gx,gy]=L.p(.75,.25,z+.52);line([L.p(.1,.25,z+.54),L.p(1.4,.25,z+.54)],'coral',2.6,.8);glow(gx,gy+6,34,7,'coral',.16)}}}},

  coffeeMachine:{name:'Kahve makinesi',kind:'floor',canStack:true,w:.5,d:.5,h:.6,draw(L){L.boxes([[.08,.06,.34,.2,0,.55,'blue',.85],[.08,.26,.34,.18,0,.08,'blue',.8],[.08,.26,.34,.18,.42,.13,'blue',.85]]);
   const[x,y]=L.p(.25,.36,.08);shape(rect(x-3,y-6,6,6),'paper',1,.6);dot(...L.p(.25,.45,.5),1.1,'coral')}},
  microwave:{name:'Mikrodalga',kind:'floor',canStack:true,top:.5,w:1,d:.5,h:.5,draw(L){L.box(.04,.05,.92,.4,0,.45,'paper',.9);const P=facing(L,.04,.45,0,.92,.45);if(!P)return;
   shape(quad(P,.06,.15,.6,.7),'blue',.92,.6);fill(quad(P,.1,.22,.52,.2),'sun',.35,false);for(let k=0;k<3;k++)dot(...P(.82,.72-k*.24),1.2,k?'blue':'coral')}},
  pizzaBox:{name:'Pizza kutusu',kind:'floor',canStack:true,w:.5,d:.5,h:.08,draw(L){L.box(.03,.03,.44,.44,0,.06,'paper',.9);shape(disc(L,.25,.25,.13,.064,14),'coral',.8,.5);fill(disc(L,.25,.25,.06,.066,10),'sun',.9)}},
  ramen:{name:'Hazır erişte',kind:'floor',canStack:true,w:.5,d:.5,h:.35,draw(L){const[x,y]=L.p(.25,.25);shape([[x-6,y-10],[x+6,y-10],[x+4,y],[x-4,y]],'paper',1);fill([[x-5.6,y-8],[x+5.6,y-8],[x+5,y-4],[x-5,y-4]],'coral',.75,false);
   shape(ellipse(x,y-10,6,2.4),'sun',.6,.6);lines([[[x-1,y-10],[x+8,y-19]],[[x+1,y-10],[x+10,y-18]]],'blue',1)}},

  // ---- decoration ----
  floorLamp:{name:'Ayaklı lamba',kind:'floor',w:.5,d:.5,h:2.1,draw(L){const a=L.p(.25,.25,0),b=L.p(.25,.25,1.75);glow(b[0],b[1]+6,30,18,'sun',.3);shape(ellipse(a[0],a[1],7,3.5),'blue',.85);line([a,b],'blue',2.2);
   shape([[b[0]-10,b[1]+3],[b[0]+10,b[1]+3],[b[0]+6,b[1]-12],[b[0]-6,b[1]-12]],'sun',.75)}},
  deskLamp:{name:'Masa lambası',kind:'floor',canStack:true,w:.5,d:.5,h:.75,draw(L){const[x,y]=L.p(.25,.25);glow(x+6,y-6,13,7,'sun',.3);shape(ellipse(x,y,5,2.4),'blue',.85);line([[x,y-1],[x-3,y-12],[x+5,y-19]],'blue',1.8);
   shape([[x+1,y-22],[x+10,y-18],[x+8,y-13],[x+2,y-17]],'coral',.8)}},
  catSleeping:{name:'Uyuyan kedi',kind:'floor',canStack:true,w:1,d:.5,h:.35,draw(L){const[x,y]=L.p(.5,.25);line([[x+9,y-3],[x+15,y-1],[x+16,y-6]],'sun',3,.9);
   shape(ellipse(x+1,y-5,11,6),'sun',.75);shape(ellipse(x-9,y-5,5.5,4.8),'sun',.75);shape([[x-13,y-8],[x-12,y-13],[x-9,y-9]],'sun',.85,.7);shape([[x-8,y-9],[x-5,y-13],[x-5,y-8]],'sun',.85,.7);
   lines([[[x-11,y-5],[x-9.5,y-4.4]],[[x-7.5,y-4.4],[x-6,y-5]]],'blue',.8)}},
  cactus:{name:'Kaktüs',kind:'floor',canStack:true,w:.5,d:.5,h:.8,draw(L){const[x,y]=L.p(.25,.25);shape([[x-5,y-8],[x+5,y-8],[x+4,y],[x-4,y]],'coral',.75);
   shape(ellipse(x,y-16,4,9),'teal',.75);line([[x-4,y-13],[x-8,y-14],[x-8,y-19]],'teal',3,.85);line([[x+4,y-16],[x+8,y-17],[x+8,y-21]],'teal',3,.85);dot(x,y-25,1.4,'coral')}},
  aquarium:{name:'Akvaryum',kind:'floor',canStack:true,w:1.5,d:.5,h:.9,draw(L){L.box(.05,.05,1.4,.4,0,.85,'teal',.3);L.box(.03,.03,1.44,.44,.85,.05,'blue',.85);const P=facing(L,.05,.455,0,1.4,.85);if(!P)return;
   fill(quad(P,0,0,1,.12),'sun',.6);lines([[P(.12,.12),P(.1,.5)],[P(.16,.12),P(.19,.42)],[P(.85,.12),P(.88,.55)]],'teal',1.6,.9);
   for(const[fx,fy,ink,dir]of[[.35,.6,'coral',1],[.62,.38,'sun',-1],[.74,.7,'coral',1]]){shape(ring(P,fx,fy,.055,.06,12),ink,.85,.5);shape([P(fx-dir*.05,fy),P(fx-dir*.1,fy+.07),P(fx-dir*.1,fy-.07)],ink,.85,.5)}
   for(const[bx,by]of[[.5,.75],[.52,.85],[.27,.8]])line(ring(P,bx,by,.012,.018,8),'paper',.6,.8,true)}},
  trashBin:{name:'Çöp kutusu',kind:'floor',w:.5,d:.5,h:.7,draw(L){const[x,y]=L.p(.25,.25);shape([[x-6,y-15],[x+6,y-15],[x+5,y],[x-5,y]],'blue',.6);lines([[[x-2,y-13],[x-2,y-2]],[[x+2,y-13],[x+2,y-2]]],'paper',.6,.4);
   shape(ellipse(x,y-15,6,2.6),'blue',.85,.6);for(const[dx,dy]of[[-3,-17],[2,-18],[0,-20]])shape([[x+dx-3,y+dy],[x+dx,y+dy-3],[x+dx+3,y+dy-1],[x+dx+2,y+dy+2],[x+dx-2,y+dy+2]],'paper',1,.6)}},
  rugRound:{name:'Yuvarlak halı',kind:'rug',w:3,d:3,h:.03,draw(L){shape(disc(L,1.5,1.5,1.45,.015,36),'sun',.45);line(disc(L,1.5,1.5,1.15,.02,36),'coral',1.2,.8,true);line(disc(L,1.5,1.5,.6,.02,28),'coral',.9,.6,true)}},
  projector:{name:'Projektör',kind:'floor',canStack:true,w:.5,d:.5,h:.25,draw(L){
   L.box(.06,.1,.38,.3,.04,.18,'paper',.9);L.box(.14,.14,.08,.06,0,.04,'blue',.8);L.box(.28,.14,.08,.06,0,.04,'blue',.8);
   const P=facing(L,.06,.4,.04,.38,.18);if(!P)return;shape(ring(P,.3,.5,.22,.3),'blue',.9,.5);dot(...P(.3,.5),1.4,'teal');dot(...P(.8,.75),.9,'coral')}},

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
  wallShelf:{name:'Duvar rafı',kind:'wall',w:2,h:.75,draw(P){shelfBooks(P,3,.06,.62,.16,.85);
   const[x,y]=P(.82,.16);plantAt(x,y,.42);shape(quad(P,0,.04,1,.12),'coral',.65,.9);lines([[P(.12,.04),P(.12,-.12)],[P(.88,.04),P(.88,-.12)]],'blue',1.6)}},
  stringLights:{name:'Işık zinciri',kind:'wall',w:4,h:.5,draw(P){const wire=Array.from({length:41},(_,k)=>P(k/40,.85-.55*Math.sin(Math.PI*((k/40*3)%1))));line(wire,'blue',.8,.8);
   for(let k=2;k<40;k+=3){const[x,y]=wire[k];dot(x,y+2.5,2,['sun','coral','teal'][(k/3|0)%3])}}},

  projectorScreen:{name:'Projeksiyon perdesi',kind:'wall',w:3,h:2,draw(P){shape(quad(P,0,.88,1,.12),'blue',.85,1);
   shape(quad(P,.04,.06,.92,.82),'paper',1,.9);fill(quad(P,.08,.1,.84,.74),'teal',.12,false);
   shape(quad(P,.16,.2,.36,.28),'coral',.5,.6);shape(ring(P,.68,.58,.12,.14),'sun',.6,.6);
   lines([0,1,2].map(k=>[P(.16,.62+k*.07),P(.5,.62+k*.07)]),'blue',1,.5)}},

  ticker:{name:'Fiyat bandı',kind:'wall',w:4,h:.5,draw(P,it){const Q=wallFrameOut(it,ITEMS.ticker);
   shape([Q(0,0,0),Q(1,0,0),Q(1,0,.12),Q(0,0,.12)],'blue',.92,1);
   shape([Q(0,0,.12),Q(1,0,.12),Q(1,1,.12),Q(0,1,.12)],'blue',.96,1);
   shape([Q(0,1,0),Q(1,1,0),Q(1,1,.12),Q(0,1,.12)],'blue',.8,1)},
   live(P,it,t){const Q=wallFrameOut(it,ITEMS.ticker),face=(x,y)=>Q(x,y,.12);
    clip([face(.01,.08),face(.99,.08),face(.99,.92),face(.01,.92)],()=>{
     const off=1.1-((t*.07)%2.2);
     wallText(it.wall,face(off,.3),'BTC +2.4%   ETH +1.1%   SOL -0.6%   NVDA +3.2%   SPY +0.4%',7,'sun','bold')})}},

  orderBook:{name:'Emir defteri',kind:'wall',w:1.5,h:2,draw(P,it){shape(quad(P,0,0,1,1),'blue',.95,1.1);
   line([P(.06,.5),P(.94,.5)],'paper',1.2,.7);
   const r=rng(23);
   for(let k=0;k<9;k++){const w=.2+r()*.6;fill(quad(P,.06,.53+k*.05,w*.86,.035),'teal',.55+r()*.35,false);line([P(.06,.545+k*.05),P(.2,.545+k*.05)],'paper',.5,.4)}
   for(let k=0;k<9;k++){const w=.2+r()*.6;fill(quad(P,.06,.44-k*.05,w*.86,.035),'coral',.55+r()*.35,false);line([P(.06,.455-k*.05),P(.2,.455-k*.05)],'paper',.5,.4)}
   wallText(it.wall,P(.08,.94),'ORDER BOOK',5,'paper')}},

  blockHeight:{name:'Blok sayacı',kind:'wall',w:2,h:.75,draw(P,it){shape(quad(P,0,0,1,1),'blue',.94,1.1);shape(quad(P,.04,.08,.92,.84),'blue',1,.6);
   wallText(it.wall,P(.06,.72),'BLOCK HEIGHT',4.5,'teal')},
   live(P,it,t){const n=(920144+Math.floor(t*.6)).toLocaleString('en-US');
    wallText(it.wall,P(.07,.26),n,9.5,'sun','bold');const[x,y]=P(.88,.42);dot(x,y,1.8,Math.floor(t*1.2)%2?'coral':'teal')}},

  halvingClock:{name:'Halving geri sayımı',kind:'wall',w:2,h:1,draw(P,it){shape(quad(P,0,0,1,1),'paper',1,1.2);
   wallText(it.wall,P(.07,.74),'NEXT HALVING',4.5,'blue');
   for(let k=0;k<4;k++){shape(quad(P,.06+k*.23,.18,.19,.44),'blue',.92,.6);wallText(it.wall,P(.09+k*.23,.3),['412','06','19','44'][k],8,'sun','bold')}
   for(let k=0;k<3;k++)wallText(it.wall,P(.252+k*.23,.34),':',7,'blue')}},

  worldClocks:{name:'Dünya saatleri',kind:'wall',w:3,h:1,draw(P,it){
   for(let k=0;k<3;k++){const cx=.18+k*.32,a=[1.8,3.6,5.4][k];
    shape(ring(P,cx,.58,.11,.26,28),'paper',1,1.1);
    for(let n=0;n<12;n++){const ang=n/12*TAU;dot(...P(cx+Math.sin(ang)*.08,.58+Math.cos(ang)*.19),.7,'blue')}
    line([P(cx,.58),P(cx+Math.sin(a)*.06,.58+Math.cos(a)*.14)],'blue',1.4);
    line([P(cx,.58),P(cx+Math.sin(a*2.1)*.085,.58+Math.cos(a*2.1)*.2)],'coral',1);
    wallText(it.wall,P(cx-.07,.1),['NY','LDN','TYO'][k],5,lightWalls()?'blue':'paper')}}},

  whiteboard:{name:'Beyaz tahta',kind:'wall',w:3,h:2,draw(P){shape(quad(P,0,0,1,1),'paper',1,1.4);
   shape(quad(P,.15,.62,.2,.22),'blue',.7,.7);shape(quad(P,.45,.62,.2,.22),'coral',.7,.7);
   lines([[P(.35,.73),P(.45,.73)],[P(.65,.73),P(.78,.66)]],'blue',1.2);
   for(let k=0;k<3;k++)line([P(.2,.5-k*.08),P(.5+k*.12,.5-k*.08)],'blue',1,.7);
   const pie=P(.78,.4);shape(ring(P,.78,.4,.1,.15),'teal',.6,.7);shape([pie,P(.78,.55),P(.88,.48)],'sun',.85,.6);
   for(let k=0;k<4;k++)line([P(.18+k*.06,.14),P(.22+k*.06,.14)],['coral','teal','sun','blue'][k],3.4,.9)}},

  whitepaper:{name:'Çerçeveli whitepaper',kind:'wall',w:1,h:1.5,draw(P,it){shape(quad(P,.04,.04,.92,.92),'blue',.85,1.3);shape(quad(P,.12,.12,.76,.76),'paper',1,.6);
   wallText(it.wall,P(.2,.78),'Bitcoin',4.5,'blue');
   for(let k=0;k<9;k++)line([P(.18,.72-k*.06),P(.18+(k%3===2?.38:.62),.72-k*.06)],'blue',.6,.5);
   for(let k=0;k<5;k++)line([P(.22,.2-k*.03),P(.62,.2-k*.03)],'blue',.5,.35)}},

  securityCam:{name:'Güvenlik kamerası',kind:'wall',w:.5,h:.5,draw(P,it){const Q=wallFrameOut(it,ITEMS.securityCam);
   shape([Q(.35,.82,0),Q(.65,.82,0),Q(.65,.82,.14),Q(.35,.82,.14)],'blue',.85,1);
   shape([Q(.3,.3,.14),Q(.7,.3,.14),Q(.7,.72,.14),Q(.3,.72,.14)],'blue',.9,1);
   shape([Q(.7,.3,.14),Q(.7,.3,.4),Q(.7,.72,.4),Q(.7,.72,.14)],'blue',.75,1);
   const[x,y]=Q(.7,.5,.32);shape(ellipse(x,y,3.4,4.4),'teal',.6,.6);dot(x,y,1.4,'paper');
   const[lx,ly]=Q(.36,.66,.16);dot(lx,ly,1.2,'coral')}},

  cardReader:{name:'Kartlı geçiş',kind:'wall',w:.5,h:.75,draw(P,it){const Q=wallFrameOut(it,ITEMS.cardReader);
   shape([Q(.24,.16,.06),Q(.76,.16,.06),Q(.76,.86,.06),Q(.24,.86,.06)],'paper',.95,1.1);
   shape([Q(.76,.16,0),Q(.76,.16,.06),Q(.76,.86,.06),Q(.76,.86,0)],'blue',.7,.9);
   const R=(x,y)=>Q(.24+x*.52,.16+y*.7,.06);
   fill(quad(R,.12,.62,.76,.24),'teal',.45,false);
   for(let k=0;k<3;k++)line([R(.22,.52-k*.05),R(.78,.52-k*.05)],'blue',.8,.6);
   dot(...R(.5,.16),1.4,'teal')}},

  ledStrip:{name:'LED şerit',kind:'wall',w:4,h:.25,draw(P,it){const Q=wallFrameOut(it,ITEMS.ledStrip);
   shape([Q(0,.3,.05),Q(1,.3,.05),Q(1,.7,.05),Q(0,.7,.05)],'blue',.8,.8);
   const[x1,y1]=Q(0,.5,.06),[x2,y2]=Q(1,.5,.06);
   for(let k=0;k<24;k++){const f=k/23;glow(x1+(x2-x1)*f,y1+(y2-y1)*f,9,6,['coral','sun','teal'][k%3],.16)}
   line([Q(0,.5,.06),Q(1,.5,.06)],'sun',1.6,.9)}},

  plaques:{name:'Ödül plaketleri',kind:'wall',w:2,h:1,draw(P,it){
   for(let k=0;k<3;k++){const x=.06+k*.32;shape(quad(P,x,.2,.26,.6),'blue',.9,1.1);shape(quad(P,x+.03,.26,.2,.48),'sun',.75,.5);
    line(ring(P,x+.13,.5,.06,.14,16),'coral',1,.8,true);wallText(it.wall,P(x+.05,.06),['#1','x10','ATH'][k],4.5,lightWalls()?'blue':'paper')}}},

  vent:{name:'Havalandırma',kind:'wall',w:1,h:.5,draw(P,it){const Q=wallFrameOut(it,ITEMS.vent);
   shape([Q(.04,.1,.04),Q(.96,.1,.04),Q(.96,.9,.04),Q(.04,.9,.04)],'blue',.75,1.1);
   for(let k=0;k<5;k++){const y=.2+k*.15;shape([Q(.1,y,.04),Q(.9,y,.04),Q(.9,y+.06,.02),Q(.1,y+.06,.02)],'blue',.5,.6)}
   for(const[x,y]of[[.07,.13],[.93,.13],[.07,.87],[.93,.87]])dot(...Q(x,y,.045),.8,'paper')}}
 });
}
Object.assign(CATEGORY_OF,{sofa:'lounge',armchair:'lounge',beanbag:'lounge',coffeeTable:'lounge',bookshelf:'lounge',meetingTable:'lounge',phoneBooth:'lounge',
 lockers:'lounge',waterCooler:'lounge',miniFridge:'lounge',vendingMachine:'lounge',arcade:'lounge',foosball:'lounge',roomba:'lounge',hydroRack:'lounge',
 coffeeMachine:'lounge',microwave:'lounge',pizzaBox:'lounge',ramen:'lounge',
 floorLamp:'decor',deskLamp:'decor',catSleeping:'decor',cactus:'decor',aquarium:'decor',trashBin:'decor',projector:'decor'});
