import { checkAuthUI, checkAndToggleBellIndicator } from '../script.js';
document.addEventListener('DOMContentLoaded', checkAuthUI);

import { openMessages } from '../script.js'; // adjust path if needed

window.openMessages = openMessages;

window.onload = onload;
function onload() {
  checkAuthUI();
  checkAndToggleBellIndicator();
}