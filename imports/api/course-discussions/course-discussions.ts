import { Mongo } from 'meteor/mongo';

/** DB-Model */

export interface CourseDiscussionEnity {
	/** ID */
	_id: string;
	title: string;
	text: string;
	/** ID_users undefined if anon comment */
	userId?: string;
	/** ID_Courses */
	courseId: string;
	notifyAll?: boolean;
	// eslint-disable-next-line camelcase
	time_created: Date;
	// eslint-disable-next-line camelcase
	time_updated: Date;
	/** ID_CourseDiscussions (optional) */
	parentId?: string;
}

export class CourseDiscussionsCollection extends Mongo.Collection<CourseDiscussionEnity> {
	constructor() {
		super('CourseDiscussions');

		if (Meteor.isServer) {
			this.createIndex({ courseId: 1 });
		}
	}

	// eslint-disable-next-line class-methods-use-this
	validComment(text: string) {
		return text.trim().length > 0;
	}
}
export const CourseDiscussions = new CourseDiscussionsCollection();

export default CourseDiscussions;
