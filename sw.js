/* Soi cùng Cô Kỹ – service worker: lưu ứng dụng để chạy khi không có mạng.
   Vỏ ứng dụng lưu sẵn khi cài; bộ đọc chữ (ocr/) lưu lần đầu dùng (khoảng 8 MB). Đổi SHELL khi sửa tệp. */
const SHELL = 'soi-shell-v2';
const OCR = 'soi-ocr';
const FILES = ['./', './index.html', './rules.js', './engine.js', './app.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-512-maskable.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== OCR).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const scope = new URL(self.registration.scope).pathname;
  if (!url.pathname.startsWith(scope)) return;
  if (url.pathname.includes('/ocr/')) { // bộ đọc chữ: lấy trong máy trước, chưa có thì tải và lưu
    e.respondWith(caches.open(OCR).then(c => c.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }
  // vỏ ứng dụng: ưu tiên mạng để luôn mới, mất mạng thì dùng bản đã lưu
  e.respondWith(fetch(req).then(res => { if (res.ok) caches.open(SHELL).then(c => c.put(req, res.clone())); return res; })
    .catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
