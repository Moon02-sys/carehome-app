document.addEventListener('DOMContentLoaded', function() {
    let residentToDelete = null;

    // Función para abrir modal de confirmación
    window.openDeleteResidentModal = function(residentId, residentName) {
        residentToDelete = residentId;
        document.getElementById('deleteResidentName').textContent = residentName;
        const modal = new bootstrap.Modal(document.getElementById('deleteResidentListModal'));
        modal.show();
    };

    // Confirmar eliminación
    const confirmDeleteBtn = document.getElementById('confirmDeleteResidentListBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (!residentToDelete) return;

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Deshabilitar botón mientras se procesa
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';

            fetch(`/management/residents/${residentToDelete}/delete/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Cerrar modal
                    const modalElement = document.getElementById('deleteResidentListModal');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                    // Recargar página para ver cambios
                    window.location.reload();
                } else {
                    showAlert('Error: ' + (data.message || 'No se pudo eliminar el residente'), 'danger');
                    confirmDeleteBtn.disabled = false;
                    confirmDeleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error al eliminar el residente', 'danger');
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            });
        });
    }
});
