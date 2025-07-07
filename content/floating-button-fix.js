        // Create floating button
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'localpdf-floating-btn';
        floatingBtn.innerHTML = `
            <div class="localpdf-fab">
                <span class="fab-icon">📄</span>
                <span class="localpdf-tooltip">LocalPDF Tools</span>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #localpdf-floating-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                cursor: pointer;
            }
            
            .localpdf-fab {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .localpdf-fab:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
            }
            
            .fab-icon {
                font-size: 24px;
                filter: brightness(0) invert(1);
            }
            
            .localpdf-tooltip {
                position: absolute;
                right: 60px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .localpdf-fab:hover .localpdf-tooltip {
                opacity: 1;
            }
        `;