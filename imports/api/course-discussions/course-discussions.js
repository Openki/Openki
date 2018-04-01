import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
// "_id"          -> ID
// "title"        -> String
// "text"         -> String
// "userId"       -> ID_users undefined if anon comment
// "courseId"     -> ID_Courses
// "time_created" -> Date
// "time_updated" -> Date
// "parentId"     -> ID_CourseDiscussions  (optional)
// ===========================

export default CourseDiscussions = new Mongo.Collection('CourseDiscussions');

CourseDiscussions.validComment = function(text) {
	return text.trim().length > 0;
};
