import { assert } from 'chai';
import { Router } from 'meteor/iron:router';
import $ from 'jquery';
import { Meteor } from 'meteor/meteor';

import { MeteorAsync } from '/imports/utils/promisify';

import { waitForSubscriptions, waitFor } from '/imports/ClientUtils.app-test';

if (Meteor.isClient) {
	describe('Subscribe to participant role', function () {
		this.timeout(30000);
		const comment = 'Bi now, gay later.';
		it('keeps comment', async () => {
			Router.go('/course/6cac962a5f/game-design-mit-unity');
			const findJoinButton = () => {
				const sel = $('.js-role-enroll-btn[name=participant]');
				assert(sel.length > 0, 'Join as participant button present');
				return sel;
			};
			const findCommentField = () => {
				const sel = $('.js-comment');
				assert(sel.length > 0, 'Comment field present');
				return sel;
			};
			const findComment = () => {
				const sel = $(`.course-member-comment-body:contains('${comment}')`);
				assert(sel.length > 0, 'User comment visible after joining');
			};
			await waitForSubscriptions();
			const button = await waitFor(findJoinButton);
			button.trigger('click');
			// Purposefully only logging in after having decided to participate
			// We want to support this.
			await MeteorAsync.loginWithPassword('Seee', 'greg');
			const field = await waitFor(findCommentField);
			field.text(comment);
			$('.js-role-subscribe-btn').trigger('click');
			await waitFor(findComment);
		});
	});
}
