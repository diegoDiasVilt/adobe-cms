(async () => {
    function load() {
        const params = new URLSearchParams(window.location.search);
        const lesson = params.get('learningObj');
        if (lesson) {
            const classname = `section-${lesson}`
            const main = document.querySelector('main')
            Array.of(...main.children).forEach(child => {
                if (!child.classList.contains(classname)) child.remove()
            })
        }
    }

    if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('/sw.js');
        if (navigator.serviceWorker.controller) load()
        else window.addEventListener('load', load)
    }
})()
