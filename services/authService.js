const API_BASE = 'http://localhost/student_app/public';

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const text = await res.text();
  console.log('LOGIN RESPONSE TEXT:', text);
  return JSON.parse(text);
}

export async function logout() {
  const res = await fetch(`${API_BASE}/logout.php`, {
    method: 'POST',
    credentials: 'include',

  });
  return res.json();
}