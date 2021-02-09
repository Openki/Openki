import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} CourseDiscussionEnity
 * @property {string}  [_id]          ID
 * @property {string}  [title]
 * @property {string}  [text]
 * @property {string}  [userId]       ID_users undefined if anon comment
 * @property {string}  [courseId]     ID_Courses
 * @property {boolean} [notifyAll]
 * @property {Date}    [time_created]
 * @property {Date}    [time_updated]
 * @property {string}  [parentId]     ID_CourseDiscussions (optional)
 */

/**
 * @type {Mongo.Collection<CourseDiscussionEnity>}
 */
const CourseDiscussions = new Mongo.Collection('CourseDiscussions');

/**
 * @param {string} text
 */
CourseDiscussions.validComment = function (text) {
	return text.trim().length > 0;
};

export default CourseDiscussions;
