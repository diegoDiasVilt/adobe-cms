const CACHE_NAME = 'cogna-router-v1';

const IGNORE_DOMAINS = [
    'aem.page',
    // 'aem.live',
    // 'localhost',
];

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(Promise.all([
    clients.claim(),
    caches.keys().then(keys => Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key)
    })))
])));

function getCacheKey(url) {
    const clone = new URL(url)
    clone.search = '';
    return clone
}

self.addEventListener('fetch', async e => {
    const url = new URL(e.request.url);
    const pwa = url.searchParams.get('pwa')
    switch (pwa) {
        case 'skip': return;
        case 'drop': return caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
        case 'refresh': caches.open(CACHE_NAME).then(c => c.delete(getCacheKey(url)))
    }
    if (e.request.method !== 'GET' || IGNORE_DOMAINS.some(d => url.hostname.includes(d))) return;
    if (url.pathname.startsWith('/conteudo/')) {
        e.respondWith((async () => {
            const cache = await caches.open(CACHE_NAME);
            console.log('search in cache')
            const cached = await cache.match(e.request, { ignoreSearch: true });
            if (cached) return cached;

            console.log('search in net')
            const key = getCacheKey(url)
            const res = await fetch(key);
            if (res.ok) cache.put(key, res.clone());
            return res
        })());
    }
});