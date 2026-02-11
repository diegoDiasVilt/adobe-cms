function renderContent() {
    const params = new URLSearchParams(window.location.search);
    const activeObj = params.get('learningObj');
    const target = document.querySelector(`.section-${activeObj}`);
    if (target) {
        document.querySelectorAll('.section').forEach(el => el.style.display = 'none');
        target.style.display = 'block';
    }
}

if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.register('/sw.js');
    if (navigator.serviceWorker.controller) renderContent()
    else navigator.serviceWorker.addEventListener('controllerchange', renderContent)
}

