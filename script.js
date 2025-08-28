// AlgoVerse - Interactive DSA Playground
// Main JavaScript file with all visualizers

class AlgoVerse {
    constructor() {
        this.currentSection = 'sorting';
        this.isAnimating = false;
        this.animationSpeed = 50;
        this.soundEnabled = true;
        this.audioContext = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAudio();
        this.initializeSortingVisualizer();
        this.initializeSearchingVisualizer();
        this.initializeTreeVisualizer();
        this.initializeHeapVisualizer();
        this.initializeStackQueueVisualizer();
        this.initializeHashTableVisualizer();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            this.toggleSound();
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.visualizer-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
        this.stopAllAnimations();
    }

    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Audio not supported');
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const icon = document.querySelector('.sound-icon');
        icon.textContent = this.soundEnabled ? '🔊' : '🔇';
    }

    playSound(frequency = 440, duration = 100) {
        if (!this.soundEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    stopAllAnimations() {
        this.isAnimating = false;
        // Reset all visualizers
        this.resetSorting();
        this.resetSearching();
        // Add other reset methods as needed
    }

    // Utility function to delay execution
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // SORTING VISUALIZER
    initializeSortingVisualizer() {
        this.sortingArray = [];
        this.sortingBars = [];

        // Event listeners
        document.getElementById('generateArray').addEventListener('click', () => {
            this.generateSortingArray();
        });

        document.getElementById('startSorting').addEventListener('click', () => {
            this.startSorting();
        });

        document.getElementById('pauseSorting').addEventListener('click', () => {
            this.pauseSorting();
        });

        document.getElementById('resetSorting').addEventListener('click', () => {
            this.resetSorting();
        });

        document.getElementById('arraySize').addEventListener('input', (e) => {
            document.getElementById('arraySizeValue').textContent = e.target.value;
            this.generateSortingArray();
        });

        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.animationSpeed = 101 - parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.animationSpeed;
        });

        document.getElementById('sortingAlgorithm').addEventListener('change', () => {
            this.updateSortingInfo();
        });

        // Initialize
        this.generateSortingArray();
        this.updateSortingInfo();
    }

    generateSortingArray() {
        if (this.isAnimating) return;

        const size = parseInt(document.getElementById('arraySize').value);
        this.sortingArray = [];
        
        for (let i = 0; i < size; i++) {
            this.sortingArray.push(Math.floor(Math.random() * 300) + 10);
        }

        this.renderSortingArray();
        this.updateSortingStatus('Array generated. Ready to sort.');
    }

    renderSortingArray() {
        const container = document.getElementById('sortingArray');
        container.innerHTML = '';
        this.sortingBars = [];

        const maxValue = Math.max(...this.sortingArray);
        const arraySize = this.sortingArray.length;

        this.sortingArray.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${(value / maxValue) * 250}px`;
            
            // Show values only for smaller arrays to avoid clutter
            if (arraySize <= 30) {
                bar.textContent = value;
            } else if (arraySize <= 60) {
                // Show values only on hover for medium arrays
                bar.title = value;
            }
            
            bar.dataset.index = index;
            
            container.appendChild(bar);
            this.sortingBars.push(bar);
        });
    }

    async startSorting() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.updateSortingControls(true);

        const algorithm = document.getElementById('sortingAlgorithm').value;
        
        try {
            switch (algorithm) {
                case 'bubble':
                    await this.bubbleSort();
                    break;
                case 'selection':
                    await this.selectionSort();
                    break;
                case 'insertion':
                    await this.insertionSort();
                    break;
                case 'merge':
                    await this.mergeSort(0, this.sortingArray.length - 1);
                    break;
                case 'quick':
                    await this.quickSort(0, this.sortingArray.length - 1);
                    break;
                case 'heap':
                    await this.heapSort();
                    break;
            }

            if (this.isAnimating) {
                this.updateSortingStatus('Sorting completed!');
                this.markAllSorted();
                this.playSound(800, 200);
            }
        } catch (error) {
            console.error('Sorting error:', error);
        }

        this.isAnimating = false;
        this.updateSortingControls(false);
    }

    pauseSorting() {
        this.isAnimating = false;
        this.updateSortingControls(false);
        this.updateSortingStatus('Sorting paused.');
    }

    resetSorting() {
        this.isAnimating = false;
        this.updateSortingControls(false);
        this.generateSortingArray();
    }

    updateSortingControls(isAnimating) {
        document.getElementById('startSorting').disabled = isAnimating;
        document.getElementById('pauseSorting').disabled = !isAnimating;
        document.getElementById('generateArray').disabled = isAnimating;
        document.getElementById('arraySize').disabled = isAnimating;
        document.getElementById('sortingAlgorithm').disabled = isAnimating;
    }

    updateSortingStatus(message) {
        document.getElementById('sortingStatus').textContent = message;
    }

    async highlightBars(indices, className = 'comparing') {
        indices.forEach(index => {
            if (this.sortingBars[index]) {
                this.sortingBars[index].className = `array-bar ${className}`;
            }
        });
        await this.delay(this.animationSpeed);
    }

    async swapBars(i, j) {
        if (!this.isAnimating) return;

        // Highlight bars being swapped
        await this.highlightBars([i, j], 'swapping');
        
        // Swap in array
        [this.sortingArray[i], this.sortingArray[j]] = [this.sortingArray[j], this.sortingArray[i]];
        
        // Update visual representation
        const maxValue = Math.max(...this.sortingArray);
        this.sortingBars[i].style.height = `${(this.sortingArray[i] / maxValue) * 250}px`;
        this.sortingBars[j].style.height = `${(this.sortingArray[j] / maxValue) * 250}px`;
        this.sortingBars[i].textContent = this.sortingArray.length <= 50 ? this.sortingArray[i] : '';
        this.sortingBars[j].textContent = this.sortingArray.length <= 50 ? this.sortingArray[j] : '';

        this.playSound(400 + this.sortingArray[i] * 2, 50);
        
        await this.delay(this.animationSpeed);
        
        // Reset colors
        this.sortingBars[i].className = 'array-bar';
        this.sortingBars[j].className = 'array-bar';
    }

    markAllSorted() {
        this.sortingBars.forEach(bar => {
            bar.className = 'array-bar sorted';
        });
    }

    // Bubble Sort Implementation
    async bubbleSort() {
        const n = this.sortingArray.length;
        
        for (let i = 0; i < n - 1 && this.isAnimating; i++) {
            for (let j = 0; j < n - i - 1 && this.isAnimating; j++) {
                this.updateSortingStatus(`Bubble Sort: Comparing elements at positions ${j} and ${j + 1}`);
                
                await this.highlightBars([j, j + 1], 'comparing');
                
                if (this.sortingArray[j] > this.sortingArray[j + 1]) {
                    await this.swapBars(j, j + 1);
                } else {
                    await this.delay(this.animationSpeed);
                    this.sortingBars[j].className = 'array-bar';
                    this.sortingBars[j + 1].className = 'array-bar';
                }
            }
            
            // Mark the last element as sorted
            if (this.sortingBars[n - i - 1]) {
                this.sortingBars[n - i - 1].className = 'array-bar sorted';
            }
        }
    }

    // Selection Sort Implementation
    async selectionSort() {
        const n = this.sortingArray.length;
        
        for (let i = 0; i < n - 1 && this.isAnimating; i++) {
            let minIndex = i;
            this.sortingBars[i].className = 'array-bar current';
            
            for (let j = i + 1; j < n && this.isAnimating; j++) {
                this.updateSortingStatus(`Selection Sort: Finding minimum in unsorted portion`);
                
                await this.highlightBars([j], 'comparing');
                
                if (this.sortingArray[j] < this.sortingArray[minIndex]) {
                    if (this.sortingBars[minIndex]) {
                        this.sortingBars[minIndex].className = 'array-bar';
                    }
                    minIndex = j;
                    this.sortingBars[minIndex].className = 'array-bar pivot';
                } else {
                    this.sortingBars[j].className = 'array-bar';
                }
                
                await this.delay(this.animationSpeed / 2);
            }
            
            if (minIndex !== i) {
                await this.swapBars(i, minIndex);
            }
            
            this.sortingBars[i].className = 'array-bar sorted';
            if (this.sortingBars[minIndex]) {
                this.sortingBars[minIndex].className = 'array-bar';
            }
        }
        
        // Mark last element as sorted
        if (this.sortingBars[n - 1]) {
            this.sortingBars[n - 1].className = 'array-bar sorted';
        }
    }

    // Insertion Sort Implementation
    async insertionSort() {
        const n = this.sortingArray.length;
        
        for (let i = 1; i < n && this.isAnimating; i++) {
            let key = this.sortingArray[i];
            let j = i - 1;
            
            this.sortingBars[i].className = 'array-bar current';
            this.updateSortingStatus(`Insertion Sort: Inserting element ${key} into sorted portion`);
            
            await this.delay(this.animationSpeed);
            
            while (j >= 0 && this.sortingArray[j] > key && this.isAnimating) {
                await this.highlightBars([j, j + 1], 'comparing');
                
                this.sortingArray[j + 1] = this.sortingArray[j];
                const maxValue = Math.max(...this.sortingArray);
                this.sortingBars[j + 1].style.height = `${(this.sortingArray[j + 1] / maxValue) * 250}px`;
                this.sortingBars[j + 1].textContent = this.sortingArray.length <= 50 ? this.sortingArray[j + 1] : '';
                
                this.playSound(400 + this.sortingArray[j + 1] * 2, 50);
                
                j--;
                await this.delay(this.animationSpeed);
            }
            
            this.sortingArray[j + 1] = key;
            const maxValue = Math.max(...this.sortingArray);
            this.sortingBars[j + 1].style.height = `${(key / maxValue) * 250}px`;
            this.sortingBars[j + 1].textContent = this.sortingArray.length <= 50 ? key : '';
            this.sortingBars[j + 1].className = 'array-bar';
            
            // Mark sorted portion
            for (let k = 0; k <= i; k++) {
                if (this.sortingBars[k]) {
                    this.sortingBars[k].classList.add('sorted');
                }
            }
            
            await this.delay(this.animationSpeed);
        }
    }

    // Merge Sort Implementation
    async mergeSort(left, right) {
        if (left >= right || !this.isAnimating) return;
        
        const mid = Math.floor((left + right) / 2);
        
        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    }

    async merge(left, mid, right) {
        if (!this.isAnimating) return;
        
        const leftArr = this.sortingArray.slice(left, mid + 1);
        const rightArr = this.sortingArray.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        this.updateSortingStatus(`Merge Sort: Merging subarrays [${left}-${mid}] and [${mid + 1}-${right}]`);
        
        while (i < leftArr.length && j < rightArr.length && this.isAnimating) {
            await this.highlightBars([k], 'current');
            
            if (leftArr[i] <= rightArr[j]) {
                this.sortingArray[k] = leftArr[i];
                i++;
            } else {
                this.sortingArray[k] = rightArr[j];
                j++;
            }
            
            const maxValue = Math.max(...this.sortingArray);
            this.sortingBars[k].style.height = `${(this.sortingArray[k] / maxValue) * 250}px`;
            this.sortingBars[k].textContent = this.sortingArray.length <= 50 ? this.sortingArray[k] : '';
            
            this.playSound(400 + this.sortingArray[k] * 2, 50);
            
            k++;
            await this.delay(this.animationSpeed);
            
            if (this.sortingBars[k - 1]) {
                this.sortingBars[k - 1].className = 'array-bar';
            }
        }
        
        while (i < leftArr.length && this.isAnimating) {
            this.sortingArray[k] = leftArr[i];
            const maxValue = Math.max(...this.sortingArray);
            this.sortingBars[k].style.height = `${(this.sortingArray[k] / maxValue) * 250}px`;
            this.sortingBars[k].textContent = this.sortingArray.length <= 50 ? this.sortingArray[k] : '';
            i++;
            k++;
            await this.delay(this.animationSpeed / 2);
        }
        
        while (j < rightArr.length && this.isAnimating) {
            this.sortingArray[k] = rightArr[j];
            const maxValue = Math.max(...this.sortingArray);
            this.sortingBars[k].style.height = `${(this.sortingArray[k] / maxValue) * 250}px`;
            this.sortingBars[k].textContent = this.sortingArray.length <= 50 ? this.sortingArray[k] : '';
            j++;
            k++;
            await this.delay(this.animationSpeed / 2);
        }
    }

    // Quick Sort Implementation
    async quickSort(low, high) {
        if (low < high && this.isAnimating) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        if (!this.isAnimating) return low;
        
        const pivot = this.sortingArray[high];
        this.sortingBars[high].className = 'array-bar pivot';
        
        this.updateSortingStatus(`Quick Sort: Partitioning around pivot ${pivot}`);
        
        let i = low - 1;
        
        for (let j = low; j < high && this.isAnimating; j++) {
            await this.highlightBars([j], 'comparing');
            
            if (this.sortingArray[j] < pivot) {
                i++;
                if (i !== j) {
                    await this.swapBars(i, j);
                }
            }
            
            await this.delay(this.animationSpeed / 2);
            this.sortingBars[j].className = 'array-bar';
        }
        
        if (this.isAnimating) {
            await this.swapBars(i + 1, high);
        }
        
        this.sortingBars[high].className = 'array-bar';
        return i + 1;
    }

    // Heap Sort Implementation
    async heapSort() {
        const n = this.sortingArray.length;
        
        // Build max heap
        this.updateSortingStatus('Heap Sort: Building max heap');
        for (let i = Math.floor(n / 2) - 1; i >= 0 && this.isAnimating; i--) {
            await this.heapify(n, i);
        }
        
        // Extract elements from heap one by one
        for (let i = n - 1; i > 0 && this.isAnimating; i--) {
            this.updateSortingStatus(`Heap Sort: Moving max element to position ${i}`);
            
            await this.swapBars(0, i);
            this.sortingBars[i].className = 'array-bar sorted';
            
            await this.heapify(i, 0);
        }
        
        if (this.sortingBars[0]) {
            this.sortingBars[0].className = 'array-bar sorted';
        }
    }

    async heapify(n, i) {
        if (!this.isAnimating) return;
        
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n && this.sortingArray[left] > this.sortingArray[largest]) {
            largest = left;
        }
        
        if (right < n && this.sortingArray[right] > this.sortingArray[largest]) {
            largest = right;
        }
        
        if (largest !== i) {
            await this.highlightBars([i, largest], 'comparing');
            await this.swapBars(i, largest);
            await this.heapify(n, largest);
        }
    }

    updateSortingInfo() {
        const algorithm = document.getElementById('sortingAlgorithm').value;
        const descriptions = {
            bubble: {
                description: "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(n)</td></tr>
                        <tr><td>Average</td><td>O(n²)</td></tr>
                        <tr><td>Worst</td><td>O(n²)</td></tr>
                        <tr><td>Space</td><td>O(1)</td></tr>
                    </table>
                `
            },
            selection: {
                description: "Selection Sort finds the minimum element and places it at the beginning, then repeats for the remaining unsorted portion.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(n²)</td></tr>
                        <tr><td>Average</td><td>O(n²)</td></tr>
                        <tr><td>Worst</td><td>O(n²)</td></tr>
                        <tr><td>Space</td><td>O(1)</td></tr>
                    </table>
                `
            },
            insertion: {
                description: "Insertion Sort builds the sorted array one element at a time by inserting each element into its correct position.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(n)</td></tr>
                        <tr><td>Average</td><td>O(n²)</td></tr>
                        <tr><td>Worst</td><td>O(n²)</td></tr>
                        <tr><td>Space</td><td>O(1)</td></tr>
                    </table>
                `
            },
            merge: {
                description: "Merge Sort divides the array into halves, sorts them recursively, and then merges the sorted halves.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(n log n)</td></tr>
                        <tr><td>Average</td><td>O(n log n)</td></tr>
                        <tr><td>Worst</td><td>O(n log n)</td></tr>
                        <tr><td>Space</td><td>O(n)</td></tr>
                    </table>
                `
            },
            quick: {
                description: "Quick Sort picks a pivot element and partitions the array around it, then recursively sorts the partitions.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(n log n)</td></tr>
                        <tr><td>Average</td><td>O(n log n)</td></tr>
                        <tr><td>Worst</td><td>O(n²)</td></tr>
                        <tr><td>Space</td><td>O(log n)</td></tr>
                    </table>
                `
            },
            heap: {
                description: "Heap Sort builds a max heap from the array, then repeatedly extracts the maximum element to build the sorted array.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(n log n)</td></tr>
                        <tr><td>Average</td><td>O(n log n)</td></tr>
                        <tr><td>Worst</td><td>O(n log n)</td></tr>
                        <tr><td>Space</td><td>O(1)</td></tr>
                    </table>
                `
            }
        };

        const info = descriptions[algorithm];
        document.getElementById('sortingDescription').textContent = info.description;
        document.getElementById('sortingComplexity').innerHTML = info.complexity;
    }

    // SEARCHING VISUALIZER
    initializeSearchingVisualizer() {
        this.searchingArray = [];
        this.searchingElements = [];
        this.searchingSpeed = 800; // Default speed in milliseconds

        // Event listeners
        document.getElementById('generateSearchArray').addEventListener('click', () => {
            this.generateSearchingArray();
        });

        document.getElementById('startSearching').addEventListener('click', () => {
            this.startSearching();
        });

        document.getElementById('resetSearching').addEventListener('click', () => {
            this.resetSearching();
        });

        document.getElementById('searchAlgorithm').addEventListener('change', () => {
            this.updateSearchingInfo();
            this.generateSearchingArray();
        });

        document.getElementById('searchSpeed').addEventListener('input', () => {
            this.updateSearchingSpeed();
        });

        document.getElementById('searchTarget').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startSearching();
            }
        });

        // Initialize
        this.generateSearchingArray();
        this.updateSearchingInfo();
        this.updateSearchingSpeed();
    }

    updateSearchingSpeed() {
        const speedSlider = document.getElementById('searchSpeed');
        this.searchingSpeed = parseInt(speedSlider.value);
        document.getElementById('searchSpeedLabel').textContent = `Speed: ${this.searchingSpeed}ms`;
    }

    generateSearchingArray() {
        if (this.isAnimating) return;

        const algorithm = document.getElementById('searchAlgorithm').value;
        const size = 15; // Fixed size for better visualization
        this.searchingArray = [];

        if (algorithm === 'binary') {
            // Generate sorted array for binary search
            for (let i = 0; i < size; i++) {
                this.searchingArray.push((i + 1) * 5 + Math.floor(Math.random() * 3));
            }
        } else {
            // Generate random array for linear search
            for (let i = 0; i < size; i++) {
                this.searchingArray.push(Math.floor(Math.random() * 100) + 1);
            }
        }

        this.renderSearchingArray();
        this.updateSearchingStatus('Array generated. Enter a value to search for.');
        this.clearSearchingVariables();
    }

    renderSearchingArray() {
        const container = document.getElementById('searchingArray');
        container.innerHTML = '';
        this.searchingElements = [];

        // Create responsive array container
        const arrayWrapper = document.createElement('div');
        arrayWrapper.style.display = 'flex';
        arrayWrapper.style.flexDirection = 'column';
        arrayWrapper.style.alignItems = 'center';
        arrayWrapper.style.width = '100%';

        // Index labels container
        const indexContainer = document.createElement('div');
        indexContainer.style.display = 'flex';
        indexContainer.style.justifyContent = 'center';
        indexContainer.style.marginBottom = '5px';
        indexContainer.style.width = '100%';
        indexContainer.style.maxWidth = '100%';

        // Array elements container with responsive class
        const elementsContainer = document.createElement('div');
        elementsContainer.className = 'searching-array-container';

        this.searchingArray.forEach((value, index) => {
            // Index label
            const indexLabel = document.createElement('div');
            indexLabel.textContent = index;
            indexLabel.className = 'array-index';
            indexLabel.style.flex = '1 1 auto';
            indexLabel.style.minWidth = '40px';
            indexLabel.style.maxWidth = '80px';
            indexLabel.style.margin = '0.125rem';
            indexContainer.appendChild(indexLabel);

            // Array element
            const element = document.createElement('div');
            element.className = 'array-element';
            element.textContent = value;
            element.dataset.index = index;
            
            elementsContainer.appendChild(element);
            this.searchingElements.push(element);
        });

        arrayWrapper.appendChild(indexContainer);
        arrayWrapper.appendChild(elementsContainer);
        container.appendChild(arrayWrapper);
    }

    clearSearchingVariables() {
        const container = document.getElementById('searchingVariables');
        container.innerHTML = '';
    }

    updateSearchingVariables(variables) {
        const container = document.getElementById('searchingVariables');
        container.innerHTML = '';
        
        Object.entries(variables).forEach(([name, value]) => {
            const varElement = document.createElement('div');
            varElement.className = 'search-variable';
            varElement.innerHTML = `<span class="var-name">${name}:</span> <span class="var-value">${value}</span>`;
            container.appendChild(varElement);
        });
    }

    async startSearching() {
        if (this.isAnimating) return;

        const target = parseInt(document.getElementById('searchTarget').value);
        if (isNaN(target)) {
            this.updateSearchingStatus('Please enter a valid number to search for.');
            return;
        }

        this.isAnimating = true;
        this.updateSearchingControls(true);

        // Clear previous highlights
        this.searchingElements.forEach(element => {
            element.className = 'array-element';
        });

        const algorithm = document.getElementById('searchAlgorithm').value;
        let found = false;
        let foundIndex = -1;

        try {
            if (algorithm === 'linear') {
                const result = await this.enhancedLinearSearch(target);
                found = result.found;
                foundIndex = result.index;
            } else {
                const result = await this.enhancedBinarySearch(target);
                found = result.found;
                foundIndex = result.index;
            }

            if (found) {
                this.updateSearchingStatus(`Found ${target} at index ${foundIndex}!`);
                this.playSound(800, 200);
            } else {
                this.updateSearchingStatus(`${target} not found in the array.`);
                this.playSound(200, 200);
            }
        } catch (error) {
            console.error('Searching error:', error);
        }

        this.isAnimating = false;
        this.updateSearchingControls(false);
    }

    async enhancedLinearSearch(target) {
        this.updateSearchingStatus(`Linear Search: Searching for ${target}...`);
        
        for (let i = 0; i < this.searchingArray.length && this.isAnimating; i++) {
            // Update variables display
            this.updateSearchingVariables({
                'target': target,
                'current_index': i,
                'current_value': this.searchingArray[i],
                'comparisons': i + 1
            });

            // Highlight current element
            this.searchingElements[i].className = 'array-element comparing';
            this.updateSearchingStatus(`Linear Search: Checking index ${i}, value = ${this.searchingArray[i]}`);
            
            this.playSound(400 + this.searchingArray[i] * 5, 100);
            await this.delay(this.searchingSpeed);

            if (this.searchingArray[i] === target) {
                // Found the target
                this.searchingElements[i].className = 'array-element found';
                this.updateSearchingVariables({
                    'target': target,
                    'found_at_index': i,
                    'found_value': this.searchingArray[i],
                    'total_comparisons': i + 1
                });
                return { found: true, index: i };
            } else {
                // Not found, mark as checked
                this.searchingElements[i].className = 'array-element checked';
                await this.delay(this.searchingSpeed * 0.3);
            }
        }

        this.updateSearchingVariables({
            'target': target,
            'result': 'NOT FOUND',
            'total_comparisons': this.searchingArray.length
        });

        return { found: false, index: -1 };
    }

    async enhancedBinarySearch(target) {
        let left = 0;
        let right = this.searchingArray.length - 1;
        let comparisons = 0;
        
        this.updateSearchingStatus(`Binary Search: Searching for ${target} in sorted array...`);

        while (left <= right && this.isAnimating) {
            const mid = Math.floor((left + right) / 2);
            comparisons++;

            // Clear previous highlights
            this.searchingElements.forEach(element => {
                element.className = 'array-element';
            });

            // Update variables display
            this.updateSearchingVariables({
                'target': target,
                'left': left,
                'right': right,
                'mid': mid,
                'mid_value': this.searchingArray[mid],
                'comparisons': comparisons
            });
            
            // Highlight search range
            for (let i = 0; i < this.searchingArray.length; i++) {
                if (i >= left && i <= right) {
                    this.searchingElements[i].className = 'array-element range';
                } else {
                    this.searchingElements[i].className = 'array-element checked';
                }
            }

            this.updateSearchingStatus(`Binary Search: Range [${left}, ${right}], checking middle index ${mid}`);
            await this.delay(this.searchingSpeed);

            // Highlight middle element
            this.searchingElements[mid].className = 'array-element comparing';
            this.updateSearchingStatus(`Comparing: ${this.searchingArray[mid]} vs ${target}`);
            
            this.playSound(400 + this.searchingArray[mid] * 5, 100);
            await this.delay(this.searchingSpeed);

            if (this.searchingArray[mid] === target) {
                // Found the target
                this.searchingElements[mid].className = 'array-element found';
                this.updateSearchingVariables({
                    'target': target,
                    'found_at_index': mid,
                    'found_value': this.searchingArray[mid],
                    'total_comparisons': comparisons
                });
                return { found: true, index: mid };
            } else if (this.searchingArray[mid] < target) {
                // Target is in the right half
                this.updateSearchingStatus(`${this.searchingArray[mid]} < ${target}, searching right half [${mid + 1}, ${right}]`);
                left = mid + 1;
            } else {
                // Target is in the left half
                this.updateSearchingStatus(`${this.searchingArray[mid]} > ${target}, searching left half [${left}, ${mid - 1}]`);
                right = mid - 1;
            }

            await this.delay(this.searchingSpeed * 0.6);
        }

        this.updateSearchingVariables({
            'target': target,
            'result': 'NOT FOUND',
            'total_comparisons': comparisons
        });

        return { found: false, index: -1 };
    }

    resetSearching() {
        this.isAnimating = false;
        this.updateSearchingControls(false);
        this.generateSearchingArray();
        document.getElementById('searchTarget').value = '';
        this.clearSearchingVariables();
    }

    updateSearchingControls(isAnimating) {
        document.getElementById('startSearching').disabled = isAnimating;
        document.getElementById('generateSearchArray').disabled = isAnimating;
        document.getElementById('searchAlgorithm').disabled = isAnimating;
        document.getElementById('searchTarget').disabled = isAnimating;
        document.getElementById('searchSpeed').disabled = isAnimating;
    }

    updateSearchingStatus(message) {
        document.getElementById('searchingStatus').textContent = message;
    }

    updateSearchingInfo() {
        const algorithm = document.getElementById('searchAlgorithm').value;
        const descriptions = {
            linear: {
                description: "Linear Search checks each element sequentially until the target is found or the end is reached.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(1)</td></tr>
                        <tr><td>Average</td><td>O(n)</td></tr>
                        <tr><td>Worst</td><td>O(n)</td></tr>
                        <tr><td>Space</td><td>O(1)</td></tr>
                    </table>
                `
            },
            binary: {
                description: "Binary Search repeatedly divides the sorted array in half, comparing the target with the middle element.",
                complexity: `
                    <table>
                        <tr><th>Case</th><th>Time Complexity</th></tr>
                        <tr><td>Best</td><td>O(1)</td></tr>
                        <tr><td>Average</td><td>O(log n)</td></tr>
                        <tr><td>Worst</td><td>O(log n)</td></tr>
                        <tr><td>Space</td><td>O(1)</td></tr>
                    </table>
                `
            }
        };

        const info = descriptions[algorithm];
        document.getElementById('searchingDescription').textContent = info.description;
        document.getElementById('searchingComplexity').innerHTML = info.complexity;
    }

    // TREE VISUALIZER
    initializeTreeVisualizer() {
        this.binaryTree = null;
        this.treeNodes = [];
        this.treeEdges = [];

        // Event listeners
        document.getElementById('insertNode').addEventListener('click', () => {
            this.insertTreeNode();
        });

        document.getElementById('deleteNode').addEventListener('click', () => {
            this.deleteTreeNode();
        });

        document.getElementById('clearTree').addEventListener('click', () => {
            this.clearTree();
        });

        document.getElementById('randomTree').addEventListener('click', () => {
            this.generateRandomTree();
        });

        document.getElementById('inorderTraversal').addEventListener('click', () => {
            this.startTraversal('inorder');
        });

        document.getElementById('preorderTraversal').addEventListener('click', () => {
            this.startTraversal('preorder');
        });

        document.getElementById('postorderTraversal').addEventListener('click', () => {
            this.startTraversal('postorder');
        });

        document.getElementById('treeValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.insertTreeNode();
            }
        });

        // Initialize
        this.updateTreeInfo();
        this.updateTreeStatus('Tree is empty. Insert values to build the tree.');
    }

    insertTreeNode() {
        if (this.isAnimating) return;

        const value = parseInt(document.getElementById('treeValue').value);
        if (isNaN(value)) {
            this.updateTreeStatus('Please enter a valid number.');
            return;
        }

        this.binaryTree = this.insertIntoBST(this.binaryTree, value);
        document.getElementById('treeValue').value = '';
        this.renderTree();
        this.updateTreeStatus(`Inserted ${value} into the tree.`);
        this.playSound(400 + value * 5, 100);
    }

    deleteTreeNode() {
        if (this.isAnimating) return;

        const value = parseInt(document.getElementById('treeValue').value);
        if (isNaN(value)) {
            this.updateTreeStatus('Please enter a valid number to delete.');
            return;
        }

        if (!this.findInBST(this.binaryTree, value)) {
            this.updateTreeStatus(`Value ${value} not found in the tree.`);
            return;
        }

        this.binaryTree = this.deleteFromBST(this.binaryTree, value);
        document.getElementById('treeValue').value = '';
        this.renderTree();
        this.updateTreeStatus(`Deleted ${value} from the tree.`);
        this.playSound(200, 100);
    }

    clearTree() {
        if (this.isAnimating) return;

        this.binaryTree = null;
        this.renderTree();
        this.updateTreeStatus('Tree cleared.');
    }

    generateRandomTree() {
        if (this.isAnimating) return;

        // Clear existing tree
        this.binaryTree = null;
        
        // Generate 7-12 random unique values between 1-100
        const nodeCount = Math.floor(Math.random() * 6) + 7; // 7 to 12 nodes
        const values = new Set();
        
        while (values.size < nodeCount) {
            values.add(Math.floor(Math.random() * 100) + 1);
        }
        
        // Insert values into BST
        const valueArray = Array.from(values);
        valueArray.forEach(value => {
            this.binaryTree = this.insertIntoBST(this.binaryTree, value);
        });
        
        this.renderTree();
        this.updateTreeStatus(`Generated random tree with ${nodeCount} nodes: [${valueArray.sort((a, b) => a - b).join(', ')}]`);
        this.playSound(600, 200);
    }

    insertIntoBST(root, value) {
        if (root === null) {
            return { value: value, left: null, right: null };
        }

        if (value < root.value) {
            root.left = this.insertIntoBST(root.left, value);
        } else if (value > root.value) {
            root.right = this.insertIntoBST(root.right, value);
        }
        // If value equals root.value, don't insert (no duplicates)

        return root;
    }

    deleteFromBST(root, value) {
        if (root === null) return root;

        if (value < root.value) {
            root.left = this.deleteFromBST(root.left, value);
        } else if (value > root.value) {
            root.right = this.deleteFromBST(root.right, value);
        } else {
            // Node to be deleted found
            if (root.left === null) return root.right;
            if (root.right === null) return root.left;

            // Node with two children
            const minValue = this.findMin(root.right);
            root.value = minValue;
            root.right = this.deleteFromBST(root.right, minValue);
        }

        return root;
    }

    findMin(root) {
        while (root.left !== null) {
            root = root.left;
        }
        return root.value;
    }

    findInBST(root, value) {
        if (root === null) return false;
        if (root.value === value) return true;
        if (value < root.value) return this.findInBST(root.left, value);
        return this.findInBST(root.right, value);
    }

    renderTree() {
        const container = document.getElementById('treeContainer');
        container.innerHTML = '';
        this.treeNodes = [];
        this.treeEdges = [];

        if (this.binaryTree === null) {
            this.updateTreeStatus('Tree is empty.');
            return;
        }

        const positions = this.calculateTreePositions(this.binaryTree);
        this.drawTree(container, this.binaryTree, positions);
    }

    calculateTreePositions(root) {
        if (!root) return {};

        const positions = {};
        const queue = [{ node: root, x: 400, y: 50, level: 0 }];
        const levelWidth = 200;

        while (queue.length > 0) {
            const { node, x, y, level } = queue.shift();
            positions[node.value] = { x, y };

            const nextY = y + 80;
            const offset = levelWidth / Math.pow(2, level + 1);

            if (node.left) {
                queue.push({ node: node.left, x: x - offset, y: nextY, level: level + 1 });
            }
            if (node.right) {
                queue.push({ node: node.right, x: x + offset, y: nextY, level: level + 1 });
            }
        }

        return positions;
    }

    drawTree(container, root, positions) {
        // Draw edges first
        this.drawTreeEdges(container, root, positions);
        // Draw nodes on top
        this.drawTreeNodes(container, root, positions);
    }

    drawTreeEdges(container, root, positions) {
        if (!root) return;

        const drawEdge = (parent, child) => {
            const parentPos = positions[parent.value];
            const childPos = positions[child.value];

            const edge = document.createElement('div');
            edge.className = 'tree-edge';
            
            const length = Math.sqrt(
                Math.pow(childPos.x - parentPos.x, 2) + 
                Math.pow(childPos.y - parentPos.y, 2)
            );
            const angle = Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x);

            edge.style.width = `${length}px`;
            edge.style.height = '2px';
            edge.style.left = `${parentPos.x}px`;
            edge.style.top = `${parentPos.y + 20}px`;
            edge.style.transform = `rotate(${angle}rad)`;

            container.appendChild(edge);
            this.treeEdges.push(edge);
        };

        const traverse = (node) => {
            if (!node) return;
            
            if (node.left) {
                drawEdge(node, node.left);
                traverse(node.left);
            }
            if (node.right) {
                drawEdge(node, node.right);
                traverse(node.right);
            }
        };

        traverse(root);
    }

    drawTreeNodes(container, root, positions) {
        const traverse = (node) => {
            if (!node) return;

            const pos = positions[node.value];
            const nodeElement = document.createElement('div');
            nodeElement.className = 'tree-node';
            nodeElement.textContent = node.value;
            nodeElement.style.left = `${pos.x - 20}px`;
            nodeElement.style.top = `${pos.y}px`;
            nodeElement.dataset.value = node.value;

            container.appendChild(nodeElement);
            this.treeNodes.push(nodeElement);

            traverse(node.left);
            traverse(node.right);
        };

        traverse(root);
    }

    async startTraversal(type) {
        if (this.isAnimating || !this.binaryTree) return;

        this.isAnimating = true;
        this.updateTreeControls(true);

        const traversalOrder = [];
        
        switch (type) {
            case 'inorder':
                this.inorderTraversal(this.binaryTree, traversalOrder);
                this.updateTreeStatus('Inorder Traversal: Left → Root → Right');
                break;
            case 'preorder':
                this.preorderTraversal(this.binaryTree, traversalOrder);
                this.updateTreeStatus('Preorder Traversal: Root → Left → Right');
                break;
            case 'postorder':
                this.postorderTraversal(this.binaryTree, traversalOrder);
                this.updateTreeStatus('Postorder Traversal: Left → Right → Root');
                break;
        }

        // Animate the traversal
        for (let i = 0; i < traversalOrder.length && this.isAnimating; i++) {
            const value = traversalOrder[i];
            const nodeElement = this.treeNodes.find(node => 
                parseInt(node.dataset.value) === value
            );

            if (nodeElement) {
                nodeElement.classList.add('highlighted');
                this.playSound(400 + value * 5, 200);
                await this.delay(800);
                nodeElement.classList.remove('highlighted');
            }
        }

        // Reset all nodes
        this.treeNodes.forEach(node => {
            node.classList.remove('highlighted');
        });

        this.isAnimating = false;
        this.updateTreeControls(false);
        this.updateTreeStatus(`${type.charAt(0).toUpperCase() + type.slice(1)} traversal completed: ${traversalOrder.join(' → ')}`);
    }

    inorderTraversal(root, result) {
        if (root) {
            this.inorderTraversal(root.left, result);
            result.push(root.value);
            this.inorderTraversal(root.right, result);
        }
    }

    preorderTraversal(root, result) {
        if (root) {
            result.push(root.value);
            this.preorderTraversal(root.left, result);
            this.preorderTraversal(root.right, result);
        }
    }

    postorderTraversal(root, result) {
        if (root) {
            this.postorderTraversal(root.left, result);
            this.postorderTraversal(root.right, result);
            result.push(root.value);
        }
    }

    updateTreeControls(isAnimating) {
        document.getElementById('insertNode').disabled = isAnimating;
        document.getElementById('deleteNode').disabled = isAnimating;
        document.getElementById('clearTree').disabled = isAnimating;
        document.getElementById('treeValue').disabled = isAnimating;
        document.getElementById('inorderTraversal').disabled = isAnimating || !this.binaryTree;
        document.getElementById('preorderTraversal').disabled = isAnimating || !this.binaryTree;
        document.getElementById('postorderTraversal').disabled = isAnimating || !this.binaryTree;
    }

    updateTreeStatus(message) {
        document.getElementById('treeStatus').textContent = message;
    }

    updateTreeInfo() {
        const description = "A binary tree is a hierarchical data structure where each node has at most two children.";
        const complexity = `
            <table>
                <tr><th>Operation</th><th>Average</th><th>Worst</th></tr>
                <tr><td>Search</td><td>O(log n)</td><td>O(n)</td></tr>
                <tr><td>Insert</td><td>O(log n)</td><td>O(n)</td></tr>
                <tr><td>Delete</td><td>O(log n)</td><td>O(n)</td></tr>
                <tr><td>Space</td><td colspan="2">O(n)</td></tr>
            </table>
        `;

        document.getElementById('treeDescription').textContent = description;
        document.getElementById('treeComplexity').innerHTML = complexity;
    }

    // HEAP VISUALIZER
    initializeHeapVisualizer() {
        this.heap = [];
        this.heapType = 'max'; // 'max' or 'min'

        // Event listeners
        document.getElementById('insertHeap').addEventListener('click', () => {
            this.insertHeapElement();
        });

        document.getElementById('deleteRoot').addEventListener('click', () => {
            this.deleteHeapRoot();
        });

        document.getElementById('clearHeap').addEventListener('click', () => {
            this.clearHeap();
        });

        document.getElementById('randomHeap').addEventListener('click', () => {
            this.generateRandomHeap();
        });

        document.getElementById('heapType').addEventListener('change', (e) => {
            this.heapType = e.target.value;
            this.clearHeap();
            this.updateHeapInfo();
        });

        document.getElementById('heapValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.insertHeapElement();
            }
        });

        // Initialize
        this.updateHeapInfo();
        this.updateHeapStatus('Heap is empty. Insert values to build the heap.');
    }

    insertHeapElement() {
        if (this.isAnimating) return;

        const value = parseInt(document.getElementById('heapValue').value);
        if (isNaN(value)) {
            this.updateHeapStatus('Please enter a valid number.');
            return;
        }

        this.heap.push(value);
        document.getElementById('heapValue').value = '';
        
        // Heapify up
        this.heapifyUp(this.heap.length - 1);
        this.renderHeap();
        this.updateHeapStatus(`Inserted ${value} into the ${this.heapType} heap.`);
        this.playSound(400 + value * 5, 100);
    }

    async deleteHeapRoot() {
        if (this.isAnimating || this.heap.length === 0) return;

        this.isAnimating = true;
        this.updateHeapControls(true);

        const root = this.heap[0];
        
        if (this.heap.length === 1) {
            this.heap = [];
        } else {
            // Move last element to root
            this.heap[0] = this.heap.pop();
            await this.animatedHeapifyDown(0);
        }

        this.renderHeap();
        this.updateHeapStatus(`Deleted root ${root} from the ${this.heapType} heap.`);
        this.playSound(200, 100);

        this.isAnimating = false;
        this.updateHeapControls(false);
    }

    clearHeap() {
        if (this.isAnimating) return;

        this.heap = [];
        this.renderHeap();
        this.updateHeapStatus('Heap cleared.');
    }

    generateRandomHeap() {
        if (this.isAnimating) return;

        // Clear existing heap
        this.heap = [];
        
        // Generate 6-10 random values between 1-50
        const nodeCount = Math.floor(Math.random() * 5) + 6; // 6 to 10 nodes
        const values = [];
        
        for (let i = 0; i < nodeCount; i++) {
            values.push(Math.floor(Math.random() * 50) + 1);
        }
        
        // Insert values into heap one by one
        values.forEach(value => {
            this.heap.push(value);
            this.heapifyUp(this.heap.length - 1);
        });
        
        this.renderHeap();
        this.updateHeapStatus(`Generated random ${this.heapType} heap with ${nodeCount} nodes: [${values.join(', ')}]`);
        this.playSound(600, 200);
    }

    heapifyUp(index) {
        if (index === 0) return;

        const parentIndex = Math.floor((index - 1) / 2);
        const shouldSwap = this.heapType === 'max' 
            ? this.heap[index] > this.heap[parentIndex]
            : this.heap[index] < this.heap[parentIndex];

        if (shouldSwap) {
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            this.heapifyUp(parentIndex);
        }
    }

    async animatedHeapifyDown(index) {
        const leftChild = 2 * index + 1;
        const rightChild = 2 * index + 2;
        let targetIndex = index;

        // Find the appropriate child to swap with
        if (leftChild < this.heap.length) {
            const shouldSwapLeft = this.heapType === 'max'
                ? this.heap[leftChild] > this.heap[targetIndex]
                : this.heap[leftChild] < this.heap[targetIndex];
            
            if (shouldSwapLeft) {
                targetIndex = leftChild;
            }
        }

        if (rightChild < this.heap.length) {
            const shouldSwapRight = this.heapType === 'max'
                ? this.heap[rightChild] > this.heap[targetIndex]
                : this.heap[rightChild] < this.heap[targetIndex];
            
            if (shouldSwapRight) {
                targetIndex = rightChild;
            }
        }

        if (targetIndex !== index) {
            // Highlight elements being swapped
            this.highlightHeapElements([index, targetIndex]);
            await this.delay(500);

            [this.heap[index], this.heap[targetIndex]] = [this.heap[targetIndex], this.heap[index]];
            this.renderHeap();
            this.playSound(400 + this.heap[index] * 3, 100);
            
            await this.delay(300);
            await this.animatedHeapifyDown(targetIndex);
        }
    }

    highlightHeapElements(indices) {
        // Reset all highlights
        document.querySelectorAll('.heap-element').forEach(el => {
            el.classList.remove('highlighted');
        });

        // Highlight specified elements
        indices.forEach(index => {
            const element = document.querySelector(`[data-heap-index="${index}"]`);
            if (element) {
                element.classList.add('highlighted');
            }
        });
    }

    renderHeap() {
        this.renderHeapTree();
        this.renderHeapArray();
    }

    renderHeapTree() {
        const container = document.getElementById('heapTree');
        container.innerHTML = '';

        if (this.heap.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Heap is empty</div>';
            return;
        }

        const positions = this.calculateHeapTreePositions();
        this.drawHeapTree(container, positions);
    }

    calculateHeapTreePositions() {
        const positions = {};
        const levels = Math.ceil(Math.log2(this.heap.length + 1));
        const baseWidth = 300;

        for (let i = 0; i < this.heap.length; i++) {
            const level = Math.floor(Math.log2(i + 1));
            const positionInLevel = i - (Math.pow(2, level) - 1);
            const totalInLevel = Math.pow(2, level);
            
            const x = (positionInLevel + 0.5) * (baseWidth / totalInLevel);
            const y = level * 60 + 30;

            positions[i] = { x, y };
        }

        return positions;
    }

    drawHeapTree(container, positions) {
        // Draw edges first
        for (let i = 1; i < this.heap.length; i++) {
            const parentIndex = Math.floor((i - 1) / 2);
            const parentPos = positions[parentIndex];
            const childPos = positions[i];

            const edge = document.createElement('div');
            edge.className = 'tree-edge';
            
            const length = Math.sqrt(
                Math.pow(childPos.x - parentPos.x, 2) + 
                Math.pow(childPos.y - parentPos.y, 2)
            );
            const angle = Math.atan2(childPos.y - parentPos.y, childPos.x - parentPos.x);

            edge.style.width = `${length}px`;
            edge.style.height = '2px';
            edge.style.left = `${parentPos.x}px`;
            edge.style.top = `${parentPos.y + 20}px`;
            edge.style.transform = `rotate(${angle}rad)`;

            container.appendChild(edge);
        }

        // Draw nodes
        for (let i = 0; i < this.heap.length; i++) {
            const pos = positions[i];
            const node = document.createElement('div');
            node.className = 'tree-node';
            node.textContent = this.heap[i];
            node.style.left = `${pos.x - 20}px`;
            node.style.top = `${pos.y}px`;
            node.dataset.heapIndex = i;

            container.appendChild(node);
        }
    }

    renderHeapArray() {
        const container = document.getElementById('heapArray');
        container.innerHTML = '';

        if (this.heap.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Array representation: []</div>';
            return;
        }

        this.heap.forEach((value, index) => {
            const element = document.createElement('div');
            element.className = 'heap-element';
            element.textContent = value;
            element.dataset.heapIndex = index;
            
            // Color code root differently
            if (index === 0) {
                element.style.backgroundColor = 'var(--color-current)';
            }

            container.appendChild(element);
        });
    }

    updateHeapControls(isAnimating) {
        document.getElementById('insertHeap').disabled = isAnimating;
        document.getElementById('deleteRoot').disabled = isAnimating || this.heap.length === 0;
        document.getElementById('clearHeap').disabled = isAnimating;
        document.getElementById('heapValue').disabled = isAnimating;
        document.getElementById('heapType').disabled = isAnimating;
    }

    updateHeapStatus(message) {
        document.getElementById('heapStatus').textContent = message;
    }

    updateHeapInfo() {
        const description = `A ${this.heapType} heap is a complete binary tree that satisfies the heap property: ${
            this.heapType === 'max' 
                ? 'parent nodes are greater than or equal to their children'
                : 'parent nodes are less than or equal to their children'
        }.`;
        
        const complexity = `
            <table>
                <tr><th>Operation</th><th>Time Complexity</th></tr>
                <tr><td>Insert</td><td>O(log n)</td></tr>
                <tr><td>Delete Root</td><td>O(log n)</td></tr>
                <tr><td>Peek Root</td><td>O(1)</td></tr>
                <tr><td>Build Heap</td><td>O(n)</td></tr>
                <tr><td>Space</td><td>O(n)</td></tr>
            </table>
        `;

        document.getElementById('heapDescription').textContent = description;
        document.getElementById('heapComplexity').innerHTML = complexity;
    }

    // STACK & QUEUE VISUALIZER
    initializeStackQueueVisualizer() {
        this.stack = [];
        this.queue = [];
        this.currentStructure = 'stack'; // 'stack' or 'queue'

        // Event listeners
        document.getElementById('structureType').addEventListener('change', (e) => {
            this.currentStructure = e.target.value;
            this.updateStackQueueDisplay();
            this.updateStackQueueInfo();
        });

        document.getElementById('pushEnqueue').addEventListener('click', () => {
            this.pushEnqueueElement();
        });

        document.getElementById('popDequeue').addEventListener('click', () => {
            this.popDequeueElement();
        });

        document.getElementById('clearStructure').addEventListener('click', () => {
            this.clearStructure();
        });

        document.getElementById('randomFill').addEventListener('click', () => {
            this.generateRandomStructure();
        });

        document.getElementById('stackQueueValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.pushEnqueueElement();
            }
        });

        // Initialize
        this.updateStackQueueDisplay();
        this.updateStackQueueInfo();
        this.updateStackQueueStatus('Structure is empty. Add elements to see operations.');
    }

    pushEnqueueElement() {
        if (this.isAnimating) return;

        const value = document.getElementById('stackQueueValue').value.trim();
        if (!value) {
            this.updateStackQueueStatus('Please enter a value.');
            return;
        }

        if (this.currentStructure === 'stack') {
            this.stack.push(value);
            this.updateStackQueueStatus(`Pushed "${value}" onto the stack.`);
        } else {
            this.queue.push(value);
            this.updateStackQueueStatus(`Enqueued "${value}" into the queue.`);
        }

        document.getElementById('stackQueueValue').value = '';
        this.animateAddElement(value);
        this.playSound(400 + this.getCurrentStructure().length * 50, 100);
    }

    async popDequeueElement() {
        if (this.isAnimating) return;

        const currentData = this.getCurrentStructure();
        if (currentData.length === 0) {
            this.updateStackQueueStatus(`Cannot ${this.currentStructure === 'stack' ? 'pop' : 'dequeue'} from empty ${this.currentStructure}.`);
            return;
        }

        this.isAnimating = true;
        this.updateStackQueueControls(true);

        let removedValue;
        if (this.currentStructure === 'stack') {
            removedValue = this.stack.pop();
            this.updateStackQueueStatus(`Popped "${removedValue}" from the stack.`);
        } else {
            removedValue = this.queue.shift();
            this.updateStackQueueStatus(`Dequeued "${removedValue}" from the queue.`);
        }

        await this.animateRemoveElement();
        this.playSound(300, 100);

        this.isAnimating = false;
        this.updateStackQueueControls(false);
    }

    clearStructure() {
        if (this.isAnimating) return;

        if (this.currentStructure === 'stack') {
            this.stack = [];
        } else {
            this.queue = [];
        }

        this.updateStackQueueDisplay();
        this.updateStackQueueStatus(`${this.currentStructure.charAt(0).toUpperCase() + this.currentStructure.slice(1)} cleared.`);
    }

    generateRandomStructure() {
        if (this.isAnimating) return;

        // Clear existing structure
        if (this.currentStructure === 'stack') {
            this.stack = [];
        } else {
            this.queue = [];
        }

        // Generate 4-8 random values (mix of letters and numbers)
        const elementCount = Math.floor(Math.random() * 5) + 4; // 4 to 8 elements
        const values = [];
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let i = 0; i < elementCount; i++) {
            // Randomly choose between letter and number
            if (Math.random() < 0.5) {
                // Add a letter
                values.push(letters[Math.floor(Math.random() * letters.length)]);
            } else {
                // Add a number
                values.push(Math.floor(Math.random() * 100) + 1);
            }
        }
        
        // Fill the structure
        values.forEach(value => {
            if (this.currentStructure === 'stack') {
                this.stack.push(value);
            } else {
                this.queue.push(value);
            }
        });
        
        this.updateStackQueueDisplay();
        this.updateStackQueueStatus(`Generated random ${this.currentStructure} with ${elementCount} elements: [${values.join(', ')}]`);
        this.playSound(600, 200);
    }

    getCurrentStructure() {
        return this.currentStructure === 'stack' ? this.stack : this.queue;
    }

    async animateAddElement(value) {
        this.isAnimating = true;
        this.updateStackQueueControls(true);

        // Highlight the new element being added
        this.updateStackQueueDisplay();
        
        const elements = document.querySelectorAll('.structure-element');
        if (elements.length > 0) {
            const newElement = this.currentStructure === 'stack' 
                ? elements[elements.length - 1] 
                : elements[0];
            
            newElement.classList.add('highlighted');
            await this.delay(500);
            newElement.classList.remove('highlighted');
        }

        this.isAnimating = false;
        this.updateStackQueueControls(false);
    }

    async animateRemoveElement() {
        // Highlight the element being removed
        const elements = document.querySelectorAll('.structure-element');
        if (elements.length > 0) {
            const removingElement = this.currentStructure === 'stack' 
                ? elements[elements.length - 1] 
                : elements[0];
            
            removingElement.classList.add('removing');
            await this.delay(500);
        }

        this.updateStackQueueDisplay();
    }

    updateStackQueueDisplay() {
        const container = document.getElementById('structureVisualization');
        container.innerHTML = '';

        const currentData = this.getCurrentStructure();

        if (currentData.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">${this.currentStructure.charAt(0).toUpperCase() + this.currentStructure.slice(1)} is empty</div>`;
            return;
        }

        // Create structure visualization
        const structureContainer = document.createElement('div');
        structureContainer.className = `structure-container ${this.currentStructure}`;

        if (this.currentStructure === 'stack') {
            // Stack: display from bottom to top (last element at top)
            currentData.forEach((value, index) => {
                const element = document.createElement('div');
                element.className = 'structure-element stack-element';
                element.textContent = value;
                element.style.animationDelay = `${index * 0.1}s`;
                
                if (index === currentData.length - 1) {
                    element.classList.add('top-element');
                }
                
                structureContainer.appendChild(element);
            });

            // Add stack pointer
            const pointer = document.createElement('div');
            pointer.className = 'stack-pointer';
            pointer.textContent = 'TOP';
            structureContainer.appendChild(pointer);

        } else {
            // Queue: display from front to rear
            const frontLabel = document.createElement('div');
            frontLabel.className = 'queue-label front-label';
            frontLabel.textContent = 'FRONT';
            structureContainer.appendChild(frontLabel);

            currentData.forEach((value, index) => {
                const element = document.createElement('div');
                element.className = 'structure-element queue-element';
                element.textContent = value;
                element.style.animationDelay = `${index * 0.1}s`;
                
                if (index === 0) {
                    element.classList.add('front-element');
                }
                if (index === currentData.length - 1) {
                    element.classList.add('rear-element');
                }
                
                structureContainer.appendChild(element);
            });

            const rearLabel = document.createElement('div');
            rearLabel.className = 'queue-label rear-label';
            rearLabel.textContent = 'REAR';
            structureContainer.appendChild(rearLabel);
        }

        container.appendChild(structureContainer);

        // Update operation info
        this.updateOperationInfo();
    }

    updateOperationInfo() {
        const currentData = this.getCurrentStructure();
        const infoContainer = document.getElementById('operationInfo');
        
        if (currentData.length === 0) {
            infoContainer.innerHTML = '<div style="color: var(--text-secondary);">No elements to display</div>';
            return;
        }

        let infoHTML = '';
        if (this.currentStructure === 'stack') {
            infoHTML = `
                <div><strong>Size:</strong> ${currentData.length}</div>
                <div><strong>Top Element:</strong> ${currentData[currentData.length - 1]}</div>
                <div><strong>Next Operation:</strong> Pop from top</div>
            `;
        } else {
            infoHTML = `
                <div><strong>Size:</strong> ${currentData.length}</div>
                <div><strong>Front Element:</strong> ${currentData[0]}</div>
                <div><strong>Rear Element:</strong> ${currentData[currentData.length - 1]}</div>
                <div><strong>Next Operation:</strong> Dequeue from front</div>
            `;
        }

        infoContainer.innerHTML = infoHTML;
    }

    updateStackQueueControls(isAnimating) {
        const currentData = this.getCurrentStructure();
        
        document.getElementById('pushEnqueue').disabled = isAnimating;
        document.getElementById('popDequeue').disabled = isAnimating || currentData.length === 0;
        document.getElementById('clearStructure').disabled = isAnimating;
        document.getElementById('stackQueueValue').disabled = isAnimating;
        document.getElementById('structureType').disabled = isAnimating;

        // Update button text
        const pushButton = document.getElementById('pushEnqueue');
        const popButton = document.getElementById('popDequeue');
        
        if (this.currentStructure === 'stack') {
            pushButton.textContent = 'Push';
            popButton.textContent = 'Pop';
        } else {
            pushButton.textContent = 'Enqueue';
            popButton.textContent = 'Dequeue';
        }
    }

    updateStackQueueStatus(message) {
        document.getElementById('structureStatus').textContent = message;
    }

    updateStackQueueInfo() {
        const isStack = this.currentStructure === 'stack';
        
        const description = isStack 
            ? 'A stack is a linear data structure that follows the Last In, First Out (LIFO) principle. Elements are added and removed from the same end, called the top.'
            : 'A queue is a linear data structure that follows the First In, First Out (FIFO) principle. Elements are added at the rear and removed from the front.';
        
        const operations = isStack 
            ? [
                ['Push', 'O(1)', 'Add element to top'],
                ['Pop', 'O(1)', 'Remove element from top'],
                ['Peek/Top', 'O(1)', 'View top element'],
                ['IsEmpty', 'O(1)', 'Check if stack is empty'],
                ['Size', 'O(1)', 'Get number of elements']
            ]
            : [
                ['Enqueue', 'O(1)', 'Add element to rear'],
                ['Dequeue', 'O(1)', 'Remove element from front'],
                ['Front', 'O(1)', 'View front element'],
                ['Rear', 'O(1)', 'View rear element'],
                ['IsEmpty', 'O(1)', 'Check if queue is empty'],
                ['Size', 'O(1)', 'Get number of elements']
            ];

        const complexity = `
            <table>
                <tr><th>Operation</th><th>Time Complexity</th><th>Description</th></tr>
                ${operations.map(([op, time, desc]) => `<tr><td>${op}</td><td>${time}</td><td>${desc}</td></tr>`).join('')}
                <tr><td>Space</td><td>O(n)</td><td>Linear space for n elements</td></tr>
            </table>
        `;

        document.getElementById('structureDescription').textContent = description;
        document.getElementById('structureComplexity').innerHTML = complexity;
        
        this.updateStackQueueControls(false);
    }

    // HASH TABLE VISUALIZER
    initializeHashTableVisualizer() {
        this.hashTable = [];
        this.tableSize = 7;
        this.collisionMethod = 'linear'; // 'linear' or 'chaining'
        this.hashFunction = 'division'; // 'division' or 'multiplication'

        // Initialize hash table
        this.initializeHashTable();

        // Event listeners
        document.getElementById('hashTableSize').addEventListener('change', (e) => {
            this.tableSize = parseInt(e.target.value);
            this.initializeHashTable();
            this.renderHashTable();
            this.updateHashTableInfo();
        });

        document.getElementById('collisionMethod').addEventListener('change', (e) => {
            this.collisionMethod = e.target.value;
            this.initializeHashTable();
            this.renderHashTable();
            this.updateHashTableInfo();
        });

        document.getElementById('hashFunction').addEventListener('change', (e) => {
            this.hashFunction = e.target.value;
            this.initializeHashTable();
            this.renderHashTable();
            this.updateHashTableInfo();
        });

        document.getElementById('insertHash').addEventListener('click', () => {
            this.insertHashElement();
        });

        document.getElementById('searchHash').addEventListener('click', () => {
            this.searchHashElement();
        });

        document.getElementById('deleteHash').addEventListener('click', () => {
            this.deleteHashElement();
        });

        document.getElementById('clearHash').addEventListener('click', () => {
            this.clearHashTable();
        });

        document.getElementById('hashValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.insertHashElement();
            }
        });

        // Initialize
        this.renderHashTable();
        this.updateHashTableInfo();
        this.updateHashTableStatus('Hash table is empty. Insert key-value pairs to see hashing in action.');
    }

    initializeHashTable() {
        if (this.collisionMethod === 'chaining') {
            this.hashTable = Array(this.tableSize).fill(null).map(() => []);
        } else {
            this.hashTable = Array(this.tableSize).fill(null);
        }
    }

    hash(key) {
        if (this.hashFunction === 'division') {
            // Simple division method
            return key % this.tableSize;
        } else {
            // Multiplication method (simplified)
            const A = 0.6180339887; // (√5 - 1) / 2
            return Math.floor(this.tableSize * ((key * A) % 1));
        }
    }

    async insertHashElement() {
        if (this.isAnimating) return;

        const input = document.getElementById('hashValue').value.trim();
        if (!input) {
            this.updateHashTableStatus('Please enter a key-value pair (e.g., "5:apple" or just "5").');
            return;
        }

        let key, value;
        if (input.includes(':')) {
            [key, value] = input.split(':');
            key = parseInt(key.trim());
            value = value.trim();
        } else {
            key = parseInt(input);
            value = `value_${key}`;
        }

        if (isNaN(key)) {
            this.updateHashTableStatus('Key must be a number.');
            return;
        }

        this.isAnimating = true;
        this.updateHashTableControls(true);

        const hashIndex = this.hash(key);
        let insertIndex = hashIndex;
        let probeCount = 0;

        if (this.collisionMethod === 'chaining') {
            // Check if key already exists in the chain
            const chain = this.hashTable[hashIndex];
            const existingIndex = chain.findIndex(item => item.key === key);
            
            if (existingIndex !== -1) {
                chain[existingIndex].value = value;
                this.updateHashTableStatus(`Updated key ${key} with value "${value}" at index ${hashIndex}.`);
            } else {
                chain.push({ key, value });
                this.updateHashTableStatus(`Inserted key ${key} with value "${value}" at index ${hashIndex} (chain length: ${chain.length}).`);
            }
        } else {
            // Linear probing
            while (this.hashTable[insertIndex] !== null && this.hashTable[insertIndex].key !== key) {
                insertIndex = (insertIndex + 1) % this.tableSize;
                probeCount++;
                
                if (probeCount >= this.tableSize) {
                    this.updateHashTableStatus('Hash table is full! Cannot insert.');
                    this.isAnimating = false;
                    this.updateHashTableControls(false);
                    return;
                }
            }

            this.hashTable[insertIndex] = { key, value };
            
            if (probeCount > 0) {
                this.updateHashTableStatus(`Inserted key ${key} with value "${value}" at index ${insertIndex} after ${probeCount} collision(s).`);
            } else {
                this.updateHashTableStatus(`Inserted key ${key} with value "${value}" at index ${insertIndex} (no collision).`);
            }
        }

        document.getElementById('hashValue').value = '';
        
        // Animate the insertion
        await this.animateHashOperation(hashIndex, insertIndex, 'insert');
        this.playSound(400 + key * 10, 100);

        this.isAnimating = false;
        this.updateHashTableControls(false);
    }

    async searchHashElement() {
        if (this.isAnimating) return;

        const input = document.getElementById('hashValue').value.trim();
        if (!input) {
            this.updateHashTableStatus('Please enter a key to search.');
            return;
        }

        const key = parseInt(input);
        if (isNaN(key)) {
            this.updateHashTableStatus('Key must be a number.');
            return;
        }

        this.isAnimating = true;
        this.updateHashTableControls(true);

        const hashIndex = this.hash(key);
        let searchIndex = hashIndex;
        let probeCount = 0;
        let found = false;
        let value = null;

        if (this.collisionMethod === 'chaining') {
            const chain = this.hashTable[hashIndex];
            const item = chain.find(item => item.key === key);
            if (item) {
                found = true;
                value = item.value;
                this.updateHashTableStatus(`Found key ${key} with value "${value}" at index ${hashIndex}.`);
            } else {
                this.updateHashTableStatus(`Key ${key} not found at index ${hashIndex}.`);
            }
        } else {
            // Linear probing search
            while (this.hashTable[searchIndex] !== null) {
                if (this.hashTable[searchIndex].key === key) {
                    found = true;
                    value = this.hashTable[searchIndex].value;
                    break;
                }
                
                searchIndex = (searchIndex + 1) % this.tableSize;
                probeCount++;
                
                if (searchIndex === hashIndex) break; // Full circle
            }

            if (found) {
                if (probeCount > 0) {
                    this.updateHashTableStatus(`Found key ${key} with value "${value}" at index ${searchIndex} after ${probeCount} probe(s).`);
                } else {
                    this.updateHashTableStatus(`Found key ${key} with value "${value}" at index ${searchIndex} (no collision).`);
                }
            } else {
                this.updateHashTableStatus(`Key ${key} not found in hash table.`);
            }
        }

        // Animate the search
        await this.animateHashOperation(hashIndex, searchIndex, found ? 'found' : 'not-found');
        this.playSound(found ? 600 : 300, 100);

        this.isAnimating = false;
        this.updateHashTableControls(false);
    }

    async deleteHashElement() {
        if (this.isAnimating) return;

        const input = document.getElementById('hashValue').value.trim();
        if (!input) {
            this.updateHashTableStatus('Please enter a key to delete.');
            return;
        }

        const key = parseInt(input);
        if (isNaN(key)) {
            this.updateHashTableStatus('Key must be a number.');
            return;
        }

        this.isAnimating = true;
        this.updateHashTableControls(true);

        const hashIndex = this.hash(key);
        let deleteIndex = hashIndex;
        let probeCount = 0;
        let found = false;

        if (this.collisionMethod === 'chaining') {
            const chain = this.hashTable[hashIndex];
            const itemIndex = chain.findIndex(item => item.key === key);
            if (itemIndex !== -1) {
                const deletedItem = chain.splice(itemIndex, 1)[0];
                found = true;
                this.updateHashTableStatus(`Deleted key ${key} with value "${deletedItem.value}" from index ${hashIndex}.`);
            } else {
                this.updateHashTableStatus(`Key ${key} not found for deletion.`);
            }
        } else {
            // Linear probing deletion
            while (this.hashTable[deleteIndex] !== null) {
                if (this.hashTable[deleteIndex].key === key) {
                    const deletedItem = this.hashTable[deleteIndex];
                    this.hashTable[deleteIndex] = null;
                    found = true;
                    
                    if (probeCount > 0) {
                        this.updateHashTableStatus(`Deleted key ${key} with value "${deletedItem.value}" from index ${deleteIndex} after ${probeCount} probe(s).`);
                    } else {
                        this.updateHashTableStatus(`Deleted key ${key} with value "${deletedItem.value}" from index ${deleteIndex} (no collision).`);
                    }
                    break;
                }
                
                deleteIndex = (deleteIndex + 1) % this.tableSize;
                probeCount++;
                
                if (deleteIndex === hashIndex) break; // Full circle
            }

            if (!found) {
                this.updateHashTableStatus(`Key ${key} not found for deletion.`);
            }
        }

        // Animate the deletion
        await this.animateHashOperation(hashIndex, deleteIndex, found ? 'delete' : 'not-found');
        this.playSound(found ? 200 : 300, 100);

        this.isAnimating = false;
        this.updateHashTableControls(false);
    }

    clearHashTable() {
        if (this.isAnimating) return;

        this.initializeHashTable();
        this.renderHashTable();
        this.updateHashTableStatus('Hash table cleared.');
    }

    async animateHashOperation(hashIndex, finalIndex, operation) {
        // Highlight the hash index first
        this.highlightHashSlot(hashIndex, 'hash-highlight');
        await this.delay(500);

        // If different from hash index, highlight the final index
        if (finalIndex !== hashIndex) {
            this.highlightHashSlot(finalIndex, operation === 'found' ? 'found-highlight' : 'probe-highlight');
            await this.delay(500);
        }

        // Update the visualization
        this.renderHashTable();
        await this.delay(300);

        // Clear highlights
        this.clearHashHighlights();
    }

    highlightHashSlot(index, className) {
        const slot = document.querySelector(`[data-hash-index="${index}"]`);
        if (slot) {
            slot.classList.add(className);
        }
    }

    clearHashHighlights() {
        document.querySelectorAll('.hash-slot').forEach(slot => {
            slot.classList.remove('hash-highlight', 'probe-highlight', 'found-highlight');
        });
    }

    renderHashTable() {
        const container = document.getElementById('hashTableVisualization');
        container.innerHTML = '';

        // Create table header
        const header = document.createElement('div');
        header.className = 'hash-table-header';
        header.innerHTML = `
            <div class="hash-info">
                <strong>Hash Function:</strong> ${this.hashFunction === 'division' ? 'Division (key % ' + this.tableSize + ')' : 'Multiplication'}
                <br>
                <strong>Collision Handling:</strong> ${this.collisionMethod === 'linear' ? 'Linear Probing' : 'Chaining'}
                <br>
                <strong>Table Size:</strong> ${this.tableSize}
            </div>
        `;
        container.appendChild(header);

        // Create hash table visualization
        const table = document.createElement('div');
        table.className = 'hash-table';

        for (let i = 0; i < this.tableSize; i++) {
            const slot = document.createElement('div');
            slot.className = 'hash-slot';
            slot.dataset.hashIndex = i;

            const indexLabel = document.createElement('div');
            indexLabel.className = 'slot-index';
            indexLabel.textContent = i;

            const content = document.createElement('div');
            content.className = 'slot-content';

            if (this.collisionMethod === 'chaining') {
                const chain = this.hashTable[i];
                if (chain.length === 0) {
                    content.innerHTML = '<div class="empty-slot">empty</div>';
                } else {
                    content.innerHTML = chain.map(item => 
                        `<div class="chain-item">${item.key}:${item.value}</div>`
                    ).join('');
                }
            } else {
                const item = this.hashTable[i];
                if (item === null) {
                    content.innerHTML = '<div class="empty-slot">empty</div>';
                } else {
                    content.innerHTML = `<div class="hash-item">${item.key}:${item.value}</div>`;
                }
            }

            slot.appendChild(indexLabel);
            slot.appendChild(content);
            table.appendChild(slot);
        }

        container.appendChild(table);
        this.updateHashStatistics();
    }

    updateHashStatistics() {
        const statsContainer = document.getElementById('hashStatistics');
        
        let totalItems = 0;
        let usedSlots = 0;
        let maxChainLength = 0;

        if (this.collisionMethod === 'chaining') {
            this.hashTable.forEach(chain => {
                totalItems += chain.length;
                if (chain.length > 0) usedSlots++;
                maxChainLength = Math.max(maxChainLength, chain.length);
            });
        } else {
            this.hashTable.forEach(slot => {
                if (slot !== null) {
                    totalItems++;
                    usedSlots++;
                }
            });
        }

        const loadFactor = (totalItems / this.tableSize).toFixed(2);
        const utilization = ((usedSlots / this.tableSize) * 100).toFixed(1);

        let statsHTML = `
            <div><strong>Total Items:</strong> ${totalItems}</div>
            <div><strong>Used Slots:</strong> ${usedSlots}/${this.tableSize}</div>
            <div><strong>Load Factor:</strong> ${loadFactor}</div>
            <div><strong>Utilization:</strong> ${utilization}%</div>
        `;

        if (this.collisionMethod === 'chaining') {
            statsHTML += `<div><strong>Max Chain Length:</strong> ${maxChainLength}</div>`;
        }

        statsContainer.innerHTML = statsHTML;
    }

    updateHashTableControls(isAnimating) {
        document.getElementById('insertHash').disabled = isAnimating;
        document.getElementById('searchHash').disabled = isAnimating;
        document.getElementById('deleteHash').disabled = isAnimating;
        document.getElementById('clearHash').disabled = isAnimating;
        document.getElementById('hashValue').disabled = isAnimating;
        document.getElementById('hashTableSize').disabled = isAnimating;
        document.getElementById('collisionMethod').disabled = isAnimating;
        document.getElementById('hashFunction').disabled = isAnimating;
    }

    updateHashTableStatus(message) {
        document.getElementById('hashTableStatus').textContent = message;
    }

    updateHashTableInfo() {
        const description = `A hash table uses a hash function to map keys to indices in an array. ${
            this.collisionMethod === 'linear' 
                ? 'Linear probing resolves collisions by finding the next available slot.'
                : 'Chaining resolves collisions by storing multiple items in linked lists at each slot.'
        }`;
        
        const complexity = `
            <table>
                <tr><th>Operation</th><th>Average Case</th><th>Worst Case</th></tr>
                <tr><td>Insert</td><td>O(1)</td><td>${this.collisionMethod === 'linear' ? 'O(n)' : 'O(n)'}</td></tr>
                <tr><td>Search</td><td>O(1)</td><td>${this.collisionMethod === 'linear' ? 'O(n)' : 'O(n)'}</td></tr>
                <tr><td>Delete</td><td>O(1)</td><td>${this.collisionMethod === 'linear' ? 'O(n)' : 'O(n)'}</td></tr>
                <tr><td>Space</td><td>O(n)</td><td>O(n)</td></tr>
            </table>
        `;

        document.getElementById('hashTableDescription').textContent = description;
        document.getElementById('hashTableComplexity').innerHTML = complexity;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AlgoVerse();
});

