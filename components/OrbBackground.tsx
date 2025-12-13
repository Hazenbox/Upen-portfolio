/**
 * OrbBackground - A reusable shader-based animated orb component
 * 
 * Creates a premium, organic-looking animated orb using WebGL fragment shaders.
 * Features:
 * - Soft volumetric gradient with organic distortion
 * - Simplex noise-based morphing (not mechanical looping)
 * - Theme-aware color system
 * - Configurable size, speed, intensity, and noise parameters
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <OrbBackground
 *   primaryColor={[0.22, 0.74, 0.97]}
 *   secondaryColor={[0.96, 0.45, 0.71]}
 *   backgroundColor={[0.02, 0.05, 0.15]}
 *   size={0.5}
 *   speed={0.1}
 * />
 * 
 * // With theme colors
 * const colors = useThemeColors();
 * <OrbBackground
 *   primaryColor={colors.accent}
 *   secondaryColor={colors.muted}
 *   backgroundColor={colors.page}
 * />
 * ```
 */

import React, { useRef, useEffect } from 'react';

// Simplex noise implementation for GLSL (simplified version)
const SIMPLEX_NOISE_GLSL = `
  // Simplex noise implementation
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const VERTEX_SHADER = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const createFragmentShader = (
  primaryColor: [number, number, number],
  secondaryColor: [number, number, number],
  backgroundColor: [number, number, number]
) => `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_intensity;
  uniform float u_speed;
  uniform vec2 u_resolution;
  uniform vec2 u_center;
  uniform float u_size;
  uniform float u_noiseScale;
  uniform float u_noiseAmount;
  uniform vec2 u_mouse; // Normalized mouse position (0-1)

  ${SIMPLEX_NOISE_GLSL}

  // Equirectangular UV mapping for sphere (from Three.js common.glsl.js)
  vec2 equirectUv(vec3 dir) {
    vec2 uv = vec2(atan(dir.z, dir.x), asin(dir.y));
    uv *= vec2(0.1591, 0.3183); // 1 / (2 * PI), 1 / PI
    uv += 0.5;
    return uv;
  }

  // Raymarching function - inspired by maxro.me technique
  vec3 marchMarble(vec3 rayOrigin, vec3 rayDir, float iterations, float depth, float smoothing) {
    float perIteration = 1.0 / iterations;
    vec3 deltaRay = rayDir * perIteration * depth;
    
    vec3 p = rayOrigin;
    float totalVolume = 0.0;
    
    // Dual-scrolling noise for displacement (maxro.me technique)
    float scrollSpeed = u_time * u_speed * 0.5;
    vec2 scrollX = vec2(scrollSpeed, 0.0);
    vec2 flipY = vec2(1.0, -1.0);
    
    for (int i = 0; i < 32; i++) {
      if (float(i) >= iterations) break;
      
      // Get equirectangular UV from current position
      vec2 uv = equirectUv(normalize(p));
      
      // Dual noise displacement (scrolled in opposite directions)
      vec3 noiseCoordA = vec3(uv * u_noiseScale + scrollX, u_time * u_speed * 0.3);
      vec3 noiseCoordB = vec3(uv * u_noiseScale * flipY - scrollX, u_time * u_speed * 0.25);
      
      vec3 displacementA = vec3(
        snoise(noiseCoordA),
        snoise(noiseCoordA + vec3(100.0)),
        snoise(noiseCoordA + vec3(200.0))
      );
      vec3 displacementB = vec3(
        snoise(noiseCoordB),
        snoise(noiseCoordB + vec3(100.0)),
        snoise(noiseCoordB + vec3(200.0))
      );
      
      // Center and combine displacements
      displacementA = (displacementA - 0.5) * u_noiseAmount;
      displacementB = (displacementB - 0.5) * u_noiseAmount;
      vec3 displaced = p + displacementA + displacementB;
      
      // Sample heightmap using noise as height
      vec2 displacedUV = equirectUv(normalize(displaced));
      float heightMapVal = snoise(vec3(displacedUV * 3.0, u_time * u_speed * 0.2));
      heightMapVal = heightMapVal * 0.5 + 0.5; // Normalize to 0-1
      
      // Take a slice of the heightmap
      float height = length(p); // Distance from center (1 at surface, 0 at core)
      float cutoff = 1.0 - float(i) * perIteration;
      float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);
      
      // Accumulate volume
      totalVolume += slice * perIteration;
      
      // Advance ray
      p += deltaRay;
      
      // Early exit if we've accumulated enough volume
      if (totalVolume > 0.95) break;
    }
    
    return vec3(totalVolume);
  }

  void main() {
    // Normalized coordinates centered at orb center
    vec2 uv = (vUv - u_center) * u_resolution / min(u_resolution.x, u_resolution.y);
    
    // Radial distance from center
    float d = length(uv);
    
    // Calculate 3D sphere geometry (for proper lighting)
    float r = d;
    if (r > 1.0) discard;
    
    // Calculate Z for perfect sphere normal
    float z = sqrt(1.0 - r * r);
    vec3 normal = normalize(vec3(uv.x, uv.y, z));
    vec3 spherePoint = normal; // Point on sphere surface
    
    // Cursor parallax - rotate sphere based on mouse position
    vec2 mouseOffset = (u_mouse - 0.5) * 0.3;
    vec3 rotatedNormal = normal;
    vec3 rotatedPoint = spherePoint;
    if (length(mouseOffset) > 0.0) {
      float rotX = mouseOffset.y * 0.5;
      float rotY = mouseOffset.x * 0.5;
      float cosX = cos(rotX);
      float sinX = sin(rotX);
      float cosY = cos(rotY);
      float sinY = sin(rotY);
      rotatedNormal = vec3(
        normal.x * cosY - normal.z * sinY,
        normal.y * cosX + (normal.x * sinY + normal.z * cosY) * sinX,
        (normal.x * sinY + normal.z * cosY) * cosX - normal.y * sinX
      );
      rotatedPoint = rotatedNormal;
    }
    
    // === RAYMARCHING (maxro.me technique) ===
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 rayOrigin = rotatedPoint; // Start at sphere surface
    vec3 rayDir = -viewDir; // Ray points towards center
    
    // Raymarch through volume
    float iterations = 24.0;
    float depth = 0.8;
    float smoothing = 0.15;
    vec3 volumeResult = marchMarble(rayOrigin, rayDir, iterations, depth, smoothing);
    float totalVolume = volumeResult.x;
    
    // Create orb mask from volume
    float innerRadius = u_size * 0.3;
    float outerRadius = u_size * 0.5;
    float orbMask = smoothstep(outerRadius, innerRadius, d);
    orbMask *= totalVolume; // Multiply by raymarched volume
    orbMask = pow(orbMask, 1.1);
    
    // === 3D LIGHTING ===
    // Main light from top-left
    vec3 lightDir = normalize(vec3(-0.5, 0.8, 0.6));
    float diff = max(dot(rotatedNormal, lightDir), 0.0);
    
    // Fresnel (rim light) - stronger at edges
    float fresnel = pow(1.0 - dot(rotatedNormal, viewDir), 2.0);
    
    // Specular highlight - glossy reflection
    vec3 reflectDir = reflect(-lightDir, rotatedNormal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 80.0);
    
    // Secondary light from bottom-right (warm fill)
    vec3 lightDir2 = normalize(vec3(0.4, -0.5, 0.3));
    float diff2 = max(dot(rotatedNormal, lightDir2), 0.0) * 0.4;
    
    // === VIBRANT MULTI-COLOR COMPOSITION ===
    vec3 colPrimary = vec3(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]});
    vec3 colSecondary = vec3(${secondaryColor[0]}, ${secondaryColor[1]}, ${secondaryColor[2]});
    
    // Base milky white/cream translucent shell (lighter for better color mixing)
    vec3 colShell = vec3(0.95, 0.94, 0.92);
    
    // Get sphere UV coordinates for color placement
    vec2 sphereUV = equirectUv(rotatedPoint);
    
    // === VIBRANT COLOR PALETTE ===
    // Lime-green (top-left)
    vec3 colGreen = vec3(0.2, 1.0, 0.4);
    // Vibrant cyan (top-center)
    vec3 colCyan = vec3(0.0, 0.9, 1.0);
    // Electric blue (top-right)
    vec3 colBlue = vec3(0.1, 0.5, 1.0);
    // Royal purple (mid-right)
    vec3 colPurple = vec3(0.7, 0.2, 1.0);
    // Hot pink (bottom-right)
    vec3 colPink = vec3(1.0, 0.2, 0.8);
    // Burnt orange (bottom-left)
    vec3 colOrange = vec3(1.0, 0.4, 0.1);
    // Bright yellow (mid-left)
    vec3 colYellow = vec3(1.0, 0.9, 0.2);
    // Magenta (center)
    vec3 colMagenta = vec3(1.0, 0.3, 0.6);
    
    // === COLOR MASK GENERATION ===
    // Use multiple noise layers for organic color distribution
    float colorNoise1 = snoise(vec3(sphereUV * 2.5, u_time * u_speed * 0.3));
    float colorNoise2 = snoise(vec3(sphereUV * 3.5 + vec2(50.0), u_time * u_speed * 0.25));
    float colorNoise = (colorNoise1 + colorNoise2 * 0.6) * 0.5;
    
    // Green (top-left region)
    float greenMask = smoothstep(0.65, 0.15, length(sphereUV - vec2(0.2, 0.8)));
    greenMask += colorNoise * 0.2;
    greenMask *= max(0.0, dot(rotatedNormal, normalize(vec3(-0.4, 0.5, 0.3))));
    
    // Cyan (top-center)
    float cyanMask = smoothstep(0.6, 0.12, length(sphereUV - vec2(0.5, 0.85)));
    cyanMask += colorNoise * 0.18;
    cyanMask *= max(0.0, dot(rotatedNormal, normalize(vec3(0.0, 0.6, 0.4))));
    
    // Blue (top-right)
    float blueMask = smoothstep(0.65, 0.15, length(sphereUV - vec2(0.8, 0.75)));
    blueMask += colorNoise * 0.2;
    blueMask *= max(0.0, dot(rotatedNormal, normalize(vec3(0.5, 0.4, 0.3))));
    
    // Purple (mid-right)
    float purpleMask = smoothstep(0.6, 0.12, length(sphereUV - vec2(0.85, 0.5)));
    purpleMask += colorNoise * 0.18;
    purpleMask *= max(0.0, dot(rotatedNormal, normalize(vec3(0.5, 0.0, 0.4))));
    
    // Pink (bottom-right)
    float pinkMask = smoothstep(0.65, 0.15, length(sphereUV - vec2(0.75, 0.2)));
    pinkMask += colorNoise * 0.2;
    pinkMask *= max(0.0, dot(rotatedNormal, normalize(vec3(0.4, -0.5, 0.3))));
    
    // Orange (bottom-left)
    float orangeMask = smoothstep(0.65, 0.15, length(sphereUV - vec2(0.2, 0.2)));
    orangeMask += colorNoise * 0.2;
    orangeMask *= max(0.0, dot(rotatedNormal, normalize(vec3(-0.4, -0.5, 0.3))));
    
    // Yellow (mid-left)
    float yellowMask = smoothstep(0.6, 0.12, length(sphereUV - vec2(0.15, 0.5)));
    yellowMask += colorNoise * 0.18;
    yellowMask *= max(0.0, dot(rotatedNormal, normalize(vec3(-0.5, 0.0, 0.4))));
    
    // Magenta (center region)
    float magentaMask = smoothstep(0.55, 0.1, length(sphereUV - vec2(0.5, 0.5)));
    magentaMask += colorNoise * 0.15;
    magentaMask *= 0.7; // Softer center
    
    // === COLOR MIXING (additive blending for vibrancy) ===
    vec3 colInternal = colShell;
    
    // Mix colors with higher saturation and stronger blending
    float volumeBoost = pow(totalVolume, 0.6);
    
    // Add colors with additive mixing for vibrancy
    colInternal = mix(colInternal, colGreen, clamp(greenMask * volumeBoost, 0.0, 0.75));
    colInternal = mix(colInternal, colCyan, clamp(cyanMask * volumeBoost, 0.0, 0.7));
    colInternal = mix(colInternal, colBlue, clamp(blueMask * volumeBoost, 0.0, 0.75));
    colInternal = mix(colInternal, colPurple, clamp(purpleMask * volumeBoost, 0.0, 0.7));
    colInternal = mix(colInternal, colPink, clamp(pinkMask * volumeBoost, 0.0, 0.75));
    colInternal = mix(colInternal, colOrange, clamp(orangeMask * volumeBoost, 0.0, 0.75));
    colInternal = mix(colInternal, colYellow, clamp(yellowMask * volumeBoost, 0.0, 0.7));
    colInternal = mix(colInternal, colMagenta, clamp(magentaMask * volumeBoost, 0.0, 0.65));
    
    // Add theme colors as additional layers
    float themeMix = pow(totalVolume, 0.8);
    colInternal = mix(colInternal, colPrimary, themeMix * 0.3);
    colInternal = mix(colInternal, colSecondary, themeMix * 0.25);
    
    // Boost saturation for more vibrant look
    float luminance = dot(colInternal, vec3(0.299, 0.587, 0.114));
    colInternal = mix(vec3(luminance), colInternal, 1.4); // Increase saturation
    
    // Add color bleeding between regions for smooth transitions
    float colorFlow = snoise(vec3(sphereUV * 1.5, u_time * u_speed * 0.4));
    colInternal += colorFlow * 0.1 * colInternal;
    
    // Volumetric depth - darker towards edges and bottom
    float depthFactor = 1.0 - (r * 0.2) - (max(0.0, -rotatedNormal.y) * 0.12);
    colInternal *= depthFactor;
    
    // Brighten core slightly for more depth
    float coreBrightness = smoothstep(0.4, 0.0, r);
    colInternal += colInternal * coreBrightness * 0.15;
    
    // === ENHANCED LIGHTING FOR VIBRANT COLORS ===
    vec3 col = colInternal;
    
    // Enhanced diffuse lighting (brings out colors)
    col += colInternal * diff * 0.6;
    col += colInternal * diff2 * 1.2;
    
    // Colorful rim light (tinted with colors)
    vec3 rimTint = mix(colInternal, vec3(1.0), 0.3);
    col += rimTint * fresnel * 0.4;
    
    // Enhanced specular highlight (white for contrast)
    col += vec3(1.0) * spec * 0.8;
    
    // Additional color boost from lighting
    float lightBoost = (diff + diff2) * 0.3;
    col += colInternal * lightBoost;
    
    // Intensity-based pulsing with multiple colors (when loading/thinking)
    if (u_intensity > 0.0) {
      float pulse = sin(u_time * u_speed * 3.0) * 0.5 + 0.5;
      float pulse2 = sin(u_time * u_speed * 2.5 + 1.5) * 0.5 + 0.5;
      
      // Pulse with multiple vibrant colors
      col += colPrimary * pulse * u_intensity * 0.3;
      col += colSecondary * (1.0 - pulse) * u_intensity * 0.25;
      col += colCyan * pulse2 * u_intensity * 0.2;
      col += colPink * (1.0 - pulse2) * u_intensity * 0.2;
    }
    
    // Final color saturation boost
    float finalLuminance = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(finalLuminance), col, 1.3);
    
    // Background color
    vec3 colBg = vec3(${backgroundColor[0]}, ${backgroundColor[1]}, ${backgroundColor[2]});
    
    // === GLASSY SPHERICAL LAYER ===
    // Glass fresnel - more reflective at edges
    float glassFresnel = pow(1.0 - dot(rotatedNormal, viewDir), 1.5);
    
    // Fake environment reflection (sky gradient)
    vec3 envColor = vec3(0.7, 0.8, 0.95); // Sky blue tint
    vec3 envReflection = mix(
      envColor,
      vec3(0.9, 0.95, 1.0), // Brighter at top
      (rotatedNormal.y + 1.0) * 0.5
    );
    
    // Additional specular reflections for glass
    vec3 glassReflection = reflect(-viewDir, rotatedNormal);
    float glassSpec = pow(max(dot(glassReflection, lightDir), 0.0), 120.0);
    float glassSpec2 = pow(max(dot(glassReflection, normalize(vec3(0.3, 0.5, 1.0))), 0.0), 200.0);
    
    // Caustics - light patterns through glass
    float caustic = sin((uv.x + uv.y) * 8.0 + u_time * u_speed * 2.0) * 0.5 + 0.5;
    caustic *= sin((uv.x - uv.y) * 6.0 + u_time * u_speed * 1.5) * 0.5 + 0.5;
    caustic = pow(caustic, 3.0);
    
    // Glass layer composition
    vec3 glassLayer = vec3(0.0);
    
    // Reflected environment
    glassLayer += envReflection * glassFresnel * 0.45;
    
    // Sharp specular highlights
    glassLayer += vec3(1.0) * glassSpec * 0.85;
    glassLayer += vec3(1.0) * glassSpec2 * 0.55;
    
    // Caustics (subtle)
    glassLayer += vec3(1.0, 1.0, 0.95) * caustic * 0.18 * (1.0 - r);
    
    // Chromatic aberration on glass edges (subtle)
    float chroma = fresnel * 0.02;
    vec3 glassChroma = vec3(
      glassLayer.r + chroma,
      glassLayer.g,
      glassLayer.b - chroma
    );
    glassLayer = mix(glassLayer, glassChroma, fresnel * 0.3);
    
    // Composite: Internal orb + Glass layer
    // Glass is more visible at edges (fresnel) and where there are highlights
    float glassStrength = glassFresnel * 0.65 + glassSpec * 0.85 + glassSpec2 * 0.55;
    glassStrength = clamp(glassStrength, 0.0, 1.0);
    
    // Mix internal color with background
    vec3 baseColor = mix(colBg, col, orbMask);
    
    // Add glass layer on top
    vec3 finalColor = mix(baseColor, glassLayer, glassStrength * 0.75);
    
    // Add glass highlights on top
    finalColor += glassLayer * (glassSpec + glassSpec2) * 0.5;
    
    // Soft alpha falloff
    float alpha = smoothstep(outerRadius * 1.15, outerRadius * 0.85, d);
    alpha *= totalVolume; // Fade based on volume
    alpha = pow(alpha, 0.8);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export interface OrbBackgroundProps {
  /** Primary color of the orb (RGB 0-1) */
  primaryColor?: [number, number, number];
  /** Secondary color for gradient (RGB 0-1) */
  secondaryColor?: [number, number, number];
  /** Background color (RGB 0-1) */
  backgroundColor?: [number, number, number];
  /** Size of the orb (0-1, relative to canvas) */
  size?: number;
  /** Intensity for pulsing effect (0-1) */
  intensity?: number;
  /** Animation speed multiplier */
  speed?: number;
  /** Noise scale for distortion */
  noiseScale?: number;
  /** Amount of noise distortion */
  noiseAmount?: number;
  /** Center position (0-1) */
  center?: [number, number];
  /** Enable cursor parallax interaction */
  interactive?: boolean;
  /** CSS className for container */
  className?: string;
  /** Inline styles for container */
  style?: React.CSSProperties;
}

const OrbBackground: React.FC<OrbBackgroundProps> = ({
  primaryColor = [0.22, 0.74, 0.97], // Sky blue
  secondaryColor = [0.96, 0.45, 0.71], // Pink
  backgroundColor = [0.02, 0.05, 0.15], // Deep indigo
  size = 0.4,
  intensity = 0.0,
  speed = 0.1,
  noiseScale = 3.0,
  noiseAmount = 0.08,
  center = [0.5, 0.5],
  interactive = true,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const programRef = useRef<WebGLProgram | null>(null);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    // Compile shaders
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragSource = createFragmentShader(primaryColor, secondaryColor, backgroundColor);
    const frag = createShader(gl.FRAGMENT_SHADER, fragSource);
    
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    
    programRef.current = program;

    // Setup geometry
    const positionLocation = gl.getAttribLocation(program, 'position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const intensityLoc = gl.getUniformLocation(program, 'u_intensity');
    const speedLoc = gl.getUniformLocation(program, 'u_speed');
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const centerLoc = gl.getUniformLocation(program, 'u_center');
    const sizeLoc = gl.getUniformLocation(program, 'u_size');
    const noiseScaleLoc = gl.getUniformLocation(program, 'u_noiseScale');
    const noiseAmountLoc = gl.getUniformLocation(program, 'u_noiseAmount');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    // Render loop
    const render = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      const pixelRatio = Math.min(window.devicePixelRatio, 2);

      if (
        canvas.width !== displayWidth * pixelRatio ||
        canvas.height !== displayHeight * pixelRatio
      ) {
        canvas.width = displayWidth * pixelRatio;
        canvas.height = displayHeight * pixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      timeRef.current += 0.01;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform1f(timeLoc, timeRef.current);
      gl.uniform1f(intensityLoc, intensity);
      gl.uniform1f(speedLoc, speed);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform2f(centerLoc, center[0], center[1]);
      gl.uniform1f(sizeLoc, size);
      gl.uniform1f(noiseScaleLoc, noiseScale);
      gl.uniform1f(noiseAmountLoc, noiseAmount);
      gl.uniform2f(mouseLoc, mouseRef.current[0], mouseRef.current[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    // Mouse tracking for parallax
    let isMouseOver = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      // Smooth interpolation
      mouseRef.current[0] += (x - mouseRef.current[0]) * 0.15;
      mouseRef.current[1] += (y - mouseRef.current[1]) * 0.15;
      isMouseOver = true;
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
    };

    // Smooth return to center when mouse leaves
    const returnToCenter = () => {
      if (!isMouseOver) {
        mouseRef.current[0] += (0.5 - mouseRef.current[0]) * 0.05;
        mouseRef.current[1] += (0.5 - mouseRef.current[1]) * 0.05;
      }
    };

    const centerInterval = setInterval(returnToCenter, 16); // ~60fps

    if (interactive && containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(centerInterval);
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
      if (containerRef.current && interactive) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [primaryColor, secondaryColor, backgroundColor, size, intensity, speed, noiseScale, noiseAmount, center, interactive]);

  return (
    <div ref={containerRef} className={className} style={style}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default OrbBackground;
