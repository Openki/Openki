

Meteor.startup(function () {
 createCategoriesIfNone();
 createCoursesIfNone();
});

 
Meteor.methods({
    insert_userdata: function(username, email, password){
        Accounts.createUser({username:username, email:email, password:password});
    },
    update_userdata: function(username,email) {
        Meteor.users.update(Meteor.userId(), {
            $set: {
                username: username,
                 emails: [{
                    address: email,
                    verified: false
                }]
            }
        });
     },
    update_userpassword: function(new_password) {
        Accounts.setPassword(Meteor.userId(), new_password)
     }
});


function createCoursesIfNone(){
    // erstelle neue Kurse, wenns keine in der DB hat
 if (Courses.find().count() === 0) {
        createCourses();
  }
}

function createCategoriesIfNone(){
    // das gleiche für Kategorien
 if (Categories.find().count() === 0) {
        createCategories();
  }
}


function createCategories() {
    var names = ["Nerdy Courses",
        "Tesla Shit",
        "Walter",
        "Standard"];
    
    for (var i = 0; i < names.length; i++)
        Categories.insert({name: names[i]});
}

function get_category_id(index) {
        var category_by_name = Categories.find().fetch();
        return category_by_name[index]._id;
    }

function createCourses(){
    // erstelle ein String-Array f�r die Namen der Kurse
    var names = ["ASZ Geek-Noob-Nerd Treffen",
                 "Deutschkurs",
                 "Photoshop für Fortgeschrittene",
                 "Onanie",
                 "Nikola Tesla - Ein Leben in Einsamkeit",
                 "Unbenannter Kurs"];

    //erstelle ein String-Array f�r die Kursbeschreibungen
    var description = ["ein treffen für alle die sich für technologie und so interessieren",
                 "German: Ja, Nein, Vielleicht, Gut gut.",
                 "How to put the Bling-Effect.",
                 "DIY or DIE!",
                 "Wir werden einen Text über Nikola Teslas Kindheit lesen, anhand dessen wir sein Werk in in einen Historischen Kontext zu stellen versuchen.",
                 "Bitte hier Kursbeschreibung eintragen"];
    
    

    var categories = [get_category_id(0),
                get_category_id(2),
                get_category_id(0),
                get_category_id(0),
                get_category_id(1),
                get_category_id(2)]; 

    // erstelle so viele Kurse, wie der Namens-Array lang ist
    for (var i = 0; i < names.length; i++)
      Courses.insert({name: names[i], createdby: "ov8zqBLipEQma5DLy", time_created: 1372810780636, time_changed: 1372810780636, categories: categories[i], description: description[i], score: Math.floor(Random.fraction()*10)*5, subscribers_min: 2, subscribers_max: 8, subscribers:[]});
}



