import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// ======== DB-Model: ========
/**
 * @typedef {Object} InfoPagesEntity
 * @property {string} slug URL-path of the page
 * @property {string} locale
 * @property {number} accuracy Used to find the most exact language. de-ZH: 3, de: 2, en: 1
 * @property {string} title title of the page, shown in the browser's title bar or in the page's tab
 * @property {string} body the content of the page, its supports markdown
 */

/**
 * @extends {Mongo.Collection<InfoPagesEntity>}
 */
export class InfoPagesCollection extends Mongo.Collection {
	constructor() {
		super('InfoPages');

		if (Meteor.isServer) {
			this._ensureIndex({ slug: 1, locale: 1, accuracy: -1 });
		}
	}
}

export const InfoPages = new InfoPagesCollection();

export default InfoPages;
