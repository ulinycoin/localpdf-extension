    /**
     * Download processed PDF using Chrome downloads API (Manifest V3 compatible)
     */
    async downloadPDF(pdfBytes, fileName) {
        try {
            // Convert Uint8Array to base64 data URL for Manifest V3 service workers
            const base64String = this.uint8ArrayToBase64(pdfBytes);
            const dataUrl = `data:application/pdf;base64,${base64String}`;
            
            const downloadId = await chrome.downloads.download({
                url: dataUrl,
                filename: fileName,
                saveAs: false
            });
            
            console.log(`[LocalPDF] Download started: ${fileName} (ID: ${downloadId})`);
            return downloadId;
            
        } catch (error) {
            console.error('[LocalPDF] Error downloading PDF:', error);
            throw error;
        }
    }
    
    /**
     * Convert Uint8Array to base64 string for service worker compatibility
     */
    uint8ArrayToBase64(uint8Array) {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }