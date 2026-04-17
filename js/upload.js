import { loadMyAssignments } from './dashboard.js';

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  if (!uploadForm) return;

  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('assignment-title').value;
    const fileInput = document.getElementById('assignment-file');
    const file = fileInput.files[0];
    const msgEl = document.getElementById('upload-msg');
    const btn = document.getElementById('upload-btn');

    if (!file) return;

    btn.disabled = true;
    btn.textContent = 'Uploading...';
    msgEl.textContent = '';

    // Mock delay
    await new Promise(r => setTimeout(r, 1000));

    try {
      const sessionStr = localStorage.getItem('eduGate_session');
      if (!sessionStr) throw new Error("Not authenticated");
      const currentUser = JSON.parse(sessionStr);
      
      // Convert file to Base64 so it persists in LocalStorage
      const reader = new FileReader();
      
      const fileDataPromise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsDataURL(file);
      });

      const dataUrl = await fileDataPromise;

      // Save to local storage
      const assignments = JSON.parse(localStorage.getItem('eduGate_assignments') || '[]');
      
      const newAssignment = {
        student_id: currentUser.id,
        student_email: currentUser.email,
        student_name: currentUser.name,
        title: title,
        file_url: dataUrl,
        file_name: file.name,
        submitted_at: Date.now()
      };
      
      assignments.push(newAssignment);
      
      try {
        localStorage.setItem('eduGate_assignments', JSON.stringify(assignments));
      } catch (e) {
        throw new Error("Local storage is full! Use a smaller file (under 2MB) for this offline demo.");
      }

      msgEl.textContent = 'Assignment uploaded successfully (locally)!';
      msgEl.className = 'text-sm mt-2 text-green-600';
      uploadForm.reset();
      
      // Reload assignments list
      loadMyAssignments(currentUser);

    } catch (error) {
      console.error(error);
      msgEl.textContent = error.message;
      msgEl.className = 'text-sm mt-2 text-red-600';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Upload';
    }
  });
});
