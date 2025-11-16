document.addEventListener('DOMContentLoaded', () => {
  const userId = document.getElementById('userId');
  const userPassword = document.getElementById('userPassword');
  const passwordAddon = document.getElementById('password-addon');
  const btnLogin = document.getElementById('btn-login');
  const formLogin = document.getElementById('form-login');
  const alertModalEl = document.getElementById('alert-login-modal');
  const alertModal = new bootstrap.Modal(alertModalEl);

  // Focus
  userId.focus();
  btnLogin.disabled = true;
  passwordAddon.style.display = 'none';

  // hide/show icon eye when enter password
  userPassword.addEventListener('input', () => {
    passwordAddon.style.display =
      userPassword.value.length > 0 ? 'block' : 'none';
    toggleButton();
  });

  // hide/show password
  passwordAddon.addEventListener('click', () => {
    const inputType = userPassword.getAttribute('type');
    const iconEyeOpen = document.querySelector(
      '#password-addon #icon-eye-open',
    );
    const iconEyeOff = document.querySelector('#password-addon #icon-eye-off');

    if (inputType === 'password') {
      userPassword.setAttribute('type', 'text');
      iconEyeOff.style.display = 'none';
      iconEyeOpen.style.display = 'block';
    } else {
      userPassword.setAttribute('type', 'password');
      iconEyeOpen.style.display = 'none';
      iconEyeOff.style.display = 'block';
    }
  });

  // Tab in password → focus login button
  function handleTabToSubmit(e) {
    if (e.key === 'Tab') {
      e.preventDefault();

      if (userPassword.getAttribute('type') !== 'password') {
        userPassword.setAttribute('type', 'password');
        const iconEyeOpen = document.querySelector(
          '#password-addon #icon-eye-open',
        );
        const iconEyeOff = document.querySelector(
          '#password-addon #icon-eye-off',
        );
        iconEyeOpen.style.display = 'none';
        iconEyeOff.style.display = 'block';
      }

      btnLogin.focus();
    }
  }

  userPassword.addEventListener('keydown', handleTabToSubmit);
  passwordAddon.addEventListener('keydown', handleTabToSubmit);

  // Tab in button → back to input user
  btnLogin.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      userId.focus();
    }
  });

  //trogger login button when user and pass 4 word
  function toggleButton() {
    const user = userId.value.trim();
    const pass = userPassword.value.trim();
    btnLogin.disabled = !(user.length >= 4 && pass.length >= 4);
  }

  userId.addEventListener('input', toggleButton);
  userPassword.addEventListener('input', toggleButton);

  // Enter when modal is opening → close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && alertModalEl.classList.contains('show')) {
      alertModal.hide();
    }
  });

  // when modal clsoe → reset form
  alertModalEl.addEventListener('hidden.bs.modal', () => {
    document.querySelectorAll("p[id^='alert-login-']").forEach((p) => {
      p.style.display = 'none';
    });

    userPassword.value = '';
    userPassword.focus();
    passwordAddon.style.display = 'none';
    btnLogin.disabled = true;
  });

  // Submit form login
  let isSubmitting = false;

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = userId.value.trim();
    const pass = userPassword.value.trim();

    if (!user || !pass) return;
    if (isSubmitting) return console.log('is submitting...');

    isSubmitting = true;

    try {
      const response = await axios.post('/api/admin/auth/login', {
        userId: user,
        userPassword: pass,
      });

      if (response.status === 200 && response.data) {
          gotoPage('/dashboard/main');
      }
    } catch (error) {
      const resultErr = error.response?.data ?? error;
      if (resultErr.statusCode && resultErr.message) {
        const p = document.getElementById(`alert-login-text`);
        p.style.display = 'block';
        p.innerText = resultErr.message;
      } else {
        const p = document.getElementById(`alert-login-text`);
        p.style.display = 'block';
        p.innerText = 'A temporary error has occurred. Please try again later.';
      }
      alertModal.show();
    } finally {
      isSubmitting = false;
    }
  });
});
