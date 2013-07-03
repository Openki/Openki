
/* ------------------------- Course-list ------------------------- */

  Template.courselist.courses = function () {
    // gib alle kurse zur�ck, zuerst umgekehrt nach score sortiert und
    // dann nach name sortiert.
    
    var results=Courses.find({}, {sort: {score: -1, name: 1}});
    for(m = 0; m < results.count(); m++){
     results.db_objects[m].createdby=display_username(results.db_objects[m].createdby);	 
     results.db_objects[m].time_created=format_date(results.db_objects[m].time_created);	    
    }
    return results;
 //alert (results.toSource());
  //  return Courses.find({}, {sort: {score: -1, name: 1}});
 
  };



/* ------------------------- Course ------------------------- */

  Template.course.selected = function () {
    // bin ich der "selected_course", dann gib mir im html die class "selected"
    return Session.equals("selected_course", this._id) ? "selected" : '';
  };

  Template.course.hoveredString = function () {
    // bin ich der "hovered_course", dann gib mir im html die class "hovered"
    return Session.equals("hovered_course", this._id) ? "hovered" : '';
  };



/* ------------------------- Course anwählen-------------------------*/
  Template.course.events({
    'click': function () {
      // speichere in sesssetion, welcher kurs angeklickt wurde
      // um ihn per class "selected" im css gelb zu hinterlegen

      Router.setCourse( this._id);

    },
    'mouseenter': function () {
      // speichere in session, �ber welchem kurs der maus-cursor war
      // um ihn per class "hovered" im css fett zu machen
      Session.set("hovered_course", this._id);
    }
  });



