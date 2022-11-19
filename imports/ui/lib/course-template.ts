import type { Data as CourseEditData } from '/imports/ui/components/courses/edit';
import { Session } from 'meteor/session';

export function CourseTemplate(): Partial<CourseEditData> {
	return {
		roles: ['host', 'mentor'],
		region: Session.get('region'),
	};
}
