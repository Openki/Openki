export default function UpdateViewport() {
	const viewportWidth =
		Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	Session.set('viewportWidth', viewportWidth);
}
