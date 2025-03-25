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

// Add this line to debug
console.log('YourMoveApp initialized');

// You could also add more detailed logging
console.log('Main module loaded:', !!mainApp);
console.log('Map module loaded:', !!mapModule);