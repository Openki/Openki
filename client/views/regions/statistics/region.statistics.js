Router.map(function () {
	this.route('regionStatistics', {
		path: 'region/:_id',
		template: 'regionStatistics',
		waitOn: function () {
			var instance = this;
			var regionId = instance.params._id;
			return [
				instance.subscribe('regions'),
				instance.subscribe('coursesFind', { region: regionId }),
				instance.subscribe('venuesFind', { region: regionId }),
			];
		},
		data: function() {
			var instance = this;
			var regionId = instance.params._id;
			var region = Regions.findOne({_id: regionId});
			// if(typeof region == 'undefined'){
			// 	region = Regions.findOne({name: this.params._id})
			// }

			var courses = Courses.find({region: regionId});
			var proposals = [];
			var allGroups = [];

			courses.forEach(function (course) {
				// console.log(course);
				if(course.futureEvents == 0 && (course.lastEvent) == null) {
					proposals.push(course);
				}

				// save all groups (Id) of the course and count their courses
				for(var i = 0; i < course.groups.length; i++){
					var idToCheck = course.groups[i];
					var arrayIndexOfGroup = _.indexOf(allGroups, {groupId: idToCheck});

					console.log(idToCheck);
					console.log(arrayIndexOfGroup);

					if( arrayIndexOfGroup == -1) {
						var group = {
							groupId : course.groups[i],
							groupWeight : 1
						}
						allGroups.push(group);
					} else {
						allGroups[arrayIndexOfGroup].groupWeight++;
					}
				}
			});
			console.log(allGroups);
			return {
				'region': region,
				'venues': venuesFind({region: regionId}),
				'proposalsCount' : proposals.length,
				'groupsCount' : allGroups.length
			};
		},
	});
});
Template.regionStatistics.helpers({
	regionName: function() {
		return Template.instance().data.region.name;
	},
	courseCount: function() {
		return Template.instance().data.region.courseCount;
	},
	futureEventCount:function() {
		return Template.instance().data.region.futureEventCount;
	},
	proposalsCount: function() {
		return Template.instance().data.proposalsCount;
	},
	venuesCount: function() {
		return Template.instance().data.venues.count();
	}
});