# Flow - Free Easing Curve Editor for After Effects

A comprehensive, free alternative to the commercial Flow plugin for Adobe After Effects. This collection provides intuitive easing curve editing with visual controls, preset libraries, and CSS integration.

## Files Included

- **Flow.jsx** - Basic version with essential features
- **FlowAdvanced.jsx** - Enhanced version with better visualization and more presets
- **EasingLibrary.jsx** - Comprehensive easing functions library
- **README.md** - This documentation

## Features

### Core Functionality
- Visual curve editor with real-time preview
- Cubic-bezier control points with sliders
- Live curve visualization with grid
- CSS cubic-bezier import/export
- Direct application to After Effects keyframes

### Preset Library
- **Basic Presets**: Linear, Ease, Ease In/Out, Fast In/Out
- **Advanced Presets**: Bounce, Elastic, Back, Circular, Cubic, Exponential, Quadratic, Quartic

### CSS Integration
- Import cubic-bezier values from CSS
- Export curves as CSS cubic-bezier functions
- Seamless web-to-video workflow

## Installation

1. Copy the `.jsx` files to your After Effects Scripts folder:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\`
   - **Mac**: `/Applications/Adobe After Effects [version]/Scripts/`

2. Restart After Effects

3. Run the script from:
   - **File > Scripts > Flow** (or FlowAdvanced)

## Usage

### Basic Workflow
1. Open a composition with animated layers
2. Select a layer with keyframes
3. Select the property you want to ease
4. Open Flow plugin
5. Adjust curve using sliders or presets
6. Click "Apply to Selection"

### Curve Editing
- Use the four sliders (X1, Y1, X2, Y2) to control the cubic-bezier curve
- Values range from 0 to 1
- Real-time preview updates as you adjust

### Presets
- Click any preset button to instantly apply that easing
- Basic tab contains common easing functions
- Advanced tab contains more complex easing types

### CSS Integration
- Paste cubic-bezier values in the CSS input field
- Click "Update" to apply the curve
- Click "Copy CSS" to copy current curve as CSS

## Advanced Features

### Custom Easing Functions
The EasingLibrary.jsx provides access to all easing functions programmatically:

```javascript
// Example: Apply bounce easing
var bounceEasing = EasingLibrary.bounceOut;
applyEasing(property, bounceEasing, startTime, endTime);
```

### Expression Integration
The plugin generates After Effects expressions that work with any property:

```javascript
// Generated expression example
var t = (time - 0) / (2 - 0);
var eased = EasingLibrary.bounceOut(Math.max(0, Math.min(1, t)));
linear(eased, 0, 1, 0, 100);
```

## Troubleshooting

### Common Issues
- **"Please select a composition"**: Make sure a composition is active
- **"Please select a layer"**: Select a layer in the composition
- **"Property must have at least 2 keyframes"**: Add keyframes to the selected property

### Performance
- The plugin uses After Effects expressions for smooth playback
- Complex curves may impact render performance
- Consider using keyframes for final renders if needed

## Customization

### Adding New Presets
Edit the preset arrays in FlowAdvanced.jsx:

```javascript
var basicPresets = [
    {name: "Custom", values: [0.1, 0.2, 0.8, 0.9]},
    // ... existing presets
];
```

### Modifying the Interface
The UI is built using After Effects ScriptUI, making it easy to customize:
- Adjust panel sizes in `preferredSize` properties
- Modify colors in `graphics.foregroundColor` calls
- Add new controls by extending the group structure

## Technical Details

### Cubic-Bezier Implementation
The plugin uses a robust cubic-bezier solver that handles all valid curve types, including those that exceed the 0-1 range for advanced effects.

### Expression Generation
Curves are applied using After Effects expressions that:
- Calculate normalized time progress
- Apply the easing function
- Map the result to the property's value range

### Compatibility
- After Effects CC 2018 and later
- Works with all property types (position, scale, rotation, opacity, etc.)
- Compatible with both keyframe and expression-based animations

## License

This project is provided as-is for educational and personal use. Feel free to modify and distribute according to your needs.

## Credits

Inspired by the commercial Flow plugin by Zack Lovatt and renderTom. Easing functions based on Robert Penner's easing equations.
