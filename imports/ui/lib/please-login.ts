import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

export function PleaseLogin() {
	if (Meteor.userId()) {
		return false;
	}
	Session.set('pleaseLogin', true);
	$('.js-account-tasks').modal('show');
	return true;
}

export default PleaseLogin;
