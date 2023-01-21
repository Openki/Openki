import Tooltip from 'bootstrap/js/dist/tooltip';

export function enableTooltips(element: ParentNode) {
	const tooltipTriggerList = element.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...(tooltipTriggerList as any)].map((tooltipTriggerEl) =>
		Tooltip.getOrCreateInstance(tooltipTriggerEl),
	);
}


export function hideTooltips(element: ParentNode) {
	const tooltipTriggerList = element.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...(tooltipTriggerList as any)].forEach((tooltipTriggerEl) =>
		Tooltip.getOrCreateInstance(tooltipTriggerEl).hide(),
	);
}
