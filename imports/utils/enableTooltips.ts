import bootstrap from 'bootstrap';

export function enableTooltips(element: HTMLElement) {
	const tooltipTriggerList = element.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...(tooltipTriggerList as any)].map(
		(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
	);
}
