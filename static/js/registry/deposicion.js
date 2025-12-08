document.addEventListener('DOMContentLoaded', function() {
    let selectedResident = null;
    
    // Seleccionar residente
    document.querySelectorAll('#deposicion [data-resident-id]').forEach(button => {
        button.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('#deposicion [data-resident-id]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Marcar como seleccionado
            this.classList.add('active');
            selectedResident = {
                id: this.dataset.residentId,
                name: this.dataset.residentName
            };
            
            // Ocultar mensaje y mostrar botón de añadir dentro del tab de deposición
            const deposicionTab = document.getElementById('deposicion');
            const noResidentMsg = deposicionTab.querySelector('#noResidentMessage');
            const addBtn = deposicionTab.querySelector('#addDeposicionEntry');
            if (noResidentMsg) noResidentMsg.style.display = 'none';
            if (addBtn) addBtn.style.display = 'block';
        });
    });
    
    // Añadir nueva entrada
    document.getElementById('addDeposicionEntry').addEventListener('click', function() {
        addNewEntry();
    });
    
    function addNewEntry() {
        if (!selectedResident) {
            showAlert('Por favor, seleccione un residente', 'warning');
            return;
        }
        
        const template = document.getElementById('deposicionEntryTemplate');
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
        setupEntryButtons(entryItem, 'deposicion', selectedResident.id);
        
        document.getElementById('deposicionEntriesContainer').prepend(clone);
    }
});
