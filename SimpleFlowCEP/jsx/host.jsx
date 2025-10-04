function applyCurve(curveType, easeData) {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return 'Error: No composition selected';

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) return 'Error: No layers selected';

        app.beginUndoGroup("Apply Curve");
        var appliedCount = 0;
        var debugInfo = 'Curve: ' + curveType + ', Layers: ' + selectedLayers.length + ', ';
        
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            
            // Check selected properties first
            var targets = [];
            if (layer.selectedProperties && layer.selectedProperties.length > 0) {
                debugInfo += 'SelProps: ' + layer.selectedProperties.length + ', ';
                for (var si = 0; si < layer.selectedProperties.length; si++) {
                    var p = layer.selectedProperties[si];
                    if (p.propertyType === PropertyType.PROPERTY && p.numKeys && p.numKeys >= 2) {
                        targets.push(p);
                        debugInfo += 'Added ' + p.name + ', ';
                    }
                }
            }
            
            // If no selected properties, try common properties
            if (targets.length === 0) {
                debugInfo += 'NoSelProps, Trying common... ';
                var common = ["Position", "Scale", "Rotation", "Opacity", "Anchor Point"];
                for (var ci = 0; ci < common.length; ci++) {
                    try {
                        var cp = layer.property("ADBE Transform Group").property("ADBE " + common[ci]);
                        if (cp && cp.propertyType === PropertyType.PROPERTY && cp.numKeys && cp.numKeys >= 2) {
                            targets.push(cp);
                            debugInfo += 'Added ' + common[ci] + ' (' + cp.numKeys + ' keys), ';
                        }
                    } catch (err) {
                        debugInfo += common[ci] + ' failed, ';
                    }
                }
            }
            
            debugInfo += 'Targets: ' + targets.length + ', ';
            
            for (var ti = 0; ti < targets.length; ti++) {
                var prop = targets[ti];
                var result = applyCurveToKeyframes(prop, curveType, easeData);
                if (result) {
                    debugInfo += result + ', ';
                }
                appliedCount++;
            }
        }
        
        app.endUndoGroup();
        return 'Success: Applied to ' + appliedCount + ' properties. ' + debugInfo;
    } catch (e) {
        return 'Error: ' + e.toString() + ' at line ' + e.line;
    }
}

function applyCurveToKeyframes(prop, curveType, easeData) {
    if (!prop || prop.numKeys < 2) {
        return 'Skipped property with fewer than 2 keyframes: ' + prop.name;
    }

    // Remove any existing expressions
    if (prop.expression) {
        prop.expression = "";
    }

    // Set all keyframes to Bezier interpolation first
    for (var k = 1; k <= prop.numKeys; k++) {
        try {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
        } catch (e) {
            // Some properties like Marker don't have temporal interpolation
        }
    }

    // Determine the number of dimensions for the property
    var actualDims = 1;
    try {
        actualDims = prop.keyInTemporalEase(1).length;
    } catch(e) {
        // If it fails, assume it's a single dimension property
        actualDims = 1;
    }

    // Use the calculated ease values from the frontend (like Flow does)
    var outInfluence = easeData.outInfluence;
    var inInfluence = easeData.inInfluence;
    var outSpeed = easeData.outSpeed;
    var inSpeed = easeData.inSpeed;

    // Create ease objects for each dimension
    var inEaseArray = [];
    var outEaseArray = [];

    // All dimensions share the same temporal curve.
    for (var d = 0; d < actualDims; d++) {
        inEaseArray.push(new KeyframeEase(inSpeed, inInfluence));
        outEaseArray.push(new KeyframeEase(outSpeed, outInfluence));
    }

    // Apply curve to all keyframes
    for (var k = 1; k <= prop.numKeys; k++) {
        try {
            // Apply temporal ease to both incoming and outgoing tangents
            prop.setTemporalEaseAtKey(k, inEaseArray, outEaseArray);

            // Special handling for the last keyframe
            if (k === prop.numKeys && k > 1) {
                // Adjust incoming ease for the final keyframe
                prop.setTemporalEaseAtKey(k, inEaseArray, prop.keyOutTemporalEase(k));
            }
            
            // Special handling for the first keyframe
            if (k === 1 && prop.numKeys > 1) {
                // Adjust outgoing ease for the first keyframe
                prop.setTemporalEaseAtKey(k, prop.keyInTemporalEase(k), outEaseArray);
            }
        } catch (e) {
            // Handle exceptions for properties that don't support temporal ease
            return 'Error applying temporal ease at key ' + k + ': ' + e.toString();
        }
    }
    
    // For spatial properties, ensure auto-bezier is set to let After Effects handle the path
    if (prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL || 
        prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
        for (var k = 1; k <= prop.numKeys; k++) {
            try {
                prop.setSpatialContinuousAtKey(k, true);
                prop.setSpatialAutoBezierAtKey(k, true);
            } catch (e) {
                // Ignore if spatial properties are not supported or behave differently
            }
        }
    }

    return 'Applied curve: ' + curveType + ' (out: ' + outSpeed + ',' + outInfluence + ' in: ' + inSpeed + ',' + inInfluence + ')';
}



