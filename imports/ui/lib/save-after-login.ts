import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Blaze } from 'meteor/blaze';

/**
 * Handle saving and logging in
 * @param instance the template instance
 * @param loginAction Text that is shown to user in the login window
 * @param registerAction Text that is shown to user in the register window
 * @param afterLogin the save method
 */
export function SaveAfterLogin(
	instance: Blaze.TemplateInstance,
	loginAction: string,
	registerAction: string,
	afterLogin: () => void,
) {
	let openedLogin = false;

	instance.autorun((computation) => {
		if (Meteor.user()) {
			// if the user is loggged in stop the computation and call the save function

			computation.stop();
			afterLogin();
		} else if (Session.equals('pleaseLogin', false) && openedLogin) {
			// also stop the computation but don't save if the user closes the login
			// window without logging in

			computation.stop();
			instance.busy(false);
		} else {
			// if the user is not logged in open up the login window

			Session.set('loginAction', loginAction);
			Session.set('registerAction', registerAction);
			Session.set('pleaseLogin', true);
			openedLogin = true;
		}
	});
}

export default SaveAfterLogin;
