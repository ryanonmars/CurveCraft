class CurveEditor {
    constructor(canvas, valuesDisplay) {
        this.canvas = canvas;
        this.valuesDisplay = valuesDisplay;
        this.customCurve = [0.25, 0.1, 0.25, 1];
        
        // Interactive editing state
        this.isDragging = false;
        this.dragHandle = null;
        this.canvasRect = null;
        
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
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
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
        } else if (distToP2 < 20) {
            this.isDragging = true;
            this.dragHandle = 1;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.canvasRect) return;
        
        // Account for canvas scaling
        const scaleX = this.canvas.width / this.canvasRect.width;
        const scaleY = this.canvas.height / this.canvasRect.height;
        
        const mouseX = (e.clientX - this.canvasRect.left) * scaleX;
        const mouseY = (e.clientY - this.canvasRect.top) * scaleY;
        
        this.updateHandleFromPosition(this.dragHandle, mouseX, mouseY);
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.dragHandle = null;
        this.canvasRect = null;
        this.canvas.style.cursor = 'crosshair';
    }
    
    handleMouseLeave() {
        this.isDragging = false;
        this.dragHandle = null;
        this.canvasRect = null;
        this.canvas.style.cursor = 'crosshair';
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
            // P1 handle - clamp to graph bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * this.customCurve[0])),
                y: Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - this.customCurve[1])))
            };
        } else {
            // P2 handle - clamp to graph bounds
            return {
                x: Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * this.customCurve[2])),
                y: Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - this.customCurve[3])))
            };
        }
    }
    
    updateHandleFromPosition(handleIndex, x, y) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        const graphWidth = width - (padding * 2);
        const graphHeight = height - (padding * 2);
        const graphX = padding;
        const graphY = padding;
        
        // Convert mouse position to graph coordinates and clamp to bounds
        const graphX_pos = Math.max(0, Math.min(1, (x - graphX) / graphWidth));
        const graphY_pos = Math.max(0, Math.min(1, (y - graphY) / graphHeight));
        
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
}
