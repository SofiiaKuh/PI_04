const API_BASE = 'http://localhost/student_app/public';

export async function fetchStudents() {
  const res = await fetch(`${API_BASE}/get_students.php`);
  console.log('Response status:', res);
  return await res.json();
}

export async function addStudent(student) {
  console.log('Sending student data:', student);
  const res = await fetch(`${API_BASE}/create_student.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });

  const response = await res.json();
  console.log('Parsed response:', response);
  return response;
}

export async function updateStudent(id, student) {
  student.id = id; 
  const res = await fetch(`${API_BASE}/update_student.php`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  const text = await res.text();
  console.log('Update response:', text);
  return JSON.parse(text);
}

export async function deleteStudent(id) {
  return await fetch(`${API_BASE}/delete_student.php?id=${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}
