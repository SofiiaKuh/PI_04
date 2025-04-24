const API_BASE = 'http://localhost/student_app/public';

export async function fetchStudents(page = 1) {
  const res = await fetch(`${API_BASE}/get_students.php?page=${page}`);
  return await res.json();
}


export async function addStudent(student) {
  console.log('Sending student data:', student);
  const res = await fetch(`${API_BASE}/create_student.php`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(student),
  });


  const text = await res.text();
  console.log('Response text:', text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse JSON:', err);
    throw new Error('Server returned invalid JSON – see console for full response');
  }

  console.log('Parsed response:', data);
  return data;
}

export async function updateStudent(id, student) {
  student.id = id; 
  const res = await fetch(`${API_BASE}/update_student.php`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  if (res.status === 401) {
    return { status: 'unauthorized', message: 'You must be logged in to update student details.' };
  }
  const text = await res.text();
  return JSON.parse(text);
}

export async function deleteStudent(id) {
  const response = await fetch(`${API_BASE}/delete_student.php?id=${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.status === 401) {
    return { status: 'unauthorized', message: 'You must be logged in to delete students.' };
  }
  const result = await response.json();
  return result;
}
