
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
