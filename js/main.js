/**
 * Main JavaScript - MAMA-SYNTH Challenge
 * Handles interactive features and enhancements
 */

// Strict mode for better error catching
'use strict';

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    const navUl = document.querySelector('.main-nav ul');
    
    if (menuToggle && nav && navUl) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
            navUl.classList.toggle('active');
            
            // Change icon
            this.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
        
        // Close menu when clicking nav links
        const navLinks = navUl.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                navUl.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.textContent = '☰';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                navUl.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.textContent = '☰';
            }
        });
    }
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignore # links
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Get header height for offset
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                
                // Calculate position
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
                
                // Focus management for accessibility (preventScroll stops the browser
                // from re-scrolling the element into view after our manual offset scroll)
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            }
        });
    });
}

/**
 * Active Navigation Highlighting
 */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    function highlightNav() {
        const scrollY = window.pageYOffset;
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - headerHeight - 50;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Throttle scroll event for better performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                highlightNav();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Initial call
    highlightNav();
}

/**
 * Lazy Loading Images Enhancement
 * For browsers that don't support native lazy loading
 */
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
        return;
    }
    
    // Fallback for older browsers
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Scroll to Top Button (Optional Enhancement)
 */
function initScrollToTop() {
    // Create button
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--color-terracotta);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        z-index: 999;
    `;
    
    document.body.appendChild(button);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top on click
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Form Validation (if forms are added later)
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Get all required fields
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                    
                    // Create error message if it doesn't exist
                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
                        const errorMsg = document.createElement('span');
                        errorMsg.className = 'error-message';
                        errorMsg.textContent = 'This field is required';
                        errorMsg.style.color = 'var(--color-coral)';
                        errorMsg.style.fontSize = '14px';
                        field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    }
                } else {
                    field.classList.remove('error');
                    const errorMsg = field.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.remove();
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Open webpage links in new tabs
 */
function initWebLinksInNewTab() {
    const links = document.querySelectorAll('a[href]');
    const normalizeHostname = (hostname) => (hostname || '').toLowerCase().replace(/^www\./, '');

    const internalHosts = new Set([normalizeHostname(window.location.hostname)]);
    const metaHosts = (document.querySelector('meta[name="internal-hosts"]')?.getAttribute('content') || '')
        .split(',')
        .map(host => normalizeHostname(host.trim()))
        .filter(Boolean);
    metaHosts.forEach(host => internalHosts.add(host));

    if (typeof window !== 'undefined' && Array.isArray(window.MAMA_INTERNAL_HOSTS)) {
        window.MAMA_INTERNAL_HOSTS
            .map(host => normalizeHostname(String(host).trim()))
            .filter(Boolean)
            .forEach(host => internalHosts.add(host));
    }

    function isInternalHostname(targetHostname) {
        const normalizedTarget = normalizeHostname(targetHostname);
        if (!normalizedTarget) {
            return false;
        }

        for (const internalHost of internalHosts) {
            if (
                normalizedTarget === internalHost ||
                normalizedTarget.endsWith(`.${internalHost}`) ||
                internalHost.endsWith(`.${normalizedTarget}`)
            ) {
                return true;
            }
        }

        return false;
    }

    links.forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        const normalizedHref = href.toLowerCase();
        const forceNewTab = link.dataset.forceNewTab === 'true';

        if (
            !href ||
            href.startsWith('#') ||
            normalizedHref.startsWith('mailto:') ||
            normalizedHref.startsWith('tel:') ||
            normalizedHref.startsWith('javascript:')
        ) {
            return;
        }

        let resolvedUrl;
        try {
            resolvedUrl = new URL(href, window.location.href);
        } catch (error) {
            return;
        }

        const isWebProtocol = resolvedUrl.protocol === 'http:' || resolvedUrl.protocol === 'https:';
        if (!isWebProtocol) {
            return;
        }

        if (forceNewTab) {
            link.setAttribute('target', '_blank');

            const forcedRelParts = (link.getAttribute('rel') || '')
                .split(/\s+/)
                .filter(Boolean);
            const forcedRelSet = new Set(forcedRelParts);
            forcedRelSet.add('noopener');
            forcedRelSet.add('noreferrer');
            link.setAttribute('rel', Array.from(forcedRelSet).join(' '));
            return;
        }

        const isExternal = !isInternalHostname(resolvedUrl.hostname);
        if (!isExternal) {
            link.removeAttribute('target');
            return;
        }

        link.setAttribute('target', '_blank');

        const relParts = (link.getAttribute('rel') || '')
            .split(/\s+/)
            .filter(Boolean);
        const relSet = new Set(relParts);
        relSet.add('noopener');
        relSet.add('noreferrer');
        link.setAttribute('rel', Array.from(relSet).join(' '));
    });
}

/**
 * GoatCounter Analytics
 */
function getGoatCounterEndpoint() {
    const configuredEndpoint = typeof window !== 'undefined' ? window.MAMA_GOATCOUNTER_URL : '';
    const metaEndpoint = document.querySelector('meta[name="goatcounter"]')?.getAttribute('content');
    const endpoint = (configuredEndpoint || metaEndpoint || '').trim();

    if (!endpoint || endpoint.includes('YOUR-CODE')) {
        return null;
    }

    return endpoint;
}

function loadGoatCounter(endpoint) {
    if (!endpoint || window.goatcounter || document.querySelector('script[data-goatcounter]')) {
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.dataset.goatcounter = endpoint;
    document.head.appendChild(script);
}

function sanitizeAnalyticsPart(value) {
    return (value || 'unknown')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_:/.]/g, '')
        .slice(0, 120);
}

function trackGoatCounterEvent(path, title) {
    if (!window.goatcounter || typeof window.goatcounter.count !== 'function') {
        return;
    }

    window.goatcounter.count({
        path,
        title,
        event: true
    });
}

function initClickTracking() {
    document.addEventListener('click', (event) => {
        const target = event.target.closest('a, button, [role="button"]');
        if (!target) {
            return;
        }

        const targetType = target.tagName.toLowerCase();
        const href = target.getAttribute('href') || '';
        const label = target.getAttribute('aria-label') || target.textContent || target.id || target.className || targetType;

        const safePage = sanitizeAnalyticsPart(window.location.pathname || '/');
        const safeType = sanitizeAnalyticsPart(targetType);
        const safeHref = sanitizeAnalyticsPart(href || 'no-href');
        const safeLabel = sanitizeAnalyticsPart(label.trim());

        trackGoatCounterEvent(
            `/click/${safePage}/${safeType}/${safeLabel}/${safeHref}`,
            `Click: ${label.trim().slice(0, 80) || targetType}`
        );
    });
}

function initAnalytics() {
    const endpoint = getGoatCounterEndpoint();
    if (!endpoint) {
        return;
    }

    loadGoatCounter(endpoint);
    initClickTracking();
}

/**
 * Initialize all modules
 */
function init() {
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initAnalytics();
            initWebLinksInNewTab();
            initMobileNav();
            initSmoothScroll();
            initActiveNav();
            initLazyLoading();
            initScrollToTop();
            initFormValidation();
        });
    } else {
        // DOM already loaded
        initAnalytics();
        initWebLinksInNewTab();
        initMobileNav();
        initSmoothScroll();
        initActiveNav();
        initLazyLoading();
        initScrollToTop();
        initFormValidation();
    }
}

// Run initialization
init();

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileNav,
        initSmoothScroll,
        initActiveNav,
        initLazyLoading,
        initScrollToTop,
        initFormValidation,
        initAnalytics,
        initClickTracking,
        initWebLinksInNewTab
    };
}

document.addEventListener('DOMContentLoaded', function () {
  function updateCountdowns() {
    const countdowns = document.querySelectorAll('.countdown');
    countdowns.forEach(function (el) {
      const dateStr = el.getAttribute('data-date');
      if (!dateStr) return;
      const target = new Date(dateStr + 'T00:00:00');
      const now = new Date();
      const diff = target - now;
      if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        el.textContent = `${days} day${days !== 1 ? 's' : ''} left`;
      } else {
        el.textContent = 'Completed';
      }
    });
  }
  updateCountdowns();
  setInterval(updateCountdowns, 60 * 60 * 1000); // update every hour
});

// Evaluation block interactivity
function scrollToHeadingAndShowDetails(blockId, detailsId) {
  const block = document.getElementById(blockId);
  const details = document.getElementById(detailsId);
  const allDetails = document.querySelectorAll('.eval-details');
  const heading = block.querySelector('h3');
  if (heading) {
    heading.scrollIntoView({behavior: 'smooth', block: 'start'});
  }
  allDetails.forEach(d => d.classList.remove('active'));
  details.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
  const fidelityBlock = document.getElementById('fidelity-block');
  const downstreamBlock = document.getElementById('downstream-block');
  if (fidelityBlock && downstreamBlock) {
    fidelityBlock.addEventListener('click', function() {
      scrollToHeadingAndShowDetails('fidelity-block', 'fidelity-details');
    });
    fidelityBlock.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        scrollToHeadingAndShowDetails('fidelity-block', 'fidelity-details');
      }
    });
    downstreamBlock.addEventListener('click', function() {
      scrollToHeadingAndShowDetails('downstream-block', 'downstream-details');
    });
    downstreamBlock.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        scrollToHeadingAndShowDetails('downstream-block', 'downstream-details');
      }
    });
  }
});
