import { Blaze } from 'meteor/blaze';
import { ReactiveVar } from 'meteor/reactive-var';

Blaze.TemplateInstance.prototype.parentInstance = function (
	this: any,
	levels = 1,
): Blaze.TemplateInstance | undefined {
	let { view } = this;
	while (view) {
		/* eslint-disable-next-line no-param-reassign, no-plusplus */
		if (view.name.substring(0, 9) === 'Template.' && !levels--) {
			return view.templateInstance();
		}
		view = view.parentView;
	}
	return undefined;
};

Blaze.TemplateInstance.prototype.busy = function (
	this: any,
	activity: string | boolean | undefined,
) {
	if (!this.business) {
		this.business = new ReactiveVar(activity);
	} else {
		this.business.set(activity);
	}
};

Blaze.TemplateInstance.prototype.findBusiness = function (this: any) {
	if (this.business) return this.business; // Short-circuit common case

	let businessInstance = this;
	while (businessInstance && !businessInstance.business) {
		businessInstance = businessInstance.parentInstance();
	}

	if (!businessInstance) {
		throw new Error('Unable to find parent instance with business set');
	}

	// Cache on the local instance
	this.business = businessInstance.business;

	return this.business;
};
