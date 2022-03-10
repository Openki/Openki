import PublicSettings from '/imports/utils/PublicSettings';

const Categories = { ...PublicSettings.categories } as {
	[category: string]: string[];
};

export default Categories;
