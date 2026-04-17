document.addEventListener('DOMContentLoaded', () => {
  // Always attach logout button so user can escape if there's an error
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('eduGate_session');
      window.location.href = '/index.html';
    });
  }

  const sessionStr = localStorage.getItem('eduGate_session');
  if (!sessionStr) {
    window.location.href = '/index.html';
    return;
  }

  const currentUser = JSON.parse(sessionStr);
  
  document.getElementById('user-name').textContent = currentUser.name || currentUser.email;
  const avatar = document.getElementById('user-avatar');
  if (avatar) {
    const name = currentUser.name || currentUser.email;
    avatar.textContent = name.charAt(0).toUpperCase();
  }
  const roleDisplay = document.getElementById('user-role-display');
  if (roleDisplay) {
    roleDisplay.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  }
  document.getElementById('loading').classList.add('hidden');

  if (currentUser.role === 'admin') {
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadAdminDashboard(currentUser);
  } else {
    document.getElementById('student-dashboard').classList.remove('hidden');
    loadStudentDashboard(currentUser);
  }
});

function loadStudentDashboard(currentUser) {
  // Load saved local data
  const students = JSON.parse(localStorage.getItem('eduGate_students') || '[]');
  const myData = students.find(s => s.email === currentUser.email) || {
    name: currentUser.name,
    department: ''
  };

  document.getElementById('student-name').value = myData.name || '';
  document.getElementById('student-department').value = myData.department || '';

  // Handle profile save
  document.getElementById('student-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    const department = document.getElementById('student-department').value;
    const msgEl = document.getElementById('profile-msg');

    const updatedStudents = JSON.parse(localStorage.getItem('eduGate_students') || '[]');
    const index = updatedStudents.findIndex(s => s.email === currentUser.email);
    
    const newStudentData = { email: currentUser.email, name, department };
    if (index > -1) updatedStudents[index] = newStudentData;
    else updatedStudents.push(newStudentData);

    localStorage.setItem('eduGate_students', JSON.stringify(updatedStudents));
    
    msgEl.textContent = 'Profile saved successfully (offline)!';
    msgEl.className = 'text-sm mt-2 text-green-600';
  });

  loadMyAssignments(currentUser);
}

export function loadMyAssignments(currentUser) {
  const assignments = JSON.parse(localStorage.getItem('eduGate_assignments') || '[]');
  const myAssignments = assignments.filter(a => a.student_email === currentUser.email);

  const tbody = document.getElementById('my-assignments-list');
  tbody.innerHTML = '';

  myAssignments.sort((a, b) => b.submitted_at - a.submitted_at).forEach(assignment => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-4 text-sm border-b border-slate-200">${assignment.title}</td>
      <td class="p-4 text-sm border-b border-slate-200">${new Date(assignment.submitted_at).toLocaleString()}</td>
      <td class="p-4 text-sm border-b border-slate-200 flex gap-4">
        <a href="${assignment.file_url}" download="${assignment.file_name || 'assignment'}" class="text-blue-500 font-medium hover:underline">
          Download
        </a>
        <button class="text-red-500 font-medium hover:underline delete-btn" data-id="${assignment.submitted_at}">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach delete listeners
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const allAssignments = JSON.parse(localStorage.getItem('eduGate_assignments') || '[]');
      const filtered = allAssignments.filter(a => a.submitted_at.toString() !== id);
      localStorage.setItem('eduGate_assignments', JSON.stringify(filtered));
      loadMyAssignments(currentUser);
    });
  });
}

function loadAdminDashboard(currentUser) {
  function renderStudents() {
    const students = JSON.parse(localStorage.getItem('eduGate_students') || '[]');
    const tbody = document.getElementById('all-students-list');
    tbody.innerHTML = '';
    
    students.forEach(student => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-4 text-sm border-b border-slate-200">${student.name || 'N/A'}</td>
        <td class="p-4 text-sm border-b border-slate-200">${student.email}</td>
        <td class="p-4 text-sm border-b border-slate-200">${student.department || 'N/A'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderAssignments() {
    const assignments = JSON.parse(localStorage.getItem('eduGate_assignments') || '[]');
    const tbody = document.getElementById('all-assignments-list');
    tbody.innerHTML = '';
    
    assignments.sort((a,b) => b.submitted_at - a.submitted_at).forEach(assignment => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-4 text-sm border-b border-slate-200">${assignment.student_name}</td>
        <td class="p-4 text-sm border-b border-slate-200">${assignment.title}</td>
        <td class="p-4 text-sm border-b border-slate-200">${new Date(assignment.submitted_at).toLocaleString()}</td>
        <td class="p-4 text-sm border-b border-slate-200 flex gap-4">
          <a href="${assignment.file_url}" download="${assignment.file_name || 'assignment'}" class="text-blue-500 font-medium hover:underline">
            Download
          </a>
          <button class="text-red-500 font-medium hover:underline delete-btn" data-id="${assignment.submitted_at}">
            Delete
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach delete listeners for admin
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const allAssignments = JSON.parse(localStorage.getItem('eduGate_assignments') || '[]');
        const filtered = allAssignments.filter(a => a.submitted_at.toString() !== id);
        localStorage.setItem('eduGate_assignments', JSON.stringify(filtered));
        renderAssignments();
      });
    });
  }

  document.getElementById('search-students').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const students = JSON.parse(localStorage.getItem('eduGate_students') || '[]');
    const filtered = students.filter(s => 
      (s.name && s.name.toLowerCase().includes(term)) || 
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.department && s.department.toLowerCase().includes(term))
    );
    
    const tbody = document.getElementById('all-students-list');
    tbody.innerHTML = '';
    filtered.forEach(student => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="p-4 text-sm border-b border-slate-200">${student.name || 'N/A'}</td>
        <td class="p-4 text-sm border-b border-slate-200">${student.email}</td>
        <td class="p-4 text-sm border-b border-slate-200">${student.department || 'N/A'}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  renderStudents();
  renderAssignments();
}
