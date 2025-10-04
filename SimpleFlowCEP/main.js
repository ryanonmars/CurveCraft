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
    const curveCanvas = document.getElementById('curveCanvas');
    const applyButton = document.getElementById('applyButton');
    const status = document.getElementById('status');
    const curveButtons = document.querySelectorAll('.curve-item');
    
    // Curve control elements
    const valuesDisplay = document.getElementById('valuesDisplay');
    
    // Current custom curve values
    let customCurve = [0.25, 0.1, 0.25, 1];
    let selectedCurve = 'custom';
    let savedCurves = {};
    
    // Default curves that are always available
    const defaultCurves = {
        'Ease Out': [0.344, 0.053, 0.002, 1.000],
        'Ease In': [0.927, 0.000, 0.852, 0.953],
        'Ease In-Out': [0.694, 0.000, 0.306, 1.000],
        'Smooth Linear': [0.285, 0.000, 0.648, 1.000]
    };
    
    // Interactive curve editing
    let isDragging = false;
    let dragHandle = null;
    let canvasRect = null;

    console.log('Elements found:', {
        curveCanvas: !!curveCanvas,
        applyButton: !!applyButton,
        status: !!status,
        curveButtons: curveButtons.length
    });

    // Export saved curves for packaging
    function exportSavedCurves() {
        const saved = localStorage.getItem('simpleFlowCurves');
        if (saved) {
            console.log('=== COPY THIS CODE TO MAKE DEFAULTS ===');
            console.log('const defaultCurves = ' + saved + ';');
            console.log('=== END COPY ===');
            return JSON.parse(saved);
        }
        return {};
    }

    // Load default curves
    function loadDefaultCurves() {
        const savedCurvesContainer = document.getElementById('savedCurves');
        
        // Remove "no curves" message if it exists
        const noCurves = savedCurvesContainer.querySelector('.no-curves');
        if (noCurves) {
            noCurves.remove();
        }
        
        // Load default curves
        Object.keys(defaultCurves).forEach(name => {
            createCurveButton(name, defaultCurves[name]);
        });
    }

    // Initial curve draw
    if (curveCanvas) {
        drawCurve(curveCanvas, selectedCurve);
        drawSmallPreview('custom-preview', 'custom');
        
        // Initialize custom curve
        window.customCurve = customCurve;
        updateCustomCurve();
        
        // Load default curves
        loadDefaultCurves();
    }

    // Handle curve button clicks
    curveButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Button clicked, dataset.curve:', button.dataset.curve);
            
            // Remove active class from all buttons
            curveButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update selected curve and preview
            selectedCurve = button.dataset.curve;
            console.log('Selected curve updated to:', selectedCurve);
            
            drawCurve(curveCanvas, selectedCurve);
            
            // If custom curve, update the custom curve display
            if (selectedCurve === 'custom') {
                updateCustomCurve();
            }
        });
    });

    // Interactive curve editing functions
    function updateCustomCurve() {
        console.log('Updating custom curve:', customCurve);
        // Set global variable for curves.js
        window.customCurve = customCurve;
        valuesDisplay.textContent = `[${customCurve.map(v => v.toFixed(2)).join(', ')}]`;
        drawCurve(curveCanvas, 'custom');
    }
    
    function getHandlePosition(handleIndex) {
        const width = curveCanvas.width;
        const height = curveCanvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        if (handleIndex === 0) {
            // P1 handle - clamp to graph bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * customCurve[0])),
                y: Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - customCurve[1])))
            };
        } else {
            // P2 handle - clamp to graph bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * customCurve[2])),
                y: Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - customCurve[3])))
            };
        }
    }
    
    function updateHandleFromPosition(handleIndex, x, y) {
        const width = curveCanvas.width;
        const height = curveCanvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Convert mouse position to graph coordinates and clamp to bounds
        const graphX_pos = Math.max(0, Math.min(1, (x - graphX) / graphWidth));
        const graphY_pos = Math.max(0, Math.min(1, (y - graphY) / graphHeight));
        
        if (handleIndex === 0) {
            customCurve[0] = graphX_pos;
            customCurve[1] = 1 - graphY_pos;
        } else {
            customCurve[2] = graphX_pos;
            customCurve[3] = 1 - graphY_pos;
        }
        
        updateCustomCurve();
    }
    
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    // Canvas mouse events for interactive editing
    if (curveCanvas) {
        // Make canvas cursor changeable
        curveCanvas.style.cursor = 'crosshair';
        
        curveCanvas.addEventListener('mousedown', (e) => {
            console.log('Mouse down on canvas, selectedCurve:', selectedCurve);
            console.log('Custom curve values:', customCurve);
            console.log('Window custom curve:', window.customCurve);
            
            if (selectedCurve !== 'custom') {
                console.log('Not custom curve, ignoring mouse event');
                return;
            }
            
            canvasRect = curveCanvas.getBoundingClientRect();
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            
            console.log('Mouse position:', mouseX, mouseY);
            console.log('Canvas size:', curveCanvas.width, 'x', curveCanvas.height);
            
            // Check which handle is being dragged
            const p1 = getHandlePosition(0);
            const p2 = getHandlePosition(1);
            
            console.log('Handle positions - P1:', p1, 'P2:', p2);
            
            const distToP1 = getDistance(mouseX, mouseY, p1.x, p1.y);
            const distToP2 = getDistance(mouseX, mouseY, p2.x, p2.y);
            
            console.log('Distances - P1:', distToP1, 'P2:', distToP2);
            
            if (distToP1 < 12) {
                console.log('Dragging P1 handle');
                isDragging = true;
                dragHandle = 0;
                curveCanvas.style.cursor = 'grabbing';
            } else if (distToP2 < 12) {
                console.log('Dragging P2 handle');
                isDragging = true;
                dragHandle = 1;
                curveCanvas.style.cursor = 'grabbing';
            } else {
                console.log('Not close enough to any handle');
            }
        });
        
        curveCanvas.addEventListener('mousemove', (e) => {
            if (!isDragging || !canvasRect) return;
            
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            
            console.log('Dragging handle', dragHandle, 'to position:', mouseX, mouseY);
            updateHandleFromPosition(dragHandle, mouseX, mouseY);
        });
        
        curveCanvas.addEventListener('mouseup', () => {
            isDragging = false;
            dragHandle = null;
            canvasRect = null;
        });
        
        curveCanvas.addEventListener('mouseleave', () => {
            isDragging = false;
            dragHandle = null;
            canvasRect = null;
        });
    }

    // Function to create a new curve button
    function createCurveButton(name, curveValues) {
        const curveButtonsContainer = document.getElementById('savedCurves');
        
        // Remove "no curves" message if it exists
        const noCurves = curveButtonsContainer.querySelector('.no-curves');
        if (noCurves) {
            noCurves.remove();
        }
        
        // Create the button element
        const button = document.createElement('div');
        button.className = 'curve-item';
        button.dataset.curve = 'saved';
        button.dataset.curveName = name;
        
        // Create canvas for preview
        const canvas = document.createElement('canvas');
        canvas.className = 'curve-preview-small';
        canvas.width = 50;
        canvas.height = 30;
        canvas.id = `${name}-preview`;
        
        // Create name div
        const nameDiv = document.createElement('div');
        nameDiv.className = 'curve-name';
        nameDiv.textContent = name;
        
        // Assemble the button
        button.appendChild(canvas);
        button.appendChild(nameDiv);
        
        // Add click handler
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.curve-item').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Load the saved curve
            customCurve = [...curveValues];
            window.customCurve = customCurve;
            updateCustomCurve();
            drawCurve(curveCanvas, 'custom');
        });
        
        // Add to container
        curveButtonsContainer.appendChild(button);
        
        // Draw the preview
        drawSmallPreview(`${name}-preview`, 'saved', curveValues);
    }
    
    // Save/Load functionality
    const curveNameInput = document.getElementById('curveName');
    const saveCurveButton = document.getElementById('saveCurve');
    const loadCurveButton = document.getElementById('loadCurve');
    const copyValuesButton = document.getElementById('copyValues');

    if (saveCurveButton) {
        saveCurveButton.addEventListener('click', () => {
            const name = curveNameInput.value.trim();
            if (name) {
                savedCurves[name] = [...customCurve];
                createCurveButton(name, customCurve);
                status.textContent = `Saved curve: ${name}`;
                curveNameInput.value = '';
            } else {
                status.textContent = 'Please enter a curve name';
            }
        });
    }

    if (loadCurveButton) {
        loadCurveButton.addEventListener('click', () => {
            const name = curveNameInput.value.trim();
            if (name && savedCurves[name]) {
                customCurve = [...savedCurves[name]];
                updateCustomCurve();
                status.textContent = `Loaded curve: ${name}`;
            } else {
                status.textContent = 'Curve not found';
            }
        });
    }

    if (copyValuesButton) {
        copyValuesButton.addEventListener('click', () => {
            const values = customCurve.map(v => v.toFixed(3)).join(', ');
            navigator.clipboard.writeText(`[${values}]`).then(() => {
                status.textContent = `Copied: [${values}]`;
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = `[${values}]`;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                status.textContent = `Copied: [${values}]`;
            });
        });
    }

    // Apply curve to keyframes
    applyButton.addEventListener('click', () => {
        status.textContent = 'Applying curve...';
        console.log('Attempting to apply curve:', selectedCurve);
        
        // Get cubic-bezier values for the selected curve
        var cubicBezier;
        if (selectedCurve === 'custom') {
            cubicBezier = customCurve;
        } else {
            cubicBezier = getCubicBezierForCurve(selectedCurve);
        }
        console.log('Cubic-bezier values:', cubicBezier);
        
        // Calculate After Effects ease values (like Flow does)
        var easeData = calculateAfterEffectsEase(cubicBezier);
        console.log('After Effects ease values:', easeData);
        
        // Pass the calculated ease data to ExtendScript (like Flow does)
        csInterface.evalScript(`applyCurve("${selectedCurve}", ${JSON.stringify(easeData)})`, (result) => {
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
            return [0.68, -0.55, 0.265, 1.55]; // Dramatic S-curve with sharp dip
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

    function drawSmallPreview(canvasId, curveType, customValues = null) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            status.textContent = 'Error: Canvas not found: ' + canvasId;
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the exact same curve as the main canvas
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        if (curveType === 'smooth') {
            // Use the exact same cubic-bezier values as the main graph
            ctx.moveTo(2, height - 2);
            ctx.bezierCurveTo(
                width * 0.25, height * (1 - 0.1),  // p1x, p1y (inverted Y)
                width * 0.25, height * (1 - 1),    // p2x, p2y (inverted Y)
                width - 2, 2
            );
        } else if (curveType === 'easeOut') {
            // Dramatic S-curve with sharp dip
            ctx.moveTo(2, height - 2);
            ctx.bezierCurveTo(
                width * 0.68, height * (1 - (-0.55)),  // p1x, p1y (inverted Y)
                width * 0.265, height * (1 - 1.55),    // p2x, p2y (inverted Y)
                width - 2, 2
            );
        } else if (curveType === 'saved' && customValues) {
            // Draw saved curve
            ctx.moveTo(2, height - 2);
            ctx.bezierCurveTo(
                width * customValues[0], height * (1 - customValues[1]),
                width * customValues[2], height * (1 - customValues[3]),
                width - 2, 2
            );
        }
        
        ctx.stroke();
        
        // Draw small dots at start and end points
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(2, height - 2, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width - 2, 2, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }

});
