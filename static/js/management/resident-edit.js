document.addEventListener('DOMContentLoaded', function() {
    // Abrir modal de edición automáticamente si viene del parámetro ?edit=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true') {
        const editModalElement = document.getElementById('editResidentModal');
        const editModal = new bootstrap.Modal(editModalElement);
        editModal.show();
        
        // Función para limpiar la URL
        function cleanURL() {
            const url = new URL(window.location);
            url.searchParams.delete('edit');
            window.history.replaceState({}, '', url);
        }
        
        // Limpiar el parámetro cuando se cierra el modal
        editModalElement.addEventListener('hidden.bs.modal', cleanURL);
        
        // También agregar listeners a los botones de cerrar por si acaso
        const closeBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelModalBtn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                editModal.hide();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                editModal.hide();
            });
        }
    }

    const saveBtn = document.getElementById('saveEditResidentBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            submitEditResidentForm();
        });
    }
});

function submitEditResidentForm() {
    const saveBtn = document.getElementById('saveEditResidentBtn');
    
    // Obtener el ID del residente desde la URL
    const pathParts = window.location.pathname.split('/');
    const residentId = pathParts[pathParts.length - 2];
    
    // Validar campos requeridos
    const name = document.getElementById('name').value.trim();
    const first_surname = document.getElementById('first_surname').value.trim();
    const nif_nie = document.getElementById('nif_nie').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;
    
    if (!name || !first_surname || !nif_nie || !birthdate || !gender) {
        showEditError('Por favor, complete todos los campos obligatorios marcados con *');
        return;
    }
    
    // Deshabilitar botón
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    // Crear objeto con los datos
    const data = {
        name: name,
        first_surname: first_surname,
        second_surname: document.getElementById('second_surname').value.trim(),
        nif_nie: nif_nie,
        birthdate: birthdate,
        gender: gender,
        address: document.getElementById('address').value.trim(),
        locality: document.getElementById('locality').value.trim(),
        province: document.getElementById('province').value.trim(),
        country: document.getElementById('country').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        social_security_number: document.getElementById('social_security_number').value.trim(),
        blood_type: document.getElementById('blood_type').value,
        allergies: document.getElementById('allergies').value.trim(),
        chronic_diseases: document.getElementById('chronic_diseases').value.trim(),
        current_medications: document.getElementById('current_medications').value.trim(),
        medical_insurance: document.getElementById('medical_insurance').value.trim(),
        insurance_number: document.getElementById('insurance_number').value.trim(),
        primary_doctor: document.getElementById('primary_doctor').value.trim(),
        doctor_phone: document.getElementById('doctor_phone').value.trim(),
        mobility_level: document.getElementById('mobility_level').value,
        dependency_degree: document.getElementById('dependency_degree').value,
        uses_wheelchair: document.getElementById('uses_wheelchair').checked,
        uses_walker: document.getElementById('uses_walker').checked,
        emergency_contact_name: document.getElementById('emergency_contact_name').value.trim(),
        emergency_contact_relationship: document.getElementById('emergency_contact_relationship').value.trim(),
        emergency_contact_phone: document.getElementById('emergency_contact_phone').value.trim()
    };
    
    // Obtener el token CSRF
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Enviar solicitud
    fetch(`/management/residents/${residentId}/edit/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error al actualizar residente');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showEditSuccess('Residente actualizado correctamente');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            showEditError('Error al actualizar residente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showEditError('Error al actualizar residente: ' + error.message);
    })
    .finally(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="bi bi-save"></i> Guardar Cambios';
    });
}

function showEditError(message) {
    let errorDiv = document.getElementById('editResidentError');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'editResidentError';
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.setAttribute('role', 'alert');
        
        const modalBody = document.querySelector('#editResidentModal .modal-body');
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.querySelector('#editResidentModal .modal-body').scrollTop = 0;
    
    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance(errorDiv);
        alert.close();
    }, 5000);
}

function showEditSuccess(message) {
    let successDiv = document.getElementById('editResidentSuccess');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'editResidentSuccess';
        successDiv.className = 'alert alert-success alert-dismissible fade show';
        successDiv.setAttribute('role', 'alert');
        
        const modalBody = document.querySelector('#editResidentModal .modal-body');
        modalBody.insertBefore(successDiv, modalBody.firstChild);
    }
    
    successDiv.innerHTML = `
        <i class="bi bi-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.querySelector('#editResidentModal .modal-body').scrollTop = 0;
}

// Actualizar configuración de registros
async function updateRegistrySettings(type, enabled) {
    try {
        // Obtener el ID del residente desde la URL
        const pathParts = window.location.pathname.split('/');
        const residentId = pathParts[pathParts.length - 2];
        
        const response = await fetch(`/management/api/residents/${residentId}/registry-settings/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                type: type,
                enabled: enabled
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Configuración actualizada correctamente');
        } else {
            showAlert('Error al actualizar: ' + result.message, 'danger');
            // Revertir el checkbox
            document.getElementById(`enable${type.charAt(0).toUpperCase() + type.slice(1)}`).checked = !enabled;
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error al actualizar la configuración', 'danger');
        // Revertir el checkbox
        document.getElementById(`enable${type.charAt(0).toUpperCase() + type.slice(1)}`).checked = !enabled;
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
