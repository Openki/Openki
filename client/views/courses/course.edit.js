Template.course_edit.available_categories = function() {
	return Categories.find()
}

Template.course_edit.checked = function(cats) {
	return cats.indexOf(this._id) >= 0 ? 'checked' : ''
}


Template.course_edit.events({
    'click input.save': function () {
      // wenn im edit-mode abgespeichert wird, update db und verlasse den edit-mode
      Courses.update(Session.get("selected_course"), {$set: {description: $('#editform_description').val(), categories: $('#editform_categories input:checked').map(function(){ return this.name}).get(), name: $('#editform_name').val(), subscribers_min: $('#editform_subscr_min').val(), subscribers_max: $('#editform_subscr_max').val()}});
      Session.set("isEditing", false);
    },
    'click input.cancel': function() {
      Session.set("isEditing", false);
    }
});
