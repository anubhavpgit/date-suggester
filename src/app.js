import './style.css';

// Import modules
import * as mainApp from './main.js';
import * as mapModule from './map.js';

// Export modules so they're accessible from the global scope if needed
window.YourMoveApp = {
	main: mainApp,
	map: mapModule
};

// Initialize the application when the DOM is loaded

document.addEventListener('DOMContentLoaded', function () {
	console.log('YourMoveApp initialized');
	console.log('Main module loaded:', !!mainApp);
	console.log('Map module loaded:', !!mapModule);
});
