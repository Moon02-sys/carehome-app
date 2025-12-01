document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteWorker();
        });
    }
});

function deleteWorker() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    // Obtener el ID del trabajador desde la URL
    const pathParts = window.location.pathname.split('/');
    const workerId = pathParts[pathParts.length - 2]; // El ID está antes del último /
    
    // Deshabilitar botón mientras se procesa
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';
    
    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Enviar solicitud de eliminación
    fetch(`/management/workers/${workerId}/delete/`, {
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
                throw new Error(data.message || 'Error al eliminar trabajador');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Mostrar mensaje de éxito
            showDeleteSuccess('Trabajador eliminado correctamente');
            
            // Redirigir a la lista de trabajadores después de 1.5 segundos
            setTimeout(() => {
                window.location.href = '/management/workers/';
            }, 1500);
        } else {
            showDeleteError('Error al eliminar trabajador');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showDeleteError('Error al eliminar trabajador: ' + error.message);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
    });
}

function showDeleteError(message) {
    // Buscar o crear el div de error
    let errorDiv = document.getElementById('deleteWorkerError');
    
    if (!errorDiv) {
        // Crear el div si no existe
        errorDiv = document.createElement('div');
        errorDiv.id = 'deleteWorkerError';
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.setAttribute('role', 'alert');
        
        // Insertar al inicio del modal body
        const modalBody = document.querySelector('#deleteWorkerModal .modal-body');
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    // Configurar contenido del error
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(errorDiv);
        alert.close();
    }, 5000);
}

function showDeleteSuccess(message) {
    // Buscar o crear el div de éxito
    let successDiv = document.getElementById('deleteWorkerSuccess');
    
    if (!successDiv) {
        // Crear el div si no existe
        successDiv = document.createElement('div');
        successDiv.id = 'deleteWorkerSuccess';
        successDiv.className = 'alert alert-success alert-dismissible fade show';
        successDiv.setAttribute('role', 'alert');
        
        // Insertar al inicio del modal body
        const modalBody = document.querySelector('#deleteWorkerModal .modal-body');
        modalBody.insertBefore(successDiv, modalBody.firstChild);
    }
    
    // Configurar contenido del éxito
    successDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
}
