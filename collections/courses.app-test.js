import { Meteor } from 'meteor/meteor';
import { assert } from 'chai';

function promiseMeteorCall(...args) {
	return new Promise((resolve, reject) => {
		Meteor.call(...args, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
}

if (Meteor.isClient) {
	const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan

	describe('Course save', function() {
		it('stores a course', function() {
			return new Promise((resolve, reject) => {
				Meteor.loginWithPassword("greg", "greg", (err) => {
					if (err) reject(err);
					else resolve();
				});
			}).then(() => {
				const course = {
					name: "Intentionally clever title for a generated test-course",
					description: "This space intentionally filled with bland verbiage. You are safe to ignore this. ",
					region: regionId,
					roles: {}
				};
				return promiseMeteorCall('save_course', '', course).then(
					(courseId) => ({ course, courseId })
				);
			}).then(({ course, courseId }) => {
				assert.isString(courseId, "saving course returns a courseId");
				return { course, courseId };
			}).then(({ course, courseId }) => {
				delete course.region;
				course.name = "New Name!";
				return promiseMeteorCall('save_course', courseId, course);
			}).catch(err => {
				assert.assert(false, err);
			});
		});
	});

	describe('Visitor-creates course', function() {
		it('is saved', function() {
			return new Promise((resolve, reject) => {
				// Make sure client is logged-out
				// Other tests log-in
				Meteor.logout((err) => {
					if (err) reject(err);
					else resolve();
				});
			}).then(() => {
				const course = {
					name: "Visitor's course",
					description: "Created without login",
					region: regionId,
					emailSignup: "visitor+1970@clogged.tubes.example"
				};
				return promiseMeteorCall('save_course', '', course);
			}).then(courseId => {
				assert.isString(courseId, "saving course returns a courseId");

				const course = {
					name: "Visitor's second course",
					description: "Created without login",
					region: regionId,
					emailSignup: "visitor+1970@clogged.tubes.example"
				};
				return promiseMeteorCall('save_course', '', course);
			}).then(courseId => {
				assert.isString(courseId, "saving second course returns a courseId");
			});
		});
	});

	describe('Prevent attaching visitor-proposals', function() {
		it('to existing non-visitors', function() {
			return new Promise((resolve, reject) => {
				// Make sure client is logged-out
				// Other tests log-in
				Meteor.logout((err) => {
					if (err) reject(err);
					else resolve();
				});
			}).then(() => {
				const course = {
					name: "Visitor's course",
					description: "Created without login",
					region: regionId,
					emailSignup: "greg@openki.example" // greg is a non-visitor
				};
				return new Promise((resolve, reject) => {
					Meteor.call('save_course', '', course, err => {
						resolve(err);
					});
				}).then((err) => {
					assert(!!err, "not allowed to save course");
				});
			});
		});
	});
}
