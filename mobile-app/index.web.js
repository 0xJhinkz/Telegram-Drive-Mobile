/**
 * Override @expo/vector-icons font loading to use public fonts instead of node_modules
 */

// Prevent @expo/vector-icons from loading fonts from node_modules
// Instead, use our custom fonts.css which points to /fonts/
if (typeof document !== 'undefined') {
  // Remove any stylesheets that try to load from node_modules
  const stylesheets = document.querySelectorAll('link[href*="node_modules"]');
  stylesheets.forEach(link => {
    if (link.href.includes('vector-icons') || link.href.includes('.ttf')) {
      link.remove();
    }
  });
}

// Import our custom fonts.css that uses /fonts/ paths
import './assets/fonts.css';

// Import the rest of the app normally
require('expo/AppEntry');
