# Yerel sürümün yapısı (20 Eylül 2026)

`node server.cjs` → http://127.0.0.1:4173 · Tek dosyalık eski sürüm: `reference-room-single-file.html`.

| Dosya | İçerik |
|---|---|
| `js/engine.js` | `STYLES` (görünümün tamamı), projeksiyon `p()`/`unproject()`, mürekkep ilkelleri (`fill`, `shade`, `line(s)`, `shape`, `box`…), eşya çerçevesi `frame()` / `wallFrame()`, canlı ekranlar |
| `js/items.js` | `ITEMS` kataloğu. Her eşya yerel uzayda **bir kez** çizilir (u: genişlik, v: derinlik, ön yüz +v), dört dönüşte de çalışır |
| `js/items-desk.js` | Çalışma istasyonu: masalar, ekranlar, masaüstü eşyaları |
| `js/items-crypto.js` | Kripto donanımı: madenciler, raflar, ağ, enerji, soğuk cüzdan |
| `js/items-lab.js` | Atölye/laboratuvar + nadir vitrin parçaları |
| `js/items-office.js` | Dinlenme, mutfak köşesi, süs ve tüm duvar eşyaları |
| `js/room.js` | Oda verisi (JSON), yerleşim kuralları `placementOk`, boyama sırası `farToNear`, önbellek + ekran maskeleri |
| `js/game.js` | Oyun katmanı (şimdilik yalnızca tarayıcıda): para, envanter, mağaza + günün fırsatları, günlük ödül, oda puanı + setler, görevler. Sayılar `PRICES`, `SETS`, `QUESTS`, `START` tablolarında. Kayıt: `localStorage['theroom.save.v1']`, oda: `theroom.game.room.v1` |
| `js/generate.js` | Bir sayıdan oda döşeyen ilk kaba üretici (eskizlerde kullanılıyor; cüzdandan oda türetmenin temeli) |
| `js/app.js` | Kamera, kare döngüsü, ölçüm paneli, ekran penceresi, düzenleme modu, panel, marka + profil |

**Oda verisi:** `{v, w, d, items:[{id,type,i,j,r,on?,mode?} | {id,type,wall:'i'|'j',a,z,text?}]}`. `on` = üstünde durduğu eşyanın id'si. Konumlar 0,5 karoya, duvar yüksekliği 0,25'e oturur. `localStorage['theroom.room.v1']` içinde saklanır; `?default` kayıtlı odayı yok sayar.

**Oda boyutu:** Oda 12×12 başlar (`ROOM_SIZE`); açık kenarlardan `ROOM_STEP`=2 karo eklenerek `ROOM_MAX`=18'e kadar büyür (`room.w` i boyunca, `room.d` j boyunca). Motor `ROOM_W`/`ROOM_D` ile çizer, `setRoomSize()` önbellek sınırlarını yeniden hesaplar. Fiyat `js/game.js` → `expansionPrice()`; düzenleme modunda kenarlardaki "+" tutamaçları ve Mağaza sekmesindeki satırlar aynı önizlemeyi (nabız + yürüyen kesik çizgi) tetikler.

**Arayüz:** Sol üstte marka: `paintLogo()` küçük bir odayı motorla çizer, yani logo baskı stiliyle birlikte değişir; yazı ve slogan `index.html` içinde (ürün adını değiştirmek için `<title>`, `h1` ve `#tagline`). Sağ üstte profil: `paintAvatar()` oyuncunun takma adından türeyen aynalı mürekkep ızgarası, yanında ad ve `◉ para · ⌂ oda puanı` (`refreshProfile()`). Oyuncu kimliği `save.player` + `playerTag()` (`js/game.js`); giriş gelene kadar `misafir #xxxx`. Geçici mesajlar alt ortadaki toast'a (`flash()`), kalıcı durum ise alt soldaki ipucu satırına (`showHint()`) gider. Panel sağda profilin altında, telefonda alttan açılan dikey bir sayfa.

**Oda görünümü:** `room.look = {wall, floor, pattern, trim}` ve `room.style` (baskı stili) oda verisinin parçası; `drawShell()` bunlara göre çizer. Seçenekler ve fiyatlar `js/game.js` → `LOOK_OPTIONS`. Panelde "Oda" sekmesi: kilitli seçenek ilk tıkta 7 sn önizlenir (kaydedilmez), ikinci tıkta satın alınır; başka bir işlem önizlemeyi geri alır. Oyun modunda alt çubuktaki stil menüsü gizlidir (stil satın alınır), serbest modda açıktır.

**Katalog:** 137 eşya, tema "kripto ve teknoloji ofisi". Kategoriler `CATEGORIES` + `CATEGORY_OF` (her katalog dosyası kendi eşyalarını ekler), `categoryOf(type)` mağaza ve katalog bölümlerini belirler. Ortak çizim yardımcıları `items.js` içinde: `deskOf`, `plantAt`, `disc`, `facing`, `display`.

**Yeni eşya eklemek:** `ITEMS`'e bir kayıt: `kind` (`floor`/`rug`/`wall`), `w,d,h`, isteğe bağlı `top` (üstüne eşya konabilir), `canStack` (üste konabilir), `modes` (ekranı var), `draw(L,item)`, isteğe bağlı `live(L,item,t)`, `variants: n` (M ile değişen görünüm, `item.variant`), `onFloor` (yerden başlayan duvar eşyası). Duvardan odaya taşan parçalar için `wallFrameOut(it,def)` → `Q(across,up,out)`. Fiyatı `js/game.js` → `PRICES`'a eklemeyi unutma. Çizimde `L.box`, `L.boxes` (uzaktan yakına sıralı), `L.tile`, `L.p`, `L.panel(yüz,…)` + `L.sees(yüz)` kullanılır; yalnızca +i ve +j'ye bakan yüzler görünür.

**Derinlik:** Eşyalar ayak izlerine göre topolojik sıralanır (A, i ya da j boyunca B başlamadan bitiyorsa arkadadır). Canlı ekranın önünde bir şey duruyorsa o ekran için küçük bir siluet maskesi üretilir; içerik geçici bir tuvale çizilip maske oyulduktan sonra yerine konur.

**Modlar:** `/` = oyun (boş oda + başlangıç envanteri). `?sandbox` = serbest çizim tahtası: her eşya sınırsız, "Gece vardiyası" demo odası (`?default`, `?stress`, `?live` de bu moda girer). `?view=front` deneysel karşıdan projeksiyon.

**URL parametreleri:** `sandbox`, `view`, `style`, sayısal stil alanları (`wobble`, `shift`, `patScale`, `soften`, `tw/th/tz`…), `edit`, `default`, `hud`, `stress=N`, `live=N`, `pan`, `legacy`.

**Ölçülen bütçe (RTX 4070S, ~2350×1270):** sabit eşya pratikte sınırsız (yeniden kurulum ~8 ms / 50 eşya); canlı nesnede maliyet mürekkep karışımından (`multiply`) gelir, ~100–150 canlı nesne rahat; kamera hareketinde kareler ~4 ms.

---

# Çizim sistemi incelemesi

Kaynak: https://a-small-light-three.vercel.app/ — 19 Eylül 2026

Tarayıcıda sayfanın inline JavaScript kaynağı, genel görünüm ve kütüphane yakın görünümü incelendi. Bu belge geliştirme için mimari notudur; özgün HTML henüz yerel dosyaya alınmadı. Kaynak deposu ve lisans bağlantısı doğrulanmadı.

## Yapı

- Tek HTML belgesinde CSS, bir `canvas#stage` ve 1.122.573 karakterlik inline JavaScript var. DOM incelemesinde harici script, img veya link bulunmadı.
- Görüntü Canvas 2D ile prosedürel üretiliyor. Temel çizim araçları çokgen, çizgi, elips, eğri, tarama, nokta, kırpma ve renk üst baskısı.
- `ROOMS` içinde 25 oda var: library, engines, loom, constellations, greenhouse, kite, hello, lighthouse, map, skyblue, terminal, kitchen, bridge, arch, wheel, lab, cranes, blot, record, press, apartments, bigroom, tide, well, door.
- Varsayılan yerleşim 5 sütun; odalar satırlar arasında yön değiştirerek sıralanıyor. Oda yerleşim aralığı `PITCH=16`, varsayılan oda boyutu 12×12.

## Koordinatlar ve nesneler

`TW=64`, `TH=32`, `TZ=32`:

```js
x = (i - j) * 32;
y = (i + j) * 16 - z * 32;
```

`mkHand()` çizim araçlarını `H` nesnesinde toplar. `H.p(i,j,z)` oda koordinatını ekran düzlemine taşır. `H.tile`, `H.faceI`, `H.faceJ` zemin ve dikey yüzleri üretir. `boxAt` bir kutuyu üst, iki yan yüz, gölge ve kontur olarak çizer. `slab`, `backWalls`, `windowOn`, `shelfOn`, `plant` gibi yardımcılar ortak nesne dilini kurar.

## Baskı ve el çizimi görünümü

- Kâğıt: RGB(243,235,221). Mürekkepler: blue (52,74,128), coral (238,104,82), sun (255,212,40), teal (0,140,138).
- `patternCanvas()` 20 ton seviyesinde noktalı tram desenleri üretir. Düşük tonlarda renkli noktalar; yüksek tonlarda dolu mürekkebin içinden açılmış delikler kullanılır. Küçük silintiler baskı kusurlarını oluşturur.
- Tram açıları blue 15°, coral 75°, sun 0°, teal 45°. `PLATE` ve varyant sapmaları renk kalıplarını hafifçe kaydırır.
- `printInk()` renkleri `multiply` ile üst üste basar. `H.knock()` önce kâğıt rengiyle alt görüntüyü kapatır; `H.fill()` varsayılan olarak bu işlemi yapar; `H.tint()` mevcut görüntünün üzerine mürekkep basar.
- `H.line()` çizgiyi eşit aralıklarla örnekler, `H.wob()` çizgiye dik yönde küçük sinüzoidal sapmalar ekler. Chaikin yumuşatması ve değişken genişlikli `ribbon()` organik şekilleri destekler.
- `streamOf()` anahtarlardan deterministik rastgele akış üretir; oda kimliği, nesne grubu ve baskı varyantı aynı detayların tutarlı kalmasını sağlar.
- Kâğıt zemindeki benek ve lifler de kodla çizilir.

## Oda katmanları ve animasyon

Bir oda `room({id, order, under, live, over, figures})` ile tanımlanır.

1. `under`: zemin, duvar, sabit eşyalar; önbelleğe alınır.
2. `live`: zamana bağlı ışık, eşya ve efektler. Doğrudan çizim yapabilir veya `H.at()` ile derinlik sırasına girebilir.
3. `H.at()` parçaları ve `figures`: `i+j+z*.001` anahtarıyla sıralanır.
4. `over`: en öndeki sabit öğeler; önbellekten çizilir.

Katman sırası tek başına tüm örtüşmeleri çözmez: masa, kapı ve benzeri nesneler için odaya özgü kırpma maskeleri de kullanılır.

İnsanlar hazır sprite değil; gövde, baş, kol ve bacak eklemlerinden çizilir. `FIGURES.clips` içindeki pozlar arasında smoothstep geçişi yapılır. `walk`, `read`, `type`, `sleep` vb. ortak kliplerin yanında özel oda klipleri bulunur. `move(t)` konum, poz, yön, görünürlük ve aksesuarları değiştirir. Örneğin kütüphane 16 saniyelik özel bir döngü kullanır.

Sahne zamanı 12 adım/saniyeye yuvarlanır; `boil` her dört adımda değişir. Yakın odalarda üç baskı varyantı, genel görünümde genellikle tek varyant kullanılır. Gerçek çizim hızı yüke göre daha düşük olabilir.

## Performans

- `under/over` çizimleri önce işlem listesine kaydedilir, küçük zaman bütçeleriyle arka plan canvas'larına işlenir.
- Önbellek anahtarı katman, varyant, çözünürlük kovası ve DPR içerir. Kovalar .5, 1, 2, 3; DPR en fazla 2.
- Önbellek bütçesi masaüstünde 320 MiB, mobilde 160 MiB. Uzak/eski katmanlar gerektiğinde atılır.
- Görünmeyen odalar ve çizim alanı dışındaki öğeler elenir. Kamera hareketinde mevcut sahne resmi kaydırılıp ölçeklenir; ayrıntılı yeniden çizim ayrı hızda yapılır.

## Kamera ve inceleme adresleri

- Sürükleme: ataletli kaydırma; tekerlek: imlecin çevresinde zoom; iki parmak: pinch zoom.
- Çift tıklama: seçilen odaya yaklaşma; WASD/oklar: kaydırma; +/-: zoom; 0: bütünü sığdırma.
- Otomatik tur odalar arasında gezer; etkileşimden sonra 30 saniye bekler.
- `?room=library&nowander`: kütüphaneyi sabit kamera ile açar.
- `?fit&nowander`: tüm yerleşim.
- `?room=library&nowander&t=8&variant=0`: zaman ve baskı varyantını sabitleyerek karşılaştırma.
- Diğer kaynakta görülen parametreler: `zoom`, `focus`, `cols`, `instant`, `dumperrors`.

## Geliştirme yaklaşımı

İlk değişiklik tek oda üzerinde yapılmalı. Yeni eşya oda koordinatları ve mevcut `H` araçlarıyla çizilmeli; sabit parçalar `under/over`, hareketli parçalar `live/figures` içinde tutulmalı. Derinlik ve kırpma özellikle kontrol edilmeli. Stil devamlılığı için mevcut mürekkep paleti, tram, kalıp kayması ve çizgi sapması korunmalı. Önce yakın görünüm, sonra tüm odalar görünürken performans kontrol edilmeli.

Bu incelemede uygulama değiştirilmedi. Kütüphane incelemesinde tarayıcının yakaladığı hata/uyarı listesi boştu; tüm odaların bütün animasyon döngüleri henüz test edilmedi.
