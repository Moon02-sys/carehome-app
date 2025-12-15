document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('residentSearchInput');
    const clearBtn = document.getElementById('residentClearBtn');
    const table = document.getElementById('residentsTable');
    const tbody = table ? table.querySelector('tbody') : null;

    if (!table || !tbody) return;

    // Guardar orden original de las filas
    const dataRows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('td[colspan]'));
    dataRows.forEach((row, index) => row.dataset.originalIndex = index);

    // Función para filtrar la tabla
    const applyFilter = () => {
        const term = (searchInput?.value || '').toLowerCase();
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('td[colspan]'));
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const match = cells.some(cell => cell.textContent.toLowerCase().includes(term));
            row.style.display = match ? '' : 'none';
        });
    };

    // Función para limpiar búsqueda
    const clearResidentSearch = () => {
        if (searchInput) searchInput.value = '';
        
        // Mostrar todas las filas
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('td[colspan]'));
        rows.forEach(row => row.style.display = '');
        
        // Restaurar orden original
        rows
            .slice()
            .sort((a, b) => (parseInt(a.dataset.originalIndex, 10) || 0) - (parseInt(b.dataset.originalIndex, 10) || 0))
            .forEach(row => tbody.appendChild(row));
        
        // Reiniciar direcciones de ordenamiento
        if (typeof sortDirections !== 'undefined') {
            const columnCount = table.querySelectorAll('thead th').length;
            for (let i = 0; i < columnCount; i++) {
                sortDirections[i] = true;
            }
        }
    };

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (clearBtn) clearBtn.addEventListener('click', clearResidentSearch);

    // Exponer función globalmente para el onclick del HTML
    window.clearResidentSearch = clearResidentSearch;
});
