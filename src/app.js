import './style.css';

// Import modules
import * as mainApp from './main.js';
import * as mapModule from './map.js';

// Add height communication functionality
function setupHeightCommunication() {
	// Function to send the content height to the parent
	function sendHeightToParent() {
		// Get the total height of the document
		const height = document.body.scrollHeight;

		// Send message to parent window
		if (window.parent !== window) {
			window.parent.postMessage({
				type: 'resize',
				height: height
			}, '*'); // In production, specify the parent domain for security
		}
	}

	// Run initially when page loads
	if (document.readyState === 'complete') {
		sendHeightToParent();
	} else {
		window.addEventListener('load', sendHeightToParent);
	}

	// Run whenever content changes
	// For DOM changes
	const observer = new MutationObserver(() => {
		// Add a small delay to account for rendering
		setTimeout(sendHeightToParent, 100);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true
	});

	// For window resize events
	window.addEventListener('resize', sendHeightToParent);

	// For click events that might trigger content changes
	document.addEventListener('click', () => {
		// Delay to allow for content to change after click
		setTimeout(sendHeightToParent, 500);
	});

	// For form submissions or selections that might change content
	document.addEventListener('change', () => {
		setTimeout(sendHeightToParent, 300);
	});
}

// Export modules so they're accessible from the global scope if needed
window.YourMoveApp = {
	main: mainApp,
	map: mapModule,
	// Add a method to manually trigger height updates
	updateHeight: function () {
		const height = document.body.scrollHeight;
		if (window.parent !== window) {
			window.parent.postMessage({
				type: 'resize',
				height: height
			}, '*');
		}
	}
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	console.log('YourMoveApp initialized');
	console.log('Main module loaded:', !!mainApp);
	console.log('Map module loaded:', !!mapModule);

	// Setup height communication
	setupHeightCommunication();

	// If your app has specific interactions that change the height,
	// you can call window.YourMoveApp.updateHeight() after those changes
});