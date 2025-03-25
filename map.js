dotenv.config();

const MAP_API = process.env.GEMINI_API_KEY;
// If API key is missing, log a helpful error message
if (!MAP_API) {
	console.error('GEMINI_API_KEY not found in .env file. Please add it to use the Gemini API.');
}

document.addEventListener("DOMContentLoaded", () => {
	// DOM Elements
	const generateBtn = document.getElementById("generate-btn");
	const resultsContainer = document.getElementById("results");
	const dateIdeasGrid = document.getElementById("date-ideas");
	const loadingContainer = document.getElementById("loading");
	const locationInput = document.getElementById("location-input");
	const useGpsBtn = document.getElementById("use-gps-btn");
	const radiusSelect = document.getElementById("radius");
	const mapContainer = document.getElementById("map-container");

	// Map variables
	let map = null;
	let marker = null;
	let radiusCircle = null;
	let geocoder = null;
	let userLocation = null;
	let searchRadius = 10; // Default radius in miles

	// Animation for form appearance
	const generatorForm = document.querySelector(".generator-form");
	if (generatorForm) {
		generatorForm.style.opacity = "0";
		generatorForm.style.transform = "translateY(20px)";
		generatorForm.style.transition = "opacity 0.8s ease, transform 0.8s ease";

		setTimeout(() => {
			generatorForm.style.opacity = "1";
			generatorForm.style.transform = "translateY(0)";
		}, 200);
	}

	// Initialize Google Maps
	function initMap() {
		// Check if Google Maps API is loaded
		if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
			console.error("Google Maps API not loaded");
			return;
		}

		// Default location (San Francisco)
		const defaultLocation = { lat: 37.7749, lng: -122.4194 };

		// Initialize map
		map = new google.maps.Map(mapContainer, {
			center: defaultLocation,
			zoom: 12,
			styles: [
				{
					"featureType": "all",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#f5f5f5"
						}
					]
				},
				{
					"featureType": "all",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#616161"
						}
					]
				},
				{
					"featureType": "poi",
					"elementType": "labels.text",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "poi.business",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "road",
					"elementType": "labels.icon",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"featureType": "transit",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				}
			],
			disableDefaultUI: true,
			zoomControl: true,
			mapTypeControl: false,
			scaleControl: true,
			streetViewControl: false,
			rotateControl: false,
			fullscreenControl: false
		});

		// Initialize marker (hidden initially)
		marker = new google.maps.Marker({
			position: defaultLocation,
			map: null, // Don't show until we have a location
			animation: google.maps.Animation.DROP,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 10,
				fillColor: "#E94747",
				fillOpacity: 1,
				strokeWeight: 2,
				strokeColor: "#FFFFFF"
			}
		});

		// Initialize radius circle (hidden initially)
		radiusCircle = new google.maps.Circle({
			map: null,
			center: defaultLocation,
			radius: milesToMeters(searchRadius),
			strokeColor: "#E94747",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#E94747",
			fillOpacity: 0.1
		});

		// Initialize geocoder
		geocoder = new google.maps.Geocoder();

		// Add map click event
		map.addListener("click", (event) => {
			setLocation(event.latLng);
		});

		// Add map loaded event
		google.maps.event.addListenerOnce(map, 'idle', () => {
			mapContainer.classList.add('map-active');
		});

		// Initialize autocomplete for location input
		const autocomplete = new google.maps.places.Autocomplete(locationInput);
		autocomplete.addListener("place_changed", () => {
			const place = autocomplete.getPlace();
			if (place.geometry && place.geometry.location) {
				setLocation(place.geometry.location);
			}
		});
	}

	// Get user's current location using GPS
	function getUserLocation() {
		if (navigator.geolocation) {
			// Add loading indicator
			useGpsBtn.classList.add("gps-loading");

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					const location = new google.maps.LatLng(lat, lng);

					// Set the location on the map
					setLocation(location);

					// Look up the address
					geocoder.geocode({ location: location }, (results, status) => {
						if (status === "OK" && results[0]) {
							locationInput.value = results[0].formatted_address;
						}
					});

					// Remove loading indicator
					useGpsBtn.classList.remove("gps-loading");
				},
				(error) => {
					console.error("Error getting location", error);
					alert("Unable to get your location. Please enter your location manually.");
					useGpsBtn.classList.remove("gps-loading");
				},
				{
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0
				}
			);
		} else {
			alert("Geolocation is not supported by your browser. Please enter your location manually.");
		}
	}

	// Set location on map
	function setLocation(location) {
		userLocation = location;

		// Update marker
		marker.setPosition(location);
		marker.setMap(map);

		// Update circle
		radiusCircle.setCenter(location);
		radiusCircle.setRadius(milesToMeters(searchRadius));
		radiusCircle.setMap(map);

		// Center and zoom map
		map.setCenter(location);

		// Zoom level based on radius
		const zoomLevel = calculateZoomLevel(searchRadius);
		map.setZoom(zoomLevel);
	}

	// Convert miles to meters
	function milesToMeters(miles) {
		return miles * 1609.34; // 1 mile = 1609.34 meters
	}

	// Calculate appropriate zoom level based on radius
	function calculateZoomLevel(radiusMiles) {
		// This is a rough approximation
		const radiusMeters = milesToMeters(radiusMiles);
		let zoomLevel = 14;

		if (radiusMeters > 80000) zoomLevel = 8;
		else if (radiusMeters > 40000) zoomLevel = 9;
		else if (radiusMeters > 20000) zoomLevel = 10;
		else if (radiusMeters > 10000) zoomLevel = 11;
		else if (radiusMeters > 5000) zoomLevel = 12;
		else if (radiusMeters > 2500) zoomLevel = 13;

		return zoomLevel;
	}

	// Update radius when select changes
	radiusSelect.addEventListener("change", () => {
		searchRadius = parseInt(radiusSelect.value);

		if (userLocation && radiusCircle) {
			radiusCircle.setRadius(milesToMeters(searchRadius));

			// Adjust zoom level
			const zoomLevel = calculateZoomLevel(searchRadius);
			map.setZoom(zoomLevel);
		}
	});

	// Use GPS button event
	useGpsBtn.addEventListener("click", getUserLocation);

	// Generate button event
	generateBtn.addEventListener("click", generateDateIdeas);

	// Main function to generate date ideas
	async function generateDateIdeas() {
		// Get form values
		const dateType = document.getElementById("date-type").value;
		const budget = document.getElementById("budget").value;
		const environment = document.getElementById("environment").value;
		const relationshipStage = document.getElementById("relationship-stage").value;
		const locationName = locationInput.value;

		// Validate location
		if (!locationName || !userLocation) {
			alert("Please enter a location or use GPS to set your location.");
			return;
		}

		// Show loading indicator
		loadingContainer.style.display = "flex";
		resultsContainer.style.display = "none";

		try {
			// In a real implementation, we would send all data to the Gemini API
			// For this demo, we'll simulate a response

			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Get coordinates for API call
			const latitude = userLocation.lat();
			const longitude = userLocation.lng();

			// Parameters for the Gemini API call would include:
			const apiParams = {
				dateType,
				budget,
				environment,
				relationshipStage,
				location: {
					name: locationName,
					coordinates: {
						latitude,
						longitude
					},
					radius: searchRadius
				}
			};

			console.log("API Parameters:", apiParams);

			// Simulate API response
			const dateIdeas = await simulateGeminiApiCall(apiParams);

			// Display results
			displayDateIdeas(dateIdeas, apiParams);

			// Hide loading, show results
			loadingContainer.style.display = "none";
			resultsContainer.style.display = "block";

			// Scroll to results
			resultsContainer.scrollIntoView({ behavior: "smooth" });
		} catch (error) {
			console.error("Error generating date ideas:", error);
			loadingContainer.style.display = "none";
			alert("Sorry, there was an error generating your date ideas. Please try again.");
		}
	}

	// This function simulates a call to the Gemini API
	async function simulateGeminiApiCall(params) {
		// In a real implementation, we would call the Gemini API with a prompt like:
		// const prompt = `Generate 3 personalized date ideas for a ${params.dateType} date with a ${params.budget} budget
		// at ${params.environment} locations within ${params.location.radius} miles of ${params.location.name}
		// (coordinates: ${params.location.coordinates.latitude}, ${params.location.coordinates.longitude})
		// for a couple in a ${params.relationshipStage} relationship.
		// For each idea, provide a title, description, and estimated cost.`;

		// Simulate location-specific date ideas
		let locationBasedIdeas = [
			{
				title: `Local ${capitalizeFirstLetter(params.dateType)} Experience`,
				description: `A personalized date near ${params.location.name}. This ${params.budget} option is perfect for couples in a ${params.relationshipStage} relationship looking for an ${params.environment} experience within ${params.location.radius} miles.`,
				cost: budgetToEstimatedCost(params.budget)
			},
			{
				title: `${capitalizeFirstLetter(params.location.name)} Adventure`,
				description: `Explore the unique charm of ${params.location.name} with this ${params.dateType} date idea. Perfect for your ${params.relationshipStage} stage and ${params.budget} budget preference.`,
				cost: budgetToEstimatedCost(params.budget)
			},
			{
				title: `Hidden Gem Near You`,
				description: `Discover a special spot within ${params.location.radius} miles of your location. This ${params.environment} date is ideal for your ${params.relationshipStage} relationship and fits your ${params.budget} budget.`,
				cost: budgetToEstimatedCost(params.budget)
			}
		];

		return locationBasedIdeas;
	}

	// Function to display date ideas
	function displayDateIdeas(ideas, params) {
		// Clear previous results
		dateIdeasGrid.innerHTML = "";

		// Create tags based on selections
		const tags = [
			{ name: capitalizeFirstLetter(params.dateType), class: "date-tag" },
			{ name: budgetToText(params.budget), class: "date-tag" },
			{ name: capitalizeFirstLetter(params.environment), class: "date-tag" },
			{ name: locationToDistance(params.location.radius), class: "date-tag" },
			{ name: relationshipStageToText(params.relationshipStage), class: "date-tag" }
		];

		// Create a card for each idea
		ideas.forEach((idea) => {
			const card = document.createElement("div");
			card.className = "date-idea-card";

			// Create a placeholder image
			const imageDiv = document.createElement("div");
			imageDiv.className = "date-idea-image";
			imageDiv.textContent = "Date Idea";

			// Create content container
			const contentDiv = document.createElement("div");
			contentDiv.className = "date-idea-content";

			// Create title
			const title = document.createElement("h3");
			title.className = "date-idea-title";
			title.textContent = idea.title;

			// Create description
			const description = document.createElement("p");
			description.className = "date-idea-description";
			description.textContent = idea.description;

			// Create cost element
			const cost = document.createElement("p");
			cost.className = "date-idea-cost";
			cost.textContent = `Estimated cost: ${idea.cost}`;

			// Create tags container
			const tagsDiv = document.createElement("div");
			tagsDiv.className = "date-idea-tags";

			// Add tags
			tags.forEach((tag) => {
				const tagSpan = document.createElement("span");
				tagSpan.className = tag.class;
				tagSpan.textContent = tag.name;
				tagsDiv.appendChild(tagSpan);
			});

			// Assemble the card
			contentDiv.appendChild(title);
			contentDiv.appendChild(description);
			contentDiv.appendChild(cost);
			contentDiv.appendChild(tagsDiv);

			card.appendChild(imageDiv);
			card.appendChild(contentDiv);

			// Add card to grid
			dateIdeasGrid.appendChild(card);
		});
	}

	// Helper function to capitalize first letter
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Helper function to convert budget value to text
	function budgetToText(budget) {
		switch (budget) {
			case "free":
				return "Free";
			case "low":
				return "Budget-Friendly";
			case "medium":
				return "Mid-Range";
			case "high":
				return "Luxury";
			default:
				return "Any Budget";
		}
	}

	// Helper function to convert budget to estimated cost
	function budgetToEstimatedCost(budget) {
		switch (budget) {
			case "free":
				return "Free";
			case "low":
				return "$10-$50";
			case "medium":
				return "$50-$150";
			case "high":
				return "$150+";
			default:
				return "Varies";
		}
	}

	// Helper function to format location radius
	function locationToDistance(radius) {
		return `Within ${radius} miles`;
	}

	// Helper function to convert relationship stage to text
	function relationshipStageToText(stage) {
		switch (stage) {
			case "first-date":
				return "First Date";
			case "casual-dating":
				return "Casual Dating";
			case "serious":
				return "Serious Relationship";
			case "long-term":
				return "Long-term Relationship";
			default:
				return stage;
		}
	}

	// Load Google Maps API and initialize
	function loadGoogleMapsAPI() {
		const script = document.createElement("script");
		script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API}&libraries=places&callback=initMap`;
		script.defer = true;
		script.async = true;

		// Define global callback function
		window.initMap = initMap;

		document.head.appendChild(script);
	}

	// Load Google Maps API when the page is loaded
	loadGoogleMapsAPI();
});