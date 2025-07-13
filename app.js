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
  