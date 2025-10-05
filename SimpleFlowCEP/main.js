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
    
    // Initialize curve editor, library, After Effects communication, and UI
    const curveEditor = new CurveEditor(curveCanvas, valuesDisplay);
    const curveLibrary = new CurveLibrary();
    const afterEffects = new AfterEffects();
    const ui = new UI(curveLibrary, curveEditor);






    // Initial curve draw
    if (curveCanvas) {
        // Load default curves using UI class
        ui.loadDefaultCurves();
        
        // Draw the curve after everything is set up
        drawCurve(curveCanvas, selectedCurve);
        ui.drawSmallPreview('custom-preview', 'custom');
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


    
    // Save/Load functionality
    const curveNameInput = document.getElementById('curveName');
    const saveCurveButton = document.getElementById('saveCurve');

    // Star button (save preset) functionality
    const starButton = document.getElementById('starButton');

    if (saveCurveButton) {
        saveCurveButton.addEventListener('click', async () => {
            const name = curveNameInput.value.trim();
            if (name) {
                try {
                    // Add user curve using library
                    curveLibrary.addUserCurve(name, curveEditor.getCurve());
                    ui.createCurveButton(name, curveEditor.getCurve());
                    curveNameInput.value = '';
                    await ui.showNotificationModal('Success', `Curve "${name}" saved successfully!`);
                } catch (error) {
                    await ui.showNotificationModal('Error', error.message, 'error');
                }
            } else {
                await ui.showNotificationModal('Error', 'Please enter a curve name', 'error');
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
        starButton.addEventListener('click', async () => {
            try {
                const curveName = await ui.showNameInputModal('Save Curve', 'Enter a name for this curve');
                if (curveName && curveName.trim()) {
                    // Add user curve using library
                    curveLibrary.addUserCurve(curveName.trim(), curveEditor.getCurve());
                    
                    // Create the button if we're in user curves mode
                    if (curveLibrary.getMode() === 'user') {
                        ui.createCurveButton(curveName.trim(), curveEditor.getCurve());
                    }
                    
                    await ui.showNotificationModal('Success', `Curve "${curveName.trim()}" saved successfully!`);
                }
            } catch (error) {
                if (error.message !== 'Name input cancelled') {
                    await ui.showNotificationModal('Error', error.message, 'error');
                }
            }
        });
    }

    // Import button functionality
    const importButton = document.getElementById('importButton');
    if (importButton) {
        importButton.addEventListener('click', async () => {
            try {
                // Show modal and get curve string
                const curveString = await ui.showImportModal();
                
                // Parse and validate curve values
                const values = JSON.parse(curveString);
                
                if (Array.isArray(values) && values.length === 4) {
                    const validValues = values.every(v => typeof v === 'number' && v >= 0 && v <= 1);
                    
                    if (validValues) {
                        curveEditor.setCurve(values);
                        drawCurve(curveCanvas, 'custom');
                        selectedCurve = 'custom';
                        
                        // Prompt to save the imported curve
                        try {
                            const curveName = await ui.showNameInputModal('Save Imported Curve', 'Enter a name for this curve');
                            if (curveName && curveName.trim()) {
                                // Add user curve using library
                                curveLibrary.addUserCurve(curveName.trim(), curveEditor.getCurve());
                                
                                // Create the button if we're in user curves mode
                                if (curveLibrary.getMode() === 'user') {
                                    ui.createCurveButton(curveName.trim(), curveEditor.getCurve());
                                }
                                
                                await ui.showNotificationModal('Success', `Curve "${curveName.trim()}" saved successfully!`);
                            }
                        } catch (error) {
                            // User cancelled - this is fine, just skip saving
                        }
                    } else {
                        await ui.showNotificationModal('Error', 'Invalid curve values. All values must be numbers between 0 and 1.', 'error');
                    }
                } else {
                    await ui.showNotificationModal('Error', 'Invalid format. Please use format: [0.250, 0.100, 0.250, 1.000]', 'error');
                }
            } catch (error) {
                if (error.message !== 'Import cancelled') {
                    await ui.showNotificationModal('Error', 'Invalid format. Please use format: [0.250, 0.100, 0.250, 1.000]', 'error');
                }
            }
        });
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
