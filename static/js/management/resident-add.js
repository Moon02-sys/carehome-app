document.addEventListener('DOMContentLoaded', function() {
    const saveResidentBtn = document.getElementById('saveResidentBtn');
    const residentForm = document.getElementById('addResidentForm');
    const addResidentModal = new bootstrap.Modal(document.getElementById('addResidentModal'));

    if (saveResidentBtn) {
        saveResidentBtn.addEventListener('click', function() {
            // Recoger datos del formulario
            const formData = {
                name: document.getElementById('name').value.trim(),
                first_surname: document.getElementById('first_surname').value.trim(),
                second_surname: document.getElementById('second_surname').value.trim(),
                nif_nie: document.getElementById('nif_nie').value.trim(),
                birthdate: document.getElementById('birthdate').value,
                gender: document.getElementById('gender').value,
                address: document.getElementById('address').value.trim(),
                locality: document.getElementById('locality').value.trim(),
                province: document.getElementById('province').value.trim(),
                country: document.getElementById('country').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                social_security_number: document.getElementById('social_security_number').value.trim(),
                // Datos médicos básicos
                blood_type: document.getElementById('blood_type').value,
                allergies: document.getElementById('allergies').value.trim(),
                chronic_diseases: document.getElementById('chronic_diseases').value.trim(),
                current_medications: document.getElementById('current_medications').value.trim(),
                // Información médica adicional
                medical_insurance: document.getElementById('medical_insurance').value.trim(),
                insurance_number: document.getElementById('insurance_number').value.trim(),
                primary_doctor: document.getElementById('primary_doctor').value.trim(),
                doctor_phone: document.getElementById('doctor_phone').value.trim(),
                // Movilidad y dependencia
                mobility_level: document.getElementById('mobility_level').value,
                dependency_degree: document.getElementById('dependency_degree').value,
                uses_wheelchair: document.getElementById('uses_wheelchair').checked,
                uses_walker: document.getElementById('uses_walker').checked,
                // Contacto de emergencia
                emergency_contact_name: document.getElementById('emergency_contact_name').value.trim(),
                emergency_contact_relationship: document.getElementById('emergency_contact_relationship').value.trim(),
                emergency_contact_phone: document.getElementById('emergency_contact_phone').value.trim()
            };

            // Validación básica
            if (!formData.name || !formData.first_surname || !formData.nif_nie || !formData.birthdate || !formData.gender) {
                showResidentError('Por favor, completa los campos obligatorios: Nombre, Primer Apellido, NIF/NIE, Fecha de Nacimiento y Género');
                return;
            }

            // Deshabilitar botón mientras se procesa
            saveResidentBtn.disabled = true;
            saveResidentBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

            // Obtener el token CSRF
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Enviar datos al servidor
            fetch('/management/residents/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
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
                    addResidentModal.hide();
                    residentForm.reset();
                    
                    // Mostrar mensaje de éxito
                    showResidentSuccess(data.message);
                    
                    // Recargar la página para mostrar el nuevo residente
                    setTimeout(() => location.reload(), 1000);
                } else {
                    // Mostrar errores
                    let errorMessage = 'Error al guardar el residente:\n\n';
                    if (data.errors) {
                        for (const [field, errors] of Object.entries(data.errors)) {
                            errorMessage += `${field}: ${errors.join(', ')}\n`;
                        }
                    } else if (data.message) {
                        errorMessage = data.message;
                    }
                    showResidentError(errorMessage);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showResidentError('Error de conexión. Por favor, intenta de nuevo.');
            })
            .finally(() => {
                // Rehabilitar botón
                saveResidentBtn.disabled = false;
                saveResidentBtn.innerHTML = '<i class="bi bi-save"></i> Guardar';
            });
        });
    }

    // Resetear formulario cuando se cierra el modal
    document.getElementById('addResidentModal').addEventListener('hidden.bs.modal', function () {
        residentForm.reset();
        // Limpiar mensajes de error si existen
        const errorDiv = document.getElementById('residentError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    });
});

function showResidentError(message) {
    let errorDiv = document.getElementById('residentError');
    
    if (!errorDiv) {
        const modalBody = document.querySelector('#addResidentModal .modal-body');
        errorDiv = document.createElement('div');
        errorDiv.id = 'residentError';
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = `
            <span></span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    errorDiv.querySelector('span').textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showResidentSuccess(message) {
    let successDiv = document.getElementById('residentSuccess');
    
    if (!successDiv) {
        const container = document.querySelector('.container-fluid');
        successDiv = document.createElement('div');
        successDiv.id = 'residentSuccess';
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
