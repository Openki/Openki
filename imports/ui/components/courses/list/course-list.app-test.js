import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'chai';

import { subscriptionsReady, waitFor } from '/imports/ClientUtils.app-test.js';

if (Meteor.isClient) {
	describe('Frontpage', function() {
		this.timeout(10000);
		beforeEach(function(done) {
			Meteor.call('fixtures.clean',
					() => Meteor.call('fixtures.create'));
			// HACK: done() fails with a strange error when called from Meteor.call()
			// So we just wait a bit... poor man's synch
			setTimeout(done, 2000);
		});
		it('should list 8 courses for unauthenticated user (Testistan)', function() {
			Router.go('/');

			return subscriptionsReady()
			.then(waitFor(() => {
				const titles = document.getElementsByClassName('course-compact-title');
				assert.equal(titles.length, 8, "expect to see test course titles");
				return titles;
			}, 2000))
			.then((titles) => waitFor(() => {
				assert.equal(titles[0].textContent, 'Sprachaustausch');
				assert.equal(titles[1].textContent, 'Game Design mit Unity');
				assert.equal(titles[2].textContent, 'Aikido');
				assert.equal(titles[3].textContent, 'Open Lab');
				assert.equal(titles[4].textContent, 'First-Aid Course');
				assert.equal(titles[5].textContent, 'Ubuntu auf Mac (dual-Boot)');
				assert.equal(titles[6].textContent, 'Velo Flicken');
				assert.equal(titles[7].textContent, 'Meteor.js Workshop');
			})());
		});
	});
}
