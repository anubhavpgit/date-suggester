import dotenv from 'dotenv';

// Gemini API Integration for Date Ideas

// Note: In a production environment, API calls should be made from a backend service
// Use dotenv to load API key from .env file for security
dotenv.config();

const GEMINI_API = process.env.GEMINI_API_KEY;
// If API key is missing, log a helpful error message
if (!GEMINI_API) {
	console.error('GEMINI_API_KEY not found in .env file. Please add it to use the Gemini API.');
}

// Initialize Gemini API
async function initGeminiAPI() {
	// Replace with your actual API key 
	const API_KEY = GEMINI_API;
	return new GeminiAPI(API_KEY);
}

// Gemini API wrapper class
class GeminiAPI {
	constructor(apiKey) {
		this.apiKey = apiKey;
		this.baseUrl = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
	}

	// Generate date ideas based on user preferences
	async generateDateIdeas(params) {
		try {
			const prompt = this.createPrompt(params);
			const response = await this.callGeminiAPI(prompt);
			return this.parseDateIdeas(response);
		} catch (error) {
			console.error("Error in Gemini API call:", error);
			throw error;
		}
	}

	// Create a detailed prompt for Gemini API
	createPrompt(params) {
		return `
Generate 3 personalized date ideas based on the following criteria:

Date Type: ${params.dateType}
Budget: ${params.budget}
Environment: ${params.environment}
Location: ${params.location.name} (Coordinates: ${params.location.coordinates.latitude}, ${params.location.coordinates.longitude})
Search Radius: ${params.location.radius} miles
Relationship Stage: ${params.relationshipStage}

For each date idea, provide:
1. A catchy title
2. A detailed description (2-3 sentences)
3. An estimated cost
4. A reason why this would be good for a ${params.relationshipStage} relationship

Format the response as JSON with an array of date ideas, each with title, description, cost, and reasoning fields.
Make sure these are real places and activities that actually exist in the specified location.
Focus on specific locations rather than generic ideas when possible.
`;
	}

	// Call Gemini API
	async callGeminiAPI(prompt) {
		const url = `${this.baseUrl}?key=${this.apiKey}`;

		const requestBody = {
			contents: [{
				parts: [{
					text: prompt
				}]
			}],
			generationConfig: {
				temperature: 0.7,
				topK: 40,
				topP: 0.95,
				maxOutputTokens: 1024,
			}
		};

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error calling Gemini API:", error);
			throw error;
		}
	}

	// Parse the response from Gemini API into structured date ideas
	parseDateIdeas(response) {
		try {
			// Extract the text from the response
			const responseText = response.candidates[0].content.parts[0].text;

			// Try to parse the text as JSON directly
			try {
				return JSON.parse(responseText);
			} catch (jsonError) {
				// If direct parsing fails, extract JSON-like structure from the text
				const jsonRegex = /\[\s*\{[\s\S]*\}\s*\]/gm;
				const jsonMatch = responseText.match(jsonRegex);

				if (jsonMatch) {
					return JSON.parse(jsonMatch[0]);
				}

				// If all parsing fails, manually extract the ideas
				return this.manuallyExtractIdeas(responseText);
			}
		} catch (error) {
			console.error("Error parsing Gemini API response:", error);

			// Return a fallback array of date ideas
			return [
				{
					title: "Parsing Error - Fallback Idea 1",
					description: "We couldn't parse the AI response properly. Here's a generic date idea based on your preferences.",
					cost: "Varies",
					reasoning: "This is a fallback option while we fix our systems."
				},
				{
					title: "Parsing Error - Fallback Idea 2",
					description: "We couldn't parse the AI response properly. Here's another generic date idea based on your preferences.",
					cost: "Varies",
					reasoning: "This is a fallback option while we fix our systems."
				},
				{
					title: "Parsing Error - Fallback Idea 3",
					description: "We couldn't parse the AI response properly. Here's a third generic date idea based on your preferences.",
					cost: "Varies",
					reasoning: "This is a fallback option while we fix our systems."
				}
			];
		}
	}

	// Manually extract date ideas from text when JSON parsing fails
	manuallyExtractIdeas(text) {
		const ideas = [];

		// Split by numbered sections (1., 2., 3.)
		const sections = text.split(/\d+\.\s+/);

		for (let i = 1; i < sections.length && ideas.length < 3; i++) {
			const section = sections[i];

			// Extract title, description, cost, and reasoning
			const titleMatch = section.match(/title:\s*([^\n]+)/i) ||
				section.match(/^([^:]+?)(?:\n|:)/i);
			const descMatch = section.match(/description:\s*([^\n]+(?:\n[^\n]+)*?)(?:\n|$)/i) ||
				section.match(/(?:^|\n)(?!title|cost|reason)([^:]+(?:\n[^:]+)*?)(?=\n|$)/i);
			const costMatch = section.match(/cost:\s*([^\n]+)/i) ||
				section.match(/estimated cost:\s*([^\n]+)/i);
			const reasonMatch = section.match(/reasoning:\s*([^\n]+(?:\n[^\n]+)*?)(?:\n|$)/i) ||
				section.match(/reason:\s*([^\n]+(?:\n[^\n]+)*?)(?:\n|$)/i);

			if (titleMatch || descMatch) {
				ideas.push({
					title: titleMatch ? titleMatch[1].trim() : `Date Idea ${ideas.length + 1}`,
					description: descMatch ? descMatch[1].trim() : "A personalized date idea based on your preferences.",
					cost: costMatch ? costMatch[1].trim() : "Varies",
					reasoning: reasonMatch ? reasonMatch[1].trim() : "This matches your selected preferences."
				});
			}
		}

		// If we couldn't extract enough ideas, add generic ones
		while (ideas.length < 3) {
			ideas.push({
				title: `Generic Date Idea ${ideas.length + 1}`,
				description: "A personalized date idea based on your preferences.",
				cost: "Varies",
				reasoning: "This matches your selected preferences."
			});
		}

		return ideas;
	}
}

// Function to integrate with the main application
async function getDateIdeasFromGemini(params) {
	try {
		const geminiAPI = await initGeminiAPI();
		return await geminiAPI.generateDateIdeas(params);
	} catch (error) {
		console.error("Failed to get date ideas from Gemini:", error);

		// Return fallback date ideas if API call fails
		return [
			{
				title: "Romantic Dinner",
				description: `A wonderful evening at a restaurant in ${params.location.name}. Perfect for quality time together.`,
				cost: budgetToEstimatedCost(params.budget),
				reasoning: `Dining together creates intimate moments ideal for a ${params.relationshipStage} relationship.`
			},
			{
				title: "Outdoor Adventure",
				description: `Explore the natural beauty around ${params.location.name} with a hiking or biking adventure.`,
				cost: budgetToEstimatedCost(params.budget),
				reasoning: `Shared adventures build connection and create memories, perfect for your ${params.relationshipStage} stage.`
			},
			{
				title: "Cultural Experience",
				description: `Visit a museum, gallery, or cultural event within ${params.location.radius} miles of your location.`,
				cost: budgetToEstimatedCost(params.budget),
				reasoning: `Learning together deepens your bond and gives you plenty to discuss afterward.`
			}
		];
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