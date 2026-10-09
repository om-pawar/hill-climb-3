/**
 * Hill Climb Rush - Mobile Landscape Orientation & Fullscreen Handler
 * Ensures horizontal landscape layout on mobile browsers and PWAs
 */

(function() {
  'use strict';

  function requestLandscapeMode() {
    const docEl = document.documentElement;

    // 1. Request Fullscreen (needed for screen.orientation.lock in many mobile browsers)
    const requestFs = docEl.requestFullscreen || 
                      docEl.webkitRequestFullscreen || 
                      docEl.mozRequestFullScreen || 
                      docEl.msRequestFullscreen;

    if (requestFs && !document.fullscreenElement && !document.webkitFullscreenElement) {
      try {
        const p = requestFs.call(docEl);
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    }

    // 2. Request Screen Orientation Lock to Landscape
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
          // Fallback to landscape-primary or landscape-secondary if generic landscape is rejected
          screen.orientation.lock('landscape-primary').catch(() => {});
        });
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      } else if (screen.mozLockOrientation) {
        screen.mozLockOrientation('landscape');
      } else if (screen.msLockOrientation) {
        screen.msLockOrientation('landscape');
      }
    } catch (e) {}
  }

  function checkOrientation() {
    const overlay = document.getElementById('orientation-lock-overlay');
    if (!overlay) return;

    const isPortrait = window.innerHeight > window.innerWidth;
    const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 950;

    if (isPortrait && isMobile) {
      overlay.classList.add('visible');
    } else {
      overlay.classList.remove('visible');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    checkOrientation();

    const forceBtn = document.getElementById('btn-force-landscape');
    if (forceBtn) {
      forceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        requestLandscapeMode();
        setTimeout(checkOrientation, 300);
      });
      forceBtn.addEventListener('touchend', (e) => {
        e.stopPropagation();
        requestLandscapeMode();
        setTimeout(checkOrientation, 300);
      });
    }

    // Try locking landscape on any first user gesture (touch / click)
    const handleFirstGesture = () => {
      requestLandscapeMode();
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
    };

    window.addEventListener('touchstart', handleFirstGesture, { passive: true, once: true });
    window.addEventListener('click', handleFirstGesture, { passive: true, once: true });
  });

  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', () => {
    setTimeout(checkOrientation, 200);
  });

  if (screen.orientation) {
    screen.orientation.addEventListener('change', checkOrientation);
  }

  // Export to global scope if needed
  window.requestLandscapeMode = requestLandscapeMode;
})();
