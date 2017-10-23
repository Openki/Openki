/** Setup (re-)setting of login/register warnings for a template
  *
  * @param {Object} instance
  * @param {Object} warnings - an object containing objects obtaining the different
  *                            warning messages, for each possible error
  */
export const SetupWarnings = (instance, warnings) => {
	instance.hasWarning = new ReactiveVar(false);

	instance.setWarning = key => {
		if (instance.hasWarning.get()) instance.resetWarnings();

		const warning = warnings[key];
		const selectors = warning.selectors;

		selectors.forEach((selector, index) => {
			const formGroup = $(selector).parents('.form-group');

			formGroup.addClass('has-error');
			if (index === selectors.length - 1) {
				formGroup.append(
					'<span class="help-block warning-block">'
					+ warning.text
					+ '</span>'
				);
			}
		});

		instance.hasWarning.set(true);
	};

	instance.resetWarnings = () => {
		instance.$('.form-group').removeClass('has-error');
		instance.$('.warning-block').remove();
	};
};

/** Check a string if it is a valid email adress
  *
  * @param {String} the string to be checked
  */
export const IsEmail = str => {
	check(str, String);
	return str.search(/^[^@\s]+@([^@.\s]+\.)+\w+$/g) === 0;
};
