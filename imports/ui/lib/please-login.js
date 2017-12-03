export default function PleaseLogin() {
	if (Meteor.userId()) return false;
	Session.set('pleaseLogin', true);
	$('#accountTasks').modal('show');
	return true;
}
