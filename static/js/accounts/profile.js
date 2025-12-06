document.addEventListener('DOMContentLoaded', function() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('passwordMessage');
            
            // Limpiar mensajes anteriores
            messageDiv.innerHTML = '';
            
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
    
    function showMessage(type, message) {
        const messageDiv = document.getElementById('passwordMessage');
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
        
        messageDiv.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi bi-${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
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
