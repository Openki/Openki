import { Meteor } from 'meteor/meteor';

const Categories = { ...Meteor.settings.public.categories } as {
	[category: string]: string[];
};

export default Categories;
