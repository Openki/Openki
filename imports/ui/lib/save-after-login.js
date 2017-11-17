import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

/** Handle saving and logging in
  *
  * @param  {Object} instance - the template instance
  * @param  {Object} method   - the save method
  */
export default function SaveAfterLogin(instance, method) {
	let openedLogin = false;

	instance.autorun(computation => {
		// if the user is loggged in stop the computation and call the save function
		if (Meteor.user()) {
			computation.stop();

			// if the method arguments contain the user, add this to the args
			// object now
			if (method.requiresUserId) {
				method.args.userId = Meteor.userId();
			}
			Meteor.call(method.name, method.args, method.callback);

		// also stop the computation but don't save if the user closes the login
		// window without logging in
		} else if (Session.equals('pleaseLogin', false) && openedLogin) {
			computation.stop();
			instance.busy(false);

		// if the user is not logged in open up the login window
		} else {
			Session.set('pleaseLogin', true);
			$('#accountTasks').modal('show');
			openedLogin = true;
		}
	});
}
