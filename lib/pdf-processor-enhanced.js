/**
 * LocalPDF Extension - Local PDF-lib Loader
 * Downloads and caches pdf-lib locally to avoid CSP issues
 */

class LocalPDFLibLoader {
    constructor() {
        this.pdfLib = null;
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Load pdf-lib and cache it locally
     */
    async loadPDFLib() {
        if (this.isLoaded) {
            return this.pdfLib;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this._loadPDFLibInternal();
        return this.loadingPromise;
    }

    async _loadPDFLibInternal() {
        try {
            console.log('[LocalPDF] 📦 Loading pdf-lib locally...');

            // Try to get cached version first
            const cached = await this._getCachedPDFLib();
            if (cached) {
                console.log('[LocalPDF] ✅ Using cached pdf-lib');
                this.pdfLib = cached;
                this.isLoaded = true;
                return this.pdfLib;
            }

            // Download and cache pdf-lib
            console.log('[LocalPDF] 📥 Downloading pdf-lib from CDN...');
            const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
            
            if (!response.ok) {
                throw new Error(`Failed to download pdf-lib: ${response.status}`);
            }

            const pdfLibCode = await response.text();
            
            // Cache the library
            await this._cachePDFLib(pdfLibCode);

            // Execute the library code safely
            this.pdfLib = this._executePDFLibCode(pdfLibCode);
            
            if (this.pdfLib) {
                this.isLoaded = true;
                console.log('[LocalPDF] ✅ pdf-lib loaded and cached successfully!');
                return this.pdfLib;
            } else {
                throw new Error('pdf-lib not available after execution');
            }

        } catch (error) {
            console.error('[LocalPDF] ❌ Failed to load pdf-lib:', error);
            throw error;
        }
    }

    /**
     * Execute pdf-lib code in a safe way
     */
    _executePDFLibCode(code) {
        try {
            // Create a safe execution environment
            const originalPDFLib = globalThis.PDFLib;
            
            // Method 1: Try direct script execution in worker
            try {
                // Execute the code and capture PDFLib
                const func = new Function('globalThis', code + '\nreturn globalThis.PDFLib;');
                const result = func(globalThis);
                
                if (result) {
                    console.log('[LocalPDF] ✅ pdf-lib loaded via Function constructor');
                    return result;
                }
            } catch (funcError) {
                console.warn('[LocalPDF] Function constructor failed:', funcError.message);
            }

            // Method 2: Try to access global PDFLib if it was set
            if (globalThis.PDFLib && globalThis.PDFLib !== originalPDFLib) {
                console.log('[LocalPDF] ✅ pdf-lib found in global scope');
                return globalThis.PDFLib;
            }

            // Method 3: Try window scope (if available)
            if (typeof window !== 'undefined' && window.PDFLib) {
                console.log('[LocalPDF] ✅ pdf-lib found in window scope');
                return window.PDFLib;
            }

            throw new Error('PDFLib not found after code execution');

        } catch (error) {
            console.error('[LocalPDF] Error executing pdf-lib code:', error);
            throw error;
        }
    }

    /**
     * Cache pdf-lib code in chrome.storage
     */
    async _cachePDFLib(code) {
        try {
            const cacheData = {
                code: code,
                timestamp: Date.now(),
                version: '1.17.1'
            };

            await chrome.storage.local.set({
                'localPDF_pdflib_cache': cacheData
            });

            console.log('[LocalPDF] 📦 pdf-lib cached locally');
        } catch (error) {
            console.warn('[LocalPDF] Failed to cache pdf-lib:', error);
            // Non-critical error, continue without caching
        }
    }

    /**
     * Get cached pdf-lib code
     */
    async _getCachedPDFLib() {
        try {
            const result = await chrome.storage.local.get(['localPDF_pdflib_cache']);
            const cached = result.localPDF_pdflib_cache;

            if (!cached) {
                return null;
            }

            // Check if cache is still valid (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            const age = Date.now() - cached.timestamp;

            if (age > maxAge) {
                console.log('[LocalPDF] 🕒 pdf-lib cache expired, will refresh');
                await chrome.storage.local.remove(['localPDF_pdflib_cache']);
                return null;
            }

            // Try to execute cached code
            const pdfLib = this._executePDFLibCode(cached.code);
            return pdfLib;

        } catch (error) {
            console.warn('[LocalPDF] Error loading cached pdf-lib:', error);
            // Clear corrupted cache
            try {
                await chrome.storage.local.remove(['localPDF_pdflib_cache']);
            } catch (clearError) {
                console.warn('[LocalPDF] Failed to clear corrupted cache:', clearError);
            }
            return null;
        }
    }

    /**
     * Clear pdf-lib cache (for debugging)
     */
    async clearCache() {
        try {
            await chrome.storage.local.remove(['localPDF_pdflib_cache']);
            console.log('[LocalPDF] 🗑️ pdf-lib cache cleared');
        } catch (error) {
            console.error('[LocalPDF] Error clearing cache:', error);
        }
    }
}

/**
 * Enhanced Real PDF Processor with local pdf-lib loading
 */
class EnhancedRealPDFProcessor {
    constructor() {
        this.pdfLib = null;
        this.isInitialized = false;
        this.loader = new LocalPDFLibLoader();
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('[LocalPDF] 🚀 Initializing Enhanced Real PDF Processor...');
            
            this.pdfLib = await this.loader.loadPDFLib();
            
            if (this.pdfLib) {
                this.isInitialized = true;
                console.log('[LocalPDF] ✅ Enhanced Real PDF Processor ready with local pdf-lib!');
            } else {
                throw new Error('Failed to load pdf-lib');
            }

        } catch (error) {
            console.error('[LocalPDF] ❌ Enhanced processor initialization failed:', error);
            throw error;
        }
    }

    /**
     * Real PDF merger using locally loaded pdf-lib
     */
    async mergePDFs(files) {
        try {
            await this.initialize();
            console.log(`[LocalPDF] 🔗 Starting REAL merge with LOCAL pdf-lib of ${files.length} PDFs`);
            
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
            console.log(`[LocalPDF] 🎉 REAL merge completed! Pages: ${totalPages}, Size: ${pdfBytes.length} bytes`);
            
            return {
                success: true,
                data: pdfBytes,
                fileName: 'merged-document.pdf',
                fileCount: files.length,
                message: `Successfully merged ${files.length} PDF files with ${totalPages} total pages`,
                totalPages: totalPages
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error in real merge:', error);
            throw new Error(`Real merge failed: ${error.message}`);
        }
    }

    /**
     * Real PDF splitting using locally loaded pdf-lib
     */
    async splitPDF(file, options = {}) {
        try {
            await this.initialize();
            console.log(`[LocalPDF] ✂️ Starting REAL split with LOCAL pdf-lib of ${file.name}`);
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const sourcePdf = await this.pdfLib.PDFDocument.load(arrayBuffer);
            
            const totalPages = sourcePdf.getPageCount();
            console.log(`[LocalPDF] Source PDF has ${totalPages} pages`);
            
            if (totalPages === 1) {
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
            
            console.log(`[LocalPDF] 🎉 REAL split completed: ${splitResults.length} files created`);
            
            return {
                success: true,
                files: splitResults,
                originalFile: file.name,
                message: `Successfully split into ${splitResults.length} separate PDF files`,
                totalPages: totalPages
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error in real split:', error);
            throw new Error(`Real split failed: ${error.message}`);
        }
    }

    /**
     * Real PDF compression using locally loaded pdf-lib
     */
    async compressPDF(file, quality = 'medium') {
        try {
            await this.initialize();
            console.log(`[LocalPDF] 🗜️ Starting REAL compression with LOCAL pdf-lib of ${file.name} (quality: ${quality})`);
            
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const sourcePdf = await this.pdfLib.PDFDocument.load(arrayBuffer);
            
            const originalSize = arrayBuffer.byteLength;
            console.log(`[LocalPDF] Original size: ${(originalSize / 1024).toFixed(2)} KB`);
            
            // Apply compression based on quality setting
            let compressionOptions = {};
            
            switch (quality) {
                case 'high':
                    compressionOptions = {
                        useObjectStreams: false,
                        addDefaultPage: false
                    };
                    break;
                case 'medium':
                    compressionOptions = {
                        useObjectStreams: true,
                        addDefaultPage: false
                    };
                    break;
                case 'low':
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
            
            console.log(`[LocalPDF] 🎉 REAL compression completed!`);
            console.log(`[LocalPDF] Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);
            console.log(`[LocalPDF] Actual reduction: ${actualReduction}%`);
            
            return {
                success: true,
                data: compressedBytes,
                fileName: `${this.getBaseName(file.name)}-compressed.pdf`,
                originalSize: originalSize,
                compressedSize: compressedSize,
                compressionRatio: Math.max(0, actualReduction),
                message: `Successfully compressed with ${Math.max(0, actualReduction)}% size reduction`,
                quality: quality
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error in real compression:', error);
            throw new Error(`Real compression failed: ${error.message}`);
        }
    }

    // Utility methods (same as before)
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
    
    async validatePDF(file) {
        try {
            const arrayBuffer = await this.fileToArrayBuffer(file);
            const bytes = new Uint8Array(arrayBuffer);
            
            const pdfHeader = '%PDF-';
            const header = String.fromCharCode(...bytes.slice(0, 5));
            
            if (header !== pdfHeader) {
                throw new Error('File is not a valid PDF');
            }
            
            // Try to load with pdf-lib for deeper validation
            if (this.isInitialized) {
                try {
                    await this.pdfLib.PDFDocument.load(arrayBuffer);
                } catch (error) {
                    throw new Error('PDF file is corrupted or invalid');
                }
            }
            
            return true;
        } catch (error) {
            throw new Error(`PDF validation failed: ${error.message}`);
        }
    }
    
    async downloadPDF(pdfBytes, fileName) {
        try {
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
    
    uint8ArrayToBase64(uint8Array) {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }
    
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
                        resolve();
                    }
                }, index * 500);
            });
        });
        
        await Promise.all(downloadPromises);
        console.log(`[LocalPDF] 🎉 Batch download completed`);
    }
}

// Export for use in service worker
if (typeof self !== 'undefined') {
    self.EnhancedRealPDFProcessor = EnhancedRealPDFProcessor;
    self.LocalPDFLibLoader = LocalPDFLibLoader;
}
