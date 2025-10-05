class AfterEffects {
    constructor() {
        this.csInterface = new CSInterface();
    }
    
    // Test connection to After Effects
    testConnection() {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript('"Connection successful"', (result) => {
                if (result === 'EvalScript error.') {
                    reject(new Error('Failed to connect to After Effects'));
                } else {
                    resolve(result);
                }
            });
        });
    }
    
    // Apply curve to selected keyframes
    applyCurve(curveType, easeData) {
        return new Promise((resolve, reject) => {
            const script = `
                try {
                    var result = applyCurve("${curveType}", ${JSON.stringify(easeData)});
                    result;
                } catch (error) {
                    "Error: " + error.toString();
                }
            `;
            
            this.csInterface.evalScript(script, (result) => {
                if (result === 'EvalScript error.') {
                    reject(new Error('Failed to execute script in After Effects'));
                } else if (result && result.startsWith('Error:')) {
                    reject(new Error(result));
                } else {
                    resolve(result);
                }
            });
        });
    }
    
    // Calculate After Effects ease values from cubic-bezier
    calculateEaseData(cubicBezier) {
        return {
            outInfluence: Math.max(0.1, Math.min(100, cubicBezier[0] * 100)),
            inInfluence: Math.max(0.1, Math.min(100, (1 - cubicBezier[2]) * 100)),
            outSpeed: Math.max(0, Math.min(100, Math.abs(cubicBezier[1]) * 100)),
            inSpeed: Math.max(0, Math.min(100, Math.abs(cubicBezier[3]) * 100))
        };
    }
    
    // Apply curve with automatic ease calculation
    applyCurveToKeyframes(curveType, cubicBezier) {
        const easeData = this.calculateEaseData(cubicBezier);
        return this.applyCurve(curveType, easeData);
    }
    
    // Get current selection info (for debugging)
    getSelectionInfo() {
        return new Promise((resolve, reject) => {
            const script = `
                try {
                    var comp = app.project.activeItem;
                    if (!comp || !(comp instanceof CompItem)) {
                        "No active composition";
                    } else {
                        var layers = comp.selectedLayers;
                        if (layers.length === 0) {
                            "No layers selected";
                        } else {
                            "Selected: " + layers.length + " layer(s)";
                        }
                    }
                } catch (error) {
                    "Error: " + error.toString();
                }
            `;
            
            this.csInterface.evalScript(script, (result) => {
                if (result === 'EvalScript error.') {
                    reject(new Error('Failed to get selection info'));
                } else {
                    resolve(result);
                }
            });
        });
    }
}
