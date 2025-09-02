/**
 * Lazy Loading Module - Load non-critical features on demand
 */

class LazyLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
        this.loadedAssets = new Set();
        this.observers = new Map();
    }
    
    /**
     * Lazy load JavaScript modules
     */
    async loadModule(modulePath, exportName = 'default') {
        const cacheKey = `${modulePath}:${exportName}`;
        
        if (this.loadedModules.has(cacheKey)) {
            return this.getModuleFromCache(cacheKey);
        }
        
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }
        
        const loadPromise = this.importModule(modulePath, exportName);
        this.loadingPromises.set(cacheKey, loadPromise);
        
        try {
            const module = await loadPromise;
            this.loadedModules.add(cacheKey);
            this.loadingPromises.delete(cacheKey);
            return module;
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            throw error;
        }
    }
    
    async importModule(modulePath, exportName) {
        const module = await import(modulePath);
        return exportName === 'default' ? module.default : module[exportName];
    }
    
    getModuleFromCache(cacheKey) {
        // Return cached module (implementation depends on caching strategy)
        return null; // Simplified for this example
    }
    
    /**
     * Lazy load external scripts (like html2canvas)
     */
    async loadScript(url, globalName = null) {
        if (this.loadedAssets.has(url)) {
            return globalName ? window[globalName] : true;
        }
        
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }
        
        const loadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            script.onload = () => {
                this.loadedAssets.add(url);
                resolve(globalName ? window[globalName] : true);
            };
            
            script.onerror = () => {
                reject(new Error(`Failed to load script: ${url}`));
            };
            
            document.head.appendChild(script);
        });
        
        this.loadingPromises.set(url, loadPromise);
        
        try {
            const result = await loadPromise;
            this.loadingPromises.delete(url);
            return result;
        } catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }
    
    /**
     * Lazy load CSS files
     */
    async loadCSS(url) {
        if (this.loadedAssets.has(url)) {
            return true;
        }
        
        if (this.loadingPromises.has(url)) {
            return this.loadingPromises.get(url);
        }
        
        const loadPromise = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            link.onload = () => {
                this.loadedAssets.add(url);
                resolve(true);
            };
            
            link.onerror = () => {
                reject(new Error(`Failed to load CSS: ${url}`));
            };
            
            document.head.appendChild(link);
        });
        
        this.loadingPromises.set(url, loadPromise);
        
        try {
            const result = await loadPromise;
            this.loadingPromises.delete(url);
            return result;
        } catch (error) {
            this.loadingPromises.delete(url);
            throw error;
        }
    }
    
    /**
     * Load html2canvas for screenshots (only when needed)
     */
    async loadHtml2Canvas() {
        if (window.html2canvas) {
            return window.html2canvas;
        }
        
        try {
            return await this.loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
                'html2canvas'
            );
        } catch (error) {
            console.error('Failed to load html2canvas:', error);
            throw new Error('Screenshot functionality unavailable');
        }
    }
    
    /**
     * Intersection Observer for lazy loading based on visibility
     */
    observeElement(element, callback, options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        const observerOptions = { ...defaultOptions, ...options };
        const observerId = this.generateObserverId(element, observerOptions);
        
        if (this.observers.has(observerId)) {
            return this.observers.get(observerId);
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback(entry.target, entry);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        observer.observe(element);
        this.observers.set(observerId, observer);
        
        return observer;
    }
    
    generateObserverId(element, options) {
        return `${element.id || element.className}_${JSON.stringify(options)}`;
    }
    
    /**
     * Lazy load social sharing features
     */
    async loadSocialSharing() {
        try {
            // Load social sharing module only when needed
            const socialModule = await this.loadModule('./js/modules/social-sharing.js', 'SocialSharing');
            return new socialModule();
        } catch (error) {
            console.error('Failed to load social sharing:', error);
            return null;
        }
    }
    
    /**
     * Lazy load leaderboard features
     */
    async loadLeaderboard() {
        try {
            const LeaderboardModule = await this.loadModule('./js/modules/leaderboard.js', 'VirtualLeaderboard');
            return new LeaderboardModule();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return null;
        }
    }
    
    /**
     * Preload critical resources during idle time
     */
    preloadCriticalResources() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.preloadDuringIdle();
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.preloadDuringIdle();
            }, 1000);
        }
    }
    
    async preloadDuringIdle() {
        try {
            // Preload modules that are likely to be needed
            const criticalModules = [
                './js/modules/timer.js',
                './js/modules/ui-controller.js'
            ];
            
            const preloadPromises = criticalModules.map(modulePath => 
                this.loadModule(modulePath).catch(err => {
                    console.warn(`Failed to preload ${modulePath}:`, err);
                })
            );
            
            await Promise.allSettled(preloadPromises);
            console.log('Critical resources preloaded');
        } catch (error) {
            console.warn('Preloading failed:', error);
        }
    }
    
    /**
     * Load features based on user interaction
     */
    setupInteractionBasedLoading() {
        // Load social sharing when user reaches end screen
        document.addEventListener('gameEnd', () => {
            this.loadSocialSharing();
        });
        
        // Load screenshot functionality on first share attempt
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-btn')) {
                this.loadHtml2Canvas();
            }
        }, { once: true });
        
        // Load leaderboard when tab is clicked
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.loadLeaderboard();
            }
        }, { once: true });
    }
    
    /**
     * Memory management - unload unused modules
     */
    unloadModule(modulePath, exportName = 'default') {
        const cacheKey = `${modulePath}:${exportName}`;
        this.loadedModules.delete(cacheKey);
        
        // Note: Actual module unloading in JavaScript is limited
        // This mainly clears our tracking
    }
    
    /**
     * Clean up observers
     */
    disconnectObserver(observerId) {
        const observer = this.observers.get(observerId);
        if (observer) {
            observer.disconnect();
            this.observers.delete(observerId);
        }
    }
    
    disconnectAllObservers() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
    
    /**
     * Get loading statistics
     */
    getLoadingStats() {
        return {
            loadedModules: this.loadedModules.size,
            loadedAssets: this.loadedAssets.size,
            activeObservers: this.observers.size,
            pendingLoads: this.loadingPromises.size
        };
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.disconnectAllObservers();
        this.loadingPromises.clear();
        this.loadedModules.clear();
        this.loadedAssets.clear();
    }
}

// Export singleton instance
export const lazyLoader = new LazyLoader();
export { LazyLoader };