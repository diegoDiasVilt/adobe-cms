const CACHE_NAME = 'cogna-pwa-v3';

const IGNORE_DOMAINS = [
    'aem.page',
    // 'aem.live',
    // 'localhost',
];

// const OFFLINE_URL = '/offline.html'
// const PREFETCH = [OFFLINE_URL]

self.addEventListener('install', e => {
    self.skipWaiting()
    // e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PREFETCH)))
});

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

function getServiceErrorResponse(event, error) {
    const nopwa = new URL(event.request.url);
    nopwa.searchParams.set('pwa', 'skip');
    const nocache = new URL(event.request.url);
    nocache.searchParams.set('pwa', 'drop');
    return new Response(`
Erro: ${error.message}
<ul><li><a href="${event.request.url}">Tente Novamente</a></li>
<li><a href="${nocache}">Limpar Cache</a></li>
<li><a href="${nopwa}">Desativar PWA</a></li></ul>
    `, {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
    });
}

self.addEventListener('fetch', e => {
    if (e.request.mode !== 'navigate') return;
    const url = new URL(e.request.url);
    const pwa = url.searchParams.get('pwa')
    try {
        if (pwa) switch (pwa) {
            case 'skip': return;
            case 'drop': e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))); return;
            case 'refresh': e.waitUntil(caches.open(CACHE_NAME).then(c => c.delete(getCacheKey(url))));
        }
        if (e.request.method !== 'GET' || IGNORE_DOMAINS.some(d => url.hostname.includes(d))) return;
        if (url.pathname.startsWith('/conteudo/')) {
            e.respondWith((async () => {
                try {
                    const cache = await caches.open(CACHE_NAME);
                    console.log('search in cache')
                    const cached = await cache.match(e.request, { ignoreSearch: true });
                    if (cached) return cached;

                    console.log('search in net')
                    const key = getCacheKey(url)
                    const res = await fetch(e.request);
                    if (res.ok) cache.put(key, res.clone());
                    return res
                } catch (error) {
                    console.error(`Unable to fetch ${url}: ${error.message}`)
                    // try {
                    //     const cache = await caches.open(CACHE_NAME)
                    //     let offline = await cache.match(OFFLINE_URL)
                    //     if (offline) return offline
                    //     offline = await fetch(OFFLINE_URL)
                    //     if (offline.ok) return offline
                    // } catch (err) {
                    //     console.error(`Unable to fetch offline page: ${err.message}`)
                    // }
                    return getServiceErrorResponse(e, error)
                }
            })());
        }
    } catch (error) {
        console.error(error)
    }
});