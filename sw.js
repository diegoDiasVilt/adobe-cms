const CACHE_NAME = 'cogna-router-v1';
// const APP_SHELL = [
//     '/'
// ];

self.addEventListener('install', e => {
    self.skipWaiting(); // Ativa imediatamente
    // e.waitUntil(
    //     caches.open(CACHE_NAME)
    //         .then((cache) => cache.addAll(APP_SHELL))
    //         .catch((err) => console.error('Falha no precache:', err))
    // );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        Promise.all([
            clients.claim(), // Assume controle das abas abertas
            caches.keys().then(keys => Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key)
            })))
        ])
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (e.request.mode === 'navigate' || url.origin === self.location.origin) e.respondWith(async function () {

        // Busca no cache
        console.log('search in cache')
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(e.request, { ignoreSearch: true });
        if (cached) return cached;

        // Busca na rede
        console.log('search in net')
        const res = await fetch(e.request);
        if (res && res.ok) {
            const clean = new URL(e.request.url);
            clean.search = '';
            cache.put(clean.toString(), res.clone());
            return res;
        } else console.error(res.status, res.statusText)
    });
});