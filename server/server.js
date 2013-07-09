

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
			'categories': ['Sport', 'Gspürschmi', 'TuetGuet'],
			'createdby':   'FeeLing',
			'description': 'Es wäre toll, regelmässig an einem Morgen zusammen zu Meditieren und Yoga/Qi-Gong zu machen. Mir selber fehlt die Selbstdisziplin und für Yoga/Qi-Gong auch das Knowhow, darum wäre eine kleine Gruppe toll. Ein extra Raum wäre toll, geht aber eigentlich überall.'
		},{
			'name':        'Aikido',
			'categories': ['Kampfkunst', 'Gschpürschmi'],
			'createdby':   'Kampfhippie',
			'description': 'Würde sehr gerne regelmässig Aikido trainieren. Wenn eine kleine Gruppe zustande käme, könnte ich sogar vielleicht einen Trainer und ein Dojo auftreiben. Finde Aikido eine der schönsten Kampfsportarten, weil sie versucht auf das Gegenüber einzugehen und den Konflikt zu lösen ohne den anderen Menschen zu zerstören. Youtube-Video Wikipedia-link'
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
			'name':        'unkommerzielle Commons-based peer production',
			'categories': ['Theorie', 'Projekt'],
			'createdby':   'Greendampf',
			'description': '"commons sind gemeinschaftlich getragene formelle oder informelle Governance-Systeme rund um kollektiv zu nutzende Ressourcen" [[http://commonsblog.wordpress.com/was-sind-commons/|Was sind Commons?]] Fände es interessant, das Thema der unkommerziellen //Commons-based peer production// zu besprechen und es am besten auch gerade mit einem praktischen Projekt (zB. Gemüsegarten) versuchen in einem etwas grösseren Rahmen umzusetzen. (Das wäre aber eine längerfristige, grössere und verpflichtendere Angelegenheit.)'
		},{
			'name':        'Web Design mit HTML und Phyton/PHP',
			'categories': ['Design', 'Computer'],
			'createdby':   'Seee',
			'description': 'Könnte gerne eine ganzheitliche Einführung in die Konzeption, die Gestaltung und die technische Realisierung einer einfachen Webseite anbieten. * Konzeption / Idee  * Usability  * Gestaltung mit Photoshop  * Clientseitige Programmierung mit HTML, CSS und JavaScript  * Serverseitige Programmierung mit PHP / Phyton  * Datenbank mit mySQL'
		},{
			'name':        'Elektronik',
			'categories': ['Elektronik'],
			'createdby':   'greg',
			'description': ' hoi tsäme!   ich würd mal gerne ein grundlagen von elektronik lernen… so n bisschen strom basteln kann ich (halt lampen und dimmer und so) und mir hats auch schon ein paar mal eins geputzt ;)   einen konkreten anlass gibts nicht, bin diesbezüglich detailthematisch offen…  hab zugang zu versch. räumen, wo genau müsst ich abklären wenn das ganze konkreter ist. nehm mir auch gerne zeit mitzuorganisiern, so ab jetzt bis ende sommer irgendwann (dann bin ich dann mal n bisschen weg).   hat wer bock? c u '
		},{
			'name':        'greg',
			'categories': ['Kunst'],
			'createdby':   'greg',
			'description': 'hab einiges an super-8-ghizzle das ich gar nicht brauch: kamera, projektor und so n fancy screen (siehe foto). falls jemand was deichseln will: ich, 25, gross, schlank, blond, schön, thurgauer dialekt, freu mich auf dein interesse!'
		},{
			'name':        'Ubuntu auf Mac (dual-Boot)',
			'categories': [],
			'createdby':   'greg',
			'description': 'Ich will ubuntu auf meinem mac ohne auf os zu verzichten. habs probiert abr s hat nicht geklappt und die technik-kacke interessiert mich nicht soooooo derart unglaublich. gibts wer, der mir und andern mit dem selben problem frontalunterrichtsmässig hilft? so im allgemeinen welt-rettungsplan? ich rett die welt dafür n ander mal. von mir aus morgen abend, in meiner küche hats platz für 4 people (wenn sie cool sind, sonst für 5).      --> Wieso gibts keine Komputer-Kategorie?????'
		},{
			'name':        'Kleiderflick Nachmittag',
			'categories': ['DIY', 'Kleider', 'Handwerk'],
			'createdby':   'Sandro',
			'description': ' Habe eine Kiste voll mit Kleider, an denen ich (bei den meisten schon seit längerem) etwas flicken müsste: Reisverschlüsse grosse Risse, Löcher und so.   Zusammen macht das irrgendwie mehr Spass und eine fachkundige Hilfe währe natürlich auch nicht schlecht, wenn man bedenkt das die Flicke auch ein bisschen halten sollen. '
		},{
			'name':        'Walliserdütsch lernen',
			'categories': ['Sprache'],
			'createdby':   'LeOnI',
			'description': 'Unter fachkundiger Leitung die Walliser Sprche verstehen und auch sprechen lernen.      Ich würde voll gerne die eigene Melodie, die spezielle Betonung, die struben Endungen und Wendungen und natürlich die wichtigsten „spezialbegriffe“ vom Walliserdeutsch lernen. à la mbrüf …. di zwee schönschte schwarznaase nou! .. chüm Üeli.    Hörspiele oder Filme währen natürlich gute Grundlage youtube-link '
		},{
			'name':        'Cyrypto Party',
			'categories': ['IT', 'Computer', 'Überwachung', 'Privacy'],
			'createdby':   'Mike_85',
			'description': 'Ein paar Leute veranstalten am Freitag 28.09. Eine Crypto-Party. Da wird gelernt, ausprobiert und Bier getrunken. Onion-/DarkNet, Email verschlüsselung mit PGP, Browsereinstellungen für sichereres Surfen, VPN, Proxi,                     Es Sollte für alle etwas dabei sein, für den noob bis zum nerd. Die die können und wollen, werden sich gegenseitig und Allen Themen Vorstellen '
		},{
			'name':        'Open Lab',
			'categories': ['DIY', 'Elektronik', 'Computer'],
			'createdby':   'Mike_85',
			'description': ' Wöchentlich, jeden Dienstag Abend: DIY - Löten, Häcken, Basteln, Programmieren. Im Lab der SGMK Ohne Leitung, respektive unter eigener Leitung. Umkostenbeitrag Freiwilig / Materialgeld…      link Openlab, link SGMK'
		},{
			'name':        'Deutschkurse',
			'categories': ['Sprache'],
			'createdby':   'ASZ - Bildung für alle',
			'description': 'Doitsh yezd!'
		},{
			'name':        'Deutschkurs',
			'categories': ['Deutsch', 'Aussländer_in', 'Immigrant_in'],
			'createdby':   'IvanZ',
			'description': 'Würdich gerne auch Deutsch lernen, findich super.'
		},{
			'name':        'Deutsch',
			'categories': ['Lernen', 'Kurs', 'Workshop', 'Untericht', 'Fremdsprache'],
			'createdby':   'Lucy',
			'description': ''
		},{
			'name':        'German',
			'categories': ['Langage', 'Switzerland'],
			'createdby':   'IvanZ',
			'description': 'Who else would be interested in an independent workshop, with no mentor. Just lerning a language and all arround it'
		},{
			'name':        'Sprachaustasch',
			'categories': ['Sprachen', 'Austausch', 'Treff'],
			'createdby':   'IvanZ',
			'description': 'Wöchentliches treffen und wild sprachen und verschiedenste Kultur austauschen    Weekly meeting and wiledly exchange language and different Culture       Rencontre hebdomadaire et parlé sauvagement, et de remplacer diverses activités culturelles   una réunione par semana per excambiare la lingua et cultura      Se reúnem semanalmente e falou descontroladamente, e substituir vários cultural'
		},{
			'name':        'Jodeln',
			'categories': ['Musik', 'Jodeln'],
			'createdby':   'Sandra',
			'description': 'Wer will auch Jodeln (lernen) ? Nicht so spiessig wie beim Jodelverein. Wenn möglich unter profesioneller Leitung vielleicht auch, wenn sich niemand finden lässt, in gruppe ein paar lieder einstudieren, vielleicht auch entfremden… villeicht auch aufführen :) '
		},{
			'name':        'Demo-Sani und Erste-Hilfe',
			'categories': ['Medizin', 'Nothelfer'],
			'createdby':   'OliviaTheMan!!!Yeah <!-- Hack -->',
			'description': 'Ist etwas, was man eigentlich mindestens jährlich auffrischen müsste nicht? bei mir ist es schon ca 5 Jahre her und ich weiss entsprechend nicht mehr viel.'
		},{
			'name':        'Meteor.js Workshop',
			'categories': ['Meteor.js', 'Coden'],
			'createdby':   'HackerOne',
			'description': 'Wer ist dabei?'
		},{
			'name':        'Sprayen Gehen',
			'categories': ['Graffiti', 'Writing your name'],
			'createdby':   'Fuck The Police',
			'description': 'Lass uns mal so richtig die Sau rauslassen. Ich zeig allen wies geht, nehmt dosen mit.'
		},{
			'name':        '',
			'categories': ['', ''],
			'createdby':   '',
			'description': ''
	}]

	_.each(testcourses, function(course) {
		if (!course.createdby) return; // Don't create courses that don't have an creator name
		
		// allways use same id for same course to avoid broken urls while testing
		var crypto = Npm.require('crypto'), m5 = crypto.createHash('md5');
		m5.update(course.name);
		m5.update(course.description);
		course._id = m5.digest('hex').substring(0, 8)
		
		for (var i=0; i < course.categories.length; i++) {
			course.categories[i] = ensureCategory(course.categories[i])._id
		}
		course.createdby = ensureUser(course.createdby)._id
		course.score = Math.floor(Random.fraction()*Random.fraction()*30)
		course.subscribers_min = Math.floor(Random.fraction()*Random.fraction()*30)
		course.subscribers_max = course.subscribers_min + Math.floor(Random.fraction()*20)
		course.subscribers = []
		course.time_created = new Date(new Date().getTime()-Math.floor(Random.fraction()*40000000000))
		Courses.insert(course)
	})
}



