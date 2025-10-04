document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing extension...');
    
    // Check if CSInterface is available
    if (typeof CSInterface === 'undefined') {
        console.error('CSInterface not loaded!');
        document.getElementById('status').textContent = 'Error: CSInterface not loaded. Extension may not work properly.';
        return;
    }
    
    const csInterface = new CSInterface();
    console.log('CSInterface initialized');
    const curveSelect = document.getElementById('curveSelect');
    const curveCanvas = document.getElementById('curveCanvas');
    const testButton = document.getElementById('testButton');
    const applyButton = document.getElementById('applyButton');
    const refreshButton = document.getElementById('refreshButton');
    const status = document.getElementById('status');

    console.log('Elements found:', {
        curveSelect: !!curveSelect,
        curveCanvas: !!curveCanvas,
        testButton: !!testButton,
        applyButton: !!applyButton,
        refreshButton: !!refreshButton,
        status: !!status
    });

    // Initial curve draw
    if (curveCanvas && curveSelect) {
        drawCurve(curveCanvas, curveSelect.value);
    }

    // Test connection to After Effects
    testButton.addEventListener('click', () => {
        console.log('Test button clicked');
        status.textContent = 'Testing connection...';
        
        // Simple test first
        try {
            csInterface.evalScript('"Hello from After Effects"', (result) => {
                console.log('Test result:', result);
                if (result && result !== 'null' && result !== 'Error') {
                    status.textContent = 'Connected! AE responded: ' + result;
                } else {
                    status.textContent = 'Error: No response from After Effects';
                }
            });
        } catch (e) {
            console.error('Test error:', e);
            status.textContent = 'Error: ' + e.toString();
        }
    });

    // Update curve preview on selection
    curveSelect.addEventListener('change', () => {
        drawCurve(curveCanvas, curveSelect.value);
    });

    // Apply curve to keyframes
    applyButton.addEventListener('click', () => {
        status.textContent = 'Applying curve...';
        console.log('Attempting to apply curve:', curveSelect.value);
        
        // Get cubic-bezier values for the selected curve
        var cubicBezier = getCubicBezierForCurve(curveSelect.value);
        console.log('Cubic-bezier values:', cubicBezier);
        
        // Calculate After Effects ease values (like Flow does)
        var easeData = calculateAfterEffectsEase(cubicBezier);
        console.log('After Effects ease values:', easeData);
        
        // Pass the calculated ease data to ExtendScript (like Flow does)
        csInterface.evalScript(`applyCurve("${curveSelect.value}", ${JSON.stringify(easeData)})`, (result) => {
            console.log('Result from After Effects:', result);
            if (result === 'Error') {
                status.textContent = 'Error: Please select keyframes in a composition.';
            } else if (result === 'Success') {
                status.textContent = 'Curve applied successfully!';
            } else if (result === null || result === undefined) {
                status.textContent = 'Error: No response from After Effects. Check if AE is open and a composition is selected.';
            } else {
                status.textContent = 'Result: ' + result;
            }
        });
    });
    
    function getCubicBezierForCurve(curveType) {
        if (curveType === "linear") {
            return [0, 0, 1, 1];
        } else if (curveType === "easeIn") {
            return [0.42, 0, 1, 1];
        } else if (curveType === "easeOut") {
            return [0, 0, 0.58, 1];
        } else if (curveType === "easeInOut") {
            return [0.42, 0, 0.58, 1];
        } else if (curveType === "bounce") {
            return [0.68, -0.55, 0.265, 1.55];
        } else if (curveType === "elastic") {
            return [0.175, 0.885, 0.32, 1.275];
        }
        return [0.25, 0.1, 0.25, 1]; // Default
    }
    
    function calculateAfterEffectsEase(cubicBezier) {
        // Convert cubic-bezier to After Effects ease values
        // This is a simplified conversion - Flow likely uses more complex calculations
        
        var p1x = cubicBezier[0];
        var p1y = cubicBezier[1];
        var p2x = cubicBezier[2];
        var p2y = cubicBezier[3];
        
        // Calculate influence based on control point positions
        var outInfluence = Math.max(0.1, Math.min(100, p1x * 100));
        var inInfluence = Math.max(0.1, Math.min(100, (1 - p2x) * 100));
        
        // Calculate speed based on control point slopes
        var outSpeed = Math.max(0, Math.min(100, Math.abs(p1y) * 100));
        var inSpeed = Math.max(0, Math.min(100, Math.abs(p2y) * 100));
        
        return {
            outInfluence: outInfluence,
            inInfluence: inInfluence,
            outSpeed: outSpeed,
            inSpeed: inSpeed
        };
    }

    // Refresh selection
    refreshButton.addEventListener('click', () => {
        status.textContent = 'Selection refreshed. Select keyframes and try again.';
    });
});
