document.addEventListener('DOMContentLoaded', function() {
    let workerToDelete = null;

    // Función para abrir modal de confirmación
    window.openDeleteModal = function(workerId, workerName) {
        workerToDelete = workerId;
        document.getElementById('deleteWorkerName').textContent = workerName;
        const modal = new bootstrap.Modal(document.getElementById('deleteWorkerListModal'));
        modal.show();
    };

    // Confirmar eliminación
    const confirmDeleteBtn = document.getElementById('confirmDeleteWorkerListBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (!workerToDelete) return;

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            // Deshabilitar botón mientras se procesa
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Eliminando...';

            fetch(`/management/workers/${workerToDelete}/delete/`, {
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
                    const modalElement = document.getElementById('deleteWorkerListModal');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();

                    // Recargar página para ver cambios
                    window.location.reload();
                } else {
                    alert('Error: ' + (data.message || 'No se pudo eliminar el trabajador'));
                    confirmDeleteBtn.disabled = false;
                    confirmDeleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el trabajador');
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
            });
        });
    }
});
