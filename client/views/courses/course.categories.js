
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



  Template.course_by_category.events({
    'click': function () {
         
      Router.setCourse( this._id, this.name);

    }
  });