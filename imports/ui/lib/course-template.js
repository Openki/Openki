export default function CourseTemplate() {
	return {
		roles: ['host', 'mentor', 'participant'],
		region: Session.get('region'),
	};
}
