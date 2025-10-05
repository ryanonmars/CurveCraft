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
            outSpeed: Math.max(0.1, Math.min(100, (1 - cubicBezier[1]) * 100)),
            inSpeed: Math.max(0.1, Math.min(100, cubicBezier[3] * 100))
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
    
    // Detect curve from selected keyframes
    detectCurveFromKeyframes() {
        return new Promise((resolve, reject) => {
            const script = `
                var _r = "";
                try {
                    var c = app.project.activeItem;
                    if (!(c instanceof CompItem)) {
                        _r = '{"success":false,"message":"No comp"}';
                    } else if (c.selectedLayers.length === 0) {
                        _r = '{"success":false,"message":"No layer selected"}';
                    } else {
                        var l = c.selectedLayers[0];
                        var p = l.property("ADBE Transform Group").property("ADBE Position");
                        if (!p || p.numKeys < 2) {
                            _r = '{"success":false,"message":"No Position keyframes"}';
                        } else {
                            var o1 = p.keyOutTemporalEase(1);
                            var i2 = p.keyInTemporalEase(2);
                            if (o1.length === 0 || i2.length === 0) {
                                _r = '{"success":false,"message":"No easing"}';
                            } else {
                                var cv0 = o1[0].influence / 100;
                                var cv1 = 1 - (o1[0].speed / 100);
                                var cv2 = 1 - (i2[0].influence / 100);
                                var cv3 = i2[0].speed / 100;
                                _r = '{"success":true,"curveValues":[' + 
                                    cv0 + ',' + cv1 + ',' + cv2 + ',' + cv3 + 
                                    '],"message":"Detected"}';
                            }
                        }
                    }
                } catch (e) {
                    _r = '{"success":false,"message":"Error: ' + e.toString() + '"}';
                }
                _r;
            `;
            
            this.csInterface.evalScript(script, (result) => {
                if (result === 'EvalScript error.') {
                    reject(new Error('EvalScript error'));
                } else if (!result || result.trim() === '') {
                    reject(new Error('Empty result'));
                } else {
                    try {
                        const data = JSON.parse(result.trim());
                        resolve(data);
                    } catch (e) {
                        reject(new Error('Parse error: ' + e.message + ' | Result: ' + result));
                    }
                }
            });
        });
    }
}
