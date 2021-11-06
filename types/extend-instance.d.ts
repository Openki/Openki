declare module 'meteor/blaze' {
	namespace Blaze {
		// Declarations for the instance extending that happens in file /imports/startup/client/extend-instance.ts
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		interface TemplateInstance<D = any> {
			/**
			 * Get the parent template instance. Source: http://stackoverflow.com/questions/27949407/how-to-get-the-parent-template-instance-of-the-current-template
			 * @param levels How many levels to go up. Default is `1`
			 */
			parentInstance(levels?: number): Blaze.TemplateInstance | undefined;

			/**
			 * Set the business of the template instance
			 *
			 * This method will set up the 'business' variable on the template instance.
			 * It needs to be called in onCreated() so the other methods will find the
			 * var. Usually it will be `this.busy(false)` bout it could also be
			 * `this.busy('loading')` for example.
			 *
			 * @param activity The new business
			 */
			busy(activity?: string | boolean): void;

			/**
			 * Find business state var in this or parent template instance
			 */
			findBusiness(): ReactiveVar<string | boolean | undefined>;
		}
	}
}
