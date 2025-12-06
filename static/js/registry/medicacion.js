document.addEventListener('DOMContentLoaded', function() {
    let selectedResident = null;
    let residentMedications = [];
    
    // Seleccionar residente
    document.querySelectorAll('#medicacion [data-resident-id]').forEach(button => {
        button.addEventListener('click', function() {
            // Remover selección anterior
            document.querySelectorAll('#medicacion [data-resident-id]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Marcar como seleccionado
            this.classList.add('active');
            selectedResident = {
                id: this.dataset.residentId,
                name: this.dataset.residentName
            };
            
            // Parsear medicaciones del residente
            const medicationsData = this.dataset.medications || '';
            residentMedications = medicationsData.split('\n')
                .filter(med => med.trim())
                .map(med => {
                    // Formato esperado: "Atenolol Cinfa, 25mg, comprimidos."
                    const parts = med.split(',').map(p => p.trim());
                    return {
                        full: med.trim(),
                        name: parts[0] || '',
                        dosage: parts[1] || ''
                    };
                });
            
            // Ocultar mensaje y mostrar botón de añadir dentro del tab de medicación
            const medicacionTab = document.getElementById('medicacion');
            const noResidentMsg = medicacionTab.querySelector('#noResidentMessage');
            const addBtn = medicacionTab.querySelector('#addMedicacionEntry');
            if (noResidentMsg) noResidentMsg.style.display = 'none';
            if (addBtn) addBtn.style.display = 'block';
        });
    });
    
    // Añadir nueva entrada al hacer clic en el botón principal
    document.getElementById('addMedicacionEntry').addEventListener('click', function() {
        addNewEntry();
    });
    
    function addNewEntry() {
        if (!selectedResident) {
            alert('Por favor, seleccione un residente');
            return;
        }
        
        const template = document.getElementById('medicacionEntryTemplate');
        const clone = template.content.cloneNode(true);
        
        // Establecer hora actual
        const now = new Date();
        clone.querySelector('.hour-input').value = now.getHours().toString().padStart(2, '0');
        clone.querySelector('.minute-input').value = now.getMinutes().toString().padStart(2, '0');
        
        const entryItem = clone.querySelector('.entry-item');
        
        // Poblar select de medicamentos con las medicaciones del residente
        const medSelect = clone.querySelector('.medication-name-select');
        const dosageInput = clone.querySelector('.dosage-input');
        
        // Limpiar opciones existentes excepto la primera
        while (medSelect.options.length > 1) {
            medSelect.remove(1);
        }
        
        // Agregar opciones al select
        if (residentMedications.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay medicaciones registradas';
            option.disabled = true;
            medSelect.appendChild(option);
        } else {
            residentMedications.forEach(med => {
                const option = document.createElement('option');
                option.value = med.full; // Guardar el nombre completo como value
                option.textContent = med.full;
                option.dataset.dosage = med.dosage;
                medSelect.appendChild(option);
            });
        }
        
        // Evento cuando se selecciona un medicamento
        medSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            if (selectedOption.dataset.dosage) {
                dosageInput.value = selectedOption.dataset.dosage;
            } else {
                dosageInput.value = '';
            }
        });
        
        // Mostrar todos los campos del formulario directamente
        const fieldsContainer = clone.querySelector('.card-body');
        fieldsContainer.style.display = 'block';
        
        // Usar setupEntryButtons para manejar todos los botones
        setupEntryButtons(entryItem, 'medicacion', selectedResident.id);
        
        document.getElementById('medicacionEntriesContainer').prepend(clone);
    }
});
