# City Generator 🏙️

A web-based city generator that creates unique 2D/3D city layouts based on real-world city characteristics. Simply enter a city name or location, and watch as a procedurally generated city grid appears, influenced by the characteristics of your prompt.

## Features

- **Prompt-Based Generation**: Enter city names like "New York", "Texas", "Tokyo", etc., and get cities with characteristics matching those locations
- **2D Grid View**: Top-down view showing the city layout as a grid
- **3D Isometric View**: Pseudo-3D isometric projection showing building heights
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
5. Adjust the grid size slider to change city dimensions
6. Try different prompts to see how cities vary!

## Technical Details

- Pure JavaScript (no external dependencies)
- HTML5 Canvas for rendering
- Responsive design
- Procedural generation algorithm
- Isometric projection for 3D view

## Building Types

- **Residential** (Dark Gray): Lower buildings, residential areas
- **Commercial** (Darker Gray): Medium height commercial buildings
- **Skyscraper** (Darkest): Tall buildings in city centers
- **Park** (Green): Green spaces and parks
- **Road** (Light Gray): Streets and roads

## Examples

Try these prompts:
- "New York" - Dense Manhattan-style cityscape
- "Texas" - Sprawling suburban layout
- "Tokyo" - Ultra-dense Japanese metropolis
- "Suburban neighborhood" - Low density residential
- "Downtown" - High-rise urban core

## License

See LICENSE file for details.