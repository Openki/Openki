
  Template.course_create.categories = function () {
      var categories = Categories.find();
    return categories;
};

  Template.categorylist.categories = function () {
      var categories = Categories.find();
    return categories;
};

  Template.category.courses_by_category = function () {
      
      var courses_by_category = Courses.find({categories: this._id});
      return courses_by_category;
  };


Template.course_category.events({
    'click input.add': function () {

      // add new course to db


  if(!Meteor.userId()){
    alert("to create a new category, please log in");
          return; // <-- (gruusig... bricht funktion ab) not nice, just ends the function - marcel
      }
      if ($("#addform_name").val()==""){
          // wenn kein kurs name angegeben ist, warne und poste nichts in db
          alert("Please write something and think twice");      }else{
     
          // sonst poste in db und cleare die inputfelder
          Categories.insert({name: $("#addform_name").val(), time_created: get_timestamp(), time_changed: get_timestamp(), createdby:Meteor.userId()});
        $("#addform_name").val(""); 
      }
    }
  });


/*
get_categorylist=function(){
  //return a course list
  var results=Categories.find({}, {sort: {name: 1}});
  
  // modify/format result list -----------------
     for(m = 0; m < results.count(); m++){
           
           category=results.db_objects[m];
    
     }
    return results;
  
}

/*

Template.course_create.categories = function () {
  // needed to actualize courses
   return get_categorylist();
  };


  Template.course_create.categories = function () {
  // needed to actualize courses
   return this.categories;
  };

*/

  // Template handlers ---------------






/* ------------------------- List types / Templates ------------------------- 

  Template.courselist.courses = function () {
  // needed to actualize courses
   return this.courses;
  };
  
  // Template handlers ---------------

  Template.coursepage.all_courses = function () {
      var return_object={};
      return_object.courses= get_courselist({});
      return return_object;
  };




/* ------------------------- Course-list ------------------------- 

  Template.course_create.categories = function () {
    
    var results=Categories.find({}, {sort: {name: 1}});
    for(m = 0; m < results.count(); m++){
        category=results.db_objects[m];
    }
    return results;
 
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


