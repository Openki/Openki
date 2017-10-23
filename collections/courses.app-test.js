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
	describe('Course save', function() {
		it('stores a course', function() {
			return new Promise((resolve, reject) => {
				Meteor.loginWithPassword("greg", "greg", (err) => {
					if (err) reject(err);
					else resolve();
				});
			}).then(() => {
				const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan
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
				const regionId = "9JyFCoKWkxnf8LWPh"; // Testistan
				const course = {
					name: "Visitor's course",
					description: "Created without login",
					region: regionId,
					emailSignup: "visitor+1970@clogged.tubes.example"
				};
				return promiseMeteorCall('save_course', '', course).then(
					(courseId) => ({ course, courseId })
				);
			}).then(({ course, courseId }) => {
				assert.isString(courseId, "saving course returns a courseId");
			});
		});
	});
}
