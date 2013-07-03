/* ------------------------- Details ------------------------- */

  Template.coursedetails.isEditing = function () {
    return Session.get("isEditing");
  };

  Template.coursedetails.events({
    'click input.inc': function () {
      // bei click auf das input-element mit der class "inc",
      // erh�he den score dieses Kurses um eins
      Courses.update(Session.get("selected_course"), {$inc: {score: 1}});
    },
    'click input.del': function () {
      // bei click auf das input-element mit der class "del"
      // l�sche den ausgew�hlten kurs
      Courses.remove(Session.get("selected_course"));
      // select new cours:
      Session.set("selected_course", Courses.find().fetch()[0]._id); //select first of db
      // erstelle neue, wenns keine mehr gibt:
      createCoursesIfNone();
     },
    'click input.edit': function () {
      // gehe in den edit-mode, siehe html
 // if(Meteor.userId())
    Session.set("isEditing", true);
  //else
    //alert("Security robot say: sign in");
    },
    'click input.save': function () {
      // wenn im edit-mode abgespeichert wird, update db und verlasse den edit-mode
      Courses.update(Session.get("selected_course"), {$set: {description: $('#editform_description').val(), tags: $('#editform_tags').val()}});
      Session.set("isEditing", false);
    }
  });

  Template.coursedetails.selected_name = function () {
    // gib den name und die description des ausgew�hlten kurses zur�ck
    // wird aufgerufen, sobald "selected_course" ändert (z.B. routing)
    var course = Courses.findOne(Session.get("selected_course"));
    return course && {name: course.name, desc: course.description, tags: course.tags, score: course.score};
  };
  
  
