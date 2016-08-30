lgs = {
	'am': { lg: 'am', name: 'አማርኛ', short: 'አማርኛ', english:'Amharic'},
	'ar': { lg: 'ar', name: 'العربية', short: 'العربية', english:'Arabic'},
	'da': { lg: 'da', name: 'Dansk', short: 'da', english:'Danish'},
	'de': { lg: 'de', name: 'Deutsch', short: 'de', english:'German'},
	'el': { lg: 'el', name: 'Ελληνικά', short: 'Ελ', english:'Greek'},
	'en': { lg: 'en', name: 'English', short: 'en', english:'English'},
	'es': { lg: 'es', name: 'Castellano', short: 'es', english:'Spanish'},
	'fa': { lg: 'fa', name: 'فارسی', short: 'فارسی', english:'Farsi, Persian'},
	'fr': { lg: 'fr', name: 'Français', short: 'fr', english:'French'},
	'hu': { lg: 'hu', name: 'Magyar', short: 'hu', english:'Hungarian'},
	//'it': { lg: 'it', name: 'Italiano', short: 'it', english:'Italian'},
	//'ja': { lg: 'ja', name: '日本語', short: '日本語', english:'Japanese'},
	'ku': { lg: 'ku', name: 'Kurdî', short: 'ku', english:'Kurdish'},
	'tr': { lg: 'tr', name: 'Türkçe', short: 'tr', english:'Turkish'},
	'zh_TW': { lg: 'zh_TW', name: '國語', short: '國語', english:'Guóyǔ, Taiwanese'},
	'de_ZH': { lg: 'de_ZH', name: 'Züritüütsch', short: 'zri-tü', english:'Zurich German'}
};

Template.languageSelectionWrap.created = function() {
	 var instance = this;
	 instance.searchingLanguages = new ReactiveVar(false);
};

Template.languageSelectionWrap.helpers({
	searchingLanguages: function() {
		return Template.instance().searchingLanguages.get();
	}
});

Template.languageDisplay.helpers({
	setLanguage: function() {
		return lgs[Session.get('locale')];
	}
});

Template.languageDisplay.events({
	'click .js-language-display': function(event, instance) {
		instance.parentInstance().searchingLanguages.set(true);
	}
});

Template.languageSelection.onCreated(function() {
	this.languageSearch = new ReactiveVar('');
});

Template.languageSelection.onRendered(function() {
	Template.instance().$('.js-language-search').select();
});

var updateLanguageSearch = function(event, instance) {
	var search = instance.$('.js-language-search').val();
	search = String(search).trim();
	instance.languageSearch.set(search);
};

Template.languageSelection.helpers({
	setLanguage: function() {
		return lgs[Session.get('locale')];
	},

	languages: function() {
		var search = Template.instance().languageSearch.get();
		var query = search.toLowerCase();

		var results = {};
		for (var lg in lgs) {
			if (lgs[lg].name.toLowerCase().indexOf(query) >= 0) {
				results[lgs[lg].lg] = lgs[lg];
			}
		}
		return _.values(results);
	},

	languageNameMarked: function() {
		var search = Template.instance().languageSearch.get();
		var name = this.name;
		if (search === '') return name;
		var match = name.match(new RegExp(search, 'i'));

		// To add markup we have to escape all the parts separately
		var marked;
		if (match) {
			var term = match[0];
			var parts = name.split(term);
			marked = _.map(parts, Blaze._escape).join('<strong>'+Blaze._escape(term)+'</strong>');
		} else {
			marked = Blaze._escape(name);
		}
		return Spacebars.SafeString(marked);
	},

	currentLanguage: function() {
		return this == lgs[Session.get('locale')];
	}
});

Template.languageSelection.events({
	'click .js-language-link': function(event, instance) {
		localStorage.setItem('locale', this.lg);
		Session.set('locale', this.lg);
		event.preventDefault();
		if (Meteor.user()){
			Meteor.call('updateUserLocale', this.lg);
		}
		instance.parentInstance().searchingLanguages.set(false);
	},

	'keyup .js-language-search': _.debounce(updateLanguageSearch, 100),

	'focus .js-language-search': function(event, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var screenMd = viewportWidth >= 768 && viewportWidth <= 992;
		if (screenMd) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 0);
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').hide();
		}
		instance.$('.dropdown-toggle').dropdown('toggle');
	},
});

Template.languageSelection.onRendered(function() {
	var parentInstance = this.parentInstance();
	parentInstance.$('.dropdown').on('hide.bs.dropdown', function(e) {
		var viewportWidth = Session.get('viewportWidth');
		var screenMd = viewportWidth >= 768 && viewportWidth <= 992;
		if (screenMd) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').show();
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 1);
		}
		parentInstance.searchingLanguages.set(false);
	});
});

// Always load english translation
// For dynamically constructed translation strings there is no default
// translation and meteor would show the translation key if there is no
// translation in the current locale
mfPkg.loadLangs('en');
