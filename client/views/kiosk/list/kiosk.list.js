Template.kioskEventList.onCreated(function() {
	var isOngoing = this.data.timePeriod == "ongoing";
	this.hasDescription = !isOngoing;
});
