document.addEventListener('DOMContentLoaded', function() {
    // Check if CSInterface is available
    if (typeof CSInterface === 'undefined') {
        document.getElementById('status').textContent = 'Error: CSInterface not loaded. Extension may not work properly.';
        return;
    }
    const curveCanvas = document.getElementById('curveCanvas');
    const applyButton = document.getElementById('applyButton');
    const curveButtons = document.querySelectorAll('.curve-item');
    
    // Curve control elements
    const valuesDisplay = document.getElementById('valuesDisplay');
    
    // Current custom curve values
    let selectedCurve = 'custom';
    
    // Initialize curve editor, library, and After Effects communication
    const curveEditor = new CurveEditor(curveCanvas, valuesDisplay);
    const curveLibrary = new CurveLibrary();
    const afterEffects = new AfterEffects();



    // Load default curves
    function loadDefaultCurves() {
        const savedCurvesContainer = document.getElementById('savedCurves');
        
        // Remove "no curves" message if it exists
        const noCurves = savedCurvesContainer.querySelector('.no-curves');
        if (noCurves) {
            noCurves.remove();
        }
        
        // Load default curves
        const defaultCurves = curveLibrary.getAllDefaultCurves();
        Object.keys(defaultCurves).forEach(name => {
            createCurveButton(name, defaultCurves[name]);
        });
    }

    // Toggle between defaults and user curves
    function switchMode(mode) {
        curveLibrary.setMode(mode);
        const savedCurvesContainer = document.getElementById('savedCurves');
        
        // Reset edit mode when switching tabs
        curveLibrary.setEditMode(false);
        if (editButton) {
            editButton.textContent = 'Edit';
        }
        
        // Clear current curves
        savedCurvesContainer.innerHTML = '';
        
        if (mode === 'defaults') {
            loadDefaultCurves();
            editControls.style.display = 'none';
        } else {
            // Load user curves
            const userCurves = curveLibrary.getAllUserCurves();
            if (Object.keys(userCurves).length > 0) {
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
            
            // Always update curveEditor with the selected curve values
            if (selectedCurve === 'custom') {
                // Keep current custom curve
            } else {
                // Load curve values into curveEditor for editing
                const curveValues = curveLibrary.getCurve(selectedCurve, curveLibrary.getMode() === 'user') || [0.25, 0.1, 0.25, 1];
                curveEditor.setCurve(curveValues);
            }
            
            drawCurve(curveCanvas, selectedCurve);
        });
    });


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
            curveEditor.setCurve(curveValues);
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

    if (saveCurveButton) {
        saveCurveButton.addEventListener('click', () => {
            const name = curveNameInput.value.trim();
            if (name) {
                try {
                    // Add user curve using library
                    curveLibrary.addUserCurve(name, curveEditor.getCurve());
                    createCurveButton(name, curveEditor.getCurve());
                    curveNameInput.value = '';
                } catch (error) {
                    alert(error.message);
                }
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
                try {
                    // Add user curve using library
                    curveLibrary.addUserCurve(curveName.trim(), curveEditor.getCurve());
                    
                    // Create the button if we're in user curves mode
                    if (curveLibrary.getMode() === 'user') {
                        createCurveButton(curveName.trim(), curveEditor.getCurve());
                    }
                    
                    alert(`Curve "${curveName.trim()}" saved successfully!`);
                } catch (error) {
                    alert(error.message);
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
                                curveEditor.setCurve(values);
                                drawCurve(curveCanvas, 'custom');
                                selectedCurve = 'custom';
                                cleanup();
                                
                                // Prompt to save the imported curve
                                const curveName = prompt('Enter a name for this curve (or leave blank to skip saving):');
                                if (curveName && curveName.trim()) {
                                    try {
                                        // Add user curve using library
                                        curveLibrary.addUserCurve(curveName.trim(), curveEditor.getCurve());
                                        
                                        // Create the button if we're in user curves mode
                                        if (curveLibrary.getMode() === 'user') {
                                            createCurveButton(curveName.trim(), curveEditor.getCurve());
                                        }
                                        
                                        alert(`Curve "${curveName.trim()}" saved successfully!`);
                                    } catch (error) {
                                        alert(error.message);
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
            const newEditMode = !curveLibrary.getEditMode();
            curveLibrary.setEditMode(newEditMode);
            toggleEditMode();
        });
    }

    function toggleEditMode() {
        const curveItems = document.querySelectorAll('.curve-item[data-curve="saved"]');
        
        if (curveLibrary.getEditMode()) {
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
                        curveLibrary.setEditMode(false);
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
        curveLibrary.deleteUserCurve(curveName);
    }

    // Apply curve to keyframes
    applyButton.addEventListener('click', async () => {
        try {
            // Get cubic-bezier values for the selected curve
            let cubicBezier;
            if (selectedCurve === 'custom') {
                cubicBezier = curveEditor.getCurve();
            } else {
                // Get from library
                cubicBezier = curveLibrary.getCurve(selectedCurve, curveLibrary.getMode() === 'user') || [0.25, 0.1, 0.25, 1];
            }
            
            // Apply curve using AfterEffects class
            const result = await afterEffects.applyCurveToKeyframes(selectedCurve, cubicBezier);
            console.log('Curve applied:', result);
        } catch (error) {
            console.error('Failed to apply curve:', error.message);
            alert('Failed to apply curve: ' + error.message);
        }
    });

    


});
