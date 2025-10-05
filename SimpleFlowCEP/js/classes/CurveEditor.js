class CurveEditor {
    constructor(canvas, valuesDisplay) {
        this.canvas = canvas;
        this.valuesDisplay = valuesDisplay;
        this.customCurve = [0.25, 0.1, 0.25, 1];
        
        // Interactive editing state
        this.isDragging = false;
        this.dragHandle = null;
        this.canvasRect = null;
        
        
        // Shift snapping state
        this.snapToAxis = null; // 'x', 'y', or null
        this.snapToBoundary = null; // 0 or 1 (which boundary we're locked to)
        this.snapThreshold = 0.05; // 5% of graph size
        
        // Command key state
        this.commandStartPosition = null;
        this.commandStartLength = null;
        
        // Alt key state
        this.altStartPosition = null;
        this.altStartAngle = null;
        
        this.init();
    }
    
    init() {
        if (this.canvas) {
            this.canvas.style.cursor = 'crosshair';
            this.setupEventListeners();
            this.updateDisplay();
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        
        // Add keyboard event listeners for modifier keys
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Add global mouse event listeners for dragging outside canvas
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleGlobalMouseUp(e));
    }
    
    handleMouseDown(e) {
        this.canvasRect = this.canvas.getBoundingClientRect();
        
        // Account for canvas scaling (display size vs actual size)
        const scaleX = this.canvas.width / this.canvasRect.width;
        const scaleY = this.canvas.height / this.canvasRect.height;
        
        const mouseX = (e.clientX - this.canvasRect.left) * scaleX;
        const mouseY = (e.clientY - this.canvasRect.top) * scaleY;
        
        // Check which handle is being dragged
        const p1 = this.getHandlePosition(0);
        const p2 = this.getHandlePosition(1);
        
        const distToP1 = this.getDistance(mouseX, mouseY, p1.x, p1.y);
        const distToP2 = this.getDistance(mouseX, mouseY, p2.x, p2.y);
        
        if (distToP1 < 20) {
            this.isDragging = true;
            this.dragHandle = 0;
            this.canvas.style.cursor = 'grabbing';
            this.storeOriginalHandleState(0);
        } else if (distToP2 < 20) {
            this.isDragging = true;
            this.dragHandle = 1;
            this.canvas.style.cursor = 'grabbing';
            this.storeOriginalHandleState(1);
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.canvasRect) return;
        
        // Account for canvas scaling
        const scaleX = this.canvas.width / this.canvasRect.width;
        const scaleY = this.canvas.height / this.canvasRect.height;
        
        const mouseX = (e.clientX - this.canvasRect.left) * scaleX;
        const mouseY = (e.clientY - this.canvasRect.top) * scaleY;
        
        this.updateHandleFromPosition(this.dragHandle, mouseX, mouseY, e);
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.dragHandle = null;
        this.canvasRect = null;
        this.canvas.style.cursor = 'crosshair';
    }
    
    
    handleGlobalMouseMove(e) {
        if (!this.isDragging || !this.canvasRect) return;
        
        // Account for canvas scaling
        const scaleX = this.canvas.width / this.canvasRect.width;
        const scaleY = this.canvas.height / this.canvasRect.height;
        
        const mouseX = (e.clientX - this.canvasRect.left) * scaleX;
        const mouseY = (e.clientY - this.canvasRect.top) * scaleY;
        
        this.updateHandleFromPosition(this.dragHandle, mouseX, mouseY, e);
    }
    
    handleGlobalMouseUp(e) {
        if (this.isDragging) {
            this.handleMouseUp();
        }
    }
    
    getHandlePosition(handleIndex) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        if (handleIndex === 0) {
            // P1 handle - only clamp X, allow Y outside bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * this.customCurve[0])),
                y: graphY + graphHeight * (1 - this.customCurve[1])
            };
        } else {
            // P2 handle - only clamp X, allow Y outside bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * this.customCurve[2])),
                y: graphY + graphHeight * (1 - this.customCurve[3])
            };
        }
    }
    
    updateHandleFromPosition(handleIndex, x, y, event = null) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Convert mouse position to graph coordinates (allow values outside 0-1)
        let graphX_pos = (x - graphX) / graphWidth;
        let graphY_pos = (y - graphY) / graphHeight;
        
        // Apply modifier key constraints
        if (event) {
            const modifiers = this.getModifierKeys(event);
            
            // Check for combined modifiers first
            if (modifiers.control && modifiers.shift) {
                // Move both handles symmetrically
                this.updateSymmetricHandles(handleIndex, graphX_pos, graphY_pos);
                return;
            }
            
            if (modifiers.shift) {
                // Apply magnetic snapping to axes
                const snapped = this.applyShiftSnapping(graphX_pos, graphY_pos);
                graphX_pos = snapped.x;
                graphY_pos = snapped.y;
            }
            
            if (modifiers.control) {
                // Lock length, allow angle change
                this.updateHandleWithLockedLength(handleIndex, graphX_pos, graphY_pos);
                return;
            }
            
            if (modifiers.alt) {
                // Lock angle, allow length change
                this.updateHandleWithLockedAngle(handleIndex, graphX_pos, graphY_pos);
                return;
            }
        }
        
        if (handleIndex === 0) {
            this.customCurve[0] = graphX_pos;
            this.customCurve[1] = 1 - graphY_pos;
        } else {
            this.customCurve[2] = graphX_pos;
            this.customCurve[3] = 1 - graphY_pos;
        }
        
        this.updateDisplay();
        this.drawCurve();
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    setCurve(curveValues) {
        this.customCurve = [...curveValues];
        this.updateDisplay();
        this.drawCurve();
    }
    
    getCurve() {
        return [...this.customCurve];
    }
    
    updateDisplay() {
        if (this.valuesDisplay) {
            this.valuesDisplay.textContent = `[${this.customCurve.map(v => v.toFixed(2)).join(', ')}]`;
        }
        // Set global variable for curves.js compatibility
        window.customCurve = this.customCurve;
    }
    
    drawCurve() {
        if (typeof drawCurve === 'function') {
            drawCurve(this.canvas, 'custom');
        }
    }
    
    // Helper methods for handle manipulation
    getModifierKeys(event) {
        return {
            shift: event.shiftKey,
            control: event.ctrlKey || event.metaKey, // Support both Ctrl and Cmd (Mac)
            alt: event.altKey
        };
    }
    
    storeOriginalHandleState(handleIndex) {
        // Reset snap state for new drag
        this.snapToAxis = null;
        this.snapToBoundary = null;
        this.commandStartPosition = null;
        this.commandStartLength = null;
        this.altStartPosition = null;
        this.altStartAngle = null;
    }
    
    updateSymmetricHandles(handleIndex, graphX_pos, graphY_pos) {
        if (handleIndex === 0) {
            // Update P1 and mirror to P2
            this.customCurve[0] = graphX_pos;
            this.customCurve[1] = 1 - graphY_pos;
            this.customCurve[2] = 1 - graphX_pos;
            this.customCurve[3] = graphY_pos;
        } else {
            // Update P2 and mirror to P1
            this.customCurve[2] = graphX_pos;
            this.customCurve[3] = 1 - graphY_pos;
            this.customCurve[0] = 1 - graphX_pos;
            this.customCurve[1] = graphY_pos;
        }
        this.updateDisplay();
        this.drawCurve();
    }
    
    updateHandleWithLockedLength(handleIndex, graphX_pos, graphY_pos) {
        // Store current position as reference if not already set
        if (!this.commandStartPosition) {
            this.commandStartPosition = { x: graphX_pos, y: graphY_pos };
            this.commandStartLength = this.calculateCurrentHandleLength(handleIndex);
        }
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Convert to pixel coordinates
        const mouseX = graphX + graphX_pos * graphWidth;
        const mouseY = graphY + graphY_pos * graphHeight;
        
        let anchorX, anchorY;
        if (handleIndex === 0) {
            anchorX = graphX;
            anchorY = graphY + graphHeight;
        } else {
            anchorX = graphX + graphWidth;
            anchorY = graphY;
        }
        
        // Calculate new angle from mouse position
        const newAngle = Math.atan2(mouseY - anchorY, mouseX - anchorX);
        
        // Calculate new position with locked length
        const newX = anchorX + this.commandStartLength * Math.cos(newAngle);
        const newY = anchorY + this.commandStartLength * Math.sin(newAngle);
        
        // Convert to normalized coordinates
        const newGraphX = (newX - graphX) / graphWidth;
        const newGraphY = (newY - graphY) / graphHeight;
        
        // Only clamp X to 0-1, allow Y outside bounds for overshoot
        if (newGraphX >= 0 && newGraphX <= 1) {
            if (handleIndex === 0) {
                this.customCurve[0] = newGraphX;
                this.customCurve[1] = 1 - newGraphY;
            } else {
                this.customCurve[2] = newGraphX;
                this.customCurve[3] = 1 - newGraphY;
            }
            
            this.updateDisplay();
            this.drawCurve();
        }
    }
    
    updateHandleWithLockedAngle(handleIndex, graphX_pos, graphY_pos) {
        // Store current position as reference if not already set
        if (!this.altStartPosition) {
            this.altStartPosition = { x: graphX_pos, y: graphY_pos };
            this.altStartAngle = this.calculateCurrentHandleAngle(handleIndex);
        }
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Convert to pixel coordinates
        const mouseX = graphX + graphX_pos * graphWidth;
        const mouseY = graphY + graphY_pos * graphHeight;
        
        let anchorX, anchorY;
        if (handleIndex === 0) {
            anchorX = graphX;
            anchorY = graphY + graphHeight;
        } else {
            anchorX = graphX + graphWidth;
            anchorY = graphY;
        }
        
        // Calculate new length from mouse position
        const newLength = this.getDistance(anchorX, anchorY, mouseX, mouseY);
        
        // Calculate new position with locked angle
        const newX = anchorX + newLength * Math.cos(this.altStartAngle);
        const newY = anchorY + newLength * Math.sin(this.altStartAngle);
        
        // Convert to normalized coordinates
        const newGraphX = (newX - graphX) / graphWidth;
        const newGraphY = (newY - graphY) / graphHeight;
        
        // Only clamp X to 0-1, allow Y outside bounds for overshoot
        if (newGraphX >= 0 && newGraphX <= 1) {
            if (handleIndex === 0) {
                this.customCurve[0] = newGraphX;
                this.customCurve[1] = 1 - newGraphY;
            } else {
                this.customCurve[2] = newGraphX;
                this.customCurve[3] = 1 - newGraphY;
            }
            
            this.updateDisplay();
            this.drawCurve();
        }
    }
    
    handleKeyDown(event) {
        // Modifier keys are handled in real-time during mouse movement
    }
    
    handleKeyUp(event) {
        // Modifier keys are handled in real-time during mouse movement
    }
    
    applyShiftSnapping(x, y) {
        // If we're already snapped to a boundary, maintain that constraint
        if (this.snapToAxis === 'x') {
            // Lock to X axis (horizontal boundary)
            return { x: Math.max(0, Math.min(1, x)), y: this.snapToBoundary };
        } else if (this.snapToAxis === 'y') {
            // Lock to Y axis (vertical boundary)
            return { x: this.snapToBoundary, y: Math.max(0, Math.min(1, y)) };
        }
        
        // Find the nearest boundary
        const distanceToLeft = Math.abs(x - 0);
        const distanceToRight = Math.abs(x - 1);
        const distanceToTop = Math.abs(y - 0);
        const distanceToBottom = Math.abs(y - 1);
        
        const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
        
        // Snap to the nearest boundary
        if (minDistance === distanceToLeft) {
            this.snapToAxis = 'y';
            this.snapToBoundary = 0;
            return { x: 0, y: Math.max(0, Math.min(1, y)) };
        } else if (minDistance === distanceToRight) {
            this.snapToAxis = 'y';
            this.snapToBoundary = 1;
            return { x: 1, y: Math.max(0, Math.min(1, y)) };
        } else if (minDistance === distanceToTop) {
            this.snapToAxis = 'x';
            this.snapToBoundary = 0;
            return { x: Math.max(0, Math.min(1, x)), y: 0 };
        } else {
            this.snapToAxis = 'x';
            this.snapToBoundary = 1;
            return { x: Math.max(0, Math.min(1, x)), y: 1 };
        }
    }
    
    
    calculateCurrentHandleLength(handleIndex) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        let anchorX, anchorY;
        if (handleIndex === 0) {
            anchorX = graphX;
            anchorY = graphY + graphHeight;
        } else {
            anchorX = graphX + graphWidth;
            anchorY = graphY;
        }
        
        const handlePos = this.getHandlePosition(handleIndex);
        return this.getDistance(anchorX, anchorY, handlePos.x, handlePos.y);
    }
    
    calculateCurrentHandleAngle(handleIndex) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        let anchorX, anchorY;
        if (handleIndex === 0) {
            anchorX = graphX;
            anchorY = graphY + graphHeight;
        } else {
            anchorX = graphX + graphWidth;
            anchorY = graphY;
        }
        
        const handlePos = this.getHandlePosition(handleIndex);
        return Math.atan2(handlePos.y - anchorY, handlePos.x - anchorX);
    }
    
}
