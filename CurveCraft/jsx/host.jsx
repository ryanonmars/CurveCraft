function applyCurve(curveType, easeData) {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return 'Error: No composition selected';

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) return 'Error: No layers selected';

        app.beginUndoGroup("Apply Curve");
        var appliedCount = 0;
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            
            // Check selected properties first
            var targets = [];
            if (layer.selectedProperties && layer.selectedProperties.length > 0) {
                for (var si = 0; si < layer.selectedProperties.length; si++) {
                    var p = layer.selectedProperties[si];
                    if (p.propertyType === PropertyType.PROPERTY && p.numKeys && p.numKeys >= 2) {
                        targets.push(p);
                    }
                }
            }
            
            // If no selected properties, try common properties
            if (targets.length === 0) {
                var common = ["Position", "Scale", "Rotation", "Opacity", "Anchor Point"];
                for (var ci = 0; ci < common.length; ci++) {
                    try {
                        var cp = layer.property("ADBE Transform Group").property("ADBE " + common[ci]);
                        if (cp && cp.propertyType === PropertyType.PROPERTY && cp.numKeys && cp.numKeys >= 2) {
                            targets.push(cp);
                        }
                    } catch (err) {
                        // Ignore errors
                    }
                }
            }
            
            for (var ti = 0; ti < targets.length; ti++) {
                var prop = targets[ti];
                applyCurveToKeyframes(prop, curveType, easeData);
                appliedCount++;
            }
        }
        
        app.endUndoGroup();
        return 'Success: Applied to ' + appliedCount + ' properties';
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

    // Use the calculated ease values from the frontend
    var outInfluence = easeData.outInfluence;
    var inInfluence = easeData.inInfluence;
    var outSpeed = easeData.outSpeed;
    var inSpeed = easeData.inSpeed;

    // Apply curve to keyframe segments with distance-based speed scaling
    for (var k = 1; k < prop.numKeys; k++) {
        try {
            var t1 = prop.keyTime(k);
            var t2 = prop.keyTime(k + 1);
            var timeDiff = t2 - t1;
            
            var v1 = prop.keyValue(k);
            var v2 = prop.keyValue(k + 1);
            
            // Calculate value difference for this segment
            var valueDiff = 0;
            if (typeof v1 === 'number') {
                valueDiff = Math.abs(v2 - v1);
            } else if (v1.length) {
                var sum = 0;
                for (var d = 0; d < v1.length; d++) {
                    sum += Math.pow(v2[d] - v1[d], 2);
                }
                valueDiff = Math.sqrt(sum);
            }
            
            var outEaseArray = [];
            var inEaseArray = [];
            for (var d = 0; d < actualDims; d++) {
                outEaseArray.push(new KeyframeEase(outSpeed, outInfluence));
                inEaseArray.push(new KeyframeEase(inSpeed, inInfluence));
            }
            
            // Set BOTH incoming and outgoing ease on first keyframe
            // Use outgoing ease for both to create smooth start
            prop.setTemporalEaseAtKey(k, outEaseArray, outEaseArray);
            
            // Set BOTH incoming and outgoing ease on second keyframe
            // Use incoming ease for both to create smooth end
            prop.setTemporalEaseAtKey(k + 1, inEaseArray, inEaseArray);
            
        } catch (e) {
            return 'Error at segment ' + k + ': ' + e.toString();
        }
    }
    
    // For spatial properties, set to linear to avoid auto-bezier interference
    if (prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL || 
        prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
        for (var k = 1; k <= prop.numKeys; k++) {
            try {
                prop.setSpatialContinuousAtKey(k, false);
                prop.setSpatialAutoBezierAtKey(k, false);
            } catch (e) {
                // Ignore if spatial properties are not supported or behave differently
            }
        }
    }

    return 'Applied curve: ' + curveType + ' (out: ' + outSpeed + ',' + outInfluence + ' in: ' + inSpeed + ',' + inInfluence + ')';
}

function detectCurveFromKeyframes() {
    try {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) {
            return JSON.stringify({success: false, message: 'No composition selected'});
        }
        
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            return JSON.stringify({success: false, message: 'No layers selected'});
        }
        
        var layer = selectedLayers[0];
        var property = null;
        
        if (layer.selectedProperties && layer.selectedProperties.length > 0) {
            for (var si = 0; si < layer.selectedProperties.length; si++) {
                var p = layer.selectedProperties[si];
                if (p.propertyType === PropertyType.PROPERTY && p.numKeys >= 2) {
                    property = p;
                    break;
                }
            }
        }
        
        if (!property) {
            try {
                var transform = layer.property("ADBE Transform Group");
                if (transform) {
                    var positionProp = transform.property("ADBE Position");
                    if (positionProp && positionProp.numKeys >= 2) {
                        property = positionProp;
                    }
                }
            } catch (e) {
                // Ignore errors
            }
        }
        
        if (!property) {
            return JSON.stringify({success: false, message: 'No properties with 2+ keyframes found'});
        }
        
        if (property.numKeys < 2) {
            return JSON.stringify({success: false, message: 'Need at least 2 keyframes'});
        }
        
        var inEase = property.keyInTemporalEase(1);
        var outEase = property.keyOutTemporalEase(1);
        
        if (inEase.length === 0 || outEase.length === 0) {
            return JSON.stringify({success: false, message: 'No easing data found on keyframes'});
        }
        
        var inSpeed = inEase[0].speed;
        var inInfluence = inEase[0].influence;
        var outSpeed = outEase[0].speed;
        var outInfluence = outEase[0].influence;
        
        var curveValues = [
            outSpeed / 100,
            outInfluence / 100,
            inSpeed / 100,
            inInfluence / 100
        ];
        
        return JSON.stringify({
            success: true,
            curveValues: curveValues,
            message: 'Curve detected from keyframes'
        });
        
    } catch (error) {
        return JSON.stringify({success: false, message: 'Error: ' + error.toString()});
    }
}


