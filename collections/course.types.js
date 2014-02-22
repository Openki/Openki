// ======== DB-Model: ========
// "_id" -> ID
// "name" -> string
// "NeedsMentor" -> boolean
// ===========================



CourseTypes = new Meteor.Collection("CourseTypes");

CourseTypes.allow({
	update: function (userId, doc, fieldNames, modifier) {
		return userId && true;   // allow only if UserId is present
	},
	insert: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
	remove: function (userId, doc) {
		return userId && true;   // allow only if UserId is present
	},
});


var courseTypes = [{
		'name':        'Lecture',  // Frontal, talk, presentation, ex-cathedra teaching
		'NeedsMentor': true,
		'_id':         ''
	},{
		'name':        'Workshop', // teach and learn together, some have more experience
		'NeedsMentor': true,
		'_id':         ''
	},{
		'name':        'Group',    // self, no mentor needed  (Lerning- Reading- Discussion-Group)
		'NeedsMentor': false,
		'_id':         ''
	},{
		'name':        'Project',  // roles should be generic (like: actors, cook, autor, specialist )
		'_id':         ''
	},{
		'name':        'Other',    // exkursion, experimental,
		'_id':         ''
	}
]

Meteor.startup(function () {
	if (Meteor.isServer && CourseTypes.find().count() == 0) {
		_.each(courseTypes, function(courseType){
			CourseTypes.insert(courseTypes)
		})
	}
});
