

Meteor.startup(function () {
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


/* TESTING: Get user object for name and create it if it doesn't exist */
function ensureUser(name) {
		var user_prototype = {username: name}
		var user
		while (!(user = Meteor.users.findOne(user_prototype))) { // Legit
			Accounts.createUser({username: name, email: (name+"@schuel.example").toLowerCase(), password: name});
		}
        return user;
}

/* TESTING: Get category object for name and create it if it doesn't exist */
function ensureCategory(name) {
		var category_prototype = {name: name}
		var category
		while (!(category = Categories.findOne(category_prototype))) { // Legit
			Categories.insert(category_prototype)
		}
        return category;
}


function createCourses(){
	var testcourses = [{
			'name':        'Meditation & Yoga/Qi-Gong',
			'categories': ['Sport', 'Gspürschmi'],
			'createdby':   'FeeLing',
			'description': 'Es wäre toll, regelmässig an einem Morgen zusammen zu Meditieren und Yoga/Qi-Gong zu machen. Mir selber fehlt die Selbstdisziplin und für Yoga/Qi-Gong auch das Knowhow, darum wäre eine kleine Gruppe toll. Ein extra Raum wäre toll, geht aber eigentlich überall.'
		},{
			'name':        'Aikido',
			'categories': ['Sport', 'Kampfkunst'],
			'createdby':   'Kampfhippie',
			'description': 'Würde sehr gerne regelmässig Aikido trainieren. Wenn eine kleine Gruppe zustande käme, könnte ich sogar vielleicht einen Trainer und ein Dojo auftreiben. Finde Aikido eine der schönsten Kampfsportarten, weil sie versucht auf das Gegenüber einzugehen und den Konflikt zu lösen ohne den anderen Menschen zu zerstören. Youtube-Video Wikipedia'
		},{
			'name':        'Garten',
			'categories': ['Garten', 'Biologie'],
			'createdby':   'Greendampf',
			'description': 'Regelmässig zusammen gärtnern und miteinander Knowhow, Infrastruktur, Beziehungen, Samen, Planzen austauschen. Verschiedene schon existierende freie Gärten unterstützen, die Nahrungs- und Heilmittel produzieren. Hätte Zugang zu 2-3 Gärten, die noch Kapazität für motivierte Gärtner hätten.'
		},{
			'name':        'Game Design mit Unity',
			'categories': ['Design', 'Computer'],
			'createdby':   'Seee',
			'description': 'Könnte gerne eine ganzheitliche Einführung in die Konzeption, die Gestaltung und die technische Realisierung eines Games anbieten. Der Kurs würde einen Bogen spannen von der Ideenentwickling hin zum Spielmechanik-Entwerfen bis zur Realisierung eines spielbaren Games und eine einfache Einführung in folgende Disziplinen beinhalten: * Spieltheorie * Spielidee * Spielmechanik * Storytelling * Concept Art * Charakterentwicklung * Zeichnen und Bildbearbeitung mit Photoshop * Usability * Prototyping und Gamedesign mit Unity Gameengine * Leveldesign * 3D-Modelling und -Animation mit Blender * Programmieren mit JavaScript und C-Sharp * Sound-Design mit Audacity * Polishing '
		},{
			'name':        '',
			'categories': ['', ''],
			'createdby':   '',
			'description': ''
	}]
	
	_.each(testcourses, function(course) {
		if (!course.createdby) return; // Don't create courses that don't have an creator name
		for (var i=0; i < course.categories.length; i++) {
			course.categories[i] = ensureCategory(course.categories[i])._id
		}
		course.createdby = ensureUser(course.createdby)._id
		course.score = Math.floor(Random.fraction()*20)
		course.subscribers_min= Math.floor(Random.fraction()*5)
		course.subscribers_max= course.subscribers_min + Math.floor(Random.fraction()*20)
		course.subscribers = []
		course.time_created = 1372810780636
		course.time_changed = 1372810780636
		Courses.insert(course)
	})
}



