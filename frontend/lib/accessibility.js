/**
 * Accessibility & Performance Utilities for TaskMuse
 * Ensures WCAG AA+ compliance and optimal performance
 */

/**
 * KEYBOARD SHORTCUTS
 */
export const keyboardShortcuts = {
  NEW_MESSAGE: { key: 'm', ctrl: true, description: 'New message' },
  NEW_TASK: { key: 't', ctrl: true, description: 'New task' },
  TOGGLE_DARK_MODE: { key: 'd', ctrl: true, description: 'Toggle dark mode' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  HELP: { key: '?', ctrl: false, description: 'Show help' },
};

/**
 * Setup keyboard shortcuts
 */
export function setupKeyboardShortcuts(handlers) {
  if (typeof window === 'undefined') return;

  const handleKeyDown = (e) => {
    // Ctrl+M: New message
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault();
      if (handlers.onNewMessage) handlers.onNewMessage();
    }

    // Ctrl+T: New task
    if (e.ctrlKey && e.key === 't') {
      e.preventDefault();
      if (handlers.onNewTask) handlers.onNewTask();
    }

    // Ctrl+D: Toggle dark mode
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      if (handlers.onToggleDarkMode) handlers.onToggleDarkMode();
    }

    // Ctrl+K: Search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      if (handlers.onSearch) handlers.onSearch();
    }

    // ?: Show help
    if (e.key === '?' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      if (handlers.onShowHelp) handlers.onShowHelp();
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
      if (handlers.onEscape) handlers.onEscape();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * ACCESSIBILITY HELPERS
 */

// Check color contrast ratio (WCAG AA requires 4.5:1 for normal text)
export function getContrastRatio(color1, color2) {
  const getLuminance = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if color combination meets WCAG AA standards
export function meetsWCAG_AA(foreground, background) {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= 4.5;
}

// Generate accessible alt text for status badges
export function getStatusAltText(status, progress) {
  const statusMap = {
    pending: `Pending task, ${progress}% complete`,
    in_progress: `Task in progress, ${progress}% complete`,
    submitted: `Task submitted for review, ${progress}% complete`,
    completed: `Task completed, ${progress}% complete`,
  };
  return statusMap[status] || `Task status: ${status}`;
}

// Generate accessible label for severity
export function getSeverityLabel(severity) {
  const severityMap = {
    high: 'High severity blocker - requires immediate attention',
    medium: 'Medium severity blocker - address soon',
    low: 'Low severity blocker - monitor',
  };
  return severityMap[severity] || 'Unknown severity';
}

/**
 * PERFORMANCE MONITORING
 */

// Measure Core Web Vitals
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP) - should be < 2.5s
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        
        console.log(`📊 LCP: ${lcp.toFixed(2)}ms`, lcp < 2500 ? '✅ Good' : '⚠️ Needs improvement');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // Observer not supported
    }

    // Cumulative Layout Shift (CLS) - should be < 0.1
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log(`📊 CLS: ${clsValue.toFixed(3)}`, clsValue < 0.1 ? '✅ Good' : '⚠️ Needs improvement');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // Observer not supported
    }

    // First Input Delay (FID) - should be < 100ms
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        const fid = firstInput.processingStart - firstInput.startTime;
        
        console.log(`📊 FID: ${fid.toFixed(2)}ms`, fid < 100 ? '✅ Good' : '⚠️ Needs improvement');
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // Observer not supported
    }
  }
}

// Detect jank in animations (frame rate drops)
export function monitorAnimationPerformance() {
  if (typeof window === 'undefined') return;

  let lastTime = performance.now();
  let frames = 0;
  let fps = 60;

  const checkFrame = (currentTime) => {
    frames++;
    const delta = currentTime - lastTime;

    if (delta >= 1000) {
      fps = Math.round((frames * 1000) / delta);
      
      if (fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${fps}fps - Animations may be janky`);
      } else if (fps >= 60) {
        console.log(`✅ Smooth animations: ${fps}fps`);
      }

      frames = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(checkFrame);
  };

  requestAnimationFrame(checkFrame);
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !performance.memory) {
    console.log('ℹ️ Memory monitoring not available in this browser');
    return;
  }

  const usedMemory = performance.memory.usedJSHeapSize / 1048576; // MB
  const totalMemory = performance.memory.totalJSHeapSize / 1048576; // MB
  const limit = performance.memory.jsHeapSizeLimit / 1048576; // MB

  console.log(`💾 Memory: ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB (Limit: ${limit.toFixed(2)}MB)`);

  if (usedMemory / limit > 0.9) {
    console.warn('⚠️ High memory usage detected - may cause performance issues');
  }
}

/**
 * BROWSER SUPPORT DETECTION
 */
export function checkBrowserSupport() {
  if (typeof window === 'undefined') return {};

  const support = {
    webSocket: 'WebSocket' in window,
    localStorage: 'localStorage' in window,
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
  };

  console.log('🌐 Browser Support:', support);

  return support;
}

/**
 * PERFORMANCE OPTIMIZATION
 */

// Debounce function for expensive operations
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll/resize events
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Lazy load images
export function lazyLoadImage(img) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          observer.unobserve(image);
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = img.dataset.src;
  }
}

/**
 * ACCESSIBILITY ANNOUNCEMENTS
 */

// Screen reader announcements
export function announceToScreenReader(message, priority = 'polite') {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority); // 'polite' or 'assertive'
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * FOCUS MANAGEMENT
 */

// Trap focus within modal
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

const accessibilityUtils = {
  keyboardShortcuts,
  setupKeyboardShortcuts,
  getContrastRatio,
  meetsWCAG_AA,
  getStatusAltText,
  getSeverityLabel,
  measureWebVitals,
  monitorAnimationPerformance,
  monitorMemoryUsage,
  checkBrowserSupport,
  debounce,
  throttle,
  lazyLoadImage,
  announceToScreenReader,
  trapFocus,
};

export default accessibilityUtils;
