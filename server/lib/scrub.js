export class ScrubRule {
	static read(d) {
		return new ScrubRule(d.name, d.grace, d.select, d.remove, d.unset);
	}

	constructor(name, grace, select, remove, unset) {
		check(name, String);
		this.name = name;

		check(grace, Number);
		this.grace = grace;

		check(select, Object);
		this.select = select;

		check(remove, Match.Optional(Boolean));
		this.remove = !!remove;

		check(unset, Match.Optional([String]));
		this.unset = unset || false;
	}

	scrub(log, now) {
		const today = moment(now).startOf('day');
		const cutoff = today.subtract(this.grace, 'days').toDate();
		const select = { ...this.select, ts: { $lt: cutoff } };

		// Register intent to scrub in the log
		const pending = log.record('scrub', [this.name], {
			rule: this.name,
			cutoff,
		});

		// Record completion of scrubbing
		const recordResult = (err, count) => {
			if (err) {
				pending.error(err);
			} else {
				pending.success({ count });
			}
		};

		if (this.remove) {
			log.remove(select, recordResult);

			// Exit early because we can't unset records that have
			// been removed.
			return;
		}

		if (this.unset) {
			const expr = {};

			// Query for existence of one of the fields that are to be
			// unset. This is not done for performance reasons but
			// so that the count in the result is correct. Records
			// where all the fields were already unset must not show
			// up in the count of newly unset records.
			const fieldSelects = [];
			/* eslint-disable-next-line no-restricted-syntax */
			for (const name of this.unset) {
				const selector = `body.${name}`;
				expr[selector] = '';
				fieldSelects.push({ [selector]: { $exists: true } });
			}
			log.update(
				{ $and: [select, { $or: fieldSelects }] },
				{ $unset: expr },
				{ multi: true },
				recordResult,
			);
		}
	}
}

export class Scrubber {
	static read(d) {
		check(d, [Object]);
		return new Scrubber(d.map(ScrubRule.read));
	}

	constructor(rules) {
		check(rules, [ScrubRule]);
		this.rules = rules;
	}

	scrub(log, now) {
		/* eslint-disable-next-line no-restricted-syntax */
		for (const rule of this.rules) {
			rule.scrub(log, now);
		}
	}
}
