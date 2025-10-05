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
    
    // Always use the current curve values (custom or loaded)
    const currentValues = window.customCurve || [0.25, 0.1, 0.25, 1];
    ctx.moveTo(graphX, graphY + graphHeight);
    ctx.bezierCurveTo(
        graphX + graphWidth * currentValues[0], graphY + graphHeight * (1 - currentValues[1]),
        graphX + graphWidth * currentValues[2], graphY + graphHeight * (1 - currentValues[3]),
        graphX + graphWidth, graphY
    );
    
    ctx.stroke();
    
    // Always draw control points
    {
        // Start and end points
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(graphX, graphY + graphHeight, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.arc(graphX + graphWidth, graphY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Always draw interactive handles
        const customValues = window.customCurve || [0.25, 0.1, 0.25, 1];
        
        // Handle positions with padding - clamp to graph bounds only
        const p1x = Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * customValues[0]));
        const p1y = Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - customValues[1])));
        const p2x = Math.max(graphX, Math.min(graphX + graphWidth, graphX + graphWidth * customValues[2]));
        const p2y = Math.max(graphY, Math.min(graphY + graphHeight, graphY + graphHeight * (1 - customValues[3])));
        
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
    }
}