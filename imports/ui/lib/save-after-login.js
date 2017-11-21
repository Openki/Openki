import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

/** Handle saving and logging in
  *
  * @param  {Object} instance   - the template instance
  * @param  {Object} afterLogin - the save method
  */
export default function SaveAfterLogin(instance, loginAction, afterLogin) {
	let openedLogin = false;

	instance.autorun(computation => {
		// if the user is loggged in stop the computation and call the save function
		if (Meteor.user()) {
			computation.stop();
			afterLogin();

		// also stop the computation but don't save if the user closes the login
		// window without logging in
		} else if (Session.equals('pleaseLogin', false) && openedLogin) {
			computation.stop();
			instance.busy(false);

		// if the user is not logged in open up the login window
		} else {
			Session.set('loginAction', loginAction);
			Session.set('pleaseLogin', true);
			openedLogin = true;
		}
	});
}
