# Yapılacaklar (PWA)

İnternetsiz çalışan, telefondan açılabilen basit bir yapılacaklar listesi. Playwright MCP'yi denemek için yapıldı.

- Saf HTML/CSS/JS, build adımı yok
- Service worker ile çevrimdışı çalışır, telefona "Ana ekrana ekle" ile kurulabilir
- Veriler tarayıcıda (`localStorage`) saklanır
- Test için önemli öğelerde `data-testid` nitelikleri var

## Özellikler

- Görev ekleme, tamamlama, silme; Tümü / Aktif / Tamamlanan filtreleri
- Son tarih ve öncelik (Düşük / Normal / Yüksek); gecikenler kırmızı "Gecikti" etiketiyle görünür
- Yerinde düzenleme: ✎ düğmesi ya da metne çift tıklama (Enter kaydeder, Esc iptal eder)
- Sürükle-bırak sıralama: ⠿ tutamacından sürükle (fare + dokunmatik) ya da tutamaç odaktayken ↑/↓
- Silince 6 saniyelik "Geri al" bildirimi (tek görev ve "Tamamlananları sil" için)
- Arama ve görünen görevlerin hepsini tamamla / geri al

## Dosya yapısı

```
index.html            Sayfa iskeleti
sw.js                 Service worker (çevrimdışı önbellek)
css/
  base.css            Renk değişkenleri, açık/koyu tema, genel düzen
  controls.css        Form alanları, düğmeler, arama/filtre ve alt çubuk
  todos.css           Görev satırları, etiketler, sürükleme, düzenleme formu
  toast.css           "Geri al" bildirimi
js/
  main.js             Giriş noktası: listenin dışındaki kontrolleri bağlar
  store.js            Uygulama durumu ve onu değiştiren tüm işlemler
  storage.js          localStorage okuma/yazma
  todo-model.js       Görev veri şekli, öncelikler, eski veriyi uyarlama
  selectors.js        Durumdan türetilen değerler (filtre + arama sonucu vb.)
  dates.js            Son tarih hesapları ve etiketleri
  view.js             Durumu ekrana çizer, odağı korur
  todo-item.js        Tek görev satırının ve düzenleme formunun DOM'u
  list-controller.js  Listedeki tıklama/klavye/düzenleme olayları
  drag.js             Pointer olaylarıyla sürükleyerek sıralama
  toast.js            Geri al bildirimi
  actions.js          "Sil ve geri al" gibi birleşik işlemler
  pwa.js              Çevrimdışı rozeti ve service worker kaydı
```

Akış tek yönlüdür: olay → `store.js` işlemi → kaydet → `view.js` yeniden çizer.

## Yerelde çalıştırma

Service worker `file://` üzerinden çalışmadığı için küçük bir sunucu gerekir:

```bash
npx serve .
```

Sonra tarayıcıda `http://localhost:3000` adresini aç.

## Yayınlama (GitHub Pages)

Repo ayarlarında **Settings → Pages → Source: Deploy from a branch → `main` / root** seç.

## Güncelleme notu

Dosyaları değiştirdiğinde `sw.js` içindeki `CACHE_NAME` sürümünü artır (`v1` → `v2`), böylece telefonlar yeni sürümü alır. Yeni bir `js/` ya da `css/` dosyası eklersen `sw.js` içindeki `ASSETS` listesine de ekle.
