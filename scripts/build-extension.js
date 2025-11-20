/**
 * Build script for Web Rerender extension
 * Packages the extension for distribution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building Web Rerender Extension...\n');

// Paths
const extensionDir = path.join(__dirname, '..', 'extension');
const sdkDistDir = path.join(__dirname, '..', 'sdk', 'dist');
const extensionSdkDir = path.join(extensionDir, 'sdk');

// Ensure extension SDK directory exists
if (!fs.existsSync(extensionSdkDir)) {
  fs.mkdirSync(extensionSdkDir, { recursive: true });
  console.log('✓ Created extension/sdk directory');
}

// Copy SDK files to extension
const sdkFile = path.join(sdkDistDir, 'web-rerender.js');
const destFile = path.join(extensionSdkDir, 'web-rerender.js');

if (fs.existsSync(sdkFile)) {
  fs.copyFileSync(sdkFile, destFile);
  console.log('✓ Copied SDK to extension folder');
} else {
  console.error('✗ SDK not found. Run "npm run build:sdk" first');
  process.exit(1);
}

// Verify required files exist
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup/popup.html',
  'popup/popup.css',
  'popup/popup.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(extensionDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file} exists`);
  } else {
    console.error(`✗ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n✗ Some required files are missing');
  process.exit(1);
}

// Check for icons
const iconsDir = path.join(extensionDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  console.warn('\n⚠ Warning: icons/ directory not found');
  console.warn('  Create icon16.png, icon48.png, and icon128.png');
  console.warn('  See extension/icons/ICONS_README.md for details');
}

// Get package version
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = packageJson.version;

console.log(`\n✓ Extension build complete (v${version})`);
console.log('\nNext steps:');
console.log('1. Create icons (see extension/icons/ICONS_README.md)');
console.log('2. Load extension in browser:');
console.log('   Chrome: chrome://extensions -> Load unpacked -> select extension/ folder');
console.log('   Firefox: about:debugging -> Load Temporary Add-on -> select manifest.json');
console.log('3. Test on various websites');
console.log('4. Package for distribution when ready\n');
