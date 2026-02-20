(async () => {
    window.addEventListener('DOMContentLoaded', function route() {
        const params = new URLSearchParams(window.location.search)
        const lesson = params.get('learningObj')
        if (!lesson) return;
        const classname = `section-${lesson}`
        const main = document.querySelector('main')
        Array.from(main.children).forEach(child => {
            if (!child.classList.contains(classname)) child.remove()
        })
    })

    if (window.location.protocol !== 'file:' && 'serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js')
        } catch (err) {
            console.error('Erro SW:', err)
        }
    }
})()
