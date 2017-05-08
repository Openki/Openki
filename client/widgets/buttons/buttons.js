var templates =
	[ Template.buttonSave
	, Template.buttonCancel
	, Template.buttonEdit
	, Template.buttonDelete
	, Template.buttonDeleteConfirm
	];

_.each(templates, function(template) {
	TemplateMixins.Busy(template);
});
