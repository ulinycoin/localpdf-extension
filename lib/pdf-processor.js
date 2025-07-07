/**
 * LocalPDF Extension - PDF Processor
 * Core PDF manipulation using pdf-lib
 */

class LocalPDFProcessor {
    constructor() {
        this.PDFLib = null;
        this.isInitialized = false;
    }

    /**
     * Initialize PDF-lib library
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // PDF-lib will be loaded from CDN
            if (typeof window !== 'undefined' && window.PDFLib) {
                this.PDFLib = window.PDFLib;
            } else {
                // For service worker environment, we'll import it differently
                await this.loadPDFLib();
            }
            
            this.isInitialized = true;
            console.log('[LocalPDF] PDF processor initialized');
        } catch (error) {
            console.error('[LocalPDF] Error initializing PDF processor:', error);
            throw error;
        }
    }

    /**
     * Load PDF-lib dynamically
     */
    async loadPDFLib() {
        try {
            // Import PDF-lib from CDN
            const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js');
            const pdfLibCode = await response.text();
            
            // Evaluate the library code
            eval(pdfLibCode);
            this.PDFLib = window.PDFLib || PDFLib;
            
        } catch (error) {
            console.error('[LocalPDF] Error loading PDF-lib:', error);
            throw new Error('Failed to load PDF processing library');
        }
    }

    /**
     * Merge multiple PDF files
     */
    async mergePDFs(files) {
        await this.initialize();
        
        try {
            console.log(`[LocalPDF] Starting merge of ${files.length} PDFs`);
            
            // Create a new PDF document
            const mergedPdf = await this.PDFLib.PDFDocument.create();
            
            // Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`[LocalPDF] Processing file ${i + 1}/${files.length}: ${file.name}`);
                
                // Convert file to array buffer
                const arrayBuffer = await this.fileToArrayBuffer(file);
                
                // Load the PDF
                const pdf = await this.PDFLib.PDFDocument.load(arrayBuffer);
                
                // Get all pages from the source PDF
                const pageCount = pdf.getPageCount();
                const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
                
                // Copy pages to merged PDF
                const pages = await mergedPdf.copyPages(pdf, pageIndices);
                
                // Add pages to merged document
                pages.forEach(page => mergedPdf.addPage(page));
                
                console.log(`[LocalPDF] Added ${pageCount} pages from ${file.name}`);
            }
            
            // Generate the merged PDF
            const mergedPdfBytes = await mergedPdf.save();
            
            console.log('[LocalPDF] Merge completed successfully');
            
            return {
                success: true,
                data: mergedPdfBytes,
                fileName: 'merged-document.pdf',
                fileCount: files.length,
                totalPages: mergedPdf.getPageCount()
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error merging PDFs:', error);
            throw new Error(`Merge failed: ${error.message}`);
        }
    }

    /**
     * Split PDF into separate pages
     */
    async splitPDF(file, options = {}) {
        await this.initialize();
        
        try {
            console.log(`[LocalPDF] Starting split of ${file.name}`);
            
            // Convert file to array buffer
            const arrayBuffer = await this.fileToArrayBuffer(file);
            
            // Load the PDF
            const pdf = await this.PDFLib.PDFDocument.load(arrayBuffer);
            const pageCount = pdf.getPageCount();
            
            console.log(`[LocalPDF] PDF has ${pageCount} pages`);
            
            const splitResults = [];
            
            // Determine pages to extract
            const { startPage = 1, endPage = pageCount, splitType = 'all' } = options;
            
            if (splitType === 'all') {
                // Split into individual pages
                for (let i = 0; i < pageCount; i++) {
                    const newPdf = await this.PDFLib.PDFDocument.create();
                    const [page] = await newPdf.copyPages(pdf, [i]);
                    newPdf.addPage(page);
                    
                    const pdfBytes = await newPdf.save();
                    
                    splitResults.push({
                        data: pdfBytes,
                        fileName: `${this.getBaseName(file.name)}-page-${i + 1}.pdf`,
                        pageNumber: i + 1
                    });
                }
            } else if (splitType === 'range') {
                // Split specific range
                const newPdf = await this.PDFLib.PDFDocument.create();
                const pageIndices = Array.from(
                    { length: endPage - startPage + 1 }, 
                    (_, i) => startPage - 1 + i
                );
                
                const pages = await newPdf.copyPages(pdf, pageIndices);
                pages.forEach(page => newPdf.addPage(page));
                
                const pdfBytes = await newPdf.save();
                
                splitResults.push({
                    data: pdfBytes,
                    fileName: `${this.getBaseName(file.name)}-pages-${startPage}-${endPage}.pdf`,
                    pageRange: `${startPage}-${endPage}`
                });
            }
            
            console.log(`[LocalPDF] Split completed: ${splitResults.length} files created`);
            
            return {
                success: true,
                files: splitResults,
                originalFile: file.name,
                originalPages: pageCount
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error splitting PDF:', error);
            throw new Error(`Split failed: ${error.message}`);
        }
    }

    /**
     * Compress PDF by reducing quality
     */
    async compressPDF(file, quality = 'medium') {
        await this.initialize();
        
        try {
            console.log(`[LocalPDF] Starting compression of ${file.name} (quality: ${quality})`);
            
            // Convert file to array buffer
            const arrayBuffer = await this.fileToArrayBuffer(file);
            
            // Load the PDF
            const pdf = await this.PDFLib.PDFDocument.load(arrayBuffer);
            
            // Basic compression: just re-save the PDF
            // Note: Advanced compression would require image processing
            const compressedPdfBytes = await pdf.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: 50
            });
            
            const originalSize = arrayBuffer.byteLength;
            const compressedSize = compressedPdfBytes.byteLength;
            const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            console.log(`[LocalPDF] Compression completed: ${compressionRatio}% reduction`);
            
            return {
                success: true,
                data: compressedPdfBytes,
                fileName: `${this.getBaseName(file.name)}-compressed.pdf`,
                originalSize: originalSize,
                compressedSize: compressedSize,
                compressionRatio: compressionRatio
            };
            
        } catch (error) {
            console.error('[LocalPDF] Error compressing PDF:', error);
            throw new Error(`Compression failed: ${error.message}`);
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
     * Download processed PDF
     */
    downloadPDF(pdfBytes, fileName) {
        try {
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // For extension environment, use chrome.downloads API
            if (typeof chrome !== 'undefined' && chrome.downloads) {
                return chrome.downloads.download({
                    url: url,
                    filename: fileName,
                    saveAs: false
                });
            } else {
                // Fallback for regular web environment
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
        } catch (error) {
            console.error('[LocalPDF] Error downloading PDF:', error);
            throw error;
        }
    }
    
    /**
     * Batch download multiple files
     */
    async downloadMultiplePDFs(files) {
        const downloadPromises = files.map((file, index) => {
            return new Promise((resolve) => {
                // Add small delay between downloads to avoid overwhelming the browser
                setTimeout(() => {
                    this.downloadPDF(file.data, file.fileName);
                    resolve();
                }, index * 100);
            });
        });
        
        await Promise.all(downloadPromises);
    }
}

// Export for use in background script and popup
if (typeof window !== 'undefined') {
    window.LocalPDFProcessor = LocalPDFProcessor;
} else if (typeof self !== 'undefined') {
    self.LocalPDFProcessor = LocalPDFProcessor;
}