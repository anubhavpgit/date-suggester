// Import dependencies
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const GEMINI_API = process.env.GEMINI_API_KEY;
// If API key is missing, log a helpful error message
if (!GEMINI_API) {
	console.error('GEMINI_API_KEY not found in .env file. Please add it to use the Gemini API.');
}

// Initialize variables
let map;
let userLocation = null;

// Initialize the Google Generative AI client
const genAI = new GoogleGenAI(GEMINI_API);

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
		// Get the Gemini model
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		// Create the prompt with all relevant information
		let prompt = `Generate 5 unique and interesting date ideas near ${locationData.locationName} within ${radius} miles radius.`;

		// Add any additional preferences to the prompt
		if (preferences.budget) {
			prompt += ` Budget: ${preferences.budget}.`;
		}

		if (preferences.activityType) {
			prompt += ` Activity type: ${preferences.activityType}.`;
		}

		if (preferences.timeOfDay) {
			prompt += ` Time of day: ${preferences.timeOfDay}.`;
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
	// Create a results container if it doesn't exist
	let resultsContainer = document.getElementById('results-container');
	if (!resultsContainer) {
		resultsContainer = document.createElement('div');
		resultsContainer.id = 'results-container';
		resultsContainer.className = 'results-container';

		// Insert the results container after the form
		const formElement = document.querySelector('.form-actions');
		formElement.parentNode.insertBefore(resultsContainer, formElement.nextSibling);
	}

	// Set the ideas as HTML content
	resultsContainer.innerHTML = `
    <h2>Your Date Ideas</h2>
    <div class="date-ideas-content">
      ${ideas.replace(/\n/g, '<br>')}
    </div>
  `;

	// Scroll to results
	resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Function to gather form data
function getFormData() {
	const locationInput = document.getElementById('location-input').value;
	const radius = document.getElementById('radius').value;

	// You could add more form fields for preferences here
	const preferences = {
		// Add any additional preferences from your form
	};

	return { locationInput, radius, preferences };
}

// Event handler for the Generate button
async function handleGenerateClick(event) {
	event.preventDefault();

	const generateBtn = document.getElementById('generate-btn');

	// Show loading state
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
	} finally {
		// Reset button state
		generateBtn.textContent = 'Generate Date Ideas →';
		generateBtn.disabled = false;
	}
}

// Event handler for the GPS button
async function handleGpsClick() {
	try {
		const position = await getCurrentLocation();
		// Initialize map with the current location
		initMap(position.lat, position.lng);

		// Get and display the location name
		const locationName = await getLocationNameFromCoords(position.lat, position.lng);
		document.getElementById('location-input').value = locationName;
	} catch (error) {
		console.error('Error getting location:', error);
		alert('Could not get your location. Please enter it manually.');
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
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', setupDateIdeasGenerator);

// Export functions that might be needed elsewhere
export {
	initMap,
	getCurrentLocation,
	generateDateIdeas
};