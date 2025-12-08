/**
 * Global function to display Bootstrap alerts
 * @param {string} message - The alert message to display
 * @param {string} type - Bootstrap alert type: 'success', 'warning', 'danger', 'info', etc. (default: 'success')
 * @param {number} timeout - Time in milliseconds before auto-closing the alert (default: 4000ms = 4s)
 *                          Set to 0 or falsy value to prevent auto-closing
 */
window.showAlert = function(message, type = 'success', timeout = 4000) {
    try {
        const container = document.getElementById('flash-messages-container');
        if (!container) return;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
        container.appendChild(wrapper);
        if (timeout && timeout > 0) {
            setTimeout(() => {
                try {
                    const alertEl = bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert'));
                    alertEl.close();
                } catch (e) {
                    wrapper.remove();
                }
            }, timeout);
        }
    } catch (e) {
        console.error('showAlert error', e);
    }
};
