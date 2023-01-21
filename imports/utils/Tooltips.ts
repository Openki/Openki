import Tooltip from 'bootstrap/js/dist/tooltip';

export function enable() {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...(tooltipTriggerList as any)].map((tooltipTriggerEl) =>
		Tooltip.getOrCreateInstance(tooltipTriggerEl),
	);
}

export function hide() {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...(tooltipTriggerList as any)].forEach((tooltipTriggerEl) =>
		Tooltip.getOrCreateInstance(tooltipTriggerEl).hide(),
	);
}
