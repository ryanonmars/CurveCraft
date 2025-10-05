document.addEventListener('DOMContentLoaded', function() {
    // Check if CSInterface is available
    if (typeof CSInterface === 'undefined') {
        document.getElementById('status').textContent = 'Error: CSInterface not loaded. Extension may not work properly.';
        return;
    }
    
    const csInterface = new CSInterface();
    const curveCanvas = document.getElementById('curveCanvas');
    const applyButton = document.getElementById('applyButton');
    const curveButtons = document.querySelectorAll('.curve-item');
    
    // Curve control elements
    const valuesDisplay = document.getElementById('valuesDisplay');
    
    // Current custom curve values
    let customCurve = [0.25, 0.1, 0.25, 1];
    let selectedCurve = 'custom';
    let currentMode = 'defaults';
    
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

    // Toggle between defaults and user curves
    function switchMode(mode) {
        currentMode = mode;
        const savedCurvesContainer = document.getElementById('savedCurves');
        
        // Reset edit mode when switching tabs
        isEditMode = false;
        if (editButton) {
            editButton.textContent = 'Edit';
        }
        
        // Clear current curves
        savedCurvesContainer.innerHTML = '';
        
        if (mode === 'defaults') {
            loadDefaultCurves();
            editControls.style.display = 'none';
        } else {
            // Load user curves from localStorage
            const saved = localStorage.getItem('simpleFlowCurves');
            if (saved) {
                const userCurves = JSON.parse(saved);
                Object.keys(userCurves).forEach(name => {
                    createCurveButton(name, userCurves[name]);
                });
                editControls.style.display = 'block';
            } else {
                savedCurvesContainer.innerHTML = '<div class="no-curves">No user curves saved yet</div>';
                editControls.style.display = 'none';
            }
        }
    }

    // Function to draw small previews for curve buttons
    function drawSmallPreview(canvasId, curveType, customValues = null) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Set canvas size to match its display size
        const rect = canvas.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height) || 80; // fallback to 80px
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Add padding around the graph area
        const padding = 8;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Set background
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
        
        
        // Draw curve
        ctx.strokeStyle = '#0078d4';
        ctx.lineWidth = 4;
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
        ctx.arc(graphX, graphY + graphHeight, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(graphX + graphWidth, graphY, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw yellow handles for default curves
        if (curveType === 'saved' && customValues) {
            const p1x = graphX + graphWidth * customValues[0];
            const p1y = graphY + graphHeight * (1 - customValues[1]);
            const p2x = graphX + graphWidth * customValues[2];
            const p2y = graphY + graphHeight * (1 - customValues[3]);
            
            // Draw handle lines
            ctx.strokeStyle = '#ffa500';
            ctx.lineWidth = 3;
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
            ctx.arc(p1x, p1y, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(p2x, p2y, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }

    // Toggle button event listeners
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Switch mode
            const mode = button.dataset.mode;
            switchMode(mode);
        });
    });

    // Initial curve draw
    if (curveCanvas) {
        // Initialize custom curve first
        window.customCurve = customCurve;
        updateCustomCurve();
        
        // Load default curves
        loadDefaultCurves();
        
        // Draw the curve after everything is set up
        drawCurve(curveCanvas, selectedCurve);
        drawSmallPreview('custom-preview', 'custom');
    }

    // Add resize observer to redraw small previews when window resizes
    const resizeObserver = new ResizeObserver(() => {
        // Redraw all small previews
        const smallCanvases = document.querySelectorAll('.curve-preview-small');
        smallCanvases.forEach(canvas => {
            const curveItem = canvas.closest('.curve-item');
            if (curveItem) {
                const curveName = curveItem.dataset.curveName;
                if (curveName && defaultCurves[curveName]) {
                    drawSmallPreview(canvas.id, 'saved', defaultCurves[curveName]);
                } else if (curveItem.dataset.curve === 'custom') {
                    drawSmallPreview(canvas.id, 'custom');
                }
            }
        });
    });

    // Observe the curve buttons container for size changes
    const curveButtonsContainer = document.getElementById('savedCurves');
    if (curveButtonsContainer) {
        resizeObserver.observe(curveButtonsContainer);
    }

    // Also listen for window resize events
    window.addEventListener('resize', () => {
        setTimeout(() => {
            // Redraw all small previews
            const smallCanvases = document.querySelectorAll('.curve-preview-small');
            smallCanvases.forEach(canvas => {
                const curveItem = canvas.closest('.curve-item');
                if (curveItem) {
                    const curveName = curveItem.dataset.curveName;
                    if (curveName && defaultCurves[curveName]) {
                        drawSmallPreview(canvas.id, 'saved', defaultCurves[curveName]);
                    } else if (curveItem.dataset.curve === 'custom') {
                        drawSmallPreview(canvas.id, 'custom');
                    }
                }
            });
        }, 100);
    });

    // Force redraw on any layout changes
    const mutationObserver = new MutationObserver(() => {
        setTimeout(() => {
            const smallCanvases = document.querySelectorAll('.curve-preview-small');
            smallCanvases.forEach(canvas => {
                const curveItem = canvas.closest('.curve-item');
                if (curveItem) {
                    const curveName = curveItem.dataset.curveName;
                    if (curveName && defaultCurves[curveName]) {
                        drawSmallPreview(canvas.id, 'saved', defaultCurves[curveName]);
                    } else if (curveItem.dataset.curve === 'custom') {
                        drawSmallPreview(canvas.id, 'custom');
                    }
                }
            });
        }, 50);
    });

    // Observe the curve buttons container for DOM changes
    if (curveButtonsContainer) {
        mutationObserver.observe(curveButtonsContainer, { childList: true, subtree: true });
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
            
            // Always update customCurve with the selected curve values
            if (selectedCurve === 'custom') {
                updateCustomCurve();
            } else {
                // Load curve values into customCurve for editing
                const curveValues = defaultCurves[selectedCurve] || [0.25, 0.1, 0.25, 1];
                customCurve = [...curveValues];
                window.customCurve = customCurve;
                updateCustomCurve();
            }
            
            drawCurve(curveCanvas, selectedCurve);
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
        
        // Use the same values as the curve drawing
        const currentValues = window.customCurve || customCurve || [0.25, 0.1, 0.25, 1];
        
        if (handleIndex === 0) {
            // P1 handle - clamp to graph bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * currentValues[0])),
                y: Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - currentValues[1])))
            };
        } else {
            // P2 handle - clamp to graph bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * currentValues[2])),
                y: Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - currentValues[3])))
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
            // Always allow handle adjustment
            canvasRect = curveCanvas.getBoundingClientRect();
            
            // Account for canvas scaling (display size vs actual size)
            const scaleX = curveCanvas.width / canvasRect.width;
            const scaleY = curveCanvas.height / canvasRect.height;
            
            const mouseX = (e.clientX - canvasRect.left) * scaleX;
            const mouseY = (e.clientY - canvasRect.top) * scaleY;
            
            // Check which handle is being dragged
            const p1 = getHandlePosition(0);
            const p2 = getHandlePosition(1);
            
            const distToP1 = getDistance(mouseX, mouseY, p1.x, p1.y);
            const distToP2 = getDistance(mouseX, mouseY, p2.x, p2.y);
            
            if (distToP1 < 20) {
                isDragging = true;
                dragHandle = 0;
                curveCanvas.style.cursor = 'grabbing';
            } else if (distToP2 < 20) {
                isDragging = true;
                dragHandle = 1;
                curveCanvas.style.cursor = 'grabbing';
            }
        });
        
        curveCanvas.addEventListener('mousemove', (e) => {
            if (!isDragging || !canvasRect) return;
            
            // Account for canvas scaling
            const scaleX = curveCanvas.width / canvasRect.width;
            const scaleY = curveCanvas.height / canvasRect.height;
            
            const mouseX = (e.clientX - canvasRect.left) * scaleX;
            const mouseY = (e.clientY - canvasRect.top) * scaleY;
            
            updateHandleFromPosition(dragHandle, mouseX, mouseY);
        });
        
        curveCanvas.addEventListener('mouseup', () => {
            isDragging = false;
            dragHandle = null;
            canvasRect = null;
            curveCanvas.style.cursor = 'crosshair';
        });
        
        curveCanvas.addEventListener('mouseleave', () => {
            isDragging = false;
            dragHandle = null;
            canvasRect = null;
            curveCanvas.style.cursor = 'crosshair';
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
        canvas.id = `${name}-preview`;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
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
        
        // Draw the preview after a short delay to ensure DOM is ready
        setTimeout(() => {
            drawSmallPreview(`${name}-preview`, 'saved', curveValues);
        }, 10);
    }
    
    // Save/Load functionality
    const curveNameInput = document.getElementById('curveName');
    const saveCurveButton = document.getElementById('saveCurve');

    // Star button (save preset) functionality
    const starButton = document.getElementById('starButton');

    // Edit functionality
    const editButton = document.getElementById('editButton');
    const editControls = document.getElementById('editControls');
    let isEditMode = false;

    if (saveCurveButton) {
        saveCurveButton.addEventListener('click', () => {
            const name = curveNameInput.value.trim();
            if (name) {
                // Check if name already exists
                const saved = localStorage.getItem('simpleFlowCurves') || '{}';
                const userCurves = JSON.parse(saved);
                
                if (userCurves[name]) {
                    alert(`A curve named "${name}" already exists. Please choose a different name.`);
                    return;
                }
                
                // Save to localStorage
                userCurves[name] = [...customCurve];
                localStorage.setItem('simpleFlowCurves', JSON.stringify(userCurves));
                
                createCurveButton(name, customCurve);
                curveNameInput.value = '';
            } else {
                alert('Please enter a curve name');
            }
        });
    }


    if (valuesDisplay) {
        valuesDisplay.addEventListener('click', () => {
            const values = customCurve.map(v => v.toFixed(3)).join(', ');
            navigator.clipboard.writeText(`[${values}]`).then(() => {
                // Visual feedback - briefly change color
                valuesDisplay.style.color = '#4CAF50';
                setTimeout(() => {
                    valuesDisplay.style.color = '#ffffff';
                }, 200);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = `[${values}]`;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Visual feedback
                valuesDisplay.style.color = '#4CAF50';
                setTimeout(() => {
                    valuesDisplay.style.color = '#ffffff';
                }, 200);
            });
        });
    }

    // Star button functionality
    if (starButton) {
        starButton.addEventListener('click', () => {
            const curveName = prompt('Enter a name for this curve:');
            if (curveName && curveName.trim()) {
                // Check if name already exists
                const saved = localStorage.getItem('simpleFlowCurves') || '{}';
                const userCurves = JSON.parse(saved);
                
                if (userCurves[curveName.trim()]) {
                    alert(`A curve named "${curveName.trim()}" already exists. Please choose a different name.`);
                } else {
                    // Save to localStorage
                    userCurves[curveName.trim()] = [...customCurve];
                    localStorage.setItem('simpleFlowCurves', JSON.stringify(userCurves));
                    
                    // Create the button if we're in user curves mode
                    if (currentMode === 'user') {
                        createCurveButton(curveName.trim(), customCurve);
                    }
                    
                    alert(`Curve "${curveName.trim()}" saved successfully!`);
                }
            } else if (curveName !== null) {
                alert('Please enter a curve name');
            }
        });
    }

    // Import button functionality
    const importButton = document.getElementById('importButton');
    if (importButton) {
        importButton.addEventListener('click', () => {
            // Create a simple input dialog
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Paste curve values: [0.250, 0.100, 0.250, 1.000]';
            input.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; padding: 10px; font-size: 14px; width: 300px;';
            
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;';
            
            const button = document.createElement('button');
            button.textContent = 'Import';
            button.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); margin-top: 40px; padding: 8px 16px; z-index: 1000;';
            
            overlay.appendChild(input);
            overlay.appendChild(button);
            document.body.appendChild(overlay);
            input.focus();
            
            function cleanup() {
                document.body.removeChild(overlay);
            }
            
            button.addEventListener('click', () => {
                const curveString = input.value.trim();
                if (curveString) {
                    try {
                        const values = JSON.parse(curveString);
                        
                        if (Array.isArray(values) && values.length === 4) {
                            const validValues = values.every(v => typeof v === 'number' && v >= 0 && v <= 1);
                            
                            if (validValues) {
                                customCurve = [...values];
                                window.customCurve = customCurve;
                                updateCustomCurve();
                                drawCurve(curveCanvas, 'custom');
                                selectedCurve = 'custom';
                                cleanup();
                                
                                // Prompt to save the imported curve
                                const curveName = prompt('Enter a name for this curve (or leave blank to skip saving):');
                                if (curveName && curveName.trim()) {
                                    const saved = localStorage.getItem('simpleFlowCurves') || '{}';
                                    const userCurves = JSON.parse(saved);
                                    
                                    if (userCurves[curveName.trim()]) {
                                        alert(`A curve named "${curveName.trim()}" already exists. Please choose a different name.`);
                                    } else {
                                        // Save to localStorage
                                        userCurves[curveName.trim()] = [...customCurve];
                                        localStorage.setItem('simpleFlowCurves', JSON.stringify(userCurves));
                                        
                                        // Create the button if we're in user curves mode
                                        if (currentMode === 'user') {
                                            createCurveButton(curveName.trim(), customCurve);
                                        }
                                        
                                        alert(`Curve "${curveName.trim()}" saved successfully!`);
                                    }
                                }
                            } else {
                                console.log('Invalid curve values. All values must be numbers between 0 and 1.');
                            }
                        } else {
                            console.log('Invalid format. Please use format: [0.250, 0.100, 0.250, 1.000]');
                        }
                    } catch (error) {
                        console.log('Invalid format. Please use format: [0.250, 0.100, 0.250, 1.000]');
                    }
                }
                cleanup();
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup();
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    button.click();
                } else if (e.key === 'Escape') {
                    cleanup();
                }
            });
        });
    }




    // Edit button functionality
    if (editButton) {
        editButton.addEventListener('click', () => {
            isEditMode = !isEditMode;
            toggleEditMode();
        });
    }

    function toggleEditMode() {
        const curveItems = document.querySelectorAll('.curve-item[data-curve="saved"]');
        
        if (isEditMode) {
            editButton.textContent = 'Done';
            curveItems.forEach(item => {
                item.classList.add('edit-mode');
                const deleteX = document.createElement('button');
                deleteX.className = 'delete-x';
                deleteX.innerHTML = '×';
                deleteX.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const curveName = item.dataset.curveName;
                    if (confirm(`Delete curve "${curveName}"?`)) {
                        deleteUserCurve(curveName);
                        item.remove();
                        
                        // Auto-exit edit mode after deletion
                        isEditMode = false;
                        editButton.textContent = 'Edit';
                        
                        // Remove edit mode from remaining items
                        const remainingItems = document.querySelectorAll('.curve-item[data-curve="saved"]');
                        remainingItems.forEach(remainingItem => {
                            remainingItem.classList.remove('edit-mode');
                            const remainingDeleteX = remainingItem.querySelector('.delete-x');
                            if (remainingDeleteX) {
                                remainingDeleteX.remove();
                            }
                        });
                    }
                });
                item.appendChild(deleteX);
            });
        } else {
            editButton.textContent = 'Edit';
            curveItems.forEach(item => {
                item.classList.remove('edit-mode');
                const deleteX = item.querySelector('.delete-x');
                if (deleteX) {
                    deleteX.remove();
                }
            });
        }
    }

    function deleteUserCurve(curveName) {
        const saved = localStorage.getItem('simpleFlowCurves');
        if (saved) {
            const userCurves = JSON.parse(saved);
            delete userCurves[curveName];
            localStorage.setItem('simpleFlowCurves', JSON.stringify(userCurves));
        }
    }

    // Apply curve to keyframes
    applyButton.addEventListener('click', () => {
        
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
            } else if (result === 'Success') {
            } else if (result === null || result === undefined) {
            } else {
            }
        });
    });

    


});
