Template.search_form.events({
	'keyup input': function (event) {
		Session.set('search', event.currentTarget.value)
	},
	'submit': function(event){
		console.log(event)
		event.preventDefault()
		Router.go('proposeCourse')
	}
})

Template.search_form.rendered = function () {
 $(".searchform").focus();
}

