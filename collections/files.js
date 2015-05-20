var fileStore = new FS.Store.GridFS("files");

Files = new FS.Collection("files", {
	stores: [fileStore]
});

Files.deny({
	insert: function(){
		return false;
	},
	update: function(){
		return false;
	},
	remove: function(){
		return false;
	},
	download: function(){
		return false;
	}
 });

Files.allow({
	insert: function(userId) {
		return privileged(userId, 'upload');
	},
	update: function(userId) {
		return privileged(userId, 'upload');
	},
	remove: function(userId) {
		return privileged(userId, 'upload');
	},
	download: function(){
		return true;
	}
});