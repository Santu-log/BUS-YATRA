// Location fetching code for Bus Yatra
// Add this to your existing app.js file

// Function to get current location
function getCurrentLocation() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showLocationMessage('Geolocation is not supported by this browser.', 'error');
        return;
    }

    // Show loading state
    showLocationMessage('Fetching your current location...', 'loading');
    
    // Options for geolocation
    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
    };

    // Get current position
    navigator.geolocation.getCurrentPosition(
        // Success callback
        function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            // Create location object
            const locationData = {
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy,
                coords: `${latitude}, ${longitude}`
            };

            // Show success message
            showLocationMessage(`Location found! Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`, 'success');
            
            // Get address from coordinates
            getAddressFromCoords(latitude, longitude);
            
            // Auto-fill location inputs if available
            autoFillLocationInputs(locationData);
            
            return locationData;
        },
        
        // Error callback
        function(error) {
            let errorMessage = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied. Please enable location permissions.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred while fetching location.';
                    break;
            }
            
            showLocationMessage(errorMessage, 'error');
        },
        
        options
    );
}

// Function to get address from coordinates
async function getAddressFromCoords(lat, lng) {
    try {
        showLocationMessage('Getting address details...', 'loading');
        
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();
        
        if (data && data.city) {
            const address = {
                city: data.city,
                country: data.countryName,
                region: data.principalSubdivision,
                locality: data.locality,
                fullAddress: `${data.locality}, ${data.city}, ${data.principalSubdivision}`
            };
            
            showLocationMessage(`Address: ${address.fullAddress}`, 'success');
            
            // Auto-fill location inputs with address
            autoFillLocationInputsWithAddress(address);
        }
    } catch (error) {
        console.error('Error fetching address:', error);
        showLocationMessage('Could not get address details', 'warning');
    }
}

// Function to show location messages
function showLocationMessage(message, type) {
    // Remove existing location messages
    const existingMessage = document.getElementById('location-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.id = 'location-message';
    messageDiv.className = `location-message ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
            <button onclick="closeLocationMessage()" class="close-btn">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            closeLocationMessage();
        }, 5000);
    }
}

// Function to get icon for message type
function getIconForType(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'loading': return 'fa-spinner fa-spin';
        default: return 'fa-info-circle';
    }
}

// Function to close location message
function closeLocationMessage() {
    const message = document.getElementById('location-message');
    if (message) {
        message.remove();
    }
}

// Function to auto-fill location inputs
function autoFillLocationInputs(locationData) {
    const locationInputs = document.querySelectorAll('input[placeholder*="location"]');
    
    locationInputs.forEach(input => {
        if (input.value === '' || input.value === input.placeholder) {
            input.value = `Current Location (${locationData.coords})`;
            input.style.color = '#2563eb';
        }
    });
}

// Function to auto-fill with address
function autoFillLocationInputsWithAddress(address) {
    const locationInputs = document.querySelectorAll('input[placeholder*="location"]');
    
    locationInputs.forEach((input, index) => {
        if (input.value === '' || input.value.includes('Current Location')) {
            input.value = index === 0 ? address.locality : address.city;
            input.style.color = '#2563eb';
        }
    });
}

// Function to setup location functionality
function setupLocationFunctionality() {
    // Find the location link and update it
    const locationLink = document.querySelector('a[href="location.js"]');
    if (locationLink) {
        locationLink.href = '#';
        locationLink.addEventListener('click', function(e) {
            e.preventDefault();
            getCurrentLocation();
        });
    }
    
    // Add location button to each card for convenience
    addLocationButtonsToCards();
}

// Function to add location buttons to cards
function addLocationButtonsToCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const cardBody = card.querySelector('.card-body');
        if (cardBody) {
            const locationBtn = document.createElement('button');
            locationBtn.className = 'location-btn';
            locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use Current Location';
            locationBtn.onclick = function() {
                getCurrentLocationForCard(card);
            };
            
            // Insert before the first "Find Bus" button
            const findBusBtn = cardBody.querySelector('.recommend-btn');
            if (findBusBtn) {
                cardBody.insertBefore(locationBtn, findBusBtn);
            }
        }
    });
}

// Function to get location for specific card
function getCurrentLocationForCard(card) {
    if (!navigator.geolocation) {
        showLocationMessage('Geolocation is not supported by this browser.', 'error');
        return;
    }

    showLocationMessage('Fetching location for this route...', 'loading');

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Fill only this card's inputs
            const inputs = card.querySelectorAll('input[placeholder*="location"]');
            inputs.forEach((input, index) => {
                if (index === 0) { // First input (starting location)
                    input.value = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                    input.style.color = '#2563eb';
                }
            });
            
            showLocationMessage('Location set for this route!', 'success');
            
            // Get address for better display
            getAddressForCard(lat, lng, card);
        },
        function(error) {
            showLocationMessage('Could not get location. Please try again.', 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
}

// Function to get address for specific card
async function getAddressForCard(lat, lng, card) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();
        
        if (data && data.locality) {
            const input = card.querySelector('input[placeholder*="location"]');
            if (input) {
                input.value = data.locality;
                input.style.color = '#2563eb';
            }
        }
    } catch (error) {
        console.error('Error fetching address for card:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupLocationFunctionality();
});