/// <reference types="chrome"/>
console.log('LocalPDF: Content script loaded');

// Smart Injection: If we are on LocalPDF app and came from extension,
// find the hidden file input and inject the document without app's help.
if (window.location.hostname.includes('localpdf.online') || window.location.hostname.includes('localhost')) {
    const handleInjection = () => {
        const hash = window.location.hash.slice(1);
        if (hash.includes('url=') && hash.includes('from=extension')) {
            console.log('LocalPDF: Extension detected app with ingestion URL. Starting smart injection...');

            // More robust param extraction from hash
            const queryString = hash.includes('?') ? hash.split('?')[1] : hash;
            const params = new URLSearchParams(queryString);
            const fileUrl = params.get('url');

            if (fileUrl) {
                console.log('LocalPDF: Target file URL found:', fileUrl);

                // Fetch the file as soon as possible via background script
                chrome.runtime.sendMessage({ action: 'fetchUrl', url: fileUrl }, async (response) => {
                    if (response && response.success) {
                        console.log('LocalPDF: Proxy fetch successful. Waiting for file input to appear...');

                        try {
                            const res = await fetch(response.data);
                            const blob = await res.blob();

                            let fileName = 'document.pdf';
                            try {
                                const urlPath = new URL(fileUrl).pathname;
                                const encodedName = urlPath.split('/').pop() || 'document.pdf';
                                // Decode URL characters and normalize to NFC (standard for most systems/browsers)
                                fileName = decodeURIComponent(encodedName).normalize('NFC');

                                if (!fileName.toLowerCase().endsWith('.pdf')) fileName += '.pdf';
                                console.log('LocalPDF: Extracted filename:', fileName);
                            } catch (e) {
                                console.warn('LocalPDF: Failed to extract/decode filename, using default.', e);
                            }

                            const file = new File([blob], fileName, { type: 'application/pdf' });

                            // Poll for the file input
                            let attempts = 0;
                            const maxAttempts = 20; // 10 seconds total (500ms intervals)

                            const pollForInput = setInterval(() => {
                                attempts++;

                                // Re-query the input every time to ensure we have the latest/attached element
                                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

                                if (fileInput) {
                                    clearInterval(pollForInput);
                                    console.log('LocalPDF: File input found. Injecting file content...');

                                    const dataTransfer = new DataTransfer();
                                    dataTransfer.items.add(file);
                                    fileInput.files = dataTransfer.files;

                                    // Dispatch multiple events to ensure React and other frameworks catch the change
                                    fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

                                    console.log('LocalPDF: File injected successfully!');

                                    // Clean up hash to prevent double-injection
                                    const cleanHash = window.location.hash.includes('?')
                                        ? window.location.hash.split('?')[0]
                                        : window.location.hash;
                                    window.history.replaceState(null, '', cleanHash);
                                } else if (attempts >= maxAttempts) {
                                    clearInterval(pollForInput);
                                    console.error('LocalPDF: Smart injection timed out waiting for file input');
                                }
                            }, 500);
                        } catch (e) {
                            console.error('LocalPDF: Injection failed during conversion', e);
                        }
                    } else {
                        console.error('LocalPDF: Proxy fetch failed for injection', response?.error);
                    }
                });
            }
        }
    };

    // Run on initial load and on hash changes
    handleInjection();
    window.addEventListener('hashchange', handleInjection);
}

const isPDF = () => {
    return document.contentType === 'application/pdf' ||
        window.location.pathname.toLowerCase().endsWith('.pdf');
};

if (isPDF()) {
    console.log('LocalPDF: PDF detected, injecting overlay...');

    // Create Shadow DOM container
    const container = document.createElement('div');
    container.id = 'localpdf-overlay-root';
    document.body.appendChild(container);

    const shadow = container.attachShadow({ mode: 'open' });

    // Inject styles (Liquid Glass + Photoshop Sidebar)
    const style = document.createElement('style');
    style.textContent = `
        :host {
            all: initial;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .localpdf-fab {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 80px;
            height: 80px;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000000;
            transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
            user-select: none;
            animation: fab-pulse 2.5s infinite ease-in-out;
        }
        .localpdf-fab svg {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4));
            transition: transform 0.3s ease;
        }
        @keyframes fab-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .localpdf-fab:hover {
            transform: translateY(-4px) !important;
            animation-play-state: paused;
        }
        .localpdf-fab:hover svg {
            transform: scale(1.1);
        }
        .localpdf-fab.active {
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
        }
        .localpdf-sidebar {
            position: fixed;
            top: 0;
            right: -350px;
            width: 320px;
            height: 100vh;
            background: rgba(10, 10, 15, 0.85);
            backdrop-filter: blur(20px) saturate(150%);
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000001;
            transition: right 0.5s cubic-bezier(0.19, 1, 0.22, 1);
            display: flex;
            flex-direction: column;
            color: white;
            box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
        }
        .localpdf-sidebar.open {
            right: 0;
        }
        .sidebar-header {
            padding: 30px 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(10, 10, 15, 0.4);
        }
        .header-brand {
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .header-brand h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: white;
            line-height: 1;
            letter-spacing: -0.5px;
        }
        .header-brand .subtitle {
            margin-top: 2px;
            font-size: 13px;
            font-weight: 700;
            color: #58a6ff;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .header-logo {
            width: 42px;
            height: 42px;
            filter: drop-shadow(0 0 12px rgba(88, 166, 255, 0.4));
        }
        .close-btn {
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        .sidebar-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        .tool-category {
            margin-bottom: 25px;
        }
        .category-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 12px;
            display: block;
        }
        .tool-btn {
            width: 100%;
            padding: 14px 18px;
            margin-bottom: 10px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            text-align: left;
        }
        .tool-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(0, 255, 255, 0.2);
            color: white;
            transform: translateX(5px);
        }
        .tool-icon {
            font-size: 18px;
        }
        .sidebar-footer {
            padding: 20px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.3);
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .badge-premium {
            font-size: 9px;
            background: linear-gradient(135deg, #00ffff, #0080ff);
            padding: 2px 6px;
            border-radius: 4px;
            color: black;
            font-weight: 800;
            margin-left: auto;
        }
        .tool-icon-svg {
            width: 18px;
            height: 18px;
            color: rgba(255, 255, 255, 0.6);
            transition: color 0.2s;
        }
        .tool-btn:hover .tool-icon-svg {
            color: #58a6ff;
        }
    `;
    shadow.appendChild(style);

    const ICONS = {
        sign: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tool-icon-svg"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
        edit: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tool-icon-svg"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 5 5"/><path d="m8.5 8.5 7 7"/></svg>',
        ocr: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tool-icon-svg"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>',
        split: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tool-icon-svg"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
        organize: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tool-icon-svg"><path d="M20 13V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v7"/><path d="M4 8v11a2 2 0 0 0 2 2h10"/><path d="M8 15h4"/><path d="M8 19h2"/></svg>',
        diamond: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tool-icon-svg"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.4l8.6 8.6a2.41 2.41 0 0 0 3.4 0l8.6-8.6a2.41 2.41 0 0 0 0-3.4l-8.6-8.6a2.41 2.41 0 0 0-3.4 0Z"/></svg>'
    };

    // Create Sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'localpdf-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <img src="${chrome.runtime.getURL('logo.png')}" class="header-logo" alt="Logo">
            <div class="header-brand">
                <h2>LocalPDF</h2>
                <span class="subtitle">SANCTUARY</span>
            </div>
            <div class="close-btn" id="close-sidebar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
        </div>
        <div class="sidebar-content">
            <div class="tool-category">
                <span class="category-label">Quick Actions</span>
                <button class="tool-btn" data-tool="sign">
                    ${ICONS.sign}
                    <span>Sign Document</span>
                </button>
                <button class="tool-btn" data-tool="add-text">
                    ${ICONS.edit}
                    <span>Add Text / Note</span>
                </button>
            </div>
            <div class="tool-category">
                <span class="category-label">Advanced Tools</span>
                <button class="tool-btn" data-tool="ocr">
                    ${ICONS.ocr}
                    <span>OCR Recognition</span>
                    <span class="badge-premium">AI</span>
                </button>
                <button class="tool-btn" data-tool="split">
                    ${ICONS.split}
                    <span>Split / Extract</span>
                </button>
                <button class="tool-btn" data-tool="organize">
                    ${ICONS.organize}
                    <span>Organize Pages</span>
                </button>
            </div>
            <div class="tool-category" style="margin-top: auto;">
                <button class="tool-btn" style="background: rgba(0, 255, 255, 0.1); border-color: rgba(0, 255, 255, 0.2);" data-tool="full">
                    ${ICONS.diamond}
                    <span style="font-weight: 600;">Full Editor</span>
                </button>
            </div>
        </div>
        <div class="sidebar-footer">
            Private Sanctuary v2.0.0
        </div>
    `;

    // Create FAB
    const fab = document.createElement('div');
    fab.className = 'localpdf-fab';
    fab.innerHTML = `
<svg width="80" height="80" viewBox="0 0 128 128">
  <defs>
    <radialGradient id="lens" cx="38%" cy="32%" r="78%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="42%" stop-color="#B5ECFF" stop-opacity="0.12"/>
      <stop offset="70%" stop-color="#2C6BFF" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#050915" stop-opacity="0.40"/>
    </radialGradient>

    <radialGradient id="rim" cx="40%" cy="35%" r="85%">
      <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0"/>
      <stop offset="82%" stop-color="#FFFFFF" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#7AD6FF" stop-opacity="0.22"/>
    </radialGradient>

    <radialGradient id="innerDepth" cx="50%" cy="55%" r="80%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.28"/>
    </radialGradient>

    <radialGradient id="glow" cx="38%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#7FE3FF" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="#3D7BFF" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.55"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#6FDFFF" flood-opacity="0.20"/>
    </filter>

    <filter id="noise" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 0.06 0"/>
    </filter>

    <clipPath id="clip">
      <circle cx="64" cy="64" r="54"/>
    </clipPath>
  </defs>

  <!-- Glow -->
  <circle cx="64" cy="64" r="60" fill="url(#glow)" opacity="0.9"/>

  <!-- Glass orb -->
  <g filter="url(#shadow)">
    <circle cx="64" cy="64" r="54" fill="url(#lens)"/>
    <circle cx="64" cy="64" r="54" fill="url(#rim)"/>
    <circle cx="64" cy="64" r="54" fill="url(#innerDepth)"/>
  </g>

  <!-- Internal reflections -->
  <ellipse cx="46" cy="42" rx="18" ry="14" fill="#FFFFFF" opacity="0.18"/>
  <ellipse cx="40" cy="36" rx="8" ry="6" fill="#FFFFFF" opacity="0.18"/>

  <!-- Noise -->
  <g clip-path="url(#clip)" opacity="0.65">
    <rect x="0" y="0" width="128" height="128" filter="url(#noise)"/>
  </g>

  <!-- Text -->
  <g text-anchor="middle"
     font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial">
    <text x="64" y="62"
          font-size="17"
          font-weight="700"
          fill="#FFFFFF"
          opacity="0.96">
      LocalPDF
    </text>
    <text x="64" y="77"
          font-size="11"
          font-weight="700"
          letter-spacing="1"
          fill="#7CCBFF"
          opacity="0.95">
      SANCTUARY
    </text>
  </g>
</svg>
    `;

    // Append elements first so we can find them in the shadow DOM
    shadow.appendChild(sidebar);
    shadow.appendChild(fab);

    // Toggle Logic
    const toggleSidebar = (open: boolean) => {
        if (open) {
            sidebar.classList.add('open');
            fab.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            fab.classList.remove('active');
        }
    };

    // Dragging Logic
    let isDragging = false;
    let startX: number, startY: number;
    let initialRight: number, initialBottom: number;

    // Load saved position
    chrome.storage.local.get(['fabPosition'], (result) => {
        if (result.fabPosition) {
            fab.style.right = result.fabPosition.right;
            fab.style.bottom = result.fabPosition.bottom;
            fab.style.left = 'auto'; // Ensure we use right/bottom
            fab.style.top = 'auto';
        }
    });

    fab.onmousedown = (e) => {
        isDragging = false; // Reset dragging flag
        startX = e.clientX;
        startY = e.clientY;

        const rect = fab.getBoundingClientRect();
        initialRight = window.innerWidth - rect.right;
        initialBottom = window.innerHeight - rect.bottom;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const dx = startX - moveEvent.clientX;
            const dy = startY - moveEvent.clientY;

            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                isDragging = true;
                fab.style.transition = 'none'; // Disable transition during drag
                fab.style.right = `${initialRight + dx}px`;
                fab.style.bottom = `${initialBottom + dy}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (isDragging) {
                fab.style.transition = ''; // Re-enable transition
                // Save position
                chrome.storage.local.set({
                    fabPosition: {
                        right: fab.style.right,
                        bottom: fab.style.bottom
                    }
                });
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    fab.onclick = (e) => {
        if (!isDragging) {
            toggleSidebar(true);
        }
    };

    // Use shadow.getElementById after elements are appended
    const closeBtn = shadow.getElementById('close-sidebar');
    if (closeBtn) {
        closeBtn.onclick = () => toggleSidebar(false);
    }

    // Tool Handling Logic
    const handleTool = async (tool: string) => {
        console.log(`LocalPDF: Opening tool ${tool}`);

        const btn = shadow.querySelector(`[data-tool="${tool}"]`) as HTMLElement;
        if (!btn) return;

        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span>⌛ Redirecting...</span>';

        const baseUrl = 'https://localpdf.online/app';
        const toolMap: Record<string, string> = {
            'sign': 'sign',
            'add-text': 'edit-text',
            'ocr': 'ocr',
            'split': 'split',
            'organize': 'organize',
            'full': ''
        };

        const path = toolMap[tool] || '';
        const currentUrl = window.location.href;
        const targetUrl = `${baseUrl}/#${path}?url=${encodeURIComponent(currentUrl)}&from=extension`;

        try {
            if (window.location.protocol === 'file:') {
                console.log('LocalPDF: Local file mode. Opening app for manual upload.');
            } else {
                // For web PDFs, we could potentially pass them, but for now
                // we'll just redirect to the tool page.
            }
        } catch (error) {
            console.warn('LocalPDF: Pre-fetch failed, redirecting anyway.', error);
        }

        // Always redirect
        window.open(targetUrl, '_blank');

        // Reset button and close sidebar
        setTimeout(() => {
            btn.innerHTML = originalContent;
            toggleSidebar(false);
        }, 500);
    };

    shadow.querySelectorAll('.tool-btn').forEach(btn => {
        (btn as HTMLElement).onclick = () => {
            const tool = (btn as HTMLElement).getAttribute('data-tool');
            if (tool) handleTool(tool);
        };
    });
}
