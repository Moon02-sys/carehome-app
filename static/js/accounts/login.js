// login.js - refactorizado para ejecutarse como archivo independiente
document.addEventListener('DOMContentLoaded', function () {
    initLoginValidation();
    initRecoveryValidation();
    initLoginFormSubmit();
});

function initLoginFormSubmit() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btnLogin = document.getElementById('btnLogin');
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        
        // Deshabilitar botón durante el envío
        btnLogin.disabled = true;
        btnLogin.textContent = 'Iniciando...';
        
        fetch('/accounts/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error al iniciar sesión');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect_url;
            } else {
                showLoginError(data.error || 'Error al iniciar sesión');
                btnLogin.disabled = false;
                btnLogin.textContent = 'Iniciar sesión';
            }
        })
        .catch(error => {
            showLoginError(error.message || 'Usuario o contraseña incorrectos');
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar sesión';
        });
    });
}

function showLoginError(message) {
    let errorDiv = document.getElementById('loginError');
    let errorMessage = document.getElementById('loginErrorMessage');
    
    // Si no existen, crearlos dinámicamente
    if (!errorDiv || !errorMessage) {
        const loginCard = document.querySelector('.login-card');
        const title = loginCard ? loginCard.querySelector('.login-title') : null;
        
        if (!title) return;
        
        errorDiv = document.createElement('div');
        errorDiv.id = 'loginError';
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.role = 'alert';
        
        errorMessage = document.createElement('span');
        errorMessage.id = 'loginErrorMessage';
        errorDiv.appendChild(errorMessage);
        
        title.after(errorDiv);
    }
    
    errorMessage.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(function() {
        errorDiv.style.display = 'none';
    }, 5000);
}

function initLoginValidation() {
    const pwd = document.getElementById('password');
    if (!pwd) return; // no estamos en la página de login

    const icon = document.getElementById('password-icon');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqNumber = document.getElementById('req-number');
    const reqLength = document.getElementById('req-length');
    const requirementsDiv = document.getElementById('password-requirements');
    const username = document.getElementById('username');
    const btnLogin = document.getElementById('btnLogin');

    function validatePassword(value) {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasLength = value.length >= 8;
        return { hasUpper, hasLower, hasNumber, hasLength };
    }

    function updateUI(state) {
        if (reqUpper) reqUpper.style.color = state.hasUpper ? '#198754' : '#dc3545';
        if (reqLower) reqLower.style.color = state.hasLower ? '#198754' : '#dc3545';
        if (reqNumber) reqNumber.style.color = state.hasNumber ? '#198754' : '#dc3545';
        if (reqLength) reqLength.style.color = state.hasLength ? '#198754' : '#dc3545';

        const allOk = state.hasUpper && state.hasLower && state.hasNumber && state.hasLength;
        if (!allOk && pwd.value.length > 0) {
            if (icon) icon.style.display = 'block';
            pwd.classList.add('is-invalid');
        } else {
            if (icon) icon.style.display = 'none';
            pwd.classList.remove('is-invalid');
        }
        checkFormValidity();
    }

    function checkFormValidity() {
        if (!btnLogin) return;
        const state = validatePassword(pwd.value || '');
        const isUsernameValid = username ? username.value.trim().length > 0 : false;
        const isPasswordValid = state.hasUpper && state.hasLower && state.hasNumber && state.hasLength;
        // Comentamos la validación estricta para permitir cualquier contraseña
        // btnLogin.disabled = !(isUsernameValid && isPasswordValid);
        btnLogin.disabled = !isUsernameValid; // Solo validar que haya username
    }

    pwd.addEventListener('input', function (e) {
        const s = validatePassword(e.target.value);
        updateUI(s);
    });

    if (requirementsDiv) {
        pwd.addEventListener('focus', function () { requirementsDiv.style.display = 'block'; });
        pwd.addEventListener('blur', function () { requirementsDiv.style.display = 'none'; });
    }

    if (username) username.addEventListener('input', checkFormValidity);

    // El formulario se enviará normalmente, no necesitamos interceptar el click
    // Initialize UI (autofill cases)
    updateUI(validatePassword(pwd.value || ''));
}

function initRecoveryValidation() {
    const newPwd = document.getElementById('newPassword');
    if (!newPwd) return; // no hay modal de recovery en esta página

    const confirmPwd = document.getElementById('confirmPassword');
    const newPwdIcon = document.getElementById('new-pwd-icon');
    const confirmPwdIcon = document.getElementById('confirm-pwd-icon');
    const confirmFeedback = document.getElementById('confirmPasswordFeedback');
    const btnSubmit = document.getElementById('btnRecoverSubmit');
    const recoveryRequirements = document.getElementById('recovery-requirements');
    const recReqUpper = document.getElementById('rec-req-upper');
    const recReqLower = document.getElementById('rec-req-lower');
    const recReqNumber = document.getElementById('rec-req-number');
    const recReqLength = document.getElementById('rec-req-length');
    const recoveryUsername = document.getElementById('recoveryUsername');
    const recoveryModal = document.getElementById('recoveryModal');
    const recoveryForm = document.getElementById('recoveryForm');

    function validateNew(value) {
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasLength = value.length >= 8;
        return { hasUpper, hasLower, hasNumber, hasLength };
    }

    function updateUI() {
        const newState = validateNew(newPwd.value || '');
        const match = newPwd.value === (confirmPwd ? confirmPwd.value : '') && newPwd.value.length > 0;

        if (recReqUpper) recReqUpper.style.color = newState.hasUpper ? '#198754' : '#dc3545';
        if (recReqLower) recReqLower.style.color = newState.hasLower ? '#198754' : '#dc3545';
        if (recReqNumber) recReqNumber.style.color = newState.hasNumber ? '#198754' : '#dc3545';
        if (recReqLength) recReqLength.style.color = newState.hasLength ? '#198754' : '#dc3545';

        const allOk = newState.hasUpper && newState.hasLower && newState.hasNumber && newState.hasLength;

        if (!allOk && newPwd.value.length > 0) {
            if (newPwdIcon) newPwdIcon.style.display = 'block';
            newPwd.classList.add('is-invalid');
        } else {
            if (newPwdIcon) newPwdIcon.style.display = 'none';
            newPwd.classList.remove('is-invalid');
        }

        if (confirmPwd) {
            if (confirmPwd.value.length > 0) {
                if (match) {
                    confirmPwd.classList.remove('is-invalid');
                    if (confirmPwdIcon) confirmPwdIcon.style.display = 'none';
                    if (confirmFeedback) { confirmFeedback.textContent = ''; confirmFeedback.style.color = '#198754'; }
                } else {
                    confirmPwd.classList.add('is-invalid');
                    if (confirmPwdIcon) confirmPwdIcon.style.display = 'block';
                    if (confirmFeedback) { confirmFeedback.textContent = 'Las contraseñas no coinciden'; confirmFeedback.style.color = '#dc3545'; }
                }
            } else {
                confirmPwd.classList.remove('is-invalid');
                if (confirmPwdIcon) confirmPwdIcon.style.display = 'none';
                if (confirmFeedback) { confirmFeedback.textContent = ''; }
            }
        }

        const canSubmit = allOk && match && recoveryUsername && recoveryUsername.value.trim().length > 0;
        if (btnSubmit) btnSubmit.disabled = !canSubmit;
    }

    newPwd.addEventListener('input', updateUI);
    if (confirmPwd) confirmPwd.addEventListener('input', updateUI);
    if (recoveryUsername) recoveryUsername.addEventListener('input', updateUI);

    if (recoveryRequirements) {
        newPwd.addEventListener('focus', function () { recoveryRequirements.style.display = 'block'; });
        newPwd.addEventListener('blur', function () { recoveryRequirements.style.display = 'none'; });
    }

    if (recoveryModal && recoveryForm) {
        recoveryModal.addEventListener('hidden.bs.modal', function () {
            recoveryForm.reset();
            if (recoveryRequirements) recoveryRequirements.style.display = 'none';
            updateUI();
        });
    }

    // Handle recover submit click: send username + new password to backend
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async function () {
            if (btnSubmit.disabled) return;
            const username = recoveryUsername ? recoveryUsername.value.trim() : '';
            const newPasswordVal = newPwd ? newPwd.value : '';
            try {
                const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
                const resp = await fetch('/accounts/recover/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrftoken || ''
                    },
                    body: JSON.stringify({ username: username, new_password: newPasswordVal })
                });
                const data = await resp.json();
                if (data.success) {
                    // close modal and show success (simple alert)
                    const modalEl = document.getElementById('recoveryModal');
                    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    bsModal.hide();
                    alert('Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.');
                } else {
                    alert(data.message || 'Error al recuperar contraseña');
                }
            } catch (e) {
                console.error(e);
                alert('Error al recuperar contraseña');
            }
        });
    }

    // initialize
    updateUI();
}