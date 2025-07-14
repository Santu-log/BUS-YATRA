const allSelects = document.querySelectorAll(".selectLocation");

  allSelects.forEach(select => {
    const parent = select.closest(".location");
    const input = parent.querySelector(".locationInput");

    input.value = select.value;

    select.addEventListener("change", function () {
      input.value = this.value;
    });
  });
 
    let allRoutes = [];

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
    
    // Validate inputs
    if (!sourceInput || !destinationInput) {
        alert("Please enter both source and destination locations");
        return;
    }
    
    // Encode the values for URL
    const encodedSource = encodeURIComponent(sourceInput);
    const encodedDestination = encodeURIComponent(destinationInput);
    
    // Redirect to map page with parameters
    window.location.href = `maps.html?source=${encodedSource}&destination=${encodedDestination}`;
}
    





// Global variable to store route data
let routeData = [];

// Function to fetch JSON data
async function fetchRouteData() {
    try {
        const response = await fetch('data.json'); // Replace with your JSON file path
        if (!response.ok) {
            throw new Error('Failed to fetch route data');
        }
        routeData = await response.json();
        console.log('Route data loaded successfully');
    } catch (error) {
        console.error('Error loading route data:', error);
        // Display error to user
        const errorElement = document.createElement('div');
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '20px';
        errorElement.textContent = 'Error loading route data. Please try again later.';
        document.getElementById('s&d').appendChild(errorElement);
    }
}

// Function to search routes
function searchRoutes() {
    const source = document.getElementById('sourceInput').value.trim().toLowerCase();
    const destination = document.getElementById('destinationInput').value.trim().toLowerCase();
    
    if (!source || !destination) {
        alert('Please enter both source and destination');
        return;
    }
    
    const matchingRoutes = routeData.filter(route => {
        // Normalize route data for comparison
        const routeStops = route.stoppages.map(stop => stop.toLowerCase());
        const origin = route.originating_point.toLowerCase();
        const terminus = route.terminating_point.toLowerCase();
        
        // Check if source exists
        const sourceIndex = routeStops.findIndex(stop => stop.includes(source));
        const hasSource = origin.includes(source) || sourceIndex !== -1;
        
        // Check if destination exists
        const destIndex = routeStops.findIndex(stop => stop.includes(destination));
        const hasDestination = terminus.includes(destination) || destIndex !== -1;
        
        // Check order if both found in stops
        if (hasSource && hasDestination) {
            if (sourceIndex !== -1 && destIndex !== -1) {
                return sourceIndex < destIndex;
            }
            return true; // If one is origin/terminus, assume valid
        }
        return false;
    });
    
    displayResults(matchingRoutes);
}

// Function to display results
function displayResults(routes) {
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'searchResults';
    resultsContainer.style.marginTop = '20px';
    resultsContainer.style.padding = '15px';
    resultsContainer.style.backgroundColor = '#f8f9fa';
    resultsContainer.style.borderRadius = '10px';
    
    if (routes.length === 0) {
        resultsContainer.innerHTML = `
            <p style="color: #dc3545; margin: 0;">
                No routes found for the given source and destination.
                <br><small>Try different spellings or nearby locations.</small>
            </p>
        `;
    } else {
        resultsContainer.innerHTML = `
            <p style="color: #28a745; font-weight: bold; margin-top: 0;">
                Found ${routes.length} matching route(s):
            </p>
            <div style="max-height: 300px; overflow-y: auto;">
                <ul style="padding-left: 20px; margin-bottom: 0;">
                    ${routes.map(route => `
                        <li style="margin-bottom: 10px; padding: 8px; background: white; border-radius: 5px;">
                            <strong style="font-size: 1.1em;">Route ${route.route_number}</strong><br>
                            <span style="font-size: 0.9em; color: #555;">
                                ${route.originating_point} → ${route.terminating_point}
                            </span>
                            <div style="margin-top: 5px; font-size: 0.85em;">
                                <strong>Stops:</strong> 
                                ${route.stoppages.join(' → ')}
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }
    
    // Remove previous results if any
    const existingResults = document.getElementById('searchResults');
    if (existingResults) {
        existingResults.remove();
    }
    
    document.getElementById('s&d').appendChild(resultsContainer);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load route data
    fetchRouteData();
    
    // Attach event listener to search button
    document.querySelector('#s&d button:first-of-type').addEventListener('click', searchRoutes);
    
    // Optional: Add event listeners for Enter key
    document.getElementById('sourceInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchRoutes();
    });
    document.getElementById('destinationInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchRoutes();
    });
});