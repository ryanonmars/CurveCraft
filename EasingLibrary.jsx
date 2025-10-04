// Easing Library - Comprehensive easing functions for After Effects
// Companion library for Flow plugin

(function() {
    "use strict";
    
    // Easing functions library
    var EasingLibrary = {
        
        // Linear easing
        linear: function(t) {
            return t;
        },
        
        // Quadratic easing
        quadIn: function(t) {
            return t * t;
        },
        
        quadOut: function(t) {
            return t * (2 - t);
        },
        
        quadInOut: function(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        
        // Cubic easing
        cubicIn: function(t) {
            return t * t * t;
        },
        
        cubicOut: function(t) {
            return (--t) * t * t + 1;
        },
        
        cubicInOut: function(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        },
        
        // Quartic easing
        quartIn: function(t) {
            return t * t * t * t;
        },
        
        quartOut: function(t) {
            return 1 - (--t) * t * t * t;
        },
        
        quartInOut: function(t) {
            return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        },
        
        // Quintic easing
        quintIn: function(t) {
            return t * t * t * t * t;
        },
        
        quintOut: function(t) {
            return 1 + (--t) * t * t * t * t;
        },
        
        quintInOut: function(t) {
            return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
        },
        
        // Sine easing
        sineIn: function(t) {
            return 1 - Math.cos(t * Math.PI / 2);
        },
        
        sineOut: function(t) {
            return Math.sin(t * Math.PI / 2);
        },
        
        sineInOut: function(t) {
            return -(Math.cos(Math.PI * t) - 1) / 2;
        },
        
        // Exponential easing
        expoIn: function(t) {
            return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
        },
        
        expoOut: function(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        },
        
        expoInOut: function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
            return (2 - Math.pow(2, -20 * t + 10)) / 2;
        },
        
        // Circular easing
        circIn: function(t) {
            return 1 - Math.sqrt(1 - t * t);
        },
        
        circOut: function(t) {
            return Math.sqrt(1 - (--t) * t);
        },
        
        circInOut: function(t) {
            return t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - 4 * (t - 1) * (t - 1)) + 1) / 2;
        },
        
        // Back easing
        backIn: function(t) {
            var c1 = 1.70158;
            var c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        
        backOut: function(t) {
            var c1 = 1.70158;
            var c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        
        backInOut: function(t) {
            var c1 = 1.70158;
            var c2 = c1 * 1.525;
            return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },
        
        // Elastic easing
        elasticIn: function(t) {
            var c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        
        elasticOut: function(t) {
            var c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        
        elasticInOut: function(t) {
            var c5 = (2 * Math.PI) / 4.5;
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        },
        
        // Bounce easing
        bounceIn: function(t) {
            return 1 - EasingLibrary.bounceOut(1 - t);
        },
        
        bounceOut: function(t) {
            var n1 = 7.5625;
            var d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        
        bounceInOut: function(t) {
            return t < 0.5 ? (1 - EasingLibrary.bounceOut(1 - 2 * t)) / 2 : (1 + EasingLibrary.bounceOut(2 * t - 1)) / 2;
        }
    };
    
    // Cubic bezier implementation
    function cubicBezier(x1, y1, x2, y2) {
        return function(t) {
            var cx = 3 * x1;
            var bx = 3 * (x2 - x1) - cx;
            var ax = 1 - cx - bx;
            
            var cy = 3 * y1;
            var by = 3 * (y2 - y1) - cy;
            var ay = 1 - cy - by;
            
            return sampleCurveY(solveCurveX(t, ax, bx, cx), ay, by, cy);
        };
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
    
    // Apply easing to property
    function applyEasing(property, easingFunction, startTime, endTime) {
        if (!property || !property.numKeys || property.numKeys < 2) {
            return false;
        }
        
        var startValue = property.keyValue(1);
        var endValue = property.keyValue(property.numKeys);
        
        var expression = "var t = (time - " + startTime + ") / (" + endTime + " - " + startTime + ");\n";
        expression += "var eased = " + easingFunction.toString() + "(Math.max(0, Math.min(1, t)));\n";
        expression += "linear(eased, 0, 1, " + startValue + ", " + endValue + ")";
        
        property.expression = expression;
        return true;
    }
    
    // Export for use in other scripts
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            EasingLibrary: EasingLibrary,
            cubicBezier: cubicBezier,
            applyEasing: applyEasing
        };
    } else {
        // Make available globally
        this.EasingLibrary = EasingLibrary;
        this.cubicBezier = cubicBezier;
        this.applyEasing = applyEasing;
    }
    
})();
