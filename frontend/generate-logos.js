#!/usr/bin/env node

/**
 * Logo Generation Script
 * Generates PNG and favicon assets from SVG files
 * 
 * Usage: node generate-logos.js
 * 
 * Requirements:
 * - sharp: npm install sharp
 * - svg2png: npm install svg2png
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed. Please run: npm install sharp');
  process.exit(1);
}

const logosDir = path.join(__dirname, 'src/assets/logos');
const publicDir = path.join(__dirname, 'public');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

/**
 * Generate PNG from SVG
 */
async function generatePNG(svgPath, outputPath, width, height) {
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    
    await sharp(svgBuffer, { density: 300 })
      .resize(width, height, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Error generating ${outputPath}:`, error.message);
  }
}

/**
 * Generate ICO from PNG
 */
async function generateICO(pngPath, outputPath) {
  try {
    const pngBuffer = fs.readFileSync(pngPath);
    
    // For ICO, we'll use the PNG as-is (modern browsers support PNG in ICO)
    // In production, you might want to use a dedicated ICO library
    fs.copyFileSync(pngPath, outputPath);
    console.log(`✓ Generated: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`✗ Error generating ${outputPath}:`, error.message);
  }
}

/**
 * Main generation function
 */
async function generateLogos() {
  console.log('🎨 Generating FitNova Logo Assets...\n');

  try {
    // Generate PNG versions of the mark
    console.log('📦 Generating PNG assets...');
    
    // 512px version (primary export)
    await generatePNG(
      path.join(logosDir, 'fitnova-mark.svg'),
      path.join(logosDir, 'fitnova-mark-512.png'),
      512,
      512
    );

    // Favicon sizes
    console.log('\n🔗 Generating favicon assets...');
    
    // 16x16
    await generatePNG(
      path.join(logosDir, 'fitnova-mark.svg'),
      path.join(publicDir, 'favicon-16x16.png'),
      16,
      16
    );

    // 32x32
    await generatePNG(
      path.join(logosDir, 'fitnova-mark.svg'),
      path.join(publicDir, 'favicon-32x32.png'),
      32,
      32
    );

    // 192x192 (Android)
    await generatePNG(
      path.join(logosDir, 'fitnova-mark.svg'),
      path.join(publicDir, 'favicon-192x192.png'),
      192,
      192
    );

    // 180x180 (iOS)
    await generatePNG(
      path.join(logosDir, 'fitnova-mark.svg'),
      path.join(publicDir, 'favicon-180x180.png'),
      180,
      180
    );

    // Generate ICO (using 32x32 PNG as base)
    console.log('\n🎯 Generating ICO format...');
    await generateICO(
      path.join(publicDir, 'favicon-32x32.png'),
      path.join(publicDir, 'favicon.ico')
    );

    console.log('\n✅ Logo generation complete!');
    console.log('\nGenerated files:');
    console.log('  - src/assets/logos/fitnova-mark-512.png');
    console.log('  - public/favicon-16x16.png');
    console.log('  - public/favicon-32x32.png');
    console.log('  - public/favicon-192x192.png');
    console.log('  - public/favicon-180x180.png');
    console.log('  - public/favicon.ico');

  } catch (error) {
    console.error('❌ Error during logo generation:', error);
    process.exit(1);
  }
}

// Run the generation
generateLogos();
