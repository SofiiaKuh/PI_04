import { checkAuthUI, checkAndToggleBellIndicator } from '../script.js';
import { fetchStudents } from '../services/studentService.js';
import socket from '../services/socket.js';
document.addEventListener('DOMContentLoaded', checkAuthUI);
const highlightId = sessionStorage.getItem('highlightMessageId');
if (highlightId) {
  const msgEl = document.getElementById(`msg-${highlightId}`);
  if (msgEl) {
    msgEl.classList.add('highlight');
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  sessionStorage.removeItem('highlightMessageId');
}
window.onload = onload;
function onload() {
  checkAuthUI();
  checkAndToggleBellIndicator();
}
export let userMap = {};
const userJson = sessionStorage.getItem('user');
const currentUser = userJson ? JSON.parse(userJson) : null;


let currentUserId = currentUser ? currentUser.id : null; 
export let currentChatRoomId = null;

async function init(userId) {
  currentUserId = userId;

  await loadChatRooms();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('chatRoomId');
  if (id && id !== 'messages.html') {
    currentChatRoomId = id;
  openChatRoom(id);
  }
}

async function loadChatRooms() {
  const res = await fetch(`http://localhost:5000/api/chat/user/${currentUserId}`);
  const data = await res.json();
  const chatRooms = data.rooms;
  const chatList = document.getElementById('chat-list');
  chatList.innerHTML = '';
  loadUnseenMessages();
  chatRooms.forEach(room => {
    const li = document.createElement('li');
    li.className = 'chat-room-item';
    li.dataset.roomId = room._id;

    const name = document.createElement('span');
    name.textContent = room.name || `Chat ${room._id}`;
    name.className = 'chat-room-name';

    const indicator = document.createElement('span');
    indicator.className = 'unread-indicator';
    indicator.style.display = 'none';


    const unseenCount = unseenMessagesMap.get(room._id)?.length || 0;
    if (unseenCount > 0) {
      indicator.style.display = 'inline-block';
      indicator.textContent = unseenCount;
    } else {
      indicator.style.display = 'none';
      indicator.textContent = '';
    }

    li.appendChild(name);
    li.appendChild(indicator);

    li.onclick = () => {
      currentChatRoomId = room._id;
      openChatRoom(room._id);
      indicator.style.display = 'none';
    };

    chatList.appendChild(li);

  });
}

export let unseenMessagesMap = new Map();
export function loadUnseenMessages() {
  const json = sessionStorage.getItem('unseenMessages');
  if (!json) return;
  const plainObj = JSON.parse(json);
  for (const [roomId, msgs] of Object.entries(plainObj)) {
    unseenMessagesMap.set(roomId, msgs);
  }
}

let lastSeenTime = 0;


async function openChatRoom(chatRoomId) {
  saveLastSeen(currentChatRoomId, Date.now());

  currentChatRoomId = chatRoomId;
  lastSeenTime = getLastSeen(chatRoomId);


  document.querySelectorAll('.chat-room-item').forEach(el => {
    el.classList.remove('active');
  });

  loadUnseenMessages();
  const unseenMessages = unseenMessagesMap.get(chatRoomId);

  if (unseenMessages) {
    unseenMessagesMap.delete(chatRoomId);

    const indicator = document.querySelector(`li[data-room-id="${chatRoomId}"] .unread-indicator`);
    if (indicator) {
      indicator.style.display = 'none';
      indicator.textContent = '';
    }
    const plainObj = {};
    unseenMessagesMap.forEach((msgs, roomId) => {
      plainObj[roomId] = msgs;
    });
    sessionStorage.setItem('unseenMessages', JSON.stringify(plainObj));

    unseenMessages.forEach(message => {
      socket.emit('seeMessage', {
        chatRoomId,
        messageId: message._id,
        userId: currentUserId
      });
    });
    checkAndToggleBellIndicator();

  }


  const selectedChat = [...document.querySelectorAll('.chat-room-item')]
    .find(el => el.dataset.roomId === chatRoomId);

  if (selectedChat) {
    selectedChat.classList.add('active');
  }
  document.getElementById('chat-room-detail').style.display = 'flex';
  document.getElementById('placeholder').style.display = 'none';
  await loadUsersMap();
  const resMembers = await fetch(`http://localhost:5000/api/chat/${chatRoomId}`);
  const data = await resMembers.json();
  const members = data.room.members;
  renderChatMembers(members);

  const resMessages = await fetch(`http://localhost:5000/api/messages/${chatRoomId}`);
  const messages = await resMessages.json();
  renderMessages(messages);
}

function renderChatMembers(members) {

  const container = document.getElementById('chat-members');
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'space-between';

  const avatarsContainer = document.createElement('div');
  avatarsContainer.style.display = 'flex';
  avatarsContainer.style.alignItems = 'center';

  members.forEach(member => {
    const avatar = document.createElement('img');
    avatar.src = '/assets/avatar.png';
    const userInfo = userMap[member];
    let tooltipText = userInfo
      ? `${userInfo.first_name} ${userInfo.last_name}`
      : 'Unknown User';

    avatar.title = tooltipText;
    avatar.style.width = '40px';
    avatar.style.height = '40px';
    avatar.style.borderRadius = '50%';
    avatar.style.marginRight = '0.5rem';
    avatarsContainer.appendChild(avatar);
  });

  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Add Member';
  addBtn.onclick = () => openAddMemberModal();
  addBtn.style.marginLeft = 'auto'; 

  container.appendChild(avatarsContainer);
  container.appendChild(addBtn);
}

function renderMessages(messages) {
  const container = document.getElementById('messages');
  container.innerHTML = '';

  if (messages.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = 'No messages yet';
    emptyMsg.style.color = '#888';
    emptyMsg.style.fontStyle = 'italic';
    container.appendChild(emptyMsg);
  } else {
    messages.forEach(msg => addMessageToChat(msg));
  }

  container.scrollTop = container.scrollHeight;
}


let newMessagesSeparatorInserted = false;



export function addMessageToChat(message) {
  const container = document.getElementById('messages');
  const isMine = Number(message.sender) === Number(currentUserId);
  const isNew = new Date(message.createdAt).getTime() > lastSeenTime;

  if (isNew && !newMessagesSeparatorInserted && !isMine) {
    const divider = document.createElement('div');
    divider.textContent = 'New messages';
    divider.style.textAlign = 'center';
    divider.style.color = '#666';
    divider.style.margin = '1rem 0';
    divider.style.borderTop = '1px solid #ccc';
    divider.style.paddingTop = '0.5rem';
    container.appendChild(divider);
    newMessagesSeparatorInserted = true;
  }

  const msgDiv = document.createElement('div');
  msgDiv.id = `msg-${message._id}`;
  msgDiv.className = 'message-item';
  msgDiv.dataset.messageId = message._id;
  msgDiv.style.marginBottom = '1rem';
  msgDiv.style.display = 'flex';
  msgDiv.style.alignItems = 'flex-end';
  msgDiv.style.justifyContent = isMine ? 'flex-end' : 'flex-start';

  const highlightMessageId = localStorage.getItem('highlightMessageId');

  if (highlightMessageId && highlightMessageId === message._id) {
    msgDiv.classList.add('highlight');
    localStorage.removeItem('highlightMessageId');

    setTimeout(() => {
      msgDiv.classList.remove('highlight');
    }, 3000);
  }

  // AVATAR 
  if (!isMine) {
    const avatar = document.createElement('img');
    avatar.src = message.avatarUrl || '../assets/avatar.png';
    avatar.alt = 'avatar';
    const sender = userMap?.[message.sender];
    avatar.title = sender ? `${sender.first_name} ${sender.last_name}` : `User ${message.sender}`;
    avatar.className = 'avatar';
    msgDiv.appendChild(avatar);
  }

  // MESSAGE BUBBLE
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.style.position = 'relative';

  const bubble = document.createElement('div');
  bubble.textContent = message.content;
  bubble.style.padding = '0.5rem 1rem';
  bubble.style.borderRadius = '10px';
  bubble.style.maxWidth = '300px';
  bubble.style.backgroundColor = isMine ? '#4caf50' : (isNew ? '#d8f3dc' : '#e0e0e0');
  bubble.style.color = isMine ? 'white' : 'black';
  bubble.style.wordWrap = 'break-word';

  // TIME 
  const time = document.createElement('div');
  const date = new Date(message.createdAt);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  time.textContent = `${hours}:${minutes}`;
  time.className = 'message-time';
  time.style.textAlign = isMine ? 'right' : 'left';


  bubbleWrapper.appendChild(bubble);
  bubbleWrapper.appendChild(time);

  // SEEN INDICATOR 
  if (isMine) {
    const seen = document.createElement('span');
    seen.className = 'seen-indicator';

    if (Array.isArray(message.seenBy) && message.seenBy.length > 1) {
      seen.textContent = '✓';
      seen.title = `Seen by: ${message.seenBy.filter(id => id !== String(currentUserId)).join(', ')}`;
    } else {
      seen.textContent = '';
      seen.title = 'Not seen yet';
    }

    bubbleWrapper.appendChild(seen);
  }

  msgDiv.appendChild(bubbleWrapper);
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}


export function updateMessageUI(messageId, updatedMessage) {
  const msgDiv = document.querySelector(`.message-item[data-message-id="${messageId}"]`);
  if (!msgDiv) return;

  const isMine = Number(updatedMessage.sender) === Number(currentUserId);

  if (isMine) {
    const seenIndicator = msgDiv.querySelector('.seen-indicator');
    if (seenIndicator) {
      if (updatedMessage.seenBy.length > 1) {
        seenIndicator.textContent = '✓';
        seenIndicator.title = `Seen by: ${updatedMessage.seenBy.join(', ')}`;
      } else {
        seenIndicator.textContent = '';
        seenIndicator.title = 'Not seen yet';
      }
    }
  }
}
export function saveLastSeen(chatRoomId, timestamp) {
  const allSeen = JSON.parse(localStorage.getItem('lastSeen') || '{}');
  allSeen[chatRoomId] = timestamp;
  localStorage.setItem('lastSeen', JSON.stringify(allSeen));
}
export function getLastSeen(chatRoomId) {
  const allSeen = JSON.parse(localStorage.getItem('lastSeen') || '{}');
  return allSeen[chatRoomId] || 0;
}


const sendMessageBtn = document.getElementById('send-message-btn');
if (sendMessageBtn) {
  sendMessageBtn.addEventListener('click', async () => {
    const input = document.getElementById('message-input');
    const content = input.value.trim();

    if (content !== '') {
      const message = {
        chatRoomId: currentChatRoomId, // set this when a room is opened
        senderId: currentUserId,
        content: content
      };

      try {
        
        socket.emit('sendMessage', message);

        input.value = '';

       
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  });
}


async function fetchMessages(chatRoomId) {
  try {
    const res = await fetch(`http://localhost:5000/api/messages/${chatRoomId}`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    const messages = await res.json();
    return messages;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function showToast(message, isError = false) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.margin = '0.5em';
  toast.style.padding = '1em 1.5em';
  toast.style.borderRadius = '4px';
  toast.style.background = isError ? 'rgba(220, 53, 69, 0.9)' : 'rgba(40, 167, 69, 0.9)';
  toast.style.color = 'white';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => container.removeChild(toast), { once: true });
  }, 3000);
}

window.onload = () => {
  const userId = currentUserId;
  init(userId);
};

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
  if (id === 'modal-create-room') {
    selectedUsers.clear(); 
    loadUsersDropdown('create');
  } else if (id === 'modal-add-member') {
    selectedUsers.clear();
    loadUsersDropdown('add');
  }
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

document.querySelectorAll('.close-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = button.closest('.modal');
    if (modal) {
      modal.style.display = 'none';
    }
  });
});

function openAddMemberModal() {
  openModal('modal-add-member');
}

const createChatBtn = document.getElementById('btn-create-chat');
if (createChatBtn) {
  createChatBtn.addEventListener('click', () => {
    openModal('modal-create-room');
  });
}

async function createChatRoom() {
  const nameInput = document.getElementById('new-room-name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.style.borderColor = 'red';

    return; 
  }

  const memberIds = Array.from(selectedUsers).map(id => id.toString());

  if (!memberIds.includes(currentUserId.toString())) {
    memberIds.push(currentUserId.toString());
  }

  const res = await fetch('http://localhost:5000/api/chat/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      createdBy: currentUserId.toString(),
      memberIds: memberIds
    })
  });

  if (res.ok) {
    closeModal('modal-create-room');
    await loadChatRooms();
    showToast('Chat room created');
  } else {
    showToast('Failed to create room', true);
  }
}
window.createChatRoom = createChatRoom;

async function addMemberToRoom() {
  const memberIds = Array.from(selectedUsers).map(id => id.toString());

  const res = await fetch(`http://localhost:5000/api/chat/${currentChatRoomId}/add-member`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberIds: memberIds })
  });

  if (res.ok) {
    closeModal('modal-add-member');
    await openChatRoom(currentChatRoomId);
    showToast('Member(s) added');
  } else {
    showToast('Failed to add member', true);
  }
}

window.addMemberToRoom = addMemberToRoom;


const selectedUsers = new Set();

async function loadUsersDropdown(modalType) {
  try {
    const { students } = await fetchStudents();
    const userListId = modalType === 'create' ? 'user-list-create' : 'user-list-add';
    const userList = document.getElementById(userListId);
    userList.innerHTML = '';

    students.forEach(user => {
      userMap[user.id] = user;
      const fullName = `${user.first_name} ${user.last_name}`;
      const avatar = "../assets/avatar.png"; 

      const userItem = document.createElement('div');
      userItem.style = "display: flex; align-items: center; margin: 6px 0;";
      userItem.innerHTML = `
        <img src="${avatar}" width="30" height="30" style="border-radius: 50%; margin-right: 10px;">
        <span style="flex: 1;">${fullName}</span>
        <button class="add-user-btn" data-id="${user.id}">+</button>
      `;

      userList.appendChild(userItem);
    });

    document.querySelectorAll('.add-user-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = Number(btn.getAttribute('data-id'));
        if (!selectedUsers.has(userId)) {
          selectedUsers.add(userId);
          renderSelectedUsers(modalType);
        }
      });
    });

  } catch (err) {
    console.error(err);
    showToast('Failed to load users', true);
  }
}


export async function loadUsersMap() {
  try {
    const { students } = await fetchStudents();
    students.forEach(user => {
      userMap[user.id] = user;
    });
  } catch (err) {
    console.error('Failed to load users map:', err);
    showToast('Failed to load users', true);
  }
}



function renderSelectedUsers(modalType) {
  const containerId = modalType === 'create' ? 'selected-members-create' : 'selected-members-add';
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  selectedUsers.forEach(id => {
    const user = userMap[id];
    const fullName = `${user.first_name} ${user.last_name}`;
    const avatar = "../assets/avatar.png";

    const userDiv = document.createElement('div');
    userDiv.style = 'display: flex; align-items: center; margin-bottom: 5px;';

    userDiv.innerHTML = `
      <img src="${avatar}" width="30" height="30" style="border-radius: 50%; margin-right: 10px;">
      <span>${fullName}</span>
      <button class="remove-user-btn" data-id="${id}" style="margin-left:auto;">x</button>
    `;

    container.appendChild(userDiv);
  });

  container.querySelectorAll('.remove-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = Number(btn.getAttribute('data-id'));
      selectedUsers.delete(userId);
      renderSelectedUsers(modalType);
    });
  });
}

