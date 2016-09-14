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
		return Languages[Session.get('locale')];
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

Template.languageSelection.helpers({
	setLanguage: function() {
		return Languages[Session.get('locale')];
	},

	languages: function() {
		var search = Template.instance().languageSearch.get();
		var query = search.toLowerCase();

		var results = {};
		for (var language in Languages) {
			if (Languages[language].name.toLowerCase().indexOf(query) >= 0) {
				results[Languages[language].lg] = Languages[language];
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
		return this == Languages[Session.get('locale')];
	}
});

var updateLanguageSearch = _.debounce(function(instance) {
	var search = instance.$('.js-language-search').val();
	search = String(search).trim();
	instance.languageSearch.set(search);
}, 100);

Template.languageSelection.events({
	'click .js-language-link': function(event, instance) {
		event.preventDefault();
		var lg = this.lg;

		localStorage.setItem('locale', lg);
		Session.set('locale', lg);
		if (Meteor.user()){
			Meteor.call('updateUserLocale', lg);
		}
		instance.parentInstance().searchingLanguages.set(false);
	},

	'keyup .js-language-search': function(event, instance) {
			if (event.which === 13) {
				instance.$('.js-language-link').first().click();
			} else {
				updateLanguageSearch(instance);
			}
	},

	'focus .js-language-search': function(event, instance) {
		var viewportWidth = Session.get('viewportWidth');
		var screenMd = viewportWidth >= 768 && viewportWidth <= 992;
		if (screenMd && !Session.get('isRetina')) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 0);
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').hide();
		}

		var screenSm = viewportWidth <= 768;
		if (!screenSm) {
			instance.$('.dropdown').on('show.bs.dropdown', function(e){
				$(this).find('.dropdown-menu').first().stop(true, true).slideDown();
			});
		}

		instance.$('.dropdown-toggle').dropdown('toggle');
	},
});

Template.languageSelection.onRendered(function() {
	var parentInstance = this.parentInstance();
	parentInstance.$('.dropdown').on('hide.bs.dropdown', function(e) {
		var viewportWidth = Session.get('viewportWidth');
		var screenMd = viewportWidth >= 768 && viewportWidth <= 992;
		if (screenMd && !Session.get('isRetina')) {
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').show();
			$('.navbar-collapse > .nav:first-child > li:not(.navbar-link-active)').fadeTo("slow", 1);
		}
		parentInstance.searchingLanguages.set(false);
	});
});
