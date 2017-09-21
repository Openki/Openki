import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'meteor/practicalmeteor:chai';

import { subscriptionsReady, elementsReady } from '/imports/ClientUtils.app-test.js';

if (Meteor.isClient) {
	describe('Frontpage', function (done) {
		it('should list 8 courses for unauthenticated user (Testistan)', function () {
			Router.go('/');
			subscriptionsReady().then(() => {
				return elementsReady(() => {
					const titles = document.getElementsByClassName('course-compact-title');
					if (titles.length === 8) {
						return titles;
					}
				});
			}).then((titles) => {
				assert.equal(titles[0].textContent, 'Sprachaustausch');
				assert.equal(titles[1].textContent, 'Game Design mit Unity');
				assert.equal(titles[2].textContent, 'Aikido');
				assert.equal(titles[3].textContent, 'Open Lab');
				assert.equal(titles[4].textContent, 'First-Aid Course');
				assert.equal(titles[5].textContent, 'Ubuntu auf Mac (dual-Boot)');
				assert.equal(titles[6].textContent, 'Velo Flicken');
				assert.equal(titles[7].textContent, 'Meteor.js Workshop');

				done();
			});
		});
	});
}
