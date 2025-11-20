/**
 * Create placeholder icons for the extension
 * This creates simple SVG icons for development/testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '..', 'extension', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG icons for each size
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>

  <!-- WR text -->
  <text x="50%" y="50%"
        font-family="Arial, sans-serif"
        font-size="${size * 0.4}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central">WR</text>
</svg>`;

  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${svgPath}`);

  // Create disabled version (grayscale)
  const svgDisabledContent = svgContent
    .replace('stop-color:#667eea', 'stop-color:#666666')
    .replace('stop-color:#764ba2', 'stop-color:#999999');

  const svgDisabledPath = path.join(iconsDir, `icon${size}-disabled.svg`);
  fs.writeFileSync(svgDisabledPath, svgDisabledContent);
  console.log(`✓ Created ${svgDisabledPath}`);
});

console.log('\n✓ Placeholder SVG icons created successfully!');
console.log('\nNote: These are SVG placeholders. For production:');
console.log('1. Convert SVGs to PNG using an online converter or ImageMagick');
console.log('2. Or use a design tool to create proper icons');
console.log('3. SVG icons work in most modern browsers but PNG is more compatible\n');
