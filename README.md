# CurveCraft - Professional Curve Editor for After Effects

A CEP (Common Extensibility Platform) extension that provides professional curve editing and easing application for After Effects keyframes, inspired by Flow's intuitive interface.

## Features

- **6 Curve Presets**: Linear, Ease In, Ease Out, Ease In-Out, Bounce, Elastic
- **Visual Curve Preview**: Interactive canvas showing the selected curve
- **Real-time Updates**: Curve changes as you select different presets
- **Professional UI**: Dark theme matching After Effects
- **Proper Keyframe Easing**: Uses After Effects' native easing system

## Installation

### Method 1: Manual Installation (Recommended)

1. **Copy the extension folder** to your After Effects CEP extensions directory:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\CEP\extensions\`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`

2. **Enable unsigned extensions** (required for development):
   - **Windows**: Create/edit `C:\Users\[username]\AppData\Roaming\Adobe\CEP\extensions\com.adobe.CSXS.6.0\`
   - **macOS**: Create/edit `~/Library/Application Support/Adobe/CEP/extensions/com.adobe.CSXS.6.0/`
   - Add a file called `debug` (no extension) with content: `1`

3. **Restart After Effects**

4. **Find the extension**: Window → Extensions → CurveCraft

## Usage

1. **Open After Effects** and create a composition
2. **Add keyframes** to any property (Position, Scale, Rotation, Opacity, etc.)
3. **Select the layer** or specific properties
4. **Open CurveCraft**: Window → Extensions → CurveCraft
5. **Choose a curve** from the dropdown
6. **Click "Apply Curve"** to apply the easing

## Curve Types

- **Linear**: No easing (0, 0, 1, 1)
- **Ease In**: Slow start (0.42, 0, 1, 1)
- **Ease Out**: Slow end (0, 0, 0.58, 1)
- **Ease In-Out**: Slow start and end (0.42, 0, 0.58, 1)
- **Bounce**: Bouncy animation
- **Elastic**: Elastic animation

## Technical Details

### How It Works
The extension uses After Effects' native `setTemporalEaseAtKey()` function to create smooth bezier curves. Unlike simple expressions, this approach:
- Preserves your original keyframe positions
- Creates mathematically accurate curves
- Works with all property types (Position, Scale, Rotation, Opacity, etc.)
- Shows curves in the Graph Editor as native keyframe easing

### File Structure
```
CurveCraft/
├── CSXS/
│   └── manifest.xml          # CEP manifest
├── client/
│   ├── index.html            # Main UI
│   ├── style.css             # Styling
│   ├── curves.js             # Curve drawing logic
│   └── main.js               # UI logic and AE communication
└── jsx/
    └── host.jsx              # After Effects integration
```

## Troubleshooting

### Extension Not Appearing
1. Check that the extension is in the correct CEP directory
2. Verify the debug file is created and contains "1"
3. Restart After Effects completely
4. Check After Effects version compatibility (2020+)

### Curves Not Applying
1. Ensure you have keyframes on the selected properties
2. Check that properties have at least 2 keyframes
3. Try selecting the specific property instead of just the layer
4. Verify the extension shows "Success" message

### Performance Issues
1. The extension uses native After Effects easing, so it's very efficient
2. No expressions are added, so there's no performance impact
3. Curves are visible in the Graph Editor as native keyframe easing

## Why CEP Instead of Scripts?

After Effects' ExtendScript API is very limited when it comes to creating custom curves. The commercial Flow plugin works because it's a CEP extension that can:

- **Create Interactive UIs**: HTML5 canvas for curve editing
- **Real-time Communication**: Direct integration with After Effects
- **Professional Interface**: Modern, responsive UI
- **Native Keyframe Manipulation**: Direct access to After Effects' easing system

## License

This extension is provided as-is for educational and personal use. It replicates functionality of the commercial Flow plugin by Lova.

## Credits

- Inspired by Flow plugin by Lova (flow.lova.tt)
- Built using Adobe CEP (Common Extensibility Platform)
- Based on the CEP extension template approach