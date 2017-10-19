export const ScssVars = {
	// == Media Query Breakpoints
	// $screen-xxs
	'screenXXS': 380, // defined at client/styles/_variables.scss L84

	// $screen-xs
	'screenXS': 480, // defined at client/styles/_bootstrap-variables.scss L302

	// $screen-sm
	'screenSM': 768, // defined at client/styles/_bootstrap-variables.scss L312

	// $screen-md
	'screenMD': 992, // defined at client/styles/_bootstrap-variables.scss L320

	// $screen-lg
	'screenLG': 1200, // defined at client/styles/_bootstrap-variables.scss L328

	// $grid-float-breakpoint
	'gridFloatBreakpoint': 991, // defined at client/styles/_bootstrap-variables.scss L351

	// == Other Values
	// $navbar-height
	'navbarHeight': 50 // defined at client/styles/_bootstrap-variables.scss L383
};

export const UpdateViewportWidth = () => {
	const viewportWidth =
		Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	Session.set('viewportWidth', viewportWidth);
};
