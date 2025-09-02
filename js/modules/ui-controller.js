/**
 * UI Controller Module - Optimized DOM caching and event handling
 */

class UIController {
    constructor() {
        this.elements = new Map();
        this.eventHandlers = new Map();
        this.updateQueue = [];
        this.isUpdating = false;
        this.debouncers = new Map();
        
        // Performance tracking
        this.queryCount = 0;
        this.updateCount = 0;
        this.cacheHitCount = 0;
    }
    
    /**
     * Initialize UI controller and cache all frequently used elements
     */
    init() {
        this.cacheElements();
        this.setupEventDelegation();
        this.startUpdateLoop();
    }
    
    /**
     * Cache all frequently accessed DOM elements
     */
    cacheElements() {
        const elementIds = [
            'matrixContainer',
            'keyboardToggle', 
            'readmeButton',
            'installPrompt',
            'installBtn',
            'laterBtn',
            'playerSelector',
            'scoreContainer',
            'gameLengthLabel',
            'gameLengthToggle', 
            'lengthToggle',
            'timerContainer',
            'timerBonus',
            'timerProgress',
            'letterContainer',
            'helpButton',
            'skipButton', 
            'submitButton',
            'message',
            'gameEndScreen',
            'gameEndTitle',
            'winnerName',
            'finalStats',
            'continueButton',
            'leaderboardSection',
            'localTabBtn',
            'globalTabBtn',
            'leaderboardSubmit',
            'playerNameInput',
            'eligibilityNotice',
            'submitLocalBtn',
            'submitGlobalBtn',
            'socialShareSection',
            'rankStatus',
            'leaderboardList'
        ];
        
        // Cache elements by ID
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.elements.set(id, element);
            }
        });
        
        // Cache elements by class or query
        const queries = {
            'playerBtns': '.player-btn',
            'keys': '.key',
            'letters': '.letter',
            'shareButtons': '.share-btn',
            'tabBtns': '.tab-btn',
            'submitScoreBtns': '.submit-score-btn'
        };
        
        Object.entries(queries).forEach(([name, query]) => {
            const elements = document.querySelectorAll(query);
            this.elements.set(name, Array.from(elements));
            this.queryCount++;
        });
        
        console.log(`UI Controller: Cached ${this.elements.size} element groups`);
    }
    
    /**
     * Get cached element(s) by key
     */
    get(key) {
        if (this.elements.has(key)) {
            this.cacheHitCount++;
            return this.elements.get(key);
        }
        
        // Fallback to live query (with warning in debug mode)
        const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (DEBUG) {
            console.warn(`UIController: Cache miss for '${key}' - consider adding to cache`);
        }
        
        this.queryCount++;
        return document.getElementById(key) || document.querySelector(key);
    }
    
    /**
     * Batch DOM updates for optimal performance
     */
    batchUpdate(callback) {
        this.updateQueue.push(callback);
        
        if (!this.isUpdating) {
            requestAnimationFrame(() => {
                this.processBatchUpdates();
            });
        }
    }
    
    processBatchUpdates() {
        if (this.updateQueue.length === 0) return;
        
        this.isUpdating = true;
        const startTime = performance.now();
        
        // Process all queued updates in a single frame
        while (this.updateQueue.length > 0) {
            const update = this.updateQueue.shift();
            try {
                update();
                this.updateCount++;
            } catch (error) {
                console.error('Batch update error:', error);
            }
        }
        
        this.isUpdating = false;
        const updateTime = performance.now() - startTime;
        
        // Monitor performance in debug mode
        const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (DEBUG && updateTime > 16) { // More than one frame
            console.warn(`UIController: Batch update took ${updateTime.toFixed(2)}ms`);
        }
    }
    
    /**
     * Setup event delegation for better performance
     */
    setupEventDelegation() {
        // Keyboard delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('key')) {
                this.handleKeyClick(e.target);
            } else if (e.target.classList.contains('player-btn')) {
                this.handlePlayerButtonClick(e.target);
            } else if (e.target.classList.contains('tab-btn')) {
                this.handleTabClick(e.target);
            } else if (e.target.classList.contains('share-btn')) {
                this.handleShareButtonClick(e.target);
            }
        });
        
        // Input delegation with debouncing
        document.addEventListener('input', (e) => {
            if (e.target.id === 'playerNameInput') {
                this.debouncedInputHandler('playerName', e.target, 300);
            }
        });
        
        // Form submission prevention
        document.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * Debounced event handler
     */
    debouncedInputHandler(key, target, delay) {
        if (this.debouncers.has(key)) {
            clearTimeout(this.debouncers.get(key));
        }
        
        const timeoutId = setTimeout(() => {
            this.handleDebouncedInput(key, target);
            this.debouncers.delete(key);
        }, delay);
        
        this.debouncers.set(key, timeoutId);
    }
    
    handleDebouncedInput(key, target) {
        switch (key) {
            case 'playerName':
                this.emit('playerNameChanged', { value: target.value, target });
                break;
        }
    }
    
    /**
     * Optimized element updates
     */
    updateTextContent(elementKey, text) {
        this.batchUpdate(() => {
            const element = this.get(elementKey);
            if (element && element.textContent !== text) {
                element.textContent = text;
            }
        });
    }
    
    updateHTML(elementKey, html) {
        this.batchUpdate(() => {
            const element = this.get(elementKey);
            if (element && element.innerHTML !== html) {
                element.innerHTML = html;
            }
        });
    }
    
    updateStyle(elementKey, property, value) {
        this.batchUpdate(() => {
            const element = this.get(elementKey);
            if (element && element.style[property] !== value) {
                element.style[property] = value;
            }
        });
    }
    
    updateClass(elementKey, className, add = true) {
        this.batchUpdate(() => {
            const element = this.get(elementKey);
            if (element) {
                if (add && !element.classList.contains(className)) {
                    element.classList.add(className);
                } else if (!add && element.classList.contains(className)) {
                    element.classList.remove(className);
                }
            }
        });
    }
    
    /**
     * Optimized score display updates
     */
    updateScoreDisplay(players) {
        this.batchUpdate(() => {
            const scoreContainer = this.get('scoreContainer');
            if (!scoreContainer) return;
            
            // Use DocumentFragment for efficient rendering
            const fragment = document.createDocumentFragment();
            
            players.forEach(player => {
                const scoreDiv = document.createElement('div');
                scoreDiv.className = `player-score ${player.isCurrentPlayer ? 'current' : ''}`;
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'player-name';
                nameSpan.textContent = player.name; // Safe XSS prevention
                
                const scoreSpan = document.createElement('span'); 
                scoreSpan.className = 'score-value';
                scoreSpan.textContent = player.score.toString();
                
                scoreDiv.appendChild(nameSpan);
                scoreDiv.appendChild(scoreSpan);
                fragment.appendChild(scoreDiv);
            });
            
            scoreContainer.innerHTML = '';
            scoreContainer.appendChild(fragment);
        });
    }
    
    /**
     * Optimized letter display update
     */
    updateLetterDisplay(word, guessed, showLength) {
        this.batchUpdate(() => {
            const container = this.get('letterContainer');
            if (!container) return;
            
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < word.length; i++) {
                const letterDiv = document.createElement('div');
                letterDiv.className = 'letter';
                
                if (guessed[i] || showLength) {
                    letterDiv.textContent = word[i].toUpperCase();
                    letterDiv.classList.add('revealed');
                } else {
                    letterDiv.textContent = '_';
                }
                
                fragment.appendChild(letterDiv);
            }
            
            container.innerHTML = '';
            container.appendChild(fragment);
        });
    }
    
    /**
     * Show/hide elements with animation
     */
    showElement(elementKey, animationClass = 'fadeIn') {
        const element = this.get(elementKey);
        if (!element) return;
        
        element.style.display = 'block';
        element.classList.add(animationClass);
        
        // Clean up animation class after animation completes
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    }
    
    hideElement(elementKey, animationClass = 'fadeOut') {
        const element = this.get(elementKey);
        if (!element) return;
        
        element.classList.add(animationClass);
        
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.remove(animationClass);
        }, 500);
    }
    
    /**
     * Event handlers (to be connected to game logic)
     */
    handleKeyClick(keyElement) {
        const key = keyElement.getAttribute('data-key');
        this.emit('keyPressed', { key, element: keyElement });
    }
    
    handlePlayerButtonClick(buttonElement) {
        const playerCount = parseInt(buttonElement.getAttribute('data-players'));
        this.emit('playerCountChanged', { count: playerCount, element: buttonElement });
    }
    
    handleTabClick(tabElement) {
        const tabType = tabElement.id.includes('local') ? 'local' : 'global';
        this.emit('tabChanged', { type: tabType, element: tabElement });
    }
    
    handleShareButtonClick(shareElement) {
        const shareType = shareElement.className.includes('x-share') ? 'x' :
                         shareElement.className.includes('nostr-web') ? 'nostr-web' :
                         shareElement.className.includes('nostr-native') ? 'nostr-native' : 'download';
        this.emit('shareRequested', { type: shareType, element: shareElement });
    }
    
    /**
     * Performance monitoring
     */
    getPerformanceStats() {
        return {
            cachedElements: this.elements.size,
            queryCount: this.queryCount,
            cacheHitCount: this.cacheHitCount,
            updateCount: this.updateCount,
            cacheHitRatio: this.queryCount > 0 ? (this.cacheHitCount / this.queryCount * 100).toFixed(2) + '%' : '0%',
            pendingUpdates: this.updateQueue.length
        };
    }
    
    /**
     * Start update loop for better performance monitoring
     */
    startUpdateLoop() {
        if (!this.isUpdating && this.updateQueue.length > 0) {
            requestAnimationFrame(() => {
                this.processBatchUpdates();
                this.startUpdateLoop();
            });
        } else {
            // Check again in next frame if no updates pending
            requestAnimationFrame(() => this.startUpdateLoop());
        }
    }
    
    /**
     * Event system
     */
    emit(eventName, data) {
        const event = new CustomEvent(`ui:${eventName}`, { detail: data });
        document.dispatchEvent(event);
    }
    
    on(eventName, handler) {
        document.addEventListener(`ui:${eventName}`, handler);
    }
    
    off(eventName, handler) {
        document.removeEventListener(`ui:${eventName}`, handler);
    }
    
    /**
     * Cleanup
     */
    destroy() {
        // Clear all timeouts
        this.debouncers.forEach(timeoutId => clearTimeout(timeoutId));
        this.debouncers.clear();
        
        // Clear update queue
        this.updateQueue.length = 0;
        this.isUpdating = false;
        
        // Clear element cache
        this.elements.clear();
        
        console.log('UI Controller destroyed');
    }
}

// Export singleton instance
export const uiController = new UIController();
export { UIController };