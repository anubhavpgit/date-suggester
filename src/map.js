// Map related functionality for YourMove.ai
let map;
let marker;
let radiusCircle;
let autocomplete;
let placesService;
let geocoder;

// Initialize the Google Maps
function initializeMap() {
	// Get the API key from environment variables
	const MAP_API_KEY = process.env.MAP_API;

	// Default center location (will be overridden when user sets location)
	const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // San Francisco

	// Create map instance
	map = new google.maps.Map(document.getElementById('map-container'), {
		center: defaultLocation,
		zoom: 12,
		mapTypeControl: false,
		streetViewControl: false,
		fullscreenControl: false,
		zoomControl: true,
		styles: [
			{
				featureType: 'poi',
				elementType: 'labels',
				stylers: [{ visibility: 'off' }]
			}
		]
	});

	// Initialize geocoder
	geocoder = new google.maps.Geocoder();

	// Create marker for selected location
	marker = new google.maps.Marker({
		position: defaultLocation,
		map: null, // Don't show initially
		animation: google.maps.Animation.DROP,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 10,
			fillColor: '#E94747',
			fillOpacity: 1,
			strokeColor: '#FFFFFF',
			strokeWeight: 2
		}
	});

	// Initialize Places Autocomplete
	const locationInput = document.getElementById('location-input');
	autocomplete = new google.maps.places.Autocomplete(locationInput, {
		types: ['(cities)']
	});

	// Listen for place selection
	autocomplete.addListener('place_changed', function () {
		const place = autocomplete.getPlace();

		if (!place.geometry) {
			// User entered a name that was not suggested and pressed Enter
			return;
		}

		// Set map to new location
		map.setCenter(place.geometry.location);

		// Update marker
		setMarkerPosition(place.geometry.location);

		// Update global userLocation variable in main.js
		if (typeof window.userLocation !== 'undefined') {
			window.userLocation = {
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng()
			};
		}

		// Update radius circle
		updateRadiusCircle();
	});

	// Initialize places service for additional location details
	placesService = new google.maps.places.PlacesService(map);

	// Remove the placeholder once map is loaded
	const mapPlaceholder = document.querySelector('.map-placeholder');
	if (mapPlaceholder) {
		mapPlaceholder.style.display = 'none';
	}
}

// Set marker position and make it visible
function setMarkerPosition(latLng) {
	marker.setPosition(latLng);
	marker.setMap(map);

	// Center map on marker
	map.setCenter(latLng);

	// Show radius circle
	updateRadiusCircle();
}

// Update the radius circle based on current marker position and radius selection
function updateRadiusCircle() {
	// Remove existing circle if any
	if (radiusCircle) {
		radiusCircle.setMap(null);
	}

	// Get the radius value from the form
	const radiusSelect = document.getElementById('radius');
	const radiusMiles = parseInt(radiusSelect.value, 10);

	// Convert miles to meters (Google Maps uses meters)
	const radiusMeters = radiusMiles * 1609.34;

	// Create new circle
	radiusCircle = new google.maps.Circle({
		map: map,
		center: marker.getPosition(),
		radius: radiusMeters,
		fillColor: '#E94747',
		fillOpacity: 0.15,
		strokeColor: '#E94747',
		strokeOpacity: 0.5,
		strokeWeight: 1,
		clickable: false
	});

	// Fit map to circle bounds
	map.fitBounds(radiusCircle.getBounds());
}

// Function to handle location search by address/place name
function searchLocation(address) {
	geocoder.geocode({ 'address': address }, function (results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				const location = results[0].geometry.location;

				// Set map center
				map.setCenter(location);

				// Update marker
				setMarkerPosition(location);

				// Update form input
				document.getElementById('location-input').value = results[0].formatted_address;

				// Update global userLocation variable in main.js
				if (typeof window.userLocation !== 'undefined') {
					window.userLocation = {
						lat: location.lat(),
						lng: location.lng()
					};
				}
			}
		} else {
			console.error('Geocode was not successful for the following reason: ' + status);
		}
	});
}

// Function to set location using coordinates (used when GPS button is clicked)
function setLocationByCoordinates(lat, lng) {
	const latLng = new google.maps.LatLng(lat, lng);

	// Update marker
	setMarkerPosition(latLng);

	// Reverse geocode to get address
	geocoder.geocode({ 'location': latLng }, function (results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[0]) {
				document.getElementById('location-input').value = results[0].formatted_address;
			}
		}
	});

	// Update global userLocation variable in main.js
	if (typeof window.userLocation !== 'undefined') {
		window.userLocation = { lat, lng };
	}
}

// Event listener for radius selection change
function setupRadiusChangeListener() {
	const radiusSelect = document.getElementById('radius');
	if (radiusSelect) {
		radiusSelect.addEventListener('change', updateRadiusCircle);
	}
}

// Function to expose to main.js for GPS button
function initMapWithLocation(lat, lng) {
	// If map is not initialized yet, wait for it
	if (!map) {
		setTimeout(() => initMapWithLocation(lat, lng), 100);
		return;
	}

	setLocationByCoordinates(lat, lng);
}

// Load Google Maps API script dynamically
function loadGoogleMapsScript() {
	const MAP_API_KEY = process.env.MAP_API;

	if (!MAP_API_KEY) {
		console.error('Google Maps API key not found. Please check .env file.');
		return;
	}

	const script = document.createElement('script');
	script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&libraries=places&callback=mapLoaded`;
	script.async = true;
	script.defer = true;
	document.body.appendChild(script);
}

// Callback when Google Maps API is loaded
window.mapLoaded = function () {
	initializeMap();
	setupRadiusChangeListener();
	console.log('Google Maps loaded successfully');
};

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	loadGoogleMapsScript();
});

// Export functions to be used in main.js
export {
	initMapWithLocation,
	setLocationByCoordinates,
	searchLocation
};