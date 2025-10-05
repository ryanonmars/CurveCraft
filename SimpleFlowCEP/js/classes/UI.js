class UI {
    constructor(curveLibrary, curveEditor) {
        this.curveLibrary = curveLibrary;
        this.curveEditor = curveEditor;
        this.editButton = document.getElementById('editButton');
        this.editControls = document.getElementById('editControls');
        this.savedCurvesContainer = document.getElementById('savedCurves');
        
        this.init();
    }
    
    init() {
        this.setupToggleButtons();
        this.setupEditMode();
        this.setupResizeObservers();
    }
    
    // Load default curves into UI
    loadDefaultCurves() {
        // Remove "no curves" message if it exists
        const noCurves = this.savedCurvesContainer.querySelector('.no-curves');
        if (noCurves) {
            noCurves.remove();
        }
        
        // Load default curves
        const defaultCurves = this.curveLibrary.getAllDefaultCurves();
        Object.keys(defaultCurves).forEach(name => {
            this.createCurveButton(name, defaultCurves[name]);
        });
    }
    
    // Toggle between defaults and user curves
    switchMode(mode) {
        this.curveLibrary.setMode(mode);
        
        // Reset edit mode when switching tabs
        this.curveLibrary.setEditMode(false);
        if (this.editButton) {
            this.editButton.textContent = 'Edit';
        }
        
        // Clear current curves
        this.savedCurvesContainer.innerHTML = '';
        
        if (mode === 'defaults') {
            this.loadDefaultCurves();
            this.editControls.style.display = 'none';
        } else {
            // Load user curves
            const userCurves = this.curveLibrary.getAllUserCurves();
            if (Object.keys(userCurves).length > 0) {
                Object.keys(userCurves).forEach(name => {
                    this.createCurveButton(name, userCurves[name]);
                });
                this.editControls.style.display = 'block';
            } else {
                this.savedCurvesContainer.innerHTML = '<div class="no-curves">No user curves saved yet</div>';
                this.editControls.style.display = 'none';
            }
        }
    }
    
    // Create a new curve button
    createCurveButton(name, curveValues) {
        // Remove "no curves" message if it exists
        const noCurves = this.savedCurvesContainer.querySelector('.no-curves');
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
            this.curveEditor.setCurve(curveValues);
            drawCurve(curveCanvas, 'custom');
        });
        
        // Add to container
        this.savedCurvesContainer.appendChild(button);
        
        // Show edit controls if we're in user mode and this is the first curve
        if (this.curveLibrary.getMode() === 'user' && this.curveLibrary.getUserCurveCount() === 1) {
            this.editControls.style.display = 'block';
        }
        
        // Draw the preview after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.drawSmallPreview(`${name}-preview`, 'saved', curveValues);
        }, 10);
    }
    
    // Draw small previews for curve buttons
    drawSmallPreview(canvasId, curveType, customValues = null) {
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
            const values = customValues || this.curveEditor.getCurve();
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
    
    // Toggle edit mode for user curves
    toggleEditMode() {
        const curveItems = document.querySelectorAll('.curve-item[data-curve="saved"]');
        
        if (this.curveLibrary.getEditMode()) {
            this.editButton.textContent = 'Done';
            curveItems.forEach(item => {
                item.classList.add('edit-mode');
                const deleteX = document.createElement('button');
                deleteX.className = 'delete-x';
                deleteX.innerHTML = '×';
                deleteX.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const curveName = item.dataset.curveName;
                    if (confirm(`Delete curve "${curveName}"?`)) {
                        this.curveLibrary.deleteUserCurve(curveName);
                        item.remove();
                        
                        // Auto-exit edit mode after deletion
                        this.curveLibrary.setEditMode(false);
                        this.editButton.textContent = 'Edit';
                        
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
            this.editButton.textContent = 'Edit';
            curveItems.forEach(item => {
                item.classList.remove('edit-mode');
                const deleteX = item.querySelector('.delete-x');
                if (deleteX) {
                    deleteX.remove();
                }
            });
        }
    }
    
    // Setup toggle buttons
    setupToggleButtons() {
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Switch mode
                const mode = button.dataset.mode;
                this.switchMode(mode);
            });
        });
    }
    
    // Setup edit mode
    setupEditMode() {
        if (this.editButton) {
            this.editButton.addEventListener('click', () => {
                const newEditMode = !this.curveLibrary.getEditMode();
                this.curveLibrary.setEditMode(newEditMode);
                this.toggleEditMode();
            });
        }
    }
    
    // Setup resize observers for small previews
    setupResizeObservers() {
        // Add resize observer to redraw small previews when window resizes
        const resizeObserver = new ResizeObserver(() => {
            // Redraw all small previews
            const smallCanvases = document.querySelectorAll('.curve-preview-small');
            smallCanvases.forEach(canvas => {
                const curveItem = canvas.closest('.curve-item');
                if (curveItem) {
                    const curveName = curveItem.dataset.curveName;
                    if (curveName && this.curveLibrary.getDefaultCurve(curveName)) {
                        this.drawSmallPreview(canvas.id, 'saved', this.curveLibrary.getDefaultCurve(curveName));
                    } else if (curveItem.dataset.curve === 'custom') {
                        this.drawSmallPreview(canvas.id, 'custom');
                    }
                }
            });
        });

        // Observe the curve buttons container for size changes
        if (this.savedCurvesContainer) {
            resizeObserver.observe(this.savedCurvesContainer);
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
                        if (curveName && this.curveLibrary.getDefaultCurve(curveName)) {
                            this.drawSmallPreview(canvas.id, 'saved', this.curveLibrary.getDefaultCurve(curveName));
                        } else if (curveItem.dataset.curve === 'custom') {
                            this.drawSmallPreview(canvas.id, 'custom');
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
                        if (curveName && this.curveLibrary.getDefaultCurve(curveName)) {
                            this.drawSmallPreview(canvas.id, 'saved', this.curveLibrary.getDefaultCurve(curveName));
                        } else if (curveItem.dataset.curve === 'custom') {
                            this.drawSmallPreview(canvas.id, 'custom');
                        }
                    }
                });
            }, 50);
        });

        // Observe the curve buttons container for DOM changes
        if (this.savedCurvesContainer) {
            mutationObserver.observe(this.savedCurvesContainer, { childList: true, subtree: true });
        }
    }
    
    // Show import modal
    showImportModal() {
        return new Promise((resolve, reject) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            // Create modal content
            const modal = document.createElement('div');
            modal.className = 'modal-content';
            modal.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">Import Curve</h3>
                </div>
                <div class="modal-body">
                    <input type="text" class="modal-input" id="importInput" placeholder="Paste curve values: [0.250, 0.100, 0.250, 1.000]">
                    <div class="modal-example">Example: [0.25, 0.1, 0.25, 1]</div>
                </div>
                <div class="modal-footer">
                    <button class="modal-button modal-button-secondary" id="cancelImport">Cancel</button>
                    <button class="modal-button modal-button-primary" id="confirmImport">Import</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Focus input
            const input = modal.querySelector('#importInput');
            input.focus();
            
            // Event handlers
            const cleanup = () => {
                document.body.removeChild(overlay);
            };
            
            const cancelBtn = modal.querySelector('#cancelImport');
            const confirmBtn = modal.querySelector('#confirmImport');
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                reject(new Error('Import cancelled'));
            });
            
            confirmBtn.addEventListener('click', () => {
                const value = input.value.trim();
                if (value) {
                    cleanup();
                    resolve(value);
                } else {
                    alert('Please enter curve values');
                }
            });
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    reject(new Error('Import cancelled'));
                }
            });
            
            // Keyboard handlers
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
        });
    }
    
    // Show name input modal
    showNameInputModal(title, placeholder = '') {
        return new Promise((resolve, reject) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            // Create modal content
            const modal = document.createElement('div');
            modal.className = 'modal-content';
            modal.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <input type="text" class="modal-input" id="nameInput" placeholder="${placeholder}" maxlength="20">
                </div>
                <div class="modal-footer">
                    <button class="modal-button modal-button-secondary" id="cancelName">Cancel</button>
                    <button class="modal-button modal-button-primary" id="confirmName">Save</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Focus input
            const input = modal.querySelector('#nameInput');
            input.focus();
            
            // Event handlers
            const cleanup = () => {
                document.body.removeChild(overlay);
            };
            
            const cancelBtn = modal.querySelector('#cancelName');
            const confirmBtn = modal.querySelector('#confirmName');
            
            cancelBtn.addEventListener('click', () => {
                cleanup();
                reject(new Error('Name input cancelled'));
            });
            
            confirmBtn.addEventListener('click', () => {
                const value = input.value.trim();
                if (value) {
                    cleanup();
                    resolve(value);
                } else {
                    alert('Please enter a name');
                }
            });
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                    reject(new Error('Name input cancelled'));
                }
            });
            
            // Keyboard handlers
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
        });
    }
    
    // Show notification modal
    showNotificationModal(title, message, type = 'info') {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            // Create modal content
            const modal = document.createElement('div');
            modal.className = 'modal-content';
            
            // Set button color based on type
            const buttonClass = type === 'error' ? 'modal-button-error' : 'modal-button-primary';
            
            modal.innerHTML = `
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                </div>
                <div class="modal-body">
                    <p style="margin: 0; color: #ffffff;">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-button ${buttonClass}" id="confirmNotification">OK</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Event handlers
            const cleanup = () => {
                document.body.removeChild(overlay);
                resolve();
            };
            
            const confirmBtn = modal.querySelector('#confirmNotification');
            confirmBtn.addEventListener('click', cleanup);
            
            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup();
                }
            });
            
            // Keyboard handlers
            overlay.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                    cleanup();
                }
            });
            
            // Focus the button
            confirmBtn.focus();
        });
    }
}
