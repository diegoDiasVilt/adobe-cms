(async () => {
    const params = new URLSearchParams(window.location.search)
    const pwa = params.get('pwa')
    window.addEventListener('DOMContentLoaded', function route() {
        const lesson = params.get('learningObj')
        if (!lesson) return;
        const classname = `section-${lesson}`
        const main = document.querySelector('main')
        Array.from(main.children).forEach(child => {
            if (!child.classList.contains(classname)) child.remove()
        })
    })
    if ('serviceWorker' in navigator) {
        if (pwa === 'unregister') navigator.serviceWorker.getRegistrations().then(
            registrations => {
                registrations.forEach(r => r.unregister())
            }
        ).catch(err => console.error('Unregister SW Error:', err))
        else if (window.location.protocol !== 'file:') {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js')
            } catch (err) {
                console.error('Erro SW:', err)
            }
        }
    }
})()
