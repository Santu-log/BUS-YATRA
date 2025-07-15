const allSelects = document.querySelectorAll(".selectLocation");

allSelects.forEach(select => {
    const parent = select.closest(".location");
    const input = parent.querySelector(".locationInput");

    input.value = select.value;

    select.addEventListener("change", function () {
        input.value = this.value;
    });
});

// Switch source and destination when clicking the switch symbol
document.querySelector('.switch-locations').addEventListener('click', function() {
    const sourceInput = document.getElementById('sourceInput');
    const destinationInput = document.getElementById('destinationInput');
    
    // Swap the values
    const temp = sourceInput.value;
    sourceInput.value = destinationInput.value;
    destinationInput.value = temp;
    
    // Optional: Trigger a search automatically after switching
    // searchRoutes();
});





let allRoutes = [];
let routeData = [];

const fetchBtn = document.getElementById('fetchBtn');
const input = document.getElementById('routeSelect');
const container = document.getElementById('routeDetails');

fetchBtn.addEventListener('click', handleSearch);
input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleSearch();
});

function handleSearch() {
    const searchValue = input.value.trim().toLowerCase();

    if (!searchValue) {
        container.innerHTML = `<p style="color: red;">Please enter a route number or location.</p>`;
        container.style.display = 'block';
        return;
    }

    if (allRoutes.length === 0) {
        container.innerHTML = `<p>Loading routes...</p>`;
        container.style.display = 'block';

        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                allRoutes = data;
                routeData = data; // Also populate routeData for the search function
                showRouteDetails(searchValue);
            })
            .catch(error => {
                console.error('Error loading JSON:', error);
                container.innerHTML = `<p style="color: red;">Failed to load route data.</p>`;
            });
    } else {
        showRouteDetails(searchValue);
    }
}

function showRouteDetails(searchValue) {
    const route = allRoutes.find(r =>
        r.route_number.toLowerCase() === searchValue ||
        r.originating_point.toLowerCase().includes(searchValue) ||
        r.terminating_point.toLowerCase().includes(searchValue)
    );

    if (route) {
        container.innerHTML = `
            <h2 style="font-weight: bold; font-size: 20px; margin-bottom: 10px;">Route ${route.route_number}</h2>
            <p><strong>From:</strong> ${route.originating_point}</p>
            <p><strong>To:</strong> ${route.terminating_point}</p>
            <p><strong>Stoppages:</strong></p>
            <ul style="list-style: disc; padding-left: 20px;">${route.stoppages.map(stop => `<li>${stop}</li>`).join('')}</ul>
        `;
        container.style.display = 'block';
    } else {
        container.innerHTML = `<p style="color: red;">No route found for "${input.value}".</p>`;
        container.style.display = 'block';
    }
}

function redirectToMapWithParams() {
    const sourceInput = document.getElementById("sourceInput").value;
    const destinationInput = document.getElementById("destinationInput").value;
    
    if (!sourceInput || !destinationInput) {
        alert("Please enter both source and destination locations");
        return;
    }
    
    const encodedSource = encodeURIComponent(sourceInput);
    const encodedDestination = encodeURIComponent(destinationInput);
    
    window.location.href = `maps.html?source=${encodedSource}&destination=${encodedDestination}`;
}

async function fetchRouteData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to fetch route data');
        }
        routeData = await response.json();
        allRoutes = routeData; // Keep both variables in sync
        console.log('Route data loaded successfully');
    } catch (error) {
        console.error('Error loading route data:', error);
        const errorElement = document.createElement('div');
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '20px';
        errorElement.textContent = 'Error loading route data. Please try again later.';
        document.getElementById('s&d').appendChild(errorElement);
    }
}

function searchRoutes() {
    const source = document.getElementById('sourceInput').value.trim().toLowerCase();
    const destination = document.getElementById('destinationInput').value.trim().toLowerCase();
    
    if (!source || !destination) {
        alert('Please enter both source and destination');
        return;
    }
    
    const matchingRoutes = routeData.filter(route => {
        const routeStops = route.stoppages.map(stop => stop.toLowerCase());
        const origin = route.originating_point.toLowerCase();
        const terminus = route.terminating_point.toLowerCase();
        
        // Check if both locations exist in the route
        const sourceIsOrigin = origin.includes(source);
        const sourceIsTerminus = terminus.includes(source);
        const sourceInStops = routeStops.some(stop => stop.includes(source));
        
        const destIsOrigin = origin.includes(destination);
        const destIsTerminus = terminus.includes(destination);
        const destInStops = routeStops.some(stop => stop.includes(destination));
        
        if (!(sourceIsOrigin || sourceIsTerminus || sourceInStops) || 
            !(destIsOrigin || destIsTerminus || destInStops)) {
            return false;
        }
        
        // Get precise indices if they're stops
        const sourceIndex = sourceInStops ? routeStops.findIndex(stop => stop.includes(source)) : -1;
        const destIndex = destInStops ? routeStops.findIndex(stop => stop.includes(destination)) : -1;
        
        // Check all possible valid combinations
        return (
            // Normal direction cases
            (sourceIsOrigin && (destIsTerminus || destInStops)) ||
            (sourceInStops && destIsTerminus) ||
            (sourceInStops && destInStops && sourceIndex < destIndex) ||
            
            // Reverse direction cases
            (sourceIsTerminus && (destIsOrigin || destInStops)) ||
            (sourceInStops && destIsOrigin) ||
            (sourceInStops && destInStops && sourceIndex > destIndex)
        );
    });
    
    displayResults(matchingRoutes, source, destination);
}

function displayResults(routes, source, destination) {
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'searchResults';
    resultsContainer.style.marginTop = '20px';
    resultsContainer.style.padding = '15px';
    resultsContainer.style.backgroundColor = '#f8f9fa';
    resultsContainer.style.borderRadius = '10px';
    
    if (routes.length === 0) {
        resultsContainer.innerHTML = `
            <p style="color: #dc3545; margin: 0;">
                No routes found between ${source} and ${destination}.
                <br><small>Try different spellings or nearby locations.</small>
            </p>
        `;
    } else {
        resultsContainer.innerHTML = `
            <p style="color: #28a745; font-weight: bold; margin-top: 0;">
                Found ${routes.length} route(s) between ${source} and ${destination}:
            </p>
            <div style="max-height: 300px; overflow-y: auto;">
                <ul style="padding-left: 20px; margin-bottom: 0;">
                    ${routes.map(route => {
                        const routeStops = route.stoppages.map(stop => stop.toLowerCase());
                        const origin = route.originating_point.toLowerCase();
                        const terminus = route.terminating_point.toLowerCase();
                        
                        // Determine direction
                        const sourceIsOrigin = origin.includes(source);
                        const sourceIsTerminus = terminus.includes(source);
                        const sourceIndex = routeStops.findIndex(stop => stop.includes(source));
                        
                        const isReverseDirection = (
                            sourceIsTerminus || 
                            (sourceIndex !== -1 && 
                             routeStops.findIndex(stop => stop.includes(destination)) < sourceIndex)
                        );
                        
                        return `
                            <li style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 5px;">
                                <strong style="font-size: 1.1em;">Route ${route.route_number}</strong>
                                ${isReverseDirection ? 
                                    `<span style="font-size: 0.8em; color: #666; margin-left: 10px;">(Reverse Direction)</span>` : ''}
                                <br>
                                <span style="font-size: 0.9em; color: #555;">
                                    ${route.originating_point} → ${route.terminating_point}
                                </span>
                                <div style="margin-top: 5px; font-size: 0.85em;">
                                    <strong>Stops:</strong> 
                                    ${route.stoppages.join(' → ')}
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    const existingResults = document.getElementById('searchResults');
    if (existingResults) {
        existingResults.remove();
    }
    
    document.getElementById('s&d').appendChild(resultsContainer);
}

document.addEventListener('DOMContentLoaded', function() {
    fetchRouteData();
    
    document.querySelector('#s&d button:first-of-type').addEventListener('click', searchRoutes);
    
    document.getElementById('sourceInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchRoutes();
    });
    document.getElementById('destinationInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchRoutes();
    });
});