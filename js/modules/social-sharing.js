/**
 * Social Sharing Module - Lazy-loaded social sharing functionality
 */

export class SocialSharing {
    constructor() {
        this.html2canvas = null;
        this.isInitialized = false;
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Load html2canvas if not already available
            if (!window.html2canvas) {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                document.head.appendChild(script);
                
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }
            
            this.html2canvas = window.html2canvas;
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize social sharing:', error);
            throw error;
        }
    }
    
    /**
     * Validate share data for security
     */
    validateShareData(data) {
        if (!data || typeof data !== 'object') return null;
        
        const sanitized = {
            playerName: this.sanitizeString(data.playerName),
            score: this.sanitizeNumber(data.score, 0, 50000),
            rank: this.sanitizeNumber(data.rank, 1, 10000),
            gameLength: this.sanitizeNumber(data.gameLength, 1, 24),
            accuracy: this.sanitizeNumber(data.accuracy, 0, 100)
        };
        
        // Validate required fields
        if (!sanitized.playerName || sanitized.score < 0) {
            return null;
        }
        
        return sanitized;
    }
    
    sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>&"']/g, '').trim().substring(0, 12);
    }
    
    sanitizeNumber(num, min, max) {
        const parsed = parseInt(num);
        if (isNaN(parsed)) return min;
        return Math.max(min, Math.min(max, parsed));
    }
    
    /**
     * Share on X (Twitter)
     */
    async shareOnX(shareData) {
        const data = this.validateShareData(shareData);
        if (!data) {
            throw new Error('Invalid share data');
        }
        
        const text = `🎯 Just scored ${data.score} points in BIPardy! Ranked #${data.rank} with ${data.accuracy}% accuracy. Can you beat my Bitcoin word skills? 🧡`;
        const url = window.location.origin;
        const hashtags = 'BIPardy,Bitcoin,BIP39,WordGame';
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
        
        // Validate URL before opening
        if (this.isValidUrl(twitterUrl)) {
            window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        } else {
            throw new Error('Invalid share URL generated');
        }
    }
    
    /**
     * Share on Nostr (web client)
     */
    async shareOnNostrWeb(shareData) {
        const data = this.validateShareData(shareData);
        if (!data) {
            throw new Error('Invalid share data');
        }
        
        const text = `⚡ BIPardy Achievement ⚡\n\n🎯 Score: ${data.score}\n🏆 Rank: #${data.rank}\n🎲 Accuracy: ${data.accuracy}%\n\nJust mastered Bitcoin seed words! Try it yourself: ${window.location.origin}\n\n#BIPardy #Bitcoin #BIP39 #Nostr`;
        
        const nostrUrl = `https://snort.social/e/${encodeURIComponent(text)}`;
        
        if (this.isValidUrl(nostrUrl)) {
            window.open(nostrUrl, '_blank', 'noopener,noreferrer');
        } else {
            throw new Error('Invalid Nostr URL generated');
        }
    }
    
    /**
     * Copy text and screenshot for Nostr native clients
     */
    async copyNostrWithScreenshot(shareData) {
        const data = this.validateShareData(shareData);
        if (!data) {
            throw new Error('Invalid share data');
        }
        
        try {
            await this.init();
            
            const text = `⚡ BIPardy Achievement ⚡\n\n🎯 Score: ${data.score}\n🏆 Rank: #${data.rank}\n🎲 Accuracy: ${data.accuracy}%\n\nJust mastered Bitcoin seed words! Try it yourself: ${window.location.origin}\n\n#BIPardy #Bitcoin #BIP39 #Nostr`;
            
            // Generate screenshot
            const canvas = await this.generateScreenshot();
            
            // Copy text to clipboard
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                
                // Also try to copy image if supported
                try {
                    const blob = await this.canvasToBlob(canvas);
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'text/plain': new Blob([text], { type: 'text/plain' }),
                            'image/png': blob
                        })
                    ]);
                } catch (imgError) {
                    // Text-only fallback
                    console.warn('Could not copy image, text copied only:', imgError);
                }
            } else {
                // Fallback for older browsers
                this.fallbackCopyText(text);
            }
            
            return { text, canvas };
            
        } catch (error) {
            console.error('Copy with screenshot failed:', error);
            throw error;
        }
    }
    
    /**
     * Download screenshot
     */
    async downloadScreenshot(shareData) {
        const data = this.validateShareData(shareData);
        if (!data) {
            throw new Error('Invalid share data');
        }
        
        try {
            await this.init();
            
            const canvas = await this.generateScreenshot();
            const filename = `bipardy-score-${data.score}-${Date.now()}.png`;
            
            this.downloadCanvas(canvas, filename);
            
        } catch (error) {
            console.error('Screenshot download failed:', error);
            throw error;
        }
    }
    
    /**
     * Generate screenshot using html2canvas
     */
    async generateScreenshot() {
        if (!this.html2canvas) {
            throw new Error('html2canvas not loaded');
        }
        
        const gameEndScreen = document.getElementById('gameEndScreen');
        if (!gameEndScreen) {
            throw new Error('Game end screen not found');
        }
        
        const options = {
            allowTaint: false,
            useCORS: true,
            scale: 1,
            width: Math.min(gameEndScreen.offsetWidth, 1920),
            height: Math.min(gameEndScreen.offsetHeight, 1080),
            backgroundColor: '#0f0c29'
        };
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Screenshot generation timed out'));
            }, 5000);
            
            this.html2canvas(gameEndScreen, options)
                .then(canvas => {
                    clearTimeout(timeout);
                    resolve(canvas);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }
    
    /**
     * Convert canvas to blob
     */
    canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
    }
    
    /**
     * Download canvas as file
     */
    downloadCanvas(canvas, filename) {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.sanitizeFilename(filename);
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up URL after download
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
    }
    
    /**
     * Fallback text copy for older browsers
     */
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        } finally {
            document.body.removeChild(textArea);
        }
    }
    
    /**
     * Validate URL before opening
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:' && 
                   (urlObj.hostname === 'twitter.com' || 
                    urlObj.hostname === 'snort.social' ||
                    urlObj.hostname === 'x.com');
        } catch {
            return false;
        }
    }
    
    /**
     * Sanitize filename for download
     */
    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
}

// Export default instance
export default SocialSharing;