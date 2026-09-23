# Mobile Avatar Control System

Premium mobile-first animation picker and camera control system for DripSync.

## Overview

The Mobile Avatar Control System provides:

- **Dynamic Animation Loader**: Automatically extracts animations from avatar, state machine, and libraries
- **iOS-Style Picker Wheel**: Scroll-based animation selection with momentum physics
- **Draggable Bottom Sheet**: 3-state interface (Collapsed, Peek, Expanded)
- **Camera Control Panel**: Orbit, zoom, angle presets, smooth transitions
- **Full Integration**: Works seamlessly with existing DripSync viewport

## Architecture

```
MobileAvatarController
├── useAnimationLoader       [Loads all available animations]
├── useAvatarAnimationPlayer [Plays animations with crossfading]
├── useAvatarCamera          [Smooth camera transitions]
└── AvatarControlSheet
    ├── AnimationPickerWheel [iOS picker interface]
    └── CameraControlPanel   [Camera settings & presets]
```

## Components

### MobileAvatarController
Main integration component. Automatically pulls refs from context or accepts them as props.

```jsx
<MobileAvatarController
  isMobile={true}
  // Refs automatically pulled from context, or pass manually:
  avatarMeshRef={meshRef}
  cameraRef={cameraRef}
  stateMachineRef={smRef}
/>
```

### AnimationPickerWheel
iOS-style vertical picker with momentum scrolling.

- Center item = active (larger, brighter)
- Items fade out above/below
- Momentum physics with auto-snap
- No confirm button needed

### CameraControlPanel
Camera control interface with:

- **Orbit Toggle**: Enable/disable camera rotation
- **Zoom Slider**: 0.5x to 8x
- **Orbit Angle**: 360° rotation
- **Presets**: Front, Side, Full Body, Close-up
- **Reset**: Return to defaults

### AvatarControlSheet
Draggable bottom sheet with 3 states:

1. **Collapsed** - Shows [A] [C] buttons only
2. **Peek** - Shows animation wheel
3. **Expanded** - Full controls with tabs

Gestures:
- Swipe up → Expand
- Swipe down → Collapse
- Drag handle to intermediate state

## Hooks

### useAnimationLoader
Dynamically loads animations from multiple sources:

```js
const { animations, isLoading } = useAnimationLoader(avatarMeshRef, stateMachineRef);
// Returns: [
//   { id: "idle", name: "Idle", duration: 1.0, source: "mesh" },
//   { id: "walk", name: "Walk", duration: 0.5, source: "state-machine" },
//   ...
// ]
```

**Sources**:
- Avatar mesh animations
- State machine animation registry
- Global RPM/animation library

### useAvatarAnimationPlayer
Plays animations with crossfading and conflict prevention:

```js
const { playAnimation, stopAnimation, getCurrentAnimation } = useAvatarAnimationPlayer(
  stateMachineRef,
  meshRef
);

playAnimation('walk', {
  crossfadeDuration: 0.3,
  loop: true,
  speed: 1.0,
  preview: false,
});
```

### useAvatarCamera
Smooth camera control with lerp transitions:

```js
const {
  applyPreset,
  setZoom,
  setOrbitAngle,
  toggleOrbit,
  handleTouchDrag,
  reset,
  getState,
} = useAvatarCamera(cameraRef);

applyPreset('front'); // Smooth 600ms transition
setZoom(2.5);
setOrbitAngle(90);
toggleOrbit(true);
```

## Integration Steps

### 1. Add Provider (if using context)
```jsx
import { MobileAvatarProvider } from '@/hooks/useMobileAvatarContext';

<MobileAvatarProvider>
  <MobileDripSyncLayout {...props} />
</MobileAvatarProvider>
```

### 2. Export Refs from Viewport
In your viewport component:

```js
const { avatarMeshRef, cameraRef, stateMachineRef } = useMobileAvatarContext();

// After creating mesh, camera, state machine:
avatarMeshRef.current = mesh;
cameraRef.current = camera;
stateMachineRef.current = stateMachine;
```

### 3. Add to Layout
```jsx
<MobileAvatarController isMobile={isMobile} />
```

The controller will automatically find refs from context.

## Performance Optimizations

- **Animation Loading**: Lazy loads on first mount
- **Momentum Physics**: requestAnimationFrame for smooth scrolling
- **Camera Lerp**: Efficient interpolation with easing
- **Debounced Updates**: Scroll updates debounced slightly
- **Minimal Re-renders**: useCallback and refs prevent unnecessary renders

## Styling

All components use SKRTLIFE design system:

- Glassmorphism (blur + transparency)
- Dark mode default
- Cyan/purple accent colors
- Smooth easing animations
- Responsive to mobile

Colors can be customized in component className strings.

## Browser Support

- Chrome/Edge 88+
- Safari 14+
- Firefox 87+
- Mobile: iOS Safari 14+, Chrome Android

## Troubleshooting

### Animations not loading?
1. Check if avatar mesh has `.animations` array populated
2. Verify state machine has `animationRegistry` or `playAnimation` method
3. Check window.__animationLibrary or window.__rpmAnimations for library

### Camera not moving?
1. Ensure cameraRef.current is valid Three.js camera
2. Check camera has working `.position` and `.rotation`
3. Verify viewport is calling setFocus/updateProjectionMatrix after changes

### Picker wheel not scrolling?
1. Check touch events are not being blocked
2. Verify animations array is not empty
3. Clear browser cache (CSS issues sometimes persist)

## Future Enhancements

- [ ] Gesture-based camera control (pinch zoom, drag rotate)
- [ ] Animation preview blending (show multiple animations simultaneously)
- [ ] Custom animation recording
- [ ] Share animation sequences
- [ ] Animation favorites/bookmarks