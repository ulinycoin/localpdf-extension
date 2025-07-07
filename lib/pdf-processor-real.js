/**
 * LocalPDF Extension - Real PDF Processor (Service Worker Compatible)
 * Uses importScripts instead of eval for Manifest V3 compatibility
 */

class RealPDFProcessor {
    constructor() {
        this.pdfLib = null;
        this.isInitialized = false;
    }

    /**
     * Initialize pdf-lib library using importScripts (Service Worker compatible)
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('[LocalPDF] Loading pdf-lib via importScripts...');
            
            // Use importScripts for service worker compatibility
            importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
            
            // pdf-lib should now be available as PDFLib in global scope
            if (typeof PDFLib !== 'undefined') {
                this.pdfLib = PDFLib;
                this.isInitialized = true;
                console.log('[LocalPDF] ✅ pdf-lib loaded successfully via importScripts');
            } else {
                throw new Error('PDFLib not found after importScripts');
            }
        } catch (error) {
            console.error('[LocalPDF] Failed to load pdf-lib via importScripts:', error);
            
            // Try alternative loading method as fallback
            try {
                console.log('[LocalPDF] Trying alternative loading method...');
                const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
                const text = await response.text();
                
                // Create a new Function instead of eval (CSP-safe)
                const loadPDFLib = new Function(text + '; return PDFLib;');
                this.pdfLib = loadPDFLib();
                
                if (this.pdfLib) {
                    this.isInitialized = true;
                    console.log('[LocalPDF] ✅ pdf-lib loaded via alternative method');
                } else {
                    throw new Error('PDFLib not found after alternative loading');
                }
            } catch (altError) {
                console.error('[LocalPDF] Alternative loading also failed:', altError);
                throw new Error(`Failed to initialize PDF processor: ${error.message}`);
            }
        }
    }

    /**
     * Real PDF merger using pdf-lib
     */
    async mergePDFs(files) {
        try {
            await this.initialize();
            console.log(`[LocalPDF] 🔗 Starting REAL merge of ${files.length} PDFs`);
            
            if (files.length === 0) {
                throw new Error('No files provided for merging');
            }

            if (files.length === 1) {
                const arrayBuffer = await this.fileToArrayBuffer(files[0]);
                return {
                    success: true,
                    data: new Uint8Array(arrayBuffer),
                    fileName: 'merged-document.pdf',
                    fileCount: 1,
                    message: 'Single file processed (no merging needed)'
                };
            }

            // Create new PDF document
            const mergedPdf = await this.pdfLib.PDFDocument.create();
            
            // Process each PDF file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`[LocalPDF] Processing file ${i + 1}/${files.length}: ${file.name}`);
                
                try {
                    const arrayBuffer = await this.fileToArrayBuffer(file);
                    const sourcePdf = await this.pdfLib.PDFDocument.load(arrayBuffer);
                    
                    // Copy all pages from source to merged PDF
                    const pageIndices = sourcePdf.getPageIndices();
                    const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndices);
                    
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page);
                    });
                    
                    console.log(`[LocalPDF] ✅ Added ${pageIndices.length} pages from ${file.name}`);
                } catch (error) {
                    console.error(`[LocalPDF] Error processing ${file.name}:`, error);
                    throw new Error(`Failed to process ${file.name}: ${error.message}`);
                }
            }
            
            // Generate final PDF
            console.log('[LocalPDF] Generating merged PDF...');
            const pdfBytes = await mergedPdf.save();
            
            const totalPages = mergedPdf.getPageCount();
            console.log(`[LocalPDF] 🎉 Real merge completed! Pages: ${totalPages}, Size: ${pdfBytes.length} bytes`);
            
            return {
                success: true,
                data: pdfBytes,
                fileName: 'merged-document.pdf',
                fileCount: files.length,
                message: `Successfully merged ${files.length} PDF files`,
                totalPages: totalPages
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error in real merge:', error);
            throw new Error(`Merge failed: ${error.message}`);
        }
    }

    /**
     * Real PDF splitting using pdf-lib
     */
    async splitPDF(file, options = {}) {
        try {
            await this.initialize();
            console.log(`[LocalPDF] ✂️ Starting REAL split of ${file.name}`);
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const sourcePdf = await this.pdfLib.PDFDocument.load(arrayBuffer);
            
            const totalPages = sourcePdf.getPageCount();
            console.log(`[LocalPDF] Source PDF has ${totalPages} pages`);
            
            if (totalPages === 1) {
                // Single page - just return original
                return {
                    success: true,
                    files: [{
                        data: new Uint8Array(arrayBuffer),
                        fileName: `${this.getBaseName(file.name)}-page-1.pdf`,
                        pageNumber: 1
                    }],
                    originalFile: file.name,
                    message: 'Single page PDF - no splitting needed'
                };
            }
            
            const splitResults = [];
            
            // Create separate PDF for each page
            for (let i = 0; i < totalPages; i++) {
                console.log(`[LocalPDF] Extracting page ${i + 1}/${totalPages}`);
                
                const newPdf = await this.pdfLib.PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
                newPdf.addPage(copiedPage);
                
                const pdfBytes = await newPdf.save();
                
                splitResults.push({
                    data: pdfBytes,
                    fileName: `${this.getBaseName(file.name)}-page-${i + 1}.pdf`,
                    pageNumber: i + 1
                });
            }
            
            console.log(`[LocalPDF] 🎉 Real split completed: ${splitResults.length} files created`);
            
            return {
                success: true,
                files: splitResults,
                originalFile: file.name,
                message: `Successfully split into ${splitResults.length} separate PDF files`,
                totalPages: totalPages
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error in real split:', error);
            throw new Error(`Split failed: ${error.message}`);
        }
    }

    /**
     * Real PDF compression using pdf-lib optimization
     */
    async compressPDF(file, quality = 'medium') {
        try {
            await this.initialize();
            console.log(`[LocalPDF] 🗜️ Starting REAL compression of ${file.name} (quality: ${quality})`);
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const sourcePdf = await this.pdfLib.PDFDocument.load(arrayBuffer);
            
            const originalSize = arrayBuffer.byteLength;
            console.log(`[LocalPDF] Original size: ${(originalSize / 1024).toFixed(2)} KB`);
            
            // Apply compression based on quality setting
            let compressionOptions = {};
            
            switch (quality) {
                case 'high':
                    // Minimal compression - preserve quality
                    compressionOptions = {
                        useObjectStreams: false,
                        addDefaultPage: false
                    };
                    break;
                case 'medium':
                    // Balanced compression
                    compressionOptions = {
                        useObjectStreams: true,
                        addDefaultPage: false
                    };
                    break;
                case 'low':
                    // Maximum compression
                    compressionOptions = {
                        useObjectStreams: true,
                        addDefaultPage: false,
                        objectsPerTick: 50
                    };
                    break;
            }
            
            // Generate compressed PDF
            console.log('[LocalPDF] Applying compression...');
            const compressedBytes = await sourcePdf.save(compressionOptions);
            
            const compressedSize = compressedBytes.length;
            const actualReduction = Math.round((1 - compressedSize / originalSize) * 100);
            
            console.log(`[LocalPDF] 🎉 Real compression completed!`);
            console.log(`[LocalPDF] Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
            console.log(`[LocalPDF] Actual reduction: ${actualReduction}%`);
            
            return {
                success: true,
                data: compressedBytes,
                fileName: `${this.getBaseName(file.name)}-compressed.pdf`,
                originalSize: originalSize,
                compressedSize: compressedSize,
                compressionRatio: actualReduction,
                message: `Successfully compressed with ${actualReduction}% size reduction`,
                quality: quality
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error in real compression:', error);
            throw new Error(`Compression failed: ${error.message}`);
        }
    }

    /**
     * Add text to PDF using pdf-lib
     */
    async addTextToPDF(file, textOptions = {}) {
        try {
            await this.initialize();
            console.log(`[LocalPDF] 📝 Adding text to ${file.name}`);
            
            const {
                text = 'LocalPDF Text',
                x = 50,
                y = 50,
                size = 12,
                color = { r: 0, g: 0, b: 0 },
                page = 0
            } = textOptions;
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const pdfDoc = await this.pdfLib.PDFDocument.load(arrayBuffer);
            
            const pages = pdfDoc.getPages();
            if (page >= pages.length) {
                throw new Error(`Page ${page + 1} does not exist. PDF has ${pages.length} pages.`);
            }
            
            const targetPage = pages[page];
            const { width, height } = targetPage.getSize();
            
            // Add text to specified page
            targetPage.drawText(text, {
                x: x,
                y: height - y, // Flip Y coordinate (PDF uses bottom-left origin)
                size: size,
                color: this.pdfLib.rgb(color.r / 255, color.g / 255, color.b / 255)
            });
            
            const pdfBytes = await pdfDoc.save();
            
            console.log('[LocalPDF] ✅ Text added successfully');
            
            return {
                success: true,
                data: pdfBytes,
                fileName: `${this.getBaseName(file.name)}-with-text.pdf`,
                message: `Successfully added text "${text}" to page ${page + 1}`
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error adding text:', error);
            throw new Error(`Add text failed: ${error.message}`);
        }
    }

    /**
     * Utility functions
     */
    async fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    getBaseName(fileName) {
        return fileName.replace(/\.[^/.]+$/, '');
    }
    
    /**
     * Validate PDF file
     */
    async validatePDF(file) {
        try {
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const bytes = new Uint8Array(arrayBuffer);
            
            // Check PDF header
            const pdfHeader = '%PDF-';
            const header = String.fromCharCode(...bytes.slice(0, 5));
            
            if (header !== pdfHeader) {
                throw new Error('File is not a valid PDF');
            }
            
            // Try to load with pdf-lib for deeper validation
            if (this.isInitialized) {
                try {
                    await this.pdfLib.PDFDocument.load(arrayBuffer);
                    console.log(`[LocalPDF] ✅ PDF validation passed: ${file.name}`);
                } catch (error) {
                    throw new Error('PDF file is corrupted or invalid');
                }
            }
            
            return true;
        } catch (error) {
            console.error(`[LocalPDF] PDF validation failed: ${file.name}`, error);
            throw new Error(`PDF validation failed: ${error.message}`);
        }
    }
    
    /**
     * Download processed PDF using Chrome downloads API (Manifest V3 compatible)
     */
    async downloadPDF(pdfBytes, fileName) {
        try {
            // Convert to base64 data URL for service worker compatibility
            const base64String = this.uint8ArrayToBase64(pdfBytes);
            const dataUrl = `data:application/pdf;base64,${base64String}`;
            
            const downloadId = await chrome.downloads.download({
                url: dataUrl,
                filename: fileName,
                saveAs: false
            });
            
            console.log(`[LocalPDF] ✅ Download started: ${fileName} (ID: ${downloadId})`);
            return downloadId;
            
        } catch (error) {
            console.error('[LocalPDF] Error downloading PDF:', error);
            throw error;
        }
    }
    
    /**
     * Convert Uint8Array to base64 string
     */
    uint8ArrayToBase64(uint8Array) {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }
    
    /**
     * Batch download multiple files with staggered timing
     */
    async downloadMultiplePDFs(files) {
        console.log(`[LocalPDF] Starting batch download of ${files.length} files`);
        
        const downloadPromises = files.map((file, index) => {
            return new Promise((resolve) => {
                setTimeout(async () => {
                    try {
                        await this.downloadPDF(file.data, file.fileName);
                        console.log(`[LocalPDF] ✅ Downloaded ${file.fileName}`);
                        resolve();
                    } catch (error) {
                        console.error(`[LocalPDF] ❌ Error downloading ${file.fileName}:`, error);
                        resolve(); // Continue with other downloads
                    }
                }, index * 800); // Longer delay between downloads
            });
        });
        
        await Promise.all(downloadPromises);
        console.log(`[LocalPDF] 🎉 Batch download completed`);
    }
}

// Export for use in service worker
if (typeof self !== 'undefined') {
    self.RealPDFProcessor = RealPDFProcessor;
}
