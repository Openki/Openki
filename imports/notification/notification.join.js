export default notificationJoin = {};
import Log from '/imports/api/log/log.js';
import StringTools from '/imports/utils/string-tools.js';
import Courses from '/imports/api/courses/courses.js';
import HtmlTools from '/imports/utils/html-tools.js';

/** Record the intent to send join notifications
  *
  * @param      {ID} courseID         - ID for the CourseDiscussions collection
  * @param      {ID} participantId - ID of the user that joined
  * @param      {String} newRole      - new role of the participant
  * @param      {String} message      - Optional message of the new participant
  */
notificationJoin.record = function(courseId, participantId, newRole, message) {
	check(courseId, String);
	check(participantId, String);
	check(newRole, String);
	check(message, Match.Optional(String));

	var course = Courses.findOne(courseId);
	if (!course) throw new Meteor.Error("No course entry for " + commentId);

	var participant = Meteor.users.findOne(participantId);
	if (!course) throw new Meteor.Error("No user entry for " + participantId);

	var body = {};
	body.courseId = course._id;
	body.participantId = participant._id;
	body.recipients = _.pluck(course.membersWithRole('team'), 'user');

	// Don't send to new member, they know
	body.recipients = body.recipients.filter(r => r !== participantId);

	body.newRole = newRole;

	body.message = message;

	body.model = 'Join';

	Log.record('Notification.Send', [course._id, participant._id], body);
};


notificationJoin.Model = function(entry) {
	var body = entry.body;
	var course = Courses.findOne(body.courseId);
	var newParticipant = Meteor.users.findOne(body.participantId);

	return {
		vars(userLocale) {
			if (!newParticipant) throw "New participant does not exist (0.o)";
			if (!course) throw "Course does not exist (0.o)";

			var roleTitle = mf(`roles.${body.newRole}.short`, {}, undefined, userLocale);
			var subjectvars =
				{ COURSE: StringTools.truncate(course.name, 10)
				, USER: StringTools.truncate(newParticipant.username, 50)
				, ROLE: roleTitle
				};
			var subject = mf('notification.join.mail.subject', subjectvars, "{USER} joined {COURSE}: {ROLE}", userLocale);

			var figures = [];
			for (var role of ['host', 'mentor', 'participant']) {
				if (course.roles.includes(role)) {
					figures.push(
						{ role: StringTools.capitalize(mf(`roles.${role}.short`, {}, undefined, userLocale))
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
				, message: HtmlTools.plainToHtml(body.message)
				, figures: figures
				}
			);
		},
		template: "notificationJoinMail"
	};
};
