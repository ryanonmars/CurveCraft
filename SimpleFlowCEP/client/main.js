(function() {
    const csInterface = new CSInterface();
    const curveSelect = document.getElementById('curveSelect');
    const curveCanvas = document.getElementById('curveCanvas');
    const applyButton = document.getElementById('applyButton');
    const refreshButton = document.getElementById('refreshButton');
    const status = document.getElementById('status');

    // Initial curve draw
    drawCurve(curveCanvas, curveSelect.value);

    // Update curve preview on selection
    curveSelect.addEventListener('change', () => {
        drawCurve(curveCanvas, curveSelect.value);
    });

    // Apply curve to keyframes
    applyButton.addEventListener('click', () => {
        status.textContent = 'Applying curve...';
        csInterface.evalScript(`applyCurve("${curveSelect.value}")`, (result) => {
            if (result === 'Error') {
                status.textContent = 'Error: Please select keyframes in a composition.';
            } else if (result === 'Success') {
                status.textContent = 'Curve applied successfully!';
            } else {
                status.textContent = 'Result: ' + result;
            }
        });
    });

    // Refresh selection
    refreshButton.addEventListener('click', () => {
        status.textContent = 'Selection refreshed. Select keyframes and try again.';
    });
})();
