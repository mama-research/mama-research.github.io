/**
 * ADVANCED CUSTOMIZATION & MODIFICATION GUIDE
 * For developers who want to extend or deeply customize the perfusion animation
 */

// ============================================================================
// PART 1: CUSTOM VECTOR FIELD GENERATION
// ============================================================================

/**
 * Create a domain-specific vector field tailored to your use case
 * Example: Spiraling flow for specific medical imaging effect
 */

class SpiralVectorField {
  /**
   * Generates vectors that spiral around a central axis
   * Creates vortex-like flow patterns
   */
  static getSampleFunction(centerX = 0, centerY = 0, spiralTightness = 0.1) {
    return (x, y, z, time) => {
      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Angle around center
      let angle = Math.atan2(dy, dx);

      // Spiral: angle changes with distance
      angle += dist * spiralTightness + time * 0.01;

      // Radial and tangential components
      const radial = Math.cos(angle);
      const tangential = Math.sin(angle);

      return {
        x: radial * Math.cos(angle) - tangential * Math.sin(angle),
        y: radial * Math.sin(angle) + tangential * Math.cos(angle),
        z: Math.sin(z * 0.1 + time * 0.001)
      };
    };
  }
}

/**
 * Laminar Flow Pattern (like fluid flowing through a tube)
 */
class LaminarFlowField {
  static getSampleFunction(flowDirection = { x: 1, y: 0, z: 0 }, profile = 'parabolic') {
    return (x, y, z, time) => {
      if (profile === 'parabolic') {
        // Parabolic velocity profile - faster in center, slower at edges
        const radius = Math.sqrt(y * y + z * z);
        const speed = Math.max(0, 1 - radius * radius / 100);
        return {
          x: flowDirection.x * speed,
          y: flowDirection.y * 0.1 * Math.sin(time * 0.01),
          z: flowDirection.z * 0.1 * Math.cos(time * 0.01)
        };
      } else {
        // Linear profile
        return {
          x: flowDirection.x,
          y: flowDirection.y * Math.sin(x * 0.01 + time * 0.01),
          z: flowDirection.z * Math.cos(x * 0.01 + time * 0.01)
        };
      }
    };
  }
}

/**
 * Chaotic/Turbulent Field (like real turbulence)
 */
class TurbulentField {
  static getSampleFunction(chaosLevel = 1.0) {
    // Multiple octaves of noise for Brownian motion-like effect
    return (x, y, z, time) => {
      const octaves = 4;
      let vx = 0, vy = 0, vz = 0;
      let amplitude = 1;

      for (let i = 0; i < octaves; i++) {
        const freq = Math.pow(2, i);
        vx += Math.sin(x * freq * 0.01 + time * 0.001) * amplitude;
        vy += Math.cos(y * freq * 0.01 + time * 0.001) * amplitude;
        vz += Math.sin(z * freq * 0.01 + time * 0.001) * amplitude;
        amplitude *= 0.5;
      }

      return {
        x: vx * chaosLevel,
        y: vy * chaosLevel,
        z: vz * chaosLevel
      };
    };
  }
}

// ============================================================================
// PART 2: CUSTOM SHADER EFFECTS
// ============================================================================

/**
 * Advanced Fragment Shader with Multipass Rendering
 * Creates more sophisticated visual effects
 */

const ADVANCED_FRAGMENT_SHADER = `
  #define M_PI 3.1415926535897932384626433832795
  
  uniform sampler2D texture;
  uniform float glowIntensity;
  uniform float time;
  uniform vec2 resolution;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Chromatic aberration effect
  vec4 chromaticAberration(sampler2D tex, vec2 uv, float amount) {
    vec2 offset = amount * (uv - 0.5);
    vec4 r = texture2D(tex, uv + offset);
    vec4 g = texture2D(tex, uv);
    vec4 b = texture2D(tex, uv - offset);
    return vec4(r.r, g.g, b.b, (r.a + g.a + b.a) / 3.0);
  }

  // Radial blur
  vec4 radialBlur(sampler2D tex, vec2 uv, int samples, float strength) {
    vec4 color = vec4(0.0);
    for (int i = 0; i < samples; i++) {
      float angle = float(i) / float(samples) * 2.0 * M_PI;
      vec2 offset = vec2(cos(angle), sin(angle)) * strength;
      color += texture2D(tex, uv + offset);
    }
    return color / float(samples);
  }

  void main() {
    // Sample particle texture
    vec4 texColor = texture2D(texture, gl_PointCoord);

    // Apply chromatic aberration for optical realism
    vec4 chromatic = chromaticAberration(texture, gl_PointCoord, 0.02);

    // Blend effects
    vec4 finalColor = mix(texColor, chromatic, 0.3);

    // Apply color and glow
    finalColor.rgb = vColor * glowIntensity * finalColor.rgb;
    finalColor.a = vAlpha * texColor.a;

    // Add subtle time-based pulsing
    float pulse = 0.8 + 0.2 * sin(time * 0.01);
    finalColor.rgb *= pulse;

    gl_FragColor = finalColor;
  }
`;

/**
 * Vertex Shader with Position Jitter
 * Adds subtle vibration for organic feel
 */

const ADVANCED_VERTEX_SHADER = `
  attribute float size;
  attribute float age;
  
  varying vec3 vColor;
  varying float vAlpha;
  varying vec3 vPosition;

  void main() {
    vColor = color;
    vAlpha = 1.0 - (age / 300.0);
    vAlpha = clamp(vAlpha, 0.0, 1.0);

    vec3 pos = position;

    // Add subtle jitter based on particle index
    pos.x += sin(float(gl_VertexID) * 0.1) * 0.5;
    pos.y += cos(float(gl_VertexID) * 0.1) * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vPosition = mvPosition.xyz;

    // Dynamic size based on depth
    gl_PointSize = size * (300.0 / -mvPosition.z) * vAlpha;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ============================================================================
// PART 3: PARTICLE SYSTEM ENHANCEMENTS
// ============================================================================

/**
 * Particle lifetime with custom decay function
 * Creates more sophisticated particle behavior
 */

class EnhancedParticle {
  constructor(x, y, z, color, size) {
    this.position = { x, y, z };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.color = color;
    this.size = size;
    this.age = 0;
    this.maxAge = 300;
    this.mass = 1.0;
    this.friction = 0.99;
  }

  update() {
    // Apply velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;

    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;
    this.velocity.z *= this.friction;

    // Age particle
    this.age++;
  }

  getAlpha() {
    // Custom decay: smooth fade-in, sharp fade-out
    const fadeInDuration = 20;
    const fadeOutDuration = 50;

    if (this.age < fadeInDuration) {
      return this.age / fadeInDuration;
    }

    if (this.age > this.maxAge - fadeOutDuration) {
      return Math.max(0, 1 - (this.age - (this.maxAge - fadeOutDuration)) / fadeOutDuration);
    }

    return 1.0;
  }

  isDead() {
    return this.age >= this.maxAge;
  }
}

// ============================================================================
// PART 4: COLOR PALETTE GENERATOR
// ============================================================================

/**
 * Automatically generate medical imaging color palettes
 * Based on scientific imaging standards
 */

class MedicalColorPaletteGenerator {
  /**
   * Create MRI-inspired palette
   */
  static getMRIPalette() {
    return [
      0xff00ff,  // T1 - Magenta (fat saturation)
      0x00ffff,  // T2 - Cyan (fluid)
      0xff0080,  // FLAIR - Red-Magenta (bright fluid)
      0xffffff   // Bright voxels
    ];
  }

  /**
   * Create CT-inspired palette
   */
  static getCTPalette() {
    return [
      0xff6600,  // Bone window - Orange
      0xffaa00,  // Soft tissue - Yellow
      0xff00ff,  // Vascular - Magenta
      0xffffff   // Metal artifacts - White
    ];
  }

  /**
   * Create PET (positron emission tomography) palette
   * Represents metabolic activity
   */
  static getPETPalette() {
    return [
      0x0000ff,  // Low activity - Blue
      0x00ff00,  // Medium activity - Green
      0xffff00,  // High activity - Yellow
      0xff0000   // Very high activity - Red
    ];
  }

  /**
   * Create ultrasound palette
   * Grayscale with medical echogenicity
   */
  static getUltrasoundPalette() {
    return [
      0x000000,  // Anechoic (no echo)
      0x444444,  // Hypoechoic (low echo)
      0x888888,  // Isoechoic (normal)
      0xcccccc,  // Hyperechoic (high echo)
      0xffffff   // Acoustic shadow
    ];
  }

  /**
   * Thermal imaging palette
   * Cool to hot color progression
   */
  static getThermalPalette() {
    return [
      0x0000ff,  // Very cold - Dark Blue
      0x00ffff,  // Cool - Cyan
      0x00ff00,  // Neutral - Green
      0xffff00,  // Warm - Yellow
      0xff0000   // Hot - Red
    ];
  }

  /**
   * Generate interpolated palette
   */
  static interpolatePalette(startColor, endColor, steps = 5) {
    const palette = [];

    const sr = (startColor >> 16) & 255;
    const sg = (startColor >> 8) & 255;
    const sb = startColor & 255;

    const er = (endColor >> 16) & 255;
    const eg = (endColor >> 8) & 255;
    const eb = endColor & 255;

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(sr + (er - sr) * t);
      const g = Math.round(sg + (eg - sg) * t);
      const b = Math.round(sb + (eb - sb) * t);

      palette.push((r << 16) | (g << 8) | b);
    }

    return palette;
  }
}

// ============================================================================
// PART 5: PERFORMANCE MONITORING & PROFILING
// ============================================================================

/**
 * Monitor perfusion animation performance
 */

class PerfusionProfiler {
  constructor() {
    this.frameCount = 0;
    this.fps = 60;
    this.lastTime = performance.now();
    this.metrics = {
      updateTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      particleCount: 0
    };
  }

  startFrame() {
    this.frameStart = performance.now();
  }

  endFrame() {
    const frameEnd = performance.now();
    const frameDuration = frameEnd - this.frameStart;

    this.frameCount++;

    // Update FPS every second
    if (frameEnd - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = frameEnd;

      // Log performance
      console.log(`FPS: ${this.fps}, Frame time: ${frameDuration.toFixed(2)}ms`);
    }

    // Track memory if available
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
    }
  }

  getReport() {
    return {
      fps: this.fps,
      metrics: this.metrics,
      targetFPS: 60,
      performanceRating: this.fps >= 55 ? 'Excellent' : this.fps >= 40 ? 'Good' : 'Needs Optimization'
    };
  }
}

// ============================================================================
// PART 6: INTEGRATION WITH EXISTING CODE
// ============================================================================

/**
 * Extend PerfusionBackground with custom features
 */

class CustomPerfusionBackground extends PerfusionBackground {
  constructor(options = {}) {
    super(options);

    // Additional features
    this.profiler = new PerfusionProfiler();
    this.vectorFieldMode = options.vectorFieldMode || 'simplex'; // 'simplex', 'spiral', 'laminar'
    this.customShaders = options.customShaders || false;
  }

  updateParticles() {
    this.profiler.startFrame();

    // Call parent update
    super.updateParticles();

    this.profiler.endFrame();
  }

  switchVectorFieldType(mode) {
    this.vectorFieldMode = mode;
    console.log(`Switched to ${mode} vector field`);
  }

  getPerformanceReport() {
    return this.profiler.getReport();
  }

  /**
   * Export particle data for analysis
   */
  exportParticleData() {
    const data = {
      time: this.time,
      particleCount: this.config.particleCount,
      positions: Array.from(this.particlePositions).slice(0, 100), // First 100 particles
      colors: Array.from(this.particleColors).slice(0, 100),
      config: this.config
    };
    return JSON.stringify(data, null, 2);
  }
}

// ============================================================================
// PART 7: USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Create perfusion with custom vector field
 */

/*
const perfusion = new CustomPerfusionBackground({
  container: document.getElementById('perfusion-container'),
  particleCount: 8000,
  vectorFieldMode: 'spiral',
  customShaders: true
});
*/

/**
 * Example 2: Use medical palette
 */

/*
const perfusion = new PerfusionBackground({
  container: document.getElementById('perfusion-container'),
  colors: MedicalColorPaletteGenerator.getMRIPalette(),
  glowIntensity: 1.8,
  flowSpeed: 0.4
});
*/

/**
 * Example 3: Performance monitoring
 */

/*
const customPerfusion = new CustomPerfusionBackground({
  container: document.getElementById('perfusion-container')
});

// Check performance periodically
setInterval(() => {
  const report = customPerfusion.getPerformanceReport();
  console.log(`Performance: ${report.performanceRating} (${report.fps} FPS)`);
}, 5000);
*/

/**
 * Example 4: Interactive palette switching
 */

/*
document.getElementById('palette-select').addEventListener('change', (e) => {
  let colors;
  switch(e.target.value) {
    case 'mri': colors = MedicalColorPaletteGenerator.getMRIPalette(); break;
    case 'ct': colors = MedicalColorPaletteGenerator.getCTPalette(); break;
    case 'pet': colors = MedicalColorPaletteGenerator.getPETPalette(); break;
    default: colors = MedicalColorPaletteGenerator.getUltrasoundPalette();
  }
  perfusion.setColors(colors);
});
*/

// ============================================================================
// EXPORT FOR USE IN OTHER MODULES (if using bundler)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SpiralVectorField,
    LaminarFlowField,
    TurbulentField,
    EnhancedParticle,
    MedicalColorPaletteGenerator,
    PerfusionProfiler,
    CustomPerfusionBackground,
    ADVANCED_FRAGMENT_SHADER,
    ADVANCED_VERTEX_SHADER
  };
}
