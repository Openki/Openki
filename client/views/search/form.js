Template.search_form.events({
	'keyup input': function (event) {
		Session.set('search', event.currentTarget.value)
	}
})
