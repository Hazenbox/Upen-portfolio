# Orb Transition Animation Specifications

## Overview
Detailed specifications for the orb animation transition from FAB (Floating Action Button) position to panel anchor position.

---

## Animation Properties

### 1. **Duration**
- **Total Duration**: `400ms` (0.4 seconds)
- **Applied To**: All transform properties (x, y, scale)
- **Location**: `utils/chatAnimations.ts` → `MOTION.duration.orb`

### 2. **Easing Function**
- **Type**: Cubic Bezier
- **Values**: `[0.4, 0, 0.2, 1]`
- **CSS Equivalent**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Characteristic**: Smooth ease-out curve (Material Design standard)
- **Behavior**: 
  - Starts quickly
  - Decelerates smoothly
  - No bounce or overshoot
  - Clean, linear deceleration
- **Location**: `utils/chatAnimations.ts` → `MOTION.easing.movement`

### 3. **Transform Properties**

#### **Position (X-axis)**
- **Property**: `translateX`
- **Duration**: `400ms` (0.4s)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Calculation**: `deltaX = panelAnchorPosition.x - fabPosition.x`
- **Start Value**: `0px` (relative to FAB position)
- **End Value**: `deltaX` (relative to FAB position)

#### **Position (Y-axis)**
- **Property**: `translateY`
- **Duration**: `400ms` (0.4s)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Calculation**: `deltaY = panelAnchorPosition.y - fabPosition.y`
- **Start Value**: `0px` (relative to FAB position)
- **End Value**: `deltaY` (relative to FAB position)

#### **Scale**
- **Property**: `scale`
- **Duration**: `400ms` (0.4s)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Start Value**: `1.0` (100% - FAB state)
- **End Value**: `0.91` (91% - docked in panel)
- **Scale Ratio**: `64px / 70px = 0.914...` (rounded to 0.91)
- **Location**: `utils/chatAnimations.ts` → `MOTION.scale.orbDocked`

#### **Opacity**
- **Property**: `opacity`
- **Duration**: `200ms` (0.2s)
- **Easing**: `ease-out` (CSS keyword)
- **Start Value**: `1` (fully visible)
- **End Value**: `1` (fully visible) - only changes on visibility state transitions

### 4. **Transform Origin**
- **Value**: `center center`
- **Purpose**: Ensures scaling and rotation happen from the center of the orb

### 5. **Base Positioning**
- **Position Type**: `fixed`
- **X Position**: `fabPosition.x` (absolute pixel value)
- **Y Position**: `fabPosition.y` (absolute pixel value)
- **Transform Applied**: `translate(x, y)` relative to base position

---

## Animation States

### **State: 'fab' (Floating Action Button)**
```javascript
{
  x: 0,
  y: 0,
  scale: 1.0,
  opacity: 1
}
```

### **State: 'opening' (Transitioning to Panel)**
```javascript
{
  x: deltaX,      // Calculated delta from FAB to panel anchor
  y: deltaY,       // Calculated delta from FAB to panel anchor
  scale: 0.91,    // Scaled down to fit panel
  opacity: 1
}
```

### **State: 'open' (Docked in Panel)**
```javascript
{
  x: deltaX,      // Same as opening state
  y: deltaY,       // Same as opening state
  scale: 0.91,    // Maintained scaled size
  opacity: 1
}
```

### **State: 'closing' (Returning to FAB)**
```javascript
{
  x: 0,
  y: 0,
  scale: 1.0,
  opacity: 1
}
```

---

## Performance Optimizations

### **Hardware Acceleration**
- **will-change**: `transform` (only during animation states: 'opening' or 'closing')
- **will-change**: `auto` (when not animating)
- **Purpose**: Enables GPU acceleration for smoother rendering

### **Backface Visibility**
- **backfaceVisibility**: `hidden`
- **WebkitBackfaceVisibility**: `hidden`
- **Purpose**: Prevents rendering of back face during 3D transforms, improves performance

### **Position Calculation Stability**
- **Method**: `useLayoutEffect` for position calculations
- **Timing**: Positions calculated before paint
- **Protection**: Animation lock prevents position updates during active animation
- **Purpose**: Eliminates jerky motion from mid-animation position updates

---

## Easing Curve Details

### **Cubic Bezier: [0.4, 0, 0.2, 1]**

This is the Material Design standard easing curve for "standard" animations.

**Visual Characteristics:**
- **0-40%**: Fast acceleration (starts quickly)
- **40-100%**: Smooth deceleration (slows down gracefully)
- **No overshoot**: Curve never exceeds the end value
- **No bounce**: Clean, linear deceleration

**Mathematical Properties:**
- Control Point 1: `(0.4, 0)` - Controls initial acceleration
- Control Point 2: `(0.2, 1)` - Controls deceleration curve
- Result: Natural, organic-feeling motion

**Comparison to Other Easing:**
- Faster than `ease-in-out`
- More natural than `linear`
- No bounce unlike spring animations
- Smoother than `ease-out` (CSS keyword)

---

## Animation Timing Breakdown

### **Opening Animation (FAB → Panel)**
```
Time    | X Position | Y Position | Scale  | Opacity
--------|------------|------------|--------|--------
0ms     | 0          | 0          | 1.0    | 1
100ms   | ~25% delta | ~25% delta | ~0.98  | 1
200ms   | ~60% delta | ~60% delta | ~0.95  | 1
300ms   | ~85% delta | ~85% delta | ~0.93  | 1
400ms   | 100% delta | 100% delta | 0.91   | 1
```

### **Closing Animation (Panel → FAB)**
```
Time    | X Position | Y Position | Scale  | Opacity
--------|------------|------------|--------|--------
0ms     | 100% delta | 100% delta | 0.91   | 1
100ms   | ~75% delta | ~75% delta | ~0.93  | 1
200ms   | ~40% delta | ~40% delta | ~0.95  | 1
300ms   | ~15% delta | ~15% delta | ~0.98  | 1
400ms   | 0          | 0          | 1.0    | 1
```

*Note: Exact values depend on the cubic-bezier curve calculation*

---

## Accessibility

### **Reduced Motion Support**
- **Detection**: `prefers-reduced-motion` media query
- **Behavior**: When enabled, all animations have `duration: 0`
- **Implementation**: `prefersReducedMotion()` function in `chatAnimations.ts`

---

## Technical Implementation

### **Library**
- **Framework**: Framer Motion
- **Component**: `motion.div`
- **Animation Method**: Declarative `animate` prop with `transition` configuration

### **Code Location**
- **Component**: `components/AIChatWidget.tsx` (lines 222-259)
- **Constants**: `utils/chatAnimations.ts`
- **Transform Calculation**: `components/AIChatWidget.tsx` (lines 183-216)

### **Key Code Snippet**
```typescript
transition={{
  x: { 
    duration: MOTION.duration.orb / 1000,  // 0.4s
    ease: MOTION.easing.movement            // [0.4, 0, 0.2, 1]
  },
  y: { 
    duration: MOTION.duration.orb / 1000,  // 0.4s
    ease: MOTION.easing.movement            // [0.4, 0, 0.2, 1]
  },
  scale: { 
    duration: MOTION.duration.orb / 1000,  // 0.4s
    ease: MOTION.easing.movement            // [0.4, 0, 0.2, 1]
  },
  opacity: { 
    duration: 0.2, 
    ease: "easeOut" 
  }
}}
```

---

## Summary

**Animation Type**: Smooth, bounce-free cubic-bezier easing  
**Duration**: 400ms (0.4 seconds)  
**Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design standard)  
**Properties Animated**: `translateX`, `translateY`, `scale`, `opacity`  
**Performance**: Hardware-accelerated with `will-change: transform`  
**Result**: Clean, quick, professional motion without any bouncing or overshoot

