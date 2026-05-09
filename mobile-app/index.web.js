/**
 * Override @expo/vector-icons font loading to use public fonts instead of node_modules
 */

if (typeof document !== 'undefined') {
  // Remove any stylesheets that try to load from node_modules
  const stylesheets = document.querySelectorAll('link[href*="node_modules"]');
  stylesheets.forEach(link => {
    if (link.href.includes('vector-icons') || link.href.includes('.ttf')) {
      link.remove();
    }
  });

  // Pre-populate the expo-generated-fonts style element so expo-font
  // skips injecting duplicate @font-face rules with hashed asset URLs.
  // Font-family names must match what @expo/vector-icons actually uses
  // internally (e.g. 'ionicons', not 'Ionicons').
  var style = document.createElement('style');
  style.id = 'expo-generated-fonts';
  style.type = 'text/css';
  style.textContent = [
    // Simple icon sets (font-family matches font file basename if no mapping below)
    "@font-face{font-family:anticon;src:url('/fonts/AntDesign.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:entypo;src:url('/fonts/Entypo.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:evilicons;src:url('/fonts/EvilIcons.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:feather;src:url('/fonts/Feather.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome;src:url('/fonts/FontAwesome.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:Fontisto;src:url('/fonts/Fontisto.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:foundation;src:url('/fonts/Foundation.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:ionicons;src:url('/fonts/Ionicons.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:material-community;src:url('/fonts/MaterialCommunityIcons.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:material;src:url('/fonts/MaterialIcons.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:octicons;src:url('/fonts/Octicons.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:simple-line-icons;src:url('/fonts/SimpleLineIcons.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:zocial;src:url('/fonts/Zocial.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    // FontAwesome5 families (from createFA5iconSet)
    "@font-face{font-family:FontAwesome5Free-Brand;src:url('/fonts/FontAwesome5_Brands.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome5Free-Light;src:url('/fonts/FontAwesome5_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome5Free-Regular;src:url('/fonts/FontAwesome5_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome5Free-Solid;src:url('/fonts/FontAwesome5_Solid.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    // FontAwesome6 families (from createFA6iconSet)
    "@font-face{font-family:FontAwesome6Brands-Regular;src:url('/fonts/FontAwesome6_Brands.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Free-Light;src:url('/fonts/FontAwesome6_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Free-Regular;src:url('/fonts/FontAwesome6_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Free-Solid;src:url('/fonts/FontAwesome6_Solid.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Free-Thin;src:url('/fonts/FontAwesome6_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Sharp-Light;src:url('/fonts/FontAwesome6_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Sharp-Regular;src:url('/fonts/FontAwesome6_Regular.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Sharp-Solid;src:url('/fonts/FontAwesome6_Solid.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}",
    "@font-face{font-family:FontAwesome6Duotone-Solid;src:url('/fonts/FontAwesome6_Solid.ttf') format('truetype');font-display:auto;font-weight:400;font-style:normal}"
  ].join('');
  document.head.appendChild(style);
}

// Import our custom fonts.css that uses /fonts/ paths
import './assets/fonts.css';

// Import the rest of the app normally
require('expo/AppEntry');
