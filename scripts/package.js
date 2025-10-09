const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_FILE = path.join(__dirname, '../localpdf-extension.zip');

console.log('📦 Packaging LocalPDF Extension...\n');

// Check if dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Error: dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Remove existing zip if exists
if (fs.existsSync(OUTPUT_FILE)) {
  fs.unlinkSync(OUTPUT_FILE);
  console.log('✓ Removed existing package');
}

// Create a file to stream archive data to
const output = fs.createWriteStream(OUTPUT_FILE);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

// Listen for archive events
output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Package created successfully!`);
  console.log(`📦 File: ${path.basename(OUTPUT_FILE)}`);
  console.log(`📊 Size: ${sizeInMB} MB`);
  console.log(`\n🚀 Ready to upload to Chrome Web Store and Firefox Add-ons!\n`);
});

archive.on('error', (err) => {
  console.error('❌ Error creating package:', err);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

// Append files from dist directory
archive.directory(DIST_DIR, false);

// Finalize the archive
archive.finalize();
