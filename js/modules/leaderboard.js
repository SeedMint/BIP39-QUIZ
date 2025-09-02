/**
 * Virtual Scrolling Leaderboard Module - High performance leaderboard rendering
 */

class VirtualLeaderboard {
    constructor() {
        this.container = null;
        this.scrollContainer = null;
        this.viewport = null;
        
        this.data = [];
        this.itemHeight = 60; // Height of each leaderboard item
        this.visibleCount = 10; // Number of items visible at once
        this.bufferSize = 5; // Extra items to render for smooth scrolling
        
        this.scrollTop = 0;
        this.startIndex = 0;
        this.endIndex = 0;
        
        this.worker = null;
        this.isProcessing = false;
        
        // Performance tracking
        this.renderCount = 0;
        this.lastRenderTime = 0;
    }
    
    init(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} not found`);
        }
        
        // Apply options
        this.itemHeight = options.itemHeight || 60;
        this.visibleCount = options.visibleCount || 10;
        this.bufferSize = options.bufferSize || 5;
        
        this.setupVirtualScrolling();
        this.initWorker();
    }
    
    setupVirtualScrolling() {
        // Create virtual scroll structure
        this.container.innerHTML = `
            <div class="leaderboard-scroll-container" style="height: ${this.visibleCount * this.itemHeight}px; overflow-y: auto;">
                <div class="leaderboard-spacer-top" style="height: 0px;"></div>
                <div class="leaderboard-viewport"></div>
                <div class="leaderboard-spacer-bottom" style="height: 0px;"></div>
            </div>
        `;
        
        this.scrollContainer = this.container.querySelector('.leaderboard-scroll-container');
        this.viewport = this.container.querySelector('.leaderboard-viewport');
        this.spacerTop = this.container.querySelector('.leaderboard-spacer-top');
        this.spacerBottom = this.container.querySelector('.leaderboard-spacer-bottom');
        
        // Add scroll event listener with throttling
        let scrollTimeout;
        this.scrollContainer.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.handleScroll(), 16); // ~60fps
        }, { passive: true });
    }
    
    initWorker() {
        if (typeof Worker !== 'undefined') {
            this.worker = new Worker('./js/workers/leaderboard-worker.js');
            this.worker.addEventListener('message', (e) => this.handleWorkerMessage(e));
            this.worker.addEventListener('error', (e) => console.error('Leaderboard worker error:', e));
        }
    }
    
    handleWorkerMessage(e) {
        const { type, id, result, error } = e.data;
        
        if (error) {
            console.error('Worker error:', error);
            this.isProcessing = false;
            return;
        }
        
        switch (type) {
            case 'localLeaderboardResult':
            case 'globalLeaderboardResult':
                this.processLeaderboardResult(result);
                break;
                
            case 'filteredResult':
                this.processFilteredResult(result);
                break;
                
            case 'rankingResult':
                this.processRankingResult(result);
                break;
        }
        
        this.isProcessing = false;
    }
    
    async loadData(scores, type = 'local', currentPlayer = null) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading();
        
        if (this.worker) {
            // Use web worker for processing
            const messageType = type === 'global' ? 'processGlobalLeaderboard' : 'processLocalLeaderboard';
            this.worker.postMessage({
                type: messageType,
                data: {
                    id: Date.now(),
                    scores,
                    currentScore: currentPlayer?.score || 0,
                    playerName: currentPlayer?.name || ''
                }
            });
        } else {
            // Fallback to main thread processing
            await this.processDataMainThread(scores, type, currentPlayer);
        }
    }
    
    async processDataMainThread(scores, type, currentPlayer) {
        return new Promise((resolve) => {
            // Simulate worker processing on main thread with yielding
            const processChunk = (startIdx) => {
                const chunkSize = 100;
                const endIdx = Math.min(startIdx + chunkSize, scores.length);
                
                for (let i = startIdx; i < endIdx; i++) {
                    const score = scores[i];
                    if (this.isValidScoreEntry(score)) {
                        this.data.push({
                            rank: this.data.length + 1,
                            name: this.sanitizeName(score.name),
                            score: Math.max(0, Math.min(50000, score.score)),
                            date: score.date || 'Unknown',
                            accuracy: Math.max(0, Math.min(100, score.accuracy || 0)),
                            gameLength: Math.max(1, Math.min(24, score.gameLength || 12)),
                            isCurrentPlayer: currentPlayer && score.name === currentPlayer.name && score.score === currentPlayer.score
                        });
                    }
                }
                
                if (endIdx < scores.length) {
                    // Yield to browser and continue processing
                    setTimeout(() => processChunk(endIdx), 0);
                } else {
                    this.finalizeDataProcessing();
                    resolve();
                }
            };
            
            this.data = [];
            processChunk(0);
        });
    }
    
    processLeaderboardResult(result) {
        this.data = result.entries;
        this.finalizeDataProcessing();
    }
    
    processFilteredResult(result) {
        this.data = result.entries;
        this.finalizeDataProcessing();
    }
    
    processRankingResult(result) {
        // Handle ranking information
        this.emit('rankingCalculated', result);
    }
    
    finalizeDataProcessing() {
        this.updateVirtualScrolling();
        this.render();
        this.hideLoading();
        this.emit('dataLoaded', { count: this.data.length });
    }
    
    updateVirtualScrolling() {
        const totalHeight = this.data.length * this.itemHeight;
        const scrollHeight = Math.max(0, totalHeight - (this.visibleCount * this.itemHeight));
        
        this.spacerBottom.style.height = scrollHeight + 'px';
        this.calculateVisibleRange();
    }
    
    calculateVisibleRange() {
        this.scrollTop = this.scrollContainer.scrollTop;
        this.startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize);
        this.endIndex = Math.min(this.data.length, this.startIndex + this.visibleCount + (this.bufferSize * 2));
    }
    
    handleScroll() {
        this.calculateVisibleRange();
        this.render();
    }
    
    render() {
        const startTime = performance.now();
        
        // Update spacer heights
        this.spacerTop.style.height = (this.startIndex * this.itemHeight) + 'px';
        
        // Create visible items using DocumentFragment for performance
        const fragment = document.createDocumentFragment();
        
        for (let i = this.startIndex; i < this.endIndex; i++) {
            const item = this.data[i];
            if (!item) continue;
            
            const element = this.createLeaderboardItem(item, i);
            fragment.appendChild(element);
        }
        
        // Single DOM operation
        this.viewport.innerHTML = '';
        this.viewport.appendChild(fragment);
        
        // Performance tracking
        this.renderCount++;
        this.lastRenderTime = performance.now() - startTime;
        
        // Emit render event for performance monitoring
        this.emit('rendered', {
            renderTime: this.lastRenderTime,
            itemsRendered: this.endIndex - this.startIndex,
            totalItems: this.data.length
        });
    }
    
    createLeaderboardItem(item, index) {
        const div = document.createElement('div');
        div.className = `leaderboard-item ${item.isCurrentPlayer ? 'current-player' : ''}`;
        div.style.height = this.itemHeight + 'px';
        
        // Use textContent for security (XSS prevention)
        div.innerHTML = `
            <div class="leaderboard-rank">#${item.rank}</div>
            <div class="leaderboard-name"></div>
            <div class="leaderboard-score">${item.score}</div>
            <div class="leaderboard-accuracy">${item.accuracy}%</div>
            <div class="leaderboard-date"></div>
        `;
        
        // Safely set user-controlled content
        div.querySelector('.leaderboard-name').textContent = item.name;
        div.querySelector('.leaderboard-date').textContent = item.date;
        
        return div;
    }
    
    showLoading() {
        this.container.classList.add('loading');
        this.viewport.innerHTML = '<div class="loading-indicator">Loading leaderboard...</div>';
    }
    
    hideLoading() {
        this.container.classList.remove('loading');
    }
    
    // Filter and search functionality
    async filterData(filters) {
        if (!this.worker) return;
        
        this.isProcessing = true;
        this.showLoading();
        
        this.worker.postMessage({
            type: 'filterAndSort',
            data: {
                id: Date.now(),
                scores: this.data,
                filters
            }
        });
    }
    
    // Scroll to specific item
    scrollToIndex(index) {
        const targetScroll = index * this.itemHeight;
        this.scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
    
    // Scroll to current player
    scrollToCurrentPlayer() {
        const currentPlayerIndex = this.data.findIndex(item => item.isCurrentPlayer);
        if (currentPlayerIndex >= 0) {
            this.scrollToIndex(currentPlayerIndex);
        }
    }
    
    // Utility methods
    isValidScoreEntry(score) {
        if (!score || typeof score !== 'object') return false;
        if (typeof score.name !== 'string' || typeof score.score !== 'number') return false;
        if (!/^[A-Z0-9]{3,12}$/i.test(score.name)) return false;
        if (score.score < 0 || score.score > 50000) return false;
        return true;
    }
    
    sanitizeName(name) {
        if (typeof name !== 'string') return 'Anonymous';
        return name.replace(/[<>&"']/g, '').substring(0, 12);
    }
    
    // Event system
    emit(eventName, data) {
        const event = new CustomEvent(`leaderboard:${eventName}`, { detail: data });
        this.container.dispatchEvent(event);
    }
    
    // Cleanup
    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        
        if (this.scrollContainer) {
            this.scrollContainer.removeEventListener('scroll', this.handleScroll);
        }
        
        this.data = [];
        this.isProcessing = false;
    }
    
    // Performance monitoring
    getPerformanceStats() {
        return {
            renderCount: this.renderCount,
            lastRenderTime: this.lastRenderTime,
            totalItems: this.data.length,
            visibleItems: this.endIndex - this.startIndex,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    
    estimateMemoryUsage() {
        // Rough estimation of memory usage in bytes
        const itemSize = 200; // Estimated bytes per item
        return this.data.length * itemSize;
    }
}

// Export the class
export { VirtualLeaderboard };