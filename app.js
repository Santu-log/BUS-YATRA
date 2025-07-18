const allSelects = document.querySelectorAll(".selectLocation");

allSelects.forEach(select => {
    const parent = select.closest(".location");
    const input = parent.querySelector(".locationInput");

    input.value = select.value;

    select.addEventListener("change", function() {
        input.value = this.value;
    });
});

// Initialize variables
let allRoutes = [];
let routeData = [];

// DOM elements
const fetchBtn = document.getElementById('fetchBtn');
const input = document.getElementById('routeSelect');
const container = document.getElementById('routeDetails');

// Create dropdown for suggestions
const suggestionsDropdown = document.createElement('div');
suggestionsDropdown.id = 'suggestionsDropdown';
suggestionsDropdown.className = 'suggestions-dropdown';
suggestionsDropdown.style.cssText = `
    display: none;
    position: absolute;
    width: calc(100% - 40px);
    max-height: 250px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 5px;
    padding: 8px 0;
`;
input.parentNode.appendChild(suggestionsDropdown);

// Event delegation for suggestion clicks
suggestionsDropdown.addEventListener('click', (e) => {
    const suggestionItem = e.target.closest('.suggestion-item');
    if (!suggestionItem) return;

    const route = JSON.parse(suggestionItem.getAttribute('data-route'));
    input.value = route.route_number;
    suggestionsDropdown.style.display = 'none';
    displayRouteDetails(route);
});

// Load route data when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchRouteData();
    
    // Event listeners for search functionality
    fetchBtn.addEventListener('click', handleSearch);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Autocomplete functionality with debouncing
    let debounceTimer;
    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = this.value.trim();
            if (searchTerm.length > 0 && allRoutes.length > 0) {
                showSuggestions(searchTerm);
            } else {
                suggestionsDropdown.style.display = 'none';
            }
        }, 300);
    });
    
    // Close dropdown when clicking outside or pressing Escape
    document.addEventListener('click', function(e) {
        if (e.target !== input) {
            suggestionsDropdown.style.display = 'none';
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            suggestionsDropdown.style.display = 'none';
        }
    });
});

// Fetch route data from JSON
async function fetchRouteData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to fetch route data');
        routeData = await response.json();
        allRoutes = routeData;
        console.log('Route data loaded successfully');
    } catch (error) {
        console.error('Error loading route data:', error);
        const errorElement = document.createElement('div');
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '20px';
        errorElement.textContent = 'Error loading route data. Please try again later.';
        document.getElementById('usingname').appendChild(errorElement);
    }
}

// Show autocomplete suggestions
function showSuggestions(searchTerm) {
    const isRouteNumberSearch = /^[a-z0-9]+$/i.test(searchTerm);
    
    const matchingRoutes = allRoutes.filter(route => {
        if (isRouteNumberSearch) {
            const routeNumber = route.route_number.toLowerCase();
            return routeNumber.startsWith(searchTerm) || 
                   routeNumber.replace(/\s+/g, '').startsWith(searchTerm);
        } else {
            return route.originating_point.toLowerCase().includes(searchTerm) ||
                   route.terminating_point.toLowerCase().includes(searchTerm);
        }
    });

    if (matchingRoutes.length === 0) {
        suggestionsDropdown.style.display = 'none';
        return;
    }

    suggestionsDropdown.innerHTML = matchingRoutes.map(route => `
        <div class="suggestion-item" 
             data-route='${JSON.stringify(route).replace(/'/g, "\\'")}'
             style="
                 padding: 10px 15px;
                 cursor: pointer;
                 transition: all 0.2s;
                 font-size: 14px;
                 color: #333;
                 border-bottom: 1px solid #f0f0f0;
             "
             onmouseover="this.style.backgroundColor='#f8f9fa'; this.style.color='#2c4a5a'" 
             onmouseout="this.style.backgroundColor='white'; this.style.color='#333'">
            <div style="font-weight: 600; margin-bottom: 2px;">${route.route_number}</div>
            <div style="font-size: 13px; color: #666;">
                ${route.originating_point} → ${route.terminating_point}
            </div>
        </div>
    `).join('');

    // Remove border from last item
    const items = suggestionsDropdown.querySelectorAll('.suggestion-item');
    if (items.length > 0) {
        items[items.length - 1].style.borderBottom = 'none';
    }

    suggestionsDropdown.style.display = 'block';
}

// Handle search functionality
function handleSearch() {
    const searchValue = input.value.trim().toLowerCase();
    suggestionsDropdown.style.display = 'none';

    if (!searchValue) {
        container.innerHTML = `<p style="color: red;">Please enter a route number or location.</p>`;
        container.style.display = 'block';
        return;
    }

    const isRouteNumberSearch = /^[a-z0-9]+$/i.test(searchValue);
    const route = allRoutes.find(r => {
        if (isRouteNumberSearch) {
            const routeNumber = r.route_number.toLowerCase();
            return routeNumber === searchValue || 
                   routeNumber.replace(/\s+/g, '') === searchValue;
        } else {
            return r.originating_point.toLowerCase().includes(searchValue) ||
                   r.terminating_point.toLowerCase().includes(searchValue);
        }
    });

    if (route) {
        displayRouteDetails(route);
    } else {
        container.innerHTML = `<p style="color: red;">No route found for "${input.value}".</p>`;
        container.style.display = 'block';
    }
}

// Display route details
function displayRouteDetails(route) {
    container.innerHTML = `
        <h2 style="font-weight: bold; font-size: 20px; margin-bottom: 10px;">Route ${route.route_number}</h2>
        <p><strong>From:</strong> ${route.originating_point}</p>
        <p><strong>To:</strong> ${route.terminating_point}</p>
        <p><strong>Stoppages:</strong></p>
        <ul style="list-style: disc; padding-left: 20px;">${route.stoppages.map(stop => `<li>${stop}</li>`).join('')}</ul>
        
        <div style="margin-top: 15px;">
            <button onclick="showRouteOnMap('${route.route_number}', '${route.originating_point}', '${route.terminating_point}', ${JSON.stringify(route.stoppages)})" 
                    style="
                        width: 100%;
                        background: #2c4a5a;
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                    "
                    onmouseover="this.style.backgroundColor='#1e3a4a'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.backgroundColor='#2c4a5a'; this.style.transform='translateY(0)'">
                <i class="fas fa-map-marked-alt"></i>
                View Route on Map
            </button>
        </div>
    `;
    container.style.display = 'block';
}

// Source/Destination switching functionality
document.querySelector('.switch-locations').addEventListener('click', function() {
    const sourceInput = document.getElementById('sourceInput');
    const destinationInput = document.getElementById('destinationInput');
    const temp = sourceInput.value;
    sourceInput.value = destinationInput.value;
    destinationInput.value = temp;
});

// Source/Destination search functionality
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
        
        const sourceIndex = sourceInStops ? routeStops.findIndex(stop => stop.includes(source)) : -1;
        const destIndex = destInStops ? routeStops.findIndex(stop => stop.includes(destination)) : -1;
        
        return (
            (sourceIsOrigin && (destIsTerminus || destInStops)) ||
            (sourceInStops && destIsTerminus) ||
            (sourceInStops && destInStops && sourceIndex < destIndex) ||
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
                        
                        const sourceIsOrigin = origin.includes(source);
                        const sourceIsTerminus = terminus.includes(source);
                        const sourceIndex = routeStops.findIndex(stop => stop.includes(source));
                        
                        const isReverseDirection = (
                            sourceIsTerminus || 
                            (sourceIndex !== -1 && 
                             routeStops.findIndex(stop => stop.includes(destination)) < sourceIndex)
                        );
                        
                        return `
                            <li style="margin-bottom: 15px; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <strong style="font-size: 16px;">Route ${route.route_number}</strong>
                                        ${isReverseDirection ? 
                                            `<span style="font-size: 0.8em; color: #666; margin-left: 10px;">(Reverse Direction)</span>` : ''}
                                        <div style="font-size: 14px; color: #555; margin-top: 4px;">
                                            ${route.originating_point} → ${route.terminating_point}
                                        </div>
                                    </div>
                                    <a href="#" class="toggle-stops" 
                                       data-route-id="${route.route_number.replace(/\s+/g, '-')}" 
                                       style="font-size: 14px; color: #2c4a5a; text-decoration: none; padding: 6px 10px; border-radius: 4px;"
                                       onmouseover="this.style.backgroundColor='#f0f2f5'" 
                                       onmouseout="this.style.backgroundColor='transparent'"
                                       onclick="toggleStops(event, '${route.route_number.replace(/\s+/g, '-')}')">
                                        Show Stops
                                    </a>
                                </div>
                                <div id="stops-${route.route_number.replace(/\s+/g, '-')}" 
                                     style="display: none; margin-top: 10px; font-size: 14px; padding: 10px; background: #f0f2f5; border-radius: 6px;">
                                    <strong style="color: #2c4a5a;">Stops:</strong> 
                                    <div style="margin-top: 6px;">${route.stoppages.join(' → ')}</div>
                                </div>
                                <div style="margin-top: 12px;">
                                    <button onclick="showRouteOnMap('${route.route_number}', '${route.originating_point}', '${route.terminating_point}', ${JSON.stringify(route.stoppages)})" 
                                            style="
                                                width: 100%;
                                                background: #2c4a5a;
                                                color: white;
                                                border: none;
                                                padding: 10px;
                                                border-radius: 6px;
                                                font-size: 14px;
                                                font-weight: 600;
                                                cursor: pointer;
                                                transition: all 0.2s;
                                                display: flex;
                                                align-items: center;
                                                justify-content: center;
                                                gap: 8px;
                                            "
                                            onmouseover="this.style.background='#1e3a4a'; this.style.transform='translateY(-2px)'"
                                            onmouseout="this.style.background='#2c4a5a'; this.style.transform='translateY(0)'">
                                        <i class="fas fa-map-marked-alt"></i>
                                        View on Map
                                    </button>
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

function toggleStops(event, routeId) {
    event.preventDefault();
    const stopsElement = document.getElementById(`stops-${routeId}`);
    if (stopsElement.style.display === 'none' || !stopsElement.style.display) {
        stopsElement.style.display = 'block';
    } else {
        stopsElement.style.display = 'none';
    }
}

function showRouteOnMap(routeNumber, origin, destination, stops) {
    // Create a clean route object
    const routeInfo = {
        number: routeNumber,
        origin: origin,
        destination: destination,
        stops: stops.filter(stop => stop !== origin && stop !== destination)
    };
    
    // Convert to JSON and encode for URL
    const routeJson = JSON.stringify(routeInfo);
    const encodedRoute = encodeURIComponent(routeJson);
    
    // Open in a new tab with the route data
    window.open(`maps.html?route=${encodedRoute}`, '_blank');
}




const input3 = document.getElementById('loc3');
const button = document.getElementById('searchButton3');
const resultBox = document.getElementById('resultBox');

let busRoutes = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    busRoutes = data;
  })
  .catch(err => {
    resultBox.innerHTML = `<p style="color:red;">Error loading route data.</p>`;
  });

button.addEventListener('click', () => {
  const location = input3.value.trim().toLowerCase();
  resultBox.innerHTML = '';

  if (location === '') {
    resultBox.innerHTML = `
      <div style="background:#f9f9f9; padding:20px; border-radius:12px; margin-top:15px; box-shadow:0 2px 8px rgba(0,0,0,0.1); font-family:sans-serif;">
        <p style="color:red;">Please enter a location.</p>
      </div>`;
    return;
  }

  const matchedRoutes = busRoutes.filter(route =>
    route.originating_point.toLowerCase() === location ||
    route.terminating_point.toLowerCase() === location ||
    route.stoppages.some(stop => stop.toLowerCase() === location)
  );

  if (matchedRoutes.length === 0) {
    resultBox.innerHTML = `
      <div style="background:#f9f9f9; padding:20px; border-radius:12px; margin-top:15px; box-shadow:0 2px 8px rgba(0,0,0,0.1); font-family:sans-serif;">
        <p style="color:red;">No routes found for "${location}".</p>
      </div>`;
  } else {
    const capLocation = location.charAt(0).toUpperCase() + location.slice(1);
    const count = matchedRoutes.length;

    let resultHTML = `
      <div style="
        background:#f9f9f9;
        padding:20px;
        border-radius:12px;
        margin-top:15px;
        box-shadow:0 2px 8px rgba(0,0,0,0.1);
        font-family:sans-serif;
        max-height:400px;
        overflow-y:auto;
      ">
        <p style="font-weight:bold; color:green; font-size:16px;">
          Found ${count} route(s) in ${capLocation}:
        </p>`;

    matchedRoutes.forEach((route, index) => {
const stopList = `<strong>Stops:</strong><br>${route.stoppages.join(' → ')}`;

  const mapBtnId = `map-${index}`;

 const stopBoxId = `stops-${index}`;
const btnId = `btn-${index}`;

resultHTML += `
  <div style="
    margin-top:15px;
    padding:15px;
    background:#fff;
    border-radius:10px;
    box-shadow:0 1px 4px rgba(0,0,0,0.1);
    font-family:sans-serif;
  ">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong>Route ${route.route_number}</strong>
      <button id="${btnId}" style="
        padding:5px 10px;
        background:#007BFF;
        color:#fff;
        border:none;
        border-radius:5px;
        font-size:12px;
        cursor:pointer;
      ">Show Stops</button>
    </div>
    
    <p style="margin:5px 0 10px 0; font-size:14px;">
      ${route.originating_point} → ${route.terminating_point}
    </p>

    <div id="${stopBoxId}" style="
      display:none;
      background:#f1f6fa;
      border:1px solid #ccc;
      border-radius:5px;
      padding:10px;
      font-size:13px;
      line-height:1.6;
      overflow-y:auto;
    ">
      <strong>Stops:</strong><br>
      ${route.stoppages.join(' → ')}
    </div>
<button id="${mapBtnId}" style="
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  background: #274e64;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
">
  <span style="font-size: 16px;"><i class="fas fa-map-marked-alt"></i></span> View Route on Map
</button>

  </div>
`;

});


    resultHTML += `</div>`;
    resultBox.innerHTML = resultHTML;

    matchedRoutes.forEach((route, index) => {
      const btn = document.getElementById(`btn-${index}`);
      const stopBox = document.getElementById(`stops-${index}`);
      let shown = false;

      btn.addEventListener('click', () => {
        shown = !shown;
        stopBox.style.display = shown ? 'block' : 'none';
        btn.textContent = shown ? 'Hide Stops' : 'Show Stops';
      });
    });
  }
});


// suggestionsDropdown
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const allStops = new Set();
    const datalist = document.getElementById('stopSuggestions');

    data.forEach(route => {
      // Add originating point and terminating point
      allStops.add(route.originating_point);
      allStops.add(route.terminating_point);

      // Add all stoppages
      route.stoppages.forEach(stop => allStops.add(stop));
    });

    // Add all unique stops to the datalist
    allStops.forEach(stop => {
      const option = document.createElement('option');
      option.value = stop;
      datalist.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error loading suggestions:', error);
  });


//   view  on map button




// fetch current location button
 function fetchLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Open Google Maps with current location
          const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
          window.open(mapUrl, '_blank');
        }, function(error) {
          alert("Error fetching location: " + error.message);
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    }