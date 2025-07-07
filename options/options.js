/**
 * LocalPDF Extension - Options Page Controller
 * Handles settings management and user preferences
 */

class LocalPDFOptions {
    constructor() {
        this.settings = {};
        this.defaultSettings = {
            version: '0.1.0',
            theme: 'light',
            autoClose: true,
            compressionQuality: 'medium',
            notifications: true,
            shortcuts: true,
            splitNaming: 'page-numbers',
            preserveMetadata: true,
            maxFileSize: 100,
            clearCache: true,
            anonymizePdfs: false,
            workerThreads: 'auto',
            debugMode: false,
            experimentalFeatures: false
        };
        
        this.init();
    }

    /**
     * Initialize options page
     */
    async init() {
        try {
            await this.loadSettings();
            this.setupEventListeners();
            this.populateForm();
            this.updateStorageInfo();
            
            console.log('[LocalPDF Options] Options page initialized');
        } catch (error) {
            console.error('[LocalPDF Options] Error initializing:', error);
            this.showToast('Error loading settings', 'error');
        }
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['localPDFSettings']);
            this.settings = { ...this.defaultSettings, ...result.localPDFSettings };
        } catch (error) {
            console.error('[LocalPDF Options] Error loading settings:', error);
            this.settings = { ...this.defaultSettings };
        }
    }

    /**
     * Save settings to storage
     */
    async saveSettings() {
        try {
            await chrome.storage.sync.set({ localPDFSettings: this.settings });
            this.showToast('Settings saved successfully!', 'success');
            console.log('[LocalPDF Options] Settings saved:', this.settings);
        } catch (error) {
            console.error('[LocalPDF Options] Error saving settings:', error);
            this.showToast('Error saving settings', 'error');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save settings button
        document.getElementById('save-settings').addEventListener('click', () => {
            this.collectFormData();
            this.saveSettings();
        });

        // Reset settings button
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Clear cache button
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.clearCache();
        });

        // Export settings button
        document.getElementById('export-settings-btn').addEventListener('click', () => {
            this.exportSettings();
        });

        // Import settings button
        document.getElementById('import-settings-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        // Import file input
        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.importSettings(e.target.files[0]);
        });

        // Range input for max file size
        const maxFileSizeRange = document.getElementById('max-file-size');
        const maxFileSizeValue = document.getElementById('max-file-size-value');
        
        maxFileSizeRange.addEventListener('input', (e) => {
            maxFileSizeValue.textContent = e.target.value;
        });

        // Theme change handler
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
        });

        // Toast close button
        document.getElementById('toast-close').addEventListener('click', () => {
            this.hideToast();
        });

        // Auto-save on form changes (optional)
        this.setupAutoSave();
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        const formElements = document.querySelectorAll('input, select');
        
        formElements.forEach(element => {
            element.addEventListener('change', () => {
                // Debounce auto-save
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.collectFormData();
                    this.saveSettings();
                }, 1000);
            });
        });
    }

    /**
     * Populate form with current settings
     */
    populateForm() {
        try {
            // General settings
            document.getElementById('theme-select').value = this.settings.theme;
            document.getElementById('auto-close').checked = this.settings.autoClose;
            document.getElementById('notifications').checked = this.settings.notifications;
            document.getElementById('keyboard-shortcuts').checked = this.settings.shortcuts;

            // PDF processing settings
            document.getElementById('compression-quality').value = this.settings.compressionQuality;
            document.getElementById('split-naming').value = this.settings.splitNaming;
            document.getElementById('preserve-metadata').checked = this.settings.preserveMetadata;
            document.getElementById('max-file-size').value = this.settings.maxFileSize;
            document.getElementById('max-file-size-value').textContent = this.settings.maxFileSize;

            // Privacy settings
            document.getElementById('clear-cache').checked = this.settings.clearCache;
            document.getElementById('anonymize-pdfs').checked = this.settings.anonymizePdfs;

            // Advanced settings
            document.getElementById('worker-threads').value = this.settings.workerThreads;
            document.getElementById('debug-mode').checked = this.settings.debugMode;
            document.getElementById('experimental-features').checked = this.settings.experimentalFeatures;

            // Apply current theme
            this.applyTheme(this.settings.theme);

        } catch (error) {
            console.error('[LocalPDF Options] Error populating form:', error);
        }
    }

    /**
     * Collect data from form
     */
    collectFormData() {
        try {
            this.settings = {
                ...this.settings,
                theme: document.getElementById('theme-select').value,
                autoClose: document.getElementById('auto-close').checked,
                notifications: document.getElementById('notifications').checked,
                shortcuts: document.getElementById('keyboard-shortcuts').checked,
                compressionQuality: document.getElementById('compression-quality').value,
                splitNaming: document.getElementById('split-naming').value,
                preserveMetadata: document.getElementById('preserve-metadata').checked,
                maxFileSize: parseInt(document.getElementById('max-file-size').value),
                clearCache: document.getElementById('clear-cache').checked,
                anonymizePdfs: document.getElementById('anonymize-pdfs').checked,
                workerThreads: document.getElementById('worker-threads').value,
                debugMode: document.getElementById('debug-mode').checked,
                experimentalFeatures: document.getElementById('experimental-features').checked
            };
        } catch (error) {
            console.error('[LocalPDF Options] Error collecting form data:', error);
        }
    }

    /**
     * Reset settings to defaults
     */
    async resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.settings = { ...this.defaultSettings };
            this.populateForm();
            await this.saveSettings();
        }
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        document.body.classList.add(`theme-${theme}`);
    }

    /**
     * Update storage info display
     */
    async updateStorageInfo() {
        try {
            // Get storage usage
            const storageData = await chrome.storage.sync.get(null);
            const storageSize = JSON.stringify(storageData).length;
            
            document.getElementById('storage-usage').textContent = `${(storageSize / 1024).toFixed(2)} KB`;
            
            // Update cache size (placeholder)
            document.getElementById('cache-size').textContent = '0 files';
            
        } catch (error) {
            console.error('[LocalPDF Options] Error updating storage info:', error);
            document.getElementById('storage-usage').textContent = 'Unknown';
        }
    }

    /**
     * Clear cache
     */
    async clearCache() {
        try {
            // Clear any cached data (placeholder implementation)
            // In real implementation, this would clear temporary PDF files
            
            this.showToast('Cache cleared successfully!', 'success');
            this.updateStorageInfo();
            
        } catch (error) {
            console.error('[LocalPDF Options] Error clearing cache:', error);
            this.showToast('Error clearing cache', 'error');
        }
    }

    /**
     * Export settings to JSON file
     */
    exportSettings() {
        try {
            const exportData = {
                version: this.settings.version,
                exportDate: new Date().toISOString(),
                settings: this.settings
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `localpdf-settings-${new Date().getDate()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Settings exported successfully!', 'success');
            
        } catch (error) {
            console.error('[LocalPDF Options] Error exporting settings:', error);
            this.showToast('Error exporting settings', 'error');
        }
    }

    /**
     * Import settings from JSON file
     */
    async importSettings(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (importData.settings) {
                this.settings = { ...this.defaultSettings, ...importData.settings };
                this.populateForm();
                await this.saveSettings();
                this.showToast('Settings imported successfully!', 'success');
            } else {
                throw new Error('Invalid settings file format');
            }
            
        } catch (error) {
            console.error('[LocalPDF Options] Error importing settings:', error);
            this.showToast('Error importing settings', 'error');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const messageEl = document.getElementById('toast-message');
        
        messageEl.textContent = message;
        toast.style.display = 'flex';
        
        // Change color based on type
        if (type === 'error') {
            toast.style.background = '#e53e3e';
        } else {
            toast.style.background = '#48bb78';
        }
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideToast();
        }, 3000);
    }

    /**
     * Hide toast notification
     */
    hideToast() {
        document.getElementById('toast').style.display = 'none';
    }
}

// Initialize options page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LocalPDFOptions();
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect && themeSelect.value === 'auto') {
        const theme = e.matches ? 'dark' : 'light';
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
    }
});