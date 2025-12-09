// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual en el modal de caída cuando se abra
    const nuevaCaidaModal = document.getElementById('nuevaCaidaModal');
    let triggerButton = null; // Guardar referencia al botón que abrió el modal
    
    if (nuevaCaidaModal) {
        // Capturar cuál botón abrió el modal
        document.addEventListener('click', function(e) {
            if (e.target.getAttribute('data-bs-target') === '#nuevaCaidaModal' || 
                e.target.closest('[data-bs-target="#nuevaCaidaModal"]')) {
                triggerButton = e.target.closest('button');
            }
        });

        nuevaCaidaModal.addEventListener('show.bs.modal', function() {
            const fechaInput = document.getElementById('fecha');
            if (fechaInput && !fechaInput.value) {
                // Si el input es datetime-local, asignar fecha y hora local
                if (fechaInput.type === 'datetime-local') {
                    const d = new Date();
                    const pad = (n) => String(n).padStart(2, '0');
                    const local = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    fechaInput.value = local;
                } else {
                    const today = new Date().toISOString().split('T')[0];
                    fechaInput.value = today;
                }
            }
        });

        // Restaurar foco al botón que abrió el modal cuando se cierra
        nuevaCaidaModal.addEventListener('hidden.bs.modal', function() {
            if (triggerButton && triggerButton !== document.activeElement) {
                // Usar requestAnimationFrame para asegurar que se ejecute después de que Bootstrap finalice
                requestAnimationFrame(() => {
                    try {
                        triggerButton.focus();
                    } catch (e) {
                        console.warn('No se pudo restaurar foco:', e);
                    }
                });
            }
        });
    }

    // Guardar el orden original de las filas al cargar la página
    const table = document.querySelector('.table tbody');
    const rows = Array.from(table.getElementsByTagName('tr'));
    rows.forEach((row, index) => {
        row.setAttribute('data-original-index', index);
    });
    
    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Agregar evento de búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterTable);
    }

    // header filters removed

    // Agregar evento al botón limpiar
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }

    // Agregar eventos de ordenamiento a las columnas (solo en la primera fila del thead)
    const sortableHeaders = document.querySelectorAll('thead tr:first-child .sortable');
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const colIndex = parseInt(this.dataset.column, 10);
            if (!isNaN(colIndex)) sortTable(colIndex);
        });
    });

    // Agregar evento al botón de registrar caída
    const registrarBtn = document.getElementById('registrarCaidaBtn');
    if (registrarBtn) {
        registrarBtn.addEventListener('click', registrarCaida);
    }

    // Actualizar contador de caídas al cargar la página
    updateFallsCounter();
    updateResidentsCounter();
});

// Función para actualizar el contador de caídas
function updateFallsCounter() {
    const table = document.querySelector('.table tbody');
    if (!table) {
        console.warn('Table no encontrada para contar caídas');
        return;
    }

    // Contar las filas que tengan tipo "Caída" (con acento)
    const rows = table.getElementsByTagName('tr');
    let fallsCount = 0;

    for (let row of rows) {
        const typeCell = row.querySelector('td:nth-child(3)'); // Columna de Tipo
        if (typeCell) {
            const cellText = typeCell.textContent.trim();
            // Buscar "Caída" (con acento) o "caida" (sin acento, por si acaso)
            if (cellText === 'Caída' || cellText === 'caida') {
                fallsCount++;
            }
        }
    }

    // Actualizar el contador en el card
    const fallsCounter = document.getElementById('fallsCounterCard');
    if (fallsCounter) {
        console.log('Contador de caídas actualizado a:', fallsCount);
        fallsCounter.textContent = fallsCount;
    } else {
        console.warn('Elemento fallsCounterCard no encontrado');
    }
}

// Función para actualizar el contador de residentes
function updateResidentsCounter() {
    const table = document.querySelector('.table tbody');
    if (!table) {
        console.warn('Table no encontrada para contar residentes');
        return;
    }

    // Contar residentes únicos en la columna Residente (5ta columna)
    const rows = table.getElementsByTagName('tr');
    const uniqueResidents = new Set();

    for (let row of rows) {
        const residentCell = row.querySelector('td:nth-child(5)'); // Columna de Residente
        if (residentCell) {
            const residentName = residentCell.textContent.trim();
            if (residentName && residentName !== '-') {
                uniqueResidents.add(residentName);
            }
        }
    }

    // Actualizar el contador en el card
    const residentsCounter = document.getElementById('residentsCounterCard');
    if (residentsCounter) {
        console.log('Contador de residentes actualizado a:', uniqueResidents.size);
        residentsCounter.textContent = uniqueResidents.size;
    } else {
        console.warn('Elemento residentsCounterCard no encontrado');
    }
}

let sortDirection = {};


function sortTable(column) {
    const table = document.querySelector('.table tbody');
    // Excluir filas de placeholder que usan colspan
    const rows = Array.from(table.querySelectorAll('tr')).filter(r => !r.querySelector('td[colspan]'));
    
    // Determinar dirección de ordenamiento (alternar entre asc y desc)
    if (!sortDirection[column]) {
        sortDirection[column] = 'asc';
    } else {
        sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    }
    
    const direction = sortDirection[column];
    
    // Ordenar las filas
    rows.sort((a, b) => {
        const aCell = a.getElementsByTagName('td')[column];
        const bCell = b.getElementsByTagName('td')[column];
        const aValue = aCell ? aCell.textContent.trim().toLowerCase() : '';
        const bValue = bCell ? bCell.textContent.trim().toLowerCase() : '';

        // Si es la columna de fecha (1), intentar comparar como fecha/datetime
        if (column === 1) {
            const aDate = Date.parse(aValue.replace(/-/g, '/')) || 0;
            const bDate = Date.parse(bValue.replace(/-/g, '/')) || 0;
            return direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        if (direction === 'asc') {
            return aValue.localeCompare(bValue, 'es');
        } else {
            return bValue.localeCompare(aValue, 'es');
        }
    });
    
    // Reordenar las filas en la tabla
    rows.forEach(row => table.appendChild(row));
}

function filterTable() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const table = document.querySelector('.table tbody');
    const rows = table.getElementsByTagName('tr');
    // header filters removed

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        // Buscar en todas las celdas de la fila
        for (let j = 0; j < cells.length; j++) {
            const cell = cells[j];
            if (cell) {
                const textValue = cell.textContent || cell.innerText;
                if (textValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        
        // Mostrar u ocultar la fila según el resultado
        if (found) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
    // Actualizar el contador cuando se filtra
    updateFallsCounter();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    sortDirection = {}; // Reiniciar el ordenamiento
    
    // Restaurar el orden original de las filas
    const table = document.querySelector('.table tbody');
    const rows = Array.from(table.getElementsByTagName('tr'));
    
    // Guardar el orden original con un atributo data
    rows.forEach((row, index) => {
        if (!row.hasAttribute('data-original-index')) {
            row.setAttribute('data-original-index', index);
        }
    });
    
    // Ordenar por el índice original
    rows.sort((a, b) => {
        return parseInt(a.getAttribute('data-original-index')) - parseInt(b.getAttribute('data-original-index'));
    });
    
    // Reordenar las filas
    rows.forEach(row => table.appendChild(row));
    
    filterTable();
}

async function registrarCaida() {
    const form = document.getElementById('nuevaCaidaForm');
    if (form.checkValidity()) {
        const fecha = document.getElementById('fecha').value;
        const panel = document.getElementById('caidaPanel').value;
        const residenteId = document.getElementById('residente').value;
        const lugar = document.getElementById('lugar').value;
        const familiarInformado = document.getElementById('familiarInformado').value;
        const causa = document.getElementById('causa').value;
        const consecuencias = document.getElementById('consecuencias').value;
        const observaciones = document.getElementById('observaciones').value;
        const editingId = document.getElementById('registrarCaidaBtn').dataset.editingId;

        // Preparar los datos de la caída como anotación
        const formData = {
            fecha: fecha,
            lugar: lugar,
            familiar_informado: familiarInformado,
            causa: causa,
            consecuencias: consecuencias,
            observaciones: observaciones
        };

        const annotationData = {
            resident_id: residenteId,
            panel: panel,
            type: 'caida',
            status: 'abierto',
            form_data: formData,
            notes: observaciones
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
                body: JSON.stringify(annotationData)
            });

            const result = await response.json();
            
            if (result.success) {
                showAlert(editingId ? 'Caída actualizada correctamente' : 'Caída registrada correctamente como anotación', 'success');
                var modal = bootstrap.Modal.getInstance(document.getElementById('nuevaCaidaModal'));
                modal.hide();
                form.reset();
                delete document.getElementById('registrarCaidaBtn').dataset.editingId;
                // Recargar las anotaciones para mostrar la nueva caída
                if (typeof loadAnnotations === 'function') {
                    console.log('Llamando loadAnnotations después de registrar caída');
                    loadAnnotations();
                } else {
                    console.warn('loadAnnotations no está disponible');
                }
            } else {
                showAlert('Error al registrar: ' + result.message, 'danger');
            }
        } catch (error) {
            showAlert('Error al registrar la caída', 'danger');
        }
    } else {
        form.reportValidity();
    }
}

// Función auxiliar para obtener el CSRF token
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