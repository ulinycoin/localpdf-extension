const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const DIST_DIR = path.join(__dirname, '../dist');

console.log('🔨 Building LocalPDF Extension...\n');

// Clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true });
  console.log('✓ Cleaned dist directory');
}

// Create dist directory
fs.mkdirSync(DIST_DIR, { recursive: true });
console.log('✓ Created dist directory');

// Copy all files from src to dist
copyDirectory(SRC_DIR, DIST_DIR);

console.log('\n✅ Build completed successfully!');
console.log(`📦 Extension built in: ${DIST_DIR}\n`);

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`  → ${path.relative(path.join(__dirname, '..'), destPath)}`);
    }
  }
}
