/* ------------------------- Details ------------------------- */

  Template.details.isEditing = function () {
    return Session.get("isEditing");
  };

  Template.details.events({
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
  if(Meteor.userId())
    Session.set("isEditing", true);
  else
    alert("Security robot say: sign in");
    },
    'click input.save': function () {
      // wenn im edit-mode abgespeichert wird, update db und verlasse den edit-mode
      Courses.update(Session.get("selected_course"), {$set: {description: document.getElementById('editform_description').value, tags: document.getElementById('editform_tags').value}});
      Session.set("isEditing", false);
    }
  });

  Template.details.selected_name = function () {
    // gib den name und die description des ausgew�hlten kurses zur�ck
    var course = Courses.findOne(Session.get("selected_course"));
    return course && {name: course.name, desc: course.description, tags: course.tags};
  };


