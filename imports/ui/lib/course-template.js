export default function CourseTemplate() {
	return {
		roles: ['host', 'mentor'],
		region: Session.get('region')
	};
}
