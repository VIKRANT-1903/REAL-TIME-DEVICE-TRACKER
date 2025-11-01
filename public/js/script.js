const socket = io();

// Get user's location
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });

            // ----------------------------------------------------
            //  THIS IS THE NEW LOGIC:
            //  Only set the map view *once* to our own location
            //  We use a flag to check if it's the first time.
            if (!map.hasOwnProperty('_viewSet')) {
                 map.setView([latitude, longitude], 16);
                 map._viewSet = true; // Set the flag
            }
            // ----------------------------------------------------
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Initialize the map
const map = L.map("map").setView([0, 0], 10); // Start at a zoomed-out view
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Vikrant NITK"
}).addTo(map);

// Object to store markers
const markers = {};

// Receive locations from server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    
    // Do NOT setView here anymore

    if (markers[id]) {
        // --- THIS IS THE TYPO FIX ---
        markers[id].setLatLng([latitude, longitude]); // Corrected function name
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Remove marker on disconnect
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});