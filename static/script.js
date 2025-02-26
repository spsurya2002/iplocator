// Initialize the map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to draw an arrow between two points
function drawArrow(source, destination) {
    const arrow = L.polyline([source, destination], {
        color: 'red',
        weight: 2,
        opacity: 0.7
    }).addTo(map);

    // Add arrowhead
    const arrowHead = L.polylineDecorator(arrow, {
        patterns: [
            { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { color: 'red' } }) }
        ]
    }).addTo(map);
}

// Fetch IP data from the Flask backend
async function fetchIPData() {
    const response = await fetch('/get_ip_data');
    const data = await response.json();
    return data;
}

// Update the map with new IP data
async function updateMap() {
    const data = await fetchIPData();

    const source = [data.source.lat, data.source.lon];
    const destination = [data.destination.lat, data.destination.lon];

    // Clear previous markers and arrows
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Add markers for source and destination
    L.marker(source).addTo(map).bindPopup(`Source: ${data.source.city}, ${data.source.country}`);
    L.marker(destination).addTo(map).bindPopup(`Destination: ${data.destination.city}, ${data.destination.country}`);

    // Draw arrow between source and destination
    drawArrow(source, destination);
}

// Update the map every 5 seconds
setInterval(updateMap, 5000);

// Initial map update
updateMap();