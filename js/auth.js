document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const errorMsg = document.getElementById('error-message');

  // Hardcoded Admin email
  const ADMIN_EMAIL = 'ahmadkabiru666@gmail.com';

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const btn = loginForm.querySelector('button[type="submit"]');
      
      btn.disabled = true;
      btn.textContent = 'Logging in...';
      
      // MOCK LOGIN: Just save to local storage
      const role = (email === ADMIN_EMAIL) ? 'admin' : 'student';
      const user = {
        email: email,
        name: email.split('@')[0],
        role: role,
        id: 'local_' + Date.now()
      };
      
      localStorage.setItem('eduGate_session', JSON.stringify(user));
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 500);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const btn = signupForm.querySelector('button[type="submit"]');
      
      btn.disabled = true;
      btn.textContent = 'Signing up...';
      
      const role = (email === ADMIN_EMAIL) ? 'admin' : 'student';
      const user = {
        email: email,
        name: name,
        role: role,
        id: 'local_' + Date.now()
      };
      
      localStorage.setItem('eduGate_session', JSON.stringify(user));
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 500);
    });
  }
});
