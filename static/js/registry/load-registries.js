// Cargar registros guardados cuando se selecciona un residente
 document.addEventListener('DOMContentLoaded', function() {
     // Escuchar cuando se selecciona un residente en cualquier tab
     document.querySelectorAll('[data-resident-id]').forEach(button => {
         button.addEventListener('click', function() {
             const residentId = this.dataset.residentId;
             const residentName = this.dataset.residentName;
             
             // Determinar en qué tab estamos
             const tabId = this.closest('.tab-pane').id;
             
             // Cargar los registros de este residente
             loadResidentRegistries(residentId, residentName, tabId);
         });
     });
 
     // Escuchar cambios de fecha para recargar solo los registros de ese día
     document.querySelectorAll('.tab-pane #dateInput').forEach(input => {
         input.addEventListener('change', function() {
             const tab = this.closest('.tab-pane');
             if (!tab) return;
             const tabId = tab.id;
             const activeBtn = tab.querySelector('[data-resident-id].active') || tab.querySelector('[data-resident-id].list-group-item-action.active');
             if (!activeBtn) return;
             const residentId = activeBtn.dataset.residentId;
             const residentName = activeBtn.dataset.residentName;
             loadResidentRegistries(residentId, residentName, tabId);
         });
     });
 });
async function loadResidentRegistries(residentId, residentName, tabId) {
    console.log('=== CARGANDO REGISTROS ===');
    console.log('Residente ID:', residentId);
    console.log('Tab ID:', tabId);
    
    try {
        const response = await fetch(`/registry/api/resident/${residentId}/registries/`);
        const result = await response.json();
        
        console.log('Respuesta del servidor:', result);
        
        if (result.success) {
            const dateInput = document.querySelector(`#${tabId} #dateInput`);
            const selectedDate = dateInput ? dateInput.value : null;

            // Cargar según el tab activo
            if (tabId === 'alimentacion') {
                const filtered = selectedDate
                    ? result.registries.alimentacion.filter(r => r.date === selectedDate)
                    : result.registries.alimentacion;
                loadFoodRegistries(filtered);
            } else if (tabId === 'medicacion') {
                const filtered = selectedDate
                    ? result.registries.medicacion.filter(r => r.date === selectedDate)
                    : result.registries.medicacion;
                loadMedicationRegistries(filtered);
            } else if (tabId === 'deposicion') {
                const filtered = selectedDate
                    ? result.registries.deposicion.filter(r => r.date === selectedDate)
                    : result.registries.deposicion;
                loadBowelRegistries(filtered);
            }
        } else {
            console.error('Error en la respuesta:', result.message);
        }
    } catch (error) {
        console.error('Error al cargar registros:', error);
    }
}


// Alimentación
function loadFoodRegistries(registries) {
    console.log('=== LOAD FOOD REGISTRIES ===');
    console.log('Cantidad de registros:', registries.length);
    console.log('Datos:', registries);
    
    const container = document.getElementById('alimentacionEntriesContainer');
    console.log('Container encontrado:', container);
    
    if (!container) {
        console.error('No se encontró el container alimentacionEntriesContainer');
        return;
    }
    
    // Limpiar registros anteriores
    container.innerHTML = '';
    
    // Cargar cada registro
    registries.forEach(registry => {
        console.log('Procesando registro:', registry);
        const template = document.getElementById('alimentacionEntryTemplate');
        const clone = template.content.cloneNode(true);
        
        const entryItem = clone.querySelector('.entry-item');
        const compactView = clone.querySelector('.entry-compact');
        const formView = clone.querySelector('.entry-form');
        
        // Configurar vista compacta
        const [hours, minutes] = registry.time.split(':');
        const timeStr = `Hora ${hours}:${minutes}`;
        
        let summaryParts = [];
        
        // Mostrar "Alimentación: [tipo]" en lugar de "Sólidos:"
        if (registry.solid_intake) {summaryParts.push(`Alimentación: ${registry.solid_intake}`);}
        
        // Mostrar hidratación con cantidad
        if (registry.liquid_intake || registry.quantity) {
            let hydrationText = 'Hidratación:';
            if (registry.liquid_intake) {
                hydrationText += ` ${registry.liquid_intake}`;
            }
            if (registry.quantity) {
                hydrationText += registry.liquid_intake ? ` - ${registry.quantity}` : ` ${registry.quantity}`;
            }
            summaryParts.push(hydrationText);
        }
        
        compactView.querySelector('.entry-time').textContent = timeStr;
        compactView.querySelector('.entry-summary').textContent = summaryParts.join(' , ') || 'Sin detalles';
        
        // Configurar formulario con datos
        formView.querySelector('.hour-input').value = hours;
        formView.querySelector('.minute-input').value = minutes;
        formView.querySelector('.meal-type-select').value = registry.solid_intake || '';
        formView.querySelector('.first-course-select').value = registry.first_course || '';
        formView.querySelector('.second-course-select').value = registry.second_course || '';
        formView.querySelector('.dessert-select').value = registry.dessert || '';
        formView.querySelector('.liquid-intake-select').value = registry.liquid_intake || '';
        formView.querySelector('.quantity-input').value = registry.quantity || '';
        formView.querySelector('.notes-textarea').value = registry.notes || '';
        
        // Guardar ID del registro Y del residente
        entryItem.dataset.registryId = registry.id;
        entryItem.dataset.residentId = registry.resident_id || registry.resident;
        
        // Mostrar vista compacta por defecto
        formView.style.display = 'none';
        compactView.style.display = 'block';
        
        // Agregar event listeners para botones
        setupEntryButtons(entryItem, 'alimentacion');
        
        container.appendChild(clone);
    });
}

function loadMedicationRegistries(registries) {
    const container = document.getElementById('medicacionEntriesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Obtener las medicaciones del residente activo
    const activeResidentButton = document.querySelector('#medicacion [data-resident-id].active');
    let residentMedications = [];
    
    if (activeResidentButton) {
        const medicationsData = activeResidentButton.dataset.medications || '';
        residentMedications = medicationsData.split('\n')
            .filter(med => med.trim())
            .map(med => {
                const parts = med.split(',').map(p => p.trim());
                return {
                    full: med.trim(),
                    name: parts[0] || '',
                    dosage: parts[1] || ''
                };
            });
    }
    
    registries.forEach(registry => {
        const template = document.getElementById('medicacionEntryTemplate');
        const clone = template.content.cloneNode(true);
        
        const entryItem = clone.querySelector('.entry-item');
        const compactView = clone.querySelector('.entry-compact');
        const formView = clone.querySelector('.entry-form');
        
        const [hours, minutes] = registry.time.split(':');
        const timeStr = `Hora ${hours}:${minutes}`;
        
        compactView.querySelector('.entry-time').textContent = timeStr;
        compactView.querySelector('.entry-summary').textContent = registry.medication_name || 'Sin especificar';
        
        formView.querySelector('.hour-input').value = hours;
        formView.querySelector('.minute-input').value = minutes;
        
        // Poblar el select con las medicaciones del residente
        const medSelect = formView.querySelector('.medication-name-select');
        const dosageInput = formView.querySelector('.dosage-input');
        
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
                option.value = med.full;
                option.textContent = med.full;
                option.dataset.dosage = med.dosage;
                medSelect.appendChild(option);
            });
        }
        
        // Establecer el valor seleccionado
        medSelect.value = registry.medication_name || '';
        dosageInput.value = registry.dosage || '';
        
        formView.querySelector('.route-select').value = registry.route || '';
        formView.querySelector('.notes-textarea').value = registry.notes || '';
        
        entryItem.dataset.registryId = registry.id;
        entryItem.dataset.residentId = registry.resident_id || registry.resident;
        
        formView.style.display = 'none';
        compactView.style.display = 'block';
        
        setupEntryButtons(entryItem, 'medicacion');
        
        container.appendChild(clone);
    });
}

function loadBowelRegistries(registries) {
    const container = document.getElementById('deposicionEntriesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    registries.forEach(registry => {
        const template = document.getElementById('deposicionEntryTemplate');
        const clone = template.content.cloneNode(true);
        
        const entryItem = clone.querySelector('.entry-item');
        const compactView = clone.querySelector('.entry-compact');
        const formView = clone.querySelector('.entry-form');
        
        const [hours, minutes] = registry.time.split(':');
        const timeStr = `Hora ${hours}:${minutes}`;
        
        compactView.querySelector('.entry-time').textContent = timeStr;
        compactView.querySelector('.entry-summary').textContent = registry.type_bowel || 'Sin especificar';
        
        formView.querySelector('.hour-input').value = hours;
        formView.querySelector('.minute-input').value = minutes;
        formView.querySelector('.type-select').value = registry.type_bowel || '';
        formView.querySelector('.consistency-select').value = registry.consistency || '';
        formView.querySelector('.color-select').value = registry.color || '';
        formView.querySelector('.quantity-select').value = registry.quantity || '';
        formView.querySelector('.notes-textarea').value = registry.notes || '';
        
        entryItem.dataset.registryId = registry.id;
        entryItem.dataset.residentId = registry.resident_id || registry.resident;
        
        formView.style.display = 'none';
        compactView.style.display = 'block';
        
        setupEntryButtons(entryItem, 'deposicion');
        
        container.appendChild(clone);
    });
}

function setupEntryButtons(entryItem, type, residentId = null) {
    // Botón editar
    entryItem.querySelector('.edit-entry')?.addEventListener('click', function() {
        const item = this.closest('.entry-item');
        item.querySelector('.entry-compact').style.display = 'none';
        const formView = item.querySelector('.entry-form');
        formView.style.display = 'block';
        formView.querySelector('.card-body').style.display = 'block';
    });
    
    // Botón guardar
    entryItem.querySelector('.save-entry')?.addEventListener('click', async function() {
        const item = this.closest('.entry-item');
        const registryId = item.dataset.registryId;
        const formView = item.querySelector('.entry-form');
        
        const hour = formView.querySelector('.hour-input').value;
        const minute = formView.querySelector('.minute-input').value;
        
        if (!hour || !minute) {
            showAlert('Por favor, ingrese la hora', 'warning');
            return;
        }
        
        // Obtener resident_id del dataset o del parámetro
        const finalResidentId = item.dataset.residentId || residentId;
        
        if (!finalResidentId) {
            showAlert('Por favor, seleccione un residente', 'warning');
            return;
        }
        
        // Obtener la fecha del input de fecha correspondiente al tipo de registro
        const tabId = type === 'alimentacion' ? 'alimentacion' : type === 'medicacion' ? 'medicacion' : 'deposicion';
        const dateInput = document.querySelector(`#${tabId} #dateInput`);
        const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
        
        let registryData = {
            resident_id: finalResidentId,
            date: selectedDate,
            time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
        };
        
        // Si tiene registry_id, incluirlo para actualizar
        if (registryId) {
            registryData.registry_id = registryId;
        }
        
        let saveUrl = '';
        let summaryText = '';
        
        if (type === 'alimentacion') {
            const mealType = formView.querySelector('.meal-type-select').value;
            const firstCourse = formView.querySelector('.first-course-select').value;
            const secondCourse = formView.querySelector('.second-course-select').value;
            const dessert = formView.querySelector('.dessert-select').value;
            const liquidIntake = formView.querySelector('.liquid-intake-select').value;
            const quantity = formView.querySelector('.quantity-input').value;
            const notes = formView.querySelector('.notes-textarea').value.trim();
            
            registryData = {
                ...registryData,
                solid_intake: mealType,
                first_course: firstCourse,
                second_course: secondCourse,
                dessert: dessert,
                liquid_intake: liquidIntake,
                quantity: quantity,
                notes: notes
            };
            
            saveUrl = '/registry/api/save-food/';
            
            // Construir resumen
            let summaryParts = [];
            
            // Mostrar "Alimentación: [tipo]" si hay algo seleccionado en sólidos
            if (mealType) {
                const mealText = formView.querySelector('.meal-type-select').selectedOptions[0]?.text;
                summaryParts.push(`Alimentación: ${mealText}`);
            }
            
            // Mostrar platos si están seleccionados
            if (firstCourse) {
                const firstText = formView.querySelector('.first-course-select').selectedOptions[0]?.text;
                summaryParts.push(`1º: ${firstText}`);
            }
            if (secondCourse) {
                const secondText = formView.querySelector('.second-course-select').selectedOptions[0]?.text;
                summaryParts.push(`2º: ${secondText}`);
            }
            if (dessert) {
                const dessertText = formView.querySelector('.dessert-select').selectedOptions[0]?.text;
                summaryParts.push(`Postre: ${dessertText}`);
            }
            
            // Mostrar hidratación
            if (liquidIntake || quantity) {
                let hydrationText = 'Hidratación:';
                if (liquidIntake) {
                    const liquidText = formView.querySelector('.liquid-intake-select').selectedOptions[0]?.text;
                    hydrationText += ` ${liquidText}`;
                }
                if (quantity) {
                    hydrationText += liquidIntake ? ` - ${quantity}` : ` ${quantity}`;
                }
                summaryParts.push(hydrationText);
            }
            
            if (notes) {
                summaryParts.push(`Obs: ${notes}`);
            }
            summaryText = summaryParts.length > 0 ? summaryParts.join(' | ') : 'Sin información';
            
        } else if (type === 'medicacion') {
            const medicationName = formView.querySelector('.medication-name-select').value;
            const dosage = formView.querySelector('.dosage-input').value;
            const route = formView.querySelector('.route-select').value;
            const notes = formView.querySelector('.notes-textarea').value.trim();
            
            registryData = {
                ...registryData,
                medication_name: medicationName,
                dosage, route, notes
            };
            
            saveUrl = '/registry/api/save-medication/';
            summaryText = medicationName || 'Sin especificar';
            
        } else if (type === 'deposicion') {
            const typeBowel = formView.querySelector('.type-select').value;
            const consistency = formView.querySelector('.consistency-select').value;
            const color = formView.querySelector('.color-select').value;
            const quantity = formView.querySelector('.quantity-select').value;
            const notes = formView.querySelector('.notes-textarea').value.trim();
            
            registryData = {
                ...registryData,
                type_bowel: typeBowel,
                consistency, color, quantity, notes
            };
            
            saveUrl = '/registry/api/save-bowel/';
            summaryText = typeBowel || 'Sin especificar';
        }
        
        try {
            const response = await fetch(saveUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(registryData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                const timeStr = `Hora ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
                const compactView = item.querySelector('.entry-compact');
                compactView.querySelector('.entry-time').textContent = timeStr;
                compactView.querySelector('.entry-summary').textContent = summaryText;
                
                // Guardar el registry_id devuelto por el servidor
                item.dataset.registryId = result.registry_id;
                item.dataset.residentId = finalResidentId;
                
                formView.style.display = 'none';
                compactView.style.display = 'block';
            } else {
                alert('Error al guardar: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar el registro. Por favor, intente nuevamente.');
        }
    });
    
    // Botón cancelar
    entryItem.querySelector('.cancel-entry')?.addEventListener('click', function() {
        const item = this.closest('.entry-item');
        const compactView = item.querySelector('.entry-compact');
        
        // Si ya estaba guardado, volver a mostrar vista compacta
        if (compactView.querySelector('.entry-time').textContent) {
            item.querySelector('.entry-form').style.display = 'none';
            compactView.style.display = 'block';
        } else {
            // Si es nuevo (nunca guardado), eliminarlo
            item.remove();
        }
    });
    
    // Botón eliminar
    entryItem.querySelector('.delete-entry')?.addEventListener('click', async function() {
        if (confirm('¿Está seguro de eliminar este registro?')) {
            const registryId = this.closest('.entry-item').dataset.registryId;
            
            if (!registryId) {
                // Si no tiene ID, es un registro nuevo que no se guardó
                this.closest('.entry-item').remove();
                return;
            }
            
            // Determinar la URL según el tipo
            let deleteUrl = '';
            if (type === 'alimentacion') {
                deleteUrl = `/registry/api/delete-food/${registryId}/`;
            } else if (type === 'medicacion') {
                deleteUrl = `/registry/api/delete-medication/${registryId}/`;
            } else if (type === 'deposicion') {
                deleteUrl = `/registry/api/delete-bowel/${registryId}/`;
            }
            
            try {
                const response = await fetch(deleteUrl, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.closest('.entry-item').remove();
                } else {
                    alert('Error al eliminar: ' + result.message);
                }
            } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el registro');
            }
        }
    });
}

// Exportar funciones para uso en otros archivos
window.setupEntryButtons = setupEntryButtons;
window.getCookie = getCookie;

// Función helper para obtener el CSRF token
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
