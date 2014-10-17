testcourses = [{
	'name':        'Meditation & Yoga/Qi-Gong',
	'categories': ['Sport / Bewegung'],
	'tags':       ['Sport', 'Gspürschmi', 'TuetGuet'],
	'createdby':   'FeeLing',
	'description': 'Es wäre toll, regelmässig an einem Morgen zusammen zu Meditieren und Yoga/Qi-Gong zu machen. Mir selber fehlt die Selbstdisziplin und für Yoga/Qi-Gong auch das Knowhow, darum wäre eine kleine Gruppe toll. Ein extra Raum wäre toll, geht aber eigentlich überall.',
	'roles':      ['team', 'participant', 'host'],
	'members':    [
		{'user':'FeeLing', 'roles': ['team','participant']},
		{'user':'Crosle', 'roles': ['participant']}
	]

/* should maybe become:

	'roles':      ['team', 'participant', 'host']
	'subscribed': [
		{'user':'FeeLing', 'roles': ['team', 'participant']},
		{'user':'Chrosle', 'roles': ['participant']}
	]

template:

	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']}
	]

*/

},{
	'name':        'Aikido',
	'categories': ['Kampfsport/-kunst'],
	'tags':       ['Kampfsport', 'Gschpürschmi'],
	'createdby':   'Kampfhippie',
	'description': 'Würde sehr gerne regelmässig Aikido trainieren. Wenn eine kleine Gruppe zustande käme, könnte ich sogar vielleicht einen Trainer und ein Dojo auftreiben. Finde Aikido eine der schönsten Kampfsportarten, weil sie versucht auf das Gegenüber einzugehen und den Konflikt zu lösen ohne den anderen Menschen zu zerstören. Youtube-Video Wikipedia-link',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Kampfhippie', 'roles': ['participant']},
		{'user':'Seee', 'roles': ['participant']},
		{'user':'Chnöde', 'roles': ['participant']}
	],
	region: 'Testistan',

},{
	'name':        'Garten',
	'categories': ['Garten / Landwirtschaft', 'Biologie'],
	'tags':       ['Garten', 'Pflanzen'],
	'createdby':   'Greendampf',
	'description': 'Regelmässig zusammen gärtnern und miteinander Knowhow, Infrastruktur, Beziehungen, Samen, Pflanzen austauschen. Verschiedene schon existierende freie Gärten unterstützen, die Nahrungs- und Heilmittel produzieren. Hätte Zugang zu 2-3 Gärten, die noch Kapazität für motivierte Gärtner hätten.',
	'roles':      ['team', 'participant', 'host'],
	'members': [
		{'user':'Greendampf', 'roles': ['participant','team', 'host']},
		{'user':'Sandro', 'roles': ['participant','team']},
		{'user':'Schufi', 'roles': ['participant']},
		{'user':'Kampfhippie', 'roles': ['participant']},
		{'user':'LeOnI', 'roles': ['participant']},
		{'user':'IvanZ', 'roles': ['participant']},
		{'user':'WAvegetarian', 'roles': ['participant']}
]
},{
	'name':        'Game Design mit Unity',
	'categories': ['Programmieren'],
	'tags':       ['Design', 'Computer'],
	'createdby':   'Seee',
	'description': 'Könnte gerne eine ganzheitliche Einführung in die Konzeption, die Gestaltung und die technische Realisierung eines Games anbieten. Der Kurs würde einen Bogen spannen von der Ideenentwickling hin zum Spielmechanik-Entwerfen bis zur Realisierung eines spielbaren Games und eine einfache Einführung in folgende Disziplinen beinhalten: * Spieltheorie * Spielidee * Spielmechanik * Storytelling * Concept Art * Charakterentwicklung * Zeichnen und Bildbearbeitung mit Photoshop * Usability * Prototyping und Gamedesign mit Unity Gameengine * Leveldesign * 3D-Modelling und -Animation mit Blender * Programmieren mit JavaScript und C-Sharp * Sound-Design mit Audacity * Polishing ',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Seee', 'roles': ['team','mentor']}
]
},{
	'name':        'unkommerzielle Commons-based peer production',
	'categories': ['Garten / Landwirtschaft'],
	'tags':       ['Theorie', 'Projekt'],
	'createdby':   'Greendampf',
	'description': '"commons sind gemeinschaftlich getragene formelle oder informelle Governance-Systeme rund um kollektiv zu nutzende Ressourcen" [[http://commonsblog.wordpress.com/was-sind-commons/|Was sind Commons?]] Fände es interessant, das Thema der unkommerziellen //Commons-based peer production// zu besprechen und es am besten auch gerade mit einem praktischen Projekt (zB. Gemüsegarten) versuchen in einem etwas grösseren Rahmen umzusetzen. (Das wäre aber eine längerfristige, grössere und verpflichtendere Angelegenheit.)',
	'roles':      ['team', 'participant'],
	'members': [
		{'user':'Greendampf', 'roles': ['participant']}
	]
},{
	'name':        'Web Design mit HTML und Phyton/PHP',
	'categories': ['Programmieren','Internet'],
	'tags':       ['Design', 'Computer'],
	'createdby':   'Seee',
	'description': 'Könnte gerne eine ganzheitliche Einführung in die Konzeption, die Gestaltung und die technische Realisierung einer einfachen Webseite anbieten. * Konzeption / Idee  * Usability  * Gestaltung mit Photoshop  * Clientseitige Programmierung mit HTML, CSS und JavaScript  * Serverseitige Programmierung mit PHP / Phyton  * Datenbank mit mySQL',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Seee', 'roles': ['team', 'mentor']},
		{'user':'Greendampf', 'roles': ['participant']},
		{'user':'Sandro', 'roles': ['participant']},
		{'user':'IvanZ', 'roles': ['participant']},
		{'user':'greg', 'roles': ['host']}
	]
},{
	'name':        'Elektronik',
	'categories': ['Elektronik / Strom'],
	'tags':       ['Elektronik'],
	'createdby':   'greg',
	'description': ' hoi tsäme!   ich würd mal gerne ein grundlagen von elektronik lernen… so n bisschen strom basteln kann ich (halt lampen und dimmer und so) und mir hats auch schon ein paar mal eins geputzt ;)   einen konkreten anlass gibts nicht, bin diesbezüglich detailthematisch offen…  hab zugang zu versch. räumen, wo genau müsst ich abklären wenn das ganze konkreter ist. nehm mir auch gerne zeit mitzuorganisiern, so ab jetzt bis ende sommer irgendwann (dann bin ich dann mal n bisschen weg).   hat wer bock? c u ',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'greg', 'roles': ['host','team']},
		{'user':'LeOnI', 'roles': ['participant']},
		{'user':'IvanZ', 'roles': ['participant']},
		{'user':'Barbie92', 'roles': ['participant']}
	]
},{
	'name':        'Super 8',
	'categories': ['Kunst'],
	'tags':       ['Kunst'],
	'createdby':   'greg',
	'flaged':     ['suspicious'],
	'description': 'hab einiges an super-8-ghizzle das ich gar nicht brauch: kamera, projektor und so n fancy screen (siehe foto). falls jemand was deichseln will'/*: ich, 25, gross, schlank, blond, schön, thurgauer dialekt, freu mich auf dein interesse!'*/,
	'roles':      ['team', 'participant', 'host'],
	'members': [
		{'user':'greg', 'roles': ['team','host']},
		{'user':'LeOnI', 'roles': ['participant']},
		{'user':'IvanZ', 'roles': ['participant']}
	]
},{
	'name':        'Ubuntu auf Mac (dual-Boot)',
	'categories': ['Softwarebedienung'],
	'tags':       [],
	'createdby':   'greg',
	'description': 'Ich will ubuntu auf meinem mac ohne auf os zu verzichten. habs probiert abr s hat nicht geklappt und die technik-kacke interessiert mich nicht soooooo derart unglaublich. gibts wer, der mir und andern mit dem selben problem frontalunterrichtsmässig hilft? so im allgemeinen welt-rettungsplan? ich rett die welt dafür n ander mal. von mir aus morgen abend, in meiner küche hats platz für 4 people (wenn sie cool sind, sonst für 5).'   /*   --> Wieso gibts keine Komputer-Kategorie????? */,
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'greg', 'roles': ['participant','team','host']},
		{'user':'Mike_85', 'roles': ['participant']},
		{'user':'IvanZ', 'roles': ['participant']}
	]
},{
	'name':        'Kleiderflick Nachmittag',
	'categories': ['Design','Handwerk'],
	'tags':       ['DIY', 'Kleider', 'Handwerk'],
	'createdby':   'Sandro',
	'description': ' Habe eine Kiste voll mit Kleider, an denen ich (bei den meisten schon seit längerem) etwas flicken müsste: Reisverschlüsse grosse Risse, Löcher und so.   Zusammen macht das irrgendwie mehr Spass und eine fachkundige Hilfe währe natürlich auch nicht schlecht, wenn man bedenkt das die Flicke auch ein bisschen halten sollen.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Sandro', 'roles': ['team','host']},
	]
},{
	'name':        'Walliserdütsch lernen',
	'categories': ['Sprache'],
	'tags':       ['Dialekt','Wallis'],
	'createdby':   'LeOnI',
	'description': 'Unter fachkundiger Leitung die Walliser Sprche verstehen und auch sprechen lernen.      Ich würde voll gerne die eigene Melodie, die spezielle Betonung, die struben Endungen und Wendungen und natürlich die wichtigsten „spezialbegriffe“ vom Walliserdeutsch lernen. à la mbrüf …. di zwee schönschte schwarznaase nou! .. chüm Üeli.    Hörspiele oder Filme währen natürlich gute Grundlage youtube-link ',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'LeOnI', 'roles': ['team']},
		{'user':'WAvegetarian', 'roles': ['participant','team']},
		{'user':'Sandro', 'roles': ['host']}
	]
},{
	'name':        'Bier brauen',
	'tags': ['Bier'],
	'categories': ['Kultur'],
	'createdby':   'Gähri',
	'description': 'Gutes Bier brauen isch ganz einfach! Ich zeig euch, wie ihr in der eigenen Badewanne feines Bier braut! Wir brauchen nur ein paar Zutaten, und schon gärt\'s von allein zu nem Hopfigen!! Ein super Hobby dsa nicht nur Abwechslung vom Einheitsbräu bietet, sondern auch noch gesund ist!',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Gähri', 'roles': ['team','mentor']},
		{'user':'Lavenia Lastrapes', 'roles': ['participant']},
		{'user':'Greendampf', 'roles': ['participant']},
		{'user':'WAvegetarian', 'roles': ['participant']},
		{'user':'Lara', 'roles': ['participant']},
		{'user':'Du', 'roles': ['host']}
	]
},{
	'name':        'Cyrypto Party',
	'categories': ['Internet'],
	'tags':       ['IT', 'Computer', 'Überwachung', 'Privacy'],
	'createdby':   'Mike_85',
	'description': 'Ein paar Leute veranstalten am Freitag 28.09. Eine Crypto-Party. Da wird gelernt, ausprobiert und Bier getrunken. Onion-/DarkNet, Email verschlüsselung mit PGP, Browsereinstellungen für sichereres Surfen, VPN, Proxi,                     Es Sollte für alle etwas dabei sein, für den noob bis zum nerd. Die, die können und wollen, werden sich gegenseitig und Allen Themen vorstellen ',
	'roles':      ['team','host'],
	'members': [
		{'user':'31337', 'roles': ['team']},
		{'user':'INYORBASE', 'roles': ['team']},
		{'user':'⧌', 'roles': ['team']},
		{'user':'c⃠', 'roles': ['team']},
		{'user':'!!!⃤', 'roles': ['host']},
	]
},{
	'name':        'Open Lab',
	'categories': ['Elektronik / Strom', 'Programmieren'],
	'tags':       ['DIY', 'Elektronik', 'Computer'],
	'createdby':   'Mike_85',
	'description': ' Wöchentlich, jeden Dienstag Abend: DIY - Löten, Häcken, Basteln, Programmieren. Im Lab der SGMK Ohne Leitung, respektive unter eigener Leitung. Umkostenbeitrag Freiwilig / Materialgeld…      link Openlab, link SGMK',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'bert', 'roles': ['participant']},
		{'user':'Felix', 'roles': ['host','participant']},
		{'user':'INYORBASE', 'roles': ['participant']},
		{'user':'Barbie92', 'roles': ['participant']},
		{'user':'c⃠', 'roles': ['participant']}
	]
},{
	'name':        'Deutschkurse',
	'categories': ['Sprache'],
	'tags':       ['Sprache'],
	'createdby':   'ASZ - Bildung für alle',
	'description': 'Doitsh yezd!',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Scotty Solorio', 'roles': ['participant']},
		{'user':'Edith Escudero', 'roles': ['participant']},
		{'user':'Willian Wiesner', 'roles': ['participant']},
		{'user':'Russel Rowsey', 'roles': ['participant']},
		{'user':'Krysta Kabel', 'roles': ['participant']},
		{'user':'Zane Zeringue', 'roles': ['participant']},
		{'user':'Buena Balling', 'roles': ['participant']},
		{'user':'Pablo Petti', 'roles': ['participant']},
		{'user':'Ed Epting', 'roles': ['participant']},
		{'user':'Mathilda Morita', 'roles': ['participant']},
		{'user':'Nevada Nicola', 'roles': ['participant']},
		{'user':'Dick Dominguez', 'roles': ['participant']},
		{'user':'Marylyn Metoyer', 'roles': ['participant']},
		{'user':'September Stubblefield', 'roles': ['participant']},
		{'user':'Chastity Capp', 'roles': ['participant']},
		{'user':'Mellisa Momon', 'roles': ['participant']},
		{'user':'Jack Jordon', 'roles': ['participant']},
		{'user':'Yolonda Yoshida', 'roles': ['participant']},
		{'user':'Raymundo Rowland', 'roles': ['participant']},
		{'user':'Beatrice Bernett', 'roles': ['participant']},
		{'user':'Lisa', 'roles': ['mentor']},
		{'user':'Robi', 'roles': ['mentor']},
		{'user':'KGut', 'roles': ['mentor']},
		{'user':'ASZ - Bildung für alle', 'roles': ['host']}
	]
},{
	'name':        'Deutschkurs',
	'categories': ['Sprache'],
	'tags':       ['Deutsch', 'Aussländer_in', 'Immigrant_in'],
	'createdby':   'IvanZ',
	'description': 'Würdich gerne auch Deutsch lernen, findich super.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Maryellen Moyers', 'roles': ['participant']},
		{'user':'Otto Oshields', 'roles': ['participant']},
		{'user':'Hui Hung', 'roles': ['participant']},
		{'user':'Wilhelmina Wolf', 'roles': ['participant']},
		{'user':'Lenora Lucca', 'roles': ['participant']},
		{'user':'Etha Eis', 'roles': ['participant']},
		{'user':'lorence Flavors', 'roles': ['participant']},
		{'user':'Kandace Kahn', 'roles': ['participant']},
		{'user':'Elaine Elswick', 'roles': ['participant']},
		{'user':'Dinorah Duwe', 'roles': ['participant']},
		{'user':'Levi Lind', 'roles': ['participant']},
		{'user':'Shelba Slinkard', 'roles': ['participant']},
		{'user':'Marina Maiden', 'roles': ['participant']},
		{'user':'Nickie Nordin', 'roles': ['participant']},
		{'user':'Valda Vento', 'roles': ['participant']},
		{'user':'Rosalinda Runyan', 'roles': ['participant']},
		{'user':'Latrisha Lamon', 'roles': ['participant']},
		{'user':'Eartha Ellenburg', 'roles': ['participant']},
		{'user':'Irena Ivers', 'roles': ['participant']},
		{'user':'Chassidy Cerna', 'roles': ['participant']},
		{'user':'Luis Lambrecht', 'roles': ['participant']},
		{'user':'Eugena Elling', 'roles': ['participant']},
		{'user':'Lavenia Lastrapes', 'roles': ['participant']},
		{'user':'Truman Tomson', 'roles': ['participant']},
		{'user':'Seth Stall', 'roles': ['participant']},
		{'user':'Regena Robey', 'roles': ['participant']},
		{'user':'Michel Mancil', 'roles': ['participant']},
		{'user':'Lorilee Leftwich', 'roles': ['participant']},
		{'user':'Jonah Jaeger', 'roles': ['participant']},
		{'user':'Jesica Jeanbart', 'roles': ['participant']},
		{'user':'KGut', 'roles': ['mentor']},
		{'user':'Felice Friedt', 'roles': ['mentor']},
		{'user':'Illa Iser', 'roles': ['mentor']},
	]
},{
	'name':        'Deutsch',
	'categories': ['Sprache'],
	'tags':       ['Lernen', 'Kurs', 'Workshop', 'Untericht', 'Fremdsprache'],
	'createdby':   'Lucy',
	'description': '',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'BenDe', 'roles': ['participant']},
	]
},{
	'name':        'German',
	'categories': ['Sprache'],
	'tags':       ['Langage', 'Switzerland'],
	'createdby':   'IvanZ',
	'description': 'Who else would be interested in an independent workshop, with no mentor. Just lerning a language and all arround it',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Sandro', 'roles': ['host']},

	]
},{
	'name':        'Sprachaustasch',
	'categories': ['Sprache'],
	'tags':       ['Sprachen', 'Austausch', 'Treff'],
	'createdby':   'IvanZ',
	'description': 'Wöchentliches treffen und wild sprachen und verschiedenste Kultur austauschen  ****  Weekly meeting and wiledly exchange language and different Culture   ****    Rencontre hebdomadaire et parlé sauvagement, et de remplacer diverses activités culturelles ****  una réunione par semana per excambiare la lingua et cultura ****   Haftalık buluşmada yabana söylemekle en değişik kültürlerin takası etmek  ****    Se reúnem semanalmente e falou descontroladamente, e substituir vários cultural  ',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'IvanZ', 'roles': ['host','participant']},
		{'user':'BenDe', 'roles': ['participant']},
		{'user':'Lucy', 'roles': ['participant']},
		{'user':'SeulSoul', 'roles': ['participant']}
	]
},{
	'name':        'Jodeln',
	'categories': ['Musik'],
	'tags':       ['Singen', 'Jodeln'],
	'createdby':   'Sandra',
	'description': 'Wer will auch Jodeln (lernen) ? Nicht so spiessig wie beim Jodelverein. Wenn möglich unter profesioneller Leitung vielleicht auch, wenn sich niemand finden lässt, in gruppe ein paar lieder einstudieren, vielleicht auch entfremden… villeicht auch aufführen :) ',
	'roles':      ['team', 'participant', 'mentor'],
	'members': [
		{'user':'Sandra', 'roles': ['participant']},
		{'user':'HertsPflaschter', 'roles': ['participant']}
	]
},{
	'name':        'Erste-Hilfe',
	'categories': ['Medizin'],
	'tags':       ['Medizin', 'Nothelfer'],
	'createdby':   'OliviaTheMan!!!Yeah <!-- Hack -->',
	'description': 'Ist etwas, was man eigentlich mindestens jährlich auffrischen müsste nicht? bei mir ist es schon ca 5 Jahre her und ich weiss entsprechend nicht mehr viel.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'OliviaTheMan!!!Yeah <!-- Hack -->', 'roles': ['participant']},
		{'user':'HertsPflaschter', 'roles': ['participant']},
		{'user':'DGass', 'roles': ['host']}
	]
},{
	'name':        'Meteor.js Workshop',
	'categories': ['Programmieren'],
	'tags':       ['Meteor.js', 'Coden'],
	'createdby':   'HackerOne',
	'description': 'Wer ist dabei?',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'Mao', 'roles': ['participant']},
		{'user':'Tse', 'roles': ['participant']},
		{'user':'Tung', 'roles': ['participant']},
		{'user':'Flumsi', 'roles': ['host']}
	]
},/*{
	'name':        'Sprayen Gehen',
	'categories': ['Subkultur'],
	'tags':       ['Graffiti', 'Writing your name'],
	'createdby':   'Fuck The Police',
	'description': 'Lass uns mal so richtig die Sau rauslassen. Ich zeig allen wies geht, nehmt Dosen mit.',
	'roles':      ['participant'],
	'members': [
		{'user':'Fuck The Police', 'roles': ['participant']},
		{'user':'01', 'roles': ['participant']},
		{'user':'Eimi', 'roles': ['participant']},
		{'user':'~UnDeRdOuG~', 'roles': ['participant']},
		{'user':'FiggDi', 'roles': ['participant']},
		{'user':'Barbie92', 'roles': ['participant']},
		{'user':'Mao', 'roles': ['participant']},
		{'user':'Sandra', 'roles': ['participant']},
		{'user':'FUFZIGRAPPER', 'roles': ['participant']},
		{'user':'031', 'roles': ['participant']},
		{'user':'Vollpfoschte98', 'roles': ['participant']},
		{'user':'SchwarzMiFarb', 'roles': ['participant']}
	]
},{
	'name':        'Feminischer Twerking Workshop'
	'categories': ['Dance', 'politics'],
	'tags':       ['say no to sexism' 'fightforyourrighttotwerk'],
	'createdby':   'sexyanarchogirl',
	'description': 'Ich liäbs mit mim Füdli z`twerkä, z`wiigglä, z`jigglä und z`gwaggle. Aber ich gsehn mich trotzdem als radikali Feministin. Isch das überhaupt möglich? Ich würd drum gern mal en Twerking-Workshop organisiere mit ahschlüssende Diskussion über “Queer-Anarchistischem Twerkä”. Iglade sind alli Fraue*, die sich für Queer und/oder Feminismus interessiered, unabhängig devo wie starch sie sich bis jetzt demit usenand gsetzt hend. Mit Fraue* mein ich alli Persone, wo sich als Fraue identifiziered.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'milena', 'roles': ['participant']},
		{'user':'elvis', 'roles': ['participant']},
		{'user':'european dancehallqueen', 'roles': ['participant']},
		{'user':'babaroots sound system', 'roles': ['participant']},
		{'user':'kos crew', 'roles': ['participant']},
		{'user':' dj alibaba', 'roles': ['participant']}
	]
},
*/{
	'name':        'Mobiles Soundsystem bauen',
	'categories': ['Handwerk', 'Musik'],
	'tags':       ['1', '2'],
	'createdby':   'OhBacchanal',
	'description': 'Mein Traum ist es ein mobiles Soundsystem zu haben damit ich spontane soca Paraden und illegale outdoorpartys veranstalten kann. Es gibt doch sicher a) Leute die auch ein mobiles Soundsystem haben wollen und b) Leute die wissen wie man eines baut. Wir sollten uns zusammentun uns bei meinem Vater in der Werkstatt unsere indivuellen Soundsysteme bauen. Mehr Lärm in der Schweiz!',
	'roles':      ['team', 'participant', 'host'],
	'members': [
		{'user':'en_MachelMontano', 'roles': ['mentor']},
		{'user':'en_Shaggy', 'roles': ['participant']},
		{'user':'en_Babaroots', 'roles': ['participant']},
		{'user':'en_sexyanarchgirl', 'roles': ['participant']}
	]
},{
	'name':        'Internationaler Kochkurs',
	'categories': ['Kochen'],
	'tags':       ['fein', 'gsund'],
	'createdby':   'Hotelmamma',
	'description': 'Grüezi Mitterand, Ich dune uu gern choche und chan au ganz gute choche, aber leider nume traditionelle schwiizerchuchi und die klassische Italienische Gricht. Wie wärs wemer eus eimal ide Wuche am Samstag morge treffet und immer duet öppert anderst es Gricht wo er/sie bsunders guet cha choche de andere biibringe. Indisch, Chinesisch, Nigerianisch, Vegan, was-au-immer hauptsach fein! Mir chöntet ide schuelchuchi vom nägelimoos sekundarschuelhuus üebe.',
	'roles':      ['team', 'participant', 'host', 'mentor'],
	'members': [
		{'user':'en_Ylmaz Z.', 'roles': ['mentor', 'participant']},
		{'user':'en_Shaggy', 'roles': ['participant', 'mentor']},
		{'user':'en_gähri W.', 'roles': ['participant']},
		{'user':'en_sexyanarchgirl', 'roles': ['participant', 'Mentor']},
		{'user':'en_Figgdi', 'roles': ['participant', 'mentor']}
	]
},{
	'name':        'WC-Brunnen Bau',
	'categories': ['Handwerk'],
	'tags':       ['DIY', 'Ökologie'],
	'createdby':   '',
	'description': '',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']}
	]
},{
	'name':        'Verschlafen',
	'categories': ['Experimantal'],
	'tags':       ['', ''],
	'createdby':   '',
	'description': '',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']}
	]
},{
	'name':        '',
	'categories': ['', ''],
	'tags':       ['', ''],
	'createdby':   '',
	'description': '',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']},
		{'user':'', 'roles': ['']}
	]
},

/***************** english Testcourses **********************/
{
	'name':        'Meditation & Yoga/Qi-Gong',
	'categories': ['Sport / Bewegung'],
	'tags':       ['Sport', 'Gspürschmi', 'TuetGuet'],
	'createdby':   'FeeLing',
	'description': 'Wouldn`t it be awesome to practice some meditation, yoga and Qi-Gong every morning? I have not enough self-discipline and my yoga/Qi-Gong knowledge is not that good, thats why a small group of people would be perfect. We also need a place to practice, in Summertime we could do it outside, by the lake for example.',
	'roles':      ['team', 'participant', 'host'],
	'members':    [
		{'user':'en_FeeLing', 'roles': ['team','participant']},
		{'user':'en_Crosle', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Aikido',
	'categories': ['Kampfsport/-kunst'],
	'tags':       ['Kampfsport', 'Gschpürschmi'],
	'createdby':   'Kampfhippie',
	'description': 'I would love to have some regular Aikido trainings. If we manage to get a small group of people I could organize a real Trainer and a Dojo. For me aikido is one of the most beautiful Fight Sports because it trys to respond your opposite and to solve the conflict without destroying the other human. https://www.youtube.com/watch?v=qAc-gQIeAaI   http://en.wikipedia.org/wiki/Main_Page',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Kampfhippie', 'roles': ['participant']},
		{'user':'en_Seee', 'roles': ['participant']},
		{'user':'en_Chnöde', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Garden',
	'categories': ['Garten / Landwirtschaft', 'Biologie'],
	'tags':       ['Garden', 'Plants'],
	'createdby':   'Dr Greenthumb',
	'description': 'Once in a while meet to do some gardening, exchange know-How, infrastructure, relations, seeds and plants. Support different free garden projects to grow vegetables, herbs, for food and medication. I have access to 2-3 gardens, with capacity for some motivated gardeners.',
	'roles':      ['team', 'participant', 'host'],
	'members': [
		{'user':'en_Dr Greenthumb', 'roles': ['participant','team', 'host']},
		{'user':'en_Sandro', 'roles': ['participant','team']},
		{'user':'en_Schufi', 'roles': ['participant']},
		{'user':'en_Kampfhippie', 'roles': ['participant']},
		{'user':'en_LeOnI', 'roles': ['participant']},
		{'user':'en_IvanZ', 'roles': ['participant']},
		{'user':'en_WAvegetarian', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Game Design with Unity',
	'categories': ['Programmieren'],
	'tags':       ['Design', 'Computer'],
	'createdby':   'Seee',
	'description': 'I could give you a profound introduction in the conception, design and the technical Realisation of a Game. The course would start with the development of your idea go on with the planing of the mechanical system and at the end the realization of the final version of your game. You also get a short introduction into those themes: * game theory  * game idea * game mechanic * Storytelling * Concept Art * game character developing * draw and image editing with photoshop * Usability * Prototyping and Gamedesign with Unity Gameengine * Leveldesign * 3D-Modelling and -Animation with Blender * Programming with JavaScript and C-Sharp * Sound-Design with Audacity * Polishing ',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Seee', 'roles': ['team','mentor']}
	],
	'region':      'Englistan'
},{
	'name':        'noncommercial Commons-based peer production',
	'categories': ['Garten / Landwirtschaft'],
	'tags':       ['Theorie', 'Projekt'],
	'createdby':   'Dr Greenthumb',
	'description': '"commons are collaborative formal or informal Governance-Systems, to use as a collective, resources." [[http://en.wikipedia.org/wiki/Commons|what are commons?]] Would be interesting to talk about noncommercial //Commons-based peer production// and even better try to realize in practice a bigger project (for example a vegetable garden) (That would be on a long-term basis, with a lot of responsibility)',
	'roles':      ['team', 'participant'],
	'members': [
		{'user':'en_Dr Greenthumb', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Web-Design with HTML und Phyton/PHP',
	'categories': ['Programmieren','Internet'],
	'tags':       ['Design', 'Computer'],
	'createdby':   'Seee',
	'description': 'I could give you a substantial introduction to conception, shaping and technical realization of a website. *conception/ideas *usability *photoshop *HTML, CSS and JavaScript *PHP/ phyton *Database with mySQL',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Seee', 'roles': ['team','mentor']},
		{'user':'en_Dr Greenthumb', 'roles': ['participant']},
		{'user':'en_Sandro', 'roles': ['participant']},
		{'user':'en_IvanZ', 'roles': ['participant']},
		{'user':'en_greg', 'roles': ['host']}
	],
	'region':      'Englistan'
},{
	'name':        'Elektronics',
	'categories': ['Elektronik / Strom'],
	'tags':       ['Elektronik'],
	'createdby':   'greg',
	'description': 'Hello Everybody, I would love to learn the basics of electronic....I mean I can already play around with electricity (you know lamps and dimmers and stuff like that) I already got some slight electric shocks ;-) There is no special occasion, so I`m open to learn anything.... I have access to different rooms, well when we have a concrete plan, I will check out where exactly. If you want to I will also help with the organization of the course. I have time from now till end of summer somewhen (after that I will not be around for a while). So who is up for that? CU',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_greg', 'roles': ['host','team']},
		{'user':'en_LeOnI', 'roles': ['participant']},
		{'user':'en_IvanZ', 'roles': ['participant']},
		{'user':'en_Barbie92', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Ubuntu for Mac (dual-Boot)',
	'categories': ['Softwarebedienung'],
	'tags':       [],
	'createdby':   'greg',
	'description': 'I want to have Ubuntu on my Mac without giving up OS. I tried that already but it didn`t work out and Im not reaaaaaally interested in that technical shit. Is there someone, who would like to help me, and others with the same problem, with giving a class about that topic? I help you out as well somehow someday. With food for example, in my kitchen there is space for like 4 people.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_greg', 'roles': ['participant','team','host']},
		{'user':'en_Mike_85', 'roles': ['participant']},
		{'user':'en_IvanZ', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Patching up Clothes-Afternoon',
	'categories': ['Design','Handwerk'],
	'tags':       ['DIY', 'Kleider', 'Handwerk'],
	'createdby':   'Sandro',
	'description': ' I have a big box full of old clothes I should patch (some of them since long long time): Zipper, big rifts, holes etc. I think fixing those together with others would be more fun and maybe there is some expert around who helps us out. the patching should be done good so its not gonna bust again so soon.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Sandro', 'roles': ['team','host']},
	],
	'region':      'Englistan'
},{
	'name':        'Different accents',
	'categories': ['Sprache'],
	'tags':       ['Dialekt','Wallis'],
	'createdby':   'LeOnI',
	'description': 'Watch this video: http://youtu.be/dABo_DCIdpM - Is there a Expert who could teach me how to speak and understand the English from the habitants of all this different regions? The sounds, the special intonations, the weird endings and windings and not to forgett the unique phrases is what I want to learn. Audio-dramas or movies are very welcome and a good basis. Share some links',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_LeOnI', 'roles': ['team']},
		{'user':'en_WAvegetarian', 'roles': ['participant','team']},
		{'user':'en_Sandro', 'roles': ['host']}
	],
	'region':      'Englistan'
},{
	'name':        'to brew beer',
	'tags': ['Bier'],
	'categories': ['Kultur'],
	'createdby':   'Gähri Weber',
	'description': 'It is really easy to brew beer! I show you how to brew your own tasty beer in your bathtub. We just need some ingredients and it will ferment by itself. Its a very cool hobby, it brings you some diversity in your beer consolation and it is very healthy. ',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Gähri W.', 'roles': ['team','mentor']},
		{'user':'en_Lavenia Lastrapes', 'roles': ['participant']},
		{'user':'en_Greenthumb', 'roles': ['participant']},
		{'user':'en_WAvegetarian', 'roles': ['participant']},
		{'user':'en_Lara', 'roles': ['participant']},
		{'user':'en_Du', 'roles': ['host']}
	],
	'region':      'Englistan'
},{
	'name':        'Crypto Party',
	'categories': ['Internet'],
	'tags':       ['IT', 'Computer', 'Überwachung', 'Privacy'],
	'createdby':   'Mike_85',
	'description': 'Some people are organizing a crypto-party on friday the 28th of September. Beer drinking, playing around, trying out stuff, learning. oNION-/dARKnET, Email encryption with PGP, Browsersetting for save surfing, VPN, Proxi, for noobs and nerds.',
	'roles':      ['team','host'],
	'members': [
		{'user':'en_31337', 'roles': ['team']},
		{'user':'en_INYORBASE', 'roles': ['team']},
		{'user':'en_⧌', 'roles': ['team']},
		{'user':'en_c⃠', 'roles': ['team']},
		{'user':'en_!!!⃤', 'roles': ['host']},
	],
	'region':      'Englistan'
},{
	'name':        'Open Lab',
	'categories': ['Elektronik / Strom', 'Programmieren'],
	'tags':       ['DIY', 'Elektronik', 'Computer'],
	'createdby':   'Mike_85',
	'description': 'Every tuesday evening: DIY – soldering, hacking, crafting, programming. At the Lab of SGMK without guidance... well self-guidance of course. Money for Material etc. is optional..... Link Openlab, Link SGMK',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_bert', 'roles': ['participant']},
		{'user':'en_Felix', 'roles': ['host','participant']},
		{'user':'en_INYORBASE', 'roles': ['participant']},
		{'user':'en_Barbie92', 'roles': ['participant']},
		{'user':'en_c⃠', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'German Class for everybody',
	'categories': ['Sprache'],
	'tags':       ['Sprache'],
	'createdby':   'ASZ - Bildung für alle',
	'description': 'jerman now and for effrybody',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Scotty Solorio', 'roles': ['participant']},
		{'user':'en_Edith Escudero', 'roles': ['participant']},
		{'user':'en_Willian Wiesner', 'roles': ['participant']},
		{'user':'en_Russel Rowsey', 'roles': ['participant']},
		{'user':'en_Krysta Kabel', 'roles': ['participant']},
		{'user':'en_Zane Zeringue', 'roles': ['participant']},
		{'user':'en_Buena Balling', 'roles': ['participant']},
		{'user':'en_Pablo Petti', 'roles': ['participant']},
		{'user':'en_Ed Epting', 'roles': ['participant']},
		{'user':'en_Mathilda Morita', 'roles': ['participant']},
		{'user':'en_Nevada Nicola', 'roles': ['participant']},
		{'user':'en_Dick Dominguez', 'roles': ['participant']},
		{'user':'en_Marylyn Metoyer', 'roles': ['participant']},
		{'user':'en_September Stubblefield', 'roles': ['participant']},
		{'user':'en_Chastity Capp', 'roles': ['participant']},
		{'user':'en_Mellisa Momon', 'roles': ['participant']},
		{'user':'en_Jack Jordon', 'roles': ['participant']},
		{'user':'en_Yolonda Yoshida', 'roles': ['participant']},
		{'user':'en_Raymundo Rowland', 'roles': ['participant']},
		{'user':'en_Beatrice Bernett', 'roles': ['participant']},
		{'user':'en_Lisa', 'roles': ['mentor']},
		{'user':'en_Robi', 'roles': ['mentor']},
		{'user':'en_KGut', 'roles': ['mentor']},
		{'user':'en_ASZ - Bildung für alle', 'roles': ['host']}
	],
	'region':      'Englistan'
},{
	'name':        'Deutsch Kurs',
	'categories': ['Sprache'],
	'tags':       ['Deutsch', 'Aussländer_in', 'Immigrant_in'],
	'createdby':   'Ylmaz Z.',
	'description': 'I want to learn german, thats great!',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Maryellen Moyers', 'roles': ['participant']},
		{'user':'en_Otto Oshields', 'roles': ['participant']},
		{'user':'en_Hui Hung', 'roles': ['participant']},
		{'user':'en_Wilhelmina Wolf', 'roles': ['participant']},
		{'user':'en_Lenora Lucca', 'roles': ['participant']},
		{'user':'en_Etha Eis', 'roles': ['participant']},
		{'user':'en_lorence Flavors', 'roles': ['participant']},
		{'user':'en_Kandace Kahn', 'roles': ['participant']},
		{'user':'en_Elaine Elswick', 'roles': ['participant']},
		{'user':'en_Dinorah Duwe', 'roles': ['participant']},
		{'user':'en_Levi Lind', 'roles': ['participant']},
		{'user':'en_Shelba Slinkard', 'roles': ['participant']},
		{'user':'en_Marina Maiden', 'roles': ['participant']},
		{'user':'en_Nickie Nordin', 'roles': ['participant']},
		{'user':'en_Valda Vento', 'roles': ['participant']},
		{'user':'en_Rosalinda Runyan', 'roles': ['participant']},
		{'user':'en_Latrisha Lamon', 'roles': ['participant']},
		{'user':'en_Eartha Ellenburg', 'roles': ['participant']},
		{'user':'en_Irena Ivers', 'roles': ['participant']},
		{'user':'en_Chassidy Cerna', 'roles': ['participant']},
		{'user':'en_Luis Lambrecht', 'roles': ['participant']},
		{'user':'en_Eugena Elling', 'roles': ['participant']},
		{'user':'en_Lavenia Lastrapes', 'roles': ['participant']},
		{'user':'en_Truman Tomson', 'roles': ['participant']},
		{'user':'en_Seth Stall', 'roles': ['participant']},
		{'user':'en_Regena Robey', 'roles': ['participant']},
		{'user':'en_Michel Mancil', 'roles': ['participant']},
		{'user':'en_Lorilee Leftwich', 'roles': ['participant']},
		{'user':'en_Jonah Jaeger', 'roles': ['participant']},
		{'user':'en_Jesica Jeanbart', 'roles': ['participant']},
		{'user':'en_KGut', 'roles': ['mentor']},
		{'user':'en_Felice Friedt', 'roles': ['mentor']},
		{'user':'en_Illa Iser', 'roles': ['mentor']},
	],
	'region':      'Englistan'
},{
	'name':        'German workshop',
	'categories': ['Sprache'],
	'tags':       ['Langage', 'Switzerland'],
	'createdby':   'IvanZ',
	'description': 'Who else would be interested in an independent workshop, with no mentor. Just lerning a language and all arround it',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Sandro', 'roles': ['host']},
	]
},{
	'name':        'Language Exchange',
	'categories': ['Sprache'],
	'tags':       ['Sprachen', 'Austausch', 'Treff'],
	'createdby':   'Ylmaz Z.',
	'description': 'Wöchentliches treffen und wild sprachen und verschiedenste Kultur austauschen  ****  Weekly meeting and wiledly exchange language and different Culture   ****    Rencontre hebdomadaire et parlé sauvagement, et de remplacer diverses activités culturelles ****  una réunione par semana per excambiare la lingua et cultura ****   Haftalık buluşmada yabana söylemekle en değişik kültürlerin takası etmek  ****    Se reúnem semanalmente e falou descontroladamente, e substituir vários cultural',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_ylmaz Z', 'roles': ['host','participant']},
		{'user':'en_BenDe', 'roles': ['participant']},
		{'user':'en_Lucy', 'roles': ['participant']},
		{'user':'en_SeulSoul', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Yodeling!',
	'categories': ['Musik'],
	'tags':       ['Singen', 'Jodeln'],
	'createdby':   'Sandra',
	'description': 'Who else wants to learn swiss yodeling? Not like in a suburban yodel association... If possible with a professional yodel teacher, and if we cant find somebody, maybe we can learn some songs in a group of motivated people. Maybe we can grow apart from the tradition and create out own interpretation of yodeling?….maybe we become that good that we can perform our songs in public? :-)  https://en.wikipedia.org/wiki/Yodeling ',
	'roles':      ['team', 'participant', 'mentor'],
	'members': [
		{'user':'en_Sandra', 'roles': ['participant']},
		{'user':'en_HertsPflaschter', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'First-Aid Course',
	'categories': ['Medizin'],
	'tags':       ['Medizin', 'Nothelfer'],
	'createdby':   'OliviaTheMan!!!Yeah <!-- Hack -->',
	'description': 'First Aid is something so important that we all should renew every year. My last class was five years ago and I forgott almost everything......',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_OliviaTheMan!!!Yeah <!-- Hack -->', 'roles': ['participant']},
		{'user':'en_HertsPflaschter', 'roles': ['participant']},
		{'user':'en_DGass', 'roles': ['host']}
	]
},{
	'name':        'Meteor.js Workshop',
	'categories': ['Programmieren'],
	'tags':       ['Meteor.js', 'Coden'],
	'createdby':   'HackerOne',
	'description': 'Who is in??',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_Mao', 'roles': ['participant']},
		{'user':'en_Tse', 'roles': ['participant']},
		{'user':'en_Tung', 'roles': ['participant']},
		{'user':'en_Flumsi', 'roles': ['host']}
	],
	'region':      'Englistan'
},/*{
	'name':        'graffiti',
	'categories': ['Subkultur'],
	'tags':       ['Graffiti', 'Writing your name'],
	'createdby':   'Fuck The Police',
	'description': 'Lets get mad. I show you how it works. Make sure you bring some cans.',
	'roles':      ['participant'],
	'members': [
		{'user':'en_Fuck The Police', 'roles': ['participant']},
		{'user':'en_01', 'roles': ['participant']},
		{'user':'en_Eimi', 'roles': ['participant']},
		{'user':'en_~UnDeRdOuG~', 'roles': ['participant']},
		{'user':'en_FiggDi', 'roles': ['participant']},
		{'user':'en_Barbie92', 'roles': ['participant']},
		{'user':'en_Mao', 'roles': ['participant']},
		{'user':'en_Sandra', 'roles': ['participant']},
		{'user':'en_FUFZIGRAPPER', 'roles': ['participant']},
		{'user':'en_031', 'roles': ['participant']},
		{'user':'en_Vollpfoschte98', 'roles': ['participant']},
		{'user':'en_SchwarzMiFarb', 'roles': ['participant']},
		{'user':'en_PUBeR', 'roles': ['participant']}
	],
	'region':      'Englistan'
},{
	'name':        'Feministic Twerking workshop'
	'categories': ['Dance', 'politics'],
	'tags':       ['say no to sexism' 'fightforyourrighttotwerk'],
	'createdby':   'sexyanarchogirl',
	'description': 'I love to twerk, wiggle, jiggle and wine up my bumper. But Im still a radical feminist. Is that even possible or not? I would love to organize a Twerking Workshop with a discussion about "queeranarchistic twerking" afterwards. This workshop is for all women*interested in feminism and/or queer, no matter how much they are engaged in queer_feminism and anti-sexism already. With women* we understand  all persons that identify as women*.',
	'roles':      ['team', 'participant', 'mentor', 'host'],
	'members': [
		{'user':'en_milena', 'roles': ['participant']},
		{'user':'en_elvis', 'roles': ['participant']},
		{'user':'en_european dancehallqueen', 'roles': ['participant']},
		{'user':'en_babaroots sound system', 'roles': ['participant']},
		{'user':'en_kos crew', 'roles': ['participant']},
		{'user':'en_ dj alibaba', 'roles': ['participant']}
	],
	'region':      'Englistan'
},*/
{
	'name':        'Build your mobile Soundsystem',
	'categories': ['Handwerk', 'Elektronik / Strom', 'Musik'],
	'tags':       ['1', '2'],
	'createdby':   'OhBacchanal',
	'description': 'My dream is it to have a mobile Soundsystem so I can make spontaneous Soca Parades and illegal outdoorpartys. a) I think there are more people who really need a mobile Soundsystem b)Im sure there are people out there who know how to construct one. We should all get together and meet by my fathers garage and build our own individual mobile sound system.' /*More noise for switzerland!'*/,
	'roles':      ['team', 'participant', 'host'],
	'members': [
		{'user':'en_MachelMontano', 'roles': ['mentor']},
		{'user':'en_Shaggy', 'roles': ['participant']},
		{'user':'en_Babaroots', 'roles': ['participant']},
		{'user':'en_sexyanarchgirl', 'roles': ['participant']}
	],
	'region':        'Englistan'
},{
	'name':        'International Cookin Course',
	'categories': ['kochen'],
	'tags':       ['fein', 'gsund'],
	'createdby':   'Hotelmamma',
	'description': 'Hello together, I love to cook and i can cook pretty good, but only traditional swiss dishes and some of the italian classics. How great would it be if we meet every saturday morning and every time somebody new teaches the others how to cook his/her favorite dish? Indian food, chinese, nigerian, vegan, whatever main point is that it is delicious! We can use the school kitchen of the secondary school Nägelimoos in kloten',
	'roles':      ['team', 'participant', 'host', 'mentor'],
	'members': [
		{'user':'en_Ylmaz Z.', 'roles': ['mentor', 'participant']},
		{'user':'en_Shaggy', 'roles': ['participant', 'mentor']},
		{'user':'en_gähri W.', 'roles': ['participant']},
		{'user':'en_sexyanarchgirl', 'roles': ['participant', 'Mentor']},
		{'user':'en_Figgdi', 'roles': ['participant', 'mentor']}
	],
	'region':        'Englistan'
}]