/** Give a preview of a filter by highlighting the matching courses
  *
  * @param  {String} property - property to filter for (e.g. category, region)
  * @param  {String} id       - id/name of the property
  * @param {Boolean} activate - de-/activate the preview effect
  * @param {Boolean} delayed  - delay the fade effect
  * @param  {Object} instance - instance object for scoping
  */

export default FilterPreview = function(options) {
	const instance = options.instance || false;
	const course = instance ? instance.$('.course-compact') : $('.course-compact');
	const property = options.property;

	// build selector class
	let selector;

	if (property == 'state') {
		selector = options.id;
	} else {
		selector = property + '-' + options.id;
	}

	if (property == 'role') {
		selector = 'needs-' + selector;
	}

	selector = '.' + selector;

	// create class for courses which are to be faded out and
	// add a suffix if the fading effect is delayed
	let fadeClass = 'filter-no-match';
	if (options.delayed) fadeClass += '-delayed';

	// fade out the courses which don't match the selector
	course.not(selector).toggleClass(fadeClass, options.activate);

	// for properties which have labels used on the courses,
	// highlight the labels too
	if (property == 'category' || property == 'group') {
		const labelClass = '.js-' + property + '-label' + selector;
		const label = instance ? instance.$(labelClass) : $(labelClass);

		label.parent().toggleClass('highlight');
	}
};
