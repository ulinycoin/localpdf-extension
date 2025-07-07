function showNotification(title, message) {
    try {
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                title: `LocalPDF - ${title}`,
                message: message
                // Removed iconUrl to fix errors
            });
        }
    } catch (error) {
        console.log('[LocalPDF] Notification error:', error);
    }
}