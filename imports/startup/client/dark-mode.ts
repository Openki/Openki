if (
	window.location.search.includes('upcoming') &&
	window.location.search.includes('computer') &&
	window.location.search.includes('experimental') &&
	window.location.search.length === 55
) {
	const style = document.createElement('style');

	// add CSS styles for dark mode
	style.innerHTML = `
		html,
		body,
		#wrap {
			background-color: #fff;
		}

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
