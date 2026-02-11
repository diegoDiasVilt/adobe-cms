const CACHE_NAME = 'cogna-router-v1';

self.addEventListener('install', e => {
    console.log('install')
    self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', e => {
    console.log('activate')
    e.waitUntil(
        Promise.all([
            clients.claim(), // Assume controle das abas abertas
            caches.keys().then(keys => Promise.all(keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key)
            })))
        ])
    );
});

self.addEventListener('fetch', async e => {
    const url = new URL(e.request.url);

    if (url.pathname.startsWith('/conteudo/')) {
        e.respondWith((async () => {
            url.search = '';
            const cache = await caches.open(CACHE_NAME);
            console.log('search in cache')
            const cached = await cache.match(e.request, { ignoreSearch: true });
            if (cached) return cached;

            console.log('search in net')
            const res = await fetch(url);
            if (res.ok) cache.put(url, res.clone());
            return res
        })());
    }
});