import { renderGuestView } from '../views/guestView.js';

export default class GuestController {
  async renderGuestView() {
    await renderGuestView();
  }

  navigateToLogin() {
    window.location.href = 'src/frontend/login.html';
  }

  navigateToRegister() {
    window.location.href = 'src/frontend/register.html';
  }

  login(email) {
    if (email) {
      alert(`Logging in with email: ${email}`);
      window.location.href = 'index.html';
    } else {
      alert('Please enter an email!');
    }
  }

  toggleDarkMode() {
    const enabled = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', enabled ? 'true' : 'false');
  }
}
