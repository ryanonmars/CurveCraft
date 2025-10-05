class CurveLibrary {
    constructor() {
        this.currentMode = 'defaults';
        this.isEditMode = false;
        
        // Default curves that are always available
        this.defaultCurves = {
            'Ease Out': [0.344, 0.053, 0.002, 1.000],
            'Ease In': [0.927, 0.000, 0.852, 0.953],
            'Ease In-Out': [0.694, 0.000, 0.306, 1.000],
            'Smooth Linear': [0.285, 0.000, 0.648, 1.000]
        };
        
        this.userCurves = this.loadUserCurves();
    }
    
    loadUserCurves() {
        const saved = localStorage.getItem('simpleFlowCurves');
        return saved ? JSON.parse(saved) : {};
    }
    
    saveUserCurves() {
        localStorage.setItem('simpleFlowCurves', JSON.stringify(this.userCurves));
    }
    
    addUserCurve(name, curveValues) {
        if (this.userCurves[name]) {
            throw new Error(`A curve named "${name}" already exists. Please choose a different name.`);
        }
        this.userCurves[name] = [...curveValues];
        this.saveUserCurves();
    }
    
    deleteUserCurve(name) {
        delete this.userCurves[name];
        this.saveUserCurves();
    }
    
    getUserCurve(name) {
        return this.userCurves[name];
    }
    
    getAllUserCurves() {
        return { ...this.userCurves };
    }
    
    getDefaultCurve(name) {
        return this.defaultCurves[name];
    }
    
    getAllDefaultCurves() {
        return { ...this.defaultCurves };
    }
    
    getCurve(name, isUserCurve = false) {
        if (isUserCurve) {
            return this.getUserCurve(name);
        } else {
            return this.getDefaultCurve(name);
        }
    }
    
    setMode(mode) {
        this.currentMode = mode;
    }
    
    getMode() {
        return this.currentMode;
    }
    
    setEditMode(editMode) {
        this.isEditMode = editMode;
    }
    
    getEditMode() {
        return this.isEditMode;
    }
    
    // Get all curves for the current mode
    getCurrentCurves() {
        if (this.currentMode === 'user') {
            return this.getAllUserCurves();
        } else {
            return this.getAllDefaultCurves();
        }
    }
    
    // Check if a curve name exists in user curves
    hasUserCurve(name) {
        return name in this.userCurves;
    }
    
    // Get count of user curves
    getUserCurveCount() {
        return Object.keys(this.userCurves).length;
    }
}
