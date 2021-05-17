import './client-error';
import './extend-instance';
import './templates';
import './template-helpers';
import './translations.html';

if (window.location.search === '?state=upcomingEvent&categories=computer%2Cexperimental') {
	const style = document.createElement('style');

	// add CSS styles for dark mode
	style.innerHTML = `
		html {
			filter: invert(100%) hue-rotate(180deg);
		}

		html img,
		html input[type="image"] {
			filter: invert(100%) hue-rotate(-180deg);
		}
`;

	document.head.appendChild(style);
}
