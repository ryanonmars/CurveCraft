function drawCurve(canvas, curveType) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add padding around the graph area
    const padding = 20;
    const graphWidth = canvas.width - (padding * 2);
    const graphHeight = canvas.height - (padding * 2);
    const graphX = padding;
    const graphY = padding;
    
    // Draw grid with padding
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
        const x = graphX + (graphWidth / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, graphY);
        ctx.lineTo(x, graphY + graphHeight);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
        const y = graphY + (graphHeight / 10) * i;
        ctx.beginPath();
        ctx.moveTo(graphX, y);
        ctx.lineTo(graphX + graphWidth, y);
        ctx.stroke();
    }
    
    // Draw curve with padding
    ctx.strokeStyle = '#0078d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    if (curveType === 'linear') {
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.lineTo(graphX + graphWidth, graphY);
    } else if (curveType === 'easeIn') {
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(graphX, graphY + graphHeight, graphX, graphY + graphHeight * 0.3, graphX + graphWidth, graphY);
    } else if (curveType === 'easeOut') {
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(
            graphX + graphWidth * 0.68, graphY + graphHeight * (1 - (-0.55)),  // p1x, p1y (inverted Y)
            graphX + graphWidth * 0.265, graphY + graphHeight * (1 - 1.55),    // p2x, p2y (inverted Y)
            graphX + graphWidth, graphY
        );
    } else if (curveType === 'easeInOut') {
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(graphX, graphY + graphHeight, graphX + graphWidth * 0.5, graphY + graphHeight * 0.5, graphX + graphWidth, graphY);
    } else if (curveType === 'bounce') {
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(graphX + graphWidth * 0.2, graphY + graphHeight * 0.8, graphX + graphWidth * 0.4, graphY + graphHeight * 0.2, graphX + graphWidth * 0.6, graphY + graphHeight * 0.4);
        ctx.bezierCurveTo(graphX + graphWidth * 0.8, graphY + graphHeight * 0.6, graphX + graphWidth, graphY + graphHeight * 0.1, graphX + graphWidth, graphY);
    } else if (curveType === 'elastic') {
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(graphX + graphWidth * 0.1, graphY + graphHeight * 1.2, graphX + graphWidth * 0.3, graphY + graphHeight * 0.8, graphX + graphWidth * 0.5, graphY + graphHeight * 0.6);
        ctx.bezierCurveTo(graphX + graphWidth * 0.7, graphY + graphHeight * 0.4, graphX + graphWidth * 0.9, graphY + graphHeight * 0.2, graphX + graphWidth, graphY);
    } else if (curveType === 'smooth') {
        // Use the exact same cubic-bezier values as the calculation
        // [0.25, 0.1, 0.25, 1] - this creates the actual curve that gets applied
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(
            graphX + graphWidth * 0.25, graphY + graphHeight * (1 - 0.1),  // p1x, p1y (inverted Y)
            graphX + graphWidth * 0.25, graphY + graphHeight * (1 - 1),    // p2x, p2y (inverted Y)
            graphX + graphWidth, graphY
        );
    } else if (curveType === 'custom') {
        // Use custom curve values from the sliders
        const customValues = window.customCurve || [0.25, 0.1, 0.25, 1];
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.bezierCurveTo(
            graphX + graphWidth * customValues[0], graphY + graphHeight * (1 - customValues[1]),
            graphX + graphWidth * customValues[2], graphY + graphHeight * (1 - customValues[3]),
            graphX + graphWidth, graphY
        );
    }
    
    ctx.stroke();
    
    // Draw control points
    if (curveType !== 'linear') {
        // Start and end points
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(graphX, graphY + graphHeight, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(graphX + graphWidth, graphY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw interactive handles for custom curve
        if (curveType === 'custom') {
            console.log('Drawing custom curve handles, window.customCurve:', window.customCurve);
            
            if (window.customCurve) {
                const customValues = window.customCurve;
                console.log('Custom values:', customValues);
                
                // Handle positions with padding - clamp to graph bounds only
                const p1x = Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * customValues[0]));
                const p1y = Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - customValues[1])));
                const p2x = Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * customValues[2]));
                const p2y = Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - customValues[3])));
                
                console.log('Handle positions - P1:', p1x, p1y, 'P2:', p2x, p2y);
                
                // Draw handle lines - thick solid bars like Flow
                ctx.strokeStyle = '#ffa500';
                ctx.lineWidth = 4;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.moveTo(graphX, graphY + graphHeight);
                ctx.lineTo(p1x, p1y);
                ctx.moveTo(graphX + graphWidth, graphY);
                ctx.lineTo(p2x, p2y);
                ctx.stroke();
                
                // P1 handle - same size as bar thickness
                ctx.fillStyle = '#ff6b00';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p1x, p1y, 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                
                // P2 handle - same size as bar thickness
                ctx.fillStyle = '#ff6b00';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p2x, p2y, 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
                console.log('No custom curve values available');
            }
        }
    }
}