export const FormfieldErrors = function(instance, errors) {
	instance.hasError = new ReactiveVar(false);

	instance.setError = key => {
		if (instance.hasError.get()) instance.resetErrors();

		const error = errors[key];
		const selectors = error.selectors;

		selectors.forEach((selector, index) => {
			const formGroup = $(selector).parents('.form-group');

			formGroup.addClass('has-error');
			if (index === selectors.length - 1) {
				formGroup.append(
					'<span class="help-block warning-block">'
					+ error.text
					+ '</span>'
				);
			}
		});

		instance.hasError.set(true);
	};

	instance.resetErrors = () => {
		instance.$('.form-group').removeClass('has-error');
		instance.$('.warning-block').remove();
	};
};