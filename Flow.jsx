// Flow - Custom Easing Curve Editor for After Effects
// A free alternative to the commercial Flow plugin

(function() {
    "use strict";
    
    // Main Flow Panel
    function FlowPanel(thisObj) {
        var flowPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Flow - Easing Curves", undefined, {resizeable: true});
        
        // Panel properties
        flowPanel.orientation = "column";
        flowPanel.alignChildren = "fill";
        flowPanel.spacing = 10;
        flowPanel.margins = 15;
        
        // Main container
        var mainGroup = flowPanel.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = "fill";
        mainGroup.spacing = 10;
        
        // Title
        var titleGroup = mainGroup.add("group");
        titleGroup.add("statictext", undefined, "Flow - Easing Curves");
        
        // Curve editor section
        var curveGroup = mainGroup.add("panel", undefined, "Curve Editor");
        curveGroup.orientation = "column";
        curveGroup.alignChildren = "fill";
        curveGroup.spacing = 5;
        curveGroup.preferredSize.height = 200;
        
        // Canvas for curve visualization
        var curveCanvas = curveGroup.add("panel", undefined, "");
        curveCanvas.preferredSize.height = 150;
        curveCanvas.alignChildren = "fill";
        
        // Control points group
        var controlsGroup = curveGroup.add("group");
        controlsGroup.orientation = "row";
        controlsGroup.alignChildren = "fill";
        controlsGroup.spacing = 10;
        
        // X1 control
        var x1Group = controlsGroup.add("group");
        x1Group.orientation = "column";
        x1Group.add("statictext", undefined, "X1");
        var x1Slider = x1Group.add("slider", undefined, 0, 0, 1);
        x1Slider.preferredSize.width = 80;
        var x1Value = x1Group.add("statictext", undefined, "0.00");
        x1Value.preferredSize.width = 40;
        
        // Y1 control
        var y1Group = controlsGroup.add("group");
        y1Group.orientation = "column";
        y1Group.add("statictext", undefined, "Y1");
        var y1Slider = y1Group.add("slider", undefined, 0, 0, 1);
        y1Slider.preferredSize.width = 80;
        var y1Value = y1Group.add("statictext", undefined, "0.00");
        y1Value.preferredSize.width = 40;
        
        // X2 control
        var x2Group = controlsGroup.add("group");
        x2Group.orientation = "column";
        x2Group.add("statictext", undefined, "X2");
        var x2Slider = x2Group.add("slider", undefined, 1, 0, 1);
        x2Slider.preferredSize.width = 80;
        var x2Value = x2Group.add("statictext", undefined, "1.00");
        x2Value.preferredSize.width = 40;
        
        // Y2 control
        var y2Group = controlsGroup.add("group");
        y2Group.orientation = "column";
        y2Group.add("statictext", undefined, "Y2");
        var y2Slider = y2Group.add("slider", undefined, 1, 0, 1);
        y2Slider.preferredSize.width = 80;
        var y2Value = y2Group.add("statictext", undefined, "1.00");
        y2Value.preferredSize.width = 40;
        
        // Presets section
        var presetsGroup = mainGroup.add("panel", undefined, "Presets");
        presetsGroup.orientation = "column";
        presetsGroup.alignChildren = "fill";
        presetsGroup.spacing = 5;
        
        var presetsRow1 = presetsGroup.add("group");
        presetsRow1.orientation = "row";
        presetsRow1.alignChildren = "fill";
        presetsRow1.spacing = 5;
        
        var presetsRow2 = presetsGroup.add("group");
        presetsRow2.orientation = "row";
        presetsRow2.alignChildren = "fill";
        presetsRow2.spacing = 5;
        
        // Preset buttons
        var presetButtons = [];
        var presetNames = ["Linear", "Ease", "Ease In", "Ease Out", "Ease In Out", "Bounce", "Elastic", "Back", "Circ", "Cubic"];
        var presetValues = [
            [0, 0, 1, 1], // Linear
            [0.25, 0.1, 0.25, 1], // Ease
            [0.42, 0, 1, 1], // Ease In
            [0, 0, 0.58, 1], // Ease Out
            [0.42, 0, 0.58, 1], // Ease In Out
            [0.68, -0.55, 0.265, 1.55], // Bounce
            [0.175, 0.885, 0.32, 1.275], // Elastic
            [0.68, -0.6, 0.32, 1.6], // Back
            [0.6, 0.04, 0.98, 0.34], // Circ
            [0.55, 0.055, 0.675, 0.19] // Cubic
        ];
        
        for (var i = 0; i < presetNames.length; i++) {
            var row = (i < 5) ? presetsRow1 : presetsRow2;
            var btn = row.add("button", undefined, presetNames[i]);
            btn.preferredSize.width = 60;
            presetButtons.push(btn);
        }
        
        // CSS input section
        var cssGroup = mainGroup.add("panel", undefined, "CSS Integration");
        cssGroup.orientation = "column";
        cssGroup.alignChildren = "fill";
        cssGroup.spacing = 5;
        
        var cssInputGroup = cssGroup.add("group");
        cssInputGroup.orientation = "row";
        cssInputGroup.alignChildren = "fill";
        cssInputGroup.spacing = 5;
        
        cssInputGroup.add("statictext", undefined, "cubic-bezier:");
        var cssInput = cssInputGroup.add("edittext", undefined, "0, 0, 1, 1");
        cssInput.characters = 20;
        
        var updateBtn = cssInputGroup.add("button", undefined, "Update");
        updateBtn.preferredSize.width = 60;
        
        // Action buttons
        var actionGroup = mainGroup.add("group");
        actionGroup.orientation = "row";
        actionGroup.alignChildren = "fill";
        actionGroup.spacing = 10;
        
        var applyBtn = actionGroup.add("button", undefined, "Apply to Selection");
        var copyBtn = actionGroup.add("button", undefined, "Copy CSS");
        var resetBtn = actionGroup.add("button", undefined, "Reset");
        
        // Current values
        var currentValues = [0, 0, 1, 1];
        
        // Update display values
        function updateValues() {
            x1Value.text = currentValues[0].toFixed(2);
            y1Value.text = currentValues[1].toFixed(2);
            x2Value.text = currentValues[2].toFixed(2);
            y2Value.text = currentValues[3].toFixed(2);
            cssInput.text = "cubic-bezier(" + currentValues.join(", ") + ")";
            drawCurve();
        }
        
        // Draw curve on canvas
        function drawCurve() {
            // Clear existing preview
            while (curveCanvas.children.length > 0) {
                curveCanvas.children[0].remove();
            }
            
            // Create a visual curve using multiple static text elements
            var curveContainer = curveCanvas.add("group");
            curveContainer.orientation = "column";
            curveContainer.alignChildren = "fill";
            curveContainer.spacing = 1;
            
            // Create a grid of text elements to represent the curve
            var gridSize = 16;
            var curveData = [];
            
            // Generate curve data
            for (var row = 0; row < gridSize; row++) {
                var line = "";
                for (var col = 0; col < gridSize; col++) {
                    var t = col / (gridSize - 1);
                    var point = getBezierPoint(t, currentValues);
                    var y = Math.round(point.y * (gridSize - 1));
                    
                    if (y === (gridSize - 1 - row)) {
                        line += "●"; // Curve point
                    } else if (col === 0 || col === gridSize - 1) {
                        line += "│"; // Vertical border
                    } else if (row === gridSize - 1) {
                        line += "─"; // Horizontal border
                    } else if (row === 0) {
                        line += "─"; // Top border
                    } else if (col === Math.round(currentValues[0] * (gridSize - 1)) && row === Math.round((1 - currentValues[1]) * (gridSize - 1))) {
                        line += "○"; // Control point 1
                    } else if (col === Math.round(currentValues[2] * (gridSize - 1)) && row === Math.round((1 - currentValues[3]) * (gridSize - 1))) {
                        line += "○"; // Control point 2
                    } else {
                        line += "·"; // Grid dot
                    }
                }
                curveData.push(line);
            }
            
            // Create text elements for each line
            for (var i = 0; i < curveData.length; i++) {
                var lineText = curveContainer.add("statictext", undefined, curveData[i]);
                lineText.preferredSize.height = 6;
            }
            
            // Add values below
            var valuesText = curveContainer.add("statictext", undefined, "cubic-bezier(" + currentValues.join(", ") + ")");
            valuesText.preferredSize.height = 12;
        }
        
        // Apply easing to selected keyframes using keyframe interpolation
        function applyEasing() {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) {
                alert("Please select a composition");
                return;
            }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                alert("Please select a layer");
                return;
            }

            app.beginUndoGroup("Apply Cubic Bezier Easing");
            try {
                var appliedCount = 0;
                
                for (var li = 0; li < selectedLayers.length; li++) {
                    var layer = selectedLayers[li];
                    var targets = [];

                    if (layer.selectedProperties && layer.selectedProperties.length > 0) {
                        for (var si = 0; si < layer.selectedProperties.length; si++) {
                            var p = layer.selectedProperties[si];
                            if (p.propertyType === PropertyType.PROPERTY && p.numKeys && p.numKeys >= 2) {
                                targets.push(p);
                            }
                        }
                    }
                    if (targets.length === 0) {
                        var common = ["Position", "Scale", "Rotation", "Opacity", "Anchor Point"];
                        for (var ci = 0; ci < common.length; ci++) {
                            try {
                                var cp = layer.property(common[ci]);
                                if (cp && cp.propertyType === PropertyType.PROPERTY && cp.numKeys && cp.numKeys >= 2) {
                                    targets.push(cp);
                                }
                            } catch (err) {}
                        }
                    }

                    for (var ti = 0; ti < targets.length; ti++) {
                        var property = targets[ti];
                        
                        // Apply easing to all keyframes
                        for (var k = 1; k <= property.numKeys; k++) {
                            // Set keyframe interpolation to bezier
                            property.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                            
                            // Calculate ease based on control points
                            var inEase = [];
                            var outEase = [];
                            
                            // For each dimension of the property
                            var numDims = 1;
                            if (property.propertyValueType === PropertyValueType.ThreeD_SPATIAL || 
                                property.propertyValueType === PropertyValueType.ThreeD) {
                                numDims = 3;
                            } else if (property.propertyValueType === PropertyValueType.TwoD_SPATIAL || 
                                       property.propertyValueType === PropertyValueType.TwoD) {
                                numDims = 2;
                            }
                            
                            for (var d = 0; d < numDims; d++) {
                                // Convert cubic-bezier to ease values
                                var inSpeed = currentValues[1] * 100;
                                var outSpeed = (1 - currentValues[3]) * 100;
                                var inInfluence = currentValues[0] * 100;
                                var outInfluence = (1 - currentValues[2]) * 100;
                                
                                inEase.push(new KeyframeEase(inSpeed, inInfluence));
                                outEase.push(new KeyframeEase(outSpeed, outInfluence));
                            }
                            
                            // Apply temporal easing
                            try {
                                property.setTemporalEaseAtKey(k, inEase, outEase);
                            } catch (e) {
                                // Some properties don't support temporal easing
                            }
                        }
                        appliedCount++;
                    }
                }
                
                if (appliedCount > 0) {
                    alert("Easing applied to " + appliedCount + " properties! Check the graph editor.");
                } else {
                    alert("No properties with keyframes found.");
                }
            } catch (e) {
                alert("Error applying easing: " + e.toString());
            } finally {
                app.endUndoGroup();
            }
        }
        
        // Easing function
        function ease(t, t0, t1, x1, y1, x2, y2) {
            var progress = (t - t0) / (t1 - t0);
            if (progress <= 0) return 0;
            if (progress >= 1) return 1;
            
            // Cubic bezier implementation
            var cx = 3 * x1;
            var bx = 3 * (x2 - x1) - cx;
            var ax = 1 - cx - bx;
            
            var cy = 3 * y1;
            var by = 3 * (y2 - y1) - cy;
            var ay = 1 - cy - by;
            
            return sampleCurveY(solveCurveX(progress, ax, bx, cx));
        }
        
        function sampleCurveX(t, ax, bx, cx) {
            return ((ax * t + bx) * t + cx) * t;
        }
        
        function sampleCurveY(t, ay, by, cy) {
            return ((ay * t + by) * t + cy) * t;
        }
        
        function solveCurveX(x, ax, bx, cx) {
            var t2, t3, x2, d2, i;
            var epsilon = 1e-5;
            
            for (t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2, ax, bx, cx) - x;
                if (Math.abs(x2) < epsilon) return t2;
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (Math.abs(d2) < epsilon) break;
                t2 = t2 - x2 / d2;
            }
            
            t2 = 0;
            t3 = 1;
            while (t2 < t3) {
                x2 = sampleCurveX(t2, ax, bx, cx);
                if (Math.abs(x2 - x) < epsilon) return t2;
                if (x > x2) t2 = t2 + (t3 - t2) / 2;
                else t3 = t2;
                t2 = t2 + (t3 - t2) / 2;
            }
            
            return t2;
        }
        
        // Event handlers
        x1Slider.onChanging = function() {
            currentValues[0] = x1Slider.value;
            updateValues();
        };
        
        y1Slider.onChanging = function() {
            currentValues[1] = y1Slider.value;
            updateValues();
        };
        
        x2Slider.onChanging = function() {
            currentValues[2] = x2Slider.value;
            updateValues();
        };
        
        y2Slider.onChanging = function() {
            currentValues[3] = y2Slider.value;
            updateValues();
        };
        
        // Also update on slider change (not just changing)
        x1Slider.onClick = function() {
            currentValues[0] = x1Slider.value;
            updateValues();
        };
        
        y1Slider.onClick = function() {
            currentValues[1] = y1Slider.value;
            updateValues();
        };
        
        x2Slider.onClick = function() {
            currentValues[2] = x2Slider.value;
            updateValues();
        };
        
        y2Slider.onClick = function() {
            currentValues[3] = y2Slider.value;
            updateValues();
        };
        
        // Preset button handlers
        for (var i = 0; i < presetButtons.length; i++) {
            (function(index) {
                presetButtons[index].onClick = function() {
                    currentValues = presetValues[index].slice();
                    x1Slider.value = currentValues[0];
                    y1Slider.value = currentValues[1];
                    x2Slider.value = currentValues[2];
                    y2Slider.value = currentValues[3];
                    updateValues();
                };
            })(i);
        }
        
        updateBtn.onClick = function() {
            var cssText = cssInput.text;
            var match = cssText.match(/cubic-bezier\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
            if (match) {
                currentValues = [
                    parseFloat(match[1]),
                    parseFloat(match[2]),
                    parseFloat(match[3]),
                    parseFloat(match[4])
                ];
                x1Slider.value = currentValues[0];
                y1Slider.value = currentValues[1];
                x2Slider.value = currentValues[2];
                y2Slider.value = currentValues[3];
                updateValues();
            } else {
                alert("Invalid cubic-bezier format. Use: cubic-bezier(x1, y1, x2, y2)");
            }
        };
        
        applyBtn.onClick = function() {
            applyEasing();
        };
        
        copyBtn.onClick = function() {
            cssInput.text = "cubic-bezier(" + currentValues.join(", ") + ")";
        };
        
        resetBtn.onClick = function() {
            currentValues = [0, 0, 1, 1];
            x1Slider.value = 0;
            y1Slider.value = 0;
            x2Slider.value = 1;
            y2Slider.value = 1;
            updateValues();
        };
        
        // Initialize
        updateValues();
        
        return flowPanel;
    }
    
    // Create and show panel
    var flowPanel = FlowPanel(this);
    if (flowPanel !== null) {
        flowPanel.show();
    }
    
})();
