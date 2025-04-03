if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

function openMessages() {
    window.location.href = '../messages/messages.html';
    document.getElementById('new-messages-indicator').style.display = 'none';
}

function triggerBellAnimation() {
    document.getElementById('notification-bell').classList.add('animate');
    setTimeout(() => {
        document.getElementById('notification-bell').classList.remove('animate');
        document.getElementById('new-messages-indicator').style.display = 'block';
    }, 500);
}

document.addEventListener('dblclick', triggerBellAnimation);

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}
