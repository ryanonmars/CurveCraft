// Simplified CSInterface for CEP extensions
function CSInterface() {
    this.evalScript = function(script, callback) {
        try {
            // For CEP extensions, we need to use the proper CEP API
            if (window.__adobe_cep__) {
                window.__adobe_cep__.evalScript(script, callback);
            } else {
                console.error('CEP runtime not available');
                if (callback) callback('Error: CEP runtime not available');
            }
        } catch (e) {
            console.error('Error executing script:', e);
            if (callback) callback('Error: ' + e.toString());
        }
    };
}
