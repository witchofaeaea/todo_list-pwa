# Yapılacaklar (PWA)

İnternetsiz çalışan, telefondan açılabilen basit bir yapılacaklar listesi. Playwright MCP'yi denemek için yapıldı.

- Saf HTML/CSS/JS, build adımı yok
- Service worker ile çevrimdışı çalışır, telefona "Ana ekrana ekle" ile kurulabilir
- Veriler tarayıcıda (`localStorage`) saklanır
- Test için önemli öğelerde `data-testid` nitelikleri var

## Yerelde çalıştırma

Service worker `file://` üzerinden çalışmadığı için küçük bir sunucu gerekir:

```bash
npx serve .
```

Sonra tarayıcıda `http://localhost:3000` adresini aç.

## Yayınlama (GitHub Pages)

Repo ayarlarında **Settings → Pages → Source: Deploy from a branch → `main` / root** seç.

## Güncelleme notu

Dosyaları değiştirdiğinde `sw.js` içindeki `CACHE_NAME` sürümünü artır (`v1` → `v2`), böylece telefonlar yeni sürümü alır.
