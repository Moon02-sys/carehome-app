document.addEventListener('DOMContentLoaded', function() {
    let selectedResident = null;
    
    // Seleccionar residente
    document.querySelectorAll('#alimentacion [data-resident-id]').forEach(button => {
        button.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('#alimentacion [data-resident-id]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Marcar como seleccionado
            this.classList.add('active');
            selectedResident = {
                id: this.dataset.residentId,
                name: this.dataset.residentName
            };
            
            // Ocultar mensaje y mostrar botón de añadir dentro del tab de alimentación
            const alimentacionTab = document.getElementById('alimentacion');
            const noResidentMsg = alimentacionTab.querySelector('#noResidentMessage');
            const addBtn = alimentacionTab.querySelector('#addAlimentacionEntry');
            if (noResidentMsg) noResidentMsg.style.display = 'none';
            if (addBtn) addBtn.style.display = 'block';
        });
    });
    
    // Añadir nueva entrada al hacer clic en el botón principal
    document.getElementById('addAlimentacionEntry').addEventListener('click', function() {
        addNewEntry();
    });
    
    function addNewEntry() {
        if (!selectedResident) {
            showAlert('Por favor, seleccione un residente', 'warning');
            return;
        }
        
        const template = document.getElementById('alimentacionEntryTemplate');
        const clone = template.content.cloneNode(true);
        
        // Establecer hora actual
        const now = new Date();
        clone.querySelector('.hour-input').value = now.getHours().toString().padStart(2, '0');
        clone.querySelector('.minute-input').value = now.getMinutes().toString().padStart(2, '0');
        
        const entryItem = clone.querySelector('.entry-item');
        
        // Mostrar todos los campos del formulario directamente
        const fieldsContainer = clone.querySelector('.card-body');
        fieldsContainer.style.display = 'block';
        
        // Usar setupEntryButtons para manejar todos los botones
        setupEntryButtons(entryItem, 'alimentacion', selectedResident.id);
        
        document.getElementById('alimentacionEntriesContainer').prepend(clone);
    }
});
