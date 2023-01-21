import bootstrap from 'bootstrap';

export function enableTooltips(element: HTMLElement) {
	const tooltipTriggerList = (element.parentElement as any).querySelectorAll('[data-bs-toggle="tooltip"]');
	[...(tooltipTriggerList as any)].map(
		(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
	);
}
