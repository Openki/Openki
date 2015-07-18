Template.coursehistory.events({
    "mouseover .coursehistory-event": function(event, template){
         $("." + this._id).addClass('active');
    },
    "mouseout .coursehistory-event": function(event, template){
         $("." + this._id).removeClass('active');
    }
});
