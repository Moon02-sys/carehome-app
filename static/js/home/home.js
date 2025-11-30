// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
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

function registrarCaida() {
    const form = document.getElementById('nuevaCaidaForm');
    if (form.checkValidity()) {
        alert('Caída registrada correctamente');
        var modal = bootstrap.Modal.getInstance(document.getElementById('nuevaCaidaModal'));
        modal.hide();
        form.reset();
    } else {
        form.reportValidity();
    }
}