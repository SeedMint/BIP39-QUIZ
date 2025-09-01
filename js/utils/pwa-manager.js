/**
 * PWA Manager - Progressive Web App installation and service worker management
 * Handles installation prompts, language detection, and service worker registration
 */

// PWA state variables
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const laterBtn = document.getElementById('laterBtn');

/**
 * Get localized strings for PWA installation popup
 * @returns {Object} Localized strings for current user language
 */
function getLanguageStrings() {
    const userLang = navigator.language || navigator.userLanguage || 'en';
    const langCode = userLang.split('-')[0].toLowerCase();
    
    const translations = {
        'en': {
            title: 'Install BIPardy',
            description: 'Install this app on your home screen for the best experience!',
            install: 'Install',
            later: 'Later',
            iosInstructions: 'To install: Tap the share button below and select "Add to Home Screen"'
        },
        'de': {
            title: 'BIPardy installieren',
            description: 'Installieren Sie diese App auf Ihrem Startbildschirm für die beste Erfahrung!',
            install: 'Installieren',
            later: 'Später',
            iosInstructions: 'Zum Installieren: Tippen Sie unten auf die Teilen-Schaltfläche und wählen Sie "Zum Home-Bildschirm"'
        },
        'es': {
            title: 'Instalar BIPardy',
            description: '¡Instala esta aplicación en tu pantalla de inicio para la mejor experiencia!',
            install: 'Instalar',
            later: 'Más tarde',
            iosInstructions: 'Para instalar: Toca el botón compartir abajo y selecciona "Añadir a pantalla de inicio"'
        },
        'fr': {
            title: 'Installer BIPardy',
            description: 'Installez cette application sur votre écran d\'accueil pour la meilleure expérience !',
            install: 'Installer',
            later: 'Plus tard',
            iosInstructions: 'Pour installer : Appuyez sur le bouton de partage ci-dessous et sélectionnez "Sur l\'écran d\'accueil"'
        },
        'it': {
            title: 'Installa BIPardy',
            description: 'Installa questa app sulla tua schermata iniziale per la migliore esperienza!',
            install: 'Installa',
            later: 'Più tardi',
            iosInstructions: 'Per installare: Tocca il pulsante condividi qui sotto e seleziona "Aggiungi alla schermata Home"'
        },
        'ja': {
            title: 'BIPardy をインストール',
            description: '最高の体験のためにこのアプリをホーム画面にインストールしてください！',
            install: 'インストール',
            later: '後で',
            iosInstructions: 'インストールするには：下の共有ボタンをタップして「ホーム画面に追加」を選択してください'
        },
        'da': {
            title: 'Installer BIPardy',
            description: 'Installer denne app på din hjemmeskærm for den bedste oplevelse!',
            install: 'Installer',
            later: 'Senere',
            iosInstructions: 'For at installere: Tryk på del-knappen nedenfor og vælg "Tilføj til hjemmeskærm"'
        }
    };
    
    return translations[langCode] || translations['en'];
}

/**
 * Update PWA popup text based on detected language
 */
function updatePWAPopupLanguage() {
    const strings = getLanguageStrings();
    const titleElement = installPrompt.querySelector('h3');
    const descriptionElement = installPrompt.querySelector('p');
    
    if (titleElement) titleElement.textContent = strings.title;
    if (descriptionElement) descriptionElement.textContent = strings.description;
    if (installBtn) installBtn.textContent = strings.install;
    if (laterBtn) laterBtn.textContent = strings.later;
}

/**
 * Initialize PWA installation functionality
 */
function initializePWA() {
    // Update popup language
    updatePWAPopupLanguage();
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        console.log('App already installed');
        return;
    }
    
    // Show install prompt for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => {
            installPrompt.style.display = 'block';
        }, 2000);
    }
    
    // Handle install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (!localStorage.getItem('installPromptDismissed')) {
            updatePWAPopupLanguage();
            installPrompt.style.display = 'block';
        }
    });
    
    // Install button click handler
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
        } else {
            // iOS installation instructions in user's language
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                const strings = getLanguageStrings();
                alert(strings.iosInstructions);
            }
        }
        installPrompt.style.display = 'none';
    });
    
    // Later button click handler
    laterBtn.addEventListener('click', () => {
        localStorage.setItem('installPromptDismissed', 'true');
        installPrompt.style.display = 'none';
    });
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => console.log('ServiceWorker registered'))
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }
}

// Export functions for use by other modules
export { initializePWA, getLanguageStrings, updatePWAPopupLanguage };