import { login, logout } from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('login-modal');
  const closeModalBtns = document.querySelectorAll('#login-cancel, #login-cancel-btn');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');

  function isLoggedIn() {
    return sessionStorage.getItem('user') !== null;
  }

  function handleRouteChange() {
    const user = isLoggedIn();
    const currentPath = window.location.pathname;

    if (currentPath !== '/' && currentPath !== '/index.html' && !user) {
      window.location.href = '/index.html'; 
    }
  }

  handleRouteChange();

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;

      const result = await login(username, password);
      if (result.status === 'success') {
        sessionStorage.setItem('user', JSON.stringify(result.user));
        checkAuthUI();
        if (loginModal) {
          loginModal.classList.remove('active');
        }
        window.location.href = '/students/students.html';

      } else {
        alert(result.message);
      }
    });
  }
  closeModalBtns.forEach(button => {
    button.addEventListener('click', () => {
      loginModal.classList.remove('active'); 
    });
  });
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      sessionStorage.removeItem('user');
      checkAuthUI();
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (loginModal) loginModal.classList.add('active');
    });
  }

  checkAuthUI();


  function triggerBellAnimation() {
    const notificationBell = document.getElementById('notification-bell');
    const newMessagesIndicator = document.getElementById('new-messages-indicator');

    if (notificationBell) {
      notificationBell.classList.add('animate');
    }

    setTimeout(() => {
      if (notificationBell) {
        notificationBell.classList.remove('animate');
      }
      if (newMessagesIndicator) {
        newMessagesIndicator.style.display = 'block';
      }
    }, 500);
  }

  document.addEventListener('dblclick', triggerBellAnimation);

});

export function checkAuthUI() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  document.querySelectorAll('[data-auth="user"]').forEach(el => {
    if (user) {
      el.style.display = '';
      el.classList.remove('disabled');
      el.disabled = false;
    } else {
      el.style.display = 'none';
      el.classList.add('disabled');
      el.disabled = true;
    }
  });

  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.style.display = user ? 'none' : 'inline-block';
  }
}
checkAuthUI();
export function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
  }
}
export function openMessages() {
  window.location.href = '/messages/messages.html';
  const indicator = document.getElementById('new-messages-indicator');
  if (indicator) indicator.style.display = 'none';
}

window.toggleSidebar = toggleSidebar;
window.openMessages = openMessages;
  //if ('serviceWorker' in navigator) {
  //    window.addEventListener('load', () => {
  //        navigator.serviceWorker.register('/service-worker.js')
  //            .then((registration) => {
  //                console.log('Service Worker registered with scope:', registration.scope);
  //            })
  //            .catch((error) => {
  //                console.error('Service Worker registration failed:', error);
  //            });
  //    });
  //}