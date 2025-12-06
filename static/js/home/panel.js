// Panel Principal - Mostrar anotaciones en tabla
document.addEventListener('DOMContentLoaded', function() {    
    loadAnnotations();
    
    // Recargar cada 30 segundos (DESACTIVADO TEMPORALMENTE)
    // setInterval(loadAnnotations, 30000);
    
    // Manejar guardado de nueva anotación
    document.getElementById('guardarAnotacionBtn')?.addEventListener('click', async function() {
        const fecha = document.getElementById('anotacionFecha').value;
        const panel = document.getElementById('anotacionPanel').value;
        const tipo = document.getElementById('anotacionTipo').value;
        const estado = document.getElementById('anotacionEstado').value;
        const residenteId = document.getElementById('anotacionResidente').value;
        const descripcion = document.getElementById('anotacionDescripcion').value;
        const editingId = this.dataset.editingId;
        
        // Validar campos obligatorios
        if (!fecha || !panel || !tipo || !estado || !residenteId) {
            alert('Por favor, complete todos los campos obligatorios (*)');
            return;
        }
        
        const anotacionData = {
            resident_id: residenteId,
            panel: panel,
            type: tipo,
            status: estado,
            notes: descripcion,
            form_data: {
                fecha: fecha
            }
        };
        
        try {
            let url = '/registry/api/annotations/save/';
            let method = 'POST';
            
            // Si estamos editando, usar endpoint de actualización
            if (editingId) {
                url = `/registry/api/annotations/${editingId}/update/`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(anotacionData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('nuevaAnotacionModal'));
                modal.hide();
                
                // Limpiar formulario
                document.getElementById('nuevaAnotacionForm').reset();
                delete this.dataset.editingId;
                document.getElementById('nuevaAnotacionModalLabel').innerHTML = '<i class="bi bi-file-text"></i> Nueva Anotación';
                
                // Recargar anotaciones
                loadAnnotations();
                
                alert(editingId ? 'Anotación actualizada correctamente' : 'Anotación guardada correctamente');
            } else {
                alert('Error al guardar: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la anotación. Por favor, intente nuevamente.');
        }
    });
});

async function loadAnnotations() {
    try {
        const response = await fetch('/registry/api/annotations/');
        const result = await response.json();
        
        if (!result.success) {
            console.error('Error al cargar anotaciones:', result.message);
            return;
        }
        
        const annotations = result.annotations;
        const tbody = document.querySelector('.table tbody');
    
    console.log('=== PANEL.JS DEBUG ===');
    console.log('Anotaciones encontradas:', annotations.length);
    console.log('Datos:', annotations);
    console.log('tbody encontrado:', tbody);
    
    if (!tbody) return;
    
    if (annotations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No hay anotaciones
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por fecha más reciente
    annotations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let html = '';
    
    annotations.forEach((annotation, index) => {
        const panelBadge = getPanelBadge(annotation.panel);
        const statusBadge = getStatusBadge(annotation.status);
        const date = new Date(annotation.timestamp);
        const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
        const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        // Generar descripción a partir de los datos del formulario
        const description = generateDescriptionFromFormData(annotation);
        
        // Tipo de registro con etiqueta
        const typeLabel = getTypeLabel(annotation.type);
        
        // Verificar si tiene seguimientos
        const hasFollowups = annotation.form_data?.followups && annotation.form_data.followups.length > 0;
        const followupCount = hasFollowups ? annotation.form_data.followups.length : 0;
        
        html += `
            <tr data-annotation-id="${annotation.id}">
                <td>${panelBadge}</td>
                <td>${dateStr} - ${timeStr}</td>
                <td>${typeLabel}</td>
                <td>${description}</td>
                <td>${annotation.resident.name}</td>
                <td>${annotation.created_by || '-'}</td>
                <td>
                    <button class="btn btn-sm ${getStatusClass(annotation.status)} status-btn" 
                            onclick="toggleFollowUp(${annotation.id})" 
                            data-bs-toggle="collapse" 
                            data-bs-target="#followup-${annotation.id}">
                        ${getStatusText(annotation.status)}
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editAnnotation(${annotation.id})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnotation(${annotation.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                    ${hasFollowups ? `
                        <button class="btn btn-sm btn-outline-info" 
                                onclick="toggleFollowupsList(${annotation.id})" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#followups-list-${annotation.id}"
                                title="Ver seguimientos (${followupCount})">
                            <i class="bi bi-chevron-left" id="arrow-${annotation.id}"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
            ${hasFollowups ? `
            <tr class="collapse" id="followups-list-${annotation.id}">
                <td colspan="8" class="bg-light p-3">
                    <div class="card border-info">
                        <div class="card-header bg-light">
                            <strong><i class="bi bi-list-ul"></i> Historial de Seguimientos (${followupCount})</strong>
                        </div>
                        <div class="card-body p-2">
                            ${generateFollowupsHTML(annotation.form_data.followups)}
                        </div>
                    </div>
                </td>
            </tr>
            ` : ''}
            <tr class="collapse" id="followup-${annotation.id}">
                <td colspan="8" class="bg-light p-3">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <strong><i class="bi bi-chat-left-text"></i> Agregar Seguimiento</strong>
                        </div>
                        <div class="card-body">
                            <form id="followup-form-${annotation.id}">
                                <div class="row">
                                    <div class="col-2 mb-3">
                                        <label class="form-label fw-bold">Tipo de seguimiento</label>
                                        <select class="form-select" id="followup-type-${annotation.id}">
                                            <option value="seguimiento">Seguimiento</option>
                                            <option value="comprobacion">Comprobación</option>
                                            <option value="cumplimiento">Cumplimiento</option>
                                            <option value="actualizacion">Actualización</option>
                                        </select>
                                    </div>
                                    <div class="col mb-3">
                                        <label class="form-label fw-bold">Observaciones</label>
                                        <textarea class="form-control" id="followup-notes-${annotation.id}" rows="1" placeholder="Describa el seguimiento..."></textarea>
                                    </div>
                                    <div class="col-2 mb-3">
                                        <label class="form-label fw-bold">Estado</label>
                                        <select class="form-select" id="followup-status-${annotation.id}">
                                            <option value="abierto" ${annotation.status === 'abierto' ? 'selected' : ''}>Abierto</option>
                                            <option value="en_espera" ${annotation.status === 'en_espera' ? 'selected' : ''}>En espera</option>
                                            <option value="cerrado" ${annotation.status === 'cerrado' ? 'selected' : ''}>Cerrado</option>
                                        </select>
                                    </div>
                                    <div class="d-flex gap-2">
                                        <button type="button" class="btn btn-secondary" onclick="toggleFollowUp(${annotation.id})" data-bs-toggle="collapse" data-bs-target="#followup-${annotation.id}">
                                            <i class="bi bi-x-circle"></i> Cancelar
                                        </button>
                                        <button type="button" class="btn btn-primary" onclick="saveFollowUp(${annotation.id})">
                                            <i class="bi bi-save"></i> Guardar Seguimiento
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar anotaciones:', error);
    }
}

function generateDescriptionFromFormData(annotation) {
    const data = annotation.form_data;
    if (!data) return annotation.notes || '-';
    
    let parts = [];
    
    if (annotation.type === 'alimentacion') {
        // Formato: cada elemento en una nueva línea
        if (data.hora) parts.push(`Hora: ${data.hora}`);
        
        if (data.ingestaSolidos) {
            const solidosTexto = data.ingestaSolidos === 'todo' ? 'Todo' : 
                                 data.ingestaSolidos === 'poco' ? 'Poco' :
                                 data.ingestaSolidos === 'nada' ? 'Nada' :
                                 data.ingestaSolidos === 'comida' ? 'Comida' : data.ingestaSolidos;
            parts.push(`Alimentación: ${solidosTexto}`);
        }
        
        if (data.primerPlato) {
            const primerTexto = data.primerPlato === 'todo' ? 'Todo' :
                               data.primerPlato === 'poco' ? 'Poco' :
                               data.primerPlato === 'nada' ? 'Nada' : data.primerPlato;
            parts.push(`1º: ${primerTexto}`);
        }
        
        if (data.segundoPlato) {
            const segundoTexto = data.segundoPlato === 'todo' ? 'Todo' :
                                data.segundoPlato === 'poco' ? 'Poco' :
                                data.segundoPlato === 'nada' ? 'Nada' : data.segundoPlato;
            parts.push(`2º: ${segundoTexto}`);
        }
        
        if (data.postre) {
            const postreTexto = data.postre === 'todo' ? 'Todo' :
                               data.postre === 'poco' ? 'Poco' :
                               data.postre === 'nada' ? 'Nada' : data.postre;
            parts.push(`Postre: ${postreTexto}`);
        }
        
        if (data.ingestaLiquidos || data.cantidad) {
            let hidratacion = 'Cant: ';
            if (data.cantidad) {
                hidratacion += data.cantidad;
            }
            if (data.ingestaLiquidos) {
                hidratacion += data.cantidad ? ' de ' + data.ingestaLiquidos : data.ingestaLiquidos;
            }
            parts.push(hidratacion);
        }
        
        if (data.observaciones) parts.push(`Notas: ${data.observaciones}`);
        
    } else if (annotation.type === 'medicacion') {
        if (data.hora) parts.push(`Hora: ${data.hora}`);
        if (data.nombreMedicamento) parts.push(`Med: ${data.nombreMedicamento}`);
        if (data.dosis) parts.push(`Dosis: ${data.dosis}`);
        if (data.via) parts.push(`Vía: ${data.via}`);
        if (data.observaciones) parts.push(`Obs: ${data.observaciones}`);
    } else if (annotation.type === 'deposicion') {
        if (data.hora) parts.push(`Hora: ${data.hora}`);
        if (data.tipo) parts.push(`Tipo: ${data.tipo}`);
        if (data.consistencia) parts.push(`Consist: ${data.consistencia}`);
        if (data.color) parts.push(`Color: ${data.color}`);
        if (data.cantidad) parts.push(`Cant: ${data.cantidad}`);
        if (data.observaciones) parts.push(`Obs: ${data.observaciones}`);
    }
    // Agregar las notas de la anotación al final
    if (annotation.notes) {
        parts.push(annotation.notes);
    }
    
    // Unir con saltos de línea HTML para mejor visualización
    return parts.length > 0 ? parts.join('<br>') : '-';
}

function getTypeLabel(type) {
    const labels = {
        'alimentacion': 'Alimentación',
        'medicacion': 'Medicación',
        'deposicion': 'Deposición',
        'hidratacion': 'Hidratación',
        'salida': 'Salida',
        'cita_medica': 'Cita médica'
    };
    // Si no está en el diccionario, capitalizar la primera letra
    if (labels[type]) {
        return labels[type];
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function getPanelBadge(panel) {
    const badges = {
        'sanitario': '<span class="badge" style="background-color: #17a2b8;">S</span>',
        'general': '<span class="badge bg-primary">G</span>',
        'incidencia': '<span class="badge bg-warning text-dark">I</span>'
    };
    return badges[panel] || '<span class="badge bg-secondary">?</span>';
}

function getStatusBadge(status) {
    if (status === 'abierto') {
        return '<span class="badge bg-success ms-1">Abierto</span>';
    } else if (status === 'en_espera') {
        return '<span class="badge bg-warning ms-1">En espera</span>';
    } else {
        return '<span class="badge bg-secondary ms-1">Cerrado</span>';
    }
}

function getStatusClass(status) {
    if (status === 'abierto') {
        return 'btn-success';
    } else if (status === 'en_espera') {
        return 'btn-warning';
    } else {
        return 'btn-secondary';
    }
}

function getStatusText(status) {
    if (status === 'abierto') {
        return 'Abierto';
    } else if (status === 'en_espera') {
        return 'En espera';
    } else {
        return 'Cerrado';
    }
}

function toggleFollowUp(annotationId) {
    // La función collapse se maneja automáticamente por Bootstrap
}

function toggleFollowupsList(annotationId) {
    // Rotar la flecha
    const arrow = document.getElementById(`arrow-${annotationId}`);
    if (arrow) {
        if (arrow.classList.contains('bi-chevron-left')) {
            arrow.classList.remove('bi-chevron-left');
            arrow.classList.add('bi-chevron-down');
        } else {
            arrow.classList.remove('bi-chevron-down');
            arrow.classList.add('bi-chevron-left');
        }
    }
}

function generateFollowupsHTML(followups) {
    if (!followups || followups.length === 0) {
        return '<p class="text-muted">No hay seguimientos</p>';
    }
    
    let html = '<div class="list-group list-group-flush">';
    
    followups.forEach((followup, index) => {
        const date = new Date(followup.timestamp);
        const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const typeLabel = followup.type === 'seguimiento' ? 'Seguimiento' :
                         followup.type === 'comprobacion' ? 'Comprobación' :
                         followup.type === 'cumplimiento' ? 'Cumplimiento' :
                         followup.type === 'actualizacion' ? 'Actualización' : followup.type;
        
        const badgeColor = followup.type === 'seguimiento' ? 'bg-primary' :
                          followup.type === 'comprobacion' ? 'bg-info' :
                          followup.type === 'cumplimiento' ? 'bg-success' :
                          followup.type === 'actualizacion' ? 'bg-warning' : 'bg-secondary';
        
        html += `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between align-items-start mb-2">
                    <h6 class="mb-1">
                        <span class="badge ${badgeColor}">${typeLabel}</span>
                    </h6>
                    <p class="mb-1">${followup.notes}</p>
                    <small class="text-muted"><i class="bi bi-person"></i> ${followup.user}</small>
                    <small class="text-muted">${dateStr} ${timeStr}</small>
                </div>
                
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function editAnnotation(annotationId) {
    // Buscar la anotación en los datos cargados
    fetch(`/registry/api/annotations/`)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const annotation = result.annotations.find(a => a.id === annotationId);
                if (annotation) {
                    // Cargar datos en el modal de edición
                    document.getElementById('anotacionFecha').value = annotation.form_data?.fecha || '';
                    document.getElementById('anotacionPanel').value = annotation.panel;
                    document.getElementById('anotacionTipo').value = annotation.type;
                    document.getElementById('anotacionEstado').value = annotation.status;
                    document.getElementById('anotacionResidente').value = annotation.resident.id;
                    document.getElementById('anotacionDescripcion').value = annotation.notes;
                    
                    // Cambiar el botón de guardar para actualizar
                    const modal = new bootstrap.Modal(document.getElementById('nuevaAnotacionModal'));
                    document.getElementById('nuevaAnotacionModalLabel').innerHTML = '<i class="bi bi-pencil"></i> Editar Anotación';
                    
                    // Guardar el ID para actualizar
                    document.getElementById('guardarAnotacionBtn').dataset.editingId = annotationId;
                    modal.show();
                }
            }
        })
        .catch(error => console.error('Error:', error));
}

async function saveFollowUp(annotationId) {
    const followupType = document.getElementById(`followup-type-${annotationId}`).value;
    const followupNotes = document.getElementById(`followup-notes-${annotationId}`).value;
    const newStatus = document.getElementById(`followup-status-${annotationId}`).value;
    
    if (!followupNotes.trim()) {
        alert('Por favor, agregue observaciones para el seguimiento');
        return;
    }
    
    try {
        // Actualizar el estado de la anotación
        const response = await fetch(`/registry/api/annotations/${annotationId}/status/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                status: newStatus,
                followup_type: followupType,
                followup_notes: followupNotes
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Cerrar el collapse
            const collapseElement = document.getElementById(`followup-${annotationId}`);
            const collapse = bootstrap.Collapse.getInstance(collapseElement) || new bootstrap.Collapse(collapseElement);
            collapse.hide();
            
            // Limpiar formulario
            document.getElementById(`followup-form-${annotationId}`).reset();
            
            // Recargar anotaciones
            loadAnnotations();
            
            alert('Seguimiento guardado correctamente');
        } else {
            alert('Error al guardar: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el seguimiento');
    }
}

async function deleteAnnotation(annotationId) {
    if (confirm('¿Está seguro de eliminar esta anotación?')) {
        try {
            const response = await fetch(`/registry/api/annotations/${annotationId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                loadAnnotations();
            } else {
                alert('Error al eliminar: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la anotación');
        }
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
