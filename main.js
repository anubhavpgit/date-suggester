document.addEventListener("DOMContentLoaded", () => {
	// Animation for hero content
	const heroContent = document.querySelector(".hero-content")
	if (heroContent) {
		heroContent.style.opacity = "0"
		heroContent.style.transform = "translateY(20px)"
		heroContent.style.transition = "opacity 0.8s ease, transform 0.8s ease"

		setTimeout(() => {
			heroContent.style.opacity = "1"
			heroContent.style.transform = "translateY(0)"
		}, 200)
	}

	// Date idea generator functionality
	const generateBtn = document.getElementById("generate-btn")
	const resultsContainer = document.getElementById("results")
	const dateIdeasGrid = document.getElementById("date-ideas")

	// Sample date ideas database
	const dateIdeas = {
		romantic: {
			free: {
				indoor: {
					morning: [
						"Breakfast in bed with homemade treats",
						"Indoor picnic with blanket fort",
						"Coffee tasting with different brewing methods",
					],
					afternoon: ["DIY spa day at home", "Paint portraits of each other", "Cook a new recipe together"],
					evening: [
						"Stargazing from your window",
						"Candlelit dinner at home",
						"Dance night with playlist of your favorite songs",
					],
					night: ["Movie marathon with theme", "Write love letters to each other", "Create a bucket list together"],
				},
				outdoor: {
					morning: ["Sunrise hike", "Morning yoga in the park", "Farmers market exploration"],
					afternoon: ["Botanical garden visit", "Photography walk", "Find a scenic spot for reading together"],
					evening: ["Sunset picnic", "Stargazing in an open field", "Beach walk at dusk"],
					night: ["Stargazing away from city lights", "Full moon hike", "Night photography session"],
				},
			},
			low: {
				indoor: {
					morning: ["Breakfast at a cozy café", "Visit a small local museum", "Attend a morning workshop together"],
					afternoon: ["Wine tasting at a local shop", "Visit an art gallery", "Take a dance class together"],
					evening: ["Board game café visit", "Cooking class", "Paint and sip session"],
					night: ["Dessert and coffee at a late-night café", "Live music at a small venue", "Comedy show"],
				},
				outdoor: {
					morning: ["Hot air balloon ride (partial view)", "Rent bikes for a morning ride", "Visit a local farm"],
					afternoon: [
						"Botanical garden with special exhibit",
						"Rowboat rental at a local lake",
						"Visit a sculpture park",
					],
					evening: ["Outdoor movie screening", "Sunset cruise (budget version)", "Rooftop bar with a view"],
					night: ["Ghost tour of your city", "Drive-in movie", "Night market visit"],
				},
			},
			medium: {
				indoor: {
					morning: ["Breakfast at an upscale restaurant", "Couples massage", "Shopping trip for each other"],
					afternoon: ["Wine and chocolate pairing experience", "Pottery class together", "Visit a specialty museum"],
					evening: ["Dinner at a romantic restaurant", "Cooking class with a chef", "Theater show"],
					night: ["Jazz club with dinner", "Cocktail making class", "Late-night dessert tasting menu"],
				},
				outdoor: {
					morning: ["Hot air balloon ride", "Horseback riding", "Guided nature tour"],
					afternoon: ["Wine tasting at a vineyard", "Boat rental on a lake", "Zip-lining adventure"],
					evening: ["Sunset dinner cruise", "Rooftop restaurant with a view", "Outdoor concert"],
					night: ["Nighttime kayak tour with lights", "Stargazing tour with an astronomer", "Moonlight sail"],
				},
			},
			high: {
				indoor: {
					morning: ["Helicopter tour", "Luxury spa day", "Private chef breakfast experience"],
					afternoon: ["Shopping spree with personal stylist", "Art collecting at galleries", "Private museum tour"],
					evening: ["Fine dining tasting menu", "Opera or symphony", "Exclusive chef's table experience"],
					night: ["Luxury hotel staycation", "VIP access to a show or club", "Private after-hours museum tour"],
				},
				outdoor: {
					morning: ["Hot air balloon ride with champagne breakfast", "Private yacht breakfast", "Seaplane tour"],
					afternoon: ["Private vineyard tour with the winemaker", "Chartered boat with lunch", "Helicopter tour"],
					evening: ["Private sunset yacht cruise", "Rooftop proposal setup", "Private garden dinner"],
					night: [
						"Private stargazing with astronomer",
						"Luxury glamping experience",
						"Midnight picnic with private chef",
					],
				},
			},
		},
		casual: {
			free: {
				indoor: {
					morning: ["Make breakfast together", "Coffee and crosswords", "Home workout session"],
					afternoon: ["Board game marathon", "Bake cookies together", "DIY craft project"],
					evening: ["Movie night with homemade snacks", "Cook dinner together", "Game night with friends"],
					night: ["Late night baking", "Video game tournament", "Build a blanket fort"],
				},
				outdoor: {
					morning: ["Morning walk in the park", "Outdoor workout", "Explore a new neighborhood"],
					afternoon: ["Picnic in the park", "Frisbee or catch", "Community garden visit"],
					evening: ["Sunset walk", "Public basketball or tennis courts", "Outdoor community event"],
					night: ["Stargazing", "Night walk", "Outdoor movie in your backyard"],
				},
			},
			low: {
				indoor: {
					morning: ["Brunch at a local diner", "Visit a bookstore and pick books for each other", "Arcade games"],
					afternoon: ["Coffee shop hop", "Visit a pet shelter", "Thrift store challenge"],
					evening: ["Casual dinner at a new restaurant", "Bowling night", "Trivia night at a local bar"],
					night: ["Dessert and coffee", "Late-night diner visit", "Karaoke night"],
				},
				outdoor: {
					morning: ["Farmers market and breakfast picnic", "Flea market exploration", "Rent bikes for a few hours"],
					afternoon: ["Food truck lunch date", "Mini-golf", "Visit a local brewery"],
					evening: ["Outdoor concert in the park", "Street food dinner", "Sunset at a scenic spot"],
					night: ["Bonfire with s'mores", "Outdoor movie screening", "Night food market"],
				},
			},
			medium: {
				indoor: {
					morning: ["Breakfast and shopping", "Indoor rock climbing", "Museum visit"],
					afternoon: ["Arcade and lunch", "Bowling and drinks", "Escape room challenge"],
					evening: ["Dinner and movie", "Axe throwing", "Comedy show"],
					night: ["Bar hopping", "Late night dessert spot", "Arcade bar"],
				},
				outdoor: {
					morning: ["Kayak or canoe rental", "Bike tour", "Hiking with picnic"],
					afternoon: ["Amusement park", "Zoo or aquarium visit", "Boat rental"],
					evening: ["Baseball game", "Outdoor festival", "Sunset kayaking"],
					night: ["Outdoor concert", "Night tour of the city", "Campfire outside the city"],
				},
			},
			high: {
				indoor: {
					morning: ["Helicopter tour", "Shopping spree", "Spa day"],
					afternoon: ["Indoor skydiving", "VIP sports experience", "Private cooking class"],
					evening: ["Concert with VIP tickets", "High-end restaurant", "Private tasting event"],
					night: ["VIP club experience", "Casino night", "Private karaoke room with service"],
				},
				outdoor: {
					morning: ["Hot air balloon ride", "Skydiving", "Paragliding lesson"],
					afternoon: ["Luxury boat rental", "ATV adventure", "Private tour of attractions"],
					evening: ['Sports game with premium seats  "Private tour of attractions'],
					evening: ["Sports game with premium seats", "Sunset helicopter tour", "Beachfront dinner"],
					night: ["Yacht party", "Private outdoor cinema", "Luxury camping experience"],
				},
			},
		},
		adventure: {
			free: {
				indoor: {
					morning: [
						"Indoor obstacle course at home",
						"Scavenger hunt around the house",
						"Learn a new skill together online",
					],
					afternoon: [
						"DIY escape room at home",
						"Indoor rock climbing (free first visit)",
						"Virtual reality experience (free trial)",
					],
					evening: ["Mystery dinner at home", "Learn dance routines from videos", "Build an indoor fort challenge"],
					night: ["Glow-in-the-dark hide and seek", "Night vision games", "Mystery solving game"],
				},
				outdoor: {
					morning: ["Sunrise hike", "Urban exploration", "Geocaching adventure"],
					afternoon: ["Hiking trail exploration", "Wild food foraging", "Abandoned places photography"],
					evening: ["Sunset rock climbing", "Night hike", "Stargazing expedition"],
					night: ["Night hiking", "Meteor shower watching", "Full moon adventure"],
				},
			},
			low: {
				indoor: {
					morning: [
						"Trampoline park (morning discount)",
						"Indoor rock climbing (beginner)",
						"Escape room (weekday special)",
					],
					afternoon: ["Laser tag", "Archery lesson (intro)", "Indoor go-karts (short session)"],
					evening: ["Axe throwing", "VR arcade", "Indoor skydiving (intro)"],
					night: ["Late night arcade challenge", "Glow-in-the-dark mini golf", "Escape room night session"],
				},
				outdoor: {
					morning: ["Kayaking (short rental)", "Beginner surfing lesson", "Stand-up paddleboarding"],
					afternoon: ["Zip-lining (basic course)", "Rock climbing with guide", "Mountain biking (easy trail)"],
					evening: ["Sunset kayaking", "Evening zip-line adventure", "Outdoor escape game"],
					night: ["Night kayaking tour", "Evening wildlife spotting", "Night hiking with guide"],
				},
			},
			medium: {
				indoor: {
					morning: ["Indoor skydiving session", "Advanced escape room", "Parkour class"],
					afternoon: ["Ninja warrior course", "Rock climbing (intermediate)", "Trapeze class"],
					evening: ["VR adventure park", "Indoor skydiving package", "Immersive theater experience"],
					night: ["Late night adventure park", "Overnight museum experience", "Immersive game experience"],
				},
				outdoor: {
					morning: ["White water rafting", "Paragliding", "Scuba diving lesson"],
					afternoon: ["Zip-lining course", "ATV adventure", "Canyoning experience"],
					evening: ["Sunset rock climbing with guide", "Evening kayak tour", "Parasailing adventure"],
					night: ["Night zip-lining", "Guided night hike with equipment", "Evening boat adventure"],
				},
			},
			high: {
				indoor: {
					morning: ["Helicopter simulator experience", "Private parkour lesson", "Luxury VR gaming suite"],
					afternoon: ["Indoor skydiving private session", "Stunt driving lesson", "Private ninja warrior course"],
					evening: ["Private immersive theater", "Exclusive escape room experience", "Simulator package experience"],
					night: [
						"Overnight adventure challenge",
						"Private late-night adventure park",
						"Exclusive immersive experience",
					],
				},
				outdoor: {
					morning: ["Helicopter tour", "Hot air balloon ride", "Private surfing lesson"],
					afternoon: ["Skydiving", "Private yacht adventure", "Guided mountain expedition"],
					evening: ["Private sunset helicopter tour", "Evening chartered boat", "Private guided adventure"],
					night: [
						"Overnight wilderness experience",
						"Private night helicopter tour",
						"Exclusive stargazing expedition",
					],
				},
			},
		},
		cultural: {
			free: {
				indoor: {
					morning: ["Free museum day visit", "Cultural center exploration", "Library special collection tour"],
					afternoon: [
						"Art gallery hopping (free admission days)",
						"Cultural documentary marathon",
						"Visit a place of worship",
					],
					evening: ["Free concert at cultural center", "Poetry reading event", "Cultural film screening"],
					night: ["Night at the museum (free entry night)", "Cultural stargazing event", "Late night art walk"],
				},
				outdoor: {
					morning: [
						"Historical walking tour (self-guided)",
						"Cultural neighborhood exploration",
						"Architectural tour (self-guided)",
					],
					afternoon: ["Public sculpture garden", "Historic cemetery tour", "Cultural festival (free entry)"],
					evening: ["Outdoor cultural performance", "Historical sunset tour", "Cultural gardens at dusk"],
					night: [
						"Historical ghost tour (self-guided)",
						"Cultural night market (free entry)",
						"Outdoor movie screening",
					],
				},
			},
			low: {
				indoor: {
					morning: ["Museum with special exhibit", "Cultural cooking class (intro)", "Historical site tour"],
					afternoon: ["Art gallery with guided tour", "Pottery class (beginner)", "Local theater matinee"],
					evening: ["Local theater performance", "Wine and art night", "Cultural dance performance"],
					night: ["Jazz club", "Late night museum event", "Cultural film festival"],
				},
				outdoor: {
					morning: [
						"Guided historical walking tour",
						"Botanical garden with cultural section",
						"Architectural boat tour",
					],
					afternoon: ["Cultural food tour", "Historic home tour", "Outdoor art installation"],
					evening: ["Outdoor theater performance", "Cultural sunset tour", "Evening at cultural gardens"],
					night: ["Ghost tour of historical sites", "Cultural night market", "Outdoor cultural film screening"],
				},
			},
			medium: {
				indoor: {
					morning: ["Private museum tour", "Cultural cooking class", "Historical reenactment event"],
					afternoon: [
						"Theater matinee with good seats",
						"Art class with local artist",
						"Wine tasting with cultural history",
					],
					evening: ["Dinner theater", "Cultural dance show", "Opera or symphony performance"],
					night: ["Late night cultural performance", "Exclusive museum event", "Cultural immersion experience"],
				},
				outdoor: {
					morning: ["Hot air balloon over historical site", "Private historical tour", "Cultural photography tour"],
					afternoon: ["Cultural festival VIP access", "Historical site private tour", "Cultural boat tour"],
					evening: ["Outdoor concert with dinner", "Sunset cultural tour", "Evening cultural experience"],
					night: ["Private ghost tour", "Cultural evening boat tour", "Exclusive outdoor cultural event"],
				},
			},
			high: {
				indoor: {
					morning: [
						"Private museum tour before opening",
						"Exclusive historical site access",
						"Meet with curator or artist",
					],
					afternoon: [
						"Private cultural experience with expert",
						"VIP theater experience",
						"Exclusive art gallery tour",
					],
					evening: ["VIP cultural performance", "Private dinner with cultural experience", "Exclusive cultural event"],
					night: ["After-hours museum access", "VIP cultural night experience", "Private cultural performance"],
				},
				outdoor: {
					morning: ["Helicopter tour of historical sites", "Private historical experience", "Exclusive cultural tour"],
					afternoon: [
						"Private cultural festival experience",
						"Chartered tour of multiple sites",
						"VIP cultural experience",
					],
					evening: ["Private sunset cultural tour", "VIP outdoor performance", "Exclusive cultural dinner experience"],
					night: [
						"Private night tour of historical sites",
						"Exclusive cultural evening event",
						"VIP cultural night experience",
					],
				},
			},
		},
		foodie: {
			free: {
				indoor: {
					morning: ["Home barista competition", "Breakfast cook-off challenge", "DIY pastry making"],
					afternoon: [
						"Homemade pizza competition",
						"Tea tasting with varieties at home",
						"Recipe development challenge",
					],
					evening: ["Themed dinner cook-off", "Blind taste test challenge", "International cuisine night at home"],
					night: ["Dessert making competition", "Late night snack creation", "Midnight tasting menu at home"],
				},
				outdoor: {
					morning: ["Farmers market exploration", "Community garden visit", "Foraging walk (with expert guide online)"],
					afternoon: ["Picnic with homemade foods", "Public fruit tree harvesting", "Food truck festival (free entry)"],
					evening: ["Sunset picnic with homemade foods", "Community potluck", "Outdoor cooking with found items"],
					night: ["Stargazing with homemade snacks", "Night market browsing", "Moonlight picnic"],
				},
			},
			low: {
				indoor: {
					morning: ["Breakfast at a local café", "Bakery tour", "Coffee cupping experience"],
					afternoon: ["Lunch at a new restaurant", "Cooking class (intro)", "Food hall exploration"],
					evening: ["Dinner at a trendy restaurant", "Wine and cheese pairing", "Cooking competition class"],
					night: ["Dessert tour", "Late night food spot", "Specialty coffee or tea tasting"],
				},
				outdoor: {
					morning: ["Farmers market breakfast", "Food truck breakfast tour", "Outdoor café experience"],
					afternoon: ["Food truck crawl", "Picnic with specialty store items", "Street food tour"],
					evening: ["Outdoor dining experience", "Sunset picnic with takeout", "Evening food festival"],
					night: ["Night market food tour", "Moonlight picnic with takeout", "Evening dessert crawl"],
				},
			},
			medium: {
				indoor: {
					morning: [
						"Brunch at upscale restaurant",
						"Cooking class with local chef",
						"Specialty food store tour and tasting",
					],
					afternoon: ["Food and drink pairing experience", "Cooking class with meal", "Restaurant week special lunch"],
					evening: ["Dinner at fine dining restaurant", "Cooking class with wine pairing", "Chef's table experience"],
					night: ["Dessert and cocktail pairing", "Late night chef's table", "Specialty food and drink experience"],
				},
				outdoor: {
					morning: ["Gourmet picnic breakfast", "Guided food tour morning session", "Farmers market tour with chef"],
					afternoon: ["Winery or brewery tour with lunch", "Outdoor cooking class", "Farm-to-table experience"],
					evening: ["Sunset dinner at scenic restaurant", "Evening food and drink tour", "Rooftop dining experience"],
					night: [
						"Evening food festival VIP access",
						"Moonlight dining experience",
						"Night food tour with transportation",
					],
				},
			},
			high: {
				indoor: {
					morning: ["Private breakfast with chef", "Exclusive cooking class", "VIP food experience"],
					afternoon: ["Michelin-starred lunch", "Private tasting menu", "Exclusive food and wine pairing"],
					evening: ["Michelin-starred dinner", "Private chef's table experience", "Exclusive restaurant buyout"],
					night: [
						"Late night private dining",
						"Exclusive after-hours restaurant experience",
						"Private tasting with chef",
					],
				},
				outdoor: {
					morning: [
						"Helicopter breakfast picnic",
						"Private farm tour with meal",
						"Exclusive outdoor dining experience",
					],
					afternoon: [
						"Private vineyard tour with lunch",
						"Chartered food tour",
						"Exclusive outdoor cooking experience",
					],
					evening: ["Private sunset dinner experience", "Exclusive outdoor chef's table", "Helicopter dinner tour"],
					night: ["Private outdoor dining under the stars", "Exclusive night food experience", "VIP moonlight dining"],
				},
			},
		},
	}

	// Generate date ideas based on user selections
	generateBtn.addEventListener("click", () => {
		const dateType = document.getElementById("date-type").value
		const budget = document.getElementById("budget").value
		const location = document.getElementById("location").value
		const time = document.getElementById("time").value

		// Get relevant date ideas
		let relevantIdeas = []

		// If both indoor and outdoor are selected, get ideas from both
		if (location === "both") {
			relevantIdeas = [...dateIdeas[dateType][budget]["indoor"][time], ...dateIdeas[dateType][budget]["outdoor"][time]]
		} else {
			relevantIdeas = dateIdeas[dateType][budget][location][time]
		}

		// Shuffle and take 3 ideas
		const shuffledIdeas = shuffleArray(relevantIdeas).slice(0, 3)

		// Display the results
		displayDateIdeas(shuffledIdeas, dateType, budget, location, time)

		// Show results container
		resultsContainer.style.display = "block"

		// Scroll to results
		resultsContainer.scrollIntoView({ behavior: "smooth" })
	})

	// Function to shuffle array
	function shuffleArray(array) {
		const newArray = [...array]
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
				;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
		}
		return newArray
	}

	// Function to display date ideas
	function displayDateIdeas(ideas, dateType, budget, location, time) {
		// Clear previous results
		dateIdeasGrid.innerHTML = ""

		// Create tags based on selections
		const tags = [
			{ name: capitalizeFirstLetter(dateType), class: "date-tag" },
			{ name: budgetToText(budget), class: "date-tag" },
			{ name: capitalizeFirstLetter(location), class: "date-tag" },
			{ name: capitalizeFirstLetter(time), class: "date-tag" },
		]

		// Create a card for each idea
		ideas.forEach((idea) => {
			const card = document.createElement("div")
			card.className = "date-idea-card"

			// Create a placeholder image
			const imageDiv = document.createElement("div")
			imageDiv.className = "date-idea-image"
			imageDiv.textContent = "Date Idea Image"

			// Create content container
			const contentDiv = document.createElement("div")
			contentDiv.className = "date-idea-content"

			// Create title
			const title = document.createElement("h3")
			title.className = "date-idea-title"
			title.textContent = idea

			// Create description
			const description = document.createElement("p")
			description.className = "date-idea-description"
			description.textContent = generateDescription(idea, dateType)

			// Create tags container
			const tagsDiv = document.createElement("div")
			tagsDiv.className = "date-idea-tags"

			// Add tags
			tags.forEach((tag) => {
				const tagSpan = document.createElement("span")
				tagSpan.className = tag.class
				tagSpan.textContent = tag.name
				tagsDiv.appendChild(tagSpan)
			})

			// Assemble the card
			contentDiv.appendChild(title)
			contentDiv.appendChild(description)
			contentDiv.appendChild(tagsDiv)

			card.appendChild(imageDiv)
			card.appendChild(contentDiv)

			// Add card to grid
			dateIdeasGrid.appendChild(card)
		})
	}

	// Helper function to capitalize first letter
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1)
	}

	// Helper function to convert budget value to text
	function budgetToText(budget) {
		switch (budget) {
			case "free":
				return "Free"
			case "low":
				return "Budget-Friendly"
			case "medium":
				return "Mid-Range"
			case "high":
				return "Luxury"
			default:
				return "Any Budget"
		}
	}

	// Helper function to generate a description
	function generateDescription(idea, dateType) {
		// Base descriptions by date type
		const descriptions = {
			romantic: [
				"Create a special moment together with this intimate date idea.",
				"Perfect for deepening your connection and creating lasting memories.",
				"A romantic experience that will bring you closer together.",
			],
			casual: [
				"A relaxed, fun way to enjoy each other's company without pressure.",
				"Keep things light and enjoyable with this laid-back date idea.",
				"A perfect casual outing that lets you connect without overthinking it.",
			],
			adventure: [
				"Add some excitement to your relationship with this thrilling experience.",
				"Perfect for couples who love trying new things together.",
				"Create an unforgettable memory with this adventurous date idea.",
			],
			cultural: [
				"Expand your horizons together with this enriching experience.",
				"Connect over shared discoveries and new perspectives.",
				"A perfect way to learn something new while enjoying quality time together.",
			],
			foodie: [
				"Treat your taste buds to an unforgettable culinary experience.",
				"Perfect for couples who believe good food is essential to a great date.",
				"Share your passion for food and create delicious memories together.",
			],
		}

		// Return a random description based on date type
		const typeDescriptions = descriptions[dateType]
		return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)]
	}
})

