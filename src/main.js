// Import the Gemini API directly from CDN using the global variable
// The script is already included in the HTML file
// This avoids the need to import it as an ES module

// Initialize variables
import { initMapWithLocation } from './map.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
	// Remove the console log and placeholder code
	// console.log(`Map initialized at: ${lat}, ${lng}`);
	// const mapPlaceholder = document.querySelector('.map-placeholder');
	// if (mapPlaceholder) {
	//   mapPlaceholder.innerHTML = `<div>Map loaded at coordinates: ${lat}, ${lng}</div>`;
	// }

	// Instead, use the map.js function

	initMapWithLocation(lat, lng);

	userLocation = { lat, lng };
}

// Update the handleGpsClick function
async function handleGpsClick() {
	const gpsBtn = document.getElementById('use-gps-btn');

	try {
		// Add loading animation to the GPS button
		gpsBtn.classList.add('gps-loading');

		const position = await getCurrentLocation();

		// Initialize map with the current location
		initMap(position.lat, position.lng);

		// The location name will be populated by map.js reverse geocoding
		// No need to call getLocationNameFromCoords here
	} catch (error) {
		console.error('Error getting location:', error);
		alert('Could not get your location. Please enter it manually.');
	} finally {
		// Remove loading animation
		gpsBtn.classList.remove('gps-loading');
	}
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
		// Initialize and validate Gemini API as before
		const genAI = initGeminiAPI();
		if (!genAI) {
			throw new Error('Failed to initialize Gemini API');
		}

		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		// Base prompt as before
		let prompt = `Generate 5 unique and interesting date ideas near ${locationData.locationName} within ${radius} miles radius.`;

		// Add preferences to prompt as before
		if (preferences.dateType) prompt += ` Date type: ${preferences.dateType}.`;
		if (preferences.budget) prompt += ` Budget: ${preferences.budget}.`;
		if (preferences.environment) prompt += ` Environment: ${preferences.environment}.`;
		if (preferences.relationshipStage) prompt += ` Relationship stage: ${preferences.relationshipStage}.`;

		// Add specific instructions for JSON format
		prompt += `
Please return your response in ONLY the following JSON format without any additional text:
{
  "analysis": "A brief analysis of the date ideas based on location and preferences",
  "ideas": [
    {
      "title": "Descriptive title for the date idea",
      "description": "Detailed description including what makes this special",
      "location": "Specific venue name if applicable",
      "address": "Full address if available",
      "cost": "Estimated cost or cost range"
    },
    ... more ideas (4 more total)
  ]
}
Include real locations and venues when possible. Make sure the output is valid JSON.`;

		// Generate content
		const result = await model.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		// Parse JSON from the response
		const responseText = result.response.text();

		return JSON.parse(removeMarkdownCodeBlock(responseText));
	} catch (error) {
		console.error('Error generating date ideas:', error);
		throw error;
	}
}

function removeMarkdownCodeBlock(text) {
	// Remove the opening ```json (and any whitespace after it)
	let cleanedText = text.replace(/^```json\s*/m, '');

	// Remove the closing ``` (and any whitespace before it)
	cleanedText = cleanedText.replace(/\s*```$/m, '');

	return cleanedText;
}

// Add this function to handle parsing the response
function parseAIResponse(responseText) {
	try {
		// First attempt: Try direct parsing in case it's already clean JSON
		return JSON.parse(responseText);
	} catch (e) {
		// Second attempt: Look for JSON in code blocks
		const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
		if (jsonMatch && jsonMatch[1]) {
			try {
				return JSON.parse(jsonMatch[1]);
			} catch (e2) {
				console.error('Failed to parse JSON from code block', e2);
			}
		}

		// Final fallback: Create structured format from unstructured text
		console.warn('Falling back to text parsing');
		const ideas = responseText.split(/\d+\./)
			.filter(idea => idea.trim().length > 0)
			.map(idea => {
				const lines = idea.trim().split('\n');
				return {
					title: lines[0] || 'Date Idea',
					description: lines.slice(1).join('\n').trim() || 'No description available',
					location: 'N/A',
					address: 'N/A',
					cost: 'N/A'
				};
			});

		return {
			analysis: "Here are some date ideas based on your preferences:",
			ideas: ideas
		};
	}
}

// Function to display generated date ideas
function displayDateIdeas(responseData) {
	// Parse the response if it's not already parsed
	const ideasData = typeof responseData === 'string'
		? parseAIResponse(responseData)
		: responseData;

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

	// Update subheader with analysis
	const resultsSubheader = document.querySelector('.results-subheader');
	if (resultsSubheader && ideasData.analysis) {
		resultsSubheader.textContent = ideasData.analysis;
	}

	// Fill date ideas
	const dateIdeasContainer = document.getElementById('date-ideas');
	if (dateIdeasContainer && ideasData.ideas) {
		let html = '';

		ideasData.ideas.forEach((idea, i) => {
			html += `
        <div class="date-idea-card">
          <div class="date-idea-image">Date Idea</div>
          <div class="date-idea-content">
            <h3 class="date-idea-title">${i + 1}. ${escapeHtml(idea.title)}</h3>
            <p class="date-idea-description">${escapeHtml(idea.description)}</p>
            
            <div class="date-idea-details">
              ${idea.location && idea.location !== 'N/A' ?
					`<p><strong>Location:</strong> ${escapeHtml(idea.location)}</p>` : ''}
              
              ${idea.address && idea.address !== 'N/A' ?
					`<p><strong>Address:</strong> ${escapeHtml(idea.address)}</p>` : ''}
              
              ${idea.cost && idea.cost !== 'N/A' ?
					`<p><strong>Cost:</strong> ${escapeHtml(idea.cost)}</p>` : ''}
            </div>
          </div>
        </div>
      `;
		});

		dateIdeasContainer.innerHTML = html;
	}

	// Scroll to results
	resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Helper function to prevent XSS
function escapeHtml(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
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
		const response = await generateDateIdeas(locationData, radius, preferences);
		console.log('Generated response:', response);
		displayDateIdeas(response);

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