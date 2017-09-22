export default notificationJoin = {};
import '/imports/collections/Log.js';
import '/imports/StringTools.js';

/** Record the intent to send join notifications
  *
  * @param      {ID} courseID         - ID for the CourseDiscussions collection
  * @param      {ID} participantId - ID of the user that joined
  * @param      {String} newRole      - new role of the participant
  * @param      {String} message      - ID of the new role
  */
notificationJoin.record = function(courseId, participantId, newRole) {
	check(courseId, String);
	check(participantId, String);
	check(newRole, String);

	var course = Courses.findOne(courseId);
	if (!course) throw new Meteor.Error("No course entry for " + commentId);

	var participant = Meteor.users.findOne(participantId);
	if (!course) throw new Meteor.Error("No user entry for " + participantId);

	var body = {};
	body.courseId = course._id;
	body.participantId = participant._id;
	body.recipients = [];
	body.recipients = _.pluck(course.membersWithRole('team'), 'user');
	body.newRole = newRole;

	body.model = 'Join';

	Log.record('Notification.Send', [course._id, participant._id], body);
};


notificationJoin.Model = function(entry) {
	var body = entry.body;
	var course = Courses.findOne(body.courseId);
	var newParticipant = Meteor.users.findOne(body.participantId);

	return {
		vars: function(userLocale) {
			if (!newParticipant) throw "New participant does not exist (0.o)";
			if (!course) throw "Course does not exist (0.o)";

			var roleTitle = mf('roles.'+body.newRole+'.short', {}, undefined, userLocale);
			var subjectvars =
				{ COURSE: StringTools.truncate(course.name, 10)
				, USER: StringTools.truncate(newParticipant.username, 50)
				, ROLE: roleTitle
				};
			var subject = mf('notification.join.mail.subject', subjectvars, "{USER} joined {COURSE}: {ROLE}", userLocale);

			var figures = [];
			for (var role of ['host', 'mentor', 'participant']) {
				if (course.roles.indexOf(role) >= 0) {
					figures.push(
						{ role: StringTools.capitalize(mf('roles.'+role+'.short', {}, undefined, userLocale))
						, count: course.membersWithRole(role).length
						}
					);
				}
			}

			return (
			    { course: course
				, newParticipant: newParticipant
				, courseLink: Router.url('showCourse', course)
				, subject: subject
				, memberCount: course.members.length
				, roleTitle: roleTitle
				, figures: figures
				}
			);
		},
		template: "notificationJoinMail"
	};
};
