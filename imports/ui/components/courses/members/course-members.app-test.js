import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { assert } from 'chai';
import { jQuery } from 'meteor/jquery';

import { subscriptionsReady, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('Subscribe to participant role', function () {
		this.timeout(30000);
		const comment = 'Bi now, gay later.';
		it('keeps comment', () => {
			Router.go('/course/6cac962a5f/game-design-mit-unity');
			const findJoinButton = () => {
				const sel = jQuery('.js-role-enroll-btn[name=participant]');
				assert(sel.length > 0, 'Join as participant button present');
				return sel;
			};
			const findCommentField = () => {
				const sel = jQuery('.js-comment');
				assert(sel.length > 0, 'Comment field present');
				return sel;
			};
			const findComment = () => {
				const sel = jQuery(`.course-member-comment-body:contains('${comment}')`);
				assert(sel.length > 0, 'User comment visible after joining');
			};
			return subscriptionsReady()
				.then(waitFor(findJoinButton))
				.then((button) => { button.click(); })
			// Purposefully only logging in after having decided to participate
			// We want to support this.
				.then(() => new Promise((done, reject) => {
					Meteor.loginWithPassword('Seee', 'greg', (err) => {
						if (err) {
							reject(err);
						} else {
							done();
						}
					});
				}))
				.then(waitFor(findCommentField))
				.then((field) => {
					field.text(comment);
					jQuery('.js-role-subscribe-btn').click();
				})
				.then(waitFor(findComment));
		});
	});
}
