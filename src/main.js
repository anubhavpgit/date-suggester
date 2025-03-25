// Import the Gemini API directly from CDN using the global variable
// The script is already included in the HTML file
// This avoids the need to import it as an ES module

// Initialize variables
let map;
let userLocation = null;

// Function to initialize the Gemini API
function initGeminiAPI() {
	// Get API key from the environment variables
	const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

	// If API key is missing, log a helpful error message
	if (!GEMINI_API_KEY) {
		console.error('GEMINI_API_KEY not found in environment variables. Please add it to your .env file.');
		return null;
	}

	// Initialize the Google Generative AI client
	try {
		const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		console.log('Gemini API initialized successfully');
		return genAI;
	} catch (error) {
		console.error('Error initializing Gemini API:', error);
		return null;
	}
}

// Function to initialize the map
function initMap(lat, lng) {
	// Code for map initialization would go here
	console.log(`Map initialized at: ${lat}, ${lng}`);

	// Display the map in the container
	const mapPlaceholder = document.querySelector('.map-placeholder');
	if (mapPlaceholder) {
		mapPlaceholder.innerHTML = `<div>Map loaded at coordinates: ${lat}, ${lng}</div>`;
	}

	userLocation = { lat, lng };
}

// Function to get current location using the browser's geolocation API
async function getCurrentLocation() {
	return new Promise((resolve, reject) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;
					resolve({ lat, lng });
				},
				(error) => {
					console.error('Error getting location:', error);
					reject(error);
				}
			);
		} else {
			const error = new Error('Geolocation is not supported by this browser.');
			console.error(error);
			reject(error);
		}
	});
}

// Function to get a location name from coordinates using reverse geocoding
async function getLocationNameFromCoords(lat, lng) {
	try {
		// This would be replaced with your geocoding API call
		return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
	} catch (error) {
		console.error('Error getting location name:', error);
		return 'Unknown location';
	}
}

// Function to generate date ideas using Gemini API
async function generateDateIdeas(locationData, radius, preferences = {}) {
	try {
		// Initialize the Gemini API
		const genAI = initGeminiAPI();
		if (!genAI) {
			throw new Error('Failed to initialize Gemini API');
		}

		// Get the Gemini model
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		// Create the prompt with all relevant information
		let prompt = `Generate 5 unique and interesting date ideas near ${locationData.locationName} within ${radius} miles radius.`;

		// Add any additional preferences to the prompt
		if (preferences.dateType) {
			prompt += ` Date type: ${preferences.dateType}.`;
		}

		if (preferences.budget) {
			prompt += ` Budget: ${preferences.budget}.`;
		}

		if (preferences.environment) {
			prompt += ` Environment: ${preferences.environment}.`;
		}

		if (preferences.relationshipStage) {
			prompt += ` Relationship stage: ${preferences.relationshipStage}.`;
		}

		// Add request for real locations and specifics
		prompt += ` Please include real locations, restaurants, parks, or venues in this area with specific details about what makes each date idea special. Format each idea with a title, description, and any relevant details like address or cost range.`;

		console.log('Sending prompt to Gemini:', prompt);

		// Generate content using the Gemini API
		const result = await model.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		const response = result.response;
		return response.text();
	} catch (error) {
		console.error('Error generating date ideas:', error);
		throw error;
	}
}

// Function to display generated date ideas
function displayDateIdeas(ideas) {
	// Hide loading indicator
	const loadingContainer = document.getElementById('loading');
	if (loadingContainer) {
		loadingContainer.style.display = 'none';
	}

	// Show results container
	const resultsContainer = document.getElementById('results');
	if (resultsContainer) {
		resultsContainer.style.display = 'block';
	}

	// Fill date ideas
	const dateIdeasContainer = document.getElementById('date-ideas');
	if (dateIdeasContainer) {
		// Parse the ideas text and format it for display
		const formattedIdeas = formatDateIdeas(ideas);
		dateIdeasContainer.innerHTML = formattedIdeas;
	}

	// Scroll to results
	resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Function to format date ideas for display
function formatDateIdeas(ideasText) {
	// This is a simple implementation - you could enhance this
	// to better parse and format the AI response
	const ideas = ideasText.split(/\d+\./).filter(idea => idea.trim().length > 0);

	let formattedHtml = '';

	ideas.forEach(idea => {
		// Try to extract a title - assume the first line is the title
		const lines = idea.trim().split('\n');
		const title = lines[0].trim();
		const description = lines.slice(1).join('\n').trim();

		formattedHtml += `
      <div class="date-idea-card">
        <div class="date-idea-image">Date Idea</div>
        <div class="date-idea-content">
          <h3 class="date-idea-title">${title}</h3>
          <p class="date-idea-description">${description}</p>
        </div>
      </div>
    `;
	});

	return formattedHtml;
}

// Function to gather form data
function getFormData() {
	const locationInput = document.getElementById('location-input').value;
	const radius = document.getElementById('radius').value;
	const dateType = document.getElementById('date-type').value;
	const budget = document.getElementById('budget').value;
	const environment = document.getElementById('environment').value;
	const relationshipStage = document.getElementById('relationship-stage').value;

	// Create preferences object
	const preferences = {
		dateType,
		budget,
		environment,
		relationshipStage
	};

	return { locationInput, radius, preferences };
}

// Event handler for the Generate button
async function handleGenerateClick(event) {
	event.preventDefault();

	const generateBtn = document.getElementById('generate-btn');
	const loadingContainer = document.getElementById('loading');
	const resultsContainer = document.getElementById('results');

	// Show loading state
	if (loadingContainer) {
		loadingContainer.style.display = 'flex';
	}
	if (resultsContainer) {
		resultsContainer.style.display = 'none';
	}

	generateBtn.textContent = 'Generating...';
	generateBtn.disabled = true;

	try {
		const { locationInput, radius, preferences } = getFormData();

		let locationData;

		// If the user has set a location via the map or input
		if (userLocation) {
			locationData = {
				lat: userLocation.lat,
				lng: userLocation.lng,
				locationName: locationInput || await getLocationNameFromCoords(userLocation.lat, userLocation.lng)
			};
		} else if (locationInput) {
			// If we only have a text input, we'd need to geocode it
			locationData = {
				locationName: locationInput,
			};
		} else {
			throw new Error('Please enter a location or use GPS');
		}

		// Generate date ideas
		const ideas = await generateDateIdeas(locationData, radius, preferences);

		// Display the results
		displayDateIdeas(ideas);
	} catch (error) {
		console.error('Error:', error);
		alert(`Error: ${error.message}`);

		// Hide loading indicator on error
		if (loadingContainer) {
			loadingContainer.style.display = 'none';
		}
	} finally {
		// Reset button state
		generateBtn.textContent = 'Generate Date Ideas →';
		generateBtn.disabled = false;
	}
}

// Event handler for the GPS button
async function handleGpsClick() {
	const gpsBtn = document.getElementById('use-gps-btn');

	try {
		// Add loading animation to the GPS button
		gpsBtn.classList.add('gps-loading');

		const position = await getCurrentLocation();
		// Initialize map with the current location
		initMap(position.lat, position.lng);

		// Get and display the location name
		const locationName = await getLocationNameFromCoords(position.lat, position.lng);
		document.getElementById('location-input').value = locationName;
	} catch (error) {
		console.error('Error getting location:', error);
		alert('Could not get your location. Please enter it manually.');
	} finally {
		// Remove loading animation
		gpsBtn.classList.remove('gps-loading');
	}
}

// Mobile menu toggle functionality
function setupMobileMenu() {
	const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
	const navLinks = document.querySelector('.nav-links');

	if (mobileMenuToggle && navLinks) {
		mobileMenuToggle.addEventListener('click', () => {
			mobileMenuToggle.classList.toggle('active');
			navLinks.classList.toggle('active');
		});
	}
}

// Setup function to initialize all event listeners
function setupDateIdeasGenerator() {
	const generateBtn = document.getElementById('generate-btn');
	if (generateBtn) {
		generateBtn.addEventListener('click', handleGenerateClick);
	}

	// Set up the GPS button
	const gpsBtn = document.getElementById('use-gps-btn');
	if (gpsBtn) {
		gpsBtn.addEventListener('click', handleGpsClick);
	}

	// Set up mobile menu
	setupMobileMenu();
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', setupDateIdeasGenerator);

// Export functions that might be needed elsewhere
export {
	initMap,
	getCurrentLocation,
	generateDateIdeas
};