document.addEventListener('DOMContentLoaded', function() {
    const saveWorkerBtn = document.getElementById('saveWorkerBtn');
    const workerForm = document.getElementById('addWorkerForm');
    const addWorkerModal = new bootstrap.Modal(document.getElementById('addWorkerModal'));

    if (saveWorkerBtn) {
        saveWorkerBtn.addEventListener('click', function() {
            // Recoger datos del formulario
            const formData = new FormData();
            
            // Datos personales
            formData.append('name', document.getElementById('name').value.trim());
            formData.append('first_surname', document.getElementById('first_surname').value.trim());
            formData.append('second_surname', document.getElementById('second_surname').value.trim());
            formData.append('nif_nie', document.getElementById('nif_nie').value.trim());
            formData.append('birthdate', document.getElementById('birthdate').value);
            formData.append('gender', document.getElementById('gender').value);
            
            // Datos de contacto
            formData.append('address', document.getElementById('address').value.trim());
            formData.append('locality', document.getElementById('locality').value.trim());
            formData.append('province', document.getElementById('province').value);
            formData.append('country', 'España'); // Por defecto
            formData.append('phone', document.getElementById('phone').value.trim());
            formData.append('email', document.getElementById('email').value.trim());
            
            // Datos laborales
            formData.append('social_security_number', document.getElementById('social_security_number').value.trim());
            formData.append('account_number', document.getElementById('account_number').value.trim());
            formData.append('hire_date', document.getElementById('hire_date').value);
            formData.append('disability_percentage', document.getElementById('disability_percentage').value);
            
            // Foto de perfil si existe
            const photoInput = document.getElementById('profile_photo');
            if (photoInput.files.length > 0) {
                formData.append('profile_photo', photoInput.files[0]);
            }

            // Validación básica
            if (!formData.get('name') || !formData.get('first_surname') || !formData.get('nif_nie') || !formData.get('birthdate')) {
                showWorkerError('Por favor, completa los campos obligatorios: Nombre, Primer Apellido, NIF/NIE y Fecha de Nacimiento');
                return;
            }

            // Deshabilitar botón mientras se procesa
            saveWorkerBtn.disabled = true;
            saveWorkerBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

            // Obtener el token CSRF
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Enviar datos al servidor
            fetch('/management/workers/add/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                    // NO incluir Content-Type, FormData lo configura automáticamente
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    // Si no es JSON, mostrar el texto del error
                    return response.text().then(text => {
                        console.error('Respuesta del servidor:', text.substring(0, 500));
                        throw new Error('Error del servidor. Ver consola para detalles.');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    // Cerrar modal y resetear formulario
                    addWorkerModal.hide();
                    workerForm.reset();
                    
                    // Mostrar mensaje de éxito
                    showWorkerSuccess(data.message);
                    
                    // Recargar la página para mostrar el nuevo trabajador
                    setTimeout(() => location.reload(), 1000);
                } else {
                    // Mostrar errores
                    let errorMessage = 'Error al guardar el trabajador:\n\n';
                    if (data.errors) {
                        for (const [field, errors] of Object.entries(data.errors)) {
                            errorMessage += `${field}: ${errors.join(', ')}\n`;
                        }
                    } else if (data.message) {
                        errorMessage = data.message;
                    }
                    showWorkerError(errorMessage);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showWorkerError('Error de conexión. Por favor, intenta de nuevo.');
            })
            .finally(() => {
                // Rehabilitar botón
                saveWorkerBtn.disabled = false;
                saveWorkerBtn.innerHTML = '<i class="bi bi-save"></i> Guardar';
            });
        });
    }

    // Resetear formulario cuando se cierra el modal
    document.getElementById('addWorkerModal').addEventListener('hidden.bs.modal', function () {
        workerForm.reset();
    });
});

function showWorkerError(message) {
    let errorDiv = document.getElementById('workerError');
    
    if (!errorDiv) {
        const modalBody = document.querySelector('#addWorkerModal .modal-body');
        errorDiv = document.createElement('div');
        errorDiv.id = 'workerError';
        errorDiv.className = 'alert alert-danger';
        errorDiv.role = 'alert';
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showWorkerSuccess(message) {
    let successDiv = document.getElementById('workerSuccess');
    
    if (!successDiv) {
        const container = document.querySelector('.container-fluid');
        successDiv = document.createElement('div');
        successDiv.id = 'workerSuccess';
        successDiv.className = 'alert alert-success alert-dismissible fade show';
        successDiv.role = 'alert';
        successDiv.innerHTML = `
            <span>${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        container.insertBefore(successDiv, container.firstChild);
    } else {
        successDiv.querySelector('span').textContent = message;
        successDiv.style.display = 'block';
        successDiv.classList.add('show');
    }
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}
