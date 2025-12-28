// City Generator Logic
class CityGenerator {
    // Constants for color variance hash function
    static COLOR_HASH_PRIME_X = 73;
    static COLOR_HASH_PRIME_Y = 149;
    
    // Constants for 3D rendering
    static HEIGHT_BASE_MULTIPLIER = 0.4;
    static HEIGHT_TILT_MULTIPLIER = 0.3;
    static ZOOM_SPEED = 0.001;
    
    // Constants for building windows
    static WINDOW_SIZE = 2;
    static WINDOW_SPACING = 8;
    static WINDOW_SEED_PRIME_X = 73;
    static WINDOW_SEED_PRIME_Y = 149;
    static WINDOW_SEED_PRIME_FLOOR = 37;
    static WINDOW_SEED_PRIME_WIN = 19;
    
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.cellSize = 25;
        this.viewMode = '2d';
        this.cityData = null;
        this.colorSeed = Math.random() * 1000; // Initialize once for deterministic colors
        
        // New properties for advanced features
        this.mapShape = 'square';
        this.waterDensity = 0.15;
        this.timeOfDay = 12; // 0-24 hours
        this.animateSky = true;
        this.weather = 'clear';
        this.skyAnimationTime = 0;
        this.animationFrame = null;
        
        // 3D camera properties
        this.camera = {
            rotationX: 30, // Vertical tilt angle (degrees)
            rotationY: 45, // Horizontal rotation angle (degrees)
            zoom: 1.0,
            offsetX: 0,
            offsetY: 0
        };
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('generateBtn').addEventListener('click', () => this.generateCity());
        document.getElementById('cityPrompt').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateCity();
        });
        
        document.querySelectorAll('input[name="viewMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.viewMode = e.target.value;
                
                // Show/hide camera controls
                const cameraControls = document.getElementById('cameraControls');
                if (this.viewMode === '3d') {
                    cameraControls.classList.remove('hidden');
                } else {
                    cameraControls.classList.add('hidden');
                }
                
                if (this.cityData) this.renderCity();
            });
        });

        document.getElementById('gridSize').addEventListener('input', (e) => {
            this.gridSize = parseInt(e.target.value);
            document.getElementById('gridSizeValue').textContent = `${this.gridSize}x${this.gridSize}`;
            if (this.cityData) {
                this.generateCity();
            }
        });

        // New advanced options event listeners
        document.getElementById('mapShape').addEventListener('change', (e) => {
            this.mapShape = e.target.value;
            if (this.cityData) this.generateCity();
        });

        document.getElementById('waterDensity').addEventListener('input', (e) => {
            this.waterDensity = parseInt(e.target.value) / 100;
            document.getElementById('waterDensityValue').textContent = `${e.target.value}%`;
            if (this.cityData) this.generateCity();
        });

        document.getElementById('timeOfDay').addEventListener('input', (e) => {
            this.timeOfDay = parseFloat(e.target.value);
            const hours = Math.floor(this.timeOfDay);
            const minutes = Math.floor((this.timeOfDay % 1) * 60);
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const period = hours < 6 ? ' (Night)' : hours < 12 ? ' (Morning)' : hours < 18 ? ' (Afternoon)' : ' (Evening)';
            document.getElementById('timeOfDayValue').textContent = timeStr + period;
            if (this.cityData) this.renderCity();
        });

        document.getElementById('animateSky').addEventListener('change', (e) => {
            this.animateSky = e.target.checked;
            if (this.animateSky && this.cityData) {
                this.startSkyAnimation();
            } else {
                this.stopSkyAnimation();
            }
        });

        document.getElementById('weather').addEventListener('change', (e) => {
            this.weather = e.target.value;
            if (this.cityData) this.renderCity();
        });
        
        // Camera preset buttons
        document.querySelectorAll('.camera-preset').forEach(button => {
            button.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyCameraPreset(preset);
            });
        });

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 3D view controls
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    }
    
    onMouseDown(e) {
        if (this.viewMode !== '3d') return;
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    onMouseMove(e) {
        if (this.viewMode !== '3d' || !this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.camera.rotationY += deltaX * 0.5;
        this.camera.rotationX = Math.max(0, Math.min(90, this.camera.rotationX - deltaY * 0.5));
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (this.cityData) this.renderCity();
    }
    
    onMouseUp() {
        if (this.viewMode !== '3d') return;
        this.isDragging = false;
        this.canvas.style.cursor = this.viewMode === '3d' ? 'grab' : 'default';
    }
    
    onWheel(e) {
        if (this.viewMode !== '3d' || !this.cityData) return;
        e.preventDefault();
        
        const delta = e.deltaY * CityGenerator.ZOOM_SPEED;
        this.camera.zoom = Math.max(0.3, Math.min(3.0, this.camera.zoom - delta));
        
        this.renderCity();
    }
    
    applyCameraPreset(preset) {
        switch (preset) {
            case 'default':
                this.camera.rotationX = 30;
                this.camera.rotationY = 45;
                this.camera.zoom = 1.0;
                this.camera.offsetX = 0;
                this.camera.offsetY = 0;
                break;
            case 'aerial':
                this.camera.rotationX = 60;
                this.camera.rotationY = 45;
                this.camera.zoom = 1.2;
                this.camera.offsetX = 0;
                this.camera.offsetY = -50;
                break;
            case 'ground':
                this.camera.rotationX = 15;
                this.camera.rotationY = 45;
                this.camera.zoom = 1.5;
                this.camera.offsetX = 0;
                this.camera.offsetY = 50;
                break;
            case 'side':
                this.camera.rotationX = 30;
                this.camera.rotationY = 90;
                this.camera.zoom = 1.1;
                this.camera.offsetX = 0;
                this.camera.offsetY = 0;
                break;
        }
        
        if (this.cityData) this.renderCity();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 40, 700);
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = size / this.gridSize;
        if (this.cityData) this.renderCity();
    }

    generateCity() {
        const prompt = document.getElementById('cityPrompt').value.trim();
        if (!prompt) {
            alert('Please enter a city name or location!');
            return;
        }

        // Parse prompt and generate city characteristics
        const characteristics = this.parseCityPrompt(prompt);
        this.cityData = this.createCityGrid(characteristics);

        // Update UI
        this.updateCityInfo(prompt, characteristics);
        this.renderCity();
    }

    parseCityPrompt(prompt) {
        const lower = prompt.toLowerCase();
        
        // Define city characteristics based on keywords
        const characteristics = {
            name: prompt,
            density: 0.5,
            avgHeight: 3,
            style: 'Mixed',
            parkRatio: 0.1,
            roadPattern: 'grid',
            skyscraperRatio: 0.05
        };

        // Major US Cities
        if (lower.includes('new york') || lower.includes('manhattan') || lower.includes('nyc')) {
            characteristics.density = 0.95;
            characteristics.avgHeight = 8;
            characteristics.style = 'Dense Urban';
            characteristics.parkRatio = 0.08;
            characteristics.skyscraperRatio = 0.25;
            characteristics.roadPattern = 'grid';
        } else if (lower.includes('texas') || lower.includes('houston') || lower.includes('dallas') || lower.includes('austin')) {
            characteristics.density = 0.45;
            characteristics.avgHeight = 2;
            characteristics.style = 'Sprawling';
            characteristics.parkRatio = 0.15;
            characteristics.skyscraperRatio = 0.03;
            characteristics.roadPattern = 'wide';
        } else if (lower.includes('los angeles') || lower.includes('la') || lower.includes('california')) {
            characteristics.density = 0.6;
            characteristics.avgHeight = 3;
            characteristics.style = 'Spread Out';
            characteristics.parkRatio = 0.12;
            characteristics.skyscraperRatio = 0.08;
            characteristics.roadPattern = 'grid';
        } else if (lower.includes('chicago') || lower.includes('illinois')) {
            characteristics.density = 0.75;
            characteristics.avgHeight = 6;
            characteristics.style = 'High-rise';
            characteristics.parkRatio = 0.1;
            characteristics.skyscraperRatio = 0.18;
            characteristics.roadPattern = 'grid';
        } else if (lower.includes('miami') || lower.includes('florida')) {
            characteristics.density = 0.55;
            characteristics.avgHeight = 4;
            characteristics.style = 'Coastal';
            characteristics.parkRatio = 0.15;
            characteristics.skyscraperRatio = 0.1;
            characteristics.roadPattern = 'grid';
        } 
        // International Cities
        else if (lower.includes('tokyo') || lower.includes('japan')) {
            characteristics.density = 0.98;
            characteristics.avgHeight = 7;
            characteristics.style = 'Ultra-Dense';
            characteristics.parkRatio = 0.05;
            characteristics.skyscraperRatio = 0.2;
            characteristics.roadPattern = 'complex';
        } else if (lower.includes('london') || lower.includes('uk') || lower.includes('england')) {
            characteristics.density = 0.7;
            characteristics.avgHeight = 4;
            characteristics.style = 'Historic';
            characteristics.parkRatio = 0.18;
            characteristics.skyscraperRatio = 0.06;
            characteristics.roadPattern = 'mixed';
        } else if (lower.includes('paris') || lower.includes('france')) {
            characteristics.density = 0.8;
            characteristics.avgHeight = 5;
            characteristics.style = 'European';
            characteristics.parkRatio = 0.12;
            characteristics.skyscraperRatio = 0.02;
            characteristics.roadPattern = 'radial';
        } else if (lower.includes('dubai')) {
            characteristics.density = 0.5;
            characteristics.avgHeight = 10;
            characteristics.style = 'Futuristic';
            characteristics.parkRatio = 0.08;
            characteristics.skyscraperRatio = 0.35;
            characteristics.roadPattern = 'wide';
        }
        // Generic descriptors
        else if (lower.includes('dense') || lower.includes('urban') || lower.includes('city')) {
            characteristics.density = 0.85;
            characteristics.avgHeight = 6;
            characteristics.style = 'Urban';
            characteristics.skyscraperRatio = 0.15;
        } else if (lower.includes('suburb') || lower.includes('residential')) {
            characteristics.density = 0.4;
            characteristics.avgHeight = 2;
            characteristics.style = 'Suburban';
            characteristics.parkRatio = 0.2;
            characteristics.skyscraperRatio = 0.01;
        } else if (lower.includes('downtown') || lower.includes('center')) {
            characteristics.density = 0.9;
            characteristics.avgHeight = 7;
            characteristics.style = 'Downtown';
            characteristics.skyscraperRatio = 0.22;
        }

        return characteristics;
    }

    createCityGrid(characteristics) {
        const grid = [];
        const { density, avgHeight, parkRatio, skyscraperRatio, roadPattern } = characteristics;

        // First, determine map boundaries based on shape
        const isInBounds = (x, y) => {
            const centerX = this.gridSize / 2;
            const centerY = this.gridSize / 2;
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            const maxDist = this.gridSize / 2;
            
            switch (this.mapShape) {
                case 'circle':
                    return dist < maxDist * 0.9;
                case 'coastal':
                    return x > this.gridSize * 0.2; // Cut off left side for ocean
                case 'river':
                    return true; // River goes through the map
                default:
                    return true; // Square - all cells in bounds
            }
        };

        // Generate water features first
        const waterMap = this.generateWaterFeatures();

        for (let y = 0; y < this.gridSize; y++) {
            const row = [];
            for (let x = 0; x < this.gridSize; x++) {
                // Check if cell is out of bounds for current shape
                if (!isInBounds(x, y)) {
                    row.push({ type: 'water', height: 0, waterType: 'ocean' });
                    continue;
                }

                // Check if cell is water from water generation
                if (waterMap[y][x]) {
                    row.push({ type: 'water', height: 0, waterType: waterMap[y][x] });
                    continue;
                }

                // Determine if this cell is a road
                let isRoad = false;
                if (roadPattern === 'grid') {
                    isRoad = x % 4 === 0 || y % 4 === 0;
                } else if (roadPattern === 'wide') {
                    isRoad = x % 5 === 0 || y % 5 === 0 || x % 5 === 1 || y % 5 === 1;
                } else if (roadPattern === 'complex') {
                    isRoad = x % 3 === 0 || y % 3 === 0;
                } else if (roadPattern === 'radial') {
                    const centerX = this.gridSize / 2;
                    const centerY = this.gridSize / 2;
                    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    isRoad = Math.abs(dist % 4) < 0.5 || x % 4 === 0 || y % 4 === 0;
                } else {
                    isRoad = x % 4 === 0 || y % 4 === 0;
                }

                if (isRoad) {
                    row.push({ type: 'road', height: 0 });
                } else {
                    const rand = Math.random();
                    
                    if (rand > density) {
                        // Empty or park
                        if (Math.random() < parkRatio / (1 - density)) {
                            row.push({ type: 'park', height: 0 });
                        } else {
                            row.push({ type: 'empty', height: 0 });
                        }
                    } else {
                        // Building
                        const buildingRand = Math.random();
                        let type, height;
                        
                        if (buildingRand < skyscraperRatio) {
                            type = 'skyscraper';
                            height = Math.floor(avgHeight * 1.5 + Math.random() * avgHeight);
                        } else if (buildingRand < skyscraperRatio + 0.2) {
                            type = 'commercial';
                            height = Math.floor(avgHeight * 0.8 + Math.random() * 2);
                        } else {
                            type = 'residential';
                            height = Math.floor(avgHeight * 0.5 + Math.random() * 2);
                        }
                        
                        row.push({ type, height: Math.max(1, height) });
                    }
                }
            }
            grid.push(row);
        }

        return grid;
    }

    generateWaterFeatures() {
        // Create a 2D array to track water cells
        const waterMap = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
        
        if (this.waterDensity === 0) return waterMap;

        const centerX = Math.floor(this.gridSize / 2);
        const centerY = Math.floor(this.gridSize / 2);

        switch (this.mapShape) {
            case 'circle':
            case 'square':
                // Add random lakes
                const numLakes = Math.floor(this.waterDensity * 3);
                for (let i = 0; i < numLakes; i++) {
                    const lakeX = Math.floor(Math.random() * this.gridSize);
                    const lakeY = Math.floor(Math.random() * this.gridSize);
                    const lakeSize = Math.floor(2 + Math.random() * 3);
                    
                    for (let dy = -lakeSize; dy <= lakeSize; dy++) {
                        for (let dx = -lakeSize; dx <= lakeSize; dx++) {
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < lakeSize) {
                                const y = lakeY + dy;
                                const x = lakeX + dx;
                                if (y >= 0 && y < this.gridSize && x >= 0 && x < this.gridSize) {
                                    waterMap[y][x] = 'lake';
                                }
                            }
                        }
                    }
                }
                break;

            case 'coastal':
                // Add ocean on the left side
                const oceanWidth = Math.floor(this.gridSize * 0.2);
                for (let y = 0; y < this.gridSize; y++) {
                    for (let x = 0; x < oceanWidth; x++) {
                        waterMap[y][x] = 'ocean';
                    }
                }
                break;

            case 'river':
                // Add a winding river through the map
                let riverY = centerY;
                for (let x = 0; x < this.gridSize; x++) {
                    const riverWidth = 2 + Math.floor(this.waterDensity * 3);
                    
                    // Make river wind
                    if (x % 3 === 0) {
                        riverY += Math.floor(Math.random() * 3) - 1;
                        riverY = Math.max(2, Math.min(this.gridSize - 3, riverY));
                    }
                    
                    for (let dy = -riverWidth; dy <= riverWidth; dy++) {
                        const y = riverY + dy;
                        if (y >= 0 && y < this.gridSize) {
                            waterMap[y][x] = 'river';
                        }
                    }
                }
                break;
        }

        return waterMap;
    }

    updateCityInfo(name, characteristics) {
        const infoDiv = document.getElementById('cityInfo');
        infoDiv.classList.remove('hidden');
        
        document.getElementById('cityName').textContent = name;
        document.getElementById('densityValue').textContent = Math.round(characteristics.density * 100) + '%';
        document.getElementById('styleValue').textContent = characteristics.style;
        document.getElementById('heightValue').textContent = characteristics.avgHeight + ' floors';
    }

    renderCity() {
        if (!this.cityData) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw sky first
        this.drawSky();

        if (this.viewMode === '2d') {
            this.render2D();
        } else {
            this.render3D();
        }
    }

    startSkyAnimation() {
        if (this.animationFrame) return; // Already animating
        
        const animate = () => {
            this.skyAnimationTime += 0.01;
            this.renderCity();
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    stopSkyAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    drawSky() {
        // Get sky colors based on time of day
        const skyColors = this.getSkyColors(this.timeOfDay);
        
        // Create gradient sky
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, skyColors.top);
        gradient.addColorStop(0.5, skyColors.middle);
        gradient.addColorStop(1, skyColors.bottom);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sun or moon
        this.drawCelestialBody();
        
        // Draw clouds if weather is cloudy or rainy
        if (this.weather === 'cloudy' || this.weather === 'rainy') {
            this.drawClouds();
        }
        
        // Draw rain if weather is rainy
        if (this.weather === 'rainy') {
            this.drawRain();
        }
    }

    getSkyColors(time) {
        // Normalize time to 0-24
        const t = time % 24;
        
        // Define colors for different times of day
        if (t < 5) {
            // Night (0-5)
            return {
                top: '#0a1628',
                middle: '#1a2642',
                bottom: '#2d3e5f'
            };
        } else if (t < 7) {
            // Dawn (5-7)
            const progress = (t - 5) / 2;
            return {
                top: this.interpolateColor('#0a1628', '#4a6fa5', progress),
                middle: this.interpolateColor('#1a2642', '#87CEEB', progress),
                bottom: this.interpolateColor('#2d3e5f', '#FFB347', progress)
            };
        } else if (t < 17) {
            // Day (7-17)
            return {
                top: '#4a6fa5',
                middle: '#87CEEB',
                bottom: '#b8d8f0'
            };
        } else if (t < 19) {
            // Dusk (17-19)
            const progress = (t - 17) / 2;
            return {
                top: this.interpolateColor('#4a6fa5', '#2d3e5f', progress),
                middle: this.interpolateColor('#87CEEB', '#ff6b35', progress),
                bottom: this.interpolateColor('#b8d8f0', '#ffb347', progress)
            };
        } else {
            // Evening/Night (19-24)
            const progress = (t - 19) / 5;
            return {
                top: this.interpolateColor('#2d3e5f', '#0a1628', progress),
                middle: this.interpolateColor('#ff6b35', '#1a2642', progress),
                bottom: this.interpolateColor('#ffb347', '#2d3e5f', progress)
            };
        }
    }

    interpolateColor(color1, color2, factor) {
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);
        
        const r1 = (c1 >> 16) & 0xff;
        const g1 = (c1 >> 8) & 0xff;
        const b1 = c1 & 0xff;
        
        const r2 = (c2 >> 16) & 0xff;
        const g2 = (c2 >> 8) & 0xff;
        const b2 = c2 & 0xff;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    drawCelestialBody() {
        const t = this.timeOfDay % 24;
        const isNight = t < 6 || t > 20;
        
        // Calculate position based on time
        const progress = isNight ? ((t + 6) % 24) / 12 : t / 12;
        const angle = Math.PI * progress;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height;
        const radius = this.canvas.width * 0.6;
        
        const x = centerX + Math.cos(angle - Math.PI) * radius;
        const y = centerY - Math.sin(angle - Math.PI) * radius;
        
        // Only draw if above horizon
        if (y < this.canvas.height * 0.8) {
            if (isNight) {
                // Draw moon
                const moonSize = 30;
                this.ctx.fillStyle = '#f0f0f0';
                this.ctx.beginPath();
                this.ctx.arc(x, y, moonSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add moon glow
                const moonGlow = this.ctx.createRadialGradient(x, y, moonSize, x, y, moonSize * 2);
                moonGlow.addColorStop(0, 'rgba(240, 240, 240, 0.3)');
                moonGlow.addColorStop(1, 'rgba(240, 240, 240, 0)');
                this.ctx.fillStyle = moonGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, moonSize * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add craters
                this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
                this.ctx.beginPath();
                this.ctx.arc(x - 8, y - 5, 5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(x + 6, y + 3, 3, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Draw sun
                const sunSize = 40;
                
                // Sun glow
                const sunGlow = this.ctx.createRadialGradient(x, y, sunSize * 0.5, x, y, sunSize * 2);
                sunGlow.addColorStop(0, 'rgba(255, 220, 100, 0.8)');
                sunGlow.addColorStop(0.5, 'rgba(255, 200, 50, 0.4)');
                sunGlow.addColorStop(1, 'rgba(255, 180, 0, 0)');
                this.ctx.fillStyle = sunGlow;
                this.ctx.beginPath();
                this.ctx.arc(x, y, sunSize * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Sun body
                this.ctx.fillStyle = '#FDB813';
                this.ctx.beginPath();
                this.ctx.arc(x, y, sunSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    drawClouds() {
        const numClouds = this.weather === 'rainy' ? 8 : 5;
        const animOffset = this.animateSky ? this.skyAnimationTime * 20 : 0;
        
        for (let i = 0; i < numClouds; i++) {
            const seed = i * 123.456;
            const x = ((seed * 50 + animOffset) % (this.canvas.width + 200)) - 100;
            const y = (seed * 30) % (this.canvas.height * 0.4);
            const size = 40 + (seed * 20) % 40;
            
            this.drawCloud(x, y, size);
        }
    }

    drawCloud(x, y, size) {
        const opacity = this.weather === 'rainy' ? 0.8 : 0.6;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        
        // Draw cloud as several circles
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y, size * 0.6, 0, Math.PI * 2);
        this.ctx.arc(x + size, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.5, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawRain() {
        const numDrops = 50;
        const animOffset = this.animateSky ? this.skyAnimationTime * 100 : 0;
        
        this.ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < numDrops; i++) {
            const seed = i * 234.567;
            const x = (seed * 100) % this.canvas.width;
            const y = ((seed * 150 + animOffset) % (this.canvas.height + 100)) - 50;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 2, y + 10);
            this.ctx.stroke();
        }
    }

    render2D() {
        const cellSize = this.canvas.width / this.gridSize;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.cityData[y][x];
                const posX = x * cellSize;
                const posY = y * cellSize;

                // Draw cell with deterministic color variance based on position
                const variance = cell.type !== 'road' && cell.type !== 'empty' && cell.type !== 'park' && cell.type !== 'water' ? 20 : 0;
                this.ctx.fillStyle = this.getCellColor(cell, variance, x, y);
                this.ctx.fillRect(posX, posY, cellSize - 1, cellSize - 1);

                // Add lighting and shader effects for buildings
                if (cell.type !== 'road' && cell.type !== 'empty' && cell.type !== 'park' && cell.type !== 'water') {
                    // Add directional lighting from top-left
                    const lightGradient = this.ctx.createLinearGradient(posX, posY, posX + cellSize, posY + cellSize);
                    lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
                    lightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
                    this.ctx.fillStyle = lightGradient;
                    this.ctx.fillRect(posX, posY, cellSize - 1, cellSize - 1);
                    
                    // Add height indicator with better visibility
                    const heightRatio = Math.min(cell.height / 10, 1);
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${heightRatio * 0.2})`;
                    this.ctx.fillRect(posX + 2, posY + 2, cellSize - 5, cellSize - 5);
                }
                
                // Add subtle shadow for parks
                if (cell.type === 'park') {
                    const parkGradient = this.ctx.createRadialGradient(
                        posX + cellSize / 2, posY + cellSize / 2, 0,
                        posX + cellSize / 2, posY + cellSize / 2, cellSize / 2
                    );
                    parkGradient.addColorStop(0, 'rgba(72, 187, 120, 0.8)');
                    parkGradient.addColorStop(1, 'rgba(34, 139, 69, 0.8)');
                    this.ctx.fillStyle = parkGradient;
                    this.ctx.fillRect(posX, posY, cellSize - 1, cellSize - 1);
                }
                
                // Add water effects (waves/shimmer)
                if (cell.type === 'water') {
                    const waterGradient = this.ctx.createLinearGradient(posX, posY, posX + cellSize, posY + cellSize);
                    waterGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
                    waterGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
                    waterGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
                    this.ctx.fillStyle = waterGradient;
                    this.ctx.fillRect(posX, posY, cellSize - 1, cellSize - 1);
                    
                    // Add animated ripples if animation is enabled
                    if (this.animateSky) {
                        const ripplePhase = (this.skyAnimationTime + x * 0.1 + y * 0.1) % 1;
                        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * Math.sin(ripplePhase * Math.PI * 2)})`;
                        this.ctx.fillRect(posX, posY, cellSize - 1, cellSize - 1);
                    }
                }
            }
        }

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }

    render3D() {
        const baseSize = Math.min(this.canvas.width, this.canvas.height) / this.gridSize;
        const cellSize = baseSize * this.camera.zoom;
        
        // Set cursor style
        this.canvas.style.cursor = 'grab';
        
        // Create array of all cells with their positions for depth sorting
        const cells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.cityData[y][x];
                
                // Calculate 3D position
                const isoX = (x - y) * cellSize * 0.866;
                const isoY = (x + y) * cellSize * 0.5;
                
                // Apply camera offset
                const centerX = this.canvas.width / 2 + this.camera.offsetX;
                const centerY = this.canvas.height / 3 + this.camera.offsetY;
                
                const drawX = centerX + isoX;
                const drawY = centerY + isoY;
                
                // Calculate depth for sorting (further back = drawn first)
                const depth = x + y + (cell.height || 0) * 0.1;
                
                cells.push({ x, y, cell, drawX, drawY, depth });
            }
        }
        
        // Sort by depth (back to front)
        cells.sort((a, b) => b.depth - a.depth);
        
        // Draw all cells
        for (const { x, y, cell, drawX, drawY } of cells) {
            if (cell.type === 'road') {
                this.drawIsoTile(drawX, drawY, cellSize, '#cbd5e0', 0);
            } else if (cell.type === 'park') {
                this.drawIsoTile(drawX, drawY, cellSize, '#48bb78', 0);
            } else if (cell.type === 'water') {
                const waterColor = this.getCellColor(cell, 0, x, y);
                this.drawIsoWater(drawX, drawY, cellSize, waterColor);
            } else if (cell.type === 'empty') {
                this.drawIsoTile(drawX, drawY, cellSize, '#e2e8f0', 0);
            } else {
                const variance = 20;
                const color = this.getCellColor(cell, variance, x, y);
                // Enhanced height calculation with camera tilt effect
                const heightMultiplier = CityGenerator.HEIGHT_BASE_MULTIPLIER + 
                    (this.camera.rotationX / 90) * CityGenerator.HEIGHT_TILT_MULTIPLIER;
                const height = cell.height * cellSize * heightMultiplier;
                this.drawIsoBuilding(drawX, drawY, cellSize, color, height, x, y);
            }
        }
        
        // Draw 3D controls hint
        this.draw3DControlsHint();
    }
    
    draw3DControlsHint() {
        const padding = 10;
        const text = '🖱️ Drag to rotate • Scroll to zoom';
        
        this.ctx.save();
        this.ctx.font = '14px "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 3;
        
        const textWidth = this.ctx.measureText(text).width;
        const x = this.canvas.width - textWidth - padding;
        const y = this.canvas.height - padding;
        
        this.ctx.strokeText(text, x, y);
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    drawIsoWater(x, y, size, color) {
        const w = size * 0.866;
        const h = size * 0.5;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.lineTo(x, y + h * 2);
        this.ctx.lineTo(x - w, y + h);
        this.ctx.closePath();

        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Add water shimmer effect
        const shimmerGradient = this.ctx.createLinearGradient(x - w, y, x + w, y + h * 2);
        shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        shimmerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        shimmerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        this.ctx.fillStyle = shimmerGradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    drawIsoTile(x, y, size, color, height) {
        const w = size * 0.866;
        const h = size * 0.5;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.lineTo(x, y + h * 2);
        this.ctx.lineTo(x - w, y + h);
        this.ctx.closePath();

        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    drawIsoBuilding(x, y, size, color, height, gridX, gridY) {
        const w = size * 0.866;
        const h = size * 0.5;

        // Calculate dynamic lighting based on camera angle
        const lightAngle = this.camera.rotationY * Math.PI / 180;
        const lightX = Math.cos(lightAngle);
        
        // Calculate how much each face is lit
        const topBrightness = 30;
        const rightBrightness = Math.max(-15, Math.min(15, lightX * 20));
        const leftBrightness = Math.max(-25, Math.min(5, -lightX * 20 - 10));

        // Top face with lighting
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - height);
        this.ctx.lineTo(x + w, y + h - height);
        this.ctx.lineTo(x, y + h * 2 - height);
        this.ctx.lineTo(x - w, y + h - height);
        this.ctx.closePath();
        
        // Brighten top face (receives most light)
        const topColor = this.lightenColor(color, topBrightness);
        this.ctx.fillStyle = topColor;
        this.ctx.fill();
        
        // Add subtle gradient for realism
        const topGradient = this.ctx.createLinearGradient(x - w, y + h - height, x + w, y + h - height);
        topGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        topGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        this.ctx.fillStyle = topGradient;
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Right face - lighting depends on camera angle
        this.ctx.beginPath();
        this.ctx.moveTo(x + w, y + h - height);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.lineTo(x, y + h * 2);
        this.ctx.lineTo(x, y + h * 2 - height);
        this.ctx.closePath();
        
        const rightColor = rightBrightness >= 0 ? 
            this.lightenColor(color, rightBrightness) : 
            this.darkenColor(color, -rightBrightness);
        this.ctx.fillStyle = rightColor;
        this.ctx.fill();
        
        // Add vertical gradient for depth
        const rightGradient = this.ctx.createLinearGradient(x, y + h - height, x, y + h * 2);
        rightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        rightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        this.ctx.fillStyle = rightGradient;
        this.ctx.fill();
        
        this.ctx.stroke();

        // Left face - lighting depends on camera angle
        this.ctx.beginPath();
        this.ctx.moveTo(x - w, y + h - height);
        this.ctx.lineTo(x - w, y + h);
        this.ctx.lineTo(x, y + h * 2);
        this.ctx.lineTo(x, y + h * 2 - height);
        this.ctx.closePath();
        
        const leftColor = leftBrightness >= 0 ?
            this.lightenColor(color, leftBrightness) :
            this.darkenColor(color, -leftBrightness);
        this.ctx.fillStyle = leftColor;
        this.ctx.fill();
        
        // Add shadow gradient
        const leftGradient = this.ctx.createLinearGradient(x, y + h - height, x, y + h * 2);
        leftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        this.ctx.fillStyle = leftGradient;
        this.ctx.fill();
        
        this.ctx.stroke();
        
        // Add ambient occlusion at the base with size depending on height
        const aoSize = Math.min(1, height / (size * 2));
        const aoGradient = this.ctx.createRadialGradient(x, y + h * 2, 0, x, y + h * 2, w);
        aoGradient.addColorStop(0, `rgba(0, 0, 0, ${0.3 * aoSize})`);
        aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + h * 2, w * 0.8, h * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = aoGradient;
        this.ctx.fill();
        
        // Add windows for taller buildings
        if (height > size * 0.5) {
            this.drawBuildingWindows(x, y, w, h, height);
        }
    }
    
    drawBuildingWindows(x, y, w, h, height) {
        const numFloors = Math.floor(height / CityGenerator.WINDOW_SPACING);
        
        // Determine if windows should be lit based on time of day
        const isNight = this.timeOfDay < 6 || this.timeOfDay > 18;
        
        // Draw windows on right face
        for (let floor = 1; floor < numFloors; floor++) {
            const floorY = y + h * 2 - floor * CityGenerator.WINDOW_SPACING;
            const numWindows = Math.floor(w / CityGenerator.WINDOW_SPACING);
            
            for (let win = 0; win < numWindows; win++) {
                const winX = x + (win + 0.5) * CityGenerator.WINDOW_SPACING - w / 2;
                
                // Deterministic window lighting based on position
                const seed = (x * CityGenerator.WINDOW_SEED_PRIME_X + 
                             y * CityGenerator.WINDOW_SEED_PRIME_Y + 
                             floor * CityGenerator.WINDOW_SEED_PRIME_FLOOR + 
                             win * CityGenerator.WINDOW_SEED_PRIME_WIN) % 1000;
                const rand = Math.sin(seed * 0.1) * 0.5 + 0.5;
                const windowLit = isNight ? rand > 0.3 : rand > 0.8;
                
                this.ctx.fillStyle = windowLit ? 
                    'rgba(255, 220, 100, 0.8)' : 
                    'rgba(50, 50, 80, 0.6)';
                this.ctx.fillRect(winX, floorY, CityGenerator.WINDOW_SIZE, CityGenerator.WINDOW_SIZE);
            }
        }
    }

    getCellColor(cell, variance = 0, x = 0, y = 0) {
        let baseColor;
        switch (cell.type) {
            case 'residential': 
                // Brown/warm tones for houses
                baseColor = '#8B6F47';
                break;
            case 'commercial': 
                // Blue-gray for commercial
                baseColor = '#5A7D9A';
                break;
            case 'skyscraper': 
                // Steel blue/gray for skyscrapers
                baseColor = '#4A5D6D';
                break;
            case 'park': 
                // Green for parks
                baseColor = '#48bb78';
                break;
            case 'road': 
                baseColor = '#cbd5e0';
                break;
            case 'water':
                // Different shades of blue for different water types
                if (cell.waterType === 'ocean') {
                    baseColor = '#1e40af';
                } else if (cell.waterType === 'river') {
                    baseColor = '#2563eb';
                } else {
                    baseColor = '#3b82f6';
                }
                break;
            case 'empty': 
                baseColor = '#e2e8f0';
                break;
            default: 
                baseColor = '#e2e8f0';
        }
        
        // Add deterministic color variance to make buildings look unique
        if (variance !== 0 && cell.type !== 'road' && cell.type !== 'empty' && cell.type !== 'park' && cell.type !== 'water') {
            return this.varyColor(baseColor, variance, x, y);
        }
        
        return baseColor;
    }
    
    varyColor(color, variance, x, y) {
        // Validate hex color format
        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn(`Invalid hex color: ${color}, using default`);
            return '#e2e8f0';
        }
        
        // Create deterministic pseudorandom values based on position and seed
        const hash = (this.colorSeed + x * CityGenerator.COLOR_HASH_PRIME_X + y * CityGenerator.COLOR_HASH_PRIME_Y) % 1000;
        const rand1 = (Math.sin(hash * 0.1) * 0.5 + 0.5);
        const rand2 = (Math.sin(hash * 0.2) * 0.5 + 0.5);
        const rand3 = (Math.sin(hash * 0.3) * 0.5 + 0.5);
        
        const num = parseInt(color.replace('#', ''), 16);
        const R = Math.max(0, Math.min(255, (num >> 16) + (rand1 - 0.5) * variance));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + (rand2 - 0.5) * variance));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + (rand3 - 0.5) * variance));
        return '#' + (0x1000000 + Math.floor(R) * 0x10000 + Math.floor(G) * 0x100 + Math.floor(B)).toString(16).slice(1);
    }

    lightenColor(color, percent) {
        // Validate hex color format
        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn(`Invalid hex color in lightenColor: ${color}, using default`);
            return '#e2e8f0';
        }
        
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        // Validate hex color format
        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            console.warn(`Invalid hex color in darkenColor: ${color}, using default`);
            return '#e2e8f0';
        }
        
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

// Initialize the city generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CityGenerator();
});
