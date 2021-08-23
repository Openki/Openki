import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} CourseDiscussionEnity
 * @property {string}  _id          ID
 * @property {string}  title
 * @property {string}  text
 * @property {string}  [userId]       ID_users undefined if anon comment
 * @property {string}  courseId     ID_Courses
 * @property {boolean} [notifyAll]
 * @property {Date}    time_created
 * @property {Date}    time_updated
 * @property {string}  [parentId]     ID_CourseDiscussions (optional)
 */

/**
 * @extends {Mongo.Collection<CourseDiscussionEnity>}
 */
export class CourseDiscussionsCollection extends Mongo.Collection {
	constructor() {
		super('CourseDiscussions');

		if (Meteor.isServer) {
			this._ensureIndex({ courseId: 1 });
		}
	}

	/**
	 * @param {string} text
	 */
	// eslint-disable-next-line class-methods-use-this
	validComment(text) {
		return text.trim().length > 0;
	}
}
export const CourseDiscussions = new CourseDiscussionsCollection();

export default CourseDiscussions;
