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
        // Focus on VALUE GRAPH shapes - these create the visual curve you see
        if (curveType === "linear") {
            return [0, 0, 1, 1]; // Straight line
        } else if (curveType === "easeIn") {
            return [0.55, 0.055, 0.675, 0.19]; // Slow start, then accelerates
        } else if (curveType === "easeOut") {
            return [0.215, 0.61, 0.355, 1]; // Fast start, then decelerates
        } else if (curveType === "easeInOut") {
            return [0.645, 0.045, 0.355, 1]; // S-curve: slow-fast-slow
        } else if (curveType === "bounce") {
            return [0.68, -0.55, 0.265, 1.55]; // Bouncy S-curve
        } else if (curveType === "elastic") {
            return [0.175, 0.885, 0.32, 1.275]; // Elastic S-curve
        } else if (curveType === "smooth") {
            return [0.25, 0.1, 0.25, 1]; // Classic smooth S-curve
        }
        return [0.25, 0.1, 0.25, 1]; // Default smooth curve
    }
    
    function calculateAfterEffectsEase(cubicBezier) {
        // Convert cubic-bezier to After Effects ease values
        // Focus on creating the exact curve shape we want
        
        var p1x = cubicBezier[0];
        var p1y = cubicBezier[1];
        var p2x = cubicBezier[2];
        var p2y = cubicBezier[3];
        
        // For S-curve (ease-in/ease-out), we need:
        // - Low outgoing speed (slow start)
        // - High outgoing influence (gradual acceleration)
        // - Low incoming speed (slow end)
        // - High incoming influence (gradual deceleration)
        
        if (p1x === 0.25 && p1y === 0.1 && p2x === 0.25 && p2y === 1) {
            // Smooth S-curve: slower ease-out for more gradual deceleration
            return {
                outInfluence: 25.0,  // Lower influence for slower start
                inInfluence: 50.0,   // Higher influence for more gradual end
                outSpeed: 25.0,      // Lower speed for slower start
                inSpeed: 16.7        // Much lower speed for very gradual end
            };
        } else if (p1x === 0.55 && p1y === 0.055 && p2x === 0.675 && p2y === 0.19) {
            // Ease In: slow start, then accelerates
            return {
                outInfluence: 16.7,  // Low influence for very slow start
                inInfluence: 33.3,   // Moderate influence
                outSpeed: 16.7,      // Very low speed for slow start
                inSpeed: 50.0        // Higher speed for acceleration
            };
        } else if (p1x === 0.215 && p1y === 0.61 && p2x === 0.355 && p2y === 1) {
            // Ease Out: fast start, then decelerates
            return {
                outInfluence: 50.0,  // High influence for fast start
                inInfluence: 16.7,   // Low influence for gradual end
                outSpeed: 50.0,      // High speed for fast start
                inSpeed: 16.7        // Low speed for slow end
            };
        } else if (p1x === 0.645 && p1y === 0.045 && p2x === 0.355 && p2y === 1) {
            // Ease In-Out: S-curve variant
            return {
                outInfluence: 25.0,  // Low influence for slow start
                inInfluence: 25.0,   // Low influence for slow end
                outSpeed: 25.0,      // Low speed for slow start
                inSpeed: 25.0        // Low speed for slow end
            };
        } else {
            // Default: use the cubic-bezier values directly
            var outInfluence = Math.max(0.1, Math.min(100, p1x * 100));
            var inInfluence = Math.max(0.1, Math.min(100, (1 - p2x) * 100));
            var outSpeed = Math.max(0, Math.min(100, Math.abs(p1y) * 100));
            var inSpeed = Math.max(0, Math.min(100, Math.abs(p2y) * 100));
            
            return {
                outInfluence: outInfluence,
                inInfluence: inInfluence,
                outSpeed: outSpeed,
                inSpeed: inSpeed
            };
        }
    }

    // Refresh selection
    refreshButton.addEventListener('click', () => {
        status.textContent = 'Selection refreshed. Select keyframes and try again.';
    });
});
