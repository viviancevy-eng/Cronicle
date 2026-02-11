document.addEventListener('DOMContentLoaded', () => {
    const videoUrlInput = document.getElementById('videoUrl');
    const downloadBtn = document.getElementById('downloadBtn');
    const resultCard = document.getElementById('resultCard');
    const statusMessage = document.getElementById('statusMessage');
    const apisyuLinkContainer = document.getElementById('apisyuLink');

    // Result Metadata Elements
    const videoThumb = document.getElementById('videoThumb');
    const videoTitle = document.getElementById('videoTitle');
    const videoAuthor = document.getElementById('videoAuthor');

    function updateDownloaderWidget(id) {
        apisyuLinkContainer.innerHTML = `
            <div class="download-section">
                <div class="download-header">
                    <ion-icon name="download-outline"></ion-icon>
                    <span>Download Options</span>
                </div>
                <div class="apisyu-widget">
                    <iframe 
                        src="https://apisyu.com/widget/${id}" 
                        width="100%" 
                        height="500" 
                        frameborder="0" 
                        allowfullscreen
                        scrolling="yes"
                        style="border-radius: 12px; background: rgba(255,255,255,0.05);">
                    </iframe>
                </div>
            </div>
        `;
    }

    function getYouTubeID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    downloadBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            showStatus('Please paste a link first.', 'error');
            return;
        }

        const videoId = getYouTubeID(url);
        if (!videoId) {
            showStatus('Please enter a valid YouTube URL.', 'error');
            return;
        }

        downloadBtn.disabled = true;
        const originalBtnText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `<span>Searching...</span> <div class="loader"></div>`;
        statusMessage.textContent = 'Connecting to high-speed servers...';
        resultCard.classList.add('hidden');

        try {
            // Fetch metadata via CORS-friendly provider
            const infoRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const info = await infoRes.json();

            videoThumb.src = info.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            videoTitle.textContent = info.title || 'YouTube Video';
            videoAuthor.textContent = info.author_name || 'Content Creator';

            // Show downloader widget
            updateDownloaderWidget(videoId);

            resultCard.classList.remove('hidden');
            statusMessage.textContent = '';
            
            if (window.innerWidth < 768) resultCard.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            // Fallback metadata + Widget
            videoThumb.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            videoTitle.textContent = 'Ready for Download';
            videoAuthor.textContent = 'YouTube Content';
            updateDownloaderWidget(videoId);
            resultCard.classList.remove('hidden');
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = originalBtnText;
        }
    });

    function showStatus(msg, type) {
        statusMessage.textContent = msg;
        if (type === 'error') {
            statusMessage.style.color = '#f87171';
        } else if (type === 'success') {
            statusMessage.style.color = '#34d399';
        } else {
            statusMessage.style.color = '#2dd4bf';
        }
        setTimeout(() => {
            if (statusMessage.textContent === msg) statusMessage.textContent = '';
        }, 5000);
    }

    // Style for loader (keep here for dynamic loading if needed, or move to CSS)
    const styleSheet = document.createElement('style');
    styleSheet.innerText = `
        .loader { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(styleSheet);
});
