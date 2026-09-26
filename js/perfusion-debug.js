/**
 * DEBUGGING, TESTING & OPTIMIZATION GUIDE
 * Troubleshoot and optimize the perfusion background animation
 */

// ============================================================================
// PART 1: DIAGNOSTIC TOOLS
// ============================================================================

/**
 * Real-time performance diagnostics
 * Add to your page for live monitoring
 */

class PerfusionDiagnostics {
  constructor(perfusionInstance) {
    this.perfusion = perfusionInstance;
    this.stats = {
      fps: 0,
      frameTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      particlesActive: 0,
      gpuVendor: '',
      gpuRenderer: '',
      supported: true
    };

    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frames = [];
  }

  /**
   * Start collecting diagnostic data
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 100);

    this.animationFrameId = requestAnimationFrame(() => this.trackFrameTime());
  }

  /**
   * Track frame timing
   */
  trackFrameTime() {
    const start = performance.now();

    // Will be called after render
    this.frameTime = performance.now() - start;
    this.frames.push(this.frameTime);

    if (this.frames.length > 60) {
      this.frames.shift();
    }

    this.animationFrameId = requestAnimationFrame(() => this.trackFrameTime());
  }

  /**
   * Collect performance metrics
   */
  collectMetrics() {
    // FPS
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      this.stats.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    } else {
      this.frameCount++;
    }

    // Average frame time
    if (this.frames.length > 0) {
      this.stats.frameTime = 
        this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    }

    // Memory usage
    if (performance.memory) {
      this.stats.memoryUsage = (
        performance.memory.usedJSHeapSize / 1048576
      ).toFixed(2);
    }

    // GPU info
    if (this.perfusion.renderer) {
      const gl = this.perfusion.renderer.getContext();
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        this.stats.gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        this.stats.gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }

    // WebGL support
    this.stats.supported = !!this.perfusion.renderer;
  }

  /**
   * Get performance rating
   */
  getPerformanceRating() {
    const fps = this.stats.fps;

    if (fps >= 55) return '✅ Excellent';
    if (fps >= 45) return '✓ Good';
    if (fps >= 30) return '⚠ Fair';
    if (fps >= 20) return '⚠ Slow';
    return '❌ Very Slow';
  }

  /**
   * Generate diagnostic report
   */
  generateReport() {
    return `
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      PERFUSION BACKGROUND DIAGNOSTICS REPORT
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      PERFORMANCE METRICS:
      ├─ FPS: ${this.stats.fps} (Target: 60)
      ├─ Frame Time: ${this.stats.frameTime.toFixed(2)}ms
      ├─ Performance Rating: ${this.getPerformanceRating()}
      └─ Memory: ${this.stats.memoryUsage} MB

      HARDWARE INFO:
      ├─ GPU Vendor: ${this.stats.gpuVendor || 'Unknown'}
      ├─ GPU Renderer: ${this.stats.gpuRenderer || 'Unknown'}
      ├─ WebGL Supported: ${this.stats.supported ? '✅ Yes' : '❌ No'}
      └─ Browser: ${navigator.userAgent.substring(0, 50)}...

      CONFIGURATION:
      ├─ Particle Count: ${this.perfusion.config.particleCount}
      ├─ Flow Speed: ${this.perfusion.config.flowSpeed}
      ├─ Density: ${this.perfusion.config.density}
      ├─ Turbulence: ${this.perfusion.config.turbulence}
      └─ Glow Intensity: ${this.perfusion.config.glowIntensity}

      OPTIMIZATION SUGGESTIONS:
      ${this.getOptimizationTips()}

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  }

  /**
   * Suggest optimizations based on current performance
   */
  getOptimizationTips() {
    const tips = [];
    const fps = this.stats.fps;

    if (fps < 30) {
      tips.push('  ⚠ REDUCE PARTICLE COUNT: Try 3000-4000');
      tips.push('  ⚠ REDUCE DENSITY: Try 0.3-0.5');
      tips.push('  ⚠ REDUCE TURBULENCE: Try 0.8-1.0');
    }

    if (fps < 45) {
      tips.push('  ⚠ REDUCE GLOW INTENSITY: Try 0.8-1.2');
      tips.push('  ⚠ Disable advanced bloom effects');
    }

    if (fps >= 55) {
      tips.push('  ✓ Performance is excellent!');
      tips.push('  ✓ Consider increasing glowIntensity for more visual impact');
      tips.push('  ✓ Desktop devices can handle particleCount up to 15000');
    }

    return tips.length > 0 ? tips.join('\n') : '  ✓ No optimization needed';
  }

  /**
   * Display onscreen diagnostics overlay
   */
  displayOverlay() {
    if (this.overlay) return; // Already displayed

    const overlay = document.createElement('div');
    overlay.id = 'perfusion-diagnostics-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      padding: 12px;
      border: 1px solid #00ff00;
      border-radius: 4px;
      z-index: 10000;
      line-height: 1.4;
      max-width: 400px;
      user-select: text;
    `;

    this.overlay = overlay;
    document.body.appendChild(overlay);

    // Update overlay every 100ms
    this.overlayInterval = setInterval(() => {
      overlay.innerHTML = `
        <div style="color: #0f0; margin-bottom: 6px;"><strong>FPS: ${this.stats.fps}</strong> ${this.getPerformanceRating()}</div>
        <div>Frame Time: ${this.stats.frameTime.toFixed(1)}ms</div>
        <div>Memory: ${this.stats.memoryUsage} MB</div>
        <div>Particles: ${this.perfusion.config.particleCount}</div>
        <div style="margin-top: 6px; border-top: 1px solid #0f0; padding-top: 6px;">
          <div style="color: #ff0;">Speed: ${this.perfusion.config.flowSpeed}</div>
          <div style="color: #ff0;">Density: ${this.perfusion.config.density}</div>
          <div style="color: #ff0;">Turbulence: ${this.perfusion.config.turbulence}</div>
        </div>
      `;
    }, 100);
  }

  /**
   * Close diagnostics
   */
  closeOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.overlayInterval) {
      clearInterval(this.overlayInterval);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    clearInterval(this.monitoringInterval);
    cancelAnimationFrame(this.animationFrameId);
    this.closeOverlay();
  }
}

// ============================================================================
// PART 2: AUTOMATED TESTING
// ============================================================================

/**
 * Test perfusion animation on various configurations
 */

class PerfusionTester {
  constructor() {
    this.results = [];
  }

  /**
   * Test basic initialization
   */
  testInitialization() {
    try {
      const container = document.createElement('div');
      const perfusion = new PerfusionBackground({
        container: container
      });

      if (perfusion.renderer && perfusion.scene) {
        this.results.push({
          test: 'Initialization',
          status: '✅ PASS',
          message: 'Perfusion background initialized successfully'
        });
        perfusion.dispose();
      } else {
        throw new Error('Missing renderer or scene');
      }
    } catch (e) {
      this.results.push({
        test: 'Initialization',
        status: '❌ FAIL',
        message: e.message
      });
    }
  }

  /**
   * Test WebGL support
   */
  testWebGLSupport() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      this.results.push({
        test: 'WebGL Support',
        status: '✅ PASS',
        message: 'WebGL is supported'
      });
    } else {
      this.results.push({
        test: 'WebGL Support',
        status: '❌ FAIL',
        message: 'WebGL is not supported'
      });
    }
  }

  /**
   * Test resize handling
   */
  testResize() {
    try {
      const container = document.createElement('div');
      container.style.width = '800px';
      container.style.height = '600px';
      document.body.appendChild(container);

      const perfusion = new PerfusionBackground({
        container: container
      });

      const initialSize = {
        width: perfusion.width,
        height: perfusion.height
      };

      // Simulate resize
      container.style.width = '400px';
      container.style.height = '300px';
      window.dispatchEvent(new Event('resize'));

      setTimeout(() => {
        if (perfusion.width === 400 && perfusion.height === 300) {
          this.results.push({
            test: 'Resize Handling',
            status: '✅ PASS',
            message: 'Container resize handled correctly'
          });
        } else {
          this.results.push({
            test: 'Resize Handling',
            status: '❌ FAIL',
            message: 'Resize not detected properly'
          });
        }
        perfusion.dispose();
        container.remove();
      }, 100);
    } catch (e) {
      this.results.push({
        test: 'Resize Handling',
        status: '❌ FAIL',
        message: e.message
      });
    }
  }

  /**
   * Test API methods
   */
  testAPIMethods() {
    try {
      const container = document.createElement('div');
      const perfusion = new PerfusionBackground({
        container: container
      });

      // Test all setter methods
      const tests = [
        () => perfusion.setFlowSpeed(0.8),
        () => perfusion.setDensity(0.6),
        () => perfusion.setTurbulence(1.0),
        () => perfusion.setGlowIntensity(1.6),
        () => perfusion.setColors([0xff0000, 0x00ff00])
      ];

      for (let test of tests) {
        test();
      }

      this.results.push({
        test: 'API Methods',
        status: '✅ PASS',
        message: 'All setter methods work correctly'
      });

      perfusion.dispose();
    } catch (e) {
      this.results.push({
        test: 'API Methods',
        status: '❌ FAIL',
        message: e.message
      });
    }
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('Starting Perfusion Animation Tests...\n');

    this.testWebGLSupport();
    this.testInitialization();
    this.testResize();
    this.testAPIMethods();

    this.printResults();

    return this.results;
  }

  /**
   * Print test results
   */
  printResults() {
    console.clear();
    console.log('═══════════════════════════════════════════════════════════');
    console.log('PERFUSION BACKGROUND - TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    this.results.forEach(result => {
      console.log(`${result.test}`);
      console.log(`  Status: ${result.status}`);
      console.log(`  Message: ${result.message}\n`);
    });

    const passed = this.results.filter(r => r.status.includes('✅')).length;
    const total = this.results.length;

    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`Results: ${passed}/${total} tests passed`);
    console.log(`═══════════════════════════════════════════════════════════`);
  }
}

// ============================================================================
// PART 3: USAGE EXAMPLES
// ============================================================================

/**
 * Example: Enable diagnostics
 */

/*
// In your initialization code
const perfusion = new PerfusionBackground({ ... });
const diagnostics = new PerfusionDiagnostics(perfusion);

diagnostics.startMonitoring();
diagnostics.displayOverlay();

// Later, view report
console.log(diagnostics.generateReport());

// Later, stop monitoring
diagnostics.stopMonitoring();
*/

/**
 * Example: Run automated tests
 */

/*
const tester = new PerfusionTester();
const results = tester.runAllTests();
*/

/**
 * Example: Monitor performance and auto-optimize
 */

/*
const perfusion = new PerfusionBackground({
  container: document.getElementById('perfusion-container'),
  particleCount: 8000
});

const diagnostics = new PerfusionDiagnostics(perfusion);
diagnostics.startMonitoring();

// Every 5 seconds, check if we need to optimize
setInterval(() => {
  if (diagnostics.stats.fps < 40) {
    console.warn('Performance degraded, reducing particle count...');
    perfusion.config.particleCount = Math.max(2000, 
      perfusion.config.particleCount - 1000
    );
  }
}, 5000);
*/

// ============================================================================
// PART 4: CONSOLE HELPER FUNCTIONS
// ============================================================================

/**
 * Add to window for easy debugging in console
 */

window.PerfusionDebug = {
  /**
   * Run diagnostics: window.PerfusionDebug.diagnose(perfusionInstance)
   */
  diagnose(perfusionInstance) {
    const diag = new PerfusionDiagnostics(perfusionInstance);
    diag.startMonitoring();
    diag.displayOverlay();
    console.log(diag.generateReport());
    return diag;
  },

  /**
   * Run tests: window.PerfusionDebug.test()
   */
  test() {
    const tester = new PerfusionTester();
    return tester.runAllTests();
  },

  /**
   * Quick performance check: window.PerfusionDebug.quickCheck(perfusionInstance)
   */
  quickCheck(perfusionInstance) {
    const gl = perfusionInstance.renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');

    return {
      vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
      particleCount: perfusionInstance.config.particleCount
    };
  }
};

console.log('✓ Perfusion Debug Tools Loaded');
console.log('Usage: window.PerfusionDebug.diagnose(perfusionInstance)');
console.log('Usage: window.PerfusionDebug.test()');
console.log('Usage: window.PerfusionDebug.quickCheck(perfusionInstance)');
