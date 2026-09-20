/* 3050파크골프클럽 — 홈 화면 설치(PWA)용 서비스 워커.
   항상 최신 화면을 보여주기 위해 저장(캐시)은 하지 않고, 인터넷이 끊겼을 때만 안내 문구를 보여줍니다. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () {
    return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:sans-serif;background:#F4EEE2;color:#14231C;text-align:center;padding:80px 24px"><h2>인터넷 연결을 확인해 주세요</h2><p>연결된 뒤 다시 열면 3050파크골프클럽 홈페이지가 나타납니다.</p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }));
});
