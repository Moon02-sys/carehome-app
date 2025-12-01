document.addEventListener('DOMContentLoaded', function() {
    const addResidentModal = new bootstrap.Modal(document.getElementById('addResidentModal'));
    const saveResidentBtn = document.getElementById('saveResidentBtn');
    const residentForm = document.getElementById('addResidentForm');

    saveResidentBtn.addEventListener('click', function() {
        // Recoger datos del formulario
        const formData = {
            name: document.getElementById('id_name').value.trim(),
            first_surname: document.getElementById('id_first_surname').value.trim(),
            second_surname: document.getElementById('id_second_surname').value.trim(),
            nif_nie: document.getElementById('id_nif_nie').value.trim(),
            birthdate: document.getElementById('id_birthdate').value,
            gender: document.getElementById('id_gender').value,
            address: document.getElementById('id_address').value.trim(),
            locality: document.getElementById('id_locality').value.trim(),
            province: document.getElementById('id_province').value.trim(),
            country: document.getElementById('id_country').value.trim(),
            phone: document.getElementById('id_phone').value.trim(),
            social_security_number: document.getElementById('id_social_security_number').value.trim()
        };

        // Validación básica
        if (!formData.name || !formData.first_surname || !formData.nif_nie) {
            alert('Por favor, completa los campos obligatorios: Nombre, Primer Apellido y NIF/NIE');
            return;
        }

        // Deshabilitar botón mientras se procesa
        saveResidentBtn.disabled = true;
        saveResidentBtn.textContent = 'Guardando...';

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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cerrar modal y resetear formulario
                addResidentModal.hide();
                residentForm.reset();
                
                // Mostrar mensaje de éxito
                alert(data.message);
                
                // Recargar la página para mostrar el nuevo residente
                location.reload();
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
                alert(errorMessage);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error de conexión. Por favor, intenta de nuevo.');
        })
        .finally(() => {
            // Rehabilitar botón
            saveResidentBtn.disabled = false;
            saveResidentBtn.textContent = 'Guardar';
        });
    });

    // Resetear formulario cuando se cierra el modal
    document.getElementById('addResidentModal').addEventListener('hidden.bs.modal', function () {
        residentForm.reset();
    });
});
