import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

/**
 * Handle saving and logging in
 * @param {object} instance - the template instance
 * @param {string} loginAction - Text that is shown to user in the login window
 * @param {string} registerAction - Text that is shown to user in the register window
 * @param {() => void} afterLogin - the save method
 */
export default function SaveAfterLogin(instance, loginAction, registerAction, afterLogin) {
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
