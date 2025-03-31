// Clipboard Paste Functionality
document.querySelectorAll('.paste-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const target = document.getElementById(btn.dataset.target);
        try {
            const text = await navigator.clipboard.readText();
            target.value = text;
        } catch (err) {
            showNotification('Failed to paste!', 'error');
        }
    });
});

// Form Submission
// Form submission handler
document.getElementById('dataForm').addEventListener('submit', e => {
    e.preventDefault();

    // YouTube ID extraction
    const extractYouTubeId = (value) => {
        value = value.trim();
        if (/^https?:\/\//i.test(value)) {
            try {
                const url = new URL(value);
                if (url.hostname.replace('www.', '') === 'youtube.com') {
                    if (url.pathname === '/watch') {
                        return url.searchParams.get('v') || value;
                    }
                    if (url.pathname.startsWith('/embed/')) {
                        return url.pathname.split('/')[2].split('?')[0] || value;
                    }
                }
                if (url.hostname === 'youtu.be') {
                    return url.pathname.split('/')[1].split('?')[0] || value;
                }
            } catch {
                return value;
            }
        }
        return value.split('?')[0];
    };

    // Fixed Movie ID extraction
    const extractMovieId = (value) => {
        value = value.trim();

        if (/^https?:\/\//i.test(value)) {
            try {
                const url = new URL(value);

                if (url.hostname.includes('imdb.com')) {
                    const imdbId = url.pathname.split('/').find(part => part.startsWith('tt'));
                    return imdbId || value;
                }

                if (url.hostname.includes('themoviedb.org')) {
                    const tmdbId = url.pathname.split('/').pop();
                    return tmdbId || value;
                }
            } catch {
                return value;
            }
        }

        return value.replace(/^.*?(tt\d{7,8}|\d+).*$/, '$1');
    };

    // Process inputs
    const ytInput = document.getElementById('yt_trailer_src').value;
    const movieIdInput = document.getElementById('main_src').value;
    const cleanMovieId = extractMovieId(movieIdInput);

    const movieData = {
        title: document.getElementById('title').value,
        poster: document.getElementById('poster').value,
        backDropPoster: document.getElementById('backDropPoster').value,
        backDropPoster2: document.getElementById('backDropPoster2').value,
        logo_img: document.getElementById('logo_img').value,
        main_src: `https://vidsrc.in/embed/movie/${cleanMovieId}`,
        own_src: document.getElementById('own_src').value,
        yt_trailer_src: `https://www.youtube.com/embed/${extractYouTubeId(ytInput)}`,
        genre: document.getElementById('genre').value.split(',').map(g => g.trim()),
        key_words: document.getElementById('key_words').value.split(',').map(k => k.trim()),
        description: document.getElementById('description').value.replace(/"/g, "'")
    };

    // Save to localStorage
    const entries = JSON.parse(localStorage.getItem('movieData') || '[]');
    entries.push(movieData);
    localStorage.setItem('movieData', JSON.stringify(entries));

    // Reset form and show success
    e.target.reset();
    showNotification('Entry saved successfully!', 'success');

    // Update display if needed
    if (typeof updateDisplay === 'function') updateDisplay();
});

// Display Management
function updateDisplay() {
    const output = document.getElementById('jsonOutput');
    const data = localStorage.getItem('movieData');
    output.textContent = data
        ? JSON.stringify(JSON.parse(data), null, 2).replace(/^\[|\]$/g, '')
        : 'No data entered yet';
}

// Copy Functionality
function copyToClipboard() {
    const output = document.getElementById('jsonOutput');
    const text = output.textContent;

    if (!text || text === 'No data entered yet') {
        showNotification('Nothing to copy!', 'warning');
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => showNotification('Copied to clipboard!', 'success'))
        .catch(() => showNotification('Copy failed!', 'error'));
}

// Clear Functionality
function showClearDialog() {
    document.querySelector('.clear-overlay').classList.add('visible');
    document.querySelector('.clear-confirm-box').classList.add('active');
}

function hideClearDialog() {
    document.querySelector('.clear-overlay').classList.remove('visible');
    document.querySelector('.clear-confirm-box').classList.remove('active');
}

function processClear() {
    localStorage.removeItem('movieData');
    document.getElementById('dataForm').reset();
    updateDisplay();
    hideClearDialog();
    showNotification('All data cleared!', 'success');
}

// Notification System
function showNotification(message, type = 'success') {
    const iconMap = {
        success: '#icon-success',
        error: '#icon-error',
        warning: '#icon-warning'
    };

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
                <svg class="notification-icon">
                    <use href="${iconMap[type]}"/>
                </svg>
                ${message}
            `;

    document.querySelectorAll('.notification').forEach(n => n.remove());
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

updateDisplay();
e.target.reset();
showNotification('Entry saved successfully!', 'success');