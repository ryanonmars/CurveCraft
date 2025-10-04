function drawCurve(canvas, curveType) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw curve
    ctx.strokeStyle = '#0078d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    if (curveType === 'linear') {
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width, 0);
    } else if (curveType === 'easeIn') {
        ctx.moveTo(0, canvas.height);
        ctx.bezierCurveTo(0, canvas.height, 0, canvas.height * 0.3, canvas.width, 0);
    } else if (curveType === 'easeOut') {
        ctx.moveTo(0, canvas.height);
        ctx.bezierCurveTo(canvas.width, canvas.height, canvas.width, canvas.height * 0.7, canvas.width, 0);
    } else if (curveType === 'easeInOut') {
        ctx.moveTo(0, canvas.height);
        ctx.bezierCurveTo(0, canvas.height, canvas.width * 0.5, canvas.height * 0.5, canvas.width, 0);
    } else if (curveType === 'bounce') {
        ctx.moveTo(0, canvas.height);
        ctx.bezierCurveTo(canvas.width * 0.2, canvas.height * 0.8, canvas.width * 0.4, canvas.height * 0.2, canvas.width * 0.6, canvas.height * 0.4);
        ctx.bezierCurveTo(canvas.width * 0.8, canvas.height * 0.6, canvas.width, canvas.height * 0.1, canvas.width, 0);
    } else if (curveType === 'elastic') {
        ctx.moveTo(0, canvas.height);
        ctx.bezierCurveTo(canvas.width * 0.1, canvas.height * 1.2, canvas.width * 0.3, canvas.height * 0.8, canvas.width * 0.5, canvas.height * 0.6);
        ctx.bezierCurveTo(canvas.width * 0.7, canvas.height * 0.4, canvas.width * 0.9, canvas.height * 0.2, canvas.width, 0);
    } else if (curveType === 'smooth') {
        // Use the exact same cubic-bezier values as the calculation
        // [0.25, 0.1, 0.25, 1] - this creates the actual curve that gets applied
        ctx.moveTo(0, canvas.height);
        ctx.bezierCurveTo(
            canvas.width * 0.25, canvas.height * (1 - 0.1),  // p1x, p1y (inverted Y)
            canvas.width * 0.25, canvas.height * (1 - 1),    // p2x, p2y (inverted Y)
            canvas.width, 0
        );
    }
    
    ctx.stroke();
    
    // Draw control points
    if (curveType !== 'linear') {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(canvas.width, 0, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
}
