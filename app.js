// Enhanced search functionality
function searchBusRoute() {
    const searchInput = document.getElementById('busSearch');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        searchInput.focus();
        searchInput.style.borderColor = '#e53e3e';
        setTimeout(() => {
            searchInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    // Add loading state
    const button = document.querySelector('.search-button');
    const originalText = button.textContent;
    button.textContent = 'Searching...';
    button.disabled = true;
    
    // Simulate search process
    setTimeout(() => {
        alert(`Searching for bus route: "${searchTerm}"`);
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

// Enter key functionality
document.getElementById('busSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBusRoute();
    }
});

// Voice search functionality (basic implementation)
document.querySelector('.mic-button').addEventListener('click', function() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            this.style.background = 'rgba(239, 68, 68, 0.1)';
            this.querySelector('.mic-icon').style.color = '#ef4444';
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('busSearch').value = transcript;
        };
        
        recognition.onend = function() {
            document.querySelector('.mic-button').style.background = '';
            document.querySelector('.mic-icon').style.color = '#718096';
        };
        
        recognition.start();
    } else {
        alert('Voice search is not supported in this browser');
    }
});