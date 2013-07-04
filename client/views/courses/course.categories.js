
/* ------------------------- Course-list ------------------------- 

  Template.categories.courses = function () {
    
    var results=Categories.find({}, {sort: {time_created: -1, name: 1}});
    for(m = 0; m < results.count(); m++){
   //  results.db_objects[m].createdby=display_username(results.db_objects[m].createdby);	 
    results.db_objects[m].time_created=format_date(results.db_objects[m].time_created);	    
   results.db_objects[m].subscriber_count=CourseSubscriptions.find({course_id: results.db_objects[m]._id}).count();	    
   //console.error(results.db_objects[m].organisator);
    }
    return results;
 //alert (results.toSource());
  //  return Courses.find({}, {sort: {score: -1, name: 1}});
 
  };



/* ------------------------- Course ------------------------- 

  Template.category.selected = function () {
    // bin ich der "selected_course", dann gib mir im html die class "selected"
    return Session.equals("selected_category", this._id) ? "selected" : '';
  };

  Template.category.hoveredString = function () {
    // bin ich der "hovered_course", dann gib mir im html die class "hovered"
    return Session.equals("hovered_category", this._id) ? "hovered" : '';
  };



/* ------------------------- Course anwählen-------------------------
  Template.category.events({
    'click': function () {
      // speichere in sesssetion, welcher kurs angeklickt wurde
      // um ihn per class "selected" im css gelb zu hinterlegen

      Router.setCategory( this._id, this.name);

    },
    'mouseenter': function () {
      // speichere in session, �ber welchem kurs der maus-cursor war
      // um ihn per class "hovered" im css fett zu machen
      Session.set("hovered_category", this._id);
    }
  });

  
  */


