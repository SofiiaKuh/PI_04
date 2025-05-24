import { login, logout } from './services/authService.js';
import socket from './services/socket.js';
import { currentChatRoomId, addMessageToChat, updateMessageUI, loadUnseenMessages, unseenMessagesMap, loadUsersMap, userMap } from './messages/messages.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginModal = document.getElementById('login-modal');
  const closeModalBtns = document.querySelectorAll('#login-cancel, #login-cancel-btn');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const loginBtn = document.getElementById('login-btn');
  let user = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user')) || {};
  socket.emit('register', user.id);

  const bell = document.querySelector('.bell');
  const preview = document.querySelector('.message-preview');
  let hideTimeout;

  function showPreview() {
    clearTimeout(hideTimeout);
    preview.style.display = 'block';
  }

  function hidePreviewWithDelay() {
    hideTimeout = setTimeout(() => {
      preview.style.display = 'none';
    }, 500);
  }

  bell.addEventListener('mouseenter', showPreview);
  bell.addEventListener('mouseleave', hidePreviewWithDelay);
  preview.addEventListener('mouseenter', showPreview);
  preview.addEventListener('mouseleave', hidePreviewWithDelay);

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
  });
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
  window.checkAndToggleBellIndicator = checkAndToggleBellIndicator;
  checkAndToggleBellIndicator();
  socket.on('newMessage', ({ chatRoomId, message }) => {
    if (chatRoomId === currentChatRoomId) {
      addMessageToChat(message);
      let user = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user')) || {};
      socket.emit('seeMessage', {
        chatRoomId,
        messageId: message._id,
        userId: user.id
      });
    } else {
      if (!unseenMessagesMap.has(chatRoomId)) {
        unseenMessagesMap.set(chatRoomId, []);
      }
      unseenMessagesMap.get(chatRoomId).push(message);
      const plainObj = {};
      unseenMessagesMap.forEach((msgs, roomId) => {
        plainObj[roomId] = msgs;
      });
      sessionStorage.setItem('unseenMessages', JSON.stringify(plainObj));

      triggerBellAnimation();
      const indicator = document.querySelector(`li[data-room-id="${chatRoomId}"] .unread-indicator`);
      if (indicator) {
        const count = unseenMessagesMap.get(chatRoomId).length;
        indicator.style.display = 'inline-block';
        indicator.textContent = count > 9 ? '9+' : count;
      }
    }
  });

  socket.on('messageSeen', ({ chatRoomId, message, seenByUserId }) => {
    if (currentChatRoomId === chatRoomId) {
      if (message && !message.seenBy.includes(seenByUserId)) {
        message.seenBy.push(seenByUserId);
        updateMessageUI(message._id, message);
      }
    }
  });

});

let user = JSON.parse(sessionStorage.getItem('user')) || JSON.parse(localStorage.getItem('user')) || {};
document.getElementById('user-name').textContent = user.username;

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.id) {
    socket.emit('register', user.id);
  }
});

document.getElementById('notification-bell')?.addEventListener('mouseenter', async () => {
  await loadMessagePreviews();
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
  export function checkAndToggleBellIndicator() {
    const newMessagesIndicator = document.getElementById('new-messages-indicator');
    loadUnseenMessages();

    const hasUnseenMessages = unseenMessagesMap.size > 0;

    if (newMessagesIndicator) {
      newMessagesIndicator.style.display = hasUnseenMessages ? 'block' : 'none';
    }
}

async function loadMessagePreviews() {
  const previewList = document.getElementById('message-preview-list');
  previewList.innerHTML = ''; // Clear previous content

  const stored = sessionStorage.getItem('unseenMessages');
  if (!stored) {
    previewList.innerHTML = '<li><div class="message-item"><span class="message-text">No new messages</span></div></li>';
    return;
  }

      await loadUsersMap();
  let hasMessages = false;
  const unseen = JSON.parse(stored);
  Object.entries(unseen).forEach(([chatRoomId, messages]) => {
    messages.forEach(msg => {
      hasMessages = true;
      const user = userMap[Number(msg.sender)];
      const fullName = `${user?.first_name ?? "Unknown"} ${user?.last_name ?? "User"}`;
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="message-item" data-room-id="${chatRoomId}" data-msg-id="${msg._id}">
          <img src="${msg.senderAvatar || '../assets/avatar.png'}" alt="Avatar">
          <div class="message-content">
            <span class="sender-name">${fullName || 'Unknown'}</span>
<span class="message-text">${(msg.content?.length > 50 ? msg.content.slice(0, 47) + '...' : (msg.content || '[No text]'))}</span>
          </div>
        </div>
      `;
      previewList.appendChild(li);
    });
  });

  if (!hasMessages) {
    previewList.innerHTML = '<li><div class="message-item"><span class="message-text">No new messages</span></div></li>';
  }

  document.querySelectorAll('.message-item').forEach(el => {
    el.addEventListener('click', () => {
      const chatRoomId = el.dataset.roomId;
      const msgId = el.dataset.msgId;
      localStorage.setItem('highlightMessageId', msgId);
      window.location.href = `../messages/messages.html?chatRoomId=${chatRoomId}`;
    });
  });
}

