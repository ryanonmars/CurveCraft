document.addEventListener('DOMContentLoaded', function() {
    // Check if CSInterface is available
    if (typeof CSInterface === 'undefined') {
        document.getElementById('status').textContent = 'Error: CSInterface not loaded. Extension may not work properly.';
        return;
    }
    
    const csInterface = new CSInterface();
    const curveCanvas = document.getElementById('curveCanvas');
    const applyButton = document.getElementById('applyButton');
    const status = document.getElementById('status');
    const curveButtons = document.querySelectorAll('.curve-item');
    
    // Curve control elements
    const valuesDisplay = document.getElementById('valuesDisplay');
    
    // Current custom curve values
    let customCurve = [0.25, 0.1, 0.25, 1];
    let selectedCurve = 'custom';
    
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

    // Function to draw small previews for curve buttons
    function drawSmallPreview(canvasId, curveType, customValues = null) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Add padding around the graph area
        const padding = 24;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Set background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        
        // Draw curve
        ctx.strokeStyle = '#0078d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (curveType === 'custom') {
            // Use custom curve values
            const values = customValues || customCurve;
            ctx.moveTo(graphX, graphY + graphHeight);
            ctx.bezierCurveTo(
                graphX + graphWidth * values[0], graphY + graphHeight * (1 - values[1]),
                graphX + graphWidth * values[2], graphY + graphHeight * (1 - values[3]),
                graphX + graphWidth, graphY
            );
        } else if (curveType === 'saved' && customValues) {
            // Draw saved curve
            ctx.moveTo(graphX, graphY + graphHeight);
            ctx.bezierCurveTo(
                graphX + graphWidth * customValues[0], graphY + graphHeight * (1 - customValues[1]),
                graphX + graphWidth * customValues[2], graphY + graphHeight * (1 - customValues[3]),
                graphX + graphWidth, graphY
            );
        }
        
        ctx.stroke();
        
        // Draw small dots at start and end points
        ctx.fillStyle = '#0078d4';
        ctx.beginPath();
        ctx.arc(graphX, graphY + graphHeight, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(graphX + graphWidth, graphY, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw yellow handles for default curves
        if (curveType === 'saved' && customValues) {
            const p1x = graphX + graphWidth * customValues[0];
            const p1y = graphY + graphHeight * (1 - customValues[1]);
            const p2x = graphX + graphWidth * customValues[2];
            const p2y = graphY + graphHeight * (1 - customValues[3]);
            
            // Draw handle lines
            ctx.strokeStyle = '#ffa500';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(graphX, graphY + graphHeight);
            ctx.lineTo(p1x, p1y);
            ctx.moveTo(graphX + graphWidth, graphY);
            ctx.lineTo(p2x, p2y);
            ctx.stroke();
            
            // Draw handle dots
            ctx.fillStyle = '#ff6b00';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p1x, p1y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(p2x, p2y, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
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
            // Remove active class from all buttons
            curveButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update selected curve and preview
            selectedCurve = button.dataset.curve;
            
            drawCurve(curveCanvas, selectedCurve);
            
            // If custom curve, update the custom curve display
            if (selectedCurve === 'custom') {
                updateCustomCurve();
            }
        });
    });

    // Interactive curve editing functions
    function updateCustomCurve() {
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
            if (selectedCurve !== 'custom') {
                return;
            }
            
            canvasRect = curveCanvas.getBoundingClientRect();
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            
            // Check which handle is being dragged
            const p1 = getHandlePosition(0);
            const p2 = getHandlePosition(1);
            
            const distToP1 = getDistance(mouseX, mouseY, p1.x, p1.y);
            const distToP2 = getDistance(mouseX, mouseY, p2.x, p2.y);
            
            if (distToP1 < 12) {
                isDragging = true;
                dragHandle = 0;
                curveCanvas.style.cursor = 'grabbing';
            } else if (distToP2 < 12) {
                isDragging = true;
                dragHandle = 1;
                curveCanvas.style.cursor = 'grabbing';
            }
        });
        
        curveCanvas.addEventListener('mousemove', (e) => {
            if (!isDragging || !canvasRect) return;
            
            const mouseX = e.clientX - canvasRect.left;
            const mouseY = e.clientY - canvasRect.top;
            
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
        canvas.width = 300;
        canvas.height = 180;
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
    const copyValuesButton = document.getElementById('copyValues');

    if (saveCurveButton) {
        saveCurveButton.addEventListener('click', () => {
            const name = curveNameInput.value.trim();
            if (name) {
                createCurveButton(name, customCurve);
                status.textContent = `Saved curve: ${name}`;
                curveNameInput.value = '';
            } else {
                status.textContent = 'Please enter a curve name';
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
        
        // Get cubic-bezier values for the selected curve
        var cubicBezier;
        if (selectedCurve === 'custom') {
            cubicBezier = customCurve;
        } else {
            // Get from default curves
            cubicBezier = defaultCurves[selectedCurve] || [0.25, 0.1, 0.25, 1];
        }
        
        // Calculate After Effects ease values
        var easeData = {
            outInfluence: Math.max(0.1, Math.min(100, cubicBezier[0] * 100)),
            inInfluence: Math.max(0.1, Math.min(100, (1 - cubicBezier[2]) * 100)),
            outSpeed: Math.max(0, Math.min(100, Math.abs(cubicBezier[1]) * 100)),
            inSpeed: Math.max(0, Math.min(100, Math.abs(cubicBezier[3]) * 100))
        };
        
        // Pass the calculated ease data to ExtendScript
        csInterface.evalScript(`applyCurve("${selectedCurve}", ${JSON.stringify(easeData)})`, (result) => {
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

    


});
