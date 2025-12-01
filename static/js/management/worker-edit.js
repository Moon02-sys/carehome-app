document.addEventListener('DOMContentLoaded', function() {
    const saveBtn = document.getElementById('saveEditWorkerBtn');
    const editWorkerForm = document.getElementById('editWorkerForm');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            submitEditWorkerForm();
        });
    }
});

function submitEditWorkerForm() {
    const form = document.getElementById('editWorkerForm');
    const saveBtn = document.getElementById('saveEditWorkerBtn');
    
    // Obtener el ID del trabajador desde la URL
    const pathParts = window.location.pathname.split('/');
    const workerId = pathParts[pathParts.length - 2]; // El ID está antes del último /
    
    // Validar campos requeridos
    const name = document.getElementById('name').value.trim();
    const first_surname = document.getElementById('first_surname').value.trim();
    const nif_nie = document.getElementById('nif_nie').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    
    if (!name || !first_surname || !nif_nie || !birthdate) {
        showEditError('Por favor, complete todos los campos obligatorios marcados con *');
        return;
    }
    
    // Deshabilitar botón mientras se procesa
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    // Crear FormData para enviar los datos (incluye archivos)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('first_surname', first_surname);
    formData.append('second_surname', document.getElementById('second_surname').value.trim());
    formData.append('nif_nie', nif_nie);
    formData.append('birthdate', birthdate);
    formData.append('gender', document.getElementById('gender').value);
    formData.append('address', document.getElementById('address').value.trim());
    formData.append('locality', document.getElementById('locality').value.trim());
    formData.append('province', document.getElementById('province').value);
    formData.append('country', document.getElementById('country').value.trim());
    formData.append('phone', document.getElementById('phone').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('social_security_number', document.getElementById('social_security_number').value.trim());
    formData.append('account_number', document.getElementById('account_number').value.trim());
    formData.append('hire_date', document.getElementById('hire_date').value);
    formData.append('disability_percentage', document.getElementById('disability_percentage').value);
    
    // Añadir foto de perfil si se seleccionó una nueva
    const photoInput = document.getElementById('profile_photo');
    if (photoInput.files.length > 0) {
        formData.append('profile_photo', photoInput.files[0]);
    }
    
    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Enviar solicitud
    fetch(`/management/workers/${workerId}/edit/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error al actualizar trabajador');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Mostrar mensaje de éxito
            showEditSuccess('Trabajador actualizado correctamente');
            
            // Cerrar modal después de 1.5 segundos y recargar página
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('editWorkerModal'));
                modal.hide();
                // Recargar la página para mostrar los datos actualizados
                window.location.reload();
            }, 1500);
        } else {
            showEditError('Error al actualizar trabajador: ' + JSON.stringify(data.errors));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showEditError('Error al actualizar trabajador: ' + error.message);
    })
    .finally(() => {
        // Rehabilitar botón
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-save"></i> Guardar Cambios';
    });
}

function showEditError(message) {
    // Buscar o crear el div de error
    let errorDiv = document.getElementById('editWorkerError');
    
    if (!errorDiv) {
        // Crear el div si no existe
        errorDiv = document.createElement('div');
        errorDiv.id = 'editWorkerError';
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.setAttribute('role', 'alert');
        
        // Insertar al inicio del modal body
        const modalBody = document.querySelector('#editWorkerModal .modal-body');
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    // Configurar contenido del error
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Hacer scroll al inicio del modal para mostrar el error
    document.querySelector('#editWorkerModal .modal-body').scrollTop = 0;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(errorDiv);
        alert.close();
    }, 5000);
}

function showEditSuccess(message) {
    // Buscar o crear el div de éxito
    let successDiv = document.getElementById('editWorkerSuccess');
    
    if (!successDiv) {
        // Crear el div si no existe
        successDiv = document.createElement('div');
        successDiv.id = 'editWorkerSuccess';
        successDiv.className = 'alert alert-success alert-dismissible fade show';
        successDiv.setAttribute('role', 'alert');
        
        // Insertar al inicio del modal body
        const modalBody = document.querySelector('#editWorkerModal .modal-body');
        modalBody.insertBefore(successDiv, modalBody.firstChild);
    }
    
    // Configurar contenido del éxito
    successDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Hacer scroll al inicio del modal para mostrar el mensaje
    document.querySelector('#editWorkerModal .modal-body').scrollTop = 0;
}
