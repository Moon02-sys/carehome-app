document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteResident();
        });
    }
});

function deleteResident() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    // Obtener el ID del residente desde la URL
    const pathParts = window.location.pathname.split('/');
    const residentId = pathParts[pathParts.length - 2];
    
    // Deshabilitar botón
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';
    
    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Enviar solicitud
    fetch(`/management/residents/${residentId}/delete/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error al eliminar residente');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showDeleteSuccess('Residente eliminado correctamente');
            setTimeout(() => {
                window.location.href = '/management/residents/';
            }, 1500);
        } else {
            showDeleteError('Error al eliminar residente');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showDeleteError('Error al eliminar residente: ' + error.message);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
    });
}

function showDeleteError(message) {
    let errorDiv = document.getElementById('deleteResidentError');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'deleteResidentError';
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.setAttribute('role', 'alert');
        
        const modalBody = document.querySelector('#deleteResidentModal .modal-body');
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(errorDiv);
        alert.close();
    }, 5000);
}

function showDeleteSuccess(message) {
    let successDiv = document.getElementById('deleteResidentSuccess');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'deleteResidentSuccess';
        successDiv.className = 'alert alert-success alert-dismissible fade show';
        successDiv.setAttribute('role', 'alert');
        
        const modalBody = document.querySelector('#deleteResidentModal .modal-body');
        modalBody.insertBefore(successDiv, modalBody.firstChild);
    }
    
    successDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
}
