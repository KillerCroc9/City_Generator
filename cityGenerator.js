// City Generator Logic
class CityGenerator {
    constructor() {
        this.canvas = document.getElementById('cityCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.cellSize = 25;
        this.viewMode = '2d';
        this.cityData = null;
        
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

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
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

        for (let y = 0; y < this.gridSize; y++) {
            const row = [];
            for (let x = 0; x < this.gridSize; x++) {
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

        if (this.viewMode === '2d') {
            this.render2D();
        } else {
            this.render3D();
        }
    }

    render2D() {
        const cellSize = this.canvas.width / this.gridSize;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.cityData[y][x];
                const posX = x * cellSize;
                const posY = y * cellSize;

                // Draw cell with color variance
                const variance = cell.type !== 'road' && cell.type !== 'empty' && cell.type !== 'park' ? 20 : 0;
                this.ctx.fillStyle = this.getCellColor(cell, variance);
                this.ctx.fillRect(posX, posY, cellSize - 1, cellSize - 1);

                // Add lighting and shader effects for buildings
                if (cell.type !== 'road' && cell.type !== 'empty' && cell.type !== 'park') {
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
        const cellSize = this.canvas.width / this.gridSize;
        const isoScaleX = 0.866; // cos(30°)
        const isoScaleY = 0.5;   // sin(30°)

        // Clear with a background
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw from back to front for proper layering
        for (let y = this.gridSize - 1; y >= 0; y--) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.cityData[y][x];
                
                // Calculate isometric position
                const isoX = (x - y) * cellSize * isoScaleX;
                const isoY = (x + y) * cellSize * isoScaleY;
                
                // Center the view
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 4;
                const drawX = centerX + isoX;
                const drawY = centerY + isoY;

                if (cell.type === 'road') {
                    this.drawIsoTile(drawX, drawY, cellSize, '#cbd5e0', 0);
                } else if (cell.type === 'park') {
                    this.drawIsoTile(drawX, drawY, cellSize, '#48bb78', 0);
                } else if (cell.type === 'empty') {
                    this.drawIsoTile(drawX, drawY, cellSize, '#e2e8f0', 0);
                } else {
                    // Draw building with height and lighting
                    const variance = 20;
                    const color = this.getCellColor(cell, variance);
                    const height = cell.height * cellSize * 0.3;
                    this.drawIsoBuilding(drawX, drawY, cellSize, color, height);
                }
            }
        }
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

    drawIsoBuilding(x, y, size, color, height) {
        const w = size * 0.866;
        const h = size * 0.5;

        // Top face with lighting
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - height);
        this.ctx.lineTo(x + w, y + h - height);
        this.ctx.lineTo(x, y + h * 2 - height);
        this.ctx.lineTo(x - w, y + h - height);
        this.ctx.closePath();
        
        // Brighten top face (receives most light)
        const topColor = this.lightenColor(color, 30);
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

        // Right face - medium lighting (facing right/forward)
        this.ctx.beginPath();
        this.ctx.moveTo(x + w, y + h - height);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.lineTo(x, y + h * 2);
        this.ctx.lineTo(x, y + h * 2 - height);
        this.ctx.closePath();
        
        // Medium brightness for right face
        const rightColor = this.darkenColor(color, 5);
        this.ctx.fillStyle = rightColor;
        this.ctx.fill();
        
        // Add vertical gradient for depth
        const rightGradient = this.ctx.createLinearGradient(x, y + h - height, x, y + h * 2);
        rightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        rightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
        this.ctx.fillStyle = rightGradient;
        this.ctx.fill();
        
        this.ctx.stroke();

        // Left face - darkest (in shadow)
        this.ctx.beginPath();
        this.ctx.moveTo(x - w, y + h - height);
        this.ctx.lineTo(x - w, y + h);
        this.ctx.lineTo(x, y + h * 2);
        this.ctx.lineTo(x, y + h * 2 - height);
        this.ctx.closePath();
        
        // Darken left face (in shadow)
        const leftColor = this.darkenColor(color, 25);
        this.ctx.fillStyle = leftColor;
        this.ctx.fill();
        
        // Add shadow gradient
        const leftGradient = this.ctx.createLinearGradient(x, y + h - height, x, y + h * 2);
        leftGradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
        leftGradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        this.ctx.fillStyle = leftGradient;
        this.ctx.fill();
        
        this.ctx.stroke();
        
        // Add ambient occlusion at the base
        const aoGradient = this.ctx.createRadialGradient(x, y + h * 2, 0, x, y + h * 2, w);
        aoGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        aoGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + h * 2, w * 0.8, h * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = aoGradient;
        this.ctx.fill();
    }

    getCellColor(cell, variance = 0) {
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
            case 'empty': 
                baseColor = '#e2e8f0';
                break;
            default: 
                baseColor = '#e2e8f0';
        }
        
        // Add color variance to make buildings look unique
        if (variance !== 0 && cell.type !== 'road' && cell.type !== 'empty') {
            return this.varyColor(baseColor, variance);
        }
        
        return baseColor;
    }
    
    varyColor(color, variance) {
        const num = parseInt(color.replace('#', ''), 16);
        const R = Math.max(0, Math.min(255, (num >> 16) + (Math.random() - 0.5) * variance));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + (Math.random() - 0.5) * variance));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + (Math.random() - 0.5) * variance));
        return '#' + (0x1000000 + Math.floor(R) * 0x10000 + Math.floor(G) * 0x100 + Math.floor(B)).toString(16).slice(1);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    darkenColor(color, percent) {
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
