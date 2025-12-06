// Manejar anotaciones desde los formularios de registro
document.addEventListener('DOMContentLoaded', function() {
    let currentFormData = null;
    let currentSection = null;
    let currentResident = null;

    // Función para abrir el modal de anotación con los datos del formulario
    function openAnnotationModal(formElement, section) {
        currentFormData = extractFormData(formElement, section);
        currentSection = section;
        
        // Obtener el residente seleccionado
        const activeResidentBtn = document.querySelector(`#${section} [data-resident-id].active`);
        if (activeResidentBtn) {
            currentResident = {
                id: activeResidentBtn.dataset.residentId,
                name: activeResidentBtn.dataset.residentName
            };
        }
        
        // Establecer el tipo de anotación según la sección
        const annotationType = document.getElementById('annotationType');
        annotationType.value = section;
        
        // Generar la descripción automática
        generateDescription(currentFormData, section);
        
        // Abrir el modal
        const modal = new bootstrap.Modal(document.getElementById('annotationModal'));
        modal.show();
    }

    // Extraer datos del formulario según la sección
    function extractFormData(formElement, section) {
        const data = {};
        
        if (section === 'alimentacion') {
            const hourVal = formElement.querySelector('.hour-input').value;
            const minVal = formElement.querySelector('.minute-input').value;
            data.hora = (hourVal && minVal) ? `${hourVal}:${minVal}` : '';
            
            const mealSelect = formElement.querySelector('.meal-type-select');
            data.ingestaSolidos = (mealSelect.value) ? mealSelect.selectedOptions[0].text : '';
            
            const firstCourseSelect = formElement.querySelector('.first-course-select');
            data.primerPlato = (firstCourseSelect.value) ? firstCourseSelect.selectedOptions[0].text : '';
            
            const secondCourseSelect = formElement.querySelector('.second-course-select');
            data.segundoPlato = (secondCourseSelect.value) ? secondCourseSelect.selectedOptions[0].text : '';
            
            const dessertSelect = formElement.querySelector('.dessert-select');
            data.postre = (dessertSelect.value) ? dessertSelect.selectedOptions[0].text : '';
            
            const liquidSelect = formElement.querySelector('.liquid-intake-select');
            data.ingestaLiquidos = (liquidSelect.value) ? liquidSelect.selectedOptions[0].text : '';
            
            data.cantidad = formElement.querySelector('.quantity-input').value || '';
            data.observaciones = formElement.querySelector('.notes-textarea').value || '';
        } else if (section === 'medicacion') {
            const hourVal = formElement.querySelector('.hour-input').value;
            const minVal = formElement.querySelector('.minute-input').value;
            data.hora = (hourVal && minVal) ? `${hourVal}:${minVal}` : '';
            
            data.nombreMedicamento = formElement.querySelector('.medication-name-input').value || '';
            data.dosis = formElement.querySelector('.dosage-input').value || '';
            
            const routeSelect = formElement.querySelector('.route-select');
            data.via = (routeSelect.value) ? routeSelect.selectedOptions[0].text : '';
            
            data.observaciones = formElement.querySelector('.notes-textarea').value || '';
        } else if (section === 'deposicion') {
            const hourVal = formElement.querySelector('.hour-input').value;
            const minVal = formElement.querySelector('.minute-input').value;
            data.hora = (hourVal && minVal) ? `${hourVal}:${minVal}` : '';
            
            const typeSelect = formElement.querySelector('.type-select');
            data.tipo = (typeSelect.value) ? typeSelect.selectedOptions[0].text : '';
            
            const consistencySelect = formElement.querySelector('.consistency-select');
            data.consistencia = (consistencySelect.value) ? consistencySelect.selectedOptions[0].text : '';
            
            const colorSelect = formElement.querySelector('.color-select');
            data.color = (colorSelect.value) ? colorSelect.selectedOptions[0].text : '';
            
            const quantitySelect = formElement.querySelector('.quantity-select');
            data.cantidad = (quantitySelect.value) ? quantitySelect.selectedOptions[0].text : '';
            
            data.observaciones = formElement.querySelector('.notes-textarea').value || '';
        }
        
        return data;
    }

    // Generar descripción automática
    function generateDescription(data, section) {
        const descriptionDiv = document.getElementById('annotationDescription');
        let html = '';
        
        if (section === 'alimentacion') {
            html = '<strong>Registro en: Alimentación</strong><br>';
            html += `<strong>Hora:</strong> ${data.hora}<br>`;
            html += `<strong>Ingesta de sólidos:</strong> ${data.ingestaSolidos}<br>`;
            html += `<strong>Primer plato:</strong> ${data.primerPlato}<br>`;
            html += `<strong>Segundo plato:</strong> ${data.segundoPlato}<br>`;
            html += `<strong>Postre:</strong> ${data.postre}<br>`;
            html += `<strong>Ingesta de líquidos:</strong> ${data.ingestaLiquidos}<br>`;
            html += `<strong>Cantidad:</strong> ${data.cantidad}<br>`;
            html += `<strong>Observaciones:</strong> ${data.observaciones}`;
        } else if (section === 'medicacion') {
            html = '<strong>Registro en: Medicación</strong><br>';
            html += `<strong>Hora:</strong> ${data.hora}<br>`;
            html += `<strong>Nombre del medicamento:</strong> ${data.nombreMedicamento}<br>`;
            html += `<strong>Dosis:</strong> ${data.dosis}<br>`;
            html += `<strong>Vía de administración:</strong> ${data.via}<br>`;
            html += `<strong>Observaciones:</strong> ${data.observaciones}`;
        } else if (section === 'deposicion') {
            html = '<strong>Registro en: Deposición</strong><br>';
            html += `<strong>Hora:</strong> ${data.hora}<br>`;
            html += `<strong>Tipo:</strong> ${data.tipo}<br>`;
            html += `<strong>Consistencia:</strong> ${data.consistencia}<br>`;
            html += `<strong>Color:</strong> ${data.color}<br>`;
            html += `<strong>Cantidad:</strong> ${data.cantidad}<br>`;
            html += `<strong>Observaciones:</strong> ${data.observaciones}`;
        }
        
        descriptionDiv.innerHTML = html;
    }

    // Agregar event listeners a los botones de anotación en alimentación
    document.addEventListener('click', function(e) {
        if (e.target.closest('.annotation-entry')) {
            const button = e.target.closest('.annotation-entry');
            const formElement = button.closest('.entry-form');
            const section = formElement.closest('#alimentacion') ? 'alimentacion' :
                           formElement.closest('#medicacion') ? 'medicacion' :
                           formElement.closest('#deposicion') ? 'deposicion' : null;
            
            if (section && formElement) {
                openAnnotationModal(formElement, section);
            }
        }
    });

    // Guardar anotación
    document.getElementById('saveAnnotationBtn')?.addEventListener('click', async function() {
        const panel = document.getElementById('annotationPanel').value;
        const type = document.getElementById('annotationType').value;
        const notes = document.getElementById('annotationNotes').value;
        const status = document.getElementById('annotationStatus').value;
        
        if (!panel || !type || !notes || !status) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        if (!currentResident) {
            alert('No se ha seleccionado un residente');
            return;
        }
        
        // Crear objeto con datos de la anotación
        const annotationData = {
            resident_id: currentResident.id,
            panel: panel,
            type: type,
            notes: notes,
            status: status,
            form_data: currentFormData
        };
        
        try {
            const response = await fetch('/registry/api/annotations/save/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(annotationData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('Anotación guardada:', result);
                
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('annotationModal'));
                modal.hide();
                
                // Limpiar formulario
                document.getElementById('annotationForm').reset();
                document.getElementById('annotationDescription').innerHTML = '<em class="text-muted">La descripción se generará automáticamente con los datos del formulario</em>';
                
                // Mostrar mensaje de éxito
                alert('Anotación guardada correctamente en el Panel Principal');
            } else {
                alert('Error al guardar: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la anotación. Por favor, intente nuevamente.');
        }
    });
});
