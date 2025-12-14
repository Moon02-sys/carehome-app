document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const profileEditForm = document.getElementById('profileEditForm');
    const laborEditForm = document.getElementById('laborEditForm');

    const personalDisplay = document.getElementById('personalDisplay');
    const personalFormWrapper = document.getElementById('personalFormWrapper');
    const laborDisplay = document.getElementById('laborDisplay');
    const laborFormWrapper = document.getElementById('laborFormWrapper');

    const togglePersonalEditBtn = document.getElementById('togglePersonalEditBtn');
    const toggleLaborEditBtn = document.getElementById('toggleLaborEditBtn');
    const cancelPersonalEdit = document.getElementById('cancelPersonalEdit');
    const cancelLaborEdit = document.getElementById('cancelLaborEdit');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                showMessage('error', 'Las contraseñas nuevas no coinciden');
                return;
            }
            // Validar longitud
            if (newPassword.length < 8) {
                showMessage('error', 'La contraseña debe tener al menos 8 caracteres');
                return;
            }
            
            try {
                const response = await fetch('/accounts/change-password/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        current_password: currentPassword,
                        new_password: newPassword
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    showMessage('success', result.message);
                    changePasswordForm.reset();
                } else {
                    showMessage('error', result.message);
                }
                
            } catch (error) {
                console.error('Error:', error);
                showMessage('error', 'Error al cambiar la contraseña');
            }
        });
    }

    if (profileEditForm) {
        profileEditForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const payload = {
                name: document.getElementById('profileName').value.trim(),
                first_surname: document.getElementById('profileFirstSurname').value.trim(),
                second_surname: document.getElementById('profileSecondSurname').value.trim(),
                phone: document.getElementById('profilePhone').value.trim(),
                email: document.getElementById('profileEmail').value.trim(),
                address: document.getElementById('profileAddress').value.trim(),
                locality: document.getElementById('profileLocality').value.trim(),
                province: document.getElementById('profileProvince').value.trim(),
                country: document.getElementById('profileCountry').value.trim()
            };

            if (!payload.name || !payload.first_surname) {
                showProfileMessage('error', 'Nombre y primer apellido son obligatorios');
                return;
            }

            await submitProfileUpdate(payload, 'profileEditMessage');
        });
    }

    if (laborEditForm) {
        laborEditForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const payload = {
                hire_date: document.getElementById('laborHireDate').value,
                social_security_number: document.getElementById('laborSSN').value.trim(),
                account_number: document.getElementById('laborAccount').value.trim(),
                disability_percentage: document.getElementById('laborDisability').value.trim()
            };

            // Solo incluir shift si el campo existe (para directores)
            const shiftField = document.getElementById('laborShift');
            if (shiftField) {
                payload.shift = shiftField.value.trim();
            }

            await submitProfileUpdate(payload, 'laborEditMessage');
        });
    }

    function setEditMode(isEditing, displayEl, formEl) {
        if (!displayEl || !formEl) return;
        displayEl.classList.toggle('d-none', isEditing);
        formEl.classList.toggle('d-none', !isEditing);
    }

    if (togglePersonalEditBtn) {
        togglePersonalEditBtn.addEventListener('click', () => {
            const editing = personalFormWrapper && personalFormWrapper.classList.contains('d-none');
            setEditMode(editing, personalDisplay, personalFormWrapper);
        });
    }

    if (toggleLaborEditBtn) {
        toggleLaborEditBtn.addEventListener('click', () => {
            const editing = laborFormWrapper && laborFormWrapper.classList.contains('d-none');
            setEditMode(editing, laborDisplay, laborFormWrapper);
        });
    }

    if (cancelPersonalEdit) {
        cancelPersonalEdit.addEventListener('click', () => {
            setEditMode(false, personalDisplay, personalFormWrapper);
        });
    }

    if (cancelLaborEdit) {
        cancelLaborEdit.addEventListener('click', () => {
            setEditMode(false, laborDisplay, laborFormWrapper);
        });
    }

    // Validación en tiempo real de requisitos de contraseña
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function() {
            const value = newPasswordInput.value;
            
            // Validar cada requisito
            const hasLength = value.length >= 8;
            const hasUppercase = /[A-Z]/.test(value);
            const hasLowercase = /[a-z]/.test(value);
            const hasNumber = /\d/.test(value);
            
            // Actualizar UI de cada requisito
            updateRequirement('req-length', hasLength);
            updateRequirement('req-uppercase', hasUppercase);
            updateRequirement('req-lowercase', hasLowercase);
            updateRequirement('req-number', hasNumber);
        });
    }

    function updateRequirement(elementId, isValid) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (isValid) {
            element.classList.remove('text-danger');
            element.classList.add('text-success');
            element.innerHTML = element.innerHTML.replace('bi-x-circle', 'bi-check-circle');
        } else {
            element.classList.remove('text-success');
            element.classList.add('text-danger');
            element.innerHTML = element.innerHTML.replace('bi-check-circle', 'bi-x-circle');
        }
    }
    
    function showMessage(type, message) {
        renderAlert('passwordMessage', type, message);
    }

    function showProfileMessage(type, message) {
        renderAlert('profileEditMessage', type, message);
    }

    function showLaborMessage(type, message) {
        renderAlert('laborEditMessage', type, message);
    }

    function renderAlert(containerId, type, message) {
        const target = document.getElementById(containerId);
        if (!target) return;
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        target.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi bi-${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }

    async function submitProfileUpdate(payload, messageContainerId) {
        try {
            const response = await fetch('/accounts/profile/update/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                renderAlert(messageContainerId, 'success', result.message || 'Perfil actualizado');
                setTimeout(() => window.location.reload(), 800);
            } else {
                renderAlert(messageContainerId, 'error', result.message || 'No se pudo actualizar el perfil');
            }
        } catch (error) {
            console.error('Error:', error);
            renderAlert(messageContainerId, 'error', 'Error al actualizar el perfil');
        }
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
