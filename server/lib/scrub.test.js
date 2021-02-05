import { assert } from 'chai';
import moment from 'moment';

import { logFactory } from '/imports/api/log/factory';
import { Scrubber, ScrubRule } from '/server/lib/scrub';

// This should not be here
msgfmt.init('en');

describe('The Log-Scrubber', () => {
	const scrubAfterOneDay = new Scrubber([
		new ScrubRule('test', 1, { tr: 'test' }, true, []),
	]);

	it('deletes record after grace period', () => {
		const log = logFactory.fake();
		log.record('test', [], {});

		scrubAfterOneDay.scrub(log, moment().add(2, 'days'));

		assert.equal(log.find({ tr: 'test' }).count(), 0);
	});

	it('deletes multiple records after grace period', () => {
		const log = logFactory.fake();
		log.record('test', [], {});
		log.record('test', [], {});

		scrubAfterOneDay.scrub(log, moment().add(2, 'days'));

		assert.equal(log.find({ tr: 'test' }).count(), 0);
	});

	it('keeps record during grace period', () => {
		const log = logFactory.fake();
		log.record('test', [], {});

		scrubAfterOneDay.scrub(log, moment().add(1, 'day'));

		assert.equal(log.find({ tr: 'test' }).count(), 1);
	});

	it('unsets only specified field', (done) => {
		const log = logFactory.fake();
		log.record('test', [], { a: 'a', b: 'b' });

		const scrubber = new Scrubber([
			new ScrubRule('test', 1, { tr: 'test' }, false, ['a']),
		]);

		const cursor = log.find({ tr: 'test' });
		const handle = cursor.observeChanges({
			changed: (id, doc) => {
				handle.stop(); // cleanup
				try {
					assert.equal(doc.body.a, undefined);
					assert.equal(doc.body.b, 'b');
					done();
				} catch (e) {
					done(e);
				}
			},
		});
		scrubber.scrub(log, moment().add(2, 'days'));
		log.update({ tr: 'test' }, { $unset: { a: '' } });
	});
});
