/**
 * Perfusion Flow Animation - Medical Imaging Inspired Background
 * Uses Three.js with WebGL for smooth, performance-friendly particle flow
 * 
 * TUNING PARAMETERS (see PerfusionBackground class):
 * - particleCount: Number of particles (default: 8000, reduce for older devices)
 * - flowSpeed: Movement speed (0.1-2.0, default: 0.5)
 * - particleSize: Glow particle size (default: 2.5)
 * - colors: Array of particle colors (magenta, cyan, white by default)
 * - density: Particle emission/density (0.0-1.0, default: 0.7)
 * - turbulence: Vector field chaos (0.0-2.0, default: 1.2)
 * - glowIntensity: Bloom/glow strength (0.0-2.0, default: 1.5)
 */

class SimplexNoise {
  /**
   * Simple Perlin-like noise implementation for smooth flow fields
   * Based on Simplex noise principles but simplified for performance
   */
  constructor(seed = 0) {
    this.seed = seed;
    this.permutation = this.generatePermutation(seed);
    this.p = [...this.permutation, ...this.permutation];
  }

  generatePermutation(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    // Shuffle with seeded random
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.seededRandom(seed + i) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
  }

  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z = 0) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const aa = this.p[this.p[xi] + yi];
    const ab = this.p[this.p[xi] + yi + 1];
    const ba = this.p[this.p[xi + 1] + yi];
    const bb = this.p[this.p[xi + 1] + yi + 1];

    const aaa = this.p[aa + zi];
    const aab = this.p[aa + zi + 1];
    const aba = this.p[ab + zi];
    const abb = this.p[ab + zi + 1];
    const baa = this.p[ba + zi];
    const bab = this.p[ba + zi + 1];
    const bba = this.p[bb + zi];
    const bbb = this.p[bb + zi + 1];

    let x1 = this.lerp(u, this.grad(aaa, xf, yf, zf), this.grad(baa, xf - 1, yf, zf));
    let x2 = this.lerp(u, this.grad(aba, xf, yf - 1, zf), this.grad(bba, xf - 1, yf - 1, zf));
    let y1 = this.lerp(v, x1, x2);

    x1 = this.lerp(u, this.grad(aab, xf, yf, zf - 1), this.grad(bab, xf - 1, yf, zf - 1));
    x2 = this.lerp(u, this.grad(abb, xf, yf - 1, zf - 1), this.grad(bbb, xf - 1, yf - 1, zf - 1));
    let y2 = this.lerp(v, x1, x2);

    return this.lerp(w, y1, y2);
  }
}

class PerfusionBackground {
  constructor(options = {}) {
    // Configuration - adjust these for different effects
    this.config = {
      particleCount: options.particleCount || 8000,
      flowSpeed: options.flowSpeed || 0.5,
      particleSize: options.particleSize || 2.5,
      colors: options.colors || [
        0xff00ff,  // Magenta - primary flow color
        0x00ffff,  // Cyan - contrast agent
        0xffffff,  // White - bright highlights
      ],
      density: options.density || 0.7,           // 0-1, affects particle birth rate
      turbulence: options.turbulence || 1.2,    // 0-2, higher = more chaotic
      glowIntensity: options.glowIntensity || 1.5, // 0-2, bloom strength
      backgroundColor: options.backgroundColor || 0x0a0e27, // Deep navy
      audioReactivity: options.audioReactivity || false, // Enable for audio sync
    };

    this.container = options.container || document.body;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.particles = [];
    this.particleGeometry = null;
    this.particlePositions = null;
    this.particleColors = null;
    this.particleMesh = null;
    this.noise = new SimplexNoise();
    this.time = 0;
    this.audioFrequency = 1.0;

    this.setupScene();
    this.createParticleSystem();
    this.addEventListeners();
    this.animate();
  }

  setupScene() {
    // Three.js scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      10000
    );
    this.camera.position.z = 100;

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap DPI for performance
    this.renderer.setClearColor(this.config.backgroundColor, 1.0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Position renderer to fill container
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.domElement.style.zIndex = '-1';

    this.container.appendChild(this.renderer.domElement);

    // Add glow/bloom effect
    this.setupPostProcessing();
  }

  setupPostProcessing() {
    /**
     * Simple bloom effect for medical imaging feel
     * Uses additive blending instead of heavy post-processing for performance
     */
    // For simplicity, we'll use additive blending in the material itself
    // A full bloom pass would require EffectComposer, which we're avoiding
  }

  createParticleSystem() {
    /**
     * Create particle geometry and material
     * Uses BufferGeometry for optimal performance
     */
    const geometry = new THREE.BufferGeometry();

    // Pre-allocate position and color arrays
    const positions = new Float32Array(this.config.particleCount * 3);
    const colors = new Float32Array(this.config.particleCount * 3);
    const sizes = new Float32Array(this.config.particleCount);

    // Initialize particles
    for (let i = 0; i < this.config.particleCount; i++) {
      this.resetParticle(i, positions, colors, sizes);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Store references for updates
    this.particlePositions = positions;
    this.particleColors = colors;
    this.particleSizes = sizes;
    this.geometry = geometry;

    // Create custom shader material
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        glowIntensity: { value: this.config.glowIntensity }
      },
      vertexShader: this.getVertexShader(),
      fragmentShader: this.getFragmentShader(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      glslVersion: THREE.GLSL1
    });

    this.particleMesh = new THREE.Points(geometry, material);
    this.scene.add(this.particleMesh);
  }

  createGlowTexture() {
    /**
     * Generate a simple glow texture for particles
     * Creates a smooth radial gradient for natural-looking glowing particles
     */
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    // Create radial gradient (glow effect)
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  resetParticle(index, positions, colors, sizes) {
    /**
     * Initialize or reset a particle to random starting position
     * Particles spawn at edges and flow through the scene
     */
    const i3 = index * 3;

    // Random spawn position (at edges for flow effect)
    let x, y, z;
    const edge = Math.random();

    if (edge < 0.25) {
      x = -80 - Math.random() * 20;
      y = (Math.random() - 0.5) * 160;
      z = Math.random() * 50;
    } else if (edge < 0.5) {
      x = 80 + Math.random() * 20;
      y = (Math.random() - 0.5) * 160;
      z = Math.random() * 50;
    } else if (edge < 0.75) {
      x = (Math.random() - 0.5) * 160;
      y = -80 - Math.random() * 20;
      z = Math.random() * 50;
    } else {
      x = (Math.random() - 0.5) * 160;
      y = 80 + Math.random() * 20;
      z = Math.random() * 50;
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    // Assign random color from palette
    const color = new THREE.Color(
      this.config.colors[Math.floor(Math.random() * this.config.colors.length)]
    );
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    // Vary size slightly for depth
    sizes[index] = this.config.particleSize * (0.5 + Math.random() * 0.5);

    // Store lifetime
    if (!this.particleLifetime) this.particleLifetime = new Float32Array(this.config.particleCount);
    this.particleLifetime[index] = 0;
  }

  updateParticles() {
    /**
     * Update particle positions based on vector field
     * Uses noise-based flow field to create smooth, natural motion
     */
    const positions = this.particlePositions;
    const sizes = this.particleSizes;
    const colors = this.particleColors;

    for (let i = 0; i < this.config.particleCount; i++) {
      const i3 = i * 3;
      let x = positions[i3];
      let y = positions[i3 + 1];
      let z = positions[i3 + 2];

      // Calculate flow direction using 3D noise
      const scale = 0.005;
      const noiseScale = 1 / (50 * this.config.turbulence);

      const noiseFx = this.noise.noise(
        x * noiseScale + this.time * 0.0001,
        y * noiseScale + this.time * 0.0001,
        this.time * 0.001
      ) * Math.PI * this.config.turbulence;

      const noiseFy = this.noise.noise(
        100 + x * noiseScale + this.time * 0.0001,
        100 + y * noiseScale + this.time * 0.0001,
        this.time * 0.001
      ) * Math.PI * this.config.turbulence;

      const noiseFz = this.noise.noise(
        200 + x * noiseScale,
        200 + y * noiseScale,
        this.time * 0.001
      ) * Math.PI * 0.3;

      // Apply velocity based on noise
      const velocity = this.config.flowSpeed * this.audioFrequency;
      x += Math.cos(noiseFx) * velocity * scale;
      y += Math.sin(noiseFy) * velocity * scale;
      z += Math.sin(noiseFz) * velocity * scale * 0.5;

      // Reset if out of bounds (but particles persist, never fade out)
      if (Math.abs(x) > 150 || Math.abs(y) > 150 || Math.abs(z) > 100) {
        this.resetParticle(i, positions, colors, sizes);
      } else {
        // Update position
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
      }
      
      // Pulsing intensity for same particles - smooth breathing effect
      const pulseSpeed = 0.02;  // Slower pulse
      const pulse = 0.5 + 0.5 * Math.sin(this.time * pulseSpeed + i * 0.3);
      const alpha = 0.2 + 0.8 * pulse;  // Pulse between 0.2 and 1.0
      
      // Apply color with pulsing alpha
      const baseIndex = Math.floor(i % this.config.colors.length);
      const baseColor = new THREE.Color(this.config.colors[baseIndex]);
      colors[i3] = baseColor.r * alpha;
      colors[i3 + 1] = baseColor.g * alpha;
      colors[i3 + 2] = baseColor.b * alpha;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  getVertexShader() {
    return `
      precision highp float;
      
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      
      attribute vec3 position;
      attribute vec3 color;
      attribute float size;
      
      varying vec3 vColor;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
  }

  getFragmentShader() {
    return `
      precision mediump float;
      
      uniform float glowIntensity;
      varying vec3 vColor;

      void main() {
        vec2 coord = gl_PointCoord - 0.5;
        float d = length(coord);
        if(d > 0.5) discard;
        
        float alpha = (1.0 - d * 2.0) * glowIntensity;
        gl_FragColor = vec4(vColor, alpha);
      }
    `;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.time++;
    this.updateParticles();

    this.renderer.render(this.scene, this.camera);
  }

  handleResize = () => {
    /**
     * Handle window resize events
     * Updates camera and renderer accordingly
     */
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }
  };

  addEventListeners() {
    window.addEventListener('resize', this.handleResize);
  }

  /**
   * Public API for tuning parameters
   */
  setFlowSpeed(speed) {
    this.config.flowSpeed = Math.clamp(speed, 0.1, 2.0);
  }

  setDensity(density) {
    this.config.density = Math.clamp(density, 0.0, 1.0);
  }

  setTurbulence(turbulence) {
    this.config.turbulence = Math.clamp(turbulence, 0.0, 2.0);
  }

  setGlowIntensity(intensity) {
    this.config.glowIntensity = Math.clamp(intensity, 0.0, 2.0);
    this.particleMesh.material.uniforms.glowIntensity.value = intensity;
  }

  setColors(colorArray) {
    this.config.colors = colorArray;
  }

  /**
   * Optional: Enable audio reactivity
   * Pass an AnalyserNode from Web Audio API
   */
  connectAudioAnalyser(analyserNode, smoothing = 0.8) {
    this.analyserNode = analyserNode;
    this.audioData = new Uint8Array(analyserNode.frequencyBinCount);
    this.audioSmoothing = smoothing;
    this.audioReactivity = true;
  }

  updateAudioReactivity() {
    if (!this.audioReactivity || !this.analyserNode) return;

    this.analyserNode.getByteFrequencyData(this.audioData);
    const average = this.audioData.reduce((a, b) => a + b) / this.audioData.length;
    const frequency = average / 255;

    this.audioFrequency = this.audioFrequency * this.audioSmoothing + frequency * (1 - this.audioSmoothing);
  }

  dispose() {
    /**
     * Cleanup - call when removing background
     */
    window.removeEventListener('resize', this.handleResize);
    this.scene.clear();
    this.renderer.dispose();
    this.geometry.dispose();
    this.particleMesh.material.dispose();
    this.renderer.domElement.remove();
  }
}

// Utility function
Math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};
