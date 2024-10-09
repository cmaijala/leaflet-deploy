// Function to determine marker color based on depth
function mapColor(depth) {
    switch (true) {
        case depth > 90:
            return "red";
        case depth > 70:
            return "orangered";
        case depth > 50:
            return "orange";
        case depth > 30:
            return "gold";
        case depth > 10:
            return "yellow";
        default:
            return "lightgreen";
    }
}

// Initialize the map centered on the world
const map = L.map('map').setView([20, 0], 2); // Centered globally

// Set up the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Fetch earthquake data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        const earthquakes = data.features;

        earthquakes.forEach(eq => {
            const coords = eq.geometry.coordinates;
            const magnitude = eq.properties.mag;
            const depth = coords[2];
            const [longitude, latitude] = coords;

            // Remove geographic filtering to include all earthquakes
            // Determine marker size and color using the mapColor function
            const size = magnitude * 5; // Scale size of markers
            const color = mapColor(depth); // Use the mapColor function for color

            const marker = L.circleMarker([latitude, longitude], {
                radius: size,
                fillColor: color,
                color: color,
                fillOpacity: 0.7,
                weight: 1
            }).addTo(map);

            // Add a popup with information
            marker.bindPopup(`
                <strong>Magnitude:</strong> ${magnitude}<br>
                <strong>Depth:</strong> ${depth} km<br>
                <strong>Location:</strong> ${eq.properties.place}
            `);
        });

        // Create a legend
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = `
                <strong>Depth Legend</strong><br>
                <i style="background: red;"></i> > 90 km<br>
                <i style="background: orangered;"></i> 70 - 90 km<br>
                <i style="background: orange;"></i> 50 - 70 km<br>
                <i style="background: gold;"></i> 30 - 50 km<br>
                <i style="background: yellow;"></i> 10 - 30 km<br>
                <i style="background: lightgreen;"></i> < 10 km<br>
            `;
            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching data:', error));
