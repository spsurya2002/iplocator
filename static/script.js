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
        opacity: 0.7,
        className: 'arrow-flow arrow-fade arrow-trail' // Add CSS classes for animation
    }).addTo(map);

    // Add arrowhead (if plugin is available)
    if (L.polylineDecorator) {
        const arrowHead = L.polylineDecorator(arrow, {
            patterns: [
                { offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: false, pathOptions: { color: 'red' } }) }
            ]
        }).addTo(map);
    } else {
        console.warn("L.polylineDecorator is not available. Arrows will be drawn without arrowheads.");
    }

    // Trigger fade-in effect
    setTimeout(() => {
        const arrowElement = arrow.getElement();
        if (arrowElement) {
            arrowElement.classList.add('visible');
        }
    }, 100);

    // Trigger trail effect
    const arrowElement = arrow.getElement();
    if (arrowElement) {
        arrowElement.style.strokeDasharray = '1000';
        arrowElement.style.strokeDashoffset = '1000';
        arrowElement.animate([
            { strokeDashoffset: 1000 },
            { strokeDashoffset: 0 }
        ], {
            duration: 2000,
            easing: 'linear'
        });
    }
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

    // Clear previous arrows
    map.eachLayer(layer => {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Format location string
    const sourceLocation = `${data.source.city}, ${data.source.state}, ${data.source.country}`;
    const destinationLocation = `${data.destination.city}, ${data.destination.state}, ${data.destination.country}`;

    // Print location in console
    console.log(`Source -> [${sourceLocation}]`);
    console.log(`Destination -> [${destinationLocation}]`);

    // Update or create source marker
    if (window.sourceMarker) {
        window.sourceMarker.setLatLng(source); // Smoothly move to new position
    } else {
        window.sourceMarker = L.marker(source, {
            className: 'marker-pulse'
        }).addTo(map).bindPopup(`Source: ${sourceLocation}`);
    }

    // Update or create destination marker
    if (window.destinationMarker) {
        window.destinationMarker.setLatLng(destination); // Smoothly move to new position
    } else {
        window.destinationMarker = L.marker(destination, {
            className: 'marker-pulse'
        }).addTo(map).bindPopup(`Destination: ${destinationLocation}`);
    }

    // Draw arrow between source and destination
    drawArrow(source, destination);
}

// Update the map every 2 seconds
setInterval(updateMap, 900);

// Initial map update
updateMap();