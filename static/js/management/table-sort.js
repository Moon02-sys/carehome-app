// Funcionalidad de ordenación alfabética para tablas
let sortDirections = [true, true, true]; // true = ascendente, false = descendente

function sortTable(columnIndex) {
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.querySelector('td[colspan]'));
    
    if (rows.length === 0) return;
    
    const isAscending = sortDirections[columnIndex];
    
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim().toLowerCase();
        const bText = b.cells[columnIndex].textContent.trim().toLowerCase();
        
        if (aText < bText) return isAscending ? -1 : 1;
        if (aText > bText) return isAscending ? 1 : -1;
        return 0;
    });
    
    // Limpiar tbody y agregar filas ordenadas
    rows.forEach(row => tbody.appendChild(row));
    
    // Cambiar dirección para el próximo clic
    sortDirections[columnIndex] = !isAscending;
}
