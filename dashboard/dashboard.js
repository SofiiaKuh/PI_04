import { checkAuthUI, checkAndToggleBellIndicator } from '../script.js';
document.addEventListener('DOMContentLoaded', checkAuthUI);

window.onload = onload;
function onload() {
  checkAuthUI();
  checkAndToggleBellIndicator();
}