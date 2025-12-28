# City Generator 🏙️

A web-based city generator that creates unique 2D/3D city layouts based on real-world city characteristics. Simply enter a city name or location, and watch as a procedurally generated city grid appears, influenced by the characteristics of your prompt.

## Features

- **Prompt-Based Generation**: Enter city names like "New York", "Texas", "Tokyo", etc., and get cities with characteristics matching those locations
- **2D Grid View**: Top-down view showing the city layout as a grid
- **Enhanced 3D Isometric View**: Interactive 3D view with advanced camera controls
  - **Interactive Camera Controls**: Drag to rotate, scroll to zoom
  - **Camera Presets**: Quick access to Default, Aerial, Ground Level, and Side views
  - **Dynamic Lighting**: Buildings are lit based on camera angle for realistic depth
  - **Building Windows**: Tall buildings feature lit windows that vary with time of day
  - **Improved Depth Perception**: Better scaling and perspective for an immersive 3D experience
- **Ultra Dynamic Sky System**: 
  - Real-time day/night cycle with time-based sky colors
  - Animated sun and moon with realistic positioning
  - Smooth transitions between dawn, day, dusk, and night
  - Cloud animations and weather effects
- **Advanced Map Shapes**:
  - Square Grid: Traditional rectangular city layout
  - Circular/Island: Cities surrounded by water in a circular pattern
  - Coastal: Oceanfront cities with water on one side
  - River Valley: Cities with a winding river running through them
- **Water Features**:
  - Dynamic water generation (rivers, lakes, oceans)
  - Adjustable water density
  - Realistic water rendering with shimmer effects
  - Animated water ripples in 2D view
- **Sky & Weather Controls**:
  - Time of Day slider (24-hour cycle)
  - Weather selection (Clear, Cloudy, Rainy)
  - Animated sky option with moving clouds and rain
  - Real-time sky color transitions
- **Customizable Grid Size**: Adjust the city size from 10x10 to 30x30
- **Dynamic Characteristics**: Cities vary by:
  - Density (how packed the buildings are)
  - Building heights (from suburban houses to skyscrapers)
  - Road patterns (grid, wide, complex, radial)
  - Park ratios
  - Architectural style

## Supported City Prompts

### US Cities
- **New York / Manhattan / NYC**: Dense urban with many skyscrapers
- **Texas / Houston / Dallas / Austin**: Sprawling layout with lower density
- **Los Angeles / LA**: Spread out with moderate density
- **Chicago**: High-rise buildings with grid pattern
- **Miami / Florida**: Coastal style with moderate density

### International Cities
- **Tokyo / Japan**: Ultra-dense with complex road patterns
- **London / UK**: Historic style with good park coverage
- **Paris / France**: European style with radial patterns
- **Dubai**: Futuristic with extreme building heights

### Generic Descriptors
- **Dense / Urban / City**: High density urban areas
- **Suburb / Residential**: Low density residential areas
- **Downtown / Center**: Very high density with skyscrapers

## How to Use

1. Open `index.html` in a web browser
2. Enter a city name or descriptor in the input field
3. Click "Generate City" or press Enter
4. Toggle between 2D and 3D views
5. **In 3D View**:
   - **Drag** with your mouse to rotate the camera around the city
   - **Scroll** your mouse wheel to zoom in and out
   - Use the **camera preset buttons** for quick angle changes:
     - **Default View**: Standard isometric perspective
     - **Aerial View**: Bird's eye view from above
     - **Ground Level**: Street-level perspective
     - **Side View**: View from the side at 90 degrees
6. Adjust the grid size slider to change city dimensions
7. **Explore Advanced Options**:
   - Select different map shapes (Square, Island, Coastal, River)
   - Adjust water amount with the slider
   - Change time of day to see different sky colors
   - Toggle sky animation on/off
   - Select weather conditions (Clear, Cloudy, Rainy)
8. Try different prompts to see how cities vary!

## Technical Details

- Pure JavaScript (no external dependencies)
- HTML5 Canvas for rendering
- Responsive design
- Procedural generation algorithm
- Interactive 3D isometric projection with camera controls
- Mouse-based camera manipulation (drag to rotate, scroll to zoom)
- Dynamic lighting system based on camera angle
- Depth sorting for proper 3D rendering

## Building & Terrain Types

- **Residential** (Brown): Lower buildings, residential areas
- **Commercial** (Blue-Gray): Medium height commercial buildings
- **Skyscraper** (Dark Blue-Gray): Tall buildings in city centers
- **Park** (Green): Green spaces and parks
- **Road** (Light Gray): Streets and roads
- **Water** (Blue): Rivers, lakes, and oceans with animated effects

## Examples

Try these combinations:
- **"New York" + Coastal + Evening** - Manhattan-style cityscape by the ocean at sunset
- **"Texas" + River Valley + Day** - Sprawling suburban layout with a winding river
- **"Tokyo" + Island + Night** - Ultra-dense Japanese metropolis on a circular island
- **"Miami" + Coastal + Noon + Rainy** - Beachfront city with rain effects
- **"Suburban neighborhood" + Square Grid + Dawn** - Low density residential at sunrise
- **"Downtown" + River Valley + Dusk** - High-rise urban core with river at sunset

## License

See LICENSE file for details.