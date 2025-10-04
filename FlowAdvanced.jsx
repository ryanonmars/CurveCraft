// Flow Advanced - Enhanced Easing Curve Editor for After Effects
// A comprehensive free alternative to the commercial Flow plugin

(function() {
    "use strict";
    
    // Enhanced Flow Panel with better visualization
    function FlowAdvancedPanel(thisObj) {
        var flowPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Flow Advanced - Easing Curves", undefined, {resizeable: true});
        
        // Panel properties
        flowPanel.orientation = "column";
        flowPanel.alignChildren = "fill";
        flowPanel.spacing = 8;
        flowPanel.margins = 12;
        flowPanel.preferredSize.width = 400;
        flowPanel.preferredSize.height = 600;
        
        // Main container
        var mainGroup = flowPanel.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = "fill";
        mainGroup.spacing = 8;
        
        // Header
        var headerGroup = mainGroup.add("group");
        headerGroup.add("statictext", undefined, "Flow Advanced");
        
        // Curve visualization panel
        var curvePanel = mainGroup.add("panel", undefined, "Curve Preview");
        curvePanel.orientation = "column";
        curvePanel.alignChildren = "fill";
        curvePanel.spacing = 5;
        curvePanel.preferredSize.height = 180;
        
        // Canvas for curve
        var curveCanvas = curvePanel.add("panel", undefined, "");
        curveCanvas.preferredSize.height = 120;
        curveCanvas.alignChildren = "fill";
        
        // Control points section
        var controlsPanel = mainGroup.add("panel", undefined, "Control Points");
        controlsPanel.orientation = "column";
        controlsPanel.alignChildren = "fill";
        controlsPanel.spacing = 5;
        
        var controlsGrid = controlsPanel.add("group");
        controlsGrid.orientation = "row";
        controlsGrid.alignChildren = "fill";
        controlsGrid.spacing = 10;
        
        // X1 control
        var x1Group = controlsGrid.add("group");
        x1Group.orientation = "column";
        x1Group.add("statictext", undefined, "X1");
        var x1Slider = x1Group.add("slider", undefined, 0, 0, 1);
        x1Slider.preferredSize.width = 70;
        var x1Value = x1Group.add("statictext", undefined, "0.00");
        x1Value.preferredSize.width = 50;
        x1Value.alignment = "center";
        
        // Y1 control
        var y1Group = controlsGrid.add("group");
        y1Group.orientation = "column";
        y1Group.add("statictext", undefined, "Y1");
        var y1Slider = y1Group.add("slider", undefined, 0, 0, 1);
        y1Slider.preferredSize.width = 70;
        var y1Value = y1Group.add("statictext", undefined, "0.00");
        y1Value.preferredSize.width = 50;
        y1Value.alignment = "center";
        
        // X2 control
        var x2Group = controlsGrid.add("group");
        x2Group.orientation = "column";
        x2Group.add("statictext", undefined, "X2");
        var x2Slider = x2Group.add("slider", undefined, 1, 0, 1);
        x2Slider.preferredSize.width = 70;
        var x2Value = x2Group.add("statictext", undefined, "1.00");
        x2Value.preferredSize.width = 50;
        x2Value.alignment = "center";
        
        // Y2 control
        var y2Group = controlsGrid.add("group");
        y2Group.orientation = "column";
        y2Group.add("statictext", undefined, "Y2");
        var y2Slider = y2Group.add("slider", undefined, 1, 0, 1);
        y2Slider.preferredSize.width = 70;
        var y2Value = y2Group.add("statictext", undefined, "1.00");
        y2Value.preferredSize.width = 50;
        y2Value.alignment = "center";
        
        // Presets section
        var presetsPanel = mainGroup.add("panel", undefined, "Easing Presets");
        presetsPanel.orientation = "column";
        presetsPanel.alignChildren = "fill";
        presetsPanel.spacing = 5;
        
        // Preset categories
        var presetTabs = presetsPanel.add("tabbedpanel");
        presetTabs.preferredSize.height = 120;
        
        // Basic presets tab
        var basicTab = presetTabs.add("tab", undefined, "Basic");
        var basicGroup = basicTab.add("group");
        basicGroup.orientation = "column";
        basicGroup.alignChildren = "fill";
        basicGroup.spacing = 3;
        
        var basicRow1 = basicGroup.add("group");
        basicRow1.orientation = "row";
        basicRow1.alignChildren = "fill";
        basicRow1.spacing = 3;
        
        var basicRow2 = basicGroup.add("group");
        basicRow2.orientation = "row";
        basicRow2.alignChildren = "fill";
        basicRow2.spacing = 3;
        
        // Advanced presets tab
        var advancedTab = presetTabs.add("tab", undefined, "Advanced");
        var advancedGroup = advancedTab.add("group");
        advancedGroup.orientation = "column";
        advancedGroup.alignChildren = "fill";
        advancedGroup.spacing = 3;
        
        var advancedRow1 = advancedGroup.add("group");
        advancedRow1.orientation = "row";
        advancedRow1.alignChildren = "fill";
        advancedRow1.spacing = 3;
        
        var advancedRow2 = advancedGroup.add("group");
        advancedRow2.orientation = "row";
        advancedRow2.alignChildren = "fill";
        advancedRow2.spacing = 3;
        
        // Preset data
        var basicPresets = [
            {name: "Linear", values: [0, 0, 1, 1]},
            {name: "Ease", values: [0.25, 0.1, 0.25, 1]},
            {name: "Ease In", values: [0.42, 0, 1, 1]},
            {name: "Ease Out", values: [0, 0, 0.58, 1]},
            {name: "Ease In-Out", values: [0.42, 0, 0.58, 1]},
            {name: "Fast Out", values: [0, 0, 0.2, 1]},
            {name: "Fast In", values: [0.8, 0, 1, 1]},
            {name: "Fast In-Out", values: [0.8, 0, 0.2, 1]}
        ];
        
        var advancedPresets = [
            {name: "Bounce", values: [0.68, -0.55, 0.265, 1.55]},
            {name: "Elastic", values: [0.175, 0.885, 0.32, 1.275]},
            {name: "Back", values: [0.68, -0.6, 0.32, 1.6]},
            {name: "Circ", values: [0.6, 0.04, 0.98, 0.34]},
            {name: "Cubic", values: [0.55, 0.055, 0.675, 0.19]},
            {name: "Expo", values: [0.95, 0.05, 0.795, 0.035]},
            {name: "Quad", values: [0.55, 0.085, 0.68, 0.53]},
            {name: "Quart", values: [0.895, 0.03, 0.685, 0.22]}
        ];
        
        // Create preset buttons
        var basicButtons = [];
        var advancedButtons = [];
        
        for (var i = 0; i < basicPresets.length; i++) {
            var row = (i < 4) ? basicRow1 : basicRow2;
            var btn = row.add("button", undefined, basicPresets[i].name);
            btn.preferredSize.width = 80;
            basicButtons.push(btn);
        }
        
        for (var i = 0; i < advancedPresets.length; i++) {
            var row = (i < 4) ? advancedRow1 : advancedRow2;
            var btn = row.add("button", undefined, advancedPresets[i].name);
            btn.preferredSize.width = 80;
            advancedButtons.push(btn);
        }
        
        // CSS integration
        var cssPanel = mainGroup.add("panel", undefined, "CSS Integration");
        cssPanel.orientation = "column";
        cssPanel.alignChildren = "fill";
        cssPanel.spacing = 5;
        
        var cssInputGroup = cssPanel.add("group");
        cssInputGroup.orientation = "row";
        cssInputGroup.alignChildren = "fill";
        cssInputGroup.spacing = 5;
        
        cssInputGroup.add("statictext", undefined, "cubic-bezier:");
        var cssInput = cssInputGroup.add("edittext", undefined, "0, 0, 1, 1");
        cssInput.characters = 25;
        
        var updateBtn = cssInputGroup.add("button", undefined, "Update");
        updateBtn.preferredSize.width = 60;
        
        // Action buttons
        var actionGroup = mainGroup.add("group");
        actionGroup.orientation = "row";
        actionGroup.alignChildren = "fill";
        actionGroup.spacing = 8;
        
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
        
        // Enhanced curve drawing
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
            var gridSize = 20;
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
                lineText.preferredSize.height = 8;
            }
            
            // Add values below
            var valuesText = curveContainer.add("statictext", undefined, "cubic-bezier(" + currentValues.join(", ") + ")");
            valuesText.preferredSize.height = 15;
        }
        
        // Get point on bezier curve
        function getBezierPoint(t, values) {
            var x1 = values[0];
            var y1 = values[1];
            var x2 = values[2];
            var y2 = values[3];
            
            var cx = 3 * x1;
            var bx = 3 * (x2 - x1) - cx;
            var ax = 1 - cx - bx;
            
            var cy = 3 * y1;
            var by = 3 * (y2 - y1) - cy;
            var ay = 1 - cy - by;
            
            return {
                x: ((ax * t + bx) * t + cx) * t,
                y: ((ay * t + by) * t + cy) * t
            };
        }
        
        // Apply easing using expressions (the only way to get true custom curves in ExtendScript)
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

            app.beginUndoGroup("Apply Flow Easing");
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
                        
                        // Remove any existing expressions
                        if (property.expression) {
                            property.expression = "";
                        }
                        
                        // Set all keyframes to bezier interpolation
                        for (var k = 1; k <= property.numKeys; k++) {
                            property.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                        }
                        
                        // Apply cubic-bezier easing to each keyframe segment
                        for (var k = 1; k < property.numKeys; k++) {
                            // Convert cubic-bezier to After Effects ease values
                            var x1 = currentValues[0];
                            var y1 = currentValues[1];
                            var x2 = currentValues[2];
                            var y2 = currentValues[3];
                            
                            // Calculate ease values based on cubic-bezier control points
                            // Y values control the speed curve
                            var inSpeed = y1 * 100;
                            var outSpeed = (1 - y2) * 100;
                            
                            // X values control the influence/timing
                            var inInfluence = x1 * 100;
                            var outInfluence = (1 - x2) * 100;
                            
                            // Clamp values to valid ranges
                            inSpeed = Math.max(0, Math.min(100, inSpeed));
                            outSpeed = Math.max(0, Math.min(100, outSpeed));
                            inInfluence = Math.max(0, Math.min(100, inInfluence));
                            outInfluence = Math.max(0, Math.min(100, outInfluence));
                            
                            // Determine number of dimensions
                            var numDims = 1;
                            if (property.propertyValueType === PropertyValueType.ThreeD_SPATIAL || 
                                property.propertyValueType === PropertyValueType.ThreeD) {
                                numDims = 3;
                            } else if (property.propertyValueType === PropertyValueType.TwoD_SPATIAL || 
                                       property.propertyValueType === PropertyValueType.TwoD) {
                                numDims = 2;
                            }
                            
                            // Create ease arrays for each dimension
                            var inEase = [];
                            var outEase = [];
                            
                            for (var d = 0; d < numDims; d++) {
                                inEase.push(new KeyframeEase(inSpeed, inInfluence));
                                outEase.push(new KeyframeEase(outSpeed, outInfluence));
                            }
                            
                            // Apply temporal easing to both keyframes in the segment
                            try {
                                property.setTemporalEaseAtKey(k, inEase, outEase);
                                property.setTemporalEaseAtKey(k + 1, inEase, outEase);
                            } catch (e) {
                                // Some properties don't support temporal easing
                            }
                            
                            // For spatial properties, also set spatial tangents
                            if (property.propertyValueType === PropertyValueType.TwoD_SPATIAL || 
                                property.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                                
                                try {
                                    // Calculate spatial tangent based on curve intensity
                                    var key1 = property.keyValue(k);
                                    var key2 = property.keyValue(k + 1);
                                    var time1 = property.keyTime(k);
                                    var time2 = property.keyTime(k + 1);
                                    var duration = time2 - time1;
                                    
                                    // Calculate tangent length based on curve intensity
                                    var tangentLength = duration * 0.33 * (x1 + (1 - x2)) / 2;
                                    
                                    // Calculate tangent direction based on y values
                                    var tangentAngle1 = (y1 - 0.5) * Math.PI;
                                    var tangentAngle2 = (y2 - 0.5) * Math.PI;
                                    
                                    // Apply spatial tangents
                                    var valueDiff = key2 - key1;
                                    var tangent1 = valueDiff * (tangentLength / duration) * Math.cos(tangentAngle1);
                                    var tangent2 = valueDiff * (tangentLength / duration) * Math.cos(tangentAngle2);
                                    
                                    if (property.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
                                        property.setSpatialTangentsAtKey(k, [tangent1, tangent1], [tangent2, tangent2]);
                                    } else if (property.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                                        property.setSpatialTangentsAtKey(k, [tangent1, tangent1, tangent1], [tangent2, tangent2, tangent2]);
                                    }
                                } catch (e) {
                                    // Some properties don't support spatial tangents
                                }
                            }
                        }
                        appliedCount++;
                    }
                }
                
                if (appliedCount > 0) {
                    alert("Flow easing applied to " + appliedCount + " properties! Check the graph editor to see the smooth curves.");
                } else {
                    alert("No properties with keyframes found. Select properties with 2+ keyframes.");
                }
            } catch (e) {
                alert("Error applying easing: " + e.toString());
            } finally {
                app.endUndoGroup();
            }
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
        
        // Basic preset handlers
        for (var i = 0; i < basicButtons.length; i++) {
            (function(index) {
                basicButtons[index].onClick = function() {
                    currentValues = basicPresets[index].values.slice();
                    x1Slider.value = currentValues[0];
                    y1Slider.value = currentValues[1];
                    x2Slider.value = currentValues[2];
                    y2Slider.value = currentValues[3];
                    updateValues();
                };
            })(i);
        }
        
        // Advanced preset handlers
        for (var i = 0; i < advancedButtons.length; i++) {
            (function(index) {
                advancedButtons[index].onClick = function() {
                    currentValues = advancedPresets[index].values.slice();
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
    var flowPanel = FlowAdvancedPanel(this);
    if (flowPanel !== null) {
        flowPanel.show();
    }
    
})();
