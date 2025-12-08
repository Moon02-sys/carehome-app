// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual en el modal de caída cuando se abra
    const nuevaCaidaModal = document.getElementById('nuevaCaidaModal');
    if (nuevaCaidaModal) {
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

    // Agregar evento al botón limpiar
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }

    // Agregar eventos de ordenamiento a las columnas
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            sortTable(this.dataset.column);
        });
    });

    // Agregar evento al botón de registrar caída
    const registrarBtn = document.getElementById('registrarCaidaBtn');
    if (registrarBtn) {
        registrarBtn.addEventListener('click', registrarCaida);
    }
});

let sortDirection = {};

function sortTable(column) {
    const table = document.querySelector('.table tbody');
    const rows = Array.from(table.getElementsByTagName('tr'));
    
    // Determinar dirección de ordenamiento (alternar entre asc y desc)
    if (!sortDirection[column]) {
        sortDirection[column] = 'asc';
    } else {
        sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
    }
    
    const direction = sortDirection[column];
    
    // Ordenar las filas alfabéticamente
    rows.sort((a, b) => {
        const aValue = a.getElementsByTagName('td')[column].textContent.trim().toLowerCase();
        const bValue = b.getElementsByTagName('td')[column].textContent.trim().toLowerCase();
        
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
        const residenteId = document.getElementById('residente').value;
        const lugar = document.getElementById('lugar').value;
        const familiarInformado = document.getElementById('familiarInformado').value;
        const causa = document.getElementById('causa').value;
        const consecuencias = document.getElementById('consecuencias').value;
        const observaciones = document.getElementById('observaciones').value;

        // Preparar los datos de la caída como anotación
        const formData = {
            fecha: fecha,
            lugar: lugar,
            familiarInformado: familiarInformado,
            causa: causa,
            consecuencias: consecuencias
        };

        const annotationData = {
            resident_id: residenteId,
            panel: 'incidencia',
            type: 'caida',
            status: 'abierto',
            form_data: formData,
            notes: observaciones
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
                alert('Caída registrada correctamente como anotación');
                var modal = bootstrap.Modal.getInstance(document.getElementById('nuevaCaidaModal'));
                modal.hide();
                form.reset();
                // Recargar la página para mostrar la nueva anotación en el panel
                location.reload();
            } else {
                alert('Error al registrar: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar la caída');
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