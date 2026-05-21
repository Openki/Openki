/* eslint max-len: 0 */
/* these groups are used for creating test data with gourp-specific roles */

export const groups: {
  name: string;
  categories?: string[];
  tags: string[];
  organizations?: string[];
  teamOrganizations?: string[];
  createdby: string;
  description: string;
  roles: string[];
  members: {
    user: string;
    roles: string[];
    comment?: string;
  }[];
  region?: string;
  singleEvent?: boolean;
  archived?: boolean;
  comment?: string;
  internal?: boolean;
}[] = [
  {
    "Title": "Community Urban Rooftop Garden",
    "Description": "Let's transform the empty rooftop downtown into a green oasis! We want to build raised beds, set up a composting system, and grow organic vegetables and herbs together. No gardening experience required, just a passion for getting your hands dirty!",
    "Categories": ["handicraft", "gardening"],
    "Tags": ["urban-farming", "sustainability", "permaculture", "community"],
    "CreatedBy": "GreenThumbSam",
    "Roles": ["team", "host", "participant", "irrigation-expert", "carpenter", "seed-master"],
    "Members": [
      { "user": "GreenThumbSam", "roles": ["team", "host"], "comment": "Initiator and ready to build!" },
      { "user": "Anna_Plant", "roles": ["team", "seed-master"], "comment": "I can source organic heirloom seeds." },
      { "user": "BobTheBuilder", "roles": ["carpenter"], "comment": "I can help construct the wooden pallets raised beds." },
      { "user": "Chloe99", "roles": ["participant"], "comment": "Total beginner but highly motivated to water plants!" }
    ],
    "Groups": ["GreenCity-Hub"]
  },
  {
    "Title": "Open Source Neighborhood Map App",
    "Description": "We are building a privacy-friendly, open-source mobile app to map local tool-sharing boxes, free food shelters, and community spaces. We need developers, UI designers, and people to test the app in the wild.",
    "Categories": ["computer", "programming"],
    "Tags": ["javascript", "open-source", "maps", "community-tool"],
    "CreatedBy": "DevLinus",
    "Roles": ["team", "host", "participant", "frontend-lead", "backend-lead", "ui-designer", "beta-tester"],
    "Members": [
      { "user": "DevLinus", "roles": ["team", "backend-lead"], "comment": "Setting up the initial API repo." },
      { "user": "Sarah_Codes", "roles": ["team", "frontend-lead"], "comment": "I will handle the React Native setup." },
      { "user": "PixelPete", "roles": ["ui-designer"], "comment": "Can provide Figma layouts next week." }
    ],
    "Groups": ["HackForGood"]
  },
  {
    "Title": "DIY Synth and Noisebox Workshop",
    "Description": "Let's solder our own lo-fi electronic synthesizers! We will order DIY kits, share soldering irons, and learn the basics of analog circuitry to make some awesome or weird sounds.",
    "Categories": ["handicraft", "electronics"],
    "Tags": ["soldering", "diy-audio", "synth", "hardware"],
    "CreatedBy": "CircuitQueen",
    "Roles": ["team", "host", "participant", "soldering-instructor", "parts-buyer"],
    "Members": [
      { "user": "CircuitQueen", "roles": ["team", "soldering-instructor"], "comment": "I have 4 soldering irons we can use." },
      { "user": "Marc_O", "roles": ["participant", "parts-buyer"], "comment": "I can manage the bulk order from the electronics store." }
    ],
    "Groups": ["MakerSpace-Group"]
  },
  {
    "Title": "Interactive Community Mural Painting",
    "Description": "The grey concrete wall behind the community center needs some love. Let's design and paint a massive, colorful mural that represents our diverse neighborhood. Everyone can add their stroke!",
    "Categories": ["culture", "fineart"],
    "Tags": ["street-art", "mural", "painting", "cooperative"],
    "CreatedBy": "Elena_Art",
    "Roles": ["team", "host", "participant", "lead-artist", "wall-preparer", "scaffolding-safety"],
    "Members": [
      { "user": "Elena_Art", "roles": ["team", "lead-artist"], "comment": "Drafting the concept sketch this weekend." },
      { "user": "TomGrid", "roles": ["team", "wall-preparer"], "comment": "I have the primer paint and brushes ready." },
      { "user": "KidAtHeart", "roles": ["participant"], "comment": "Can I bring my kids to help color the lower parts?" }
    ],
    "Groups": ["ArtInThePark"]
  },
  {
    "Title": "Zero-Waste Cooking and Fermentation Lab",
    "Description": "Let's meet up to tackle food waste! We will collect surplus veggies from local markets and spend a Saturday afternoon fermenting, pickling, and cooking huge batches of kimchi, sauerkraut, and chutneys to share.",
    "Categories": ["culture", "cooking"],
    "Tags": ["fermentation", "zero-waste", "kimchi", "foodsharing"],
    "CreatedBy": "ChefEco",
    "Roles": ["team", "host", "participant", "kitchen-manager", "jar-collector", "recipe-guru"],
    "Members": [
      { "user": "ChefEco", "roles": ["team", "kitchen-manager"], "comment": "Organized the industrial kitchen space for Saturday." },
      { "user": "JarJarBinks", "roles": ["jar-collector"], "comment": "Bringing 40 sterilized glass jars." },
      { "user": "Lisa_K", "roles": ["team", "recipe-guru"], "comment": "Got an amazing recipe for spicy radish kimchi." }
    ],
    "Groups": ["FoodSavers"]
  },
  {
    "Title": "Local Wild Herbs Identification & Mapping",
    "Description": "We want to discover edible and medicinal wild plants growing right in our city parks and forests. We will document them and create a printed local herbal guide for neighbors.",
    "Categories": ["sciences", "biology"],
    "Tags": ["foraging", "herbs", "botany", "nature"],
    "CreatedBy": "ForestFauna",
    "Roles": ["team", "host", "participant", "botanist", "layout-designer"],
    "Members": [
      { "user": "ForestFauna", "roles": ["team", "botanist"], "comment": "I can identify most local toxic lookalikes." }
    ],
    "Groups": ["BioBlitz"]
  },
  {
    "Title": "Upcycled Fashion and Repair Café",
    "Description": "Don't throw away torn jeans or old shirts! Let's meet up with sewing machines to repair, alter, and upcycle old clothes into creative new fashion pieces. Screen-printing station included!",
    "Categories": ["handicraft", "fabric"],
    "Tags": ["upcycling", "sewing", "fashion", "repair"],
    "CreatedBy": "StitchCraft",
    "Roles": ["team", "host", "participant", "sewing-mentor", "screenprinter"],
    "Members": [
      { "user": "StitchCraft", "roles": ["team", "sewing-mentor"], "comment": "Bringing two extra sewing machines." },
      { "user": "InkMaster", "roles": ["screenprinter"], "comment": "I'll bring textile ink and custom stencils." },
      { "user": "NoobSew", "roles": ["participant"], "comment": "Need to fix a zipper, hope someone can show me how." }
    ],
    "Groups": ["EcoCreatives"]
  },
  {
    "Title": "Neighborhood Skateboard Ramp Construction",
    "Description": "The local kids need a place to skate. We have secured a small abandoned lot and want to design and construct a modular wooden mini-ramp. Looking for anyone handy with a circular saw!",
    "Categories": ["handicraft", "construction"],
    "Tags": ["skateboarding", "woodworking", "diy-ramp", "youth"],
    "CreatedBy": "OllieKing",
    "Roles": ["team", "host", "participant", "construction-lead", "material-sourcer"],
    "Members": [
      { "user": "OllieKing", "roles": ["team", "construction-lead"], "comment": "Got the blueprints ready." },
      { "user": "Woody", "roles": ["team", "material-sourcer"], "comment": "Can get cheap marine plywood from my uncle." }
    ],
    "Groups": ["SkateOrDie"]
  },
  {
    "Title": "Solar-Powered Phone Charging Bench",
    "Description": "Let's build a public wooden bench for the community garden featuring an integrated solar panel and USB ports for anyone to charge their phones using 100% clean energy.",
    "Categories": ["handicraft", "electronics"],
    "Tags": ["solar", "renewable-energy", "woodwork", "public-space"],
    "CreatedBy": "SolarPunky",
    "Roles": ["team", "host", "participant", "solar-engineer", "woodworker"],
    "Members": [
      { "user": "SolarPunky", "roles": ["team", "solar-engineer"], "comment": "I already bought the 50W solar panel and charge controller." }
    ],
    "Groups": ["GreenTech"]
  },
  {
    "Title": "Experimental Noise Orchestra",
    "Description": "No musical skills required! We are forming an orchestra using found objects, modified toys, broken instruments, and synthesizers. Let's practice improvisation and perform a chaotic live gig.",
    "Categories": ["culture", "music"],
    "Tags": ["experimental", "noise", "improvisation", "avant-garde"],
    "CreatedBy": "CaptainFeedback",
    "Roles": ["team", "host", "participant", "conductor", "recording-engineer"],
    "Members": [
      { "user": "CaptainFeedback", "roles": ["team", "conductor"], "comment": "I will bring a megaphone and contact mics." },
      { "user": "TapeLoop", "roles": ["team", "recording-engineer"], "comment": "I'll record our sessions on a 4-track cassette deck." },
      { "user": "CymbalClash", "roles": ["participant"], "comment": "I have an old oil drum we can hit." }
    ],
    "Groups": ["SubSonics"]
  },
  {
    "Title": "Zine Making and Underground Publishing",
    "Description": "Let's create a quarterly, self-published counter-culture magazine (Zine). We write articles, draw comics, make collages, and physically cut/paste everything together before photocopying it.",
    "Categories": ["culture", "literature"],
    "Tags": ["zine", "diy-publishing", "collages", "poetry"],
    "CreatedBy": "XeroxPunk",
    "Roles": ["team", "host", "participant", "editor", "layout-artist", "copy-shop-ninja"],
    "Members": [
      { "user": "XeroxPunk", "roles": ["team", "editor"], "comment": "Collecting submissions starting today!" },
      { "user": "Glued_Paper", "roles": ["layout-artist"], "comment": "I have boxes of old vintage magazines for collages." }
    ],
    "Groups": ["PressFreedom"]
  },
  {
    "Title": "Community Bicycle Repair Hub",
    "Description": "We want to open a weekly pop-up stand where people can fix their bikes for free. We share specialized tools, lubricants, patches, and teach bike owners how to maintain their gears and brakes.",
    "Categories": ["handicraft", "metalwood"],
    "Tags": ["cycling", "repair", "diy-mechanic", "mobility"],
    "CreatedBy": "SpokeSpun",
    "Roles": ["team", "host", "participant", "head-mechanic", "tool-keeper"],
    "Members": [
      { "user": "SpokeSpun", "roles": ["team", "head-mechanic"], "comment": "I have a professional bike repair stand to bring." },
      { "user": "ChainGrease", "roles": ["team", "tool-keeper"], "comment": "I will manage the community toolbox." }
    ],
    "Groups": ["Velorution"]
  },
  {
    "Title": "Neighborhood Oral History Podcast",
    "Description": "Every senior in our quarter has incredible stories about how this city used to be. Let's grab field recorders, interview our elderly neighbors, and produce a beautiful local history podcast.",
    "Categories": ["humanities", "history"],
    "Tags": ["podcast", "storytelling", "audio-editing", "intergenerational"],
    "CreatedBy": "AudioHistorian",
    "Roles": ["team", "host", "participant", "interviewer", "audio-editor", "sound-designer"],
    "Members": [
      { "user": "AudioHistorian", "roles": ["team", "interviewer"], "comment": "I already have a list of three grandmas willing to talk!" },
      { "user": "CutMasterFlex", "roles": ["audio-editor"], "comment": "I use Audacity and can edit the episodes." }
    ],
    "Groups": ["VoiceOfTheStreet"]
  },
  {
    "Title": "Guerrilla Seed Bombing Action Force",
    "Description": "Tired of depressing industrial concrete patches? Let's bake hundreds of seed bombs out of clay, compost, and native wildflower seeds, then bike around the city to green up neglected spaces.",
    "Categories": ["misc", "ecology"],
    "Tags": ["guerrilla-gardening", "wildflowers", "bees", "activism"],
    "CreatedBy": "ClayThrower",
    "Roles": ["team", "host", "participant", "clay-sourcer", "route-mapper"],
    "Members": [
      { "user": "ClayThrower", "roles": ["team", "route-mapper"], "comment": "Mapping out gray zones in the industrial area right now." }
    ],
    "Groups": ["GreenGuerrillas"]
  },
  {
    "Title": "Giant DIY Telescope Building",
    "Description": "We want to see Saturn's rings! Let's team up to build a high-performance Dobsonian telescope from scratch, including grinding and polishing our own primary mirror. It's a long project, but worth it.",
    "Categories": ["sciences", "physics"],
    "Tags": ["astronomy", "telescope", "diy-science", "optics"],
    "CreatedBy": "StarGazerMax",
    "Roles": ["team", "host", "participant", "mirror-grinder", "wood-machinist"],
    "Members": [
      { "user": "StarGazerMax", "roles": ["team", "mirror-grinder"], "comment": "Ordered the glass blank and silicon carbide grit!" }
    ],
    "Groups": ["CosmosClub"]
  },
  {
    "Title": "Linux Migration Party for Seniors",
    "Description": "Let's help older folks revive their slow, old laptops! We'll set up a weekend event where we install lightweight Linux distributions (like Mint or Ubuntu) and show them how to securely browse the web.",
    "Categories": ["computer", "operating"],
    "Tags": ["linux", "open-source", "digital-inclusion", "hardware-revival"],
    "CreatedBy": "TuxFriend",
    "Roles": ["team", "host", "participant", "usb-installer-maker", "patience-guru"],
    "Members": [
      { "user": "TuxFriend", "roles": ["team", "usb-installer-maker"], "comment": "Flashing 10 USB drives with Linux Mint." },
      { "user": "KindSoul", "roles": ["team", "patience-guru"], "comment": "I love explaining tech slowly to grandparents." }
    ],
    "Groups": ["LinuxForAll"]
  },
  {
    "Title": "Community Theatre Puppet Show",
    "Description": "We want to write, build puppets for, and perform a satirical political puppet show at the upcoming street festival. We need scriptwriters, puppet makers (papier-mâché), and dramatic voice actors!",
    "Categories": ["culture", "theatre"],
    "Tags": ["puppetry", "satire", "acting", "crafting"],
    "CreatedBy": "PuppetMaster",
    "Roles": ["team", "host", "participant", "scriptwriter", "puppet-builder", "puppeteer"],
    "Members": [
      { "user": "PuppetMaster", "roles": ["team", "puppet-builder"], "comment": "I have tons of old newspapers and glue ready." },
      { "user": "DramaQueen", "roles": ["team", "scriptwriter"], "comment": "Working on a funny script about local rent prices." },
      { "user": "VoiceGuy", "roles": ["puppeteer"], "comment": "Can do 5 different funny voices!" }
    ],
    "Groups": ["BackstageChaos"]
  },
  {
    "Title": "Pin-Hole Camera and Darkroom Experiment",
    "Description": "Let's build working cameras out of simple shoe boxes and coffee cans. Then we will transform a bathroom into a temporary darkroom to develop our own black-and-white analog photos using safe chemicals.",
    "Categories": ["culture", "photography"],
    "Tags": ["pinhole", "analog-photography", "darkroom", "diy-chemistry"],
    "CreatedBy": "SilverHalide",
    "Roles": ["team", "host", "participant", "darkroom-safety", "chemical-mixer"],
    "Members": [
      { "user": "SilverHalide", "roles": ["team", "chemical-mixer"], "comment": "Sourcing the photo-paper and developers." }
    ],
    "Groups": ["ShutterBugs"]
  },
  {
    "Title": "Public Park Parkour and Calisthenics Rack",
    "Description": "We want to design a custom outdoor calisthenics pull-up rack and get permission from the city council to build it in the public park. We need structural drawings and sport enthusiasts to lobby for it.",
    "Categories": ["sports", "teamsport"],
    "Tags": ["calisthenics", "parkour", "fitness", "urban-design"],
    "CreatedBy": "BarBrotherFly",
    "Roles": ["team", "host", "participant", "cad-designer", "city-council-liaison"],
    "Members": [],
    "Groups": ["StreetWorkout"]
  },
  {
    "Title": "Cryptoparty and Digital Self-Defense",
    "Description": "Let's teach each other how to protect our digital lives. In this collaborative project, we will set up PGP email encryption, install Signal, configure Password Managers, and discuss metadata privacy.",
    "Categories": ["computer", "internet"],
    "Tags": ["privacy", "encryption", "security", "digital-rights"],
    "CreatedBy": "CypherPunk99",
    "Roles": ["team", "host", "participant", "crypto-mentor", "snack-provider"],
    "Members": [],
    "Groups": ["PrivacyNow"]
  }
]
