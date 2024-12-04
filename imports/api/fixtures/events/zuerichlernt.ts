export const events: {
  _id: string;
  title: string;
  description: string;
  venue: { _id?: string; name: string };
  room?: string;
  start: {
    $date: string;
  };
  end: {
    $date: string;
  };
  time_lastedit: {
    $date: string;
  };
  region: string;
  createdBy: string;
  time_created: {
    $date: string;
  };
  groups?: string[];
  courseId?: string;
  internal?: boolean;
  sendReminder?: boolean;
  canceled?: boolean;
  maxParticipants?: number;
  noRsvp?: boolean;
  categories?: string[];
  participants?: { user: string; companions: number }[];
}[] = [
  {
    _id: "yE5qwBdo2hZcWrD9S",
    title: "Zürcher Landschaft in Wasserfarbe",
    description:
      "<p>Zusammen zeichnen wir eine simple zürcher Landschaft mit Wasserfarben. English speaking people are also welcome.</p><p>Falls vorhanden wäre folgendes Material mitzubringen: Wasserfarbe, geeignetes Papier (ca. 300g), Bleistift, Pinsel, Wasserschale<br /></p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "kleines Kurslokal, 4. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Z86tuADrPGtBfM9NG",
    time_lastedit: {
      $date: "2024-05-31T14:38:08.205+0000",
    },
    time_created: {
      $date: "2024-05-30T15:21:55.226+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T07:30:00.000+0000",
    },
    end: {
      $date: "2024-09-16T10:00:00.000+0000",
    },
    createdBy: "Matilde",
    categories: ["handicraft"],
    participants: [
      {
        user: "Chrissy",
        companions: 0,
      },
      {
        user: "Alexandra",
        companions: 0,
      },
      {
        user: "Phillie",
        companions: 0,
      },
      {
        user: "Leila",
        companions: 0,
      },
      {
        user: "Alyssa",
        companions: 1,
      },
      {
        user: "Harald",
        companions: 0,
      },
    ],
  },
  {
    _id: "5AAv2BEJLYSjZe52m",
    title: "Spanisch für Kleinkinder",
    description:
      "Contando y jugando aprendemos español. Auf spielerische Weise lernen wir die spanische Sprache (als Muttersprache oder Zweitsprache). Durch Musik, Geschichten, Bewegungen, Singen, Tanzen und Basteln werden die Sozialkompetenzen und die Sprachkenntnisse der Kinder gestärkt und gefördert. Bienvenidos!",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "MoP3fdw5nM5NXHX5o",
    time_lastedit: {
      $date: "2024-06-04T11:41:08.278+0000",
    },
    time_created: {
      $date: "2024-05-30T13:34:23.358+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T09:00:00.000+0000",
    },
    createdBy: "Beatriz",
    categories: ["languages"],
    participants: [
      {
        user: "Hilarius",
        companions: 0,
      },
    ],
  },
  {
    _id: "9nA8F9NJyzPkKK38E",
    title: "Yoga über Mittag",
    description:
      "<p>Yoga tut gut. Es befreit den Geist, stärkt den Körper und macht nebenbei auch noch Freude.</p><p>Wir praktizieren gemeinsam HataYoga, eine sanfte und ruhige Variante des Yoga. Dabei kann Jeder seinen eigenen Rhythmus finden.</p><p>Yogamatte oder weiche Decke mitnehmen. Bitte anmelden. </p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "Flex 2. Bei schönem Wetter draussen. ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "2iBy99atTsHcsPJt3",
    time_lastedit: {
      $date: "2024-05-02T13:58:47.005+0000",
    },
    time_created: {
      $date: "2024-05-02T13:58:47.005+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T10:15:00.000+0000",
    },
    end: {
      $date: "2024-09-16T11:15:00.000+0000",
    },
    createdBy: "Chrissy",
    categories: ["sports"],
    participants: [
      {
        user: "Kelbee",
        companions: 0,
      },
      {
        user: "Bertrando",
        companions: 0,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Kris",
        companions: 0,
      },
      {
        user: "Brigg",
        companions: 0,
      },
      {
        user: "Sonya",
        companions: 0,
      },
      {
        user: "Guthrie",
        companions: 0,
      },
      {
        user: "Sallee",
        companions: 0,
      },
      {
        user: "Cammi",
        companions: 0,
      },
      {
        user: "Briant",
        companions: 0,
      },
      {
        user: "Moyra",
        companions: 0,
      },
      {
        user: "Montague",
        companions: 0,
      },
      {
        user: "Jeffy",
        companions: 0,
      },
      {
        user: "Aguistin",
        companions: 0,
      },
      {
        user: "Danya",
        companions: 0,
      },
      {
        user: "Norrie",
        companions: 0,
      },
      {
        user: "Des",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "XtLKM4wZwbkg3eoBe",
    title: "Aquarellmalerei",
    description:
      "<p>Entdecke die Faszination der Aquarellmalerei! In diesem Kurs lernst du spielerisch die Grundlagen und experimentierst mit fließenden Farben. Keine Vorkenntnisse nötig. Tauche ein und gestalte kleine Motive voller Freude und Kreativität!</p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "58Ka6zGwJypmL9Fwj",
    time_lastedit: {
      $date: "2024-04-12T13:00:47.486+0000",
    },
    time_created: {
      $date: "2024-04-12T13:00:47.486+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T15:00:00.000+0000",
    },
    createdBy: "Caitlin",
    categories: ["culture"],
    participants: [
      {
        user: "Killy",
        companions: 0,
      },
      {
        user: "Keelby",
        companions: 0,
      },
      {
        user: "Brendis",
        companions: 0,
      },
      {
        user: "Kaitlynn",
        companions: 0,
      },
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Norby",
        companions: 0,
      },
      {
        user: "Jewelle",
        companions: 0,
      },
    ],
  },
  {
    _id: "GHhgsaZ56N7ng98iv",
    title: "Ikebana-Kurs",
    description:
      '<p>Ikebana ist die japanische Kunst des Blumenarrangierens. Die meditative Form des Ikebana - Kado - bedeutet "Weg der Blumen" und ist Ausdruck für den nie endenden Lernprozess des Ausführens dieser Kunst.</p><p>Wir werden unter Anleitung ein Gesteck erarbeiten.</p>',
    venue: {
      name: "Reformierte Kirche 7/8 - Grosse Kirche Fluntern",
      _id: "dzxwy4NvtB2ZW6aZ3",
    },
    room: "Turmstube. Zugang über Seitentreppe, oberstes Stockwerk",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 14,
    region: "h4MnI3psRr8hSljk2",
    courseId: "37ECLNNQzXf43MAty",
    time_lastedit: {
      $date: "2024-05-30T13:57:13.472+0000",
    },
    time_created: {
      $date: "2024-05-30T13:57:13.472+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T14:00:00.000+0000",
    },
    createdBy: "Laurel",
    categories: ["handicraft"],
    participants: [
      {
        user: "Constantine",
        companions: 0,
      },
      {
        user: "Lauri",
        companions: 0,
      },
      {
        user: "Terri-jo",
        companions: 0,
      },
      {
        user: "Saunders",
        companions: 0,
      },
      {
        user: "Pooh",
        companions: 0,
      },
      {
        user: "Trudie",
        companions: 1,
      },
      {
        user: "Aigneis",
        companions: 0,
      },
      {
        user: "Nikkie",
        companions: 0,
      },
      {
        user: "Dusty",
        companions: 0,
      },
      {
        user: "Herbert",
        companions: 0,
      },
      {
        user: "Susanetta",
        companions: 0,
      },
      {
        user: "Lavinie",
        companions: 0,
      },
    ],
  },
  {
    _id: "HZCfHwggnS6vRwBEH",
    title: "Schreiben in der Natur",
    description:
      "<p>In der Natur nehmen wir mit allen Sinnen wahr, verbinden uns mit der Umgebung. Auf einem <b>Spaziergang</b> im Friedhof Sihlfeld lernen Sie das Nature Writing kennen und lassen sich zum <b>Schreiben</b> inspirieren. Es entstehen Skizzen, Entwürfe, (noch) keine fertigen Texte.</p><p>Mitnehmen: Notizheft oder -block mit fester Unterlage, Stift, Regenschirm, Klappstuhl oder -hocker. </p>",
    venue: {
      name: "Platzspitz Park",
    },
    room: "Friedhof Sihlfeld. Lektionsort je nach Wetter. Wird online bekannt gegeben",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 18,
    region: "h4MnI3psRr8hSljk2",
    courseId: "v5LLXQ2jpo8eu8Nqk",
    time_lastedit: {
      $date: "2024-09-11T14:44:42.410+0000",
    },
    time_created: {
      $date: "2024-05-31T05:02:21.029+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    createdBy: "Aprilette",
    categories: ["culture", "misc"],
    participants: [
      {
        user: "Tiffani",
        companions: 0,
      },
      {
        user: "Curt",
        companions: 0,
      },
      {
        user: "Alane",
        companions: 0,
      },
      {
        user: "Hill",
        companions: 0,
      },
      {
        user: "Dahlia",
        companions: 0,
      },
      {
        user: "Rudd",
        companions: 0,
      },
      {
        user: "Janina",
        companions: 0,
      },
      {
        user: "Sharla",
        companions: 0,
      },
      {
        user: "Pammie",
        companions: 0,
      },
      {
        user: "Burgess",
        companions: 0,
      },
      {
        user: "Myrle",
        companions: 0,
      },
      {
        user: "Aprilette",
        companions: 0,
      },
      {
        user: "Myrta",
        companions: 1,
      },
      {
        user: "Rafaelia",
        companions: 0,
      },
      {
        user: "Annnora",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "vQ3ZA9t8SxzXfKe2Z",
    title: "Hula Tanz aus Hawai’i",
    description:
      "<p>Willst du ein Stück Hawai’i kennenlernen? Wir schauen uns einige Grundschritte an und lernen eine  einfache Choreografie. Keine Vorkenntnisse nötig.</p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "39wbim3bXkHndR9iX",
    time_lastedit: {
      $date: "2024-07-11T09:09:43.210+0000",
    },
    time_created: {
      $date: "2024-07-11T09:09:43.210+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T14:50:00.000+0000",
    },
    end: {
      $date: "2024-09-16T15:50:00.000+0000",
    },
    createdBy: "Lanna",
    categories: ["sports"],
    participants: [
      {
        user: "Tomi",
        companions: 0,
      },
      {
        user: "Evvie",
        companions: 0,
      },
      {
        user: "Abe",
        companions: 0,
      },
      {
        user: "Jedd",
        companions: 0,
      },
      {
        user: "Sibby",
        companions: 0,
      },
      {
        user: "Prue",
        companions: 0,
      },
      {
        user: "Junina",
        companions: 0,
      },
      {
        user: "Ervin",
        companions: 0,
      },
      {
        user: "Odell",
        companions: 0,
      },
      {
        user: "Lin",
        companions: 0,
      },
      {
        user: "Alexandros",
        companions: 0,
      },
      {
        user: "Grady",
        companions: 0,
      },
      {
        user: "Donaugh",
        companions: 0,
      },
      {
        user: "Hermia",
        companions: 0,
      },
      {
        user: "Jaye",
        companions: 0,
      },
      {
        user: "Christos",
        companions: 0,
      },
      {
        user: "Isabel",
        companions: 0,
      },
      {
        user: "Wolf",
        companions: 0,
      },
      {
        user: "Jerad",
        companions: 0,
      },
      {
        user: "Barb",
        companions: 0,
      },
    ],
  },
  {
    _id: "f69kEiFkptsCZaHeG",
    title: "Einblick in die faszinierende Welt der Honigbienen",
    description:
      "<p>Erleben Sie, was es heisst, Honigbienen zu halten. Wie ist ein Bienenvolk organisiert? Was spielt die Bienenkönigin für eine Rolle? Mit welchen Herausforderungen sind unsere Bienen konfrontiert? Wie können wir die Bienen unterstützen?</p><p>Imker Andreas Berger gibt Auskunft.</p><p><br /></p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Leselounge (2. OG)",
    internal: false,
    sendReminder: true,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "J6xq5P4sWG72GPbLk",
    time_lastedit: {
      $date: "2024-06-28T12:17:21.544+0000",
    },
    time_created: {
      $date: "2024-03-14T13:06:15.970+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    createdBy: "Heath",
    categories: ["misc"],
    noRsvp: false,
    participants: [
      {
        user: "Pollyanna",
        companions: 0,
      },
      {
        user: "Bron",
        companions: 1,
      },
      {
        user: "Carola",
        companions: 1,
      },
      {
        user: "Godart",
        companions: 1,
      },
      {
        user: "Alane",
        companions: 0,
      },
      {
        user: "Gayler",
        companions: 1,
      },
      {
        user: "Wake",
        companions: 1,
      },
      {
        user: "Mendie",
        companions: 0,
      },
      {
        user: "Wiatt",
        companions: 1,
      },
      {
        user: "Robby",
        companions: 0,
      },
    ],
  },
  {
    _id: "NJXaxTEqCvy6mRP3T",
    title: "Taschengeld und Jugendlohn: ab wann, wieviel und für was?",
    description:
      "<p>Mit Taschengeld und Jugendlohn können Kinder lernen, mit Geld umzugehen. Wir geben dir Tipps, ab wann, wie viel und für was du deinem Kind eigenes Geld geben kannst. Und wir geben Ideen, wie ihr in der Familie über Geld reden könnt. </p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "1.OG Lounge",
    internal: false,
    sendReminder: true,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dqat49MNMBurXqgF8",
    time_lastedit: {
      $date: "2024-04-09T15:10:48.714+0000",
    },
    time_created: {
      $date: "2024-04-09T15:05:55.203+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    createdBy: "Felicia",
    categories: ["misc"],
    participants: [
      {
        user: "Xenos",
        companions: 0,
      },
      {
        user: "Giordano",
        companions: 0,
      },
      {
        user: "Violetta",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 0,
      },
      {
        user: "Herbert",
        companions: 0,
      },
      {
        user: "Felicia",
        companions: 0,
      },
      {
        user: "Kelbee",
        companions: 0,
      },
      {
        user: "Holli",
        companions: 0,
      },
      {
        user: "Gabriela",
        companions: 0,
      },
      {
        user: "Rudd",
        companions: 0,
      },
      {
        user: "Harrison",
        companions: 0,
      },
      {
        user: "Coraline",
        companions: 0,
      },
    ],
  },
  {
    _id: "HiFnDYgMcBQnWDxs7",
    title: "Engagierte leben länger und gesünder",
    description:
      '<p>Im Forschungsprojekt "neuesalter" haben wir ergründet, wie lange, engagierte Lebenswege zustande kommen. Welche Weichenstellungen helfen, um auch über 70 noch wirksam tätig zu sein? Das gewonnene Wissen über innovative Lebensentwürfe im demografischen Wandel teilen wir gern mit Jungen und Reiferen.</p><p><br /></p>',
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3. OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 18,
    region: "h4MnI3psRr8hSljk2",
    courseId: "7YPYWFSg2huyxXkvn",
    time_lastedit: {
      $date: "2024-05-28T11:41:26.241+0000",
    },
    time_created: {
      $date: "2024-05-28T11:41:26.241+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T16:30:00.000+0000",
    },
    createdBy: "Eldredge",
    categories: ["misc"],
    participants: [
      {
        user: "Caitlin",
        companions: 0,
      },
      {
        user: "Sallie",
        companions: 0,
      },
      {
        user: "Tomi",
        companions: 1,
      },
      {
        user: "Eldon",
        companions: 0,
      },
      {
        user: "Alard",
        companions: 0,
      },
      {
        user: "Gussi",
        companions: 0,
      },
      {
        user: "Olly",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 0,
      },
      {
        user: "Wake",
        companions: 0,
      },
      {
        user: "Nessi",
        companions: 0,
      },
      {
        user: "Alie",
        companions: 0,
      },
      {
        user: "Faustine",
        companions: 0,
      },
      {
        user: "Burgess",
        companions: 0,
      },
      {
        user: "Even",
        companions: 0,
      },
      {
        user: "Karney",
        companions: 0,
      },
      {
        user: "Giustino",
        companions: 0,
      },
    ],
  },
  {
    _id: "uMnpFF7gLXFkKWzxg",
    title: "Achtsames Sticken",
    description:
      "<p>Erlebe Kreativität und Achtsamkeit durch Sticken. Genieße einfach die Zeit für Dich und den kreativen Prozess. Die Arbeit mit den Händen ermöglicht es, zur Ruhe zu kommen. Ohne Regeln und Perfektionsdruck experimentieren wir mit verschiedensten Materialien. Bringe dein Material mit.</p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "d2gSp6NRoSkN3mTzm",
    time_lastedit: {
      $date: "2024-06-30T07:53:06.937+0000",
    },
    time_created: {
      $date: "2024-06-01T17:43:44.967+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    createdBy: "Norah",
    categories: [],
    participants: [
      {
        user: "Bonita",
        companions: 0,
      },
      {
        user: "Pen",
        companions: 0,
      },
      {
        user: "Jyoti",
        companions: 0,
      },
    ],
  },
  {
    _id: "qHgv9f7tzq7rYYEaP",
    title: "Yin Yoga + Klangmeditation",
    description:
      "<p>Entdecke die Entspannung mit der Kombination aus Yin Yoga und Klangmeditation mit tibetischen Schalen und anderen Instrumenten aus Indien und Nepal. Entspanne dich zuerst mit sanften und beruhigenden Bewegungen des Yin Yogas und tauche dann ein in die heilenden Klänge der tibetischen Schalen. </p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "2.  Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "4wZ9QuyZ7oGpbNy2S",
    time_lastedit: {
      $date: "2024-07-04T11:20:29.049+0000",
    },
    time_created: {
      $date: "2024-05-02T12:11:37.321+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:30:00.000+0000",
    },
    createdBy: "Pen",
    categories: ["misc"],
    participants: [
      {
        user: "Alma",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Peterus",
        companions: 0,
      },
      {
        user: "Boniface",
        companions: 0,
      },
      {
        user: "Nicolai",
        companions: 0,
      },
    ],
  },
  {
    _id: "YcQC4EGia2dtkGQ46",
    title: "Rückenschmerzen? Bewegung hilft!",
    description:
      "<p>Faszien-orientierte Dehnungen in Verbindung mit bewusster Atmung können helfen, Spannungen im Körper/Rücken zu lösen, Schmerzen zu lindern und langfristig positive Veränderungen in Bezug auf deine Rückenschmerzen zu erleben. </p><p>15 Teilnehmerinnen, Matte oder Kissen mitnehmen. Bitte anmelden. </p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "4SyHviTjwe6Swrvpe",
    time_lastedit: {
      $date: "2024-05-02T14:09:00.407+0000",
    },
    time_created: {
      $date: "2024-05-02T14:09:00.407+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:30:00.000+0000",
    },
    createdBy: "Zia",
    categories: ["sports"],
    participants: [
      {
        user: "Misha",
        companions: 0,
      },
      {
        user: "Chiarra",
        companions: 0,
      },
      {
        user: "Charis",
        companions: 0,
      },
      {
        user: "Mollee",
        companions: 0,
      },
      {
        user: "Kore",
        companions: 0,
      },
      {
        user: "Corbet",
        companions: 0,
      },
      {
        user: "Hilda",
        companions: 0,
      },
      {
        user: "Florrie",
        companions: 0,
      },
      {
        user: "Cletus",
        companions: 1,
      },
      {
        user: "Katharine",
        companions: 0,
      },
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Darrick",
        companions: 1,
      },
      {
        user: "Karry",
        companions: 0,
      },
    ],
  },
  {
    _id: "N6HbpYf9PcBP4BQgm",
    title: "Eine kleine Reise in die Welt des Oolong Tee",
    description:
      "<p>Durch den Prozess des Röstens und Fermentierens verschiedenen Grades entfalten die Teeblätter unterschiedliche Geschmacksrichtungen. Sie werden die Aromen von Oolong Sorten aus Taiwan erleben und die Kunst der chinesischen Teezubereitung kennen lernen. </p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "EiTqJMdqZSfSTji5L",
    time_lastedit: {
      $date: "2024-06-25T09:58:22.508+0000",
    },
    time_created: {
      $date: "2024-05-21T10:21:45.879+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:00:00.000+0000",
    },
    createdBy: "Elvina",
    categories: ["culture"],
    participants: [
      {
        user: "Lin",
        companions: 1,
      },
      {
        user: "Gregorio",
        companions: 0,
      },
      {
        user: "Jemmy",
        companions: 0,
      },
      {
        user: "Giordano",
        companions: 0,
      },
      {
        user: "Gery",
        companions: 0,
      },
      {
        user: "Teresita",
        companions: 0,
      },
      {
        user: "Mariellen",
        companions: 0,
      },
      {
        user: "Gussi",
        companions: 0,
      },
      {
        user: "Phylys",
        companions: 0,
      },
      {
        user: "Fulvia",
        companions: 0,
      },
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Austin",
        companions: 0,
      },
      {
        user: "Dusty",
        companions: 0,
      },
    ],
  },
  {
    _id: "eXrcSKWK6fuh4iMA8",
    title: "Creative Coding",
    description:
      '<p>Teilnehmende lernen Programmiergrundlagen, um mit Processing visuelle Projekte zu gestalten. Der Kurs deckt essentielle Techniken wie Zeichnen, Animation und Interaktivität ab und ermöglicht es, kreative und interaktive Grafiken zu entwickeln. Ideal für Einsteiger:innen in die Programmierung!<br />Die Teilnehmenden benötigen einen eigenen Laptop.</p><p><br />Erstelle als Vorbereitung am besten einen Account bei <a href="https://editor.p5js.org/" rel="nofollow">https://editor.p5js.org/</a> um deine Programme zu sichern.</p>',
    venue: {
      name: "LeLabor",
      _id: "uXHwNfdnZjun4C2yN",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "GKZYpzceJxxz8yYRG",
    time_lastedit: {
      $date: "2024-09-16T09:50:59.276+0000",
    },
    time_created: {
      $date: "2024-05-24T15:12:44.233+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:00:00.000+0000",
    },
    createdBy: "Athene",
    categories: ["computer"],
    participants: [
      {
        user: "Darlene",
        companions: 0,
      },
      {
        user: "Cloris",
        companions: 0,
      },
      {
        user: "Maryl",
        companions: 0,
      },
      {
        user: "Morgan",
        companions: 0,
      },
      {
        user: "Ermin",
        companions: 0,
      },
      {
        user: "Em",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 0,
      },
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Laurel",
        companions: 0,
      },
      {
        user: "Marcile",
        companions: 0,
      },
      {
        user: "Kelbee",
        companions: 0,
      },
      {
        user: "Zia",
        companions: 0,
      },
      {
        user: "Armin",
        companions: 0,
      },
      {
        user: "Julianna",
        companions: 0,
      },
      {
        user: "Broderick",
        companions: 1,
      },
      {
        user: "Alfie",
        companions: 0,
      },
      {
        user: "Jourdan",
        companions: 0,
      },
      {
        user: "Casey",
        companions: 0,
      },
    ],
  },
  {
    _id: "hoeLk3xMK7qS8KFSi",
    title: "Namens- und Zahlengedächtnis effektiv trainieren",
    description:
      "<p>Vergisst Du auch die Namen der Dir vorgestellten Personen viel zu schnell? Oder vergisst Du manchmal Deinen Pin (Natel, Kreditkarte) und hast Mühe, Dir mehr als 4-5 Zahlen zu behalten? Dieser Kurs ist eine Kurzeinführung, wie wir unser Namens- und Zahlengedächtnis effektiv trainieren können.</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "JHiCAasJ8W7Ncj85n",
    time_lastedit: {
      $date: "2024-05-26T08:44:33.266+0000",
    },
    time_created: {
      $date: "2024-05-26T08:44:33.266+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:00:00.000+0000",
    },
    createdBy: "Read",
    categories: ["misc"],
    participants: [
      {
        user: "Carlie",
        companions: 0,
      },
      {
        user: "Amargo",
        companions: 0,
      },
      {
        user: "Cybill",
        companions: 0,
      },
      {
        user: "Laney",
        companions: 0,
      },
      {
        user: "Reggi",
        companions: 0,
      },
      {
        user: "Tara",
        companions: 0,
      },
      {
        user: "Pip",
        companions: 0,
      },
      {
        user: "Melloney",
        companions: 0,
      },
      {
        user: "Janina",
        companions: 0,
      },
      {
        user: "Dorris",
        companions: 0,
      },
      {
        user: "Ken",
        companions: 0,
      },
      {
        user: "Lloyd",
        companions: 0,
      },
    ],
  },
  {
    _id: "Prf6tcof8GeGqssk8",
    title: "Workshop Schreiben",
    description:
      "<p>Nicht nur Musizieren und Sport, auch Schreiben will geübt sein.<br /></p><p>Wir machen verschiedene Schreibübungen, um die Angst vor dem leeren Blatt zu verlieren, um auf neue Ideen und Gedanken zu kommen und um unsere Kreativität zu fördern.<br /></p><p>Bring mit: Laptop, A4-Schreibblock und Stift.</p><p><br /></p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "E8xSXB6avR8aR6uid",
    time_lastedit: {
      $date: "2024-05-30T10:09:58.994+0000",
    },
    time_created: {
      $date: "2024-05-30T10:09:58.994+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:00:00.000+0000",
    },
    createdBy: "Lorinda",
    categories: ["culture", "languages"],
    participants: [
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Any",
        companions: 0,
      },
      {
        user: "Cirstoforo",
        companions: 0,
      },
      {
        user: "Janelle",
        companions: 0,
      },
      {
        user: "Herschel",
        companions: 0,
      },
      {
        user: "Chic",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Yolanda",
        companions: 0,
      },
    ],
  },
  {
    _id: "Pnr49CeyPtd9fQPKd",
    title: "Don`t hurry -be happy: Innehalten-zur Ruhe und Klarheit kommen, gestärkt weitergehen",
    description:
      "<p>Coaching by Walking meets Waldmeditation. Ein Outdoorkurs am Sonnenberg .Eintauchen in die Kraft der Natur, der Meditation: achtsam gehen, sich von der Idiolektik durch ein Bild eines persönlichen Anliegens führen lassen, am Feuer sitzend, sich in eine Meditation vertiefend, Klärung finden. </p>",
    venue: {
      name: "GZ Hottingen - Draussen, Treffpunkt Römerhof",
    },
    room: "draussen - NUR BEI TROCKENEM WETTER",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 13,
    region: "h4MnI3psRr8hSljk2",
    courseId: "pQrZK8rAbjFFDEmFn",
    time_lastedit: {
      $date: "2024-09-06T08:13:13.907+0000",
    },
    time_created: {
      $date: "2024-05-30T16:30:51.523+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:00:00.000+0000",
    },
    createdBy: "Yalonda",
    categories: ["sports"],
    participants: [
      {
        user: "Grange",
        companions: 0,
      },
      {
        user: "Giulio",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Curtice",
        companions: 0,
      },
      {
        user: "Jacynth",
        companions: 0,
      },
      {
        user: "Fin",
        companions: 0,
      },
      {
        user: "Clerc",
        companions: 0,
      },
      {
        user: "Jo ann",
        companions: 0,
      },
      {
        user: "Lisha",
        companions: 0,
      },
      {
        user: "Amery",
        companions: 0,
      },
      {
        user: "Babita",
        companions: 0,
      },
      {
        user: "Karlen",
        companions: 0,
      },
      {
        user: "Joete",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "Dvicv5wfuawmsbHKJ",
    title: "1. Hilfe Set Psychiatrie",
    description:
      "<p>Hast Du Bekannte die sich in einer psychiatrischen Klinik befinden? Bist Du überfordert mit der Frage ob und was Du mitbringen sollst? Als Expertin aus Erfahrung helfe ich Dir (D)einen Koffer zu packen. Nicht nur im übertragenen sondern vor allem ganz praktischen Sinn (Stichwort: Unterwäsche.)<br /></p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qmaS74iGcJm7uWHNd",
    time_lastedit: {
      $date: "2024-06-07T13:56:09.739+0000",
    },
    time_created: {
      $date: "2024-05-31T11:45:37.874+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:30:00.000+0000",
    },
    createdBy: "Kristi",
    categories: ["misc"],
    participants: [
      {
        user: "Tomasine",
        companions: 0,
      },
      {
        user: "Siward",
        companions: 0,
      },
    ],
  },
  {
    _id: "bP8auvTqrts7gTxvY",
    title: "Regeneratives Gärtnern auf dem Balkon",
    description:
      "<p>Genug vom Erde-Austauschen auf deinem Balkon? Ich zeige dir, wie ich Naturprozesse nutze, um wertvolle Erde in meinen Töpfen zu gewinnen. Für mehr Biodiversität, Naturbeobachtungen und Zeit zum Faulenzen und Geniessen. Fragen rund ums Gärtnern erwünscht. Bringe Pflanzen zum Tauschen!<br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "aGfcMDHLTZTr7C5nm",
    time_lastedit: {
      $date: "2024-06-30T07:55:16.693+0000",
    },
    time_created: {
      $date: "2024-06-03T12:16:48.100+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:00:00.000+0000",
    },
    createdBy: "Ivette",
    categories: [],
    participants: [
      {
        user: "Sacha",
        companions: 0,
      },
      {
        user: "Keelby",
        companions: 0,
      },
      {
        user: "Karry",
        companions: 0,
      },
      {
        user: "Rog",
        companions: 0,
      },
      {
        user: "Gregorio",
        companions: 0,
      },
      {
        user: "Dion",
        companions: 0,
      },
    ],
  },
  {
    _id: "pphRtJnNg9zBkb3pJ",
    title: "Swing Tanzen",
    description:
      "<p>Du wirst viel tanzen und einen Einblick in die Welt des Swing,  Lindy Hop bekommen, im Bereich des Solo Jazz. Für diesen Kurs sind keine Vorkenntnisse erforderlich. Auch wer meint, zwei linke Füsse zu haben, ist herzlich willkommen. </p>",
    venue: {
      name: "Treffpunkt Kollerwiese beim Spielewagen",
    },
    room: "Bei Schlechtem Wetter: Im Saal im GZ Heuried",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 31,
    region: "h4MnI3psRr8hSljk2",
    courseId: "9mxiAFyyN7YmfFhZA",
    time_lastedit: {
      $date: "2024-09-13T07:58:04.636+0000",
    },
    time_created: {
      $date: "2024-05-31T13:57:52.192+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:30:00.000+0000",
    },
    createdBy: "Terri-jo",
    categories: ["sports", "culture"],
    participants: [
      {
        user: "Dorice",
        companions: 0,
      },
      {
        user: "Wyn",
        companions: 0,
      },
      {
        user: "Em",
        companions: 0,
      },
      {
        user: "Elvis",
        companions: 0,
      },
      {
        user: "Hayes",
        companions: 1,
      },
      {
        user: "Cam",
        companions: 1,
      },
      {
        user: "Selia",
        companions: 1,
      },
      {
        user: "Burnard",
        companions: 0,
      },
      {
        user: "Wilhelmina",
        companions: 0,
      },
      {
        user: "Darrick",
        companions: 1,
      },
      {
        user: "Georgia",
        companions: 0,
      },
      {
        user: "Gal",
        companions: 1,
      },
      {
        user: "Des",
        companions: 0,
      },
      {
        user: "Zahara",
        companions: 0,
      },
      {
        user: "Sheilakathryn",
        companions: 0,
      },
      {
        user: "Marleah",
        companions: 0,
      },
      {
        user: "Hewie",
        companions: 0,
      },
      {
        user: "Loreen",
        companions: 0,
      },
    ],
  },
  {
    _id: "rQjs9suRcPyFn5b9w",
    title: "Künstliche Intelligenz (KI) - nur ChatGPT oder mehr?",
    description:
      "<p>Erfahren Sie, wie KI-Systeme funktionieren und sich von klassischen Computern unterscheiden. Entdecken Sie, in welchen Bereichen KI bereits heute eingesetzt wird und welche tiefgreifenden Auswirkungen sie auf Arbeitswelt und Gesellschaft hat. Ist KI nur ein Hype oder die nächste grosse Revolution?</p>",
    venue: {
      name: "Kirchgemeinde Zürich - Haus Neumünsterallee",
      _id: "4yKN8ercQt55B9bEt",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "9NuuA7h2EoCvznGF9",
    time_lastedit: {
      $date: "2024-06-03T09:44:11.112+0000",
    },
    time_created: {
      $date: "2024-06-03T08:54:23.768+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:00:00.000+0000",
    },
    createdBy: "Bren",
    categories: ["computer", "misc", "sciences"],
    participants: [
      {
        user: "Hamilton",
        companions: 0,
      },
      {
        user: "Alexandros",
        companions: 0,
      },
      {
        user: "Marysa",
        companions: 0,
      },
      {
        user: "Helen",
        companions: 0,
      },
      {
        user: "Ryan",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Fax",
        companions: 0,
      },
      {
        user: "Maryjo",
        companions: 0,
      },
      {
        user: "Garrick",
        companions: 0,
      },
      {
        user: "Drusy",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Arabele",
        companions: 0,
      },
      {
        user: "Wilfred",
        companions: 0,
      },
      {
        user: "Roberto",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 0,
      },
      {
        user: "Germayne",
        companions: 1,
      },
      {
        user: "Vinny",
        companions: 0,
      },
      {
        user: "Sumner",
        companions: 0,
      },
      {
        user: "Dion",
        companions: 0,
      },
      {
        user: "Alison",
        companions: 0,
      },
      {
        user: "Che",
        companions: 0,
      },
      {
        user: "Saraann",
        companions: 0,
      },
      {
        user: "Liz",
        companions: 0,
      },
      {
        user: "Nester",
        companions: 1,
      },
      {
        user: "Angelita",
        companions: 0,
      },
      {
        user: "Gregorio",
        companions: 0,
      },
      {
        user: "Sophie",
        companions: 0,
      },
    ],
  },
  {
    _id: "poGabjqWmkkgPzM7o",
    title: "Was ist Gospel?",
    description:
      "Stefan und Roger  erklären Dir was Gospel ist und woher er kommt, sie zeigen mit Hörbeispielen traditionelle und neue Songs. Falls Du in der anschliessenden Probe (19.30 Uhr) mitsingen möchtest, melde dich bitte auf info@gospelsinger.ch an, nur so können wir genügend Noten bereithalten.",
    venue: {
      name: "GZ Höngg - Lektion in der Kirche Heilig Geist",
    },
    room: "Saal rechts im Erdgeschoss",
    internal: false,
    sendReminder: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "5fGuaTNYtXQH56N9Y",
    time_lastedit: {
      $date: "2024-08-31T10:11:20.036+0000",
    },
    time_created: {
      $date: "2024-04-09T17:35:07.334+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T16:45:00.000+0000",
    },
    end: {
      $date: "2024-09-16T17:15:00.000+0000",
    },
    createdBy: "Olav",
    categories: ["culture"],
    noRsvp: false,
    participants: [
      {
        user: "Marleah",
        companions: 0,
      },
      {
        user: "Raven",
        companions: 0,
      },
      {
        user: "Jo-anne",
        companions: 0,
      },
      {
        user: "Jerry",
        companions: 0,
      },
    ],
  },
  {
    _id: "yfdWfgJoYF6dZb8xP",
    title: "Finde dein Projekt für unseren Planeten",
    description:
      '<p>Macht dir die Klimakrise Sorgen? Hast du deinen Fussabdruck reduziert, aber das reicht nicht? Zeit, deinen <a href="https://www.handabdruck.eu/" rel="nofollow">Handabdruck</a> zu vergrössern – eine Aktion zu starten, die über dein eigenes Handeln hinaus wirkt. Wir erforschen deine Talente und suchen dein Projekt zum Erhalt unserer Lebensgrundlage. Durchführung ab 4 Anmeldungen.</p>',
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "iZkhzzMMP4kB3xZvW",
    time_lastedit: {
      $date: "2024-09-01T09:09:43.964+0000",
    },
    time_created: {
      $date: "2024-06-04T11:32:38.388+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:30:00.000+0000",
    },
    createdBy: "Shirlee",
    categories: ["misc"],
    canceled: true,
  },
  {
    _id: "KzhunzkM2wpBYfbFk",
    title: "Nur eine Geschichte? Die Werte des Erzählens mit Kleinkindern entdecken.",
    description:
      "<p>Kinder lieben Geschichten und Bilderbücher. Ein spannender Workshop mit Ideen, Tipps und Austauschen, die das Erzählen zu Hause aufblühen lassen. Wir werden entdecken, dass jedes Buch etwas zu erzählen hat, unabhängig von seiner Sprache.</p><p>Tauch mit in die Welt des Erzählens ein!</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "d6e2MFZkt3GPniv7w",
    time_lastedit: {
      $date: "2024-06-26T06:04:55.358+0000",
    },
    time_created: {
      $date: "2024-05-31T13:27:16.410+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T17:15:00.000+0000",
    },
    end: {
      $date: "2024-09-16T18:15:00.000+0000",
    },
    createdBy: "Arabela",
    categories: ["culture"],
    participants: [
      {
        user: "Christine",
        companions: 0,
      },
      {
        user: "Xenos",
        companions: 0,
      },
      {
        user: "Ginevra",
        companions: 0,
      },
      {
        user: "Betta",
        companions: 0,
      },
    ],
  },
  {
    _id: "L3QJd23fEQFNpcpjC",
    title: "Wald und Bäume in der Literatur",
    description:
      "<p>Bäume und Wälder sind eine Quelle der Inspiration. Auch für SchriftstellerInnen und PoetInnen. Ihre Gedanken widerspiegeln sich in literarischen Texten. Präsentiert wird eine subjektive Auswahl von Texten und Gedichten. Untermalt mit Fotos der Buchenwälder im Vallemaggia. Ein poetischer Abend!</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "vn5j2TpLz5nffRRGs",
    time_lastedit: {
      $date: "2024-05-26T08:46:37.168+0000",
    },
    time_created: {
      $date: "2024-05-26T08:46:37.168+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-16T18:00:00.000+0000",
    },
    end: {
      $date: "2024-09-16T19:00:00.000+0000",
    },
    createdBy: "Giordano",
    categories: ["culture"],
    participants: [
      {
        user: "Brenn",
        companions: 0,
      },
      {
        user: "Edita",
        companions: 0,
      },
      {
        user: "Maisey",
        companions: 0,
      },
      {
        user: "Gerrilee",
        companions: 0,
      },
    ],
  },
  {
    _id: "z6nTryoMSEeeWxicD",
    title: "Was für ein Flöten-Gedudel!",
    description:
      '<p>Hast Du auch noch so einen "Speuzknebel" zuhause rumliegen? Juckt es Dich vielleicht in den Fingern, wenn Du ihn siehst? In diesem Workshop werden wir anhand einfacher Melodien und mittels Improvisation unseren Kindheitsinstrumenten wieder einmal Leben einzuhauchen versuchen. Just for fun!<br /></p>',
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im Wartsaal Wipkingen",
      _id: "TnE8M5syuvwnCmofQ",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "bShsnbp4B9SNwnMzX",
    time_lastedit: {
      $date: "2024-06-30T08:03:22.652+0000",
    },
    time_created: {
      $date: "2024-06-01T18:14:07.683+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T08:00:00.000+0000",
    },
    createdBy: "Brynn",
    categories: ["misc"],
    participants: [
      {
        user: "Basia",
        companions: 0,
      },
      {
        user: "Ivan",
        companions: 0,
      },
      {
        user: "Wilbert",
        companions: 0,
      },
      {
        user: "Danita",
        companions: 0,
      },
      {
        user: "Brittan",
        companions: 0,
      },
      {
        user: "Clerc",
        companions: 0,
      },
      {
        user: "Lenard",
        companions: 0,
      },
      {
        user: "Read",
        companions: 0,
      },
      {
        user: "Cort",
        companions: 0,
      },
      {
        user: "Shena",
        companions: 0,
      },
    ],
  },
  {
    _id: "JQMpzYKn3r9euc86m",
    title: "Kollektiv entscheiden - Das Konsent-Verfahren kennen lernen",
    description:
      '<p>In Gruppen entscheiden klingt anstrengend. Das muss nicht sein. Das Konsent-Verfahren ist als Prozess klar in Runden strukturiert. Eine Entscheidung liegt vor, wenn niemand einen Einwand hat. In diesem Workshop stellt Oli den Konsent-Prozess vor, und wir üben an einem Beispiel. Pic Link: <a href="http://t.ly/GQd8t" rel="nofollow">t.ly/GQd8t</a></p>',
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Leselounge (2. OG)",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "6C6FznmcjWMKhBbTW",
    time_lastedit: {
      $date: "2024-08-22T12:48:52.437+0000",
    },
    time_created: {
      $date: "2024-05-23T12:00:02.601+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T10:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T11:00:00.000+0000",
    },
    createdBy: "Obadiah",
    categories: ["misc"],
    participants: [
      {
        user: "Holly",
        companions: 0,
      },
      {
        user: "Rudyard",
        companions: 0,
      },
      {
        user: "Collette",
        companions: 0,
      },
      {
        user: "Karrie",
        companions: 0,
      },
      {
        user: "Lanita",
        companions: 0,
      },
      {
        user: "Eb",
        companions: 1,
      },
      {
        user: "Haven",
        companions: 1,
      },
      {
        user: "Sharity",
        companions: 0,
      },
      {
        user: "Jasmin",
        companions: 0,
      },
      {
        user: "Leland",
        companions: 0,
      },
      {
        user: "Sawyer",
        companions: 0,
      },
    ],
  },
  {
    _id: "RdNNymzjz3fk7H7qp",
    title: "Embodiment | Vom Kopf in den Körper",
    description:
      "<p>🤸‍♀️ Über den Mittag dein Bewusstsein spielerisch vom Kopf in den Körper bringen?<br /></p><p>Gemeinsame Bewegungs- &amp; Atemübungen: Auf kreative Art &amp; Weise bringen wir unsere Energie ins Fliessen und Geben unserem Innenleben einen Ausdruck durch Atmen, Tönen, Schütteln, Tanzen, Bewegen… </p><p>Bitte ziehe an oder bringe bequeme Kleidung mit.</p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3. OG ",
    internal: false,
    sendReminder: true,
    maxParticipants: 18,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Kwdocb6GZcbkJi65T",
    time_lastedit: {
      $date: "2024-09-12T09:46:01.182+0000",
    },
    time_created: {
      $date: "2024-04-09T15:15:50.403+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T10:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T11:30:00.000+0000",
    },
    createdBy: "Doretta",
    categories: ["sports", "misc"],
    participants: [
      {
        user: "Evania",
        companions: 0,
      },
      {
        user: "Alard",
        companions: 0,
      },
      {
        user: "Harrison",
        companions: 0,
      },
      {
        user: "Adelbert",
        companions: 0,
      },
      {
        user: "Nelle",
        companions: 0,
      },
      {
        user: "Ermentrude",
        companions: 0,
      },
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Jacynth",
        companions: 0,
      },
      {
        user: "Jasmin",
        companions: 0,
      },
      {
        user: "Allie",
        companions: 1,
      },
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Niel",
        companions: 0,
      },
      {
        user: "Lanie",
        companions: 0,
      },
    ],
    noRsvp: false,
    canceled: true,
  },
  {
    _id: "BHsnZkJhAYi5yNzsz",
    title: "Öppis über Hottinge, 3. Auflage :)",
    description:
      "<p>Ein Spaziergang durch das Quartier mit vielen Seitenblicken in die Vergangenheit.</p><p>Treffpunkt am Dienstag, 17. Sept. 2024 um 14 Uhr vor dem GZ Gemeindestrasse 54, Dauer ca. zwei Stunden, Schluss beim Schauspielhaus.<br />Ausweichdatum bei sehr schlechtem Wetter: Donnerstag, 19. Sept. 2024, gleiche Zeit, gleicher Ort.<br /></p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "vqx3jmKEcJJ7v7aDq",
    time_lastedit: {
      $date: "2024-09-11T14:50:57.416+0000",
    },
    time_created: {
      $date: "2024-03-24T19:35:33.668+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T14:00:00.000+0000",
    },
    createdBy: "Shirlee",
    categories: ["sports"],
    participants: [
      {
        user: "Car",
        companions: 0,
      },
      {
        user: "Tybi",
        companions: 0,
      },
      {
        user: "Helge",
        companions: 0,
      },
      {
        user: "Beatriz",
        companions: 0,
      },
      {
        user: "Reagan",
        companions: 0,
      },
      {
        user: "Loretta",
        companions: 0,
      },
      {
        user: "Tudor",
        companions: 0,
      },
      {
        user: "Warden",
        companions: 0,
      },
      {
        user: "Alano",
        companions: 0,
      },
      {
        user: "Megan",
        companions: 0,
      },
      {
        user: "Biddie",
        companions: 0,
      },
      {
        user: "Bili",
        companions: 0,
      },
      {
        user: "Eldredge",
        companions: 0,
      },
      {
        user: "Edan",
        companions: 0,
      },
      {
        user: "Jourdan",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "HrGmP5qmYKFGq32Fo",
    title:
      "Watercolor Sketching - spielerisch und unkonventionell ganz verschiedene Motive zu skizzieren",
    description:
      "<p>In diesem Kurs lernst du ganz spielerisch und unkonventionell ganz verschiedene Motive zu skizzieren. Mit einfachen Übungen entwickelst du deinen ganz individuellen Zeichnungsstil. Mit Finelinern und Aquarellfarbe entfesselst du deine Kreativität und es gelingen dir einzigartige Werke.</p><p></p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3. OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    maxParticipants: 19,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dgwkFrnLiZiAkKyxT",
    time_lastedit: {
      $date: "2024-08-27T10:44:02.708+0000",
    },
    time_created: {
      $date: "2024-04-09T15:10:15.887+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T14:00:00.000+0000",
    },
    createdBy: "Curtice",
    categories: ["handicraft"],
    participants: [
      {
        user: "Codie",
        companions: 0,
      },
      {
        user: "Alisun",
        companions: 0,
      },
      {
        user: "Nance",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Shena",
        companions: 0,
      },
      {
        user: "Odell",
        companions: 0,
      },
      {
        user: "Derrik",
        companions: 0,
      },
      {
        user: "Bert",
        companions: 0,
      },
      {
        user: "Olly",
        companions: 0,
      },
      {
        user: "Udell",
        companions: 0,
      },
      {
        user: "Lanita",
        companions: 0,
      },
      {
        user: "Marsha",
        companions: 0,
      },
      {
        user: "Pammy",
        companions: 0,
      },
      {
        user: "Car",
        companions: 0,
      },
      {
        user: "Jemmy",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Dyana",
        companions: 1,
      },
      {
        user: "Dacy",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "8XdGAn7ajYqfN3QiJ",
    title: "Afrikanisch traditioneller Tanz",
    description:
      "<p>Tanz ist eine Tradition in Afrika. Wir tanzen tagsüber, weil wir happy sind, wir tanzen zum Feiern von Geburt, Hochzeit, diversen Zeremonien, Ernte etc. und vor allem, weil es uns einfach happy macht uns zu bewegen. Tanze mit! Wir zeigen Dir wie und tanzen zusammen.<br /></p>",
    venue: {
      name: "Ref. Kirchgemeindehaus Witikon",
      _id: "Xf29sPN9nff5tGrv6",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "eHsEN9xRhghsvEq3A",
    time_lastedit: {
      $date: "2024-07-05T14:12:44.874+0000",
    },
    time_created: {
      $date: "2024-05-28T07:31:21.119+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T14:00:00.000+0000",
    },
    createdBy: "Liz",
    categories: ["sports"],
    participants: [
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Jewelle",
        companions: 0,
      },
      {
        user: "Brittan",
        companions: 0,
      },
      {
        user: "Prue",
        companions: 0,
      },
      {
        user: "Anneliese",
        companions: 0,
      },
      {
        user: "Morgan",
        companions: 0,
      },
      {
        user: "Emelyne",
        companions: 0,
      },
      {
        user: "Marcile",
        companions: 0,
      },
      {
        user: "Garnette",
        companions: 0,
      },
      {
        user: "Ardath",
        companions: 0,
      },
      {
        user: "Melany",
        companions: 0,
      },
      {
        user: "Othella",
        companions: 1,
      },
      {
        user: "Sergio",
        companions: 1,
      },
    ],
    canceled: true,
  },
  {
    _id: "L2tZQeWic4PShxwvA",
    title: "Britische Scones",
    description:
      "<p>In diesem Workshop backen wir gemeinsam feinste britischen Scones und geben uns Zeit, diese Kultur von Grossbritannien zu entdecken.  Du bekommst praktische Tipps, wie man die Scones leicht und geschmackvoll macht, und am Schluss probieren wir unsere Waren mit einem gemeinsamen Cream Tea.</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "PZeXmumd2hECiCQxE",
    time_lastedit: {
      $date: "2024-07-02T16:13:07.537+0000",
    },
    time_created: {
      $date: "2024-07-02T14:11:56.078+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T13:30:00.000+0000",
    },
    createdBy: "Herve",
    categories: ["handicraft", "cooking"],
    participants: [
      {
        user: "Hewie",
        companions: 0,
      },
      {
        user: "Laurel",
        companions: 0,
      },
      {
        user: "Lorenza",
        companions: 0,
      },
      {
        user: "Denna",
        companions: 0,
      },
      {
        user: "Lynnelle",
        companions: 0,
      },
      {
        user: "Rees",
        companions: 0,
      },
      {
        user: "Dusty",
        companions: 0,
      },
      {
        user: "Edan",
        companions: 0,
      },
      {
        user: "Constantia",
        companions: 0,
      },
      {
        user: "Farrel",
        companions: 0,
      },
    ],
  },
  {
    _id: "6sRcHtsRXtk2FmioC",
    title: "Relove workshop",
    description:
      "<p>Ob es sich um ein Motten-Löchli am Lieblingspulli, einen Fleck auf der Bluse oder einen Riss in der Jeans handelt. In diesem Workshop zeigen wir dir, wie Kleidungsstücke mit einfachen Handstichen oder kreativen Sujets geflickt und vom Wegwerfen gerettet werden können. </p>",
    venue: {
      name: 'GZ Riesbach - Lektion im "Atelier the pink sheep"',
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "nChyx8oBz7QHi62YN",
    time_lastedit: {
      $date: "2024-08-13T19:57:16.696+0000",
    },
    time_created: {
      $date: "2024-05-16T14:04:14.631+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T16:00:00.000+0000",
    },
    createdBy: "Moreen",
    categories: ["handicraft"],
    participants: [
      {
        user: "Pammy",
        companions: 0,
      },
      {
        user: "Eldon",
        companions: 0,
      },
      {
        user: "Johann",
        companions: 0,
      },
      {
        user: "Chuck",
        companions: 0,
      },
      {
        user: "Aubine",
        companions: 0,
      },
      {
        user: "Dagny",
        companions: 0,
      },
      {
        user: "Marysa",
        companions: 1,
      },
      {
        user: "Cully",
        companions: 0,
      },
    ],
  },
  {
    _id: "cFioqHcqdrYm8aH7o",
    title: "Kreatives Schreiben mit ChatGPT",
    description:
      "ChatGPT kann Ihre Kreativität beflügeln, indem es inspirierende Ideen liefert, unkonventionelle Perspektiven bietet und beim Brainstorming hilft. Durch den Dialog mit ChatGPT können Sie neue Wege entdecken, um Ihre kreativen Grenzen zu erweitern.",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "LLMSg9So939Gm5toT",
    time_lastedit: {
      $date: "2024-08-27T14:11:20.688+0000",
    },
    time_created: {
      $date: "2024-05-31T09:50:48.927+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T15:30:00.000+0000",
    },
    createdBy: "Charis",
    categories: ["culture"],
    participants: [
      {
        user: "Wallis",
        companions: 0,
      },
      {
        user: "Jabez",
        companions: 0,
      },
      {
        user: "Doria",
        companions: 0,
      },
      {
        user: "Burnard",
        companions: 0,
      },
      {
        user: "Robbie",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Catie",
        companions: 0,
      },
      {
        user: "Dorice",
        companions: 0,
      },
      {
        user: "Tudor",
        companions: 0,
      },
    ],
  },
  {
    _id: "axJjZeC7Bzpib5L99",
    title: "Kinderyoga",
    description:
      "<p>Spielerisch bewegen wir uns, verwandeln uns in die Tiere, die in der Geschichte vorkommen und lockern ganz neben bei unseren gesamten Körper und haben Spass. :-)</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ZupAwc6bH6Dj6vNAx",
    time_lastedit: {
      $date: "2024-06-06T12:33:17.453+0000",
    },
    time_created: {
      $date: "2024-05-31T12:41:31.209+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T15:15:00.000+0000",
    },
    createdBy: "Wallie",
    categories: ["sports"],
    participants: [
      {
        user: "Wake",
        companions: 0,
      },
      {
        user: "Jessi",
        companions: 1,
      },
      {
        user: "Nydia",
        companions: 0,
      },
      {
        user: "Tyler",
        companions: 0,
      },
      {
        user: "Anton",
        companions: 0,
      },
    ],
  },
  {
    _id: "TPvC3yaYwHic6YkRq",
    title: "Vegetarische Gerichte aus der persischen Küche",
    description:
      "<p>Unter professioneller Anleitung zaubern wir gemeinsam leckere, authentische Gerichte aus dem Iran. Der Abend verspricht nicht nur kulinarische Highlights, sondern auch jede Menge Spaß und interessante Begegnungen. </p>",
    venue: {
      name: "Ref. Kirchgemeindehaus Witikon",
      _id: "Xf29sPN9nff5tGrv6",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "QtRJQdNauCz4ecKg3",
    time_lastedit: {
      $date: "2024-07-05T14:13:27.732+0000",
    },
    time_created: {
      $date: "2024-05-21T09:02:26.329+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T17:30:00.000+0000",
    },
    createdBy: "Chane",
    categories: ["cooking"],
    participants: [
      {
        user: "Eyde",
        companions: 0,
      },
      {
        user: "Dolli",
        companions: 0,
      },
      {
        user: "Margeaux",
        companions: 0,
      },
      {
        user: "Pen",
        companions: 0,
      },
      {
        user: "Morgen",
        companions: 0,
      },
      {
        user: "Gertruda",
        companions: 0,
      },
      {
        user: "Reuben",
        companions: 0,
      },
      {
        user: "Mirna",
        companions: 0,
      },
      {
        user: "Jean",
        companions: 0,
      },
      {
        user: "Boniface",
        companions: 0,
      },
    ],
  },
  {
    _id: "iBZ3jAQYbwo6LtbAP",
    title: "Schriftzeichen - kein Buch mit sieben Siegeln",
    description:
      "<p>Chinesisch, Japanisch, Koreanisch - wo sind die Unterschiede ihrer Schriftsysteme?  In einer Doppelstunde erkunden wir die Ursprünge der Schriftzeichen und lernen einfache Piktogramme sowie deren Regelhaftigkeit kennen und  haben dabei so manches Aha-Erlebnis. Bitte Papier und Bleistift mitbringen.</p><p><br /></p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "4Qn26ZtghRHhWETqo",
    time_lastedit: {
      $date: "2024-05-30T13:30:22.393+0000",
    },
    time_created: {
      $date: "2024-05-30T13:30:22.393+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T16:40:00.000+0000",
    },
    createdBy: "Lorenza",
    categories: ["languages"],
    participants: [
      {
        user: "Giustino",
        companions: 0,
      },
      {
        user: "Jewelle",
        companions: 0,
      },
      {
        user: "Brynn",
        companions: 0,
      },
      {
        user: "Peg",
        companions: 0,
      },
      {
        user: "Sholom",
        companions: 0,
      },
      {
        user: "Clarisse",
        companions: 0,
      },
      {
        user: "Moyra",
        companions: 0,
      },
      {
        user: "Jourdan",
        companions: 0,
      },
      {
        user: "Brennan",
        companions: 0,
      },
      {
        user: "Susanetta",
        companions: 0,
      },
      {
        user: "Alfonso",
        companions: 0,
      },
      {
        user: "Berkie",
        companions: 0,
      },
    ],
  },
  {
    _id: "obceKev3q2bNeNBvP",
    title: "Konfliktmanagement auf persönlicher Ebene",
    description:
      "<p>Das 1x1 der Konfliktlösung:</p><p>Was ist ein Konflikt? Wie erkenne ich einen Konflikt? Wie gehe ich mit dem damit verbundenen inneren Spannungsfeld um? Gemeinsam finden wir pragmatische, praktische Beispiele für mögliche Lösungen im privaten Umfeld. <br /></p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "fp8Rw8jh3PdTaQweY",
    time_lastedit: {
      $date: "2024-05-28T19:03:54.315+0000",
    },
    time_created: {
      $date: "2024-05-27T06:18:06.473+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T16:30:00.000+0000",
    },
    createdBy: "Ethyl",
    categories: ["culture", "languages"],
    participants: [
      {
        user: "Rhona",
        companions: 0,
      },
      {
        user: "Matteo",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 0,
      },
      {
        user: "Russ",
        companions: 0,
      },
      {
        user: "Tori",
        companions: 0,
      },
      {
        user: "Olvan",
        companions: 0,
      },
      {
        user: "Florenza",
        companions: 0,
      },
      {
        user: "Myer",
        companions: 0,
      },
      {
        user: "Doria",
        companions: 0,
      },
      {
        user: "Brent",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "TnX9ypoWQpbxsppkW",
    title: "Capuns wickeln - «da tuts per tuts»",
    description:
      "<p>Bei «da tuts per tuts» – «von allen für alle» wird gemeinsam gekocht und gegessen. Capuns sind mehr als ein alpines «Feriengericht». Wir bereiten das traditionelle Gericht, von dem es so viele Variationen wie Bündner Grossmütter gibt, pflanzenbasiert und den planetaren Grenzen entsprechend zu. </p>",
    venue: {
      name: "GZ Heuried",
      _id: "PAk5EEYNy9dG8ERPC",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "hp3mNxcdZY6KRa2fh",
    time_lastedit: {
      $date: "2024-09-03T11:23:39.188+0000",
    },
    time_created: {
      $date: "2024-05-24T07:17:14.513+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T19:00:00.000+0000",
    },
    createdBy: "Saloma",
    categories: ["cooking", "culture"],
    participants: [
      {
        user: "Joaquin",
        companions: 1,
      },
      {
        user: "Lib",
        companions: 0,
      },
      {
        user: "Nealson",
        companions: 0,
      },
      {
        user: "Moyra",
        companions: 0,
      },
      {
        user: "Marsha",
        companions: 1,
      },
      {
        user: "Bary",
        companions: 0,
      },
      {
        user: "Rurik",
        companions: 1,
      },
      {
        user: "Rog",
        companions: 0,
      },
      {
        user: "Evania",
        companions: 0,
      },
      {
        user: "Herschel",
        companions: 0,
      },
      {
        user: "Grady",
        companions: 0,
      },
      {
        user: "Seward",
        companions: 0,
      },
    ],
  },
  {
    _id: "r8D75NfFChEnnj9Ke",
    title: "Spanisch für Anfänger*innen",
    description: "<p>Willst du ein bisschen Spanisch lernen? Ich gebe eine kleine Einführung.</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "46EJ8r56uj2RKXpha",
    time_lastedit: {
      $date: "2024-05-24T12:02:21.502+0000",
    },
    time_created: {
      $date: "2024-05-24T12:02:21.502+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T17:00:00.000+0000",
    },
    createdBy: "Nevil",
    categories: ["languages"],
    participants: [
      {
        user: "Caroline",
        companions: 0,
      },
      {
        user: "Rees",
        companions: 0,
      },
      {
        user: "Berkie",
        companions: 0,
      },
      {
        user: "Jillana",
        companions: 0,
      },
      {
        user: "Fanechka",
        companions: 0,
      },
      {
        user: "Curt",
        companions: 0,
      },
    ],
  },
  {
    _id: "Y2KvSegEgySEj6Aqj",
    title: "Tiere aus Perlen und Draht",
    description:
      "<p>Das Basteln von zierlichen Perlentieren erfordert Geduld und Liebe zum Detail. Es werden vorbereitete Tiere abgegeben, welche fertiggebastelt werden können. Ein Anleitungsblatt mit Tipps und Tricks hilft ausserdem zuhause weiter zu basteln. </p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "kleiner Kursraum (UG)",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Nq85CGazSzkM2sq4a",
    time_lastedit: {
      $date: "2024-06-10T12:41:14.745+0000",
    },
    time_created: {
      $date: "2024-05-30T08:33:05.145+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T18:00:00.000+0000",
    },
    createdBy: "Letitia",
    categories: ["handicraft"],
    participants: [
      {
        user: "Jabez",
        companions: 0,
      },
      {
        user: "Judye",
        companions: 1,
      },
      {
        user: "Ewan",
        companions: 0,
      },
      {
        user: "Avril",
        companions: 0,
      },
      {
        user: "Fanechka",
        companions: 0,
      },
    ],
  },
  {
    _id: "cS7yYGbJsvqvQt6JN",
    title: "ADHS – Achtsamkeit statt Medikamente",
    description:
      "<p>Achtsamkeit kann besser gegen ADHS-Symptome wirken als Medikamente. Mit 45 erfuhr ich von meiner ADHS. Mit Achtsamkeit lernte ich meinen Fokus zu steuern und mein Verhalten zu korrigieren. In diesem Workshop zeige ich wie, anhand von den Themen Mindwandering, Stress, Emotionen und Selbstwahrnehmung.</p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "w5ZDwqJdCoz9Yhg7G",
    time_lastedit: {
      $date: "2024-06-03T08:56:38.224+0000",
    },
    time_created: {
      $date: "2024-05-31T11:50:49.500+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T17:30:00.000+0000",
    },
    createdBy: "Dorris",
    categories: [],
    participants: [
      {
        user: "Shayne",
        companions: 1,
      },
      {
        user: "Olvan",
        companions: 0,
      },
      {
        user: "Ramonda",
        companions: 0,
      },
      {
        user: "Jessika",
        companions: 0,
      },
      {
        user: "Norma",
        companions: 0,
      },
      {
        user: "Reilly",
        companions: 0,
      },
      {
        user: "Gabriela",
        companions: 0,
      },
      {
        user: "Carl",
        companions: 1,
      },
      {
        user: "Rudolph",
        companions: 0,
      },
      {
        user: "Amitie",
        companions: 1,
      },
      {
        user: "Garrick",
        companions: 1,
      },
      {
        user: "Dov",
        companions: 0,
      },
      {
        user: "Brent",
        companions: 0,
      },
      {
        user: "Josefa",
        companions: 0,
      },
      {
        user: "Aimee",
        companions: 0,
      },
      {
        user: "Greggory",
        companions: 0,
      },
      {
        user: "Carlee",
        companions: 0,
      },
      {
        user: "Wini",
        companions: 0,
      },
      {
        user: "Janis",
        companions: 0,
      },
    ],
  },
  {
    _id: "8irjoCBahseyGLsfi",
    title: "Forumtheater",
    description:
      "<p>Wenn es um Gender- und Diversity-Themen geht, stossen wir immer wieder auf Abwehrmechanismen. Das Forumtheater bietet die Möglichkeit, gemeinsam zu üben, wie wir diese Widerstände in einer konkreten Situation auflösen und gleichzeitig für unsere Werte einstehen können. </p>",
    venue: {
      name: "LeLabor",
      _id: "uXHwNfdnZjun4C2yN",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Brsy8BuEup6yh6dfx",
    time_lastedit: {
      $date: "2024-05-23T09:22:29.132+0000",
    },
    time_created: {
      $date: "2024-03-13T08:50:01.807+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T18:30:00.000+0000",
    },
    createdBy: "Cully",
    categories: ["culture"],
    noRsvp: false,
    participants: [
      {
        user: "Dusty",
        companions: 0,
      },
      {
        user: "Olav",
        companions: 0,
      },
      {
        user: "Dian",
        companions: 0,
      },
      {
        user: "Leela",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "TJ3E6KXaBHkA4sz8F",
    title: "Wie entsteht ein Gewitterblitz? – Einführung in die Elektrostatik",
    description:
      "<p>Anhand von praktischen Experimenten wird die Elektrostatik anschaulich in Experimenten erklärt. Dazu gehören Ladungsübertrag, Reibungselektrizität und Influenz, sowie Ladungstrennung durch das Zersprühen von Wassertröpfchen. Ausserdem lernen wir einen Gewitterblitzsimulator kennen. </p>",
    venue: {
      name: "Sihlweidstrasse 12",
    },
    room: " ACHTUNG: keine Toilette vorhanden! Option: um 18.45 Uhr im GZ Leimbach (Leimbachstrasse 200) die Toilette noch benutzen",
    internal: false,
    sendReminder: true,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "zu4Pks4FfHa9oPApF",
    time_lastedit: {
      $date: "2024-04-17T15:43:20.285+0000",
    },
    time_created: {
      $date: "2024-04-17T15:43:20.285+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T19:00:00.000+0000",
    },
    createdBy: "Karil",
    categories: ["sciences"],
    participants: [
      {
        user: "Marijn",
        companions: 0,
      },
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Nance",
        companions: 0,
      },
    ],
  },
  {
    _id: "9otsaHbj7J2LmsnCu",
    title: "Input zur Glücksforschung",
    description:
      "Möchtest Du Dein Glück selbst in die Hand nehmen? Wir schauen verschiedene Methoden an, wie Du Dir selbst helfen kannst, um täglich etwas zu Deinem eigenen Glück beizutragen.",
    venue: {
      name: "GZ Höngg (Limmattalstr)",
      _id: "62ejbXBwpdNLjYGbY",
    },
    room: "Galerie",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "mhoMBXPu27Fp4CPFh",
    time_lastedit: {
      $date: "2024-07-09T06:19:52.553+0000",
    },
    time_created: {
      $date: "2024-05-19T10:06:33.792+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T17:45:00.000+0000",
    },
    createdBy: "Codie",
    categories: ["sciences", "misc"],
    participants: [
      {
        user: "Constantia",
        companions: 0,
      },
      {
        user: "Lynnelle",
        companions: 0,
      },
      {
        user: "Seamus",
        companions: 1,
      },
      {
        user: "Aimee",
        companions: 0,
      },
      {
        user: "Faye",
        companions: 1,
      },
      {
        user: "Gal",
        companions: 0,
      },
    ],
  },
  {
    _id: "5z5DDDgR668xBdFQj",
    title: "Patientenverfügung - kein Hexenwerk",
    description:
      "<p>An konkreten Beispielen sprechen wir den Sinn &amp; Zweck einer Patientenverfügung gemeinsam durch. Ihr könnt euch ausserdem vor Ort verschiedene Versionen einer Patientenverfügung anschauen - und auch gleich eine zum Ausfüllen mitnehmen.  (ab 20 Uhr bleibt Zeit noch für einen ungezwungener Austausch)</p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Bistro",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "KRtKDzyquX7JLgKLB",
    time_lastedit: {
      $date: "2024-05-31T12:17:01.413+0000",
    },
    time_created: {
      $date: "2024-05-30T09:18:42.472+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T18:00:00.000+0000",
    },
    createdBy: "Ivan",
    categories: ["misc"],
    participants: [
      {
        user: "Tish",
        companions: 0,
      },
      {
        user: "Rickey",
        companions: 0,
      },
      {
        user: "Vincenz",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Misha",
        companions: 0,
      },
      {
        user: "Maddie",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Alano",
        companions: 0,
      },
      {
        user: "Anatol",
        companions: 0,
      },
      {
        user: "Dagny",
        companions: 0,
      },
      {
        user: "Adair",
        companions: 0,
      },
      {
        user: "Flory",
        companions: 0,
      },
      {
        user: "Olly",
        companions: 1,
      },
      {
        user: "North",
        companions: 0,
      },
      {
        user: "Deck",
        companions: 0,
      },
      {
        user: "Helge",
        companions: 1,
      },
      {
        user: "Celestyn",
        companions: 0,
      },
      {
        user: "Phelia",
        companions: 0,
      },
      {
        user: "Jessi",
        companions: 0,
      },
      {
        user: "Willetta",
        companions: 0,
      },
      {
        user: "Devina",
        companions: 1,
      },
      {
        user: "Yalonda",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 0,
      },
    ],
  },
  {
    _id: "W4nC7hqRA2dbiuM9j",
    title: "Zyklusorientiert Leben",
    description:
      "<p>Der weibliche Zyklus ist so viel mehr als ein Mal im Monat zu bluten. Achtsam gelebt hat jede Woche eine besondere Qualität. Das schafft neue Kräfte für uns Frauen*. </p><p>In dieser Session lernst du die 4 Phasen deines Zyklus kurz kennen und darfst eine davon kreativ erleben. </p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "w8sEZwBbaJnQJ6ek3",
    time_lastedit: {
      $date: "2024-09-05T09:28:41.424+0000",
    },
    time_created: {
      $date: "2024-07-04T06:41:33.053+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T18:30:00.000+0000",
    },
    createdBy: "Benedetto",
    categories: [],
    participants: [
      {
        user: "Chrissie",
        companions: 0,
      },
      {
        user: "Hadria",
        companions: 0,
      },
      {
        user: "Kimble",
        companions: 0,
      },
      {
        user: "Alyssa",
        companions: 0,
      },
      {
        user: "Oswald",
        companions: 1,
      },
      {
        user: "Gratiana",
        companions: 0,
      },
      {
        user: "Kerri",
        companions: 0,
      },
      {
        user: "Illa",
        companions: 0,
      },
      {
        user: "Margeaux",
        companions: 0,
      },
      {
        user: "Ilyse",
        companions: 0,
      },
    ],
  },
  {
    _id: "2NYzbypSEbMoshhm9",
    title: "Das Königsspiel: Schach für Alle!",
    description:
      "<p>Erleben Sie die Faszination Schach! Lernen Sie die Grundlagen, lösen Sie Schachrätsel und spielen Sie gegen andere. Keine Vorerfahrung nötig. Ein Abend voller Spass und Strategie für alle!</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: false,
    noRsvp: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "X4d9xYtPFX7QdokHx",
    time_lastedit: {
      $date: "2024-05-21T10:51:42.662+0000",
    },
    time_created: {
      $date: "2024-05-21T10:24:13.751+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T19:30:00.000+0000",
    },
    createdBy: "Jerad",
    categories: ["misc"],
  },
  {
    _id: "k426xWR24DfnvFFE5",
    title: "Singen im Chor",
    description:
      "<p>Nach Atemübungen und einem Warm-up für die Stimme lernen wir gemeinsam im Kreise anderer Sängerinnen und Sängern verschieden Stücke zu singen: einfache vierstimmige Lieder aus aller Welt und unter anderem auch Händels berühmtes Halleluja. </p>",
    venue: {
      name: "Katholische Kirche Heilig Kreuz",
    },
    room: "Gelber Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "5u5dD7Lg3XgZZSpA8",
    time_lastedit: {
      $date: "2024-06-04T11:40:30.781+0000",
    },
    time_created: {
      $date: "2024-05-21T11:04:20.694+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T18:30:00.000+0000",
    },
    createdBy: "Charis",
    categories: ["culture"],
    participants: [
      {
        user: "Rem",
        companions: 0,
      },
      {
        user: "Grady",
        companions: 0,
      },
      {
        user: "Dolores",
        companions: 0,
      },
      {
        user: "Fanechka",
        companions: 0,
      },
      {
        user: "Ingrid",
        companions: 0,
      },
      {
        user: "Read",
        companions: 0,
      },
      {
        user: "Lurline",
        companions: 0,
      },
      {
        user: "Roman",
        companions: 0,
      },
      {
        user: "Giustino",
        companions: 0,
      },
      {
        user: "Faustine",
        companions: 0,
      },
      {
        user: "Brennan",
        companions: 0,
      },
      {
        user: "Naomi",
        companions: 0,
      },
      {
        user: "Abba",
        companions: 0,
      },
      {
        user: "Merle",
        companions: 0,
      },
      {
        user: "Faustine",
        companions: 0,
      },
      {
        user: "Sacha",
        companions: 0,
      },
      {
        user: "Maye",
        companions: 0,
      },
      {
        user: "Cam",
        companions: 0,
      },
      {
        user: "Carolyn",
        companions: 0,
      },
      {
        user: "Chrysa",
        companions: 0,
      },
      {
        user: "Brynn",
        companions: 0,
      },
      {
        user: "Gallard",
        companions: 0,
      },
      {
        user: "Sacha",
        companions: 0,
      },
      {
        user: "Elli",
        companions: 0,
      },
      {
        user: "Helge",
        companions: 0,
      },
      {
        user: "Gus",
        companions: 0,
      },
      {
        user: "Jillayne",
        companions: 0,
      },
      {
        user: "Susanetta",
        companions: 0,
      },
    ],
  },
  {
    _id: "2ieJSPoxdAr9cwh5C",
    title: "3D-Druck und Scannen in der Kunst",
    description:
      "<p>Entdecken Sie, wie ich 3D-Druck und 3D-Scannen in meinem kreativen Prozess benutze und wie diese Technologien meine Kunst und Werke formen. Ziel ist es, die Teilnehmenden mit innovativen Techniken zu inspirieren.</p><p>Sprache: Englisch</p><p>instagram:_robotto_<br /></p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "SLbxJaCFGHjPm84cm",
    time_lastedit: {
      $date: "2024-05-28T19:04:57.149+0000",
    },
    time_created: {
      $date: "2024-05-26T08:50:43.471+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-17T18:30:00.000+0000",
    },
    createdBy: "Stanford",
    categories: ["culture", "handicraft"],
    participants: [
      {
        user: "Jeremiah",
        companions: 0,
      },
      {
        user: "Arabele",
        companions: 0,
      },
      {
        user: "Melany",
        companions: 0,
      },
      {
        user: "August",
        companions: 0,
      },
      {
        user: "Ingemar",
        companions: 0,
      },
      {
        user: "Hadria",
        companions: 0,
      },
      {
        user: "Fulvia",
        companions: 0,
      },
      {
        user: "Dominique",
        companions: 0,
      },
      {
        user: "Terri-jo",
        companions: 0,
      },
      {
        user: "Davidson",
        companions: 0,
      },
    ],
  },
  {
    _id: "xs5Hegwfjgiw3ZDpZ",
    title: "Unterwasserrugby Lektion im Hallenbad Oerlikon",
    description:
      "<p>Hast du Lust ein Spiel in drei Dimensionen unter Wasser kennenzulernen ?Im Unterwasserrugby versuchst du mit deinem Team, dem Gegner den Ball abzuluchsen. In der Lektion lernst du  auch Schnorchel- und Flossenschwimmgrundlagen, damit du im Spiel Vollgas geben kannst.  </p>",
    venue: {
      name: "Lektion im Hallenbad Oerlikon, Treffpunkt 19:40 beim Eingang ",
    },
    room: "Sprungbecken",
    internal: false,
    sendReminder: true,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qThkbTKxd3BE4xomq",
    time_lastedit: {
      $date: "2024-09-11T12:04:37.201+0000",
    },
    time_created: {
      $date: "2024-03-16T07:29:14.235+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T17:40:00.000+0000",
    },
    end: {
      $date: "2024-09-17T19:45:00.000+0000",
    },
    createdBy: "Sayers",
    categories: ["sports"],
    participants: [
      {
        user: "Bevon",
        companions: 0,
      },
      {
        user: "Nikkie",
        companions: 0,
      },
      {
        user: "Yelena",
        companions: 0,
      },
      {
        user: "Nelle",
        companions: 0,
      },
      {
        user: "Wallie",
        companions: 0,
      },
      {
        user: "Brent",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "cCn8fYEooM63kH28d",
    title: "Einfache Tipps für Handy-Fotos",
    description:
      "<p>Knipsen war früher, jetzt fotografieren wir. Wie wir schon bei der Aufnahme und dann bei der Bearbeitung zu besseren und interessanteren Bildern kommen, erarbeiten wir zusammen anhand von Beispielen und praktischer Arbeit. (Schwerpunkt Android/Samsung)</p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "grosser Kursraum",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "q2mT73hH9RZQZdHTz",
    time_lastedit: {
      $date: "2024-05-30T08:47:57.427+0000",
    },
    time_created: {
      $date: "2024-05-01T07:25:06.079+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-17T18:00:00.000+0000",
    },
    end: {
      $date: "2024-09-17T19:00:00.000+0000",
    },
    createdBy: "Hamilton",
    categories: ["misc"],
    participants: [
      {
        user: "Alyse",
        companions: 0,
      },
      {
        user: "Flory",
        companions: 0,
      },
      {
        user: "Nerissa",
        companions: 0,
      },
      {
        user: "Bartholomeus",
        companions: 0,
      },
      {
        user: "Leanna",
        companions: 0,
      },
      {
        user: "Bob",
        companions: 0,
      },
      {
        user: "Ruth",
        companions: 0,
      },
      {
        user: "Shena",
        companions: 0,
      },
      {
        user: "Benedetto",
        companions: 0,
      },
    ],
  },
  {
    _id: "DF8abAMLixYtqf8Fc",
    title: "Basis-Kinderschminken",
    description:
      "<p>In diesem Kurs lernt man grundlegende Techniken des Kinderschminkens, um einfache Designs zu erstellen.</p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "GZ Hottingen, Gemeindestrasse 54, blauer Saal im 1. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "22oFbq7Kith6QbruQ",
    time_lastedit: {
      $date: "2024-05-29T12:57:01.869+0000",
    },
    time_created: {
      $date: "2024-05-29T11:45:28.537+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T07:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T09:00:00.000+0000",
    },
    createdBy: "Leigh",
    categories: ["misc", "handicraft"],
    participants: [
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Chic",
        companions: 0,
      },
      {
        user: "Sholom",
        companions: 0,
      },
      {
        user: "Adorne",
        companions: 0,
      },
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Zachary",
        companions: 0,
      },
    ],
  },
  {
    _id: "cRRQKYTLTTwqMrSHi",
    title: "Yin Yoga",
    description:
      "<p>YinYoga steht für tiefes Dehnen und Entspannen. Wir verweilen 3-5 Min. in einer Position - liegend oder sitzend. Vertiefe deinen Atem - so entspannt Körper und Geist, dabei sprechen wir die Faszien und deren Ausrichtung im Körper an. YinYoga ist sehr meditativ und hilft dir, Stress abzubauen.</p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "Hottingersaal, 2. Stock im GZ Hottingen",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 14,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ZBpArsf8NymCuS9vW",
    time_lastedit: {
      $date: "2024-06-25T15:44:31.634+0000",
    },
    time_created: {
      $date: "2024-05-16T13:35:30.866+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T09:00:00.000+0000",
    },
    createdBy: "Lorinda",
    categories: ["misc"],
    participants: [
      {
        user: "Mollee",
        companions: 0,
      },
      {
        user: "Carroll",
        companions: 0,
      },
      {
        user: "Levon",
        companions: 0,
      },
      {
        user: "Mag",
        companions: 0,
      },
      {
        user: "Nevile",
        companions: 0,
      },
      {
        user: "Betta",
        companions: 0,
      },
      {
        user: "Brandy",
        companions: 0,
      },
      {
        user: "Tammy",
        companions: 0,
      },
      {
        user: "Windham",
        companions: 0,
      },
      {
        user: "Odell",
        companions: 0,
      },
      {
        user: "Greggory",
        companions: 0,
      },
    ],
  },
  {
    _id: "CpW9NABN5CFXimcDJ",
    title: "Improvisationstheater 60 plus",
    description:
      "<p>Beim Improtheater geht es vor allem ums SPIELEN. Zusammen erfinden wir Geschichten, schlüpfen in Charaktere und nutzen Emotionen. Dazu benutzen wir Herz, Körper und Geist und bleiben mit Humor gemeinsam fit.</p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Raum für Alles",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "5uMbzJoS2Y4RTvTMK",
    time_lastedit: {
      $date: "2024-07-10T06:25:36.253+0000",
    },
    time_created: {
      $date: "2024-05-21T13:55:10.670+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T09:30:00.000+0000",
    },
    createdBy: "Hanny",
    categories: ["culture", "languages"],
    participants: [
      {
        user: "Francesco",
        companions: 0,
      },
      {
        user: "Shantee",
        companions: 0,
      },
      {
        user: "Lora",
        companions: 0,
      },
      {
        user: "Ruth",
        companions: 1,
      },
      {
        user: "Angelita",
        companions: 0,
      },
      {
        user: "Devina",
        companions: 0,
      },
      {
        user: "Tab",
        companions: 1,
      },
      {
        user: "Seward",
        companions: 0,
      },
      {
        user: "Ron",
        companions: 0,
      },
      {
        user: "Garrick",
        companions: 0,
      },
      {
        user: "Darda",
        companions: 0,
      },
    ],
  },
  {
    _id: "FNKk44EPvgKYXqC7R",
    title: "Embodiment | Vom Kopf in den Körper",
    description:
      "<p>🤸‍♀️ Über den Mittag dein Bewusstsein spielerisch vom Kopf in den Körper bringen? </p><p>Gemeinsame Bewegungs- &amp; Atemübungen: Auf kreative Art &amp; Weise bringen wir unsere Energie ins Fliessen und geben unserem Innenleben einen Ausdruck durch Atmen, Tönen, Schütteln, Tanzen, Bewegen… <br /><br />Bitte ziehe an oder bringe bequeme Kleidung mit.<br /></p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "Blauer Saal, 1. Stock",
    internal: false,
    sendReminder: true,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "c9THx6givyKg5v9L4",
    time_lastedit: {
      $date: "2024-09-17T09:08:54.736+0000",
    },
    time_created: {
      $date: "2024-03-21T14:19:37.567+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T10:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T11:30:00.000+0000",
    },
    createdBy: "Charis",
    categories: ["sports"],
    noRsvp: false,
    participants: [
      {
        user: "Dolli",
        companions: 0,
      },
      {
        user: "Aylmer",
        companions: 0,
      },
      {
        user: "Marleah",
        companions: 0,
      },
      {
        user: "Elli",
        companions: 1,
      },
      {
        user: "Caroline",
        companions: 0,
      },
      {
        user: "Shirlee",
        companions: 0,
      },
      {
        user: "Helge",
        companions: 0,
      },
      {
        user: "Kimberly",
        companions: 0,
      },
      {
        user: "Jerry",
        companions: 0,
      },
      {
        user: "Nannette",
        companions: 0,
      },
      {
        user: "Drucill",
        companions: 0,
      },
      {
        user: "Gretel",
        companions: 1,
      },
    ],
  },
  {
    _id: "vwjRpDh8b8HQP7Kp5",
    title: "Prallvoller Kleiderschrank - und doch hats nichts zum Anziehen drin?",
    description:
      "<p>Warum nur ziehen Sie die Teile nicht an? Bringen Sie 4 - 6 Kleidungsstücke mit und erfahren ganz praktisch, wie Sie die Kleider auf Ihre Figur anpassen, ändern oder kombinieren können. Sie erleben live die Wirkung von Schnitt, Farbe, Musterung, Stil und was passt und was eben nicht.</p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "Hottingersaal im 2. Stock",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "fpG2aLF3XFD8Tztaa",
    time_lastedit: {
      $date: "2024-04-03T14:19:47.722+0000",
    },
    time_created: {
      $date: "2024-04-03T14:19:47.722+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T11:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    createdBy: "Lloyd",
    categories: ["misc"],
    participants: [
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Kary",
        companions: 0,
      },
      {
        user: "Iain",
        companions: 1,
      },
      {
        user: "Constantine",
        companions: 0,
      },
      {
        user: "Jessalin",
        companions: 0,
      },
    ],
  },
  {
    _id: "jrP9MfKsDDKPwNqtN",
    title: "Pizzabacken im Holzofen",
    description:
      "<p>Jugendliche kreieren ihre Pizza selbst und backen diese im Holzofen. Ein Erlebnis für alle Sinne. </p>",
    venue: {
      name: "Rebenweg 6, 8041 Zürich ",
    },
    room: "Jugendtreff",
    internal: false,
    sendReminder: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "JYG3dLgNhqziEMaky",
    time_lastedit: {
      $date: "2024-04-18T09:37:20.940+0000",
    },
    time_created: {
      $date: "2024-04-18T09:37:20.940+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    createdBy: "Ardenia",
    categories: ["cooking"],
    participants: [
      {
        user: "Cassandre",
        companions: 0,
      },
      {
        user: "Olly",
        companions: 0,
      },
      {
        user: "Tudor",
        companions: 1,
      },
      {
        user: "Wake",
        companions: 0,
      },
    ],
  },
  {
    _id: "ECAwSm3P8YGso8Hjj",
    title: "Deinen Balkon oder Garten mit Permakultur gestalten",
    description:
      "<p>Wir entdecken die Welt der Permakultur mit ihren Pflanzen und Tieren auf unserem Beckihof und planen spielerisch wie du deinen Garten oder Balkon gestalten kannst. Selbst einen Balkon kannst du in eine  grüne Oase der Vielfalt mit viel Essbarem verwandeln.</p>",
    venue: {
      name: 'GZ Höngg - Lektion im "Beckihof"',
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ExC8XLxjdhGp45nit",
    time_lastedit: {
      $date: "2024-08-28T06:19:23.528+0000",
    },
    time_created: {
      $date: "2024-05-13T12:39:25.474+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T14:00:00.000+0000",
    },
    createdBy: "Inglebert",
    categories: ["misc", "sciences"],
    participants: [
      {
        user: "Ertha",
        companions: 0,
      },
      {
        user: "Brier",
        companions: 0,
      },
      {
        user: "Gayler",
        companions: 0,
      },
      {
        user: "Donnie",
        companions: 0,
      },
      {
        user: "Cassandre",
        companions: 0,
      },
      {
        user: "Brier",
        companions: 0,
      },
      {
        user: "Seward",
        companions: 0,
      },
      {
        user: "Seamus",
        companions: 0,
      },
      {
        user: "Marylou",
        companions: 0,
      },
      {
        user: "Tammy",
        companions: 1,
      },
      {
        user: "Rafaelia",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
    ],
  },
  {
    _id: "PACsGPXr3wr2tDfaJ",
    title: "Tonen mit Kindern",
    description:
      "<p>Du kannst selber eine kleine Tonschale zum Thema Herbst gestalten. Wir suchen in der Natur Blätter usw. und benutzen diese um  Strukturen in der Schale zu gestalten. Mit Engoben kannst du die Schale dann anmalen. 2 Wochen später kannst du die gebrannten Schalen bei uns abholen.  </p>",
    venue: {
      name: "Reformierte Kirche im Gut",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "mEwQBuF65M3AYQ8Sh",
    time_lastedit: {
      $date: "2024-05-14T12:47:47.455+0000",
    },
    time_created: {
      $date: "2024-05-14T12:47:47.455+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T14:00:00.000+0000",
    },
    createdBy: "Eb",
    categories: ["handicraft"],
    participants: [
      {
        user: "Cort",
        companions: 1,
      },
      {
        user: "Meredeth",
        companions: 1,
      },
      {
        user: "Chuck",
        companions: 1,
      },
      {
        user: "Malissia",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 0,
      },
      {
        user: "Jerrie",
        companions: 0,
      },
    ],
  },
  {
    _id: "PFASg5AnMrQaNot5h",
    title: "Collagen erstellen",
    description:
      "<p>Collagen erstellen mit Papier, Zeitungen, Fotos oder alten Briefen. Strukturpasten und Aqrylfarben ergänzen die kreativen Möglichkeiten und es entstehen individuelle Kunstwerke. </p><p>Malkittel und wer mag, Briefe, Fotos.......mitbringen. Restliche Materialien sind vorhanden. </p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "Flex 2",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "6ssiq6nYb2nQujyF7",
    time_lastedit: {
      $date: "2024-05-22T13:43:51.745+0000",
    },
    time_created: {
      $date: "2024-05-22T13:43:51.745+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T14:00:00.000+0000",
    },
    createdBy: "Chaim",
    categories: ["handicraft", "culture"],
    participants: [
      {
        user: "Adorne",
        companions: 0,
      },
      {
        user: "Nikkie",
        companions: 0,
      },
      {
        user: "Killy",
        companions: 0,
      },
      {
        user: "Katti",
        companions: 0,
      },
      {
        user: "Even",
        companions: 1,
      },
      {
        user: "Maisey",
        companions: 0,
      },
      {
        user: "Devina",
        companions: 0,
      },
      {
        user: "Joell",
        companions: 0,
      },
      {
        user: "Lorinda",
        companions: 0,
      },
    ],
  },
  {
    _id: "pvnDXMA5vqqiG7765",
    title: "Trampolin, Hula Hoop, Jonglage und Einrad schnuppern",
    description:
      '<p>Wir starten unsere Abschlussfeier von unserem Angebot "Spielmobil on Tour" mit einem Workshop. Du wirst unter professioneller Anleitung je nach Interesse in die Disziplinen kleines Trampolin, Hula Hoop, Jonglage oder Einrad eingeführt.  (Foto: Gene Gallin)</p>',
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "im Schigu Park",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "iHdn3f4pNwruQshur",
    time_lastedit: {
      $date: "2024-05-31T08:05:17.972+0000",
    },
    time_created: {
      $date: "2024-05-31T08:05:17.972+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T13:00:00.000+0000",
    },
    createdBy: "Marleah",
    categories: ["sports"],
    participants: [
      {
        user: "Windham",
        companions: 1,
      },
      {
        user: "Izaak",
        companions: 1,
      },
      {
        user: "Abe",
        companions: 1,
      },
      {
        user: "Leslie",
        companions: 1,
      },
      {
        user: "Cort",
        companions: 0,
      },
      {
        user: "Violetta",
        companions: 0,
      },
      {
        user: "Ettie",
        companions: 0,
      },
      {
        user: "Briant",
        companions: 0,
      },
    ],
  },
  {
    _id: "CNBe3e9nA5ZkX9qhN",
    title: "Perkussion für alle",
    description:
      "<p>Lerne verschiedene Perkussions - und Schlagzeuginstrumente kennen und erforsche die verschiedenen Sounds<br /></p>",
    venue: {
      name: "Ref. Kirchgemeindehaus Witikon",
      _id: "Xf29sPN9nff5tGrv6",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 23,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ZmEHqWgaBq7BjoxP4",
    time_lastedit: {
      $date: "2024-09-13T12:58:34.237+0000",
    },
    time_created: {
      $date: "2024-05-31T08:48:20.740+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T14:00:00.000+0000",
    },
    createdBy: "Flin",
    categories: ["culture"],
    participants: [
      {
        user: "Pavlov",
        companions: 1,
      },
      {
        user: "Lesya",
        companions: 0,
      },
      {
        user: "D'arcy",
        companions: 0,
      },
      {
        user: "Jeffy",
        companions: 1,
      },
      {
        user: "Tammy",
        companions: 0,
      },
      {
        user: "Rhona",
        companions: 1,
      },
      {
        user: "Ivette",
        companions: 0,
      },
      {
        user: "Jessalin",
        companions: 0,
      },
      {
        user: "Gawain",
        companions: 0,
      },
      {
        user: "Dasha",
        companions: 0,
      },
      {
        user: "Cassandre",
        companions: 0,
      },
      {
        user: "Peterus",
        companions: 1,
      },
      {
        user: "Yurik",
        companions: 0,
      },
    ],
  },
  {
    _id: "SGushB5P9kYzyoqXB",
    title: "Improvisationstheater für Einsteiger:Innen",
    description:
      "<p>Gemeinsam probieren wir uns in der Kunst des Improvisationstheaters. Lachen, zusammen Ja-sagen und die Freude am Ausprobieren stehen im Vordergrund. Mit kleinen Übungen entdecken wir in diesen 2 Stunden den Spass am improvisierten Schauspiel.</p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "GZ Hottingen, Standort Gemeindestrasse, Hottingersaal im 2. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "unWM5Q8SBPT2TNCqJ",
    time_lastedit: {
      $date: "2024-06-04T12:39:30.485+0000",
    },
    time_created: {
      $date: "2024-05-22T10:00:38.812+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T15:00:00.000+0000",
    },
    createdBy: "Calla",
    categories: ["misc"],
    participants: [
      {
        user: "Aubine",
        companions: 0,
      },
      {
        user: "Celie",
        companions: 0,
      },
      {
        user: "Amery",
        companions: 0,
      },
      {
        user: "Bev",
        companions: 0,
      },
      {
        user: "Wini",
        companions: 0,
      },
      {
        user: "Kalli",
        companions: 1,
      },
      {
        user: "Eulalie",
        companions: 0,
      },
      {
        user: "Dean",
        companions: 0,
      },
      {
        user: "Letitia",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Cacilia",
        companions: 0,
      },
      {
        user: "Phylys",
        companions: 0,
      },
      {
        user: "Katinka",
        companions: 0,
      },
    ],
  },
  {
    _id: "zy4CTv7FRsMPtQCpk",
    title: "Kinderbuchlesung Knolles Reise",
    description:
      "<p>Diese interaktive Lesung zu der von mir geschriebenen Geschichte “Knolles Reise – Abenteuer in Illnau” handelt von einem erzgebirgischen Räuchermännchen, das nach Weihnachten nicht zurück in den Keller will, sondern wegläuft und Abenteuer erlebt. Zwischendurch wird auch gesungen und getanzt.</p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Kinderbereich (1.OG)",
    internal: false,
    sendReminder: false,
    noRsvp: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "zWnDJivQFCmz6EHPb",
    time_lastedit: {
      $date: "2024-06-27T14:14:14.568+0000",
    },
    time_created: {
      $date: "2024-06-03T10:55:06.919+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T14:30:00.000+0000",
    },
    createdBy: "Stevana",
    categories: ["misc"],
  },
  {
    _id: "QEcyzMDcfQzd4DCJr",
    title: "Autobahn der Gedanken - Wie finde ich die Ausfahrt zu meinem inneren Frieden?",
    description:
      "<p>Kennst du Gedanken wie: Ich muss doch… Warum habe ich nicht… Was wäre wenn… Willst du deinen Gedanken eine neue Richtung geben und einen liebevolleren inneren Dialog führen? Setze den Blinker, wechsle die Spur und du wirst staunen, was für Wege du entdeckst. Ich freue mich auf die Fahrt mit dir.</p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "AgMKwXtLYfxCckdMz",
    time_lastedit: {
      $date: "2024-06-03T19:14:41.430+0000",
    },
    time_created: {
      $date: "2024-06-03T19:11:56.744+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T14:30:00.000+0000",
    },
    createdBy: "Gabriela",
    categories: ["misc"],
    participants: [
      {
        user: "Marsha",
        companions: 0,
      },
      {
        user: "Ellette",
        companions: 0,
      },
      {
        user: "Cammi",
        companions: 0,
      },
      {
        user: "Turner",
        companions: 0,
      },
      {
        user: "Pollyanna",
        companions: 0,
      },
      {
        user: "Tammara",
        companions: 0,
      },
      {
        user: "Heath",
        companions: 0,
      },
    ],
  },
  {
    _id: "qBGWQPZNYXRehJ6CF",
    title: "Machine Learning für Kinder",
    description:
      "<p>In diesem Kurs lernen Kinder spielerisch, was Machine Learning ist und wie eine Maschine lernt - manchmal auch fehlerhaft. Wir programmieren ein Computermodell, das bildbasiert z. B. ein Feuerpokémon erkennen soll (image recognition). Keine Vorkenntnisse erforderlich, eigener Laptop empfohlen.</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "XTQQQr3jKK7jyJ7dK",
    time_lastedit: {
      $date: "2024-05-27T07:07:19.493+0000",
    },
    time_created: {
      $date: "2024-05-26T08:52:11.914+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T15:30:00.000+0000",
    },
    createdBy: "Alma",
    categories: ["computer", "misc"],
    participants: [
      {
        user: "Putnam",
        companions: 0,
      },
      {
        user: "Lib",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "WSYQo76GJbBE9NKj2",
    title: "Spaziergang: Unsere Wild- und Heilpflanzen entdecken",
    description:
      "<p>Wir streifen durch die umliegenden Wiesen und zeigen die essbaren Wildkräuter und heilsamen Arzneipflanzen, die im September bei uns wachsen. Wir naschen davon, um die Inhaltsstoffe mit unseren eigenen Sinnen wahrzunehmen und sammeln für einen feinen Tee oder Salat.</p>",
    venue: {
      name: "GZ Heuried",
      _id: "PAk5EEYNy9dG8ERPC",
    },
    room: "Treffpunkt: Vor dem Haupteingang GZ Heuried ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 22,
    region: "h4MnI3psRr8hSljk2",
    courseId: "rNpAJKGeksf6NzMad",
    time_lastedit: {
      $date: "2024-09-17T12:03:46.880+0000",
    },
    time_created: {
      $date: "2024-05-30T07:44:50.318+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    createdBy: "Chrissie",
    categories: ["sciences", "cooking"],
    participants: [
      {
        user: "Josefa",
        companions: 0,
      },
      {
        user: "Norah",
        companions: 0,
      },
      {
        user: "Sonya",
        companions: 0,
      },
      {
        user: "Barbey",
        companions: 0,
      },
      {
        user: "Chariot",
        companions: 0,
      },
      {
        user: "Mariellen",
        companions: 0,
      },
      {
        user: "Annnora",
        companions: 0,
      },
      {
        user: "Buck",
        companions: 1,
      },
      {
        user: "Dusty",
        companions: 0,
      },
      {
        user: "Nickey",
        companions: 0,
      },
      {
        user: "Gery",
        companions: 0,
      },
      {
        user: "Jerry",
        companions: 0,
      },
      {
        user: "Roman",
        companions: 0,
      },
      {
        user: "Darda",
        companions: 0,
      },
      {
        user: "Dione",
        companions: 0,
      },
      {
        user: "Wylma",
        companions: 0,
      },
      {
        user: "Karney",
        companions: 0,
      },
    ],
  },
  {
    _id: "jtj2nJrBDuhnKt58W",
    title: "Tanzmeditation",
    description:
      "<p>Innehalten - zur Ruhe kommen. Eine TanzMeditation ist wie ein Mantra… nur nicht gesungen, sondern getanzt. Es zentriert, ist sanft, beruhigt dein Nervensystem, dein Sein und gibt tiefen Frieden. </p>",
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "GZ Hottingen an der Gemeindestrasse, blauer Saal im 1. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Aq587Zsn6uGrPr8Kz",
    time_lastedit: {
      $date: "2024-09-05T23:15:22.281+0000",
    },
    time_created: {
      $date: "2024-05-21T16:51:18.817+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T15:45:00.000+0000",
    },
    createdBy: "Anneliese",
    categories: ["misc"],
    participants: [
      {
        user: "Ignaz",
        companions: 0,
      },
      {
        user: "Henriette",
        companions: 0,
      },
      {
        user: "Reagan",
        companions: 0,
      },
      {
        user: "Jacynth",
        companions: 0,
      },
      {
        user: "Ivy",
        companions: 0,
      },
      {
        user: "Herschel",
        companions: 0,
      },
      {
        user: "Mord",
        companions: 0,
      },
      {
        user: "Prue",
        companions: 0,
      },
      {
        user: "Rivi",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Cary",
        companions: 0,
      },
      {
        user: "Edmon",
        companions: 0,
      },
      {
        user: "Lavinie",
        companions: 1,
      },
      {
        user: "Derrik",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "2HH6GCCiATtRHPKvk",
    title: "Zu viele Sachen? Chaos zuhause?",
    description:
      "<p>Weshalb Unordnung entsteht und wie dir mit einfachen Methoden das Aufräumen und Ordnung halten gelingt, erfährst du von der erfahrenen Ordnungsexpertin Karin Treichler in diesem Vortrag.</p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Leselounge (2. OG)",
    internal: false,
    sendReminder: true,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "CHwdkQsAuAgNM9Q9x",
    time_lastedit: {
      $date: "2024-09-06T10:58:26.408+0000",
    },
    time_created: {
      $date: "2024-03-18T07:34:07.575+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    createdBy: "Manuel",
    categories: ["misc"],
    participants: [
      {
        user: "Maddie",
        companions: 0,
      },
      {
        user: "Betta",
        companions: 0,
      },
      {
        user: "Elora",
        companions: 0,
      },
      {
        user: "Ilyssa",
        companions: 0,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Hynda",
        companions: 0,
      },
      {
        user: "Loutitia",
        companions: 0,
      },
      {
        user: "Rowen",
        companions: 0,
      },
      {
        user: "Kat",
        companions: 0,
      },
      {
        user: "Ariadne",
        companions: 0,
      },
      {
        user: "Bertrando",
        companions: 0,
      },
      {
        user: "Violetta",
        companions: 0,
      },
      {
        user: "Nanette",
        companions: 0,
      },
      {
        user: "Dolores",
        companions: 0,
      },
      {
        user: "Lesya",
        companions: 0,
      },
      {
        user: "Nolly",
        companions: 0,
      },
      {
        user: "Jermayne",
        companions: 0,
      },
      {
        user: "Jennilee",
        companions: 0,
      },
      {
        user: "Fin",
        companions: 0,
      },
      {
        user: "Veronike",
        companions: 1,
      },
      {
        user: "Venita",
        companions: 0,
      },
      {
        user: "Adair",
        companions: 0,
      },
      {
        user: "Loreen",
        companions: 0,
      },
      {
        user: "Loutitia",
        companions: 0,
      },
      {
        user: "Josh",
        companions: 0,
      },
      {
        user: "Rafaelia",
        companions: 0,
      },
      {
        user: "Sapphire",
        companions: 0,
      },
      {
        user: "Effie",
        companions: 0,
      },
      {
        user: "Chiarra",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "ji7N3vcg4tzB6Fu4Y",
    title: "Wie entsteht Stress und was kannst Du dagegen tun (Stark gegen Stress)",
    description:
      "<p>Ein Vortrag darüber, wie Stress überhaupt entsteht, was er körperlich/emotional mit uns macht und welche Möglichkeiten wir haben, ihm entgegenzutreten (Resilienzen aufbauen)</p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "1. OG Lounge",
    internal: false,
    sendReminder: true,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "HGBwQBH8SkMcpy2cp",
    time_lastedit: {
      $date: "2024-04-09T15:14:22.694+0000",
    },
    time_created: {
      $date: "2024-04-09T15:14:22.694+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    createdBy: "Sharity",
    categories: ["misc"],
    participants: [
      {
        user: "Allyson",
        companions: 0,
      },
      {
        user: "Yank",
        companions: 0,
      },
      {
        user: "Mellie",
        companions: 0,
      },
      {
        user: "Vernen",
        companions: 0,
      },
      {
        user: "Josh",
        companions: 0,
      },
      {
        user: "Wallace",
        companions: 0,
      },
      {
        user: "Lynnelle",
        companions: 0,
      },
      {
        user: "Mord",
        companions: 0,
      },
      {
        user: "Car",
        companions: 0,
      },
      {
        user: "Findlay",
        companions: 0,
      },
      {
        user: "Ozzy",
        companions: 0,
      },
      {
        user: "Bob",
        companions: 0,
      },
      {
        user: "Budd",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Illa",
        companions: 0,
      },
      {
        user: "Danita",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Natalee",
        companions: 0,
      },
      {
        user: "Dante",
        companions: 0,
      },
      {
        user: "Polly",
        companions: 0,
      },
      {
        user: "Leah",
        companions: 0,
      },
      {
        user: "Jourdan",
        companions: 0,
      },
      {
        user: "Royall",
        companions: 0,
      },
      {
        user: "Ignaz",
        companions: 0,
      },
      {
        user: "Jillayne",
        companions: 0,
      },
    ],
  },
  {
    _id: "HdJBzZiy7yzeb99Zm",
    title: "Website erstellen - eine praktische Einführung",
    description:
      "<p>Du hast schon eine Website oder möchtest eine erstellen (lassen)? Was ist der Ablauf und welche Schritte muss ich beachten? Du lernst folgende Basics:</p><p>1. CMS auswählen (WordPress, Wix...)<br />2. Domain registrieren &amp; Web-Hosting auswählen<br />3. Websitestruktur<br />4. Website designen und füllen: Seiten, Design &amp; Content<br />5. Technik: Sichtbarkeit, Schnelligkeit, Sicherheit</p><p>Bitte bring Laptop und praktische Fragen mit!</p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 22,
    region: "h4MnI3psRr8hSljk2",
    courseId: "d83TJkZCYkriyeq6c",
    time_lastedit: {
      $date: "2024-09-17T09:36:17.101+0000",
    },
    time_created: {
      $date: "2024-05-31T07:24:13.936+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:30:00.000+0000",
    },
    createdBy: "Dante",
    categories: ["computer"],
    participants: [
      {
        user: "Selma",
        companions: 0,
      },
      {
        user: "Aimee",
        companions: 0,
      },
      {
        user: "Tally",
        companions: 0,
      },
      {
        user: "Misti",
        companions: 0,
      },
      {
        user: "Karney",
        companions: 0,
      },
      {
        user: "Melloney",
        companions: 0,
      },
      {
        user: "Gallard",
        companions: 0,
      },
      {
        user: "Ryan",
        companions: 0,
      },
      {
        user: "Byram",
        companions: 0,
      },
      {
        user: "Norby",
        companions: 0,
      },
      {
        user: "Bili",
        companions: 0,
      },
      {
        user: "Lesya",
        companions: 0,
      },
      {
        user: "Bob",
        companions: 0,
      },
      {
        user: "Tiphani",
        companions: 0,
      },
      {
        user: "Eldredge",
        companions: 0,
      },
      {
        user: "Devina",
        companions: 0,
      },
      {
        user: "Melany",
        companions: 0,
      },
      {
        user: "Jimmy",
        companions: 0,
      },
      {
        user: "Leesa",
        companions: 0,
      },
      {
        user: "Catie",
        companions: 0,
      },
      {
        user: "Gratiana",
        companions: 0,
      },
      {
        user: "Dusty",
        companions: 0,
      },
    ],
  },
  {
    _id: "E4J7X9qKgfzLttMG6",
    title: "Recycling-Kunst aus Kartonrollen",
    description:
      "<p>Schöne Blumen aus WC-Rollen basteln? Das lernst du hier in unserer Recycling-Kunstlektion. Aus demselben Material eine eigene Idee entwickeln? Wir unterstützen deine Kreativität. Recycling-Kunst ist Teil der Misswahl zur Miss Save the Planet für eine bewusste Schönheitskultur. <br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Ez6RKr5R2w7TxqLdh",
    time_lastedit: {
      $date: "2024-05-31T18:03:45.802+0000",
    },
    time_created: {
      $date: "2024-05-31T10:41:21.003+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    createdBy: "Nevile",
    categories: [],
    participants: [],
    canceled: true,
  },
  {
    _id: "ET56kma4Xbxrx4kef",
    title: "Lehm und Lehmbau kennenlernen",
    description:
      "<p>Mit Lehm kann man nachhaltig Gebäude bauen und er eignet sich zum Mitmachen.  Wir geben theoretisch und praktisch eine Einführung in die Ursprünnge, das Material und den Baustoff Lehm. Auf diese Weise begreifen wir, wo das Potenzial dieser traditionenellen Bautechnik liegt.<br /></p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Werkraum",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "2J8SX8LpQPdcF4FxS",
    time_lastedit: {
      $date: "2024-06-04T07:06:09.814+0000",
    },
    time_created: {
      $date: "2024-06-04T07:04:22.335+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    createdBy: "Pascale",
    categories: ["handicraft", "culture"],
    participants: [
      {
        user: "Greggory",
        companions: 0,
      },
      {
        user: "Leesa",
        companions: 0,
      },
      {
        user: "Dana",
        companions: 0,
      },
      {
        user: "Reagan",
        companions: 0,
      },
      {
        user: "Maisey",
        companions: 0,
      },
      {
        user: "Kimble",
        companions: 0,
      },
      {
        user: "Moises",
        companions: 1,
      },
      {
        user: "Trudie",
        companions: 1,
      },
      {
        user: "Beatriz",
        companions: 1,
      },
      {
        user: "Gregor",
        companions: 0,
      },
      {
        user: "Garnette",
        companions: 0,
      },
      {
        user: "Dagny",
        companions: 0,
      },
    ],
  },
  {
    _id: "fZnEwomHCPfDFkRn9",
    title: "PMR - Progressive Muskel Relaxation",
    description:
      "<p>Wir legen uns entspannt auf den Rücken. Dann spannen wir der Reihe nach einzelne Muskelgruppen an und lassen wieder los. Dann folgt die nächste Muskelgruppe. Dabei lernen wir alle unsere Muskelgruppen kennen und beherrschen.<br /></p><p>Yogamatte oder weiche Decke mitnehmen. Bitte anmelden.</p><p><br /></p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "g6TQCyNbeMDxG9eYf",
    time_lastedit: {
      $date: "2024-05-02T14:16:24.210+0000",
    },
    time_created: {
      $date: "2024-05-02T14:16:24.210+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    createdBy: "Flore",
    categories: ["sports"],
    participants: [
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Angelico",
        companions: 0,
      },
      {
        user: "Malissia",
        companions: 0,
      },
      {
        user: "Corbet",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "QSx67Q4wwTzCWHYYd",
    title: "Tipps zum Start in die Selbstständigkeit für kreative Frauen",
    description:
      "<p>Überlegst du dir, dich selbstständig zu machen? Bist dir aber unsicher, womit du starten sollst? Wie du ein attraktives Angebot entwickelst und vermarktest? In unserem Referat möchten wir dich ermutigen und dir erste Schritte auf dem Weg zum eigenen Business aufzeigen.<br /></p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "s4JBQW5BnbDwJi9eD",
    time_lastedit: {
      $date: "2024-06-26T15:18:31.455+0000",
    },
    time_created: {
      $date: "2024-05-14T12:38:31.099+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    createdBy: "Marsha",
    categories: ["misc"],
    participants: [
      {
        user: "Dolores",
        companions: 0,
      },
      {
        user: "Alisun",
        companions: 0,
      },
      {
        user: "Chrissy",
        companions: 0,
      },
      {
        user: "Revkah",
        companions: 0,
      },
      {
        user: "Tommy",
        companions: 0,
      },
      {
        user: "Rochester",
        companions: 0,
      },
      {
        user: "Iain",
        companions: 0,
      },
      {
        user: "Chadd",
        companions: 0,
      },
      {
        user: "Hannie",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Loutitia",
        companions: 0,
      },
      {
        user: "Rudyard",
        companions: 0,
      },
      {
        user: "Alberta",
        companions: 0,
      },
      {
        user: "Kristi",
        companions: 0,
      },
      {
        user: "Shirlee",
        companions: 0,
      },
      {
        user: "Betta",
        companions: 0,
      },
      {
        user: "Wilfred",
        companions: 0,
      },
      {
        user: "Pen",
        companions: 0,
      },
      {
        user: "Venita",
        companions: 0,
      },
      {
        user: "Maxie",
        companions: 0,
      },
      {
        user: "Angelico",
        companions: 0,
      },
      {
        user: "Carroll",
        companions: 0,
      },
      {
        user: "Thorvald",
        companions: 0,
      },
      {
        user: "Callie",
        companions: 0,
      },
      {
        user: "Darleen",
        companions: 0,
      },
      {
        user: "Alberta",
        companions: 0,
      },
      {
        user: "Fin",
        companions: 0,
      },
      {
        user: "Ewan",
        companions: 0,
      },
    ],
  },
  {
    _id: "vXJGEBiozxPkAxMXv",
    title: "Märchen für Kinder und Erwachsene",
    description:
      "<p>Ich freue mich, euch für ca. eine halbe Stunde in die Welt der Märchen zu entführen. Anschliessend gibt es  etwas Kleines zum Basteln und Naschen.</p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "je nach Wetter draussen oder drinnen",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "vk7HpQCkko7PTxNM5",
    time_lastedit: {
      $date: "2024-08-23T17:22:31.034+0000",
    },
    time_created: {
      $date: "2024-05-21T13:58:03.448+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    createdBy: "Even",
    categories: ["culture", "misc"],
    participants: [
      {
        user: "Margy",
        companions: 1,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Nickey",
        companions: 1,
      },
      {
        user: "Saunders",
        companions: 1,
      },
      {
        user: "Misha",
        companions: 0,
      },
      {
        user: "Peterus",
        companions: 1,
      },
      {
        user: "Thorvald",
        companions: 1,
      },
      {
        user: "Tybi",
        companions: 1,
      },
    ],
  },
  {
    _id: "Wf3BJ9zaycqnR5uc4",
    title: "Digitale Balance finden",
    description:
      "<p>Hinterfragen Sie manchmal auch Ihren täglichen Umgang mit digitalen Medien? Tauschen Sie sich in entspannter Atmosphäre mit anderen aus und sammeln Sie wertvolle Impulse. Gemeinsam entdecken wir Strategien für einen ausgewogenen digitalen Alltag mit genug Raum für andere wichtige Dinge. </p>",
    venue: {
      name: "GZ Höngg (Limmattalstr)",
      _id: "62ejbXBwpdNLjYGbY",
    },
    room: "Galerie",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "wLa2KdWYjqzpNtHmR",
    time_lastedit: {
      $date: "2024-07-10T11:39:41.913+0000",
    },
    time_created: {
      $date: "2024-07-02T14:07:41.593+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    createdBy: "Tara",
    categories: ["misc", "computer"],
    participants: [
      {
        user: "Wynnie",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "QNiTCRTBBn8vCc3p8",
    title: "Capoeira, Kampf und Tanz, Kunst und Magie",
    description:
      "<p>Willst du ein Stück Brasilien kennenlernen? Capoeira ist Kampfkunst, Spass, Musik, Tanz, Flow... Du wirst dich viel bewegen und einen Einblick in die Grundlagen der Capoeira bekommen. Keine Vorkenntnisse nötig. Bequeme Trainingskleidung, trainiert wird barfuss.</p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "Flex 4",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "r6m8ANwjAxxcq5j3j",
    time_lastedit: {
      $date: "2024-09-10T13:11:32.282+0000",
    },
    time_created: {
      $date: "2024-09-10T10:35:59.533+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    createdBy: "Angela",
    categories: ["sports"],
    participants: [
      {
        user: "Brendis",
        companions: 0,
      },
      {
        user: "Elias",
        companions: 1,
      },
      {
        user: "Marysa",
        companions: 1,
      },
      {
        user: "Zia",
        companions: 0,
      },
      {
        user: "Gertruda",
        companions: 0,
      },
      {
        user: "Hephzibah",
        companions: 1,
      },
    ],
  },
  {
    _id: "nzDsQW2D2gdW6vH6b",
    title: "(Ein Buch) schreiben",
    description:
      "<p>Du willst ein Buch schreiben, hast noch nicht angefangen oder nach zehn Seiten aufgehört oder … Dann bist du hier richtig: Du bekommst Tipps, wie du eine Geschichte beginnen, entwickeln und aufbauen kannst, wie du einen Charakter gestaltest und vor allem sprechen wir über dein Projekt. </p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "kzHj227aW9crw6tDJ",
    time_lastedit: {
      $date: "2024-05-29T11:27:45.289+0000",
    },
    time_created: {
      $date: "2024-04-26T09:24:22.268+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:30:00.000+0000",
    },
    createdBy: "Evered",
    categories: ["culture"],
    participants: [
      {
        user: "Hale",
        companions: 0,
      },
      {
        user: "Anneliese",
        companions: 0,
      },
      {
        user: "Stanford",
        companions: 0,
      },
      {
        user: "Celie",
        companions: 0,
      },
      {
        user: "Hasty",
        companions: 0,
      },
      {
        user: "Bertie",
        companions: 0,
      },
      {
        user: "Hill",
        companions: 0,
      },
      {
        user: "Marc",
        companions: 0,
      },
    ],
  },
  {
    _id: "RkbdjW6SXfxfiQb6N",
    title: "Joe and DJ Miles' Jazz World II",
    description:
      "<p>American Joe Amato and Swiss DJ Miles (Franco Huber) are jazz aficionados who will share some of their favorite jazz pieces. Dies ist ihre zweite Zusammenarbeit im GZ Schindlergut und selbstverständlich stellen Joe und Miles neue Stücke und Themen vor. (Joe  auf Englisch und DJ Miles auf Deutsch) </p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Schigu Kafi",
    internal: false,
    sendReminder: false,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "2ioop3dqipbWxW33N",
    time_lastedit: {
      $date: "2024-08-16T07:21:11.131+0000",
    },
    time_created: {
      $date: "2024-05-21T13:50:30.889+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Ariadne",
    categories: ["culture"],
    participants: [
      {
        user: "Ulberto",
        companions: 0,
      },
      {
        user: "Dayle",
        companions: 0,
      },
      {
        user: "Saunders",
        companions: 0,
      },
      {
        user: "Laural",
        companions: 0,
      },
      {
        user: "Junina",
        companions: 0,
      },
      {
        user: "Hannie",
        companions: 0,
      },
      {
        user: "Kizzee",
        companions: 1,
      },
      {
        user: "Tybi",
        companions: 1,
      },
      {
        user: "Sonya",
        companions: 0,
      },
      {
        user: "Sonny",
        companions: 0,
      },
    ],
  },
  {
    _id: "6CQaW4cYqFYEy57QD",
    title: "Yoga für Jugendliche",
    description:
      "<p>Du machst gerne Yoga oder wolltest es schon immer einmal ausprobieren? Dann bist du hier genau richtig! Gemeinsam flowen wir entspannt in den Abend hinein. Es sind keine Vorkenntnisse nötig.</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bewegungsraum 1. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "bHsf9MnxGYfTZGdAZ",
    time_lastedit: {
      $date: "2024-05-23T12:56:50.560+0000",
    },
    time_created: {
      $date: "2024-05-23T12:56:50.560+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T16:45:00.000+0000",
    },
    createdBy: "Nevil",
    categories: ["sports"],
    canceled: true,
  },
  {
    _id: "3C64ZcdqeTzmtqbNS",
    title: "Entdecke Deine Stimme / Explore your Voice",
    description:
      "<p>Mit Atem- Sprech und Gesangsübungen entdecken wir dein persönliches  Instrument: Deine Stimme. Erfahre mehr über die verschiedenen Stimmregister!</p><p>We will explore your voice with breath and speech exercises as well as with vocalizes. learn more about the various registers in your voice!</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bühnensaal EG",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "tQtcacGyPAd8ZkuSG",
    time_lastedit: {
      $date: "2024-06-25T12:52:27.403+0000",
    },
    time_created: {
      $date: "2024-05-23T16:15:32.387+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    createdBy: "Illa",
    categories: ["culture"],
    participants: [
      {
        user: "Sherill",
        companions: 0,
      },
      {
        user: "Hannie",
        companions: 0,
      },
      {
        user: "Silvie",
        companions: 0,
      },
      {
        user: "Kat",
        companions: 0,
      },
      {
        user: "Chaim",
        companions: 0,
      },
      {
        user: "Julina",
        companions: 0,
      },
      {
        user: "Moreen",
        companions: 0,
      },
      {
        user: "Andee",
        companions: 0,
      },
      {
        user: "Shayne",
        companions: 0,
      },
      {
        user: "Bonita",
        companions: 0,
      },
      {
        user: "Chiarra",
        companions: 0,
      },
      {
        user: "Sophia",
        companions: 0,
      },
    ],
  },
  {
    _id: "N5J6ymQjpRET3grwZ",
    title: "malen, was das herz begehrt",
    description:
      "<p>du folgst den farben und formen, die dich berüren. du malst stehend an der malwand, mit den hãnden oder mit dem pinsel, mit hochwertigen gouachefarben. du lässt dich überraschen von deinen inneren bildern.</p>",
    venue: {
      name: "GZ Hottingen - Lektion im Atelier Weilenfrau",
    },
    room: "eigenes Atelier, Rütistrasse 52, 8032 ZH, Eingang Seite Titlisstrasse ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 5,
    region: "h4MnI3psRr8hSljk2",
    courseId: "rW9wh5sRWjGPNn8S2",
    time_lastedit: {
      $date: "2024-08-23T08:11:55.900+0000",
    },
    time_created: {
      $date: "2024-05-28T16:54:45.029+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Maisey",
    categories: ["misc"],
    participants: [
      {
        user: "Reagan",
        companions: 0,
      },
      {
        user: "Jimmy",
        companions: 0,
      },
      {
        user: "Sunny",
        companions: 0,
      },
      {
        user: "Margeaux",
        companions: 0,
      },
      {
        user: "Caroline",
        companions: 0,
      },
    ],
  },
  {
    _id: "hXb3H52BeoALWmtnC",
    title: "Schuldenkrise und Klimanotstand - Eine Einführung in Globale Klimagerechtigkeit",
    description:
      '<p>"Klimagerechtigkeit" ist ein Trendwort. Doch was meint es konkret?<br />Die Bewegung "Debt for Climate" verbindet Klimaaktivismus und soziale Kämpfe auf globaler Ebene. In diesem Talk möchten wir Euch die Zusammenhänge von Geldpolitik, Staatsverschuldung, Konzerngeschäften, und Klimaerhitzung aufzeigen. <br /></p>',
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im Wartsaal Wipkingen",
      _id: "TnE8M5syuvwnCmofQ",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "izB23JSHt3nkjTP4e",
    time_lastedit: {
      $date: "2024-06-11T06:00:40.338+0000",
    },
    time_created: {
      $date: "2024-06-01T18:18:48.301+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Janina",
    categories: ["misc"],
    participants: [
      {
        user: "Gerhard",
        companions: 0,
      },
      {
        user: "Prue",
        companions: 0,
      },
      {
        user: "Erasmus",
        companions: 0,
      },
      {
        user: "Maisey",
        companions: 0,
      },
      {
        user: "Sileas",
        companions: 0,
      },
      {
        user: "Jewelle",
        companions: 1,
      },
      {
        user: "Joshua",
        companions: 0,
      },
      {
        user: "Terri-jo",
        companions: 0,
      },
      {
        user: "Budd",
        companions: 0,
      },
      {
        user: "Faye",
        companions: 0,
      },
      {
        user: "Roman",
        companions: 0,
      },
    ],
  },
  {
    _id: "es6XQ84cq4BD5qP3P",
    title: "Cello Cello Cello!",
    description:
      "<p>Möchtest du schon lange mal ein Instrument - insbesondere das Cello kennen- und spielen lernen? Dann bist du hier richtig! Gerne zeige ich dir das Instrument und du kannst das Cello ausprobieren und dabei schon selber Klänge auf dem Instrument zum Klingen bringen. Keine Vorkenntnisse nötig.</p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dt58TgshfGJTyXRZ4",
    time_lastedit: {
      $date: "2024-06-04T07:14:12.527+0000",
    },
    time_created: {
      $date: "2024-05-21T15:45:49.536+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:15:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:15:00.000+0000",
    },
    createdBy: "Gerhard",
    categories: [],
    participants: [
      {
        user: "Sheilakathryn",
        companions: 0,
      },
      {
        user: "Sileas",
        companions: 0,
      },
      {
        user: "Lin",
        companions: 0,
      },
      {
        user: "Monte",
        companions: 1,
      },
      {
        user: "Rivi",
        companions: 0,
      },
    ],
  },
  {
    _id: "hPPbDakJvTBEvCAYj",
    title: "Purpose-Match - sinnorientiert leben und arbeiten",
    description:
      "<p>Purpose ist Lebenskraft und verleiht uns Energie, Wirksamkeit und Freude. Wir erkunden gemeinsam die Faktoren, auf die es ankommt, um mehr in die Kraft zu kommen, Flow zu erleben und Wertvolles in die Welt zu bringen. <br /></p>",
    venue: {
      name: "LeLabor",
      _id: "uXHwNfdnZjun4C2yN",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "bAM9mqpsgmbn3cS3K",
    time_lastedit: {
      $date: "2024-04-04T12:08:00.898+0000",
    },
    time_created: {
      $date: "2024-04-04T12:07:33.367+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Rog",
    categories: ["misc"],
    participants: [
      {
        user: "Hildy",
        companions: 0,
      },
      {
        user: "Ezekiel",
        companions: 0,
      },
      {
        user: "Danita",
        companions: 0,
      },
      {
        user: "Basia",
        companions: 1,
      },
      {
        user: "Angelita",
        companions: 0,
      },
      {
        user: "Lanie",
        companions: 0,
      },
      {
        user: "Mahalia",
        companions: 0,
      },
      {
        user: "Dionysus",
        companions: 0,
      },
      {
        user: "Morena",
        companions: 0,
      },
      {
        user: "Lenard",
        companions: 0,
      },
      {
        user: "Dolli",
        companions: 0,
      },
      {
        user: "Madalyn",
        companions: 0,
      },
      {
        user: "Fanechka",
        companions: 0,
      },
      {
        user: "Godard",
        companions: 0,
      },
    ],
  },
  {
    _id: "KMvfdKQCuickWHK5W",
    title: "Gewaltfreie Kommunikation trifft auf Improvisationstheater",
    description:
      "<p>Ihr bekommt einen Einblick in die Welt des Improvisationstheaters sowie in die Gewaltfreie Kommunikation (GFK). Die Grundhaltung von beidem ist das Annehmen «Alles was ist, darf sein». Ich freue mich auf den generationenübergreifenden Austausch und gegenseitige Inspiration.</p>",
    venue: {
      name: "Quartierhaus Kreis 6",
    },
    room: "2. Stock",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "k4yBoCmv9fXxy4ZMq",
    time_lastedit: {
      $date: "2024-07-04T11:22:07.138+0000",
    },
    time_created: {
      $date: "2024-04-16T06:35:53.682+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:30:00.000+0000",
    },
    createdBy: "Reilly",
    categories: [],
    noRsvp: false,
    participants: [
      {
        user: "Nathanael",
        companions: 0,
      },
      {
        user: "Dora",
        companions: 0,
      },
      {
        user: "Tara",
        companions: 0,
      },
      {
        user: "Eliot",
        companions: 0,
      },
      {
        user: "Fax",
        companions: 0,
      },
      {
        user: "Lily",
        companions: 0,
      },
      {
        user: "Jessi",
        companions: 0,
      },
      {
        user: "Duffy",
        companions: 0,
      },
      {
        user: "Robby",
        companions: 0,
      },
    ],
  },
  {
    _id: "R3nMANKai5wzGRwAF",
    title: "Freies malen mit Aquarellfarben",
    description:
      "<p>Entdecke die Faszination der Aquarellmalerei! In diesem Kurs lernst du spielerisch die Grundlagen und experimentierst mit fließenden Farben. Keine Vorkenntnisse nötig. Tauche ein und gestalte kleine Motive voller Freude und Kreativität!</p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "kleines Kurslokal, 4. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "MTSGDXQdHJ3oWAKom",
    time_lastedit: {
      $date: "2024-05-06T07:35:37.860+0000",
    },
    time_created: {
      $date: "2024-05-06T07:35:37.860+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T19:30:00.000+0000",
    },
    createdBy: "Karry",
    categories: ["culture"],
    participants: [
      {
        user: "Brodie",
        companions: 0,
      },
      {
        user: "Myrta",
        companions: 0,
      },
      {
        user: "Chrysa",
        companions: 0,
      },
      {
        user: "Maxie",
        companions: 0,
      },
      {
        user: "Thibaut",
        companions: 0,
      },
      {
        user: "Reinaldo",
        companions: 0,
      },
      {
        user: "Karney",
        companions: 0,
      },
    ],
  },
  {
    _id: "ecdt6wZgacoFXYnXg",
    title: "FOOD FUTURES",
    description:
      "<p>Curious to get tips and recipes around food, to live healthy, leave less waste and help the planet? Join this 90-min positive food workshop with new facts and concepts, such as the planetary health diet and prepare a yummy anti-food waste pesto.</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "t8tJ2BuzBNQ66pQxP",
    time_lastedit: {
      $date: "2024-05-23T16:02:34.618+0000",
    },
    time_created: {
      $date: "2024-05-22T15:24:31.062+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Phylys",
    categories: ["cooking", "culture"],
    participants: [
      {
        user: "Stanford",
        companions: 0,
      },
      {
        user: "Octavius",
        companions: 0,
      },
      {
        user: "Kalli",
        companions: 1,
      },
      {
        user: "Ginelle",
        companions: 0,
      },
      {
        user: "Edi",
        companions: 0,
      },
    ],
  },
  {
    _id: "MypH2k2hXz2zsa6Ye",
    title: "Budget Hacks! Dein Geld im Griff haben",
    description:
      "<p>Mit einem Budget ganz neue Möglichkeiten entdecken, um dein Leben zu gestalten.<br /></p><p>Lerne:</p><p>- wie du ganz einfach ein Budget erstellst</p><p>- die wichtigsten Tipps &amp; Tools nutzt</p><p>- deine Einsparpotenziale erkennst</p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "d5yJgTZapQSfjJazW",
    time_lastedit: {
      $date: "2024-05-31T14:22:58.282+0000",
    },
    time_created: {
      $date: "2024-05-24T08:11:47.916+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Chrissie",
    categories: ["misc"],
    participants: [
      {
        user: "Durward",
        companions: 0,
      },
      {
        user: "Norma",
        companions: 0,
      },
      {
        user: "Vitoria",
        companions: 0,
      },
      {
        user: "Mallory",
        companions: 0,
      },
      {
        user: "Jessalin",
        companions: 0,
      },
      {
        user: "Yank",
        companions: 0,
      },
      {
        user: "Jillayne",
        companions: 1,
      },
      {
        user: "Tremaine",
        companions: 0,
      },
      {
        user: "Maryann",
        companions: 0,
      },
      {
        user: "Denna",
        companions: 0,
      },
      {
        user: "Sharla",
        companions: 0,
      },
      {
        user: "Brier",
        companions: 0,
      },
      {
        user: "Ozzy",
        companions: 0,
      },
      {
        user: "Nanette",
        companions: 0,
      },
      {
        user: "Valencia",
        companions: 0,
      },
      {
        user: "Cyril",
        companions: 0,
      },
    ],
  },
  {
    _id: "o6F2JvTSrSCv3xsQJ",
    title: "Biodiverse Stadtgärten",
    description:
      "<p>Führung zum Thema Stadtnatur: Was sind wertvolle Lebensräume in der Stadt? Wie sehen diese aus und was gibt es allenfalls noch zu verbessern? Was und wozu sind Trittsteingärten nützlich? All diese Fragen versuchen wir bei einem kleinen Rundgang in der Umgebung des GZ Leimbach zu klären.</p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "GZ Brache (neben der Bistro-Terrasse)",
    internal: false,
    sendReminder: false,
    noRsvp: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "uDTCt8MRf3BC66WzB",
    time_lastedit: {
      $date: "2024-05-31T09:22:34.516+0000",
    },
    time_created: {
      $date: "2024-05-31T09:22:34.516+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T17:30:00.000+0000",
    },
    createdBy: "Nicolai",
    categories: ["sciences", "misc"],
  },
  {
    _id: "KJWrGSeqEWnbwdzkQ",
    title: "Theater, Stimme und kreatives Schreiben",
    description:
      "<p>Wir spielen kurze, improvisierte Szenen ohne vorgegebenen Text. Wir lassen uns inspirieren von einem Text oder Gedicht. Du lernst wie Schreiben ohne Anstrengung passiert und Theaterspielen ohne Text Spass macht! Die Stimmübungen geben dir Selbstsicherheit.</p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Kleiner Kursraum (beim unteren Eingang des GZs)",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "94GjGifEB5YeiN4Lt",
    time_lastedit: {
      $date: "2024-07-05T09:24:17.354+0000",
    },
    time_created: {
      $date: "2024-04-16T14:34:52.870+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:30:00.000+0000",
    },
    createdBy: "Burnard",
    categories: ["sports", "languages", "misc"],
    participants: [
      {
        user: "Celestyn",
        companions: 1,
      },
      {
        user: "Gus",
        companions: 0,
      },
      {
        user: "Teriann",
        companions: 1,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "ndhcxkeYivq8qsrW7",
    title: "Die Geschichte von Tonaufzeichnung und Radio",
    description:
      "<p>Wir tauchen ein in längst vergangene Epochen der Tonaufzeichnung und des Rundfunks. Wir lernen alte Phonographen und Grammophone kennen, sehen/hören historische Radioempfänger im Wandel der Zeiten und können eigene Aufnahmen auf Tondraht machen und über Mikrofone aus vergangenen Zeiten sprechen.</p>",
    venue: {
      name: "Sihlweidstrasse 20 ",
    },
    room: "ACHTUNG: keine Toilette vorhanden! Option: um 18.45 Uhr im GZ Leimbach (Leimbachstrasse 200) die Toilette noch benutzen",
    internal: false,
    sendReminder: true,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "9znb3vY9ruR8fWPWW",
    time_lastedit: {
      $date: "2024-04-17T10:07:06.847+0000",
    },
    time_created: {
      $date: "2024-04-17T10:02:35.168+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T19:00:00.000+0000",
    },
    createdBy: "Harrison",
    categories: ["sciences"],
    canceled: true,
  },
  {
    _id: "pTr3FjdWSgv2gWWMM",
    title: "Das innere Wissen im Alltag nutzen",
    description:
      "<p>Jede und jeder hat Zugang zum inneren Wissen, denn es ist ein Teil unseres Selbst. Es steht jederzeit zur Verfügung und wir brauchen nur darauf zuzugreifen. Doch wie können wir das tun? Wie stellen wir den bewussten Zugang dazu her? Wo und wie ist es abrufbar?</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Lounge",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "mgtzCuu5KjMyKc3Gk",
    time_lastedit: {
      $date: "2024-05-26T13:40:29.106+0000",
    },
    time_created: {
      $date: "2024-05-21T14:32:14.591+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    createdBy: "Wilfred",
    categories: ["misc"],
    participants: [
      {
        user: "Julianna",
        companions: 0,
      },
      {
        user: "Myrtice",
        companions: 0,
      },
      {
        user: "Gustavus",
        companions: 1,
      },
      {
        user: "Doroteya",
        companions: 0,
      },
      {
        user: "Gene",
        companions: 0,
      },
      {
        user: "Jeannie",
        companions: 0,
      },
    ],
  },
  {
    _id: "8vYrFQukHGhTmLyLi",
    title: "Neue Wege gehen mit Biodanza (Deutsch and English)",
    description:
      '<p>Wie möchtest du dein Leben gestalten? Möchtest du Neues einladen? Wir tanzen neue Wege, kreativ und mit Lebensfreude, verbunden mit dir und deiner Umgebung. Lass dich überraschen! Wir starten im Kreis und machen uns auf die gemeinsame Tanzreise zu Musik aus aller Welt. Siehe <a href="http://bewegte-integration.ch" rel="nofollow">bewegte-integration.ch</a></p>',
    venue: {
      name: "GZ Hottingen (Gemeindestr.)",
      _id: "W4osBRSecCnHwrJkT",
    },
    room: "GZ Hottingen, Gemeindestrasse, Hottingersaal im 2. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 40,
    region: "h4MnI3psRr8hSljk2",
    courseId: "hQCAgM6nbEgBd5QCv",
    time_lastedit: {
      $date: "2024-09-12T09:31:33.814+0000",
    },
    time_created: {
      $date: "2024-05-22T07:15:39.949+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T19:00:00.000+0000",
    },
    createdBy: "Leslie",
    categories: ["sports"],
    participants: [
      {
        user: "Sherill",
        companions: 0,
      },
      {
        user: "Tish",
        companions: 1,
      },
      {
        user: "Helge",
        companions: 0,
      },
      {
        user: "Donaugh",
        companions: 0,
      },
      {
        user: "Chaim",
        companions: 0,
      },
      {
        user: "Mill",
        companions: 0,
      },
      {
        user: "Carney",
        companions: 0,
      },
      {
        user: "Des",
        companions: 0,
      },
      {
        user: "Francesco",
        companions: 0,
      },
      {
        user: "Ezekiel",
        companions: 1,
      },
      {
        user: "Marylou",
        companions: 0,
      },
      {
        user: "Bev",
        companions: 0,
      },
      {
        user: "Benedikta",
        companions: 0,
      },
      {
        user: "Renee",
        companions: 0,
      },
      {
        user: "Gualterio",
        companions: 0,
      },
      {
        user: "Dante",
        companions: 0,
      },
      {
        user: "Eduard",
        companions: 1,
      },
      {
        user: "Wiatt",
        companions: 0,
      },
      {
        user: "Joshua",
        companions: 1,
      },
    ],
  },
  {
    _id: "kR8E3GkDKYhauJmiY",
    title: "¿Quieres vivir una aventura? ¡Pues lánzate a la lectura en PBZ Hardau!",
    description:
      '<p>Wir diskutieren mit Autorin Soraya Romero Hernández über ihr Buch "Las semillas del silencio". Si te gusta leer en español, únete a nuestro club. Se ofrecerá un Apéro. </p>',
    venue: {
      name: "PBZ Bibliothek Hardau",
      _id: "smRSEWukb2tGsFB4S",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "MnEWD5mKC8iFDD7Se",
    time_lastedit: {
      $date: "2024-05-31T08:22:13.560+0000",
    },
    time_created: {
      $date: "2024-05-31T07:59:37.354+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T19:00:00.000+0000",
    },
    createdBy: "Fax",
    categories: ["culture", "misc"],
    participants: [
      {
        user: "Isac",
        companions: 0,
      },
      {
        user: "Dolores",
        companions: 0,
      },
      {
        user: "Armin",
        companions: 0,
      },
      {
        user: "Cirstoforo",
        companions: 0,
      },
      {
        user: "Leigh",
        companions: 0,
      },
      {
        user: "Evey",
        companions: 0,
      },
      {
        user: "Afton",
        companions: 0,
      },
      {
        user: "Herman",
        companions: 0,
      },
      {
        user: "Marleah",
        companions: 0,
      },
    ],
  },
  {
    _id: "FbcvTEBFWpbk6HckW",
    title: "Einführung in die Meditation",
    description:
      "<p>Lass deine Gedanken zur Ruhe kommen. Nicht Grübeln, keine Probleme wälzen, ich weiss, das ist gar nicht so einfach.  Wir lernen verschiedene Hilfen kennen. Wir können uns in kurzer Zeit der Gedankenstille sehr gut erholen und Mut schöpfen,  etwas zu verändern.  </p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Raum für Alles",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "AmRv2m23QYZxTKr3w",
    time_lastedit: {
      $date: "2024-09-18T06:58:43.642+0000",
    },
    time_created: {
      $date: "2024-06-24T12:20:41.118+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:30:00.000+0000",
    },
    createdBy: "Kizzee",
    categories: ["misc"],
    participants: [
      {
        user: "Yancy",
        companions: 0,
      },
      {
        user: "Kat",
        companions: 0,
      },
      {
        user: "Luella",
        companions: 0,
      },
      {
        user: "Lanna",
        companions: 1,
      },
      {
        user: "Brendin",
        companions: 0,
      },
      {
        user: "Kat",
        companions: 0,
      },
      {
        user: "Aldridge",
        companions: 0,
      },
      {
        user: "Nicolai",
        companions: 0,
      },
      {
        user: "Codie",
        companions: 0,
      },
    ],
  },
  {
    _id: "cQ9vnRZDFyShDHNLa",
    title: "Mentastics® (mentale Gymnastik) nach Milton Trager",
    description:
      "<p>Mit einfachen Bewegungen und Achtsamkeit finden wir zu mehr Lebendigkeit im Körper. Die Neugier wird uns leiten zu mehr Leichtigkeit und Weichheit. Wir erforschen den Körper und erreichen den Geist!</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "RLNXeDNENFwAvjkkn",
    time_lastedit: {
      $date: "2024-06-07T13:48:41.990+0000",
    },
    time_created: {
      $date: "2024-05-26T08:55:28.082+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-18T18:30:00.000+0000",
    },
    createdBy: "Aurore",
    categories: ["sports"],
    participants: [
      {
        user: "Eberhard",
        companions: 0,
      },
      {
        user: "Raimundo",
        companions: 0,
      },
      {
        user: "Chadd",
        companions: 0,
      },
      {
        user: "Tally",
        companions: 0,
      },
      {
        user: "Donaugh",
        companions: 0,
      },
    ],
  },
  {
    _id: "Kr4KqAPkcmQYdmmYJ",
    title: "Argentinischer Tango - Kultivierte Sinnlichkeit als Paartanz",
    description:
      "<p>Tango Argentino steht für Paartanz voller Improvisation und urbaner Eleganz. </p><p> Wir lernen die Technik vom Führen und Geführtwerden: Alles im verhängnisvollen Reich der Musik aus Buenos Aires voller Atmosphäre, Kraft und Vielfältigkeit.</p><p>Du kannst dich als Einzelperson oder als Paar anmelden.</p>",
    venue: {
      name: "GZ Höngg (Limmattalstr)",
      _id: "62ejbXBwpdNLjYGbY",
    },
    room: "Galerie ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "K2biTuZDkyMzLz9sA",
    time_lastedit: {
      $date: "2024-07-10T11:05:44.682+0000",
    },
    time_created: {
      $date: "2024-05-21T07:00:07.382+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-18T18:00:00.000+0000",
    },
    end: {
      $date: "2024-09-18T19:00:00.000+0000",
    },
    createdBy: "Myrtice",
    categories: ["sports"],
    participants: [
      {
        user: "Leslie",
        companions: 1,
      },
      {
        user: "Davidson",
        companions: 1,
      },
      {
        user: "Mabel",
        companions: 1,
      },
      {
        user: "Gerrilee",
        companions: 0,
      },
      {
        user: "Dionysus",
        companions: 1,
      },
      {
        user: "Yalonda",
        companions: 1,
      },
      {
        user: "Jewelle",
        companions: 0,
      },
      {
        user: "Barb",
        companions: 0,
      },
      {
        user: "Cathrin",
        companions: 0,
      },
      {
        user: "Everett",
        companions: 1,
      },
      {
        user: "Rubina",
        companions: 1,
      },
    ],
  },
  {
    _id: "H93u3PE9pjZaWNYiw",
    title: "Zentangle® - Crescent Moon",
    description:
      "<p>Zentangle® entführt in eine andere Welt und lässt den Alltag vergessen. Die Muster wecken die eigene Kreativität und mit jedem Strich entsteht ein neues Kunstwerk. In diesem Kurs legen wir den Focus auf das Zentangle Muster Crescent Moon.</p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "kleiner Kursraum, 4. Stock",
    internal: false,
    sendReminder: true,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Re7TJtCrboQ73suBJ",
    time_lastedit: {
      $date: "2024-06-03T13:52:02.832+0000",
    },
    time_created: {
      $date: "2024-03-22T13:57:36.024+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T08:30:00.000+0000",
    },
    createdBy: "Elane",
    categories: ["culture"],
    participants: [
      {
        user: "Coraline",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 0,
      },
      {
        user: "Joaquin",
        companions: 0,
      },
      {
        user: "Nikkie",
        companions: 0,
      },
      {
        user: "Casey",
        companions: 0,
      },
      {
        user: "Dian",
        companions: 0,
      },
      {
        user: "Aldridge",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "JBEqGFEHjRhEpqLdB",
    title: "Welches Entspannungsverfahren passt zu mir?",
    description:
      "<p>Medizinisch anerkannte Entspannungsverfahren fördern die Gesundheit und verbessern markant das Wohlbefinden. Denn sie wirken der krank machenden Stressreaktion entgegen. Doch das Angebot ist gross. Was passt zu Dir?</p><p>Als dipl. Entspannungsfachperson und Stressberaterin gebe ich einen Einblick wie Autogenes Training, Progressive Muskelentspannung und Achtsamkeitsmeditation funktionieren und wir machen gemeinsam eine Entspannungsübung</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Küchensaal EG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "RF6CEnDFMjj6c7HXA",
    time_lastedit: {
      $date: "2024-09-04T12:54:35.186+0000",
    },
    time_created: {
      $date: "2024-09-03T12:40:20.441+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T07:50:00.000+0000",
    },
    createdBy: "Siward",
    categories: ["misc"],
    participants: [
      {
        user: "Margy",
        companions: 0,
      },
      {
        user: "Sharla",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "fZcwCD5CJvuLdrHg2",
    title: "Singen für Klein + Gross",
    description:
      "<p>Fröhliches, beschwingtes Singen für Kleinkinder mit erwachsenen Begleitung.</p><p>Mit anschliessendem Znüni und danach freies Spiel für die Kleinen und Zeit für Kennenlernen und Austausch für die Erwachsenen. </p><p>Mitbringen: Stoppersocken (barfuss auch möglich) </p>",
    venue: {
      name: "Gemeinschaftsraum Stadtgarten Green City, Maneggplatz 34, 8041 Zürich",
    },
    room: "Gemeinschaftsraum Stadtgarten Green City",
    internal: false,
    sendReminder: false,
    noRsvp: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "hkS2FN5p98EztPBuM",
    time_lastedit: {
      $date: "2024-06-04T15:05:30.298+0000",
    },
    time_created: {
      $date: "2024-05-30T09:57:53.111+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T07:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T09:00:00.000+0000",
    },
    createdBy: "Shanon",
    categories: ["sports", "misc"],
  },
  {
    _id: "WiecvQ73LNadcGKaq",
    title: "Kinderzahnpflege einfach erklärt!",
    description:
      "<p>In diesem Kurs lernen Eltern alles über die Pflege der Kinderzähne von der Schwangerschaft bis zum Schuleintritt: Worauf muss ich in der Schwangerschaft achten? Wann kommen die ersten Zähne? Wie putze ich diese? Was muss ich beim Zahnen beachten? Und was ist mit Fluorid und Karies? </p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Lesecafé (1.OG)",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ecuPy9qGapGQEgjkc",
    time_lastedit: {
      $date: "2024-06-27T14:15:05.757+0000",
    },
    time_created: {
      $date: "2024-04-30T15:36:03.826+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T08:45:00.000+0000",
    },
    createdBy: "Junina",
    categories: ["sciences", "misc"],
    canceled: true,
  },
  {
    _id: "3HqyF8dKp572PzGr3",
    title: "Gym-Fit",
    description:
      "<p>An diesem Tag erhalten Sie Einblick in diverse Übungen zum Training der Muskulatur, des Herz-Kreislaufsystems und der Koordination. </p><p>Wir machen Gleichgewichtstraining, Stretching und Übungen zur Anregung der kognitiven Funktionen.</p><p><br /></p><p><br /></p>",
    venue: {
      name: "Kirchgemeindehaus Hottingen",
      _id: "DZaCQooxaSq7zn5F7",
    },
    room: "Kirchgemeindehaus Hottingen, Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "gLT2btdRXvzKqD9t3",
    time_lastedit: {
      $date: "2024-07-04T08:29:32.116+0000",
    },
    time_created: {
      $date: "2024-07-04T08:29:32.116+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T09:00:00.000+0000",
    },
    createdBy: "Chane",
    categories: ["sports"],
    participants: [
      {
        user: "Alisun",
        companions: 0,
      },
      {
        user: "Augustus",
        companions: 0,
      },
      {
        user: "Sonny",
        companions: 0,
      },
      {
        user: "Reine",
        companions: 0,
      },
      {
        user: "Eva",
        companions: 0,
      },
      {
        user: "Sidonnie",
        companions: 0,
      },
      {
        user: "Malissia",
        companions: 0,
      },
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Kary",
        companions: 0,
      },
      {
        user: "Cam",
        companions: 0,
      },
      {
        user: "Ariadne",
        companions: 0,
      },
      {
        user: "Gavin",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
    ],
  },
  {
    _id: "roR9imbCdwKtzYsnz",
    title: "Endlich wieder erholsam schlafen",
    description:
      "<p>Sehr viele Menschen leiden unter Schlafstörungen. Wir suchen gemeinsam Möglichkeiten, wie Du Dich besser auf gesunden, erholsamen Schlaf vorbereiten. Und was kannst Du tun, wenn Du nachts aufwachst, um wieder einschlafen zu können? Zudem schauen wir, welche Antworten die Wissenschaft auf Mythen rund um den Schlaf gefunden hat. Doch es gibt noch viele offene Fragen rund um den Schlaf. Sicher ist, dass med. anerkannte Entspannungsverfahren guten Schlaf fördern. </p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Küchensaal EG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "XWnAgYmE4w98vpKvg",
    time_lastedit: {
      $date: "2024-09-04T12:55:23.072+0000",
    },
    time_created: {
      $date: "2024-09-03T12:45:07.033+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T09:00:00.000+0000",
    },
    createdBy: "Cirstoforo",
    categories: ["misc"],
    participants: [
      {
        user: "Kizzee",
        companions: 0,
      },
      {
        user: "Nikoletta",
        companions: 0,
      },
      {
        user: "Harrison",
        companions: 0,
      },
      {
        user: "Wallace",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 0,
      },
      {
        user: "Daniela",
        companions: 0,
      },
      {
        user: "Peterus",
        companions: 0,
      },
      {
        user: "Cybill",
        companions: 0,
      },
    ],
  },
  {
    _id: "8xnjyYannjuuKjKZP",
    title: "Mandarin 101 - für Erwachsene ab 14 Jahren",
    description:
      "<p>Crash course (in English) on the characters of traditional Chinese, how a character is formed from image to meaning. Introduction to the types of basic strokes to compose characters, we will write and learn to speak a few phrases for your next nature or cultural exploration in the far east. <br /></p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Leselounge (2. OG)",
    internal: false,
    sendReminder: true,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "24bALLRMvjCpeQmZ6",
    time_lastedit: {
      $date: "2024-06-27T14:12:10.622+0000",
    },
    time_created: {
      $date: "2024-04-11T16:39:31.271+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T08:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T09:30:00.000+0000",
    },
    createdBy: "Sadie",
    categories: ["languages", "culture"],
    noRsvp: false,
    participants: [
      {
        user: "Gal",
        companions: 0,
      },
      {
        user: "Tyler",
        companions: 0,
      },
      {
        user: "Gerhardine",
        companions: 0,
      },
      {
        user: "Wilhelmina",
        companions: 1,
      },
      {
        user: "Creight",
        companions: 0,
      },
      {
        user: "Fidela",
        companions: 0,
      },
      {
        user: "Pace",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 0,
      },
      {
        user: "Laney",
        companions: 0,
      },
    ],
  },
  {
    _id: "339dicBM3fMWLj2sF",
    title: "Zentangle® - Hollibaugh",
    description:
      "<p>In diesem Kurs stellen wir das Zentangle Muster Hollibaugh ins Zentrum. Die Muster der Zentangle Methode wecken die eigene Kreativität und mit jedem Strich entsteht ein neues Kunstwerk. Zentangle® entführt in eine andere Welt und lässt den Alltag vergessen. </p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "kleines Kurslokal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "cfkq4oWQr7EhuQBGn",
    time_lastedit: {
      $date: "2024-06-03T13:51:18.857+0000",
    },
    time_created: {
      $date: "2024-06-03T13:50:16.398+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T09:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T10:30:00.000+0000",
    },
    createdBy: "Abe",
    categories: ["culture"],
    participants: [
      {
        user: "Ervin",
        companions: 0,
      },
      {
        user: "Wilhelmina",
        companions: 0,
      },
      {
        user: "Roberto",
        companions: 0,
      },
      {
        user: "Rog",
        companions: 0,
      },
      {
        user: "Gabriela",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Adelbert",
        companions: 0,
      },
    ],
  },
  {
    _id: "a32qCXBns54hCqc5M",
    title: "PMR progressive Muskelrelaxation",
    description:
      "<p>Wir spannen und entspannen der Reihe nach diverse Muskelgruppen (zB. Oberarm) und lernen dabei unseren Körper neu kennen.<br /></p><p>Bitte ziehen Sie bequeme Kleidung an und bringen Sie eine Yogamatte oder ein grosses Tuch mit. </p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "xrCL9p2Fg94R3Niur",
    time_lastedit: {
      $date: "2024-08-30T18:31:01.237+0000",
    },
    time_created: {
      $date: "2024-04-26T07:28:43.244+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T10:15:00.000+0000",
    },
    end: {
      $date: "2024-09-19T11:15:00.000+0000",
    },
    createdBy: "Devina",
    categories: ["sports"],
    participants: [
      {
        user: "Brennan",
        companions: 0,
      },
      {
        user: "Teriann",
        companions: 0,
      },
      {
        user: "Ingemar",
        companions: 0,
      },
      {
        user: "Orlan",
        companions: 0,
      },
      {
        user: "Chrissie",
        companions: 0,
      },
      {
        user: "Stearne",
        companions: 0,
      },
      {
        user: "Brendis",
        companions: 0,
      },
    ],
  },
  {
    _id: "rAjf4i3WBB7baBhSR",
    title: "Prallvoller Kleiderschrank - und doch hats nichts zum Anziehen drin?",
    description:
      "<p>Warum nur ziehen Sie die Teile nicht an? Bringen Sie 4 - 6 Kleidungsstücke mit und erfahren ganz praktisch, wie Sie die Kleider auf Ihre Figur anpassen, ändern oder kombinieren können. Sie erleben live die Wirkung von Schnitt, Farbe, Musterung, Stil und was passt und was eben nicht.</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Lounge",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 14,
    region: "h4MnI3psRr8hSljk2",
    courseId: "3Hw7tPDXRxhHn5R5B",
    time_lastedit: {
      $date: "2024-05-21T15:09:38.623+0000",
    },
    time_created: {
      $date: "2024-05-21T15:09:38.623+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T13:00:00.000+0000",
    },
    createdBy: "Oswald",
    categories: ["misc"],
    participants: [
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Elli",
        companions: 0,
      },
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Beitris",
        companions: 0,
      },
      {
        user: "Josh",
        companions: 0,
      },
    ],
  },
  {
    _id: "xH55kj2XTKPxPmW5n",
    title: "Qigong / Tai Chi",
    description:
      "<p>Eine spielerische Tai Chi- Kurzform kennenlernen, umrahmt von ein paar einfachen Qigong-Übungen.</p><p><br /></p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Grosser Saal",
    internal: false,
    sendReminder: false,
    noRsvp: false,
    maxParticipants: 17,
    region: "h4MnI3psRr8hSljk2",
    courseId: "t3TJokosJ5GokhtjT",
    time_lastedit: {
      $date: "2024-09-12T09:07:13.347+0000",
    },
    time_created: {
      $date: "2024-07-09T09:27:06.606+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T13:00:00.000+0000",
    },
    createdBy: "Auberta",
    categories: ["sports"],
    participants: [
      {
        user: "Tammara",
        companions: 0,
      },
      {
        user: "Tab",
        companions: 0,
      },
      {
        user: "Aimee",
        companions: 0,
      },
      {
        user: "Maryl",
        companions: 0,
      },
      {
        user: "Phylys",
        companions: 0,
      },
      {
        user: "Marleah",
        companions: 0,
      },
      {
        user: "Elli",
        companions: 1,
      },
      {
        user: "Sunny",
        companions: 0,
      },
      {
        user: "Massimiliano",
        companions: 0,
      },
      {
        user: "Jo ann",
        companions: 0,
      },
      {
        user: "Udell",
        companions: 0,
      },
      {
        user: "Dione",
        companions: 0,
      },
      {
        user: "Valencia",
        companions: 0,
      },
      {
        user: "Bev",
        companions: 0,
      },
      {
        user: "Phylys",
        companions: 0,
      },
    ],
  },
  {
    _id: "PEiS8n5jYHiQqh2Hu",
    title: "Entspannt trotz ADHS?",
    description:
      "<p>Menschen mit ADHS leiden häufig unter Stress aufgrund der Hyperaktivität, Impulsivität und als Folge der kürzeren Aufmerksamkeitsspanne. Medizinisch anerkannte Entspannungsverfahren können kurzfristig zur Bewältigung von akutem Stress sowie zur Steigerung des Wohlbefindens eingesetzt werden. Längerfristig helfen sie überbordende Gefühle in den Griff zu bekommen und das allgemeine körperliche Anspannungsniveau zu senken. Angesprochen sind sowohl ADHS-Betroffene als auch deren Angehörige wie z.B. Partner oder Eltern.</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Küchensaal EG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "FQX8kE7sLHt9Xg3Jq",
    time_lastedit: {
      $date: "2024-09-10T13:22:10.336+0000",
    },
    time_created: {
      $date: "2024-09-03T12:49:26.155+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T14:00:00.000+0000",
    },
    createdBy: "Alyse",
    categories: ["misc"],
    participants: [
      {
        user: "Gavin",
        companions: 0,
      },
      {
        user: "Gun",
        companions: 0,
      },
      {
        user: "Gertruda",
        companions: 0,
      },
      {
        user: "Karry",
        companions: 0,
      },
      {
        user: "Jerad",
        companions: 0,
      },
      {
        user: "Brenn",
        companions: 0,
      },
      {
        user: "Rici",
        companions: 0,
      },
      {
        user: "Quintilla",
        companions: 0,
      },
      {
        user: "Gussi",
        companions: 0,
      },
      {
        user: "Cully",
        companions: 0,
      },
      {
        user: "Lavinie",
        companions: 0,
      },
      {
        user: "Pansy",
        companions: 1,
      },
      {
        user: "Shelley",
        companions: 0,
      },
      {
        user: "Flin",
        companions: 0,
      },
      {
        user: "Lorenza",
        companions: 0,
      },
      {
        user: "Wilfred",
        companions: 0,
      },
      {
        user: "Bevon",
        companions: 0,
      },
      {
        user: "Gualterio",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
    ],
  },
  {
    _id: "w8TYDse9hF9GyuD5Z",
    title: "6-Wort-Geschichten",
    description:
      "<p>Lerne, selbst unterhaltsame, witzige, tragische, fantastische, spannende Geschichten mit nur 6-Wörtern zu schreiben. Wir experimentieren mit Wörtern, dass eine Freude ist. Du brauchst keine Vorkenntnisse. </p><p>Mitbringen: Gute Laune und Lust auf kreative Kurzgeschichten. Schreibheft, Schreibstift. </p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "Flex 2",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "azMeiz4iKxpSHdWQn",
    time_lastedit: {
      $date: "2024-05-29T12:40:22.893+0000",
    },
    time_created: {
      $date: "2024-05-29T12:27:47.593+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T12:15:00.000+0000",
    },
    end: {
      $date: "2024-09-19T13:45:00.000+0000",
    },
    createdBy: "Georgianne",
    categories: ["languages"],
    participants: [
      {
        user: "Veronica",
        companions: 0,
      },
      {
        user: "Fidela",
        companions: 0,
      },
      {
        user: "Morena",
        companions: 0,
      },
      {
        user: "Hewe",
        companions: 0,
      },
      {
        user: "Illa",
        companions: 0,
      },
      {
        user: "Revkah",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Drusy",
        companions: 0,
      },
      {
        user: "Casey",
        companions: 0,
      },
      {
        user: "Ariadne",
        companions: 0,
      },
    ],
  },
  {
    _id: "odjTqTQRmfJDhfqRJ",
    title: "Viel Energie durch Akupressur",
    description:
      "Akupressur ist ein altes Heilverfahren, gemäss dem Punkte auf Energieleitbahnen am Körper gedrückt oder massiert werden. Je nach Konstitution gibt es unterschiedliche Punkte, die zu mehr Energie und Vitalität verhelfen. Die Technik ist leicht erlernbar und kann zu Hause praktisch angewendet werden. ",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "DdKu2EGexFYzP6XCa",
    time_lastedit: {
      $date: "2024-09-25T12:52:02.127+0000",
    },
    time_created: {
      $date: "2024-05-29T13:10:32.335+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T14:30:00.000+0000",
    },
    createdBy: "Hanny",
    categories: ["misc"],
    participants: [
      {
        user: "Nicolai",
        companions: 0,
      },
      {
        user: "Nikoletta",
        companions: 0,
      },
      {
        user: "Anneliese",
        companions: 0,
      },
      {
        user: "Dylan",
        companions: 0,
      },
      {
        user: "Hildy",
        companions: 0,
      },
      {
        user: "Killy",
        companions: 0,
      },
      {
        user: "Jannel",
        companions: 0,
      },
      {
        user: "Christy",
        companions: 0,
      },
      {
        user: "Thibaut",
        companions: 0,
      },
    ],
  },
  {
    _id: "MY9fmqDpCiZPDj89Q",
    title: "Sorgenwürmli häkeln",
    description:
      "<p>Jeder kann ein wenig Glück gebrauchen...</p><p>Sorgenwürmli sind schnell und einfach hergestellt. Es braucht nicht viel, etwas Wolle und Grundkenntnisse im Häkeln (Luftmaschen und Stäbchen) reichen aus. </p><p>Das Material ist vorhanden. Bring Freude an der Handarbeit und gute Laune mit.</p>",
    venue: {
      name: "Unt-Haus",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ugwP5oSCKDpdzXhdW",
    time_lastedit: {
      $date: "2024-05-14T12:49:35.804+0000",
    },
    time_created: {
      $date: "2024-05-14T12:49:35.804+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    createdBy: "May",
    categories: ["handicraft"],
    participants: [
      {
        user: "Kimberly",
        companions: 0,
      },
      {
        user: "Everett",
        companions: 0,
      },
      {
        user: "Shelley",
        companions: 0,
      },
      {
        user: "Ron",
        companions: 0,
      },
    ],
  },
  {
    _id: "MCsJqifZWQP6JtuFj",
    title: "Autobahn der Gedanken - Wie finde ich die Ausfahrt zu meinem inneren Frieden?",
    description:
      "<p>Kennst du Gedanken wie: Ich muss doch… Warum habe ich nicht… Was wäre wenn… Willst du deinen Gedanken eine neue Richtung geben und einen liebevolleren inneren Dialog führen? Setze den Blinker, wechsle die Spur und du wirst staunen, was für Wege du entdeckst. Ich freue mich auf die Fahrt mit dir.</p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "AgMKwXtLYfxCckdMz",
    time_lastedit: {
      $date: "2024-09-18T08:06:58.480+0000",
    },
    time_created: {
      $date: "2024-09-18T08:06:58.480+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    createdBy: "Gerhard",
    categories: ["misc"],
    participants: [],
  },
  {
    _id: "AHQeN2pXRMgYM4LhJ",
    title: "Bring Ordnung in deine Unterlagen und Rechnungen",
    description:
      "<p>Du kriegst gratis eine Fächermappe und machst damit ein Ordnungs-System für deine Briefe und Rechnungen. Die Fächermappe kannst du nach dem Kurs nach Hause nehmen und darin Dokumente geordnet ablegen. So findest du Unterlagen schneller, wenn du sie brauchst.</p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "2.OG  Zeitschriften",
    internal: false,
    sendReminder: true,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "x6ggh94EJY67w9fDF",
    time_lastedit: {
      $date: "2024-04-09T15:18:02.666+0000",
    },
    time_created: {
      $date: "2024-04-09T15:18:02.666+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    createdBy: "Odell",
    categories: ["misc"],
    participants: [
      {
        user: "Margeaux",
        companions: 0,
      },
      {
        user: "Olly",
        companions: 0,
      },
      {
        user: "Tally",
        companions: 0,
      },
      {
        user: "Kary",
        companions: 0,
      },
      {
        user: "Shell",
        companions: 0,
      },
      {
        user: "Hewe",
        companions: 0,
      },
      {
        user: "Reagan",
        companions: 0,
      },
      {
        user: "Benoit",
        companions: 0,
      },
      {
        user: "Ddene",
        companions: 0,
      },
      {
        user: "Joaquin",
        companions: 0,
      },
      {
        user: "Gustavus",
        companions: 0,
      },
      {
        user: "Jourdan",
        companions: 0,
      },
      {
        user: "Honey",
        companions: 0,
      },
      {
        user: "Mirna",
        companions: 0,
      },
    ],
  },
  {
    _id: "GMdpnMKogGB96SnrL",
    title: "Purpose-Match - sinnorientiert leben und arbeiten",
    description:
      "<p>Purpose ist Lebenskraft und verleiht uns Energie, Wirksamkeit und Freude. Wir erkunden gemeinsam die Faktoren, auf die es ankommt, um mehr in die Kraft zu kommen, Flow zu erleben und Wertvolles in die Welt zu bringen.</p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "DtkhBogFxYYt8oxo6",
    time_lastedit: {
      $date: "2024-04-09T15:19:26.636+0000",
    },
    time_created: {
      $date: "2024-04-09T15:19:26.636+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    createdBy: "Haven",
    categories: ["misc"],
    participants: [
      {
        user: "Ramonda",
        companions: 0,
      },
      {
        user: "Selia",
        companions: 0,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Jyoti",
        companions: 0,
      },
      {
        user: "Bob",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 0,
      },
      {
        user: "Helene",
        companions: 0,
      },
      {
        user: "Orlan",
        companions: 0,
      },
      {
        user: "Lanna",
        companions: 0,
      },
      {
        user: "Quincey",
        companions: 0,
      },
      {
        user: "Lurline",
        companions: 0,
      },
      {
        user: "Benny",
        companions: 0,
      },
      {
        user: "Ingrid",
        companions: 0,
      },
    ],
  },
  {
    _id: "tXKoCjatEHX8jY7yh",
    title: "Fimo",
    description:
      "<p>Wir lernen spielerisch mit Fimo/Polymer Clay etwas herzustellen, z.B Perlen, Schale, Schlüsselanhänfer, Figur etc<br /></p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Küchensaal EG",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "pgeTwB7NkYjZp3bJF",
    time_lastedit: {
      $date: "2024-05-28T13:59:13.518+0000",
    },
    time_created: {
      $date: "2024-05-23T16:09:25.111+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:00:00.000+0000",
    },
    createdBy: "Adorne",
    categories: ["handicraft"],
    participants: [
      {
        user: "Benedicto",
        companions: 0,
      },
      {
        user: "Phillie",
        companions: 0,
      },
      {
        user: "Hale",
        companions: 0,
      },
      {
        user: "Herman",
        companions: 1,
      },
      {
        user: "Gerhardine",
        companions: 0,
      },
      {
        user: "Cary",
        companions: 1,
      },
    ],
  },
  {
    _id: "frMiqnxziLLgX5p9o",
    title: "Spass und Erfolg mit Mindmapping",
    description:
      "<p>Wann hast du deinen Hirnzellen das letzte Mal so richtig Freude gemacht? Zusammen üben wir, wie du das öfter mit dem Denkwerkzeug „Mindmapping“ erreichen kannst. Warum: Für mehr Spass und Erfolg im Alltag!</p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Werkraum",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "YCYkxTa4LQpRFS8GB",
    time_lastedit: {
      $date: "2024-08-16T07:21:54.809+0000",
    },
    time_created: {
      $date: "2024-05-24T07:37:48.187+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    createdBy: "Lemmy",
    categories: ["culture", "computer"],
    participants: [
      {
        user: "Lory",
        companions: 0,
      },
      {
        user: "Pace",
        companions: 0,
      },
      {
        user: "Padraig",
        companions: 0,
      },
      {
        user: "Brennan",
        companions: 0,
      },
      {
        user: "Shina",
        companions: 0,
      },
      {
        user: "Oswald",
        companions: 1,
      },
      {
        user: "Jeralee",
        companions: 0,
      },
      {
        user: "Quintilla",
        companions: 0,
      },
      {
        user: "Suzanna",
        companions: 0,
      },
      {
        user: "Catharina",
        companions: 0,
      },
    ],
  },
  {
    _id: "E43EQqJi3pDZT2Q2c",
    title: "Drucken mit einer Gelatineplatte",
    description:
      "<p>Mit Hilfe einer Gelatineplatte und Acrylfarbe fertigen Sie tolle einfache Drucke. Ihre Druckplatte gestalten Sie mit Naturmaterialien, die Sie in der Umgebung sammeln und selbst gestalteten Schablonen. Der Druck wird dann von der Platte abgezogen. Produkte: bedruckte Papiere und Karten.</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "9qWNxqoz9fJkaeb64",
    time_lastedit: {
      $date: "2024-05-26T08:57:51.273+0000",
    },
    time_created: {
      $date: "2024-05-26T08:57:51.273+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    createdBy: "Etti",
    categories: [],
    participants: [
      {
        user: "Sacha",
        companions: 0,
      },
      {
        user: "Nolly",
        companions: 0,
      },
      {
        user: "Elora",
        companions: 0,
      },
      {
        user: "Brenn",
        companions: 0,
      },
      {
        user: "Eyde",
        companions: 0,
      },
      {
        user: "Rudd",
        companions: 0,
      },
    ],
  },
  {
    _id: "R8L7kGacRkT6BQukQ",
    title: '"Die Orgel ist des Teufels Dudelsack"',
    description:
      "<p>Nach einer kurzen Erklärung des bekannten Zitats stellt Kantor Martin Rabensteiner die Kirchenorgel vor, die einst in der Tonhalle stand. Jeannine Piesold, Sozialdiakonin, stellt ihren Dudelsack vor. Es folgt ein Zusammenspiel der beiden Instrumente, welches sogar dem Teufel behagen würde 😉.</p>",
    venue: {
      name: "Kirche Neumünster",
      _id: "Zj7AQhvbSaSstSoCd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 50,
    region: "h4MnI3psRr8hSljk2",
    courseId: "bafNMtcp4r9oTXotS",
    time_lastedit: {
      $date: "2024-06-03T09:43:50.757+0000",
    },
    time_created: {
      $date: "2024-06-03T07:53:32.817+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    createdBy: "Rees",
    categories: ["misc", "culture"],
    participants: [
      {
        user: "Evania",
        companions: 0,
      },
      {
        user: "Rosabelle",
        companions: 0,
      },
      {
        user: "Ailey",
        companions: 0,
      },
      {
        user: "Jami",
        companions: 0,
      },
      {
        user: "Jermayne",
        companions: 0,
      },
    ],
  },
  {
    _id: "DNKuWrFykDmPnQJ5j",
    title: "Zumba in the 80s!",
    description:
      "<p>Findest du die 80's Musik die Beste? Diese Stunde ist für dich! ZUMBA® ist ein Tanz-Fitness Workout, ein dynamisches, begeisterndes und effektives Fitness-System. Die ZUMBA® Bewegungen können in jedem Alter erlernt werden und sind nicht schwierig. Komm vorbei!</p><p>Hallenschuhe und Wasser mitnehmen.  80s Outfit ist sehr willkommen! Bitte anmelden.</p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "6qhywjHRoWDfxDPiL",
    time_lastedit: {
      $date: "2024-09-05T08:53:17.047+0000",
    },
    time_created: {
      $date: "2024-05-28T08:58:06.906+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:20:00.000+0000",
    },
    createdBy: "Carola",
    categories: ["sports"],
    participants: [
      {
        user: "Georgia",
        companions: 0,
      },
      {
        user: "Woodrow",
        companions: 0,
      },
      {
        user: "Chadd",
        companions: 0,
      },
      {
        user: "Alane",
        companions: 0,
      },
      {
        user: "Maisey",
        companions: 0,
      },
      {
        user: "Kerri",
        companions: 0,
      },
      {
        user: "Eberhard",
        companions: 0,
      },
      {
        user: "Sophia",
        companions: 0,
      },
      {
        user: "Edita",
        companions: 0,
      },
      {
        user: "Orella",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Aguistin",
        companions: 0,
      },
      {
        user: "Holli",
        companions: 0,
      },
      {
        user: "Rafaelia",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Sallie",
        companions: 1,
      },
      {
        user: "Seamus",
        companions: 0,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Sayers",
        companions: 0,
      },
      {
        user: "Giordano",
        companions: 0,
      },
      {
        user: "Carrie",
        companions: 1,
      },
      {
        user: "Alyse",
        companions: 0,
      },
      {
        user: "Windham",
        companions: 0,
      },
      {
        user: "Chrissie",
        companions: 0,
      },
      {
        user: "Vivianne",
        companions: 0,
      },
      {
        user: "Brent",
        companions: 0,
      },
    ],
  },
  {
    _id: "7mg8F2FaT7fg87LSo",
    title: "Couch, Träume und laaanges Schweigen?",
    description:
      "<p>Was ist eigentlich eine Psychoanalyse und wie funktioniert diese heutzutage? Was sind Mythen, die sich darum ranken, und was ist Realität? Wie kann eine Psychoanalyse bei seelischem Leiden helfen? Ein kurzer Einblick in ein traditionelles und gleichzeitig hochaktuelles Therapieverfahren.</p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "1. OG Lounge",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ECWXBvebQDurkhmR9",
    time_lastedit: {
      $date: "2024-06-25T08:44:20.644+0000",
    },
    time_created: {
      $date: "2024-05-28T13:46:53.522+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    createdBy: "Ermin",
    categories: ["misc"],
    participants: [
      {
        user: "Sharyl",
        companions: 0,
      },
      {
        user: "Curtice",
        companions: 0,
      },
      {
        user: "Andee",
        companions: 0,
      },
      {
        user: "Florenza",
        companions: 0,
      },
      {
        user: "Daryn",
        companions: 0,
      },
      {
        user: "Teresita",
        companions: 0,
      },
      {
        user: "Evvie",
        companions: 0,
      },
      {
        user: "Byram",
        companions: 0,
      },
      {
        user: "Kalle",
        companions: 0,
      },
      {
        user: "Yelena",
        companions: 0,
      },
      {
        user: "Terri-jo",
        companions: 0,
      },
      {
        user: "Kala",
        companions: 0,
      },
      {
        user: "Valma",
        companions: 0,
      },
      {
        user: "Jo ann",
        companions: 0,
      },
    ],
  },
  {
    _id: "no8ESEXkAZ6qDCvsL",
    title: "Citizen Science: Forsch doch selbst mal!",
    description:
      "<p>Citizen Science ist Forschung, in der Mitforschen auch ohne akademische Ausbildung möglich ist. Wichtiger sind Lebenserfahrung, Alltagswissen oder die Lust zum Mitmachen. Welche Projekte gibt es? Wie kann ich mich beteiligen oder selbst ein Projekt starten? Dieser Kurs bietet einen Überblick!</p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Raum für Alles",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "mXcpXcrKpuiQpPt45",
    time_lastedit: {
      $date: "2024-07-01T09:52:03.786+0000",
    },
    time_created: {
      $date: "2024-05-31T09:06:04.248+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    createdBy: "Phylys",
    categories: ["misc"],
    participants: [
      {
        user: "Marsha",
        companions: 0,
      },
      {
        user: "Edan",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "yC9K2nzEimb3krmoY",
    title: "Wie finde ich meinen ganz eigenen Stil?",
    description:
      "<p>Heute gibt es unzählige Möglichkeiten sich in Kleidern auszudrücken:-) </p><p>Welche Farben, Formen, Materialien sind optimal für mich? </p><p>Komme in einem deiner Lieblingskleider (vielleicht sind das Jeans und T-Shirt) und erfahre, was noch möglich ist, damit du dich puddelwohl, schön und sicher fühlst.</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qTmG2vmS6bzztK2pu",
    time_lastedit: {
      $date: "2024-07-11T11:11:18.969+0000",
    },
    time_created: {
      $date: "2024-07-08T09:53:26.050+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:30:00.000+0000",
    },
    createdBy: "Vincenz",
    categories: ["misc"],
    participants: [
      {
        user: "Essy",
        companions: 0,
      },
      {
        user: "Liz",
        companions: 0,
      },
      {
        user: "Berky",
        companions: 0,
      },
      {
        user: "Chadd",
        companions: 0,
      },
      {
        user: "Giordano",
        companions: 0,
      },
      {
        user: "Rea",
        companions: 0,
      },
      {
        user: "Sophia",
        companions: 0,
      },
      {
        user: "Herman",
        companions: 0,
      },
      {
        user: "Maryjo",
        companions: 0,
      },
      {
        user: "Robby",
        companions: 0,
      },
      {
        user: "Roze",
        companions: 0,
      },
    ],
  },
  {
    _id: "QN95mcpC43Q3Kr8cz",
    title: "Umgang mit Fieber",
    description:
      "<p>Fieber ist nach wie vor mit Angst behaftet, und viele fühlen sich überfordert im Umgang mit Fieber. Angst ist ein schlechter Ratgeber. Das Wissen um den Sinn des Fiebers und um die möglichen begleitendenen Massnahmen während der verschiedenen Fieberstadien wirken ent-ängstigend.<br /><br /></p>",
    venue: {
      name: "GZ Heuried",
      _id: "PAk5EEYNy9dG8ERPC",
    },
    room: "Clubraum",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "EWipQQ6G87BQZnKm7",
    time_lastedit: {
      $date: "2024-07-18T16:55:10.879+0000",
    },
    time_created: {
      $date: "2024-05-13T13:35:18.679+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    createdBy: "Wilfred",
    categories: ["misc"],
  },
  {
    _id: "HkpRb4agrssqsFaMz",
    title: "Sauerteigbrot Backkurs ( Grundkurs)",
    description:
      'Eine Original-Sauerteig-Mischung besteht nur aus Wasser und Mehl, das durch die natürlichen Mikroorganismen aus der Luft und dem Mehl  <a href="http://fermentiert.In" rel="nofollow">fermentiert.In</a> diesem Kurs lernst du vom Herstellen deines eigenen Anstellguts (welches du auch mit nach Hause nimmst) bis zum Backen verschiedener Brote! ',
    venue: {
      name: "GZ Hottingen - Lektion in privater Wohnung",
    },
    room: "Streulistrasse 2, 8032 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "EPj4GEZfDx4APyWSw",
    time_lastedit: {
      $date: "2024-08-13T19:42:11.301+0000",
    },
    time_created: {
      $date: "2024-05-28T19:48:29.523+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:30:00.000+0000",
    },
    createdBy: "Delcina",
    categories: [],
    participants: [
      {
        user: "Sonny",
        companions: 0,
      },
      {
        user: "Koressa",
        companions: 1,
      },
      {
        user: "Royall",
        companions: 0,
      },
      {
        user: "Bili",
        companions: 0,
      },
      {
        user: "Elfrida",
        companions: 0,
      },
      {
        user: "Gustavus",
        companions: 0,
      },
      {
        user: "Mollee",
        companions: 0,
      },
    ],
  },
  {
    _id: "6s6rPGzFdANkE4ab6",
    title: "FOOD FUTURES",
    description:
      '<p>Bist du neugierig auf Tipps und Rezepte rund ums Essen, um gesund zu leben, weniger zu verschwenden und um dem Planeten zu helfen? Nimm an diesem 90-minütigen Lebensmittel-Workshop teil und lerne neue Fakten und Konzepte kennen, wie z.B. die "Planetary Health Diet".</p>',
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "gyBZiBLLj6gupNXEt",
    time_lastedit: {
      $date: "2024-05-29T12:52:53.137+0000",
    },
    time_created: {
      $date: "2024-05-29T12:52:53.137+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:30:00.000+0000",
    },
    createdBy: "Law",
    categories: [],
    participants: [
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Josh",
        companions: 1,
      },
      {
        user: "Beatriz",
        companions: 0,
      },
      {
        user: "Gabbey",
        companions: 0,
      },
      {
        user: "Cully",
        companions: 0,
      },
      {
        user: "Gene",
        companions: 0,
      },
      {
        user: "Alisun",
        companions: 0,
      },
      {
        user: "Andee",
        companions: 0,
      },
      {
        user: "Emelyne",
        companions: 0,
      },
    ],
  },
  {
    _id: "M4FyCXpeTmpp4fZ4P",
    title: "Rätoromanisch; Sprache und Kultur kennenlernen",
    description:
      "<p>In dieser 1-stündigen Lektion wird den Teilnehmenden ein Gefühl für die rätoromanische Sprache und deren Kultur vermittelt. Das Ziel ist, dass die TN ein paar Sätze sprechen und verstehen können und auf was sie bei ihrem nächsten Ausflug in den Bündner Bergen beachten oder wissen sollten. <br /></p>",
    venue: {
      name: "GZ Höngg (Limmattalstr)",
      _id: "62ejbXBwpdNLjYGbY",
    },
    room: "Galerie",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "xnrdaamNHhCXRq4vr",
    time_lastedit: {
      $date: "2024-06-04T06:03:44.980+0000",
    },
    time_created: {
      $date: "2024-05-31T13:09:05.297+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    createdBy: "Morgen",
    categories: ["languages", "culture"],
    participants: [
      {
        user: "Farleigh",
        companions: 0,
      },
      {
        user: "Cletus",
        companions: 0,
      },
      {
        user: "Jeremiah",
        companions: 0,
      },
      {
        user: "Caroline",
        companions: 0,
      },
      {
        user: "Casey",
        companions: 0,
      },
      {
        user: "Russ",
        companions: 0,
      },
      {
        user: "Alison",
        companions: 0,
      },
      {
        user: "Kenyon",
        companions: 1,
      },
      {
        user: "Gawain",
        companions: 1,
      },
      {
        user: "Teresina",
        companions: 0,
      },
      {
        user: "Rudd",
        companions: 0,
      },
      {
        user: "Oswald",
        companions: 0,
      },
      {
        user: "Ardenia",
        companions: 0,
      },
      {
        user: "Mendie",
        companions: 0,
      },
      {
        user: "Kary",
        companions: 0,
      },
      {
        user: "Janina",
        companions: 0,
      },
      {
        user: "Kris",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 0,
      },
    ],
  },
  {
    _id: "ijfPFm5X79hm6ThCb",
    title: "Wut tut gut - eine Transformationsreise für Frauen*",
    description:
      "<p>Wut ist unerwünscht, unterdrückt und trotzdem da. Wir schauen uns in dieser Session Wut einmal wertfrei an. Wir nehmen sie wahr mit unseren Herzen und Körpern und und transformieren sie in das, was sie eigentlich ist: Energie.</p><p>Die Session wird bunt, freudvoll und findet einen entspannten Ausklang.<br /></p><p></p>",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Gruppenraum 1 und 2",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "zKh9EFayDN83AwSEP",
    time_lastedit: {
      $date: "2024-06-03T12:40:43.095+0000",
    },
    time_created: {
      $date: "2024-06-03T12:40:43.095+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:30:00.000+0000",
    },
    createdBy: "Amargo",
    categories: ["misc"],
    participants: [
      {
        user: "Morena",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 0,
      },
      {
        user: "Alida",
        companions: 0,
      },
      {
        user: "Renee",
        companions: 0,
      },
      {
        user: "Woodrow",
        companions: 0,
      },
      {
        user: "Miguelita",
        companions: 0,
      },
      {
        user: "Rickey",
        companions: 0,
      },
      {
        user: "Sula",
        companions: 0,
      },
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Trescha",
        companions: 0,
      },
    ],
  },
  {
    _id: "Xb728ao2MdJEnL5LR",
    title: "Stadtbienen & Stadthonig",
    description:
      "<p>Tauchen Sie mit allen Sinnen in die Welt der Stadtbienen und des flüssigen Goldes ein. Wir lüften Geheimnisse zum Liebesglück der männlichen Bienen, erklären warum die Bienenkönigin wenig mit einer Herrscherin gemein hat und warum das Bienenvolk manchmal in ein Fussballstadion zieht. </p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Dachterrasse bei schönem Wetter ",
    internal: false,
    sendReminder: true,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Lot8Mpx9Z5FDe8QzB",
    time_lastedit: {
      $date: "2024-05-23T12:49:11.016+0000",
    },
    time_created: {
      $date: "2024-03-18T09:22:08.248+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:30:00.000+0000",
    },
    createdBy: "Read",
    categories: ["handicraft", "sciences", "cooking", "culture"],
    noRsvp: false,
    participants: [
      {
        user: "Isabel",
        companions: 1,
      },
      {
        user: "Tammy",
        companions: 0,
      },
      {
        user: "Malissia",
        companions: 1,
      },
      {
        user: "Ewan",
        companions: 0,
      },
      {
        user: "Morgen",
        companions: 0,
      },
      {
        user: "Veronica",
        companions: 0,
      },
      {
        user: "Shena",
        companions: 1,
      },
      {
        user: "Seward",
        companions: 0,
      },
      {
        user: "Gus",
        companions: 0,
      },
      {
        user: "Jimmy",
        companions: 0,
      },
    ],
  },
  {
    _id: "JwjGc5gt34jsuzTD4",
    title: "Ein kulinarischer Gruss aus Südindien",
    description:
      "<p>Kennzeichen der südindischen Küche ist ein ausgewogener Mix aus gewürzten und ungewürzten Speisen. Wir kochen ein alltägliches vegetarisches Essen, bestehend aus Reis, Linsengericht, Gemüse Curry und, zum kühlenden Abschluss, Joghurt.</p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "Küche 1. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "xFDbPBabmwdvyjJed",
    time_lastedit: {
      $date: "2024-07-04T11:13:07.846+0000",
    },
    time_created: {
      $date: "2024-05-02T12:00:33.900+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:30:00.000+0000",
    },
    createdBy: "Celie",
    categories: ["cooking"],
    participants: [
      {
        user: "Jaye",
        companions: 0,
      },
      {
        user: "Bev",
        companions: 0,
      },
      {
        user: "Rees",
        companions: 1,
      },
      {
        user: "Elyssa",
        companions: 0,
      },
      {
        user: "Gerrilee",
        companions: 0,
      },
      {
        user: "Ailey",
        companions: 0,
      },
      {
        user: "Orella",
        companions: 0,
      },
    ],
  },
  {
    _id: "XoWdtzKabZHHy2bHf",
    title: "hacer tapas y hablar un poco en español",
    description:
      "<p>¡HOLA! Wir bereiten einfache Tapas zu, lernen einige spanische Wörter, essen gemeinsam y hablamos un poco español:) </p>",
    venue: {
      name: "GZ Heuried",
      _id: "PAk5EEYNy9dG8ERPC",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qg9H8qGBXyNBjhCqf",
    time_lastedit: {
      $date: "2024-08-30T08:57:01.645+0000",
    },
    time_created: {
      $date: "2024-05-22T14:31:09.806+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:30:00.000+0000",
    },
    createdBy: "Mallissa",
    categories: [],
    participants: [
      {
        user: "Elora",
        companions: 0,
      },
      {
        user: "Bron",
        companions: 0,
      },
      {
        user: "Lesya",
        companions: 0,
      },
      {
        user: "Lora",
        companions: 0,
      },
      {
        user: "Lurline",
        companions: 0,
      },
      {
        user: "Evey",
        companions: 0,
      },
      {
        user: "Clarance",
        companions: 1,
      },
    ],
    canceled: true,
  },
  {
    _id: "osrsdWCDxvEhxp3s6",
    title: "International soup-lab: Suppen aus 6 Ländern",
    description:
      '<p>Lerne mit uns, dem "Kochclub international", Suppen aus 6 verschiedenen Ländern zu kochen. Mitnehmen: Kochschürze und ein Tupperware.</p>',
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "zPt7DWWr2SRrhbC8X",
    time_lastedit: {
      $date: "2024-05-24T12:14:46.661+0000",
    },
    time_created: {
      $date: "2024-05-24T12:14:46.661+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T20:30:00.000+0000",
    },
    createdBy: "Maryann",
    categories: ["cooking"],
    participants: [
      {
        user: "Drusy",
        companions: 0,
      },
      {
        user: "Zahara",
        companions: 0,
      },
      {
        user: "Renee",
        companions: 0,
      },
      {
        user: "Karola",
        companions: 0,
      },
      {
        user: "Chrissie",
        companions: 0,
      },
      {
        user: "Helene",
        companions: 0,
      },
      {
        user: "Yurik",
        companions: 0,
      },
      {
        user: "Karee",
        companions: 0,
      },
    ],
  },
  {
    _id: "LNwgGJA3EAe6QY9i6",
    title: "Yoga Nidra",
    description:
      "<p>Yoga Nidra ist eine Meditationspraxis der tiefen Entspannung aus dem traditionellen Yoga. Bei Yoga Nidra versetzt man Geist und Körper in einen Zustand tiefer Entspannung, der über das gewöhnliche Entspannungsgefühl hinausgeht.</p><p>Yogamatte und weiche Decke mitnehmen. Bitte anmelden.</p>",
    venue: {
      name: "Quartierzentrum Schütze",
      _id: "6Fvy9P9zRvZsX6ans",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "T7zoh7b7fQSaZC9dK",
    time_lastedit: {
      $date: "2024-05-28T09:01:53.764+0000",
    },
    time_created: {
      $date: "2024-05-28T09:01:53.764+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    createdBy: "Jimmy",
    categories: ["sports", "misc"],
    participants: [
      {
        user: "Lalo",
        companions: 1,
      },
      {
        user: "Nathanil",
        companions: 0,
      },
      {
        user: "Morgan",
        companions: 0,
      },
      {
        user: "Peter",
        companions: 0,
      },
      {
        user: "Roberto",
        companions: 0,
      },
      {
        user: "Drucill",
        companions: 0,
      },
      {
        user: "Angelico",
        companions: 1,
      },
      {
        user: "Josefa",
        companions: 0,
      },
      {
        user: "Lenora",
        companions: 0,
      },
      {
        user: "Honey",
        companions: 0,
      },
      {
        user: "Felicle",
        companions: 0,
      },
      {
        user: "Clerc",
        companions: 0,
      },
      {
        user: "Alice",
        companions: 1,
      },
      {
        user: "Caroline",
        companions: 0,
      },
    ],
  },
  {
    _id: "Q3uRTJWgXeWkeFwXH",
    title: "Essgeschichten - ein Rundgang durch Quartier",
    description:
      "<p>Auf der zweistündigen Tour wirst du Geheimtipps kennenlernen und mit Kostproben und Geschichten verwöhnt. Wir werden drei Standorte besuchen: Die jüdische Bäckerei in Zürich: Ma'adan Bakery, Madame Frigo, s'Foifi. Ihre Konzepte sind einzigartig und überzeugen. Lass uns gemeinsam entdecken! </p>",
    venue: {
      name: " Kollerwiese, hinter der Schmiede Wiedikon ",
    },
    room: "Treffpunkt vor dem Spielwagen vom GZ Heuried auf der Kollerwiese",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "XewsrESm5QKuvQwGA",
    time_lastedit: {
      $date: "2024-09-17T16:07:18.734+0000",
    },
    time_created: {
      $date: "2024-05-30T08:13:06.571+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:30:00.000+0000",
    },
    createdBy: "Jae",
    categories: ["sports", "cooking", "culture", "misc"],
    participants: [
      {
        user: "Gualterio",
        companions: 0,
      },
      {
        user: "Loutitia",
        companions: 0,
      },
      {
        user: "Pammy",
        companions: 0,
      },
      {
        user: "Dolores",
        companions: 0,
      },
      {
        user: "Leonore",
        companions: 0,
      },
      {
        user: "Dorris",
        companions: 0,
      },
      {
        user: "Hobey",
        companions: 0,
      },
      {
        user: "Wallie",
        companions: 0,
      },
      {
        user: "Liz",
        companions: 0,
      },
      {
        user: "Dahlia",
        companions: 1,
      },
      {
        user: "Willetta",
        companions: 0,
      },
      {
        user: "Leigh",
        companions: 0,
      },
      {
        user: "Maye",
        companions: 0,
      },
      {
        user: "Clive",
        companions: 1,
      },
      {
        user: "Ellette",
        companions: 0,
      },
      {
        user: "Thorvald",
        companions: 0,
      },
    ],
  },
  {
    _id: "t8D43bNv2oHAAhB9j",
    title: "Suchmaschinenoptimierung (SEO) für Webseiten - Eine Einführung",
    description:
      "<p>SEO ist die Disziplin, deine Webseite so zu optimieren, dass sie für deine Suchbegriffe oben bei Google erscheint. In diesem Vortrag lernst du: Wie wichtig der textliche Inhalt deiner Webseite ist, welche gratis SEO-Tools dein Leben leichter machen werden, dass SEO ein Marathon und kein Sprint ist.</p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qBv6YLwprLoDGYTdk",
    time_lastedit: {
      $date: "2024-06-01T07:58:43.492+0000",
    },
    time_created: {
      $date: "2024-05-31T11:35:28.400+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T17:30:00.000+0000",
    },
    createdBy: "Sophie",
    categories: ["computer"],
    participants: [
      {
        user: "Dorita",
        companions: 0,
      },
      {
        user: "Fulvia",
        companions: 0,
      },
      {
        user: "Vasili",
        companions: 0,
      },
      {
        user: "Laurel",
        companions: 0,
      },
      {
        user: "Cort",
        companions: 0,
      },
      {
        user: "Jeffy",
        companions: 0,
      },
      {
        user: "Aldridge",
        companions: 0,
      },
      {
        user: "Shina",
        companions: 0,
      },
      {
        user: "Loutitia",
        companions: 0,
      },
      {
        user: "Yolanda",
        companions: 1,
      },
      {
        user: "Jelene",
        companions: 0,
      },
      {
        user: "Gretel",
        companions: 0,
      },
      {
        user: "York",
        companions: 0,
      },
      {
        user: "Gery",
        companions: 0,
      },
      {
        user: "Xenos",
        companions: 0,
      },
      {
        user: "Tomi",
        companions: 0,
      },
      {
        user: "Karlen",
        companions: 0,
      },
      {
        user: "Christos",
        companions: 0,
      },
      {
        user: "Seward",
        companions: 0,
      },
      {
        user: "Moreen",
        companions: 0,
      },
      {
        user: "Buiron",
        companions: 0,
      },
    ],
  },
  {
    _id: "Cr5G5BGEcM6N6f99P",
    title: "Zumbavibes in der Bibliothek",
    description:
      "<p>mit Juan. </p><p>Mitbringen: gute Stimmung und bequeme Kleider! </p><p>Insta: jd_zumbavibes</p>",
    venue: {
      name: "PBZ Bibliothek Hardau",
      _id: "smRSEWukb2tGsFB4S",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "9abbe8nQvjNQ2m7eF",
    time_lastedit: {
      $date: "2024-05-31T08:41:41.307+0000",
    },
    time_created: {
      $date: "2024-05-31T08:20:32.132+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:00:00.000+0000",
    },
    createdBy: "Eberhard",
    categories: ["sports"],
    participants: [
      {
        user: "Celestyn",
        companions: 0,
      },
      {
        user: "Vincenz",
        companions: 0,
      },
    ],
  },
  {
    _id: "uFcSP9rME8GNW5THA",
    title: "Dichten – (k)ein Kinderspiel",
    description:
      "<p>Ich erzähle von meinen Erlebnissen auf dem Weg zum Globi- und Papa-Moll-Dichter, gehe auf Gedichtformen ein, weise auf Stolpersteine und Hilfsmittel hin, stelle kleine Aufgaben und lese aus Werken mit meinen Versen vor. Meine Freude am Dichten soll andere anstecken, es auch mit Reimen zu versuchen.<br /></p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "yikxTBasmBptTRxob",
    time_lastedit: {
      $date: "2024-05-26T13:04:22.557+0000",
    },
    time_created: {
      $date: "2024-05-26T09:07:54.772+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-19T18:30:00.000+0000",
    },
    createdBy: "Giustino",
    categories: ["languages"],
    participants: [
      {
        user: "Aldridge",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Helenelizabeth",
        companions: 0,
      },
      {
        user: "Natalee",
        companions: 1,
      },
      {
        user: "Tiphani",
        companions: 1,
      },
    ],
  },
  {
    _id: "bMWfwgYYFMBxhRfe5",
    title: "Tanzen und Tönen- Empowerment durch Stimme",
    description:
      "Wir erlernen das intuitive Tönen mit unserer Stimme und betreten das Feld der Heilklänge. Wir triggern durch dissonante Töne seelische Blockaden, lösen diese auf und fühlen uns danach leichter. Wir lernen die Techniken von Heiltönen kennen und dürfen Heilklänge schenken sowie auch empfangen.",
    venue: {
      name: "GZ Schindlergut",
      _id: "xQ9aGZdCZ5ssEcAgH",
    },
    room: "Raum für Alles",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "JwKSbpcsoRMLTofK2",
    time_lastedit: {
      $date: "2024-05-31T14:39:24.500+0000",
    },
    time_created: {
      $date: "2024-05-08T19:55:57.316+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-19T18:00:00.000+0000",
    },
    end: {
      $date: "2024-09-19T20:00:00.000+0000",
    },
    createdBy: "Stevana",
    categories: ["sports", "misc"],
    participants: [
      {
        user: "Deidre",
        companions: 0,
      },
      {
        user: "Mord",
        companions: 1,
      },
      {
        user: "Alano",
        companions: 0,
      },
      {
        user: "Dorice",
        companions: 0,
      },
      {
        user: "Gus",
        companions: 0,
      },
      {
        user: "Gib",
        companions: 0,
      },
      {
        user: "Rowen",
        companions: 0,
      },
      {
        user: "Valencia",
        companions: 0,
      },
      {
        user: "Arnoldo",
        companions: 0,
      },
      {
        user: "Dory",
        companions: 0,
      },
      {
        user: "Karee",
        companions: 0,
      },
      {
        user: "Gene",
        companions: 0,
      },
      {
        user: "Stefania",
        companions: 0,
      },
      {
        user: "Burgess",
        companions: 0,
      },
      {
        user: "Gray",
        companions: 0,
      },
    ],
  },
  {
    _id: "MWLk4o7wsYFt7QDnn",
    title: "Demokratie verstehen und mitpolitisieren lernen",
    description:
      "<p>Entdecke überraschende und bedeutsame Geschichten aus Demokratien kennen und komme den Rätseln auf die Spur. Wir spielen gemeinsam Observer – das demokratische Black Story Spiel! Dabei lernst du verschiedene Möglichkeiten kennen, wie du mitpolitisieren kannst.<br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im L200",
      _id: "EfRq9WNkHgX3ETkwc",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "jvoqzi2hm8XXteN2n",
    time_lastedit: {
      $date: "2024-06-30T08:01:53.603+0000",
    },
    time_created: {
      $date: "2024-05-31T10:52:24.310+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T09:00:00.000+0000",
    },
    createdBy: "Afton",
    categories: [],
    participants: [
      {
        user: "Sheilakathryn",
        companions: 0,
      },
      {
        user: "Lisha",
        companions: 0,
      },
      {
        user: "Sharla",
        companions: 0,
      },
      {
        user: "Auberta",
        companions: 0,
      },
    ],
  },
  {
    _id: "PBPS7WkFznaCGBxiM",
    title: "Stressdetektive",
    description:
      "<p>Was macht Dir Stress und wie kannst Du besser damit umgehen? </p><p>In diesem Workshop geht es darum, besser zu verstehen, was Dir persönlich Stress macht, welche Einstellungen und Glaubenssätze Deinen Stress zusätzlich verstärken und natürlich was Du dagegen tun kannst.</p><p></p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Küchensaal EG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "HRnksJszxjnCGtkMW",
    time_lastedit: {
      $date: "2024-09-04T12:52:33.620+0000",
    },
    time_created: {
      $date: "2024-09-03T12:52:02.993+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T09:00:00.000+0000",
    },
    createdBy: "Georgi",
    categories: ["misc"],
    participants: [
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Tyler",
        companions: 0,
      },
      {
        user: "Lanita",
        companions: 0,
      },
      {
        user: "Sholom",
        companions: 0,
      },
      {
        user: "Celie",
        companions: 0,
      },
      {
        user: "Rog",
        companions: 0,
      },
      {
        user: "Allene",
        companions: 0,
      },
    ],
  },
  {
    _id: "pFtDukKbNAC6jmXMy",
    title: "Tanzen für Klein + Gross",
    description:
      "<p>Tanzen, bewegen, hüpfen und springen: Für kleinere Kinder, die gerne tanzen in Begleitung von Erwachsenen.</p><p>Mitbringen: kleiner Znüni und Stoppersocken (barfuss auch möglich)<br /></p>",
    venue: {
      name: "Gemeinschaftsraum Stadtgarten Green City, Maneggplatz 34, 8041 Zürich",
    },
    room: "Gemeinschaftsraum Stadtgarten Green City, Maneggplatz 34, 8041 Zürich",
    internal: false,
    sendReminder: false,
    noRsvp: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Aw3wswurPFYgFk5QK",
    time_lastedit: {
      $date: "2024-06-04T15:02:33.360+0000",
    },
    time_created: {
      $date: "2024-05-30T10:05:46.793+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T07:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T08:30:00.000+0000",
    },
    createdBy: "Buck",
    categories: ["sports", "misc"],
  },
  {
    _id: "YoRsAqQ9dCMxNsY88",
    title: "Gestalte anhand eines Kunstbildes dein persönliches Triptichon",
    description:
      "<p>Lerne Kunst zu beschreiben, interpretieren und bildnerisch darzustellen.  Entdecke dabei deinen künstlerischen Ausdruck.<br /></p><p>Wir werden individuell ein ausgewähltes Kunstbild beschreiben lernen und anschliessend davon ein eigenes Bild in Form eines Triptychons aus Text und Bild erstellen.</p>",
    venue: {
      name: "Zumstein - Lektion im Leibundgut",
      _id: "nvNvCGQDaKjtNDsG6",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "rxffxyZ6m7HvYeijv",
    time_lastedit: {
      $date: "2024-06-03T07:11:04.324+0000",
    },
    time_created: {
      $date: "2024-05-30T14:42:20.973+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T07:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T10:00:00.000+0000",
    },
    createdBy: "Eyde",
    categories: ["culture"],
    participants: [
      {
        user: "Gaby",
        companions: 0,
      },
      {
        user: "Johann",
        companions: 0,
      },
      {
        user: "Dorita",
        companions: 0,
      },
      {
        user: "Wynnie",
        companions: 0,
      },
      {
        user: "Etti",
        companions: 0,
      },
      {
        user: "Sophia",
        companions: 1,
      },
    ],
  },
  {
    _id: "2Dk4akRerzWg8xbf6",
    title: "Design Your Own Course",
    description:
      '<p>Do you want to share your knowledge and skills in a full-length course? This lecture will explain how to design your course using "The Course Creative Canvas," a poster-sized planning tool. The only requirement is that you bring your own course idea.</p>',
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "hnKeA7pDBJp7dC8hy",
    time_lastedit: {
      $date: "2024-06-30T08:02:32.368+0000",
    },
    time_created: {
      $date: "2024-05-31T10:59:17.195+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T10:00:00.000+0000",
    },
    createdBy: "Nannette",
    categories: ["misc"],
    participants: [
      {
        user: "Dione",
        companions: 0,
      },
      {
        user: "Saraann",
        companions: 0,
      },
      {
        user: "Ettie",
        companions: 0,
      },
      {
        user: "Benoit",
        companions: 0,
      },
      {
        user: "Katinka",
        companions: 0,
      },
      {
        user: "Elane",
        companions: 0,
      },
      {
        user: "Laurel",
        companions: 0,
      },
      {
        user: "Tybi",
        companions: 0,
      },
    ],
  },
  {
    _id: "YdGw97urdcWtRM56Q",
    title: "Spanisch für Kleinkinder",
    description:
      "<p>Contando y jugando aprendemos español. Auf spielerische Weise lernen wir die spanische Sprache (als Muttersprache oder Zweitsprache). Durch Musik, Geschichten, Bewegungen, Singen, Tanzen und Basteln werden die Sozialkompetenzen und die Sprachkenntnisse der Kinder gestärkt und gefördert. Bienvenidos!</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "MrKFJHtCZzaH3HoLa",
    time_lastedit: {
      $date: "2024-07-09T06:23:16.835+0000",
    },
    time_created: {
      $date: "2024-05-31T11:07:51.609+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T08:45:00.000+0000",
    },
    createdBy: "Tonya",
    categories: ["languages"],
    participants: [
      {
        user: "Eliot",
        companions: 1,
      },
    ],
  },
  {
    _id: "ApnNMKn2EkFbMrDuf",
    title: "Wer bin ich? Kenne ich mich gut? Wie lerne ich mich noch besser kennen?",
    description:
      "Sich selber zu kennen, seine eigenen Fähigkeiten und Begrenzungen richtig einzuschätzen ist sinnvoll, wenn man nicht im Leben auf die Nase fallen will. Und wer will das schon? Aber immer wieder passiert es uns. Warum? Lassen sich solche Stürze vermeiden? Wie ? Gibt es Wege zur Selbsterkenntnis?",
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "aezC2GRTkuaHQPKGa",
    time_lastedit: {
      $date: "2024-07-11T12:06:49.974+0000",
    },
    time_created: {
      $date: "2024-06-17T09:56:13.571+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T09:00:00.000+0000",
    },
    createdBy: "Dominique",
    categories: [],
    participants: [
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Fax",
        companions: 0,
      },
      {
        user: "Keary",
        companions: 0,
      },
      {
        user: "Dean",
        companions: 0,
      },
      {
        user: "Laney",
        companions: 0,
      },
      {
        user: "Pavlov",
        companions: 0,
      },
      {
        user: "Ignaz",
        companions: 0,
      },
      {
        user: "Gussi",
        companions: 0,
      },
      {
        user: "Woodrow",
        companions: 0,
      },
      {
        user: "Kirbie",
        companions: 0,
      },
      {
        user: "Elora",
        companions: 0,
      },
      {
        user: "Fanechka",
        companions: 0,
      },
      {
        user: "Yalonda",
        companions: 1,
      },
      {
        user: "Tomasine",
        companions: 0,
      },
    ],
  },
  {
    _id: "dLEkLvkiJnzCBnDXi",
    title: "Continuum - Meditation in Bewegung Ein tiefes Loslassen von Körper & Geist",
    description:
      "<p>Wir bestehen hauptsächlich aus Wasser. Wenn wir uns von dort, von innen heraus bewegen lassen, ist das heilsam.</p><p>Wir spüren unserem Körper nach, nehmen wahr, lauschen &amp; geben dort nach, wo es bewegen will, halten inne, spüren wie das ist, so zu verharren und geben dem nächsten inneren Impuls nach.  </p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bühnensaal EG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "u6Ky5n8p5ksc4E7Nx",
    time_lastedit: {
      $date: "2024-06-04T10:54:43.867+0000",
    },
    time_created: {
      $date: "2024-05-30T09:28:21.742+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T09:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T10:00:00.000+0000",
    },
    createdBy: "Nickolaus",
    categories: ["misc"],
    participants: [
      {
        user: "Cletus",
        companions: 0,
      },
      {
        user: "Rex",
        companions: 0,
      },
      {
        user: "Olga",
        companions: 0,
      },
      {
        user: "Ilyse",
        companions: 0,
      },
      {
        user: "Roman",
        companions: 0,
      },
      {
        user: "Abba",
        companions: 0,
      },
      {
        user: "Bartholomeus",
        companions: 0,
      },
      {
        user: "Huntley",
        companions: 0,
      },
      {
        user: "Drugi",
        companions: 0,
      },
      {
        user: "Alexandros",
        companions: 0,
      },
      {
        user: "Hildy",
        companions: 0,
      },
      {
        user: "Sukey",
        companions: 0,
      },
      {
        user: "Nance",
        companions: 1,
      },
      {
        user: "Fidela",
        companions: 0,
      },
      {
        user: "Brodie",
        companions: 0,
      },
      {
        user: "Alexandra",
        companions: 0,
      },
      {
        user: "Guillaume",
        companions: 0,
      },
      {
        user: "Veronike",
        companions: 1,
      },
    ],
  },
  {
    _id: "PwKMvEbGKZqR8FjDS",
    title: 'Rhetorikkurs: was heisst "storytelling" und wie schaffe ich das eigentlich?',
    description:
      '<p>In diesem Kurs wird eine "Storytelling-Opener " untersucht, die in einem beliebten TED-Vortrag (En) verwendet wird. Danach darfst du selber üben wie du deine  nächste Präsentation mit Storytelling starten könntest.<br /></p>',
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Theater Ida, Aargauerstrasse 80, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 13,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ATtCSeRuYmLgTx3vu",
    time_lastedit: {
      $date: "2024-09-19T10:50:59.203+0000",
    },
    time_created: {
      $date: "2024-07-11T16:02:58.343+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T09:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T10:30:00.000+0000",
    },
    createdBy: "Othella",
    categories: ["misc", "culture"],
    participants: [
      {
        user: "Flory",
        companions: 0,
      },
      {
        user: "Jemmy",
        companions: 0,
      },
      {
        user: "Greggory",
        companions: 0,
      },
      {
        user: "Armin",
        companions: 0,
      },
      {
        user: "Augusta",
        companions: 0,
      },
      {
        user: "Myrtice",
        companions: 0,
      },
      {
        user: "Sileas",
        companions: 0,
      },
      {
        user: "Nevile",
        companions: 0,
      },
      {
        user: "Zahara",
        companions: 0,
      },
    ],
  },
  {
    _id: "uLFdjJzv4wL75khgX",
    title: "Kreative Schreibwerkstatt",
    description:
      "<p>Lesen und schreiben sind Geschwister! Gedichte und kurze Romanpassagen regen uns zum Schreiben an. Wer mag, bringt einen Textausschnitt aus einem Lieblingsbuch zum Vorlesen mit. Lass dich überraschen, wie inspirierend das wird! Vorwissen braucht es nicht. Neugier, Notizheft und Stift reichen schon.</p>",
    venue: {
      name: "Bistro ufem Chilehügel",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 9,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ST83fDDHEPSkKkoTu",
    time_lastedit: {
      $date: "2024-05-22T09:17:32.715+0000",
    },
    time_created: {
      $date: "2024-05-21T10:50:01.474+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    createdBy: "Jerry",
    categories: ["culture"],
    participants: [
      {
        user: "Bary",
        companions: 0,
      },
      {
        user: "Roberto",
        companions: 0,
      },
      {
        user: "Kenyon",
        companions: 0,
      },
      {
        user: "Chuck",
        companions: 0,
      },
      {
        user: "Arielle",
        companions: 0,
      },
      {
        user: "Elianora",
        companions: 0,
      },
      {
        user: "Florrie",
        companions: 0,
      },
      {
        user: "Rex",
        companions: 0,
      },
      {
        user: "Katey",
        companions: 0,
      },
    ],
  },
  {
    _id: "bSjE6JQ67orNZKxsB",
    title: "Sexualität",
    description:
      "<p>Kurze Einführung in die vielfältige Welt der menschlichen Sexualität (Ausdrucksformen, Präferenzen , aber auch Problem), gefolgt von einem Q&amp;A, in dem auch konkrete Tipps und Übungen mitgegeben werden - gerade auch wenn die Intimität in der Partnerschaft nicht mehr so richtig befriedigend ist. </p>",
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Theater Ida, Aargauerstrasse 80, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "YWeaWtCgeKbCJvenc",
    time_lastedit: {
      $date: "2024-06-06T12:41:09.708+0000",
    },
    time_created: {
      $date: "2024-05-23T14:49:28.671+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T13:00:00.000+0000",
    },
    createdBy: "Julianna",
    categories: ["misc"],
    participants: [
      {
        user: "Saunders",
        companions: 0,
      },
      {
        user: "Anneliese",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "j6arhedpdebjSJA6W",
    title: "Collagen erstellen mit Papier, Pasten und Acrylfarben",
    description:
      "<p>Mit Papier, Zeitung, selbst angemischten Strukturpasten und Acrylfarben erstellen wir individuelle Collagen.</p><p>Bitte Malkittel mitbringen. </p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "LFcDK4B96AFCY6KcN",
    time_lastedit: {
      $date: "2024-05-16T06:25:41.774+0000",
    },
    time_created: {
      $date: "2024-05-07T15:47:44.922+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T13:45:00.000+0000",
    },
    createdBy: "Junina",
    categories: ["handicraft"],
    participants: [
      {
        user: "Brier",
        companions: 0,
      },
      {
        user: "Donnie",
        companions: 0,
      },
      {
        user: "Lesya",
        companions: 0,
      },
      {
        user: "Devina",
        companions: 0,
      },
      {
        user: "Ingrid",
        companions: 0,
      },
      {
        user: "Aridatha",
        companions: 0,
      },
      {
        user: "Nikkie",
        companions: 0,
      },
      {
        user: "Jabez",
        companions: 0,
      },
    ],
  },
  {
    _id: "qbcEmL9SChgc2md4E",
    title: "Ricotta-Torte zubereiten",
    description:
      "<p>Die Ricotta Torte ist köstlich und ein einfacher Nachtisch ohne Mehl und Fett. Ich zeige dir, wie du sie (auch mit deinen Kindern) zubereiten kannst.</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "GZtjPNbPSympYWdHG",
    time_lastedit: {
      $date: "2024-07-05T14:40:42.886+0000",
    },
    time_created: {
      $date: "2024-05-24T12:09:58.256+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    createdBy: "Nikoletta",
    categories: ["cooking"],
    participants: [
      {
        user: "Maddie",
        companions: 0,
      },
      {
        user: "Sula",
        companions: 0,
      },
      {
        user: "Welch",
        companions: 0,
      },
      {
        user: "Meredeth",
        companions: 0,
      },
      {
        user: "Wolf",
        companions: 0,
      },
      {
        user: "Ivy",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 1,
      },
      {
        user: "Jaye",
        companions: 0,
      },
      {
        user: "Alard",
        companions: 0,
      },
    ],
  },
  {
    _id: "B2B5PXBdmAN7pvm2P",
    title: "Women Circle - Was bewegt uns als Frauen, Partnerinnen, Mütter und Berufstätige heute?",
    description:
      "<p>Diese vier Aspekte unseres Frauseins werden wir im frei improvisierten Tanz ausdrücken und erkunden. Im Anschluss besteht die Möglichkeit die Erfahrungen im Kreis zu teilen und aufgetauchte Themen zu reflektieren. Ein sich Kennenlernen im Spiegel der anderen wird möglich und ist bereichernd.<br /></p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bewegungsraum 1. Stock ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Fh4wNRv4xsE4FNMiL",
    time_lastedit: {
      $date: "2024-05-30T16:47:27.688+0000",
    },
    time_created: {
      $date: "2024-05-29T14:06:09.714+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    createdBy: "Elane",
    categories: ["sports", "culture", "misc"],
    participants: [
      {
        user: "Marsha",
        companions: 0,
      },
      {
        user: "Quincey",
        companions: 0,
      },
      {
        user: "Dotty",
        companions: 0,
      },
      {
        user: "Augusta",
        companions: 0,
      },
      {
        user: "Erasmus",
        companions: 0,
      },
      {
        user: "Bertrando",
        companions: 0,
      },
      {
        user: "Stevena",
        companions: 0,
      },
    ],
  },
  {
    _id: "T6JvNg86egf7BzGZE",
    title: "Zuhause - Stickworkshop mit der Künstlerin Maria Motyleva",
    description:
      "<p>Was bedeutet es für dich, an einem Ort zuhause zu sein?<br />Im Austausch mit Maria entwirfst du ein Zeichen, das für dein Gefühl von zuhause Sein steht. Du lernst verschiedene Sticktechniken und wendest sie an, indem du dein Zeichen auf eine Stoffinstallation stickst, die in Leimbach ausgestellt wird.<br /></p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Kleiner Kursraum (im UG des GZ)",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "BFuEBwQS8mrkQCyLG",
    time_lastedit: {
      $date: "2024-05-31T12:37:03.304+0000",
    },
    time_created: {
      $date: "2024-05-31T12:36:42.028+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    createdBy: "Russ",
    categories: ["culture"],
    participants: [
      {
        user: "Morissa",
        companions: 0,
      },
      {
        user: "Sig",
        companions: 0,
      },
      {
        user: "North",
        companions: 0,
      },
      {
        user: "Wini",
        companions: 0,
      },
      {
        user: "Cyril",
        companions: 1,
      },
    ],
  },
  {
    _id: "qvuqjgqTiak2AZHdt",
    title: "Die Welt (verstehen) mit Spiral Dynamics",
    description:
      "<p>Spiral Dynamics erklärt, warum Menschen unterschiedlich denken und handeln. Wir untersuchen Alltagssituationen und Arbeitskontexte und diskutieren, wie uns das Modell hilft, diese besser zu verstehen. Nutze diese Erkenntnisse für deine persönliche und berufliche Weiterentwicklung.</p>",
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "h4JYZYFSQMTPEnkTv",
    time_lastedit: {
      $date: "2024-08-28T07:10:56.705+0000",
    },
    time_created: {
      $date: "2024-06-05T07:07:20.267+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T13:00:00.000+0000",
    },
    createdBy: "Lenora",
    categories: ["misc", "culture"],
    participants: [
      {
        user: "Revkah",
        companions: 0,
      },
      {
        user: "Dian",
        companions: 0,
      },
      {
        user: "Carroll",
        companions: 0,
      },
      {
        user: "Robbin",
        companions: 0,
      },
      {
        user: "Gallard",
        companions: 0,
      },
      {
        user: "Alard",
        companions: 0,
      },
      {
        user: "Levon",
        companions: 0,
      },
      {
        user: "Gwenora",
        companions: 0,
      },
      {
        user: "Corbet",
        companions: 0,
      },
      {
        user: "Quintilla",
        companions: 0,
      },
      {
        user: "Catharina",
        companions: 0,
      },
      {
        user: "Leigh",
        companions: 0,
      },
      {
        user: "Jo-anne",
        companions: 0,
      },
      {
        user: "Adorne",
        companions: 0,
      },
      {
        user: "Sig",
        companions: 0,
      },
    ],
  },
  {
    _id: "hK4sh3wr3WgCPjqQb",
    title: "Botanical art. Draw what you see!",
    description:
      "<p>Do you get inspired by the beautiful flowers around? I teach you how to draw with pencils and color pencils flowers and leaves. It can be easier than you think! What I love the most? Painting with enthusiastic people. Are you one of them? I offer art workshops on Meetup Zurich Drawing and Painting.</p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "kleines Kurslokal, 4. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "xKFiGoihbtBMgsJkz",
    time_lastedit: {
      $date: "2024-05-02T10:47:49.097+0000",
    },
    time_created: {
      $date: "2024-05-02T10:47:49.097+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T13:30:00.000+0000",
    },
    createdBy: "Luciano",
    categories: [],
    participants: [
      {
        user: "Gray",
        companions: 0,
      },
      {
        user: "Drucill",
        companions: 0,
      },
      {
        user: "Nerissa",
        companions: 0,
      },
      {
        user: "Hephzibah",
        companions: 0,
      },
      {
        user: "Byram",
        companions: 0,
      },
      {
        user: "Kerry",
        companions: 0,
      },
      {
        user: "Nickey",
        companions: 0,
      },
    ],
  },
  {
    _id: "Rh4gCpWc6TR2EBd7d",
    title: "Naturbeobachtung",
    description:
      "<p>Die Natur rund ums GZ Bachwiesen ist vielfältig und schön. Schau genau hin und entdecke die Pflanzenvielfalt, beobachte Tiere, zeichne und bestimme verschiedene Arten.</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Treffpunkt vor Eingang zur Werkstatt",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "bA2cDwRHK4Sbmn8Aj",
    time_lastedit: {
      $date: "2024-05-28T08:06:08.682+0000",
    },
    time_created: {
      $date: "2024-05-28T08:06:08.682+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T12:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    createdBy: "Law",
    categories: ["sciences"],
    participants: [
      {
        user: "Marijn",
        companions: 0,
      },
      {
        user: "Kala",
        companions: 0,
      },
      {
        user: "Giustino",
        companions: 0,
      },
      {
        user: "Jean",
        companions: 0,
      },
      {
        user: "Even",
        companions: 0,
      },
      {
        user: "Barb",
        companions: 0,
      },
    ],
  },
  {
    _id: "5MtsJTyZwAmP56Ts7",
    title: "Pétanque",
    description:
      "<p>Auf der selbstgebauten Pétanque-Bahn auf der Piazza in Leimbach lernst du das faszierende Dorfplatzspiel kennen. Du lernst die Kugeln zu werfen, was ein Cochon ist und nach welchen Regeln du spielen kannst.<br /></p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Piazza vor dem Coop-Zenter",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "cppJLjNhCn3sMAkZX",
    time_lastedit: {
      $date: "2024-05-31T13:38:55.904+0000",
    },
    time_created: {
      $date: "2024-05-31T13:38:49.497+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    createdBy: "Allie",
    categories: ["sports"],
    participants: [
      {
        user: "Elfrida",
        companions: 0,
      },
      {
        user: "Dasha",
        companions: 0,
      },
      {
        user: "Mill",
        companions: 0,
      },
      {
        user: "Lona",
        companions: 0,
      },
      {
        user: "Tommy",
        companions: 0,
      },
      {
        user: "Geordie",
        companions: 0,
      },
    ],
  },
  {
    _id: "op7tKfgoSy78GxSYG",
    title: "Alphabetisierung - Wie geht das?",
    description:
      "<p>Lassen Sie sich mit dem spannenden Prozess der Alphabetisierung vertraut machen. Welche Hürden muss unser Gehirn dabei überwinden und wie kann man es darin unterstützen?</p><p>Der Kurs ist für alle offen.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Ew5zYCcNbSCpoZqAZ",
    time_lastedit: {
      $date: "2024-06-03T07:46:48.904+0000",
    },
    time_created: {
      $date: "2024-06-03T07:46:48.904+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T13:50:00.000+0000",
    },
    createdBy: "Lucila",
    categories: ["languages"],
    canceled: true,
  },
  {
    _id: "DGhcLNQcpQvFLdxmA",
    title: "Crashkurs TICHU",
    description:
      "<p>Vor vielen Jahren ist der Mah Jong von China kommend im Drachennest in Bern gelandet und hat dort TICHU ausgebrütet. Inzwischen hat sich das legendäre Kartenspiel mit Suchtpotential überall ausgebreitet. Höchste Zeit den Umgang mit Hund, Drachen und dem kniffligen Schupfen spielend zu erlernen.<br /></p>",
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Theater Ida, Aargauerstrasse 80, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "zGXXb5NitQ4hPYK7X",
    time_lastedit: {
      $date: "2024-06-06T12:44:22.190+0000",
    },
    time_created: {
      $date: "2024-05-25T11:26:29.193+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T13:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T14:45:00.000+0000",
    },
    createdBy: "Willetta",
    categories: ["misc"],
    participants: [
      {
        user: "Florenza",
        companions: 0,
      },
      {
        user: "Paula",
        companions: 0,
      },
      {
        user: "Gertruda",
        companions: 0,
      },
      {
        user: "Fancie",
        companions: 0,
      },
      {
        user: "Essy",
        companions: 0,
      },
    ],
  },
  {
    _id: "CPWkFi8SZ4kD8sSNj",
    title: "Wonderful Landscapes with Pastel Colors",
    description:
      "<p>In this art workshop we paint landscapes. Real, fantastic or from your dreams. Pastel allows you to mix colors on the paper and gives a smooth look. What I love the most? Painting with enthusiastic people. Are you one of them? I offer art workshops on Meetup Zurich Drawing and Painting. Thanks! </p>",
    venue: {
      name: "Papeterie Zumstein",
      _id: "AH3NMHAmmmri6tXoF",
    },
    room: "kleiner Kursraum, 4. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 7,
    region: "h4MnI3psRr8hSljk2",
    courseId: "xtfw3TbG9PSzP8efs",
    time_lastedit: {
      $date: "2024-05-02T10:53:24.840+0000",
    },
    time_created: {
      $date: "2024-05-02T10:52:08.194+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    createdBy: "Suzanna",
    categories: ["handicraft"],
    participants: [
      {
        user: "Ivan",
        companions: 0,
      },
      {
        user: "Coraline",
        companions: 0,
      },
      {
        user: "Marcile",
        companions: 1,
      },
      {
        user: "Honey",
        companions: 0,
      },
      {
        user: "Jimmy",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
    ],
  },
  {
    _id: "7hdXA95hGqtbvYjbK",
    title: "Strukturbilder",
    description:
      "<p>WIr mischen feine und grobe Strukturpasten selber an, die in Verbindung mit Acrylfarben interessante und schöne Kunstwerke ergeben. Lassen wir unserer Kreativität freien Lauf.  </p><p>Bitte Malkittel mitbringen <br /></p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "4NjkgddjQNRrdZgHs",
    time_lastedit: {
      $date: "2024-05-16T06:29:56.362+0000",
    },
    time_created: {
      $date: "2024-05-16T06:29:56.362+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:45:00.000+0000",
    },
    createdBy: "Binnie",
    categories: ["handicraft"],
    participants: [
      {
        user: "Isac",
        companions: 0,
      },
      {
        user: "Myranda",
        companions: 0,
      },
      {
        user: "Etti",
        companions: 0,
      },
      {
        user: "Cammi",
        companions: 0,
      },
      {
        user: "Bev",
        companions: 0,
      },
      {
        user: "Bonita",
        companions: 0,
      },
      {
        user: "Leanna",
        companions: 0,
      },
    ],
  },
  {
    _id: "mfw8RhqXRbk7Tb4nF",
    title: "Ruhe, Gelassenheit und Entspannung im Alltag mit Kinesiologie",
    description:
      "<p>Ich zeige dir, wie du die Kinesiologie ganz einfach für dich oder deine Kinder nutzen kannst um bei Stress, Unruhe oder Ängsten wieder zu mehr Ruhe und Gelassenheit zu finden.</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bühnensaal EG bei trockenem Wetter / sonst Jugendtreff 1. UG",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "tsMnLqFz69ia9TKAP",
    time_lastedit: {
      $date: "2024-09-12T13:59:05.888+0000",
    },
    time_created: {
      $date: "2024-05-23T15:54:42.206+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T14:45:00.000+0000",
    },
    createdBy: "Nathanael",
    categories: ["misc"],
    participants: [
      {
        user: "Nolly",
        companions: 0,
      },
      {
        user: "Loutitia",
        companions: 0,
      },
      {
        user: "Fulvia",
        companions: 0,
      },
      {
        user: "Windham",
        companions: 1,
      },
      {
        user: "Carney",
        companions: 0,
      },
      {
        user: "Egon",
        companions: 0,
      },
      {
        user: "Colman",
        companions: 0,
      },
      {
        user: "Wini",
        companions: 0,
      },
      {
        user: "Jasmin",
        companions: 0,
      },
      {
        user: "Ignacio",
        companions: 0,
      },
      {
        user: "Ethan",
        companions: 1,
      },
      {
        user: "Prentiss",
        companions: 0,
      },
      {
        user: "Pammy",
        companions: 1,
      },
      {
        user: "Maryann",
        companions: 0,
      },
      {
        user: "Dora",
        companions: 0,
      },
      {
        user: "Gus",
        companions: 0,
      },
      {
        user: "Berkie",
        companions: 0,
      },
    ],
  },
  {
    _id: "Z42ft7LF3Tb3GMJox",
    title: "Entspannte Kinder, entspannte Eltern?!- Was hilft Gross, was hilft Klein, was beiden?",
    description:
      '<p>Der Alltag verlangt viel ab von Kindern, Eltern, päd. Fachleuten. Der Wunsch nach " zur Ruhe kommen" ist gross, die Umsetzung nicht immer einfach. Ratgeber gibt es wie Sand am Meer. Welche einfachen Übungen und Spiele können helfen und Spass machen? Was können sie bewirken - und was eher weniger?</p>',
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "YqvAm7LoZEvT5Nwqg",
    time_lastedit: {
      $date: "2024-05-30T12:25:04.481+0000",
    },
    time_created: {
      $date: "2024-05-29T15:12:18.719+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    createdBy: "Benedetto",
    categories: ["sports", "misc"],
    participants: [
      {
        user: "Sheilakathryn",
        companions: 0,
      },
    ],
  },
  {
    _id: "2snmgXWcgp4j7WZXy",
    title: "WOHNMOBIL - Wie finde ich eine Wohnung in Zürich?",
    description:
      '<p>Wie kann ich eine Wohung suchen? Wo kann ich suchen? Wie kann ich mich bewerben? Was für Unterlagen brauche ich? Wo finde ich Hilfe?<br />Das WOHNMOBIL vermittelt Informationen zur Wohnungssuche. Anschliessend hast du Gelegenheit, an deinen Unterlagen zu arbeiten und dich für Wohnungen zu bewerben. <br /></p><p>Findet auch am Samstag statt: <a href="https://openki.zuerich-lernt.ch/event/kCar7KhLRQhuqnvsj/" rel="nofollow">https://openki.zuerich-lernt.ch/event/kCar7KhLRQhuqnvsj/</a></p>',
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Kursraum",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "RTad7myG9x9nBFY9r",
    time_lastedit: {
      $date: "2024-09-17T09:10:53.050+0000",
    },
    time_created: {
      $date: "2024-05-31T12:52:31.973+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    createdBy: "Tiphani",
    categories: ["misc"],
    participants: [
      {
        user: "Brigg",
        companions: 0,
      },
      {
        user: "Shena",
        companions: 0,
      },
      {
        user: "Colman",
        companions: 0,
      },
      {
        user: "Derrik",
        companions: 0,
      },
      {
        user: "Hamilton",
        companions: 0,
      },
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Ly",
        companions: 0,
      },
    ],
  },
  {
    _id: "WyzDhLtnPQk8CnaxQ",
    title: "Surprise: Alphabetisierung",
    description:
      "<p>Wie ist es, eine fremde Schrift zu erlernen? Wir zeigen Ihnen die ersten Schritte in einer Ihnen (hoffentlich) unbekannten Keilschrift. Lassen Sie sich überraschen!</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "aZBRbGgBNo9oBem4s",
    time_lastedit: {
      $date: "2024-06-03T07:49:40.226+0000",
    },
    time_created: {
      $date: "2024-06-03T07:49:40.226+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    createdBy: "Alard",
    categories: ["languages"],
    participants: [
      {
        user: "Bernetta",
        companions: 0,
      },
      {
        user: "Udell",
        companions: 0,
      },
      {
        user: "Kore",
        companions: 0,
      },
    ],
  },
  {
    _id: "vdp2ykSCkLa6j2BxJ",
    title: "Anwendung von Excel - Beginner bis Medium",
    description:
      "<p>In diesem Kurs sollen die Grundlagen für die effiziente Verwendung von Excel im Alltag oder in der Arbeitswelt vermittelt werden. Zusammen werden wir an Beispielen Punkte wie regelbasierte Formatierung, Drop-Downs, Tabellendurchsuchung etc. anschauen. Eigener Laptop mit Excellizenz mitbringen!</p>",
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 11,
    region: "h4MnI3psRr8hSljk2",
    courseId: "gadyfBbHEgz3HRRQq",
    time_lastedit: {
      $date: "2024-09-17T18:43:18.366+0000",
    },
    time_created: {
      $date: "2024-06-03T13:28:49.464+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    createdBy: "Tonya",
    categories: ["computer"],
    participants: [
      {
        user: "Kristi",
        companions: 1,
      },
      {
        user: "Hadleigh",
        companions: 0,
      },
      {
        user: "Constantia",
        companions: 0,
      },
      {
        user: "Suzanna",
        companions: 0,
      },
      {
        user: "Oswald",
        companions: 0,
      },
      {
        user: "Elora",
        companions: 0,
      },
      {
        user: "Christine",
        companions: 0,
      },
    ],
  },
  {
    _id: "iRTPj3sPkhZKB4M68",
    title: "Outdoor Fitness Training für Frauen ab 55",
    description:
      "<p>An der frisschen Luft trainieren wir Ausdauer, Kraft, Koordination sowie Beweglichkeit in einem achtsamen Rahmen. Das Ziel ist die Freude an der Bewegung sowie für den Alltag fit zu bleiben. Die Übungen werden teilweise am Boden gemacht. Grosses Trainingstuch &amp; Trinkflasche mitbringen &amp; Wettergerechte Kleidung anziehen.<br /></p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "im Garten",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "cYMXbTvWsg7Ts627i",
    time_lastedit: {
      $date: "2024-09-19T20:44:36.941+0000",
    },
    time_created: {
      $date: "2024-07-04T11:12:27.379+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    createdBy: "Elora",
    categories: ["sports"],
    participants: [
      {
        user: "Evey",
        companions: 0,
      },
      {
        user: "Ranee",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Maye",
        companions: 0,
      },
      {
        user: "Jedidiah",
        companions: 0,
      },
      {
        user: "Rex",
        companions: 0,
      },
    ],
  },
  {
    _id: "iHDyocEuaqukgQkPz",
    title: "My Story - Ihre Geschichte macht Sie einzigartig!",
    description:
      "<p>Menschliche Entwicklung und das tägliche Handeln werden in besonderer Weise durch die eigene Biografie und die unserer Vorfahren bestimmt. My Story lädt Sie ein auf Entdeckungsreise in vergangene Tage zu gehen und zeigt Ihnen verschiedene Möglichkeiten, sich mit Ihrer Biografie zu beschäftigen.</p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ssJuNhhjPZg4wYAoD",
    time_lastedit: {
      $date: "2024-04-09T15:27:13.321+0000",
    },
    time_created: {
      $date: "2024-04-09T15:27:13.321+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:45:00.000+0000",
    },
    createdBy: "Pen",
    categories: ["misc"],
    participants: [
      {
        user: "Ewan",
        companions: 0,
      },
      {
        user: "Rhona",
        companions: 0,
      },
      {
        user: "Sharla",
        companions: 0,
      },
      {
        user: "Dorris",
        companions: 0,
      },
      {
        user: "Anneliese",
        companions: 0,
      },
      {
        user: "Carolan",
        companions: 0,
      },
      {
        user: "Coleen",
        companions: 0,
      },
      {
        user: "Darda",
        companions: 1,
      },
      {
        user: "Budd",
        companions: 0,
      },
      {
        user: "Hadleigh",
        companions: 0,
      },
      {
        user: "Helen",
        companions: 0,
      },
    ],
  },
  {
    _id: "sKPd2RWPEk5cyx8LS",
    title: "Klima-Kneten",
    description:
      "<p>Suchst Du Verbündete für Biodiversität und gegen den Klimakollaps? Inspiriert von Tiefseetierchen kneten und formen wir Mönsterchen aus Ton, Knetmasse und Plastikabfall. Wir modellieren, sprechen und nutzen die Intelligenz unserer Hände.  Wenn vorhanden, gerne auch eigenes Material bringen.</p>",
    venue: {
      name: "LeLabor",
      _id: "uXHwNfdnZjun4C2yN",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "EtfhcrwmYYWbaqT96",
    time_lastedit: {
      $date: "2024-05-31T09:23:51.721+0000",
    },
    time_created: {
      $date: "2024-05-31T09:19:43.011+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    createdBy: "Russ",
    categories: ["handicraft", "misc"],
  },
  {
    _id: "duYMtgkKy33NKo7GT",
    title: "Filztatzen und Zwirnnase – ein Blick auf den Teddybär",
    description:
      "<p>Wir schauen auf den Werdegang des wahrscheinlich treuesten Begleiters aus der Kindheit. Wo kommt er her, was wurde alles mit ihm gemacht, wie hat er sich verändert? Mit Büchern und Bildern und Bären erkunden wir 120 Jahre Geschichte und lernen vielleicht neue Seiten unseres Pelzfreundes kennen.</p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Leselounge (2. OG)",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "D4JYwcsqpvFfRbQvm",
    time_lastedit: {
      $date: "2024-09-19T08:33:54.435+0000",
    },
    time_created: {
      $date: "2024-05-31T13:36:14.961+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T15:30:00.000+0000",
    },
    createdBy: "Jourdain",
    categories: ["handicraft", "culture"],
    participants: [
      {
        user: "Rudolph",
        companions: 0,
      },
      {
        user: "Ivan",
        companions: 0,
      },
      {
        user: "Marsha",
        companions: 1,
      },
    ],
  },
  {
    _id: "xyghf7JBGcawqW6Gp",
    title: "Neurodivergenz (ADHS und Autismus) bei erwachsenen Frauen",
    description:
      '<p>Wie kann sich ADHS oder Autismus in erwachsenen Frauen zeigen? Was ist ein Shutdown? Sind ADHS Betroffene einfach nur faul? Welche Rolle spielt unser Zyklus dabei? Diese und weitere Fragen gehen wir bei diesem Vortrag auf den Grund. </p><p>Die Lektion findet in der Praxisräumlichkeit von Paula Deme bei "Rund ums Leben" statt. Der Raum ist direkt beim Eingang neben der Bushaltestelle, gleich wenn man reinkommt<br /></p>',
    venue: {
      name: "Genussvoll - Lektion in der Praxisräumlichkeit von Paula Deme",
    },
    room: "Rund ums Leben",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "q6SPx29NPgKLH2Xts",
    time_lastedit: {
      $date: "2024-08-13T19:54:16.749+0000",
    },
    time_created: {
      $date: "2024-05-13T10:56:43.863+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    createdBy: "Rosabelle",
    categories: ["misc"],
    participants: [
      {
        user: "Germayne",
        companions: 0,
      },
      {
        user: "Wilt",
        companions: 0,
      },
      {
        user: "Aldridge",
        companions: 0,
      },
      {
        user: "Che",
        companions: 0,
      },
      {
        user: "Florenza",
        companions: 1,
      },
      {
        user: "Katti",
        companions: 0,
      },
      {
        user: "Dorice",
        companions: 0,
      },
      {
        user: "Ryan",
        companions: 0,
      },
      {
        user: "Darleen",
        companions: 0,
      },
    ],
  },
  {
    _id: "D4tCGn4GiKYmHPxov",
    title: "Back-Workshop für Jugendliche",
    description:
      "<p>Was gibt es Besseres, als der Duft von frisch gebackenen Leckereien? Eben! Wir backen gemeinsam feine Köstlichkeiten und naschen danach natürlich auch davon.</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Küchensaal EG",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 9,
    region: "h4MnI3psRr8hSljk2",
    courseId: "MDeqWEyrnsvocCkYF",
    time_lastedit: {
      $date: "2024-05-28T09:18:26.487+0000",
    },
    time_created: {
      $date: "2024-05-23T16:13:20.979+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:00:00.000+0000",
    },
    createdBy: "Markus",
    categories: ["cooking"],
    participants: [
      {
        user: "Tudor",
        companions: 1,
      },
      {
        user: "Wilfred",
        companions: 1,
      },
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Malissia",
        companions: 0,
      },
      {
        user: "Mohammed",
        companions: 0,
      },
      {
        user: "Valencia",
        companions: 0,
      },
      {
        user: "Jo ann",
        companions: 0,
      },
    ],
  },
  {
    _id: "GHm69ra5xwp4HG7em",
    title: "Einblick in die Sprache Dari/Farsi",
    description:
      "<p>Erhalten Sie einen Einblick in die Sprache Dari und Farsi. Lernen Sie grundlegende Begrüssungen, einfache Redewendungen und das persische Alphabet  kennen.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "4E3A6xRSq4pXWrui6",
    time_lastedit: {
      $date: "2024-08-20T14:38:48.864+0000",
    },
    time_created: {
      $date: "2024-05-30T07:35:25.141+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    createdBy: "Christine",
    categories: ["languages"],
    participants: [
      {
        user: "Coraline",
        companions: 0,
      },
      {
        user: "Gerhardine",
        companions: 0,
      },
      {
        user: "Burnard",
        companions: 0,
      },
      {
        user: "Darlene",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Des",
        companions: 0,
      },
      {
        user: "Karee",
        companions: 0,
      },
      {
        user: "Nester",
        companions: 0,
      },
      {
        user: "Rosy",
        companions: 0,
      },
      {
        user: "Tyler",
        companions: 0,
      },
      {
        user: "Dusty",
        companions: 0,
      },
    ],
  },
  {
    _id: "GkGt7w5BdDf9eJvnw",
    title: "Silly Dance Moves",
    description:
      '<p>Wir üben uns im albern Tanzen - desto komischer unsere "Dance Moves" umso besser. Bewegung und Freude garantiert!<br /></p>',
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Theater Ida, Aargauerstrasse 80, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 40,
    region: "h4MnI3psRr8hSljk2",
    courseId: "jmBL7rKKnfLPNfKXw",
    time_lastedit: {
      $date: "2024-06-06T12:43:36.308+0000",
    },
    time_created: {
      $date: "2024-05-23T15:15:52.052+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    createdBy: "Cathryn",
    categories: ["sports"],
    participants: [
      {
        user: "Marc",
        companions: 1,
      },
      {
        user: "Christos",
        companions: 1,
      },
      {
        user: "Izaak",
        companions: 1,
      },
      {
        user: "Tamqrah",
        companions: 1,
      },
      {
        user: "Ron",
        companions: 0,
      },
      {
        user: "Anton",
        companions: 0,
      },
      {
        user: "Johann",
        companions: 1,
      },
      {
        user: "Alexandros",
        companions: 0,
      },
      {
        user: "Gavin",
        companions: 0,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Lexie",
        companions: 0,
      },
      {
        user: "Olga",
        companions: 0,
      },
      {
        user: "Lily",
        companions: 1,
      },
      {
        user: "Carrie",
        companions: 1,
      },
      {
        user: "Kris",
        companions: 1,
      },
      {
        user: "Inglebert",
        companions: 1,
      },
      {
        user: "Gib",
        companions: 1,
      },
      {
        user: "Chuck",
        companions: 0,
      },
      {
        user: "Reinaldos",
        companions: 1,
      },
      {
        user: "Keelby",
        companions: 0,
      },
      {
        user: "Janis",
        companions: 1,
      },
      {
        user: "Gussi",
        companions: 0,
      },
    ],
  },
  {
    _id: "WxkHAsX5oDRgpQASY",
    title: "Ausgewogene Ernährung, aber nachhaltig!",
    description:
      "<p>Als Ernährungs-Coach helfe ich meinen Klient*innen, sich ausgewogen zu ernähren. Mein Anspruch ist, dass dies sozial und ökologisch möglichst nachhaltig geschieht. Anhand von konkreten Beispielen erörtere ich den Impact einzelner Lebensmittel und zeige Alternativen auf. Der Workshop ist interaktiv.<br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "pA96if383X258KNLR",
    time_lastedit: {
      $date: "2024-05-31T08:51:14.670+0000",
    },
    time_created: {
      $date: "2024-05-29T14:13:21.370+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    createdBy: "Ertha",
    categories: ["cooking"],
    participants: [
      {
        user: "Sapphire",
        companions: 1,
      },
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Drusy",
        companions: 0,
      },
      {
        user: "Bron",
        companions: 0,
      },
    ],
  },
  {
    _id: "53C7PNhdcbTWjJdpX",
    title: "Dorodango – Lehmkugel als Ruhepol",
    description:
      "<p>Dorodangos sind Lehmkugeln, die wir über längere Zeit bearbeiten, verdichten und polieren. Da kommen wir gut zur Ruhe und es entstehen vielfältige Oberflächen, die immer wieder neu entzücken. So bleibt es meist nicht bei einer…<br /></p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Keramikatlier 1UG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "PPyBeiRB7KfC3fEdD",
    time_lastedit: {
      $date: "2024-06-05T12:44:11.724+0000",
    },
    time_created: {
      $date: "2024-06-05T12:44:11.724+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:30:00.000+0000",
    },
    createdBy: "Riva",
    categories: ["culture", "misc"],
    participants: [
      {
        user: "Olvan",
        companions: 0,
      },
      {
        user: "Cathrin",
        companions: 1,
      },
      {
        user: "Hill",
        companions: 0,
      },
      {
        user: "Afton",
        companions: 0,
      },
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Mickie",
        companions: 0,
      },
      {
        user: "Ertha",
        companions: 0,
      },
      {
        user: "Karney",
        companions: 0,
      },
      {
        user: "Florrie",
        companions: 0,
      },
    ],
  },
  {
    _id: "DQfNnnAEzFrtrSATR",
    title: "A Cosmic Tour Through The Universe",
    description:
      "<p>The universe, source to light and darkness, is filled with mystery and beauty.</p><p>In this lecture we will travel through spacetime, from Big Bang until today.</p><p>In the process, we will witness the formation of galaxies, stars, planets, nebulae,</p><p>black holes, and supernovae. Join us on this cosmic tour!</p>",
    venue: {
      name: "GZ Höngg (Limmattalstr)",
      _id: "62ejbXBwpdNLjYGbY",
    },
    room: "Kulturkeller",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 50,
    region: "h4MnI3psRr8hSljk2",
    courseId: "f52CYW2m9P6zEfmnP",
    time_lastedit: {
      $date: "2024-08-18T15:23:19.295+0000",
    },
    time_created: {
      $date: "2024-05-13T12:35:00.544+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    createdBy: "Allie",
    categories: ["sciences"],
    participants: [
      {
        user: "Lindie",
        companions: 1,
      },
      {
        user: "Harald",
        companions: 1,
      },
      {
        user: "Alida",
        companions: 0,
      },
      {
        user: "Adela",
        companions: 1,
      },
      {
        user: "Cyril",
        companions: 0,
      },
      {
        user: "Chrissy",
        companions: 1,
      },
      {
        user: "Nickolaus",
        companions: 1,
      },
      {
        user: "Emelyne",
        companions: 0,
      },
      {
        user: "Betta",
        companions: 1,
      },
      {
        user: "Carolyn",
        companions: 1,
      },
      {
        user: "Freddie",
        companions: 0,
      },
      {
        user: "Ailey",
        companions: 1,
      },
      {
        user: "Elias",
        companions: 1,
      },
      {
        user: "Darlene",
        companions: 1,
      },
      {
        user: "Dasha",
        companions: 0,
      },
      {
        user: "Julianna",
        companions: 1,
      },
      {
        user: "Emelyne",
        companions: 1,
      },
      {
        user: "Dionysus",
        companions: 0,
      },
      {
        user: "Alma",
        companions: 1,
      },
      {
        user: "Bren",
        companions: 0,
      },
      {
        user: "Lexie",
        companions: 1,
      },
      {
        user: "Prue",
        companions: 1,
      },
      {
        user: "Norah",
        companions: 0,
      },
      {
        user: "Marsha",
        companions: 0,
      },
    ],
  },
  {
    _id: "GaRuqjzbNj3J3nzbL",
    title: "Black Music Special",
    description:
      "<p>Eine musikalische Zeitreise mit DJ Miles, vom Modernen Jazz bis Heute! Ein Hörleckerbissen vom Plattenteller - en Guete!<br /></p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bühnensaal EG",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "mSpnbZtMtQm9DGtTd",
    time_lastedit: {
      $date: "2024-05-23T15:50:20.913+0000",
    },
    time_created: {
      $date: "2024-05-23T15:47:31.768+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T17:45:00.000+0000",
    },
    createdBy: "Chrissie",
    categories: ["misc"],
    participants: [
      {
        user: "Ethyl",
        companions: 0,
      },
      {
        user: "Phelia",
        companions: 0,
      },
      {
        user: "Garnette",
        companions: 0,
      },
      {
        user: "Augustus",
        companions: 0,
      },
      {
        user: "Saunders",
        companions: 0,
      },
      {
        user: "Austin",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Lilllie",
        companions: 0,
      },
      {
        user: "Tybi",
        companions: 0,
      },
    ],
  },
  {
    _id: "dijjFeD4EyhE6TWRk",
    title: "Eskalation im beruflichen Umfeld",
    description:
      "<p>Eskalation im beruflichen Umfeld erkennen und einordnen. Beispiele werden nach Glasl durchleuchtet und mit praktischen Beispielen unterlegt. Das Ziel ist es, mit  Lösungsansätzen nach Hause zu gehen. Persönliche Beispiele dürfen eingebracht werden. So wird es spannend.</p><p><br /></p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ZQYJfdvNmjrmFpsAa",
    time_lastedit: {
      $date: "2024-05-28T19:09:21.984+0000",
    },
    time_created: {
      $date: "2024-05-27T06:15:50.053+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    createdBy: "Angelico",
    categories: ["languages", "misc"],
    participants: [
      {
        user: "Helen",
        companions: 0,
      },
      {
        user: "Gratiana",
        companions: 0,
      },
      {
        user: "Brigg",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "AZxLNxvPmCc5ts6bi",
    title: "Shibashi Qigong",
    description:
      "<p>Entdecken Sie die 18 Übungen des Shibashi Qigong. Diese Lektion ist für alle Altersgruppen geeignet und wird im Stehen durchgeführt. Die Übungen sind leicht zu lernen und werden in einfacher Sprache und mit verständlichen Bildern erklärt.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 18,
    region: "h4MnI3psRr8hSljk2",
    courseId: "YxmR7Tz2zAZ5Rp9Hk",
    time_lastedit: {
      $date: "2024-08-21T15:39:33.194+0000",
    },
    time_created: {
      $date: "2024-05-29T15:13:05.652+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    createdBy: "Jillayne",
    categories: ["sports"],
    participants: [
      {
        user: "Alfie",
        companions: 0,
      },
      {
        user: "Chadd",
        companions: 0,
      },
      {
        user: "Findlay",
        companions: 0,
      },
      {
        user: "Sukey",
        companions: 1,
      },
      {
        user: "Leonore",
        companions: 0,
      },
      {
        user: "Pip",
        companions: 0,
      },
      {
        user: "Jaye",
        companions: 1,
      },
      {
        user: "Garnette",
        companions: 0,
      },
      {
        user: "Reggi",
        companions: 0,
      },
    ],
  },
  {
    _id: "nATkxBgAFKTKvZ4Ra",
    title: "Langsam reisen durch China 1986: Abenteuer und Essen auf fremden Pfaden.",
    description:
      "<p>Harry Moser erzählt von seinen Erlebnissen: auf dem Jangtse  von Shanghai nach Chonqing und mit der transsibirischen Eisenbahn von Peking nach Moskau.  Mit kleiner Apéro. </p>",
    venue: {
      name: "PBZ Bibliothek Hardau",
      _id: "smRSEWukb2tGsFB4S",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "siX2dBNzsxgWJi299",
    time_lastedit: {
      $date: "2024-05-31T08:21:23.042+0000",
    },
    time_created: {
      $date: "2024-05-30T14:11:32.662+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:00:00.000+0000",
    },
    createdBy: "Bertram",
    categories: ["cooking", "culture"],
    participants: [
      {
        user: "Leah",
        companions: 0,
      },
      {
        user: "Isabel",
        companions: 1,
      },
      {
        user: "Doroteya",
        companions: 0,
      },
      {
        user: "Gun",
        companions: 0,
      },
      {
        user: "Kat",
        companions: 0,
      },
      {
        user: "Alane",
        companions: 1,
      },
      {
        user: "Rog",
        companions: 0,
      },
      {
        user: "Niel",
        companions: 0,
      },
      {
        user: "Nance",
        companions: 0,
      },
      {
        user: "Hasty",
        companions: 0,
      },
      {
        user: "Katharine",
        companions: 0,
      },
      {
        user: "Rochester",
        companions: 1,
      },
      {
        user: "Odell",
        companions: 1,
      },
    ],
  },
  {
    _id: "4GA9AHuiLujX5bfi3",
    title: "Le Menu international - Délikatessen aus Leimbach",
    description:
      "<p>Du lernst eritreische, somalische und kurdische Kochtraditionen kennen: Geschichten von Rezepten, Zutaten und Gewürzen führen dich an den Kochherd und zu einem mehrgängigen Abendessen, zu dem du Familie und Bekannte einladen kannst.<br /></p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Bistro",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 5,
    region: "h4MnI3psRr8hSljk2",
    courseId: "ehWd8dxGXYJYvLn29",
    time_lastedit: {
      $date: "2024-05-31T12:58:53.138+0000",
    },
    time_created: {
      $date: "2024-05-31T12:58:53.138+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T19:00:00.000+0000",
    },
    createdBy: "Terrye",
    categories: ["cooking"],
    participants: [
      {
        user: "Jaye",
        companions: 1,
      },
      {
        user: "Pen",
        companions: 0,
      },
      {
        user: "Wang",
        companions: 0,
      },
    ],
  },
  {
    _id: "6ppX8wF3RGhEP9uZn",
    title: "Intuitives Malen: Finde deine Kraftquelle",
    description:
      "<p>Was gibt dir Kraft? In dieser Session findest du durch das Malen intuitiv eine Antwort auf diese Frage.</p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Werkatelier 1. UG ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "So5gjCg26PPseyAcF",
    time_lastedit: {
      $date: "2024-06-05T13:07:23.009+0000",
    },
    time_created: {
      $date: "2024-06-05T13:07:23.009+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T17:30:00.000+0000",
    },
    createdBy: "Olav",
    categories: [],
    participants: [
      {
        user: "Anett",
        companions: 0,
      },
      {
        user: "Ivette",
        companions: 0,
      },
      {
        user: "Sibby",
        companions: 0,
      },
      {
        user: "Doria",
        companions: 0,
      },
      {
        user: "Brandon",
        companions: 0,
      },
      {
        user: "Sholom",
        companions: 0,
      },
      {
        user: "Karil",
        companions: 0,
      },
      {
        user: "Sunny",
        companions: 0,
      },
      {
        user: "Wake",
        companions: 0,
      },
    ],
  },
  {
    _id: "zo3D4sJ4js3Jobdck",
    title: "Kochlektion mit Äpfelgerichten",
    description:
      "<p>Gemeinsames Zubereiten und Kochen eines Dreigangmenüs, wobei bei jedem Gang Äpfel ein wichtiger Bestandteil sind</p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "Küche 1. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "sgw8vzqWCjq6T4S8y",
    time_lastedit: {
      $date: "2024-07-04T11:20:51.992+0000",
    },
    time_created: {
      $date: "2024-07-01T08:16:50.091+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T20:00:00.000+0000",
    },
    createdBy: "Cazzie",
    categories: ["cooking"],
    participants: [
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Dasha",
        companions: 0,
      },
      {
        user: "Edita",
        companions: 0,
      },
      {
        user: "Valencia",
        companions: 1,
      },
      {
        user: "Luella",
        companions: 0,
      },
      {
        user: "Anna-diane",
        companions: 0,
      },
      {
        user: "Brendis",
        companions: 0,
      },
    ],
  },
  {
    _id: "grJHsyWiDEAR7RLFB",
    title: "Lebensmittel retten",
    description:
      "<p>Rund ein Drittel der produzierten Lebensmittel werden weggeworfen. Möchtest du etwas dagegen unternehmen? Und dich dabei gut, abwechslungsreich und (fast) gratis ernähren? Wir zeigen, was du in Zürich gegen Food Waste tun kannst. Dazu gibt es ein leckeres Znacht-Buffet aus geretteten Lebensmitteln.</p>",
    venue: {
      name: "GZ Schindlergut - Lektion im Openki Mycelium",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "GNhys2sr4jdJ4Crax",
    time_lastedit: {
      $date: "2024-08-13T20:19:56.971+0000",
    },
    time_created: {
      $date: "2024-04-14T08:17:58.335+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:30:00.000+0000",
    },
    createdBy: "Aimee",
    categories: ["cooking"],
    noRsvp: false,
    participants: [
      {
        user: "Tremaine",
        companions: 0,
      },
      {
        user: "Rosy",
        companions: 0,
      },
      {
        user: "Rustin",
        companions: 1,
      },
      {
        user: "Perri",
        companions: 0,
      },
      {
        user: "Carolynn",
        companions: 1,
      },
      {
        user: "Prue",
        companions: 0,
      },
      {
        user: "Em",
        companions: 0,
      },
      {
        user: "Ranee",
        companions: 1,
      },
      {
        user: "Carolan",
        companions: 0,
      },
      {
        user: "Hamish",
        companions: 0,
      },
      {
        user: "Oswald",
        companions: 0,
      },
      {
        user: "Brannon",
        companions: 1,
      },
      {
        user: "Tiffani",
        companions: 0,
      },
      {
        user: "Truman",
        companions: 1,
      },
      {
        user: "Junina",
        companions: 0,
      },
    ],
  },
  {
    _id: "EPyvAFMvWpEWhQMCf",
    title: "Bewegt improvisieren lernen",
    description:
      "<p>Willst herausfinden wie freieres Bewegen geht? Und was das mit Dir zu tun hat? Wir schauen gemeinsam hinter den spannenden Zusammenhang Körper -Geist- Psyche und beginnen mit viel Spass ganz körperlich. </p>",
    venue: {
      name: "GZ Riesbach",
      _id: "NvnwEvwft6MzrnCnu",
    },
    room: "Bewegungsraum 1. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "s9s8L4qp8ibL7Aeur",
    time_lastedit: {
      $date: "2024-09-14T12:09:03.965+0000",
    },
    time_created: {
      $date: "2024-05-23T12:39:27.500+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:00:00.000+0000",
    },
    createdBy: "Rickey",
    categories: ["sports", "sciences"],
    participants: [
      {
        user: "Roze",
        companions: 1,
      },
      {
        user: "Willetta",
        companions: 0,
      },
      {
        user: "Elvina",
        companions: 0,
      },
      {
        user: "Isabel",
        companions: 0,
      },
    ],
  },
  {
    _id: "hrgxNDHiuAKaBproN",
    title: "Easy Yoga und Ayurveda für den Alltag",
    description:
      "<p>Erfahre, wie Du mit einfachen Tipps Yoga und Ayurveda in Deinen Alltag integrieren kannst und dabei zu Deinem Wohlbefinden und Deiner Balance beiträgst. Lerne mehr über die Lebensphilosophie des Ayurveda und wie sie heute zeitgemäss angewendet wird.</p><p>Es gibt Yoga- resp. Gymnastikmatten vor Ort, Du kannst natürlich auch gerne Deine eigene Matte mitbringen.</p>",
    venue: {
      name: "GZ Heuried",
      _id: "PAk5EEYNy9dG8ERPC",
    },
    room: "Saal ",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "KZcjKELPKp6QwKkGX",
    time_lastedit: {
      $date: "2024-09-20T10:10:09.530+0000",
    },
    time_created: {
      $date: "2024-05-31T13:46:18.888+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T17:30:00.000+0000",
    },
    createdBy: "Lindie",
    categories: ["sports", "cooking"],
    participants: [
      {
        user: "Hamilton",
        companions: 0,
      },
      {
        user: "Ware",
        companions: 0,
      },
      {
        user: "Tremaine",
        companions: 0,
      },
      {
        user: "Aleen",
        companions: 0,
      },
      {
        user: "Alane",
        companions: 0,
      },
      {
        user: "Mariya",
        companions: 0,
      },
      {
        user: "Aylmer",
        companions: 0,
      },
      {
        user: "Ignaz",
        companions: 0,
      },
      {
        user: "Mathew",
        companions: 0,
      },
    ],
    canceled: false,
  },
  {
    _id: "9tRAzPxBdhqGosNKN",
    title: "Von der Dampfmaschine zum elektrischen Licht",
    description:
      "<p>Wir sehen in Modellen und Originalgeräten verschiedene Dampfmaschinen, elektrische Generatoren/Motoren und lernen deren Funktionsweise kennen. Danach sehen wir eine Einführung in die Geschichte der elektrischen Beleuchtung. Zum Schluss gibt es noch einen kleinen Exkurs in historische Vakuumtechnik. </p>",
    venue: {
      name: "Sihlweidstrasse 10 ",
    },
    room: "ACHTUNG: keine Toilette vorhanden! Option: um 18.45 Uhr im GZ Leimbach (Leimbachstrasse 200) die Toilette noch benutzen",
    internal: false,
    sendReminder: true,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "PKR2C7auxB9WPmtSy",
    time_lastedit: {
      $date: "2024-04-17T10:15:43.025+0000",
    },
    time_created: {
      $date: "2024-04-17T10:14:29.342+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T19:00:00.000+0000",
    },
    createdBy: "Sileas",
    categories: ["sciences"],
    participants: [
      {
        user: "Kirbie",
        companions: 1,
      },
      {
        user: "Leila",
        companions: 1,
      },
    ],
  },
  {
    _id: "Htvt6eeTNfbNR3JYh",
    title: "Pasta-Workshop",
    description:
      "<p>Ich zeige dir, wie man ohne grossen Aufwand frische Pasta herstellen kann. Zusammen werden wir zwei Grundtechniken der Pasta-Herstellung näher anschauen. Das Endprodukt verköstigen wir natürlich zum Schluss.  Willkommen sind alle, die gerne kochen. </p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Cafeteria",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "MTXcaXyC2CCBQ78jq",
    time_lastedit: {
      $date: "2024-05-21T11:57:58.183+0000",
    },
    time_created: {
      $date: "2024-05-21T11:57:58.183+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T20:00:00.000+0000",
    },
    createdBy: "Goldy",
    categories: ["cooking"],
    participants: [
      {
        user: "Cammi",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Myrtice",
        companions: 0,
      },
      {
        user: "Ki",
        companions: 1,
      },
      {
        user: "Jasmin",
        companions: 0,
      },
      {
        user: "Wolf",
        companions: 0,
      },
      {
        user: "Haley",
        companions: 0,
      },
    ],
  },
  {
    _id: "LFz3SvWc3WgF7xewh",
    title: "Dein Menstruationszyklus ist auch eine Kraftquelle",
    description:
      "<p>Im Workshop gehen wir auf eine kleine Reise durch unsere verschiedenen Zyklus-Phasen und schauen, welche Kräfte, Talente und Ressourcen darin versteckt sind.</p><p>Wir malen ein Zyklus-Mandala, das Dich im Alltag an deine Kraftquelle erinnert.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Yhd4zJJhTQJbtfPgX",
    time_lastedit: {
      $date: "2024-08-20T14:39:22.589+0000",
    },
    time_created: {
      $date: "2024-05-30T08:41:15.680+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:00:00.000+0000",
    },
    createdBy: "Vanya",
    categories: ["misc"],
    participants: [
      {
        user: "Cherianne",
        companions: 0,
      },
      {
        user: "Ezekiel",
        companions: 0,
      },
      {
        user: "Laurel",
        companions: 1,
      },
      {
        user: "Perri",
        companions: 0,
      },
      {
        user: "Denna",
        companions: 0,
      },
      {
        user: "Nicolai",
        companions: 0,
      },
      {
        user: "Violetta",
        companions: 0,
      },
      {
        user: "Tomasine",
        companions: 1,
      },
      {
        user: "Obadiah",
        companions: 0,
      },
      {
        user: "Gregoor",
        companions: 0,
      },
      {
        user: "Augustus",
        companions: 0,
      },
    ],
  },
  {
    _id: "Pp3tewTWRJJJirQte",
    title: "Innenarchitektur und Neurowissenschaften",
    description:
      "<p>Anwendung der Neurowissenschaften auf Architektur und Design: Das Verständnis dafür, wie die Umwelt unsere Emotionen, Gedanken und unser Verhalten verändert.<br /></p><p><br /></p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "a2cKAu3Y7BnxYsEms",
    time_lastedit: {
      $date: "2024-05-31T14:26:05.084+0000",
    },
    time_created: {
      $date: "2024-05-31T11:32:21.342+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:30:00.000+0000",
    },
    createdBy: "Angelico",
    categories: ["misc", "sciences", "culture"],
    participants: [
      {
        user: "Gretel",
        companions: 0,
      },
      {
        user: "Dahlia",
        companions: 0,
      },
      {
        user: "Bria",
        companions: 0,
      },
      {
        user: "Iain",
        companions: 0,
      },
      {
        user: "Des",
        companions: 0,
      },
      {
        user: "Sukey",
        companions: 0,
      },
      {
        user: "Fax",
        companions: 0,
      },
      {
        user: "Dusty",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 0,
      },
      {
        user: "Evvie",
        companions: 1,
      },
      {
        user: "Rowe",
        companions: 0,
      },
      {
        user: "Chuck",
        companions: 0,
      },
      {
        user: "Gaylene",
        companions: 0,
      },
      {
        user: "Meredeth",
        companions: 0,
      },
      {
        user: "Holli",
        companions: 0,
      },
      {
        user: "Rubina",
        companions: 0,
      },
      {
        user: "Godard",
        companions: 0,
      },
      {
        user: "Dagny",
        companions: 0,
      },
      {
        user: "Jerry",
        companions: 0,
      },
      {
        user: "Curt",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "qh85j2DDxbmNKkQPx",
    title: "Gesundheit und Klima schützen mit leckerem Essen",
    description:
      "<p>Du möchtest dich vermehrt gesund und pflanzlich ernähren, hast aber Bedenken oder Unsicherheiten? In diesem Workshop erläutern wir dir wichtige Fakten zum Thema und stehen für Fragen zur Verfügung. Zudem hast du die Möglichkeit, deine Essgewohnheiten zu analysieren. Häppchen und Rezepte inklusive!  </p>",
    venue: {
      name: "GZ Höngg (Limmattalstr)",
      _id: "62ejbXBwpdNLjYGbY",
    },
    room: "Galerie",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "SC87qf9dQtxXhaYye",
    time_lastedit: {
      $date: "2024-07-09T06:24:13.518+0000",
    },
    time_created: {
      $date: "2024-05-31T14:05:03.791+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:30:00.000+0000",
    },
    createdBy: "Madalyn",
    categories: ["misc"],
    participants: [
      {
        user: "Brodie",
        companions: 0,
      },
      {
        user: "Tammara",
        companions: 1,
      },
      {
        user: "Ermentrude",
        companions: 1,
      },
      {
        user: "Jelene",
        companions: 0,
      },
    ],
  },
  {
    _id: "ywiJ3hujdrZYXYHgn",
    title: "Solarenergie für Private und Firmen",
    description:
      "<p>Erfahren Sie, was Solarenergie ist und wie Sie sie nutzen können. Ist sie teuer? Was unterscheidet passive Nutzung, Solarthermie und Photovoltaik? Wie funktioniert die Speicherung? Walter Sachs von der Schweizerischen Vereinigung für Sonnenenergie SSES liefert Antworten auf diese und Ihre Fragen.</p>",
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "gLG5TtxFJR8ysi3AZ",
    time_lastedit: {
      $date: "2024-06-03T09:06:49.256+0000",
    },
    time_created: {
      $date: "2024-06-03T09:06:05.663+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:30:00.000+0000",
    },
    createdBy: "Cletus",
    categories: ["misc", "sciences"],
    participants: [
      {
        user: "Daryn",
        companions: 1,
      },
      {
        user: "Darda",
        companions: 0,
      },
      {
        user: "Lin",
        companions: 0,
      },
      {
        user: "Susanne",
        companions: 1,
      },
      {
        user: "Wynnie",
        companions: 1,
      },
    ],
  },
  {
    _id: "GSssJxq6j9FrSBdLE",
    title: "Lachyoga",
    description:
      "<p>Auch die Lachmuskeln können trainiert werden! Es werden aktivierende und entspannende Lachyoga-Übungen vorgestellt und praktiziert.</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 11,
    region: "h4MnI3psRr8hSljk2",
    courseId: "YYDoTsWD3jw5YQgdk",
    time_lastedit: {
      $date: "2024-09-20T11:02:13.980+0000",
    },
    time_created: {
      $date: "2024-05-26T09:19:39.051+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-20T18:30:00.000+0000",
    },
    createdBy: "Francesco",
    categories: ["misc"],
    participants: [
      {
        user: "Quintilla",
        companions: 0,
      },
      {
        user: "Alma",
        companions: 0,
      },
      {
        user: "Dasha",
        companions: 1,
      },
      {
        user: "Milty",
        companions: 0,
      },
      {
        user: "Grady",
        companions: 1,
      },
      {
        user: "Tori",
        companions: 0,
      },
      {
        user: "Gratiana",
        companions: 0,
      },
      {
        user: "Arthur",
        companions: 0,
      },
      {
        user: "Dian",
        companions: 0,
      },
    ],
  },
  {
    _id: "cqyJTq7B3XZASkFWj",
    title: "Nervensystem Hacks : Schlaf und Energie",
    description:
      "<p>Tricks zum leichter Ein- &amp; Durchschlafen. Und wie komm ich bei einem Durchhänger wieder in Schwung? </p><p>Erfahre, wie dein Nervensystem und die Atmung zusammenhängen und probiere dazu einfache Körper- und Atmungsübungen aus.</p><p>Kurs ist ausgebucht? Warteliste: info@anninasalis.ch </p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 14,
    region: "h4MnI3psRr8hSljk2",
    courseId: "auaoSLwXnrJp5oqJq",
    time_lastedit: {
      $date: "2024-08-30T22:47:44.155+0000",
    },
    time_created: {
      $date: "2024-05-30T08:35:24.460+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-20T18:00:00.000+0000",
    },
    end: {
      $date: "2024-09-20T19:00:00.000+0000",
    },
    createdBy: "Moreen",
    categories: ["sports", "sciences", "misc"],
    participants: [
      {
        user: "Eberhard",
        companions: 0,
      },
      {
        user: "Laural",
        companions: 0,
      },
      {
        user: "Grady",
        companions: 1,
      },
      {
        user: "Terrye",
        companions: 0,
      },
      {
        user: "Bary",
        companions: 0,
      },
      {
        user: "Ruth",
        companions: 0,
      },
      {
        user: "Danya",
        companions: 0,
      },
      {
        user: "Shantee",
        companions: 0,
      },
      {
        user: "Binnie",
        companions: 0,
      },
      {
        user: "Leela",
        companions: 0,
      },
      {
        user: "Marijn",
        companions: 0,
      },
    ],
  },
  {
    _id: "3XZdbzDg5J5KpxMR4",
    title: "Wohltuende Malsession",
    description:
      "<p>Als Kunsttherapeutin biete ich eine schöne Flow Malsession an, wo sich auch Themen auflösen können.</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Atelier",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "rhGaYLFA2923Sit2o",
    time_lastedit: {
      $date: "2024-05-23T09:40:29.305+0000",
    },
    time_created: {
      $date: "2024-05-22T15:15:05.706+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T09:00:00.000+0000",
    },
    createdBy: "Veronica",
    categories: ["culture"],
    participants: [
      {
        user: "Cletus",
        companions: 0,
      },
      {
        user: "Dionisio",
        companions: 0,
      },
      {
        user: "Jelene",
        companions: 0,
      },
      {
        user: "Aurore",
        companions: 0,
      },
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Joshuah",
        companions: 0,
      },
      {
        user: "Siward",
        companions: 0,
      },
      {
        user: "Demetri",
        companions: 1,
      },
      {
        user: "Warden",
        companions: 0,
      },
    ],
  },
  {
    _id: "YgXMjQ3QuAr2uAQtx",
    title: "Dance-Yoga",
    description:
      "<p>Dayo verbindet Tanz, Musik &amp; Yoga. Klassische Yogaelemente werden fliessend auf ein finales Lied choreografiert. Du erlernst den Ablauf Schritt für Schritt. Probiere es aus &amp; verbessere deine Kraft, Beweglichkeit, Balance &amp; Koordination. Nur bei trockener Witterung. Bring deine Yogamatte mit.</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "jdtxLiTBqQKeJBx34",
    time_lastedit: {
      $date: "2024-05-24T16:28:39.367+0000",
    },
    time_created: {
      $date: "2024-05-24T16:28:20.701+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T07:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T07:50:00.000+0000",
    },
    createdBy: "Jae",
    categories: ["sports"],
    participants: [
      {
        user: "Sergio",
        companions: 1,
      },
      {
        user: "Yelena",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Eldon",
        companions: 0,
      },
    ],
  },
  {
    _id: "yifDvGcHGjw5KxZb5",
    title: "Vinyasa Yoga mit Fokus auf Umkehrhaltungen",
    description:
      "<p>Wollest du mal Kopfüber stehen, aber weisst nicht genau wie? In dieser Yogastunde werden wir ein paar Übungen machen zur Vorbereitung von Kopfstand und Unterarmstand. Auch für Anfänger geeignet :)<br /><br />Beim Vinyasa Yoga werden die Bewegungen dem Atem angepasst und fliessen von einer Asana (Yoga-Position) in die Nächste. <br /><br />Falls du hast nimm gerne deine Yogamatte mit. Ein paar Yogamatten kann ich auch mitbringen.</p>",
    venue: {
      name: "GZ Heuried",
      _id: "PAk5EEYNy9dG8ERPC",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "6dfu7rnnjk6PEcFwL",
    time_lastedit: {
      $date: "2024-09-17T12:21:07.860+0000",
    },
    time_created: {
      $date: "2024-05-14T13:20:34.266+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T07:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T08:30:00.000+0000",
    },
    createdBy: "Matilde",
    categories: ["sports"],
    participants: [
      {
        user: "Joell",
        companions: 0,
      },
      {
        user: "Oswald",
        companions: 0,
      },
      {
        user: "Giraldo",
        companions: 1,
      },
      {
        user: "Royall",
        companions: 0,
      },
      {
        user: "Hildy",
        companions: 0,
      },
      {
        user: "Willetta",
        companions: 1,
      },
      {
        user: "Loutitia",
        companions: 1,
      },
      {
        user: "Luciano",
        companions: 0,
      },
      {
        user: "Bertram",
        companions: 0,
      },
    ],
  },
  {
    _id: "259HXwJCft3HcocJD",
    title: "Bau dir einen Roboter, der gehen kann",
    description:
      "<p>Unter Anleitung baust du dir einen Roboter, der gehen kann. Du machst das mit Karton, Motoren und dem micro:bit, ein einfach zu programmierender Microcontroller.</p><p>Du brauchst einen Computer oder ein Tablet (Android oder iOS). Für 40.- CH kannst du den micro:bit mit nach Hause nehmen.</p>",
    venue: {
      name: "GZ Leimbach, Standort Manegg",
      _id: "Z7ELgnJKSi4mzYFok",
    },
    room: "GZ Manegg",
    internal: false,
    sendReminder: true,
    maxParticipants: 9,
    region: "h4MnI3psRr8hSljk2",
    courseId: "rXZfF6xbKQMrThhAu",
    time_lastedit: {
      $date: "2024-04-20T14:01:39.419+0000",
    },
    time_created: {
      $date: "2024-03-17T09:45:02.638+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:00:00.000+0000",
    },
    createdBy: "Teresina",
    categories: ["computer"],
    participants: [
      {
        user: "Pammy",
        companions: 1,
      },
      {
        user: "Aigneis",
        companions: 1,
      },
      {
        user: "Mollee",
        companions: 0,
      },
      {
        user: "Angelico",
        companions: 0,
      },
      {
        user: "Findlay",
        companions: 1,
      },
      {
        user: "Celie",
        companions: 0,
      },
    ],
  },
  {
    _id: "CbLmWa7sampYreyvg",
    title: "WeltverbesserInnen Workshop",
    description:
      "<p>Willst du die Welt rocken und die Zukunft fairer gestalten? Entdecke in unserem Workshop die Gemeinwohl-Ökonomie – ein gerechteres Wirtschaftsmodell, das du spielend erlebst!<br /></p>",
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Fotostudio Habibi, Aargauerstrasse 52, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Y5ha82o5dxcP5wWYt",
    time_lastedit: {
      $date: "2024-09-06T09:15:57.208+0000",
    },
    time_created: {
      $date: "2024-04-26T11:57:59.954+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T09:30:00.000+0000",
    },
    createdBy: "Durward",
    categories: ["misc"],
    participants: [
      {
        user: "Arabele",
        companions: 0,
      },
      {
        user: "Sidonnie",
        companions: 0,
      },
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Heath",
        companions: 0,
      },
      {
        user: "Caroline",
        companions: 0,
      },
    ],
  },
  {
    _id: "jeh3sqMrn2oSGMaL3",
    title: "Stressreduktion dank Achtsamkeit",
    description:
      "<p>Durch gezielte Achtsamkeitsübungen  Stress reduzieren, langfristig Resilienz aufbauen und mehr innere Balance finden. <br /></p><p>- Mentale Stärke, Fokus, Stressresilienz <br />- Wertvolle Tools kennenlernen </p><p></p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "",
    internal: false,
    sendReminder: false,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "B9jYWeFYxAMjjnKdS",
    time_lastedit: {
      $date: "2024-09-02T07:09:28.245+0000",
    },
    time_created: {
      $date: "2024-05-02T07:47:16.730+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Sumner",
    categories: ["sports", "misc"],
    participants: [
      {
        user: "Mathew",
        companions: 0,
      },
      {
        user: "Rustin",
        companions: 0,
      },
      {
        user: "Elli",
        companions: 0,
      },
      {
        user: "Hynda",
        companions: 0,
      },
      {
        user: "Kirbie",
        companions: 0,
      },
      {
        user: "Sidonnie",
        companions: 0,
      },
      {
        user: "Betteanne",
        companions: 0,
      },
      {
        user: "Selma",
        companions: 0,
      },
      {
        user: "Mariya",
        companions: 1,
      },
      {
        user: "Benedetto",
        companions: 0,
      },
      {
        user: "Bert",
        companions: 0,
      },
    ],
  },
  {
    _id: "T3iiHSDoRvD2AMc4v",
    title: "Schülergarten Apfelbaum besuchen und Rosmarin-Kräutersalz herstellen",
    description:
      "<p>Schülergartenkinder zeigen dir den Garten, erklären, was sie im Schülergarten so machen, und wir stellen ein Rosmarin-Kräutersalz her. Nimm (falls vorhanden) ein Mörser &amp; ein Behälter zum Abfüllen mit. Der Kurs findet nur bei trockener Witterung statt. Treffpunkt ist beim Quartiertreff Waldgarten.</p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "bxrjD7EPozc6Pcp62",
    time_lastedit: {
      $date: "2024-06-24T20:40:01.115+0000",
    },
    time_created: {
      $date: "2024-05-24T16:19:14.126+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T09:30:00.000+0000",
    },
    createdBy: "Jaye",
    categories: ["misc"],
    participants: [
      {
        user: "Wallace",
        companions: 0,
      },
      {
        user: "Leesa",
        companions: 0,
      },
      {
        user: "Marga",
        companions: 0,
      },
    ],
    canceled: true,
  },
  {
    _id: "FKugQE5wfhPfjHEQo",
    title: "Generationen Workshop für Bewegungs-, Tanz- und Theaterinteressierte",
    description:
      '<p>Der Workshop richtet sich an alle Bewegungs-, Tanz- und Theaterinteressierten ab 9 bis 80 Jahren. </p><p>"Eine einzigartige Erfahrung, sehr positiv sowohl von der persönlichen als auch von der menschlichen Seite der Gruppe, voller Kreativität, Poesie und Sympathie." (M Scaroni, Teilnehmerin)</p>',
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "5jPGkvoczsda7DaSj",
    time_lastedit: {
      $date: "2024-08-26T13:10:15.019+0000",
    },
    time_created: {
      $date: "2024-05-29T09:24:23.466+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T09:30:00.000+0000",
    },
    createdBy: "Oswald",
    categories: [],
    participants: [
      {
        user: "Flore",
        companions: 0,
      },
      {
        user: "Valma",
        companions: 0,
      },
    ],
  },
  {
    _id: "nchRMSLTbq9PLCi6t",
    title: "Der beste Weg, deine Zukunft vorherzusagen, ist, sie zu gestalten.",
    description:
      "<p>Viele Ideen, kaum Umsetzung? Sie brauchen OGSM, ein bewährtes Geschäftsstrategie-Tool, von uns adaptiert für Einzelpersonen und Kleinfirmen. Die Stärke liegt in der Kombination von Vision, Strategie und Aktionen, auf nur einem DIN A4. Ziele setzen und erfolgreich umsetzen, ohne sich neu zu erfinden.</p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "3BLxzcaGzwfHSih6t",
    time_lastedit: {
      $date: "2024-06-03T08:49:53.863+0000",
    },
    time_created: {
      $date: "2024-05-31T11:03:42.523+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Tam",
    categories: ["misc"],
    participants: [
      {
        user: "Jules",
        companions: 0,
      },
      {
        user: "Brod",
        companions: 0,
      },
      {
        user: "Pen",
        companions: 0,
      },
      {
        user: "Aldridge",
        companions: 0,
      },
      {
        user: "Yank",
        companions: 0,
      },
      {
        user: "Annnora",
        companions: 0,
      },
      {
        user: "Denna",
        companions: 0,
      },
      {
        user: "Lory",
        companions: 0,
      },
      {
        user: "Chariot",
        companions: 0,
      },
      {
        user: "Teresita",
        companions: 0,
      },
      {
        user: "Kenyon",
        companions: 1,
      },
    ],
  },
  {
    _id: "rydqchqiDthERit7h",
    title: "Zuhause - Stickworkshop mit der Künstlerin Maria Motyleva",
    description:
      "<p>Was bedeutet es für dich, an einem Ort zuhause zu sein?<br />Im Austausch mit Maria entwirfst du ein Zeichen, das für dein Gefühl von zuhause Sein steht. Du lernst verschiedene Sticktechniken und wendest sie an, indem du dein Zeichen auf eine Stoffinstallation stickst, die in Leimbach ausgestellt wird.<br /></p>",
    room: "Kleiner Kursraum (im UG des GZ)",
    region: "h4MnI3psRr8hSljk2",
    groups: [],
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    courseId: "BFuEBwQS8mrkQCyLG",
    time_lastedit: {
      $date: "2024-05-31T12:45:38.568+0000",
    },
    time_created: {
      $date: "2024-05-31T12:44:23.184+0000",
    },
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Jerad",
    categories: ["culture"],
    participants: [
      {
        user: "Siward",
        companions: 0,
      },
      {
        user: "Nannette",
        companions: 0,
      },
    ],
  },
  {
    _id: "kCar7KhLRQhuqnvsj",
    title: "WOHNMOBIL - Wie finde ich eine Wohnung in Zürich?",
    description:
      "<p>Wie kann ich eine Wohung suchen? Wo kann ich suchen? Wie kann ich mich bewerben? Was für Unterlagen brauche ich? Wo finde ich Hilfe?<br />Das WOHNMOBIL vermittelt Informationen zur Wohnungssuche. Anschliessend hast du Gelegenheit, an deinen Unterlagen zu arbeiten und dich für Wohnungen zu bewerben. <br /></p>",
    room: "Kursraum",
    region: "h4MnI3psRr8hSljk2",
    groups: [],
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    courseId: "RTad7myG9x9nBFY9r",
    time_lastedit: {
      $date: "2024-05-31T12:54:05.687+0000",
    },
    time_created: {
      $date: "2024-05-31T12:53:03.748+0000",
    },
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Rosabelle",
    categories: ["misc"],
    participants: [
      {
        user: "Letitia",
        companions: 0,
      },
      {
        user: "Dana",
        companions: 0,
      },
    ],
  },
  {
    _id: "ack5883xsWprwDDgQ",
    title: "Kleine Teeschule - eine Entdeckungsreise durch alle Farben des Tees",
    description:
      "<p>Nach einer kurzen Einführung in die Grundlagen von Teeanbau, Ernte und Verarbeitung, degustieren wir Weisstee, Grüntee, Gelbtee, Oolong, Schwarztee und Pu-Erh. Im Zentrum stehen dabei Freude, Neugier und Austausch rund um die Teepflanze Camellia sinensis.</p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "1. Stock und Küche",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dje3auKH2Ct8yxYLy",
    time_lastedit: {
      $date: "2024-07-08T09:57:35.698+0000",
    },
    time_created: {
      $date: "2024-07-08T09:30:26.081+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Jillayne",
    categories: ["cooking", "culture"],
    participants: [
      {
        user: "Constantine",
        companions: 0,
      },
      {
        user: "Lilllie",
        companions: 0,
      },
      {
        user: "Aleen",
        companions: 0,
      },
      {
        user: "Yancy",
        companions: 0,
      },
      {
        user: "Tyler",
        companions: 0,
      },
      {
        user: "Florenza",
        companions: 0,
      },
      {
        user: "Elvis",
        companions: 0,
      },
      {
        user: "Clarisse",
        companions: 0,
      },
      {
        user: "Antony",
        companions: 0,
      },
      {
        user: "Bili",
        companions: 0,
      },
      {
        user: "Alano",
        companions: 0,
      },
      {
        user: "Jenifer",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Wini",
        companions: 0,
      },
      {
        user: "Rowe",
        companions: 0,
      },
      {
        user: "Feliks",
        companions: 0,
      },
    ],
  },
  {
    _id: "eerj6s87PJ5D5qDzt",
    title: "DESIGN YOUR LIFE",
    description:
      "<p>Der Weg zu mehr Freude und Leichtigkeit in Deinem Leben und Deiner Arbeit. Wenn du keine Lust mehr hast, wie eine Spielfigur hin- und hergeschoben zu werden, wenn Du es leid bist Spielball oder Marionette zu sein. Training  in Deinem Leben etwas zu verändern. </p>",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "wbMAPp7NFjjxunzRi",
    time_lastedit: {
      $date: "2024-05-29T09:43:10.360+0000",
    },
    time_created: {
      $date: "2024-04-09T15:28:27.746+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:15:00.000+0000",
    },
    end: {
      $date: "2024-09-21T11:00:00.000+0000",
    },
    createdBy: "Ariadne",
    categories: ["misc"],
    participants: [
      {
        user: "Lorinda",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Celie",
        companions: 0,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Sileas",
        companions: 0,
      },
      {
        user: "Giraldo",
        companions: 1,
      },
      {
        user: "Ronnie",
        companions: 0,
      },
      {
        user: "Angelita",
        companions: 0,
      },
      {
        user: "Pip",
        companions: 0,
      },
      {
        user: "Bron",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "kPj2E6TprKhQzErQF",
    title: "Kreatives Schreiben zur Selbstreflexion",
    description:
      "<p>Schreibend kannst du dich besser kennenlernen, Klarheit erhalten und stimmige Entscheidungen treffen. Vor allem aber macht kreatives Schreiben Freude: du kommst in den Schreibfluss, es geht nicht um Richtig oder Falsch. In der Schreibgruppe fällt es noch leichter. Auch für Anfänger, probier es aus!</p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Lesecafé (1.OG)",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "d9psYJ7r3QKWQ2LMC",
    time_lastedit: {
      $date: "2024-06-27T14:12:55.660+0000",
    },
    time_created: {
      $date: "2024-03-25T13:45:17.156+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Dov",
    categories: ["misc"],
    noRsvp: false,
    participants: [
      {
        user: "Melany",
        companions: 0,
      },
      {
        user: "Gregg",
        companions: 0,
      },
      {
        user: "Nathanael",
        companions: 0,
      },
      {
        user: "Rea",
        companions: 0,
      },
      {
        user: "Valencia",
        companions: 0,
      },
      {
        user: "May",
        companions: 0,
      },
      {
        user: "Reine",
        companions: 0,
      },
      {
        user: "Nathanael",
        companions: 0,
      },
      {
        user: "Jourdain",
        companions: 0,
      },
      {
        user: "Dorris",
        companions: 1,
      },
    ],
  },
  {
    _id: "3STvgjCmwrukYuaBL",
    title: "Yoga für Anfänger",
    description:
      "<p>Wir machen einfache Yogaübungen und bewegen uns im Atemfluss. Für alle Fitnesslevels, auch ohne Yogaerfahrung. Auf Deutsch oder Englisch je nach Teilnehmer.</p><p>We practice easy yoga postures and move with the breath. For all fitness levels. In German or English, depending on participants.</p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "Pflegiraum, Klosbachstrasse 118, 8032 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "P53jh9enTEJi6Puxm",
    time_lastedit: {
      $date: "2024-05-07T16:03:59.368+0000",
    },
    time_created: {
      $date: "2024-05-07T16:03:59.368+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Arnoldo",
    categories: ["sports"],
    participants: [
      {
        user: "Evangelina",
        companions: 0,
      },
      {
        user: "Trudie",
        companions: 1,
      },
      {
        user: "Tammy",
        companions: 0,
      },
      {
        user: "Thorvald",
        companions: 0,
      },
      {
        user: "Gratiana",
        companions: 0,
      },
      {
        user: "Sileas",
        companions: 1,
      },
      {
        user: "Aimee",
        companions: 0,
      },
      {
        user: "Othella",
        companions: 0,
      },
      {
        user: "Eliot",
        companions: 0,
      },
      {
        user: "Luciano",
        companions: 0,
      },
    ],
  },
  {
    _id: "tQGXxWXvkyecSdgxf",
    title: "Die Kraft der Träume",
    description:
      "<p>In diesem Workshop biete ich Raum und Zeit, den Umgang mit Träumen zu erfahren. Träume sind Botschaften aus unserem Unterbewusstsein, welche uns zu unserem natürlichen Sein und inneren Frieden führen möchten.  Auf Wunsch können eigene Träume erzählt werden. </p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "93n7gexHSGZor3ziT",
    time_lastedit: {
      $date: "2024-05-16T06:19:58.697+0000",
    },
    time_created: {
      $date: "2024-05-16T06:19:58.697+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T08:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Carolynn",
    categories: ["sciences"],
    participants: [
      {
        user: "Malissia",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 1,
      },
      {
        user: "Ivy",
        companions: 0,
      },
      {
        user: "Giustino",
        companions: 1,
      },
      {
        user: "Mill",
        companions: 0,
      },
      {
        user: "Emelyne",
        companions: 0,
      },
      {
        user: "Burgess",
        companions: 0,
      },
      {
        user: "Wyn",
        companions: 0,
      },
    ],
  },
  {
    _id: "dgB6q2ezcFAcKTiM2",
    title: "Minimalismus: Ausmisten im Kleiderschrank",
    description:
      "<p>Den Kleiderschrank ausmisten gibt mehr Platz in Schrank und Kopf. Es bringt mehr Selbstvertrauen und Zeit, tut etwas für die Nachhaltigkeit. Es spart Geld und passende Kleidung macht Freude. In diesem Workshop erfährst du praktische Tipps. Packen wir's an!<br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im L200",
      _id: "EfRq9WNkHgX3ETkwc",
    },
    room: "20",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "hAiZY37bbPwocBM5b",
    time_lastedit: {
      $date: "2024-06-03T12:08:27.122+0000",
    },
    time_created: {
      $date: "2024-05-31T10:05:00.390+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T09:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    createdBy: "Lorin",
    categories: ["misc"],
    participants: [
      {
        user: "Karola",
        companions: 0,
      },
      {
        user: "Pollyanna",
        companions: 0,
      },
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Markus",
        companions: 0,
      },
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Rea",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 1,
      },
      {
        user: "Aguistin",
        companions: 0,
      },
      {
        user: "Kalle",
        companions: 0,
      },
      {
        user: "Maddie",
        companions: 0,
      },
      {
        user: "Stevena",
        companions: 0,
      },
      {
        user: "Shayne",
        companions: 0,
      },
      {
        user: "Markus",
        companions: 0,
      },
      {
        user: "Melloney",
        companions: 0,
      },
    ],
  },
  {
    _id: "aKhGB9pFfKteoRT8a",
    title: "Leckere, besondere Kleinigkeiten zubereiten/kochen",
    description:
      "<p>Überrasche wen mit zwei bis drei besonderen Leckereien.... Ich zeig dir wie es geht. Kochen, vorbereiten, verspeisen : )</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "9zoFbFBWq9eGLTp54",
    time_lastedit: {
      $date: "2024-05-23T09:40:16.672+0000",
    },
    time_created: {
      $date: "2024-05-22T15:18:45.190+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    createdBy: "Tammara",
    categories: ["cooking"],
    participants: [
      {
        user: "Danya",
        companions: 0,
      },
      {
        user: "Cathryn",
        companions: 0,
      },
      {
        user: "Blane",
        companions: 1,
      },
      {
        user: "Gwenora",
        companions: 0,
      },
      {
        user: "Lucila",
        companions: 1,
      },
      {
        user: "Stevana",
        companions: 0,
      },
      {
        user: "Basia",
        companions: 1,
      },
      {
        user: "Athene",
        companions: 0,
      },
      {
        user: "Catie",
        companions: 0,
      },
    ],
  },
  {
    _id: "8k9aQ6ZyEPDwoEqAk",
    title: "String Figur",
    description:
      "<p>Wohin mit den Händen, wenn man nicht raucht, noch ständig sein Handy bedienen will? Richtig, wir lernen mit deiner Schnur zu spielen und knüpfen innert Sekunden faszinierende Figuren und Netze, die sich genauso schnell wieder ins Nichts auflösen können.</p>",
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Fotostudio Habibi, Aargauerstrasse 52, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "4b94veNQF5C28BSAA",
    time_lastedit: {
      $date: "2024-06-06T12:41:37.613+0000",
    },
    time_created: {
      $date: "2024-05-29T13:49:03.026+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T11:00:00.000+0000",
    },
    createdBy: "Helen",
    categories: ["handicraft"],
    participants: [
      {
        user: "Marleah",
        companions: 1,
      },
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Leland",
        companions: 1,
      },
    ],
  },
  {
    _id: "7JDYuQS9Zd3LMLyeu",
    title: "Pysanky: Ukrainian Easter Eggs",
    description:
      "<p>Pysanky are eggs dyed using a wax-resist technique that allows for multiple colors and intricate designs.  The tradition dates back to pre-Christian times, but has since become connected with the Easter holiday.  I have been making pysanky since I was 14.  I would love to share this technique.</p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "2. Stock",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "gQMkCkMKawqJaP56d",
    time_lastedit: {
      $date: "2024-07-08T08:26:27.690+0000",
    },
    time_created: {
      $date: "2024-07-08T08:26:27.690+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T10:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T16:00:00.000+0000",
    },
    createdBy: "Sacha",
    categories: ["handicraft"],
    participants: [
      {
        user: "Caitlin",
        companions: 1,
      },
      {
        user: "Jami",
        companions: 0,
      },
      {
        user: "Johann",
        companions: 0,
      },
      {
        user: "Wang",
        companions: 0,
      },
    ],
  },
  {
    _id: "L39bNW8dG97gfTh7P",
    title: "Impro Theater",
    description:
      "<p>Hast Du Lust auf Neuland und möchtest einmal einen Blick in die Welt des Improvisationstheaters werfen? Statt „nein, aber“ einfach mal zu allem „ja genau, und!“ sagen? Und vor allem: loslassen und ganz viel lachen? Dann komm vorbei, wir freuen uns auf gemeinsame Überraschungsmomente.</p>",
    venue: {
      name: "LeLabor",
      _id: "uXHwNfdnZjun4C2yN",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "vhDjgn9uBtCDabCoL",
    time_lastedit: {
      $date: "2024-09-16T15:42:24.072+0000",
    },
    time_created: {
      $date: "2024-03-13T08:38:39.420+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    createdBy: "Kendell",
    categories: ["culture"],
    noRsvp: false,
    participants: [
      {
        user: "Tomi",
        companions: 0,
      },
      {
        user: "Haley",
        companions: 1,
      },
      {
        user: "Herschel",
        companions: 0,
      },
      {
        user: "Joete",
        companions: 0,
      },
      {
        user: "Gib",
        companions: 0,
      },
      {
        user: "Roslyn",
        companions: 0,
      },
      {
        user: "Creight",
        companions: 0,
      },
      {
        user: "Markus",
        companions: 0,
      },
      {
        user: "Siward",
        companions: 0,
      },
    ],
  },
  {
    _id: "JoaBwsZEGat8MZDv8",
    title: "Gemeinsam Bauen auf dem Fogo Areal",
    description:
      "<p>Wirken Sie aktiv am Aufbau eines Bauprojekts draussen auf dem Fogo mit! Diese Lektion verfolgt die Idee, dass gemeinsames Bauen Menschen zusammenbringt und die Möglichkeit bietet, voneinander zu lernen. Alle sind eingeladen mitzumachen, unabhängig von Vorkenntnissen oder Alter.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "xZuyAjXYZRzC2agvG",
    time_lastedit: {
      $date: "2024-05-30T12:00:49.809+0000",
    },
    time_created: {
      $date: "2024-05-30T12:00:49.809+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    createdBy: "Bert",
    categories: ["handicraft"],
    participants: [
      {
        user: "Tally",
        companions: 1,
      },
      {
        user: "Katti",
        companions: 0,
      },
      {
        user: "Lin",
        companions: 0,
      },
      {
        user: "Deck",
        companions: 0,
      },
    ],
  },
  {
    _id: "aqXs2XMNEnNKHhb2S",
    title: "Lead She Can – Helping you Future-proof your Organisation by Hiring more Women",
    description:
      "<p>Based on a process used by the Nobel-prize-winning Economist, Daniel Kahneman - this seminar explores a “quick win” that could help your organisation hire and / or promote more competent, qualified women to leadership positions. </p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "JBY4mb8syXnqkYSui",
    time_lastedit: {
      $date: "2024-07-12T07:16:15.048+0000",
    },
    time_created: {
      $date: "2024-07-12T07:16:15.048+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T12:30:00.000+0000",
    },
    createdBy: "Giustino",
    categories: ["misc"],
    participants: [
      {
        user: "Felicle",
        companions: 0,
      },
    ],
  },
  {
    _id: "TaSCqrApDbvqrdnhZ",
    title: "Organischer Stoffkeislauf auf der Stadionbrache Hardturm",
    description:
      "<p>Wir begehen gemeinsam die Kompostieranlage auf der Stadionbrache Hardturm und vertiefen uns in verschiedene Techniken der Kompostierung: Kaltkompostierung (Terra Preta) / Fermentation (Bokashi) / Köhlern (Pyrolyse) / Kaskadische Bwirtschaftung</p>",
    venue: {
      name: "Stadionbrache Hardturm",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 18,
    region: "h4MnI3psRr8hSljk2",
    courseId: "RiSSEBbDz5DXNdMFN",
    time_lastedit: {
      $date: "2024-05-24T15:16:19.322+0000",
    },
    time_created: {
      $date: "2024-05-21T16:36:29.490+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:00:00.000+0000",
    },
    createdBy: "Madalyn",
    categories: ["handicraft", "sciences", "misc"],
    participants: [
      {
        user: "Lisha",
        companions: 0,
      },
      {
        user: "Eb",
        companions: 0,
      },
      {
        user: "Tammy",
        companions: 0,
      },
      {
        user: "Tudor",
        companions: 0,
      },
    ],
  },
  {
    _id: "zE2qmKMsBxtJmgrJq",
    title: "Die Kunst des Erkundens",
    description:
      "<p>Wie können wir einen Ort auf vielfältige Weise erkunden? Wir lassen uns von verschiedenen kindlichen + künstlerischen Versuchen anregen, fokussieren auf verschiedene Sinne, listen auf, skizzieren, sammeln, halten fest. Wir sind auf dem Gelände des Basislagers unterwegs. <br /></p><p>Bitte bringt ein Notizheft mit. <br /></p>",
    venue: {
      name: "BASISLAGER",
      _id: "HHwpRN5SgegzWjYqQ",
    },
    room: "Treffpunkt: Habibi Fotostudio, Aargauerstrasse 52, 8048 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "w8yC8AbAmWSTqdhQL",
    time_lastedit: {
      $date: "2024-09-19T13:14:10.012+0000",
    },
    time_created: {
      $date: "2024-05-26T10:21:37.802+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    createdBy: "Greggory",
    categories: ["culture"],
    participants: [
      {
        user: "Leesa",
        companions: 0,
      },
      {
        user: "Duffy",
        companions: 0,
      },
      {
        user: "Hildy",
        companions: 0,
      },
      {
        user: "Sig",
        companions: 0,
      },
      {
        user: "Myrta",
        companions: 0,
      },
      {
        user: "Johann",
        companions: 1,
      },
    ],
  },
  {
    _id: "W9a8zQuYXZhozZL7m",
    title: "Atelier für Kräuter-Beautyprodukte",
    description:
      "<p>Im Atelier lernst du, aus Kräutern und Naturprodukten eine Creme herzustellen und ein Shampoo mit Kräutern anzureichern. Schön sollte eben auch gesund sein und zu einer bewussten Schönheitskultur beitragen. Dafür setzt sich die ökologische Misswahl Miss Save the Planet ein. <br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im L200",
      _id: "EfRq9WNkHgX3ETkwc",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "KpFrcvQ55tRF8EvAj",
    time_lastedit: {
      $date: "2024-06-03T12:09:53.862+0000",
    },
    time_created: {
      $date: "2024-05-31T07:33:39.756+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T12:30:00.000+0000",
    },
    createdBy: "Warden",
    categories: [],
    participants: [
      {
        user: "Dagny",
        companions: 0,
      },
      {
        user: "Paula",
        companions: 0,
      },
      {
        user: "Elora",
        companions: 0,
      },
      {
        user: "Leila",
        companions: 0,
      },
      {
        user: "Flory",
        companions: 0,
      },
      {
        user: "Jean",
        companions: 0,
      },
      {
        user: "Dione",
        companions: 0,
      },
      {
        user: "Coleen",
        companions: 0,
      },
      {
        user: "Vincenz",
        companions: 0,
      },
      {
        user: "Stearne",
        companions: 0,
      },
    ],
  },
  {
    _id: "6BW4R5GcCkfiBec52",
    title: "Bewegen und Tanzen",
    description:
      "<p>In diesem Angebot liegt der Fokus auf der Bewegung und dem freien Tanz. Über den Körper, durch Bewegung können die eigenen Ressourcen erkannt und gestärkt werden. Es wird Raum für den eigenen Ausdruck gegeben, um neue Bewegungsqualitäten kennen zu lernen.</p>",
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    room: "Kursraum",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "pAXqtBRQArNKLpYTi",
    time_lastedit: {
      $date: "2024-05-31T07:35:45.776+0000",
    },
    time_created: {
      $date: "2024-05-31T07:35:45.776+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T12:30:00.000+0000",
    },
    createdBy: "Pen",
    categories: ["sports"],
    participants: [
      {
        user: "Shena",
        companions: 0,
      },
      {
        user: "Callie",
        companions: 0,
      },
      {
        user: "Vanya",
        companions: 0,
      },
      {
        user: "Peg",
        companions: 0,
      },
      {
        user: "Giordano",
        companions: 0,
      },
    ],
  },
  {
    _id: "z3o8GPuHL6uLQqFY3",
    title: "Kaliméra Elláda - Griechisch für die Ferien",
    description:
      "<p>Du reist in den (Herbst-)Ferien nach Griechenland? Diese Lektion vermittelt dir hilfreiche Begriffe für deinen Aufenthalt, z.B. für Bestellungen in der Taverna oder im Café.</p>",
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "wWH5jp6WmecSegkNY",
    time_lastedit: {
      $date: "2024-08-15T08:10:41.137+0000",
    },
    time_created: {
      $date: "2024-05-31T12:07:57.132+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T12:30:00.000+0000",
    },
    createdBy: "Riki",
    categories: ["languages"],
    participants: [
      {
        user: "Guillermo",
        companions: 0,
      },
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Alfonso",
        companions: 0,
      },
      {
        user: "Herman",
        companions: 1,
      },
      {
        user: "Jimmy",
        companions: 0,
      },
      {
        user: "Dagny",
        companions: 0,
      },
      {
        user: "Gamaliel",
        companions: 1,
      },
      {
        user: "Lorinda",
        companions: 0,
      },
      {
        user: "Kore",
        companions: 1,
      },
      {
        user: "Helge",
        companions: 0,
      },
    ],
  },
  {
    _id: "9apdTQvYmzo2nzaxC",
    title: "Dabke tanzen",
    description:
      "<p>Lernen Sie die ersten Schritte des Dabke kennen. Dabke ist ein Paar- oder Kreistanz, der vor allem in Syrien, Libanon und Jordanien getanzt wird.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "CkTDPPxqx3jzotdve",
    time_lastedit: {
      $date: "2024-08-20T14:31:53.637+0000",
    },
    time_created: {
      $date: "2024-07-30T15:43:46.530+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T12:15:00.000+0000",
    },
    createdBy: "Liz",
    categories: ["sports", "culture"],
    participants: [
      {
        user: "Marcile",
        companions: 0,
      },
      {
        user: "Mollee",
        companions: 1,
      },
      {
        user: "Herve",
        companions: 0,
      },
      {
        user: "Hildy",
        companions: 1,
      },
      {
        user: "Leah",
        companions: 1,
      },
      {
        user: "Jasmin",
        companions: 1,
      },
      {
        user: "Bibbye",
        companions: 0,
      },
    ],
  },
  {
    _id: "sAHDzZE5LjoqsTvyQ",
    title: "Intuitives Malen: Bücher in Farben",
    description:
      "Beim intuitiven Malen geht es darum, sich vom Fluss der Inspiration leiten zu lassen und die eigene Kreativität unbeschwert auszudrücken. Lass dich von den Seiten der Bücher auf ungeahnte Ideen bringen und durch kreative Impulse zum Malen verführen.<br />",
    venue: {
      name: "PBZ Bibliothek Altstadt",
      _id: "ozytJFQ5gGCY7kTip",
    },
    room: "3.OG Sitzungszimmer",
    internal: false,
    sendReminder: true,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "FHrWpv6KA5eP4wfBo",
    time_lastedit: {
      $date: "2024-05-29T14:30:34.596+0000",
    },
    time_created: {
      $date: "2024-04-09T15:30:47.044+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:30:00.000+0000",
    },
    createdBy: "Abe",
    categories: ["culture", "handicraft"],
    participants: [
      {
        user: "Cully",
        companions: 0,
      },
      {
        user: "Warden",
        companions: 0,
      },
      {
        user: "Evania",
        companions: 0,
      },
      {
        user: "Cirstoforo",
        companions: 0,
      },
      {
        user: "Rog",
        companions: 0,
      },
      {
        user: "Matilde",
        companions: 0,
      },
      {
        user: "Brennan",
        companions: 0,
      },
      {
        user: "Amargo",
        companions: 0,
      },
      {
        user: "Charis",
        companions: 0,
      },
      {
        user: "Jennilee",
        companions: 0,
      },
      {
        user: "Ignaz",
        companions: 0,
      },
      {
        user: "Milty",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "PGgWCRQJjFr7MJRuG",
    title: "Faszination Honigbiene",
    description:
      "<p>Erlebnisreise durch die Imkerei mit einem anschliessenden Besuch in einem Bienenstand inklusive Honigdegustation.</p><p><br /></p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "fCnc8ee2tE3vFmEby",
    time_lastedit: {
      $date: "2024-06-03T10:39:14.534+0000",
    },
    time_created: {
      $date: "2024-05-16T11:15:40.264+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:00:00.000+0000",
    },
    createdBy: "Jourdain",
    categories: ["sciences"],
    participants: [
      {
        user: "Maryann",
        companions: 1,
      },
      {
        user: "Putnam",
        companions: 0,
      },
      {
        user: "Ozzy",
        companions: 1,
      },
      {
        user: "Carolyn",
        companions: 0,
      },
      {
        user: "Blane",
        companions: 0,
      },
      {
        user: "Hildy",
        companions: 0,
      },
    ],
  },
  {
    _id: "rpS7gWcXdL8h8XFpG",
    title: "La neurociencia aplicada a la arquitectura y el diseño",
    description:
      "<p>Entender cómo el entorno modifica nuestras emociones, pensamientos y comportamientos.</p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 25,
    region: "h4MnI3psRr8hSljk2",
    courseId: "6RMdppjzyB686ezxk",
    time_lastedit: {
      $date: "2024-06-07T13:37:40.575+0000",
    },
    time_created: {
      $date: "2024-05-31T11:39:05.115+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:30:00.000+0000",
    },
    createdBy: "Selia",
    categories: ["misc", "culture"],
    participants: [
      {
        user: "Bary",
        companions: 0,
      },
      {
        user: "Orella",
        companions: 0,
      },
      {
        user: "Keelby",
        companions: 0,
      },
      {
        user: "Grady",
        companions: 1,
      },
      {
        user: "Ulberto",
        companions: 0,
      },
      {
        user: "Misty",
        companions: 0,
      },
      {
        user: "Leoine",
        companions: 0,
      },
      {
        user: "Aurore",
        companions: 0,
      },
      {
        user: "Davidson",
        companions: 0,
      },
      {
        user: "Haven",
        companions: 1,
      },
      {
        user: "Stefania",
        companions: 1,
      },
      {
        user: "Chrysa",
        companions: 0,
      },
      {
        user: "Earl",
        companions: 0,
      },
      {
        user: "Morena",
        companions: 0,
      },
      {
        user: "Carney",
        companions: 0,
      },
      {
        user: "Milty",
        companions: 0,
      },
      {
        user: "Danita",
        companions: 0,
      },
    ],
  },
  {
    _id: "GzEkKS66Mm8nYYPG3",
    title: "Zuhause - Stickworkshop mit der Künstlerin Maria Motyleva",
    description:
      "<p>Was bedeutet es für dich, an einem Ort zuhause zu sein?<br />Im Austausch mit Maria entwirfst du ein Zeichen, das für dein Gefühl von zuhause Sein steht. Du lernst verschiedene Sticktechniken und wendest sie an, indem du dein Zeichen auf eine Stoffinstallation stickst, die in Leimbach ausgestellt wird.<br /></p>",
    room: "Kleiner Kursraum (im UG des GZ)",
    region: "h4MnI3psRr8hSljk2",
    groups: [],
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    venue: {
      name: "GZ Leimbach",
      _id: "MeLMDkkw9LWrv7zzq",
    },
    courseId: "BFuEBwQS8mrkQCyLG",
    time_lastedit: {
      $date: "2024-05-31T12:46:46.557+0000",
    },
    time_created: {
      $date: "2024-05-31T12:46:16.332+0000",
    },
    start: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T15:00:00.000+0000",
    },
    createdBy: "Brendis",
    categories: ["culture"],
    participants: [
      {
        user: "Violetta",
        companions: 0,
      },
      {
        user: "Geordie",
        companions: 0,
      },
    ],
  },
  {
    _id: "gWKBoamQ6A2N2RDnu",
    title: "Was weisst Du über SoLaWi?",
    description:
      '<p>SoLaWi steht für solidarische Landwirtschaft. Der Name ist Programm. Zugleich Konsument*Innen und Produzent*Innen, teilen wir Freud und Leid im Gemüseanbau solidarisch. Erfahre Zusammenhänge und erlebe Biodiversität pur in der „Gärtnerei“ der SoLaWi "Meh als Gmües", unserem Dreh- und Angelpunkt.</p>',
    venue: {
      name: "SoLaWi Meh als Gmües, Reckenholzstrasse 150, 8046 Zürich",
    },
    room: "SoLaWi Meh als Gmües",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "kpFYaGHiJtDdNi85T",
    time_lastedit: {
      $date: "2024-07-18T15:40:48.753+0000",
    },
    time_created: {
      $date: "2024-06-07T20:57:33.640+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:30:00.000+0000",
    },
    createdBy: "Renee",
    categories: ["culture", "sciences"],
    participants: [
      {
        user: "Carolan",
        companions: 0,
      },
      {
        user: "Brandon",
        companions: 0,
      },
    ],
  },
  {
    _id: "Pf8989DLWZthY2Cvt",
    title: "Mein Wert - siehst du ihn? - sehe ich ihn?",
    description:
      "<p>Erkenne, warum du dich nach Wertschätzung sehnst. Docke an die spontane &amp; liebevolle Energie an. Entdecke mit dem IBC Inquiry-Based Coaching™, wie wertvoll du bist auch ohne äussere Bestätigung. Voraussetzung: Du bist bereit, dich mit persönlichen Fragen auseinanderzusetzen.<br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall",
      _id: "GMHarpKXL248XG2EC",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "7EeW3PKJSvbjezbE6",
    time_lastedit: {
      $date: "2024-06-10T13:32:47.263+0000",
    },
    time_created: {
      $date: "2024-06-10T13:32:47.263+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T12:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:15:00.000+0000",
    },
    createdBy: "Colman",
    categories: ["misc"],
    participants: [
      {
        user: "Giustino",
        companions: 0,
      },
      {
        user: "Avril",
        companions: 0,
      },
      {
        user: "Kendell",
        companions: 0,
      },
      {
        user: "Dolli",
        companions: 0,
      },
      {
        user: "Lavinie",
        companions: 0,
      },
      {
        user: "Anett",
        companions: 0,
      },
      {
        user: "Eduard",
        companions: 0,
      },
      {
        user: "Erhard",
        companions: 0,
      },
      {
        user: "Erhard",
        companions: 0,
      },
    ],
  },
  {
    _id: "d9mRW2NuDwpy9zKgN",
    title: "Mandarin 101 - für Kinder, Jugendliche und Erwachsene",
    description:
      "<p>Crash course on the characters of traditional Chinese, how a character is formed from image to meaning. Introduction to the types of basic strokes to compose characters, we will write and learn to speak a few phrases for your next nature or cultural exploration in the far east.</p>",
    venue: {
      name: "PBZ Bibliothek Schütze",
      _id: "9yBmmWnAt33mPTntb",
    },
    room: "Lesecafé (1. OG)",
    internal: false,
    sendReminder: true,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "35gJDQKtsGYamx23a",
    time_lastedit: {
      $date: "2024-09-19T08:14:13.298+0000",
    },
    time_created: {
      $date: "2024-04-11T17:41:40.275+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T12:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T13:30:00.000+0000",
    },
    createdBy: "Wolf",
    categories: ["culture", "languages"],
    noRsvp: false,
    participants: [
      {
        user: "Marleah",
        companions: 0,
      },
      {
        user: "Ethyl",
        companions: 0,
      },
      {
        user: "Henriette",
        companions: 1,
      },
      {
        user: "Anna-diane",
        companions: 0,
      },
      {
        user: "Cacilia",
        companions: 1,
      },
    ],
  },
  {
    _id: "DvRcgCFY6e7Cvgac5",
    title: "Jodeln!",
    description:
      "<p>Du wolltest schon immer mal Jodeln ausprobieren? Deine Stimme in neuem Kontext erleben? Endlich wieder einmal singen? Gemeinsam erlernen wir den Wechsel zwischen Kopf- und Bruststimme und geniessen das gemeinsame Klingen beim Erlernen von 1-2 Jodeln und Jüüzli.</p>",
    venue: {
      name: "MAXIM Theater",
      _id: "27zGELHLDFW2GBq9f",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 14,
    region: "h4MnI3psRr8hSljk2",
    courseId: "LNfFqZ7udsaorMYX4",
    time_lastedit: {
      $date: "2024-07-11T12:05:02.886+0000",
    },
    time_created: {
      $date: "2024-03-28T12:36:11.665+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:00:00.000+0000",
    },
    createdBy: "Mickie",
    categories: ["culture", "handicraft"],
    participants: [
      {
        user: "Loretta",
        companions: 0,
      },
      {
        user: "Nessi",
        companions: 0,
      },
      {
        user: "Edan",
        companions: 0,
      },
      {
        user: "Jules",
        companions: 0,
      },
      {
        user: "Ali",
        companions: 0,
      },
      {
        user: "Sig",
        companions: 1,
      },
      {
        user: "Alene",
        companions: 1,
      },
      {
        user: "Leigh",
        companions: 1,
      },
      {
        user: "Evvie",
        companions: 0,
      },
      {
        user: "Mord",
        companions: 1,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "QRCn8ELLrdGMhBKQc",
    title: "Introduction to Improvised Theater",
    description:
      "<p>We go through some easy exercises to learn the basics of improvised theatre. Unlock your creativity, embrace spontaneity and create magic stories and scenes together with the other participants. All ages welcome, no previous experience in acting required. Session in English. Fun guaranteed!</p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "Pflegiraum, Klosbachstrasse 118, 8032 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "38wGNTdvRGhD4RxQN",
    time_lastedit: {
      $date: "2024-05-15T10:58:27.004+0000",
    },
    time_created: {
      $date: "2024-05-08T09:49:58.200+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T15:00:00.000+0000",
    },
    createdBy: "Wilhelmina",
    categories: ["culture"],
    participants: [
      {
        user: "Kalle",
        companions: 0,
      },
      {
        user: "Lindie",
        companions: 1,
      },
      {
        user: "Susanne",
        companions: 1,
      },
      {
        user: "Giraldo",
        companions: 1,
      },
      {
        user: "Ivan",
        companions: 0,
      },
      {
        user: "Prue",
        companions: 0,
      },
      {
        user: "Dorita",
        companions: 0,
      },
      {
        user: "Yalonda",
        companions: 0,
      },
      {
        user: "Gwenora",
        companions: 0,
      },
      {
        user: "Jean",
        companions: 0,
      },
      {
        user: "Donaugh",
        companions: 0,
      },
    ],
  },
  {
    _id: "fgjwFb3PojPRAaWze",
    title: "Massage für Rücken und Füsse",
    description:
      "<p>Wir lernen jeweils zu zweit wie man Rücken und Füsse massiert. Come and enjoy!</p>",
    venue: {
      name: "GZ Bachwiesen",
      _id: "SXgioAwqWrDu6z4Rt",
    },
    room: "Kleiner Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 12,
    region: "h4MnI3psRr8hSljk2",
    courseId: "nkfeveYRWG6WkQySz",
    time_lastedit: {
      $date: "2024-05-24T12:33:17.098+0000",
    },
    time_created: {
      $date: "2024-05-22T15:21:42.922+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T15:00:00.000+0000",
    },
    createdBy: "Marja",
    categories: ["misc"],
    participants: [
      {
        user: "Drucy",
        companions: 0,
      },
      {
        user: "Bibbye",
        companions: 0,
      },
      {
        user: "Tybi",
        companions: 0,
      },
      {
        user: "Moreen",
        companions: 0,
      },
      {
        user: "Tiphani",
        companions: 0,
      },
      {
        user: "Tiffani",
        companions: 1,
      },
      {
        user: "Turner",
        companions: 1,
      },
      {
        user: "Annnora",
        companions: 0,
      },
      {
        user: "Helenelizabeth",
        companions: 1,
      },
    ],
  },
  {
    _id: "i6yS3wWpPuY6uzBMC",
    title: "Zuckerfrei und Zuckerfasten - ein Selbstversuch",
    description:
      "<p>Tipps und Tricks für den kurz- und längerfristigen Zuckerverzicht.</p><p>Wie schaffe ich das? Was gilt es zu beachten? Was sind die alltäglichen Zuckerfallen? Wie gehe ich mit schwachen Momenten und Rückfällen um? etc.</p>",
    venue: {
      name: "FOGO Leben am Vulkanplatz",
      _id: "6762XCBozuWXvjANP",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 30,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dxsQ7hkMYm649cYeH",
    time_lastedit: {
      $date: "2024-09-18T06:53:34.162+0000",
    },
    time_created: {
      $date: "2024-05-30T12:06:05.936+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T13:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:00:00.000+0000",
    },
    createdBy: "Alida",
    categories: ["cooking", "misc"],
    participants: [
      {
        user: "Brittan",
        companions: 0,
      },
      {
        user: "Tally",
        companions: 0,
      },
      {
        user: "Janaya",
        companions: 0,
      },
      {
        user: "Josefa",
        companions: 0,
      },
      {
        user: "Gal",
        companions: 0,
      },
      {
        user: "Tomasine",
        companions: 0,
      },
      {
        user: "Elfrida",
        companions: 1,
      },
      {
        user: "Kaye",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 1,
      },
      {
        user: "Alyse",
        companions: 0,
      },
      {
        user: "Jeffy",
        companions: 0,
      },
      {
        user: "Dyana",
        companions: 0,
      },
      {
        user: "Brendin",
        companions: 0,
      },
      {
        user: "Phelia",
        companions: 0,
      },
      {
        user: "Darda",
        companions: 0,
      },
      {
        user: "Duffy",
        companions: 0,
      },
      {
        user: "Peter",
        companions: 0,
      },
      {
        user: "Tam",
        companions: 0,
      },
      {
        user: "Rhona",
        companions: 0,
      },
      {
        user: "Fritz",
        companions: 0,
      },
      {
        user: "Dolores",
        companions: 1,
      },
    ],
  },
  {
    _id: "BeKHBDXnvyBQykhTq",
    title: "Freestyletanz für Kinder und Jugendliche",
    description:
      "<p>Lerne dich selbstbewusst zu bewegen! Finde und fördere deinen eigenen Stil. Zu Pop und instrumentalen Beats zeige ich dir neue Moves. Weil es glücklich machen kann, ist Tanzen Teil der bewussten Schönheitskultur, welche wir mit der ökologischen Misswahl 'Miss Save the Planet' fördern wollen.</p>",
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im L200",
      _id: "EfRq9WNkHgX3ETkwc",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "aENnmvSTturxL5NKk",
    time_lastedit: {
      $date: "2024-05-31T18:09:01.252+0000",
    },
    time_created: {
      $date: "2024-05-31T10:24:08.761+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T13:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T14:15:00.000+0000",
    },
    createdBy: "Katti",
    categories: [],
    participants: [
      {
        user: "Georgi",
        companions: 1,
      },
      {
        user: "Dana",
        companions: 1,
      },
    ],
  },
  {
    _id: "naftTD6RG6zvgYhdD",
    title: "Rhythmus Event, offener Trommelkreis.",
    description:
      "<p>Rhythmen und Songs im Dialog. Wir lernen einfache Rhythmen und erleben sie dynamisch in verschiedenen Geschwindigkeiten, Klangfarben und im Flow-Moment. Wir machen Erfahrungen in Kreativität, Selbstwirksamkeit und konstruktivem Zuhören. Instrumente werden gestellt. Offen für alle.</p>",
    venue: {
      name: "PBZ Bibliothek Hardau",
      _id: "smRSEWukb2tGsFB4S",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "jxEBW7oDav8447Qrd",
    time_lastedit: {
      $date: "2024-04-12T14:48:04.383+0000",
    },
    time_created: {
      $date: "2024-04-12T13:39:53.223+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T15:00:00.000+0000",
    },
    createdBy: "Angelico",
    categories: ["culture"],
    participants: [
      {
        user: "Hephzibah",
        companions: 0,
      },
      {
        user: "Saunders",
        companions: 0,
      },
      {
        user: "Kerry",
        companions: 1,
      },
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 0,
      },
      {
        user: "Mendie",
        companions: 0,
      },
      {
        user: "Chrissy",
        companions: 0,
      },
      {
        user: "Gabbey",
        companions: 1,
      },
      {
        user: "Ingrid",
        companions: 0,
      },
      {
        user: "Nerissa",
        companions: 1,
      },
      {
        user: "Binnie",
        companions: 0,
      },
      {
        user: "Alyse",
        companions: 0,
      },
    ],
  },
  {
    _id: "9wNPyuC8kTaZ6pnEN",
    title: "Freestyletanz für Jugendliche",
    description:
      "<p>Lerne dich selbstbewusst zu bewegen! Finde und fördere deinen eigenen Stil. Zu Pop und instrumentalen Beats zeige ich dir neue Moves. Weil es glücklich machen kann, ist Tanzen Teil der bewussten Schönheitskultur, welche wir mit der ökologischen Misswahl 'Miss Save the Planet' fördern wollen.</p>",
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im L200",
      _id: "EfRq9WNkHgX3ETkwc",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "SAz4Tt3bEhRfGdLvo",
    time_lastedit: {
      $date: "2024-05-31T10:29:58.953+0000",
    },
    time_created: {
      $date: "2024-05-31T10:29:58.953+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T16:00:00.000+0000",
    },
    createdBy: "Naomi",
    categories: [],
    participants: [],
    canceled: true,
  },
  {
    _id: "p9w32emQTC2S87J2A",
    title: "Hol dir den Spass in dein Leben zurück!",
    description:
      "<p>Stehst Du in der Mitte von einer Lebensveränderung oder vor einem beruflichen Wechsel? Packe die Chance, Deine täglichen Lebensroutinen neu zu denken. Mit Hilfe der positiven Psychologie lade ich Dich dazu ein, spielerisch neue oder vergessene Quellen der Freude in Dein Alltagsleben einzubauen.</p><p><br /></p>",
    venue: {
      name: "Intrinsic",
      _id: "jbAxYboxbAwGnoaKd",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dbv6MztWyZ42FZa8D",
    time_lastedit: {
      $date: "2024-07-17T08:41:18.618+0000",
    },
    time_created: {
      $date: "2024-06-02T12:56:48.995+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T14:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T16:00:00.000+0000",
    },
    createdBy: "Olvan",
    categories: ["misc"],
    participants: [
      {
        user: "Rudolph",
        companions: 0,
      },
      {
        user: "Ddene",
        companions: 0,
      },
      {
        user: "Wolfie",
        companions: 0,
      },
      {
        user: "Tommy",
        companions: 0,
      },
      {
        user: "Emelyne",
        companions: 0,
      },
      {
        user: "Sukey",
        companions: 0,
      },
      {
        user: "Gene",
        companions: 0,
      },
      {
        user: "Lemmy",
        companions: 1,
      },
      {
        user: "Eldredge",
        companions: 0,
      },
      {
        user: "Jeremiah",
        companions: 1,
      },
      {
        user: "Elane",
        companions: 1,
      },
      {
        user: "Leonore",
        companions: 0,
      },
      {
        user: "Caitlin",
        companions: 0,
      },
      {
        user: "Angelico",
        companions: 0,
      },
      {
        user: "Jourdain",
        companions: 0,
      },
      {
        user: "Hynda",
        companions: 0,
      },
      {
        user: "Sig",
        companions: 0,
      },
      {
        user: "Catie",
        companions: 0,
      },
      {
        user: "Laural",
        companions: 0,
      },
      {
        user: "Nolly",
        companions: 0,
      },
      {
        user: "Constantino",
        companions: 0,
      },
      {
        user: "Yelena",
        companions: 1,
      },
      {
        user: "Sallee",
        companions: 0,
      },
      {
        user: "Honey",
        companions: 1,
      },
      {
        user: "Jedd",
        companions: 0,
      },
    ],
  },
  {
    _id: "cHTxHqpRRxpq8XTeL",
    title: "Die Geschichte des Fernsehens und der Videoaufzeichnung",
    description:
      "<p>Schon immer war es ein Menschheitstraum, bewegte Bilder über weite Strecken zu übertragen und aufzuzeichnen. Wir lernen frühe Methoden der Bildzerlegung kennen, besprechen die Hauptkomponenten eines Fernsehempfängers und lernen Fernseher und Videogeräte aus längst vergangenen Zeiten kennen. </p>",
    venue: {
      name: "Sihlweidstrasse 69",
    },
    room: "ACHTUNG: keine Toilette vorhanden! Option: um 18.45 Uhr im GZ Leimbach (Leimbachstrasse 200) die Toilette noch benutzen; Treffpunkt: Haustür Sihlweidstrasse 69",
    internal: false,
    sendReminder: true,
    maxParticipants: 5,
    region: "h4MnI3psRr8hSljk2",
    courseId: "tnTqBSr9s7LjHmE3x",
    time_lastedit: {
      $date: "2024-05-30T10:37:49.587+0000",
    },
    time_created: {
      $date: "2024-04-17T09:46:27.892+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T17:00:00.000+0000",
    },
    createdBy: "Ardath",
    categories: ["sciences"],
    noRsvp: false,
    canceled: true,
  },
  {
    _id: "3dNmEFrSisSdHoGqW",
    title: "Klangreise - Stärkung für Körper, Geist und Seele",
    description:
      "<p>Erfahre die wundervolle Wirkung von Klang auf dein Energiesystem. Klang ist hörbare Energie, welche durch unser Bewusstsein spürbar wird. Über das Spüren machen wir eine Erfahrung. Erfahrungen bringen uns zu unserem wahren, natürlichen Wesen. </p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "66QykcYd8ibTu58eD",
    time_lastedit: {
      $date: "2024-05-17T08:29:07.587+0000",
    },
    time_created: {
      $date: "2024-05-17T08:29:07.587+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T15:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T16:00:00.000+0000",
    },
    createdBy: "Georgia",
    categories: ["misc", "sciences"],
    participants: [
      {
        user: "Elias",
        companions: 0,
      },
      {
        user: "Cammi",
        companions: 0,
      },
      {
        user: "Saunders",
        companions: 0,
      },
      {
        user: "Dana",
        companions: 0,
      },
      {
        user: "Odell",
        companions: 0,
      },
      {
        user: "Milty",
        companions: 0,
      },
      {
        user: "Christy",
        companions: 0,
      },
      {
        user: "Aridatha",
        companions: 0,
      },
      {
        user: "Reinaldo",
        companions: 0,
      },
      {
        user: "Alma",
        companions: 0,
      },
    ],
  },
  {
    _id: "NNCnGQGLdSXQht5Ly",
    title: "Thaikochkurs",
    description:
      "<p>Zuerst machen wir Warenkunde. Dann kochen und geniessen wir gemeinsam Thaisuppe (tom kha gai), ein feines Pouletcurry, sowie Glasnudelsalat. Der Kochkurs eignet sich auch für Vegis.</p><p><br /></p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "GZ Hottingen, Pflegiraum an der Klosbachstrasse 118",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "vwJTDTe8k3KYqzkvj",
    time_lastedit: {
      $date: "2024-05-28T13:42:03.309+0000",
    },
    time_created: {
      $date: "2024-05-22T08:22:18.464+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T19:00:00.000+0000",
    },
    createdBy: "Sidonnie",
    categories: ["cooking"],
    participants: [
      {
        user: "Jelene",
        companions: 1,
      },
      {
        user: "Teresita",
        companions: 1,
      },
      {
        user: "Maye",
        companions: 0,
      },
      {
        user: "Violet",
        companions: 0,
      },
      {
        user: "Helge",
        companions: 0,
      },
      {
        user: "Stefania",
        companions: 0,
      },
      {
        user: "Alane",
        companions: 0,
      },
      {
        user: "Sula",
        companions: 0,
      },
    ],
  },
  {
    _id: "spmXoFEjHyrkPxitg",
    title: "Frauenstimmen aus dem kommunistischen Albanien (Film)",
    description:
      '<p>In dem berührend-bewegenden Dokumentarfilm "Schmetterlinge" von dem in den USA lebenden albanischen Regisseur Bujar Alimani, erzählen Frauen, welche ihre Kindheit in kommunistischen Camps in Albanien verbracht haben. </p><p>Podiumsdiskussion mit dem anwesenden Regisseur nach dem Film. </p>',
    venue: {
      name: "PBZ Bibliothek Hardau",
      _id: "smRSEWukb2tGsFB4S",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 0,
    region: "h4MnI3psRr8hSljk2",
    courseId: "BodgMc23rEhwgPowQ",
    time_lastedit: {
      $date: "2024-07-17T08:21:50.152+0000",
    },
    time_created: {
      $date: "2024-05-31T07:46:06.503+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T16:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T18:00:00.000+0000",
    },
    createdBy: "Levon",
    categories: ["culture", "languages"],
    participants: [
      {
        user: "Gery",
        companions: 0,
      },
      {
        user: "Donaugh",
        companions: 1,
      },
      {
        user: "Derrik",
        companions: 1,
      },
      {
        user: "Holli",
        companions: 0,
      },
      {
        user: "Florenza",
        companions: 1,
      },
      {
        user: "Gregorio",
        companions: 1,
      },
      {
        user: "Malissia",
        companions: 0,
      },
      {
        user: "Leonore",
        companions: 1,
      },
      {
        user: "Ermentrude",
        companions: 1,
      },
      {
        user: "Rustin",
        companions: 0,
      },
      {
        user: "Ryan",
        companions: 1,
      },
      {
        user: "Ezekiel",
        companions: 1,
      },
      {
        user: "Robby",
        companions: 0,
      },
      {
        user: "Carney",
        companions: 0,
      },
    ],
  },
  {
    _id: "35Eg5Zqz2ZPJ43y9P",
    title: "Freestyletanz für Erwachsene",
    description:
      "<p>Lerne dich selbstbewusst zu bewegen! Finde und fördere deinen eigenen Stil. Zu Pop und instrumentalen Beats zeige ich dir neue Moves. Weil es glücklich machen kann, ist Tanzen Teil der bewussten Schönheitskultur, welche wir mit der ökologischen Misswahl 'Miss Save the Planet' fördern wollen.<br /></p>",
    venue: {
      name: "Genussvoll - Vielfalt überall: Lektionen im L200",
      _id: "EfRq9WNkHgX3ETkwc",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 16,
    region: "h4MnI3psRr8hSljk2",
    courseId: "dAdX7M2gvFwkHtYAR",
    time_lastedit: {
      $date: "2024-05-31T18:06:49.704+0000",
    },
    time_created: {
      $date: "2024-05-31T09:58:03.482+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T16:30:00.000+0000",
    },
    end: {
      $date: "2024-09-21T18:00:00.000+0000",
    },
    createdBy: "Giraldo",
    categories: [],
    participants: [
      {
        user: "Lib",
        companions: 0,
      },
      {
        user: "Elias",
        companions: 1,
      },
      {
        user: "Georgianne",
        companions: 0,
      },
      {
        user: "Gun",
        companions: 0,
      },
      {
        user: "Mallory",
        companions: 0,
      },
      {
        user: "Morgen",
        companions: 0,
      },
      {
        user: "Abe",
        companions: 0,
      },
      {
        user: "Judye",
        companions: 0,
      },
      {
        user: "Rafaelia",
        companions: 0,
      },
      {
        user: "Guillaume",
        companions: 0,
      },
    ],
  },
  {
    _id: "aivjeWeTJiz4fKBEd",
    title: "Ceviche und Pisco Sour - eine Reise nach Peru",
    description:
      "<p>In diesem Workshop lernst du die emblematischen Vertreter der peruan. Küche zuzubereiten und danach auch zu geniessen: Den Pisco, der peruanische Traubenschnaps in versch. Variationen und Ceviche ein typ. Gericht aus der Küstenregion von Peru. In Peru gilt Ceviche sogar als nationales Kulturerbe. </p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 14,
    region: "h4MnI3psRr8hSljk2",
    courseId: "z6RyYeyJ5aD3JQdEP",
    time_lastedit: {
      $date: "2024-09-10T11:39:31.450+0000",
    },
    time_created: {
      $date: "2024-05-19T10:26:21.070+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-21T17:00:00.000+0000",
    },
    end: {
      $date: "2024-09-21T18:30:00.000+0000",
    },
    createdBy: "Renee",
    categories: ["culture", "misc"],
    participants: [
      {
        user: "Jannel",
        companions: 1,
      },
      {
        user: "Ivy",
        companions: 1,
      },
      {
        user: "Margeaux",
        companions: 1,
      },
      {
        user: "Hilda",
        companions: 1,
      },
      {
        user: "Ardath",
        companions: 0,
      },
      {
        user: "Junina",
        companions: 0,
      },
      {
        user: "Hill",
        companions: 1,
      },
      {
        user: "Cathrin",
        companions: 1,
      },
    ],
  },
  {
    _id: "FNi2aPzvAEqLmx9j8",
    title: "Hochsensibilität was ist das und die Unterschiede",
    description:
      "<p>Dieser Kurs wurde vom Samstag auf den Sonntag verschoben. <br /></p><p>In diesem Kurs erfährst du, was Hochsensiblität ist und was es für verschiedene Formen gibt. Der Kurs ist für jeden geeignet, egal ob du neugierig, gar nicht hochsensibel bist oder bereits weisst, dass du hochsensibel bist.<br /></p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "GZ Hottingen, Pflegiraum, Klosbachstrasse 118",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "LZCJQmLzr9d6gcrhH",
    time_lastedit: {
      $date: "2024-08-22T15:39:34.109+0000",
    },
    time_created: {
      $date: "2024-05-22T08:40:39.675+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T06:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T07:30:00.000+0000",
    },
    createdBy: "Nannette",
    categories: ["misc"],
    participants: [
      {
        user: "Othella",
        companions: 0,
      },
      {
        user: "Beniamino",
        companions: 0,
      },
      {
        user: "Jabez",
        companions: 0,
      },
      {
        user: "Callie",
        companions: 0,
      },
      {
        user: "Jacynth",
        companions: 0,
      },
      {
        user: "Eleanora",
        companions: 0,
      },
      {
        user: "Ichabod",
        companions: 0,
      },
      {
        user: "Elias",
        companions: 0,
      },
      {
        user: "Lory",
        companions: 0,
      },
      {
        user: "Gwenora",
        companions: 0,
      },
      {
        user: "Dolores",
        companions: 0,
      },
      {
        user: "Olga",
        companions: 0,
      },
      {
        user: "Miguelita",
        companions: 0,
      },
    ],
  },
  {
    _id: "JjhQSngXTe8ZT8dd4",
    title: "Wortwerkstatt: Kreatives Schreiben",
    description:
      "<p>Mit vielen verschiedenen kreativen Anregungen die Begeisterung für das geschriebene Wort wecken. Lustvolles Fabulieren vermehren. Unbeschwertes Experimentieren, hilft spielerisch Schreibblockaden zu lösen und sich schreibend immer wieder an den eigenen Worten, Texten zu erfreuen und zu staunen</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "XHDh5DxLp4MPXq7oE",
    time_lastedit: {
      $date: "2024-05-31T13:53:30.850+0000",
    },
    time_created: {
      $date: "2024-05-31T13:53:30.850+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T08:00:00.000+0000",
    },
    end: {
      $date: "2024-09-22T10:00:00.000+0000",
    },
    createdBy: "Grady",
    categories: ["culture"],
    participants: [
      {
        user: "Cletus",
        companions: 0,
      },
      {
        user: "Putnem",
        companions: 0,
      },
      {
        user: "Windham",
        companions: 0,
      },
      {
        user: "Katharine",
        companions: 0,
      },
      {
        user: "Alie",
        companions: 0,
      },
    ],
  },
  {
    _id: "C5b8c47pELbSJSWzj",
    title: "Sing- und Tanzkurs für Kleinkinder - Zumbini - ABGESAGT",
    description:
      '<p>Tut mir sehr leid, diese Lektion so kurzfristig absagen zu müssen.</p><p>Bei Interesse an eine reguläre Lektion, hier meine Website: <a href="http://www.zumbini-mit-loredana.ch" rel="nofollow">www.zumbini-mit-loredana.ch</a></p><p>Zumbini ist ein Bewegungsprogramm aus den USA: die Musik ist einzigartig und macht so viel Spass wie die von Zumba.  Die Erwachsenen machen auch aktiv mit. Wir singen, tanzen und spielen mit Rhythmusinstrumenten wie Egg-Shakers und Sticks, zudem nutzen wir auch bunte Tücher.</p>',
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "Pflegiraum, GZ Hottingen, Standort Klosbachstrasse",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 28,
    region: "h4MnI3psRr8hSljk2",
    courseId: "pC4rpQ3fm6pPT7Noy",
    time_lastedit: {
      $date: "2024-09-20T18:09:09.215+0000",
    },
    time_created: {
      $date: "2024-05-21T13:57:45.510+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T08:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T09:15:00.000+0000",
    },
    createdBy: "Laney",
    categories: ["sports"],
    participants: [
      {
        user: "Junina",
        companions: 1,
      },
      {
        user: "Margeaux",
        companions: 0,
      },
      {
        user: "Grange",
        companions: 0,
      },
      {
        user: "Zahara",
        companions: 0,
      },
      {
        user: "Demetri",
        companions: 0,
      },
      {
        user: "Nolly",
        companions: 1,
      },
      {
        user: "Pammy",
        companions: 1,
      },
      {
        user: "Judye",
        companions: 1,
      },
      {
        user: "Rustin",
        companions: 1,
      },
      {
        user: "Turner",
        companions: 0,
      },
      {
        user: "Bert",
        companions: 1,
      },
      {
        user: "Boniface",
        companions: 1,
      },
      {
        user: "North",
        companions: 0,
      },
      {
        user: "Darrick",
        companions: 0,
      },
      {
        user: "Karola",
        companions: 1,
      },
      {
        user: "Chadd",
        companions: 0,
      },
      {
        user: "Mirna",
        companions: 1,
      },
      {
        user: "Karlen",
        companions: 1,
      },
    ],
    canceled: true,
  },
  {
    _id: "k7835bJHcraQDwRQE",
    title: "Erste Hilfe? Sicher!",
    description:
      "<p>Immer wieder kommt es in Notfallsituationen zu Folgeunfällen. Diese könnten meist mit einfachen Mitteln verhindert werden. Gemeinsam lernen wir die Gefahren in Notfallsituationen zu erkennen und üben aktiv Erste Hilfe Massnahmen durchzuführen, ohne uns dabei zu gefährden.</p>",
    venue: {
      name: "GZ Hönng - Lektion an der Ackersteinstrasse 198",
    },
    room: "auf der Bühne am Wümmetfäscht",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 6,
    region: "h4MnI3psRr8hSljk2",
    courseId: "DrtM86uwM4pwty3qb",
    time_lastedit: {
      $date: "2024-08-13T19:49:56.959+0000",
    },
    time_created: {
      $date: "2024-05-27T12:30:00.031+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T09:00:00.000+0000",
    },
    end: {
      $date: "2024-09-22T10:00:00.000+0000",
    },
    createdBy: "Alida",
    categories: ["misc"],
    participants: [
      {
        user: "Hilarius",
        companions: 1,
      },
      {
        user: "Elyssa",
        companions: 1,
      },
      {
        user: "Bartholomeus",
        companions: 0,
      },
      {
        user: "Sonny",
        companions: 0,
      },
    ],
  },
  {
    _id: "xbEefLus5WtfYwdj6",
    title: "Menschen mit Beeinträchtigung verstehen",
    description:
      "<p>Es werden moderierte improvisierte Szenen zum Thema Menschen mit einer Behinderung oder psychischen Beeinträchtigung  gezeigt.</p><p>Mit unserem Angebot möchten wir dazu beitragen, dass sich die Teilnehmenden besser in die Lebenswelt von Menschen mit Beeinträchtigung einfühlen können. <br /></p>",
    venue: {
      name: "Quartierhaus Kreis 6",
      _id: "EiepzsiStBi52irKW",
    },
    room: "1. Stock",
    internal: false,
    sendReminder: false,
    noRsvp: false,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Ba2YBpXjRjEW63EYk",
    time_lastedit: {
      $date: "2024-09-14T08:52:32.447+0000",
    },
    time_created: {
      $date: "2024-05-29T14:47:03.198+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T09:00:00.000+0000",
    },
    end: {
      $date: "2024-09-22T10:30:00.000+0000",
    },
    createdBy: "Carolan",
    categories: ["culture"],
    participants: [
      {
        user: "Stearne",
        companions: 0,
      },
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Alane",
        companions: 0,
      },
      {
        user: "Marsha",
        companions: 0,
      },
      {
        user: "Gus",
        companions: 0,
      },
      {
        user: "Jedidiah",
        companions: 0,
      },
    ],
  },
  {
    _id: "pq66kThrEBqEYmorv",
    title: "Bokashi - Küchenabfälle gerucharm verarbeiten",
    description:
      "<p>Bokashi ist eine sehr alte Methode, wie Küchenabfälle gerucharm vergärt werden und den Pflanzen im Garten wieder zugeführt werden können. Wir zeigen praktisch wie Bokashi geht, vergleichen 2 verschiedene Bokashi-Behälter und erklären, was beachtet werden sollte. Stinke mues es ebe nöd ;)<br /></p>",
    venue: {
      name: "Reformierte Kirche Witikon",
      _id: "CEWixAGgjv3siofA9",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 10,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Q5JWbP5ePME9kpGzk",
    time_lastedit: {
      $date: "2024-05-28T13:20:04.901+0000",
    },
    time_created: {
      $date: "2024-05-28T13:20:04.901+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T11:00:00.000+0000",
    },
    end: {
      $date: "2024-09-22T12:00:00.000+0000",
    },
    createdBy: "Codie",
    categories: ["sciences"],
    participants: [
      {
        user: "Adorne",
        companions: 0,
      },
      {
        user: "Dora",
        companions: 0,
      },
      {
        user: "Valma",
        companions: 0,
      },
      {
        user: "Hale",
        companions: 0,
      },
      {
        user: "Eyde",
        companions: 0,
      },
      {
        user: "Barbey",
        companions: 0,
      },
      {
        user: "Phillie",
        companions: 0,
      },
      {
        user: "Bili",
        companions: 1,
      },
      {
        user: "Teresina",
        companions: 0,
      },
    ],
  },
  {
    _id: "vJJGHY2itjTYGj9gf",
    title: "Handlettering",
    description:
      "<p>Ein wenig Kaligraphieren und lernen schöne Kärtchen und Sprüche zu schreiben. Nachher könnt ihr alle eure Kärtchen selber schreiben und gestalten. Es geht ums Ausprobieren, verschiedene Schriftarten zu üben und dabei Spass mit Schreiben zu haben.</p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "GZ Hottingen, Pflegiraum, Standort Klosbachstrasse 118",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 20,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qG94dYeCi5BjN6inW",
    time_lastedit: {
      $date: "2024-05-29T13:16:31.621+0000",
    },
    time_created: {
      $date: "2024-05-28T16:35:10.099+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T11:00:00.000+0000",
    },
    end: {
      $date: "2024-09-22T12:30:00.000+0000",
    },
    createdBy: "Ivette",
    categories: ["handicraft"],
    participants: [
      {
        user: "Cammi",
        companions: 0,
      },
      {
        user: "Godard",
        companions: 0,
      },
      {
        user: "Brandon",
        companions: 0,
      },
      {
        user: "Leland",
        companions: 0,
      },
      {
        user: "Conni",
        companions: 0,
      },
      {
        user: "Veronike",
        companions: 0,
      },
      {
        user: "Brynn",
        companions: 0,
      },
      {
        user: "Katti",
        companions: 0,
      },
      {
        user: "North",
        companions: 0,
      },
      {
        user: "Angelita",
        companions: 0,
      },
      {
        user: "Marsha",
        companions: 1,
      },
      {
        user: "Allene",
        companions: 0,
      },
      {
        user: "Ginelle",
        companions: 1,
      },
      {
        user: "Chrissy",
        companions: 0,
      },
      {
        user: "Dante",
        companions: 1,
      },
      {
        user: "Giffy",
        companions: 0,
      },
    ],
  },
  {
    _id: "wkq6YewTrHC8YXbDS",
    title: "Rettungsübung beim Höngger Wehr, mit SLRG Höngg",
    description:
      "<p>Jeden Sommer lassen sich mehrere tausend Gummiboote die Limmat hinunter treiben. <br />Beim Höngger Wehr wird es dann aber lebensgefährlich !<br /><br />Wir erklären das Wehr und üben gemeinsam, wie man Unfälle verhindert und wie man Personen aus der tödlichen Wasserwalze rettet. </p>",
    room: "",
    region: "h4MnI3psRr8hSljk2",
    groups: [],
    internal: false,
    sendReminder: true,
    maxParticipants: 10,
    venue: {
      name: "GZ Höngg - Lektion beim Höngger Wehr",
    },
    courseId: "Fx2TZrnPXtq2mjGKY",
    time_lastedit: {
      $date: "2024-08-13T19:49:28.161+0000",
    },
    time_created: {
      $date: "2024-04-12T19:01:22.669+0000",
    },
    start: {
      $date: "2024-09-22T11:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T12:45:00.000+0000",
    },
    createdBy: "Creight",
    categories: ["misc", "sports", "sciences"],
    noRsvp: false,
    participants: [
      {
        user: "Karry",
        companions: 0,
      },
      {
        user: "Hanny",
        companions: 0,
      },
      {
        user: "Pace",
        companions: 0,
      },
      {
        user: "Dion",
        companions: 0,
      },
      {
        user: "Anjela",
        companions: 0,
      },
      {
        user: "Guthrie",
        companions: 0,
      },
      {
        user: "Avril",
        companions: 0,
      },
      {
        user: "Cazzie",
        companions: 0,
      },
      {
        user: "Findlay",
        companions: 0,
      },
      {
        user: "Augustus",
        companions: 0,
      },
    ],
  },
  {
    _id: "zvPW68Yem2DXZv3Xx",
    title: "Einblick in die asiatische Tuschemalerei",
    description:
      "<p>Nach einer kurzen Einführung in die Welt der Tuschespuren geht es an den praktischen Teil: Mit den «vier Schätzen»  Reibstein, Stangentusche, Pinsel und Papier wagen die Teilnehmenden ihre ersten Pinselstriche in dieser fernöstlichen Maltechnik. </p>",
    venue: {
      name: "Quartiertreff Waldgarten",
      _id: "nXFsSJmHZ4gCeBGKH",
    },
    room: "",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 8,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Zm2kJPriPQuaAN595",
    time_lastedit: {
      $date: "2024-08-20T12:44:31.871+0000",
    },
    time_created: {
      $date: "2024-05-26T09:23:43.018+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T12:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T14:00:00.000+0000",
    },
    createdBy: "Yank",
    categories: ["culture"],
    participants: [
      {
        user: "Beatriz",
        companions: 0,
      },
      {
        user: "Reinaldos",
        companions: 0,
      },
      {
        user: "Sumner",
        companions: 0,
      },
      {
        user: "Othella",
        companions: 0,
      },
      {
        user: "Grange",
        companions: 0,
      },
      {
        user: "Mariya",
        companions: 1,
      },
    ],
  },
  {
    _id: "X8Pfxrbfqbp2dNjmg",
    title: "Sonntagsführung durch die Ausstellung «Wie wir lernen»",
    description:
      "<p>Als Lernmuseum zeigen wir, wie Lernen funktioniert. Welche Hilfsmittel und Strategien helfen uns? Was passiert in unserem Gehirn? Die Führung findet am Sonntag, den 22. September von 14.30 bis 15.30 Uhr im Kulturama Museum des Menschen im Quartier Hottingen statt.<br /></p>",
    venue: {
      name: "GZ Hottingen - Lektion im KULTURAMA",
    },
    room: "Treffpunkt: vor dem Haupteingang",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 36,
    region: "h4MnI3psRr8hSljk2",
    courseId: "Ycb4cP7GGbr2d4mQZ",
    time_lastedit: {
      $date: "2024-09-11T12:28:11.275+0000",
    },
    time_created: {
      $date: "2024-05-28T12:00:37.119+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T12:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T13:30:00.000+0000",
    },
    createdBy: "Chrissie",
    categories: ["sciences", "languages", "culture", "sports"],
    participants: [
      {
        user: "Godard",
        companions: 0,
      },
      {
        user: "Marc",
        companions: 0,
      },
      {
        user: "Abba",
        companions: 0,
      },
      {
        user: "Maddie",
        companions: 0,
      },
      {
        user: "Jean",
        companions: 0,
      },
      {
        user: "Giordano",
        companions: 1,
      },
      {
        user: "Edmon",
        companions: 1,
      },
      {
        user: "Wynnie",
        companions: 0,
      },
      {
        user: "Tori",
        companions: 1,
      },
      {
        user: "Kirbie",
        companions: 0,
      },
      {
        user: "Benoit",
        companions: 1,
      },
      {
        user: "Peterus",
        companions: 0,
      },
      {
        user: "Doretta",
        companions: 1,
      },
      {
        user: "Ardath",
        companions: 1,
      },
      {
        user: "Drucill",
        companions: 0,
      },
      {
        user: "Kary",
        companions: 0,
      },
      {
        user: "Jabez",
        companions: 1,
      },
      {
        user: "Durward",
        companions: 1,
      },
      {
        user: "Bili",
        companions: 0,
      },
      {
        user: "Gualterio",
        companions: 0,
      },
    ],
  },
  {
    _id: "J2KJsQKvbEERK7miu",
    title: "Ukulele für Einsteiger:innen",
    description:
      "<p>Aloha! Die Ukulele (oder Uke) bietet einen schnellen Einstieg in die Welt der Saiteninstrumente. Komm und lerne mit Karla die absoluten Grundlagen, damit du deine Lieblingssongs spielen und jedes Tutorial verstehen kannst. Bitte bringt eure eigene Ukulele mit, wenn möglich :D</p>",
    venue: {
      name: "LeLabor",
      _id: "uXHwNfdnZjun4C2yN",
    },
    room: "",
    internal: false,
    sendReminder: true,
    maxParticipants: 15,
    region: "h4MnI3psRr8hSljk2",
    courseId: "AMTbH83dza37w4jRC",
    time_lastedit: {
      $date: "2024-09-16T06:52:49.703+0000",
    },
    time_created: {
      $date: "2024-04-04T12:09:17.911+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T13:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T15:00:00.000+0000",
    },
    createdBy: "Ron",
    categories: ["culture"],
    participants: [
      {
        user: "Nanette",
        companions: 0,
      },
      {
        user: "Malchy",
        companions: 0,
      },
      {
        user: "Kale",
        companions: 0,
      },
      {
        user: "Pooh",
        companions: 0,
      },
      {
        user: "Karney",
        companions: 0,
      },
      {
        user: "Rhona",
        companions: 0,
      },
      {
        user: "Giustino",
        companions: 0,
      },
      {
        user: "Sheilakathryn",
        companions: 0,
      },
      {
        user: "Carl",
        companions: 0,
      },
      {
        user: "Dov",
        companions: 0,
      },
      {
        user: "Drucy",
        companions: 0,
      },
      {
        user: "Hall",
        companions: 0,
      },
      {
        user: "Manda",
        companions: 0,
      },
      {
        user: "Kala",
        companions: 0,
      },
      {
        user: "Aluino",
        companions: 0,
      },
    ],
    noRsvp: false,
  },
  {
    _id: "2wLeTJnBKF3rmr2Cs",
    title: "Eurythmie-Punkt-Umkreis für Erwachsene",
    description:
      "<p>Wir machen einfache erste Schritte, bewegen Formen im Wandel und können neue Räume entdecken.</p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "GZ Hottingen, Pflegiraum, Klosbachstrasse 118, 8032 ZH",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 40,
    region: "h4MnI3psRr8hSljk2",
    courseId: "qkw3JEM9HsXY7tJ3G",
    time_lastedit: {
      $date: "2024-09-12T09:34:17.824+0000",
    },
    time_created: {
      $date: "2024-05-29T12:15:48.781+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T13:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T14:30:00.000+0000",
    },
    createdBy: "Mirna",
    categories: ["sports"],
    participants: [
      {
        user: "Ondrea",
        companions: 0,
      },
      {
        user: "Jo ann",
        companions: 0,
      },
      {
        user: "Ginelle",
        companions: 0,
      },
      {
        user: "Rudd",
        companions: 0,
      },
      {
        user: "Wake",
        companions: 0,
      },
      {
        user: "Lisha",
        companions: 0,
      },
      {
        user: "Ermin",
        companions: 1,
      },
      {
        user: "Rea",
        companions: 0,
      },
      {
        user: "Paula",
        companions: 0,
      },
      {
        user: "Naomi",
        companions: 0,
      },
      {
        user: "Betta",
        companions: 0,
      },
      {
        user: "Myranda",
        companions: 0,
      },
      {
        user: "Dorice",
        companions: 0,
      },
    ],
  },
  {
    _id: "DjvswwosyEoLwt4JE",
    title: "Ayurvedische Gewürze im Alltag verwenden",
    description:
      "<p>Gewürze sind Heilmittel und haben eine Wirkung. So können sie entzündungshemmend, appetitanregend oder verdauungsfördernd sein.</p><p>Erfahre welche Wirkung Ingwer, Kurkuma, Koriander und Co.  auf deinen Körper haben und wie du sie am Besten verwendest (Kochen, Tee oder auch als natürliches Heilmittel).</p>",
    venue: {
      name: "GZ Höngg (Hurdäcker)",
      _id: "DtFKaY7pjx3MM2pgf",
    },
    room: "Saal",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 13,
    region: "h4MnI3psRr8hSljk2",
    courseId: "vhpSqZZtHaXRQj5AR",
    time_lastedit: {
      $date: "2024-08-28T06:20:35.011+0000",
    },
    time_created: {
      $date: "2024-07-08T09:54:21.691+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T14:00:00.000+0000",
    },
    end: {
      $date: "2024-09-22T15:30:00.000+0000",
    },
    createdBy: "Nerissa",
    categories: ["cooking"],
    participants: [
      {
        user: "Kirbie",
        companions: 0,
      },
      {
        user: "Anett",
        companions: 0,
      },
      {
        user: "Herbert",
        companions: 0,
      },
      {
        user: "Sula",
        companions: 0,
      },
      {
        user: "Marleah",
        companions: 0,
      },
      {
        user: "Ardenia",
        companions: 0,
      },
      {
        user: "Saraann",
        companions: 0,
      },
      {
        user: "Nadiya",
        companions: 0,
      },
      {
        user: "Kalli",
        companions: 0,
      },
      {
        user: "Germayne",
        companions: 0,
      },
    ],
  },
  {
    _id: "xXRFMTS2ToQndERJn",
    title: "Indischer Volkstanz",
    description:
      '<p>Ob du "zwei linke Füsse" hast oder ein aufstrebender professioneller Tänzer bist, du bist herzlich willkommen!</p><p>Du wirst ein unvergessliches Tanzerlebnis mit viel Energie, grossartiger indischer Musik, wunderschöner Mimik und fliessenden Bewegungen haben. Komm und tanz mit!</p>',
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "GZ Hottingen,  Standort Klosbachstrasse, Pflegiraum, Klosbachstrasse 118, 8032 Zürich",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 32,
    region: "h4MnI3psRr8hSljk2",
    courseId: "y6NxSjXCJ7qbbNFQo",
    time_lastedit: {
      $date: "2024-09-06T20:12:42.656+0000",
    },
    time_created: {
      $date: "2024-05-29T08:44:17.086+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T15:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T16:30:00.000+0000",
    },
    createdBy: "Hannie",
    categories: ["sports", "culture"],
    participants: [
      {
        user: "Saloma",
        companions: 0,
      },
      {
        user: "Shantee",
        companions: 0,
      },
      {
        user: "Sumner",
        companions: 0,
      },
      {
        user: "Janelle",
        companions: 0,
      },
      {
        user: "Chic",
        companions: 0,
      },
      {
        user: "Geordie",
        companions: 0,
      },
      {
        user: "Drugi",
        companions: 0,
      },
      {
        user: "Aguistin",
        companions: 1,
      },
      {
        user: "Jacynth",
        companions: 1,
      },
      {
        user: "Elianora",
        companions: 1,
      },
      {
        user: "Olga",
        companions: 0,
      },
      {
        user: "Kala",
        companions: 0,
      },
      {
        user: "Alyse",
        companions: 0,
      },
      {
        user: "Megan",
        companions: 0,
      },
      {
        user: "Rem",
        companions: 1,
      },
      {
        user: "Celie",
        companions: 0,
      },
      {
        user: "Julianna",
        companions: 0,
      },
      {
        user: "Elias",
        companions: 0,
      },
      {
        user: "Tomasine",
        companions: 1,
      },
      {
        user: "Zachariah",
        companions: 0,
      },
      {
        user: "Leslie",
        companions: 0,
      },
      {
        user: "Veronica",
        companions: 0,
      },
      {
        user: "Zachariah",
        companions: 0,
      },
      {
        user: "Findlay",
        companions: 0,
      },
      {
        user: "Effie",
        companions: 0,
      },
      {
        user: "Cirstoforo",
        companions: 0,
      },
    ],
  },
  {
    _id: "8QWgrsQ7udgApW6uG",
    title: "Breathwork zur Entspannung im Alltag",
    description:
      "<p>Unsere Atmung haben wir immer dabei. Bewusst eingesetzt ist sie ein wunderbares Tool um das Nervensystem schnell und einfach zu regulieren. Ich zeige dir ein paar Atemtechniken, mit denen du mit ein bisschen Üben innerhalb weniger Minuten entspannen kannst. <br /></p>",
    venue: {
      name: "GZ Hottingen (Klosbach)",
      _id: "C5PqbNBnzxjttkYhd",
    },
    room: "GZ Hottingen, Pflegiraum, Klosbachstrasse 118",
    internal: false,
    sendReminder: true,
    noRsvp: false,
    maxParticipants: 21,
    region: "h4MnI3psRr8hSljk2",
    courseId: "pPL9MZJkxBxGxipwk",
    time_lastedit: {
      $date: "2024-08-25T18:57:55.195+0000",
    },
    time_created: {
      $date: "2024-06-04T15:49:50.023+0000",
    },
    groups: [],
    start: {
      $date: "2024-09-22T17:30:00.000+0000",
    },
    end: {
      $date: "2024-09-22T18:30:00.000+0000",
    },
    createdBy: "Jourdan",
    categories: ["misc"],
    participants: [
      {
        user: "Ettie",
        companions: 0,
      },
      {
        user: "Flory",
        companions: 0,
      },
      {
        user: "Warden",
        companions: 0,
      },
      {
        user: "Barbey",
        companions: 0,
      },
      {
        user: "Sharity",
        companions: 0,
      },
      {
        user: "Ronnie",
        companions: 0,
      },
      {
        user: "Cob",
        companions: 0,
      },
      {
        user: "Lory",
        companions: 0,
      },
      {
        user: "Yurik",
        companions: 0,
      },
      {
        user: "Anett",
        companions: 0,
      },
      {
        user: "Mirna",
        companions: 0,
      },
      {
        user: "Jerry",
        companions: 0,
      },
      {
        user: "Ivan",
        companions: 1,
      },
      {
        user: "Alard",
        companions: 0,
      },
      {
        user: "Gwenneth",
        companions: 0,
      },
      {
        user: "Luella",
        companions: 0,
      },
      {
        user: "Jyoti",
        companions: 0,
      },
      {
        user: "Ivy",
        companions: 1,
      },
      {
        user: "Polly",
        companions: 0,
      },
    ],
  },
];
