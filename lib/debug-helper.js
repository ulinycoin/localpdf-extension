/**
 * LocalPDF Extension Debug Helper
 * Enhanced logging and debugging tools for troubleshooting
 */

class LocalPDFDebug {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.debugMode = true; // Enable by default for development
    }

    /**
     * Enhanced logging with timestamps and levels
     */
    log(level, component, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            component,
            message,
            data: data ? JSON.stringify(data) : null
        };

        this.logs.push(logEntry);
        
        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with color coding
        const colors = {
            ERROR: 'color: red; font-weight: bold;',
            WARN: 'color: orange; font-weight: bold;',
            INFO: 'color: blue;',
            DEBUG: 'color: gray;',
            SUCCESS: 'color: green; font-weight: bold;'
        };

        const style = colors[level] || '';
        console.log(
            `%c[LocalPDF ${level}] ${component}: ${message}`, 
            style,
            data || ''
        );

        // Store in chrome.storage for persistent debugging
        this.saveLogs();
    }

    /**
     * Convenience methods for different log levels
     */
    error(component, message, data) {
        this.log('ERROR', component, message, data);
    }

    warn(component, message, data) {
        this.log('WARN', component, message, data);
    }

    info(component, message, data) {
        this.log('INFO', component, message, data);
    }

    debug(component, message, data) {
        if (this.debugMode) {
            this.log('DEBUG', component, message, data);
        }
    }

    success(component, message, data) {
        this.log('SUCCESS', component, message, data);
    }

    /**
     * Performance timing helpers
     */
    startTimer(operation) {
        const timer = `LocalPDF-${operation}`;
        console.time(timer);
        this.debug('TIMER', `Started: ${operation}`);
        return timer;
    }

    endTimer(timer, component = 'TIMER') {
        console.timeEnd(timer);
        this.debug(component, `Completed: ${timer}`);
    }

    /**
     * File processing debug info
     */
    logFileInfo(file, operation) {
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toISOString(),
            operation: operation
        };
        
        this.info('FILE', `Processing ${operation}`, fileInfo);
        return fileInfo;
    }

    /**
     * PDF processing specific logging
     */
    logPDFOperation(operation, input, result) {
        const operationLog = {
            operation,
            timestamp: new Date().toISOString(),
            input: {
                fileCount: Array.isArray(input) ? input.length : 1,
                totalSize: Array.isArray(input) 
                    ? input.reduce((sum, f) => sum + f.size, 0)
                    : input.size
            },
            result: {
                success: result.success,
                outputSize: result.data ? result.data.length : 0,
                message: result.message
            }
        };

        if (result.success) {
            this.success('PDF', `${operation} completed`, operationLog);
        } else {
            this.error('PDF', `${operation} failed`, operationLog);
        }
    }

    /**
     * Save logs to chrome.storage for debugging
     */
    async saveLogs() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                await chrome.storage.local.set({
                    localPDFDebugLogs: this.logs.slice(-50) // Keep last 50 logs
                });
            }
        } catch (error) {
            console.error('Failed to save debug logs:', error);
        }
    }

    /**
     * Get all logs for debugging
     */
    async getAllLogs() {
        try {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get(['localPDFDebugLogs']);
                return result.localPDFDebugLogs || [];
            }
            return this.logs;
        } catch (error) {
            console.error('Failed to get debug logs:', error);
            return this.logs;
        }
    }

    /**
     * Export logs for sharing/debugging
     */
    async exportLogs() {
        const logs = await this.getAllLogs();
        const exportData = {
            extension: 'LocalPDF',
            version: '0.1.0',
            exportTime: new Date().toISOString(),
            browser: navigator.userAgent,
            logs: logs
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (typeof chrome !== 'undefined' && chrome.downloads) {
            await chrome.downloads.download({
                url: url,
                filename: `localpdf-debug-${timestamp}.json`,
                saveAs: true
            });
        }
        
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        
        this.info('DEBUG', 'Logs exported successfully');
    }

    /**
     * Clear all logs
     */
    async clearLogs() {
        this.logs = [];
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.remove(['localPDFDebugLogs']);
        }
        this.info('DEBUG', 'All logs cleared');
    }

    /**
     * System info for debugging
     */
    getSystemInfo() {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            timestamp: new Date().toISOString()
        };

        if (typeof chrome !== 'undefined') {
            info.chromeRuntime = !!chrome.runtime;
            info.chromeStorage = !!chrome.storage;
            info.chromeDownloads = !!chrome.downloads;
            info.chromeNotifications = !!chrome.notifications;
        }

        this.info('SYSTEM', 'System information collected', info);
        return info;
    }

    /**
     * Extension state debugging
     */
    async debugExtensionState() {
        const state = {
            timestamp: new Date().toISOString(),
            system: this.getSystemInfo(),
            logs: await this.getAllLogs(),
            recentErrors: this.logs.filter(log => log.level === 'ERROR').slice(-10)
        };

        if (typeof chrome !== 'undefined' && chrome.storage) {
            try {
                const settings = await chrome.storage.sync.get(['localPDFSettings']);
                state.settings = settings.localPDFSettings;
            } catch (error) {
                state.settingsError = error.message;
            }
        }

        console.group('🐛 LocalPDF Extension Debug State');
        console.log('Full state:', state);
        console.log('Recent errors:', state.recentErrors);
        console.log('Settings:', state.settings);
        console.groupEnd();

        return state;
    }
}

// Create global debug instance
const localPDFDebug = new LocalPDFDebug();

// Export for use in different contexts
if (typeof window !== 'undefined') {
    window.localPDFDebug = localPDFDebug;
} else if (typeof self !== 'undefined') {
    self.localPDFDebug = localPDFDebug;
}

// Add keyboard shortcut for debug export (Ctrl+Shift+D)
if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            localPDFDebug.exportLogs();
        }
    });
}

// Initial system info logging
localPDFDebug.info('DEBUG', 'Debug helper initialized');
localPDFDebug.getSystemInfo();
