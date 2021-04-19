import { Meteor } from 'meteor/meteor';

export function showEmailRequest() {
	const user = Meteor.user();

	return user && !user.hasEmail();
}

export function showEmailValidation() {
	const user = Meteor.user();

	return user
		&& user.hasEmail()
		&& !user.hasVerifiedEmail()
		&& moment().subtract(7, 'days').isAfter(user.createdAt);
}
