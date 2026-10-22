/* these groups are used for creating test data with group-specific roles */

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
    name: "Community Urban Rooftop Garden",
    description:
      "Let's transform the empty rooftop downtown into a green oasis! We want to build raised beds, set up a composting system, and grow organic vegetables and herbs together. No gardening experience required, just a passion for getting your hands dirty!",
    categories: ["handicraft", "gardening"],
    tags: ["urban-farming", "sustainability", "permaculture", "community"],
    createdby: "GreenThumbSam",
    roles: ["team", "host", "participant", "irrigation-expert", "carpenter", "seed-master"],
    members: [
      { user: "GreenThumbSam", roles: ["team", "host"], comment: "Initiator and ready to build!" },
      {
        user: "Anna_Plant",
        roles: ["team", "seed-master"],
        comment: "I can source organic heirloom seeds.",
      },
      {
        user: "BobTheBuilder",
        roles: ["carpenter"],
        comment: "I can help construct the wooden pallets raised beds.",
      },
      {
        user: "Chloe99",
        roles: ["participant"],
        comment: "Total beginner but highly motivated to water plants!",
      },
    ],
    teamOrganizations: ["GreenCity-Hub"],
    region: "Rolistan",
    internal: true,
  },
  {
    name: "Open Source Neighborhood Map App",
    description:
      "We are building a privacy-friendly, open-source mobile app to map local tool-sharing boxes, free food shelters, and community spaces. We need developers, UI designers, and people to test the app in the wild.",
    categories: ["computer", "programming"],
    tags: ["javascript", "open-source", "maps", "community-tool"],
    createdby: "DevLinus",
    roles: [
      "team",
      "host",
      "participant",
      "frontend-lead",
      "backend-lead",
      "ui-designer",
      "beta-tester",
    ],
    members: [
      {
        user: "DevLinus",
        roles: ["team", "backend-lead"],
        comment: "Setting up the initial API repo.",
      },
      {
        user: "Sarah_Codes",
        roles: ["team", "frontend-lead"],
        comment: "I will handle the React Native setup.",
      },
      {
        user: "PixelPete",
        roles: ["ui-designer"],
        comment: "Can provide Figma layouts next week.",
      },
    ],
    teamOrganizations: ["HackForGood"],
    region: "Rolistan",
    internal: true,
  },
  {
    name: "DIY Synth and Noisebox Workshop",
    description:
      "Let's solder our own lo-fi electronic synthesizers! We will order DIY kits, share soldering irons, and learn the basics of analog circuitry to make some awesome or weird sounds.",
    categories: ["handicraft", "electronics"],
    tags: ["soldering", "diy-audio", "synth", "hardware"],
    createdby: "CircuitQueen",
    roles: ["team", "host", "participant", "soldering-instructor", "parts-buyer"],
    members: [
      {
        user: "CircuitQueen",
        roles: ["team", "soldering-instructor"],
        comment: "I have 4 soldering irons we can use.",
      },
      {
        user: "Marc_O",
        roles: ["participant", "parts-buyer"],
        comment: "I can manage the bulk order from the electronics store.",
      },
    ],
    teamOrganizations: ["MakerSpace-Group"],
    region: "Rolistan",
    archived: true,
  },
  {
    name: "Interactive Community Mural Painting",
    description:
      "The grey concrete wall behind the community center needs some love. Let's design and paint a massive, colorful mural that represents our diverse neighborhood. Everyone can add their stroke!",
    categories: ["culture", "fineart"],
    tags: ["street-art", "mural", "painting", "cooperative"],
    createdby: "Elena_Art",
    roles: ["team", "host", "participant", "lead-artist", "wall-preparer", "scaffolding-safety"],
    members: [
      {
        user: "Elena_Art",
        roles: ["team", "lead-artist"],
        comment: "Drafting the concept sketch this weekend.",
      },
      {
        user: "TomGrid",
        roles: ["team", "wall-preparer"],
        comment: "I have the primer paint and brushes ready.",
      },
      {
        user: "KidAtHeart",
        roles: ["participant"],
        comment: "Can I bring my kids to help color the lower parts?",
      },
    ],
    teamOrganizations: ["ArtInThePark"],
    region: "Rolistan",
    singleEvent: true,
  },
  {
    name: "Zero-Waste Cooking and Fermentation Lab",
    description:
      "Let's meet up to tackle food waste! We will collect surplus veggies from local markets and spend a Saturday afternoon fermenting, pickling, and cooking huge batches of kimchi, sauerkraut, and chutneys to share.",
    categories: ["culture", "cooking"],
    tags: ["fermentation", "zero-waste", "kimchi", "foodsharing"],
    createdby: "ChefEco",
    roles: ["team", "host", "participant", "kitchen-manager", "jar-collector", "recipe-guru"],
    members: [
      {
        user: "ChefEco",
        roles: ["team", "kitchen-manager"],
        comment: "Organized the industrial kitchen space for Saturday.",
      },
      {
        user: "JarJarBinks",
        roles: ["jar-collector"],
        comment: "Bringing 40 sterilized glass jars.",
      },
      {
        user: "Lisa_K",
        roles: ["team", "recipe-guru"],
        comment: "Got an amazing recipe for spicy radish kimchi.",
      },
    ],
    teamOrganizations: ["FoodSavers"],
    region: "Rolistan",
    singleEvent: true,
  },
  {
    name: "Local Wild Herbs Identification & Mapping",
    description:
      "We want to discover edible and medicinal wild plants growing right in our city parks and forests. We will document them and create a printed local herbal guide for neighbors.",
    categories: ["sciences", "biology"],
    tags: ["foraging", "herbs", "botany", "nature"],
    createdby: "ForestFauna",
    roles: ["team", "host", "participant", "botanist", "layout-designer"],
    members: [
      {
        user: "ForestFauna",
        roles: ["team", "botanist"],
        comment: "I can identify most local toxic lookalikes.",
      },
    ],
    teamOrganizations: ["BioBlitz"],
    region: "Rolistan",
  },
  {
    name: "Upcycled Fashion and Repair Café",
    description:
      "Don't throw away torn jeans or old shirts! Let's meet up with sewing machines to repair, alter, and upcycle old clothes into creative new fashion pieces. Screen-printing station included!",
    categories: ["handicraft", "fabric"],
    tags: ["upcycling", "sewing", "fashion", "repair"],
    createdby: "StitchCraft",
    roles: ["team", "host", "participant", "sewing-mentor", "screenprinter"],
    members: [
      {
        user: "StitchCraft",
        roles: ["team", "sewing-mentor"],
        comment: "Bringing two extra sewing machines.",
      },
      {
        user: "InkMaster",
        roles: ["screenprinter"],
        comment: "I'll bring textile ink and custom stencils.",
      },
      {
        user: "NoobSew",
        roles: ["participant"],
        comment: "Need to fix a zipper, hope someone can show me how.",
      },
    ],
    teamOrganizations: ["EcoCreatives"],
    region: "Rolistan",
  },
  {
    name: "Neighborhood Skateboard Ramp Construction",
    description:
      "The local kids need a place to skate. We have secured a small abandoned lot and want to design and construct a modular wooden mini-ramp. Looking for anyone handy with a circular saw!",
    categories: ["handicraft", "construction"],
    tags: ["skateboarding", "woodworking", "diy-ramp", "youth"],
    createdby: "OllieKing",
    roles: ["team", "host", "participant", "construction-lead", "material-sourcer"],
    members: [
      {
        user: "OllieKing",
        roles: ["team", "construction-lead"],
        comment: "Got the blueprints ready.",
      },
      {
        user: "Woody",
        roles: ["team", "material-sourcer"],
        comment: "Can get cheap marine plywood from my uncle.",
      },
    ],
    teamOrganizations: ["SkateOrDie"],
    region: "Rolistan",
  },
  {
    name: "Solar-Powered Phone Charging Bench",
    description:
      "Let's build a public wooden bench for the community garden featuring an integrated solar panel and USB ports for anyone to charge their phones using 100% clean energy.",
    categories: ["handicraft", "electronics"],
    tags: ["solar", "renewable-energy", "woodwork", "public-space"],
    createdby: "SolarPunky",
    roles: ["team", "host", "participant", "solar-engineer", "woodworker"],
    members: [
      {
        user: "SolarPunky",
        roles: ["team", "solar-engineer"],
        comment: "I already bought the 50W solar panel and charge controller.",
      },
    ],
    teamOrganizations: ["GreenTech"],
    region: "Rolistan",
  },
  {
    name: "Experimental Noise Orchestra",
    description:
      "No musical skills required! We are forming an orchestra using found objects, modified toys, broken instruments, and synthesizers. Let's practice improvisation and perform a chaotic live gig.",
    categories: ["culture", "music"],
    tags: ["experimental", "noise", "improvisation", "avant-garde"],
    createdby: "CaptainFeedback",
    roles: ["team", "host", "participant", "conductor", "recording-engineer"],
    members: [
      {
        user: "CaptainFeedback",
        roles: ["team", "conductor"],
        comment: "I will bring a megaphone and contact mics.",
      },
      {
        user: "TapeLoop",
        roles: ["team", "recording-engineer"],
        comment: "I'll record our sessions on a 4-track cassette deck.",
      },
      {
        user: "CymbalClash",
        roles: ["participant"],
        comment: "I have an old oil drum we can hit.",
      },
    ],
    teamOrganizations: ["SubSonics"],
    region: "Rolistan",
  },
  {
    name: "Zine Making and Underground Publishing",
    description:
      "Let's create a quarterly, self-published counter-culture magazine (Zine). We write articles, draw comics, make collages, and physically cut/paste everything together before photocopying it.",
    categories: ["culture", "literature"],
    tags: ["zine", "diy-publishing", "collages", "poetry"],
    createdby: "XeroxPunk",
    roles: ["team", "host", "participant", "editor", "layout-artist", "copy-shop-ninja"],
    members: [
      {
        user: "XeroxPunk",
        roles: ["team", "editor"],
        comment: "Collecting submissions starting today!",
      },
      {
        user: "Glued_Paper",
        roles: ["layout-artist"],
        comment: "I have boxes of old vintage magazines for collages.",
      },
    ],
    teamOrganizations: ["PressFreedom"],
    region: "Rolistan",
  },
  {
    name: "Community Bicycle Repair Hub",
    description:
      "We want to open a weekly pop-up stand where people can fix their bikes for free. We share specialized tools, lubricants, patches, and teach bike owners how to maintain their gears and brakes.",
    categories: ["handicraft", "metalwood"],
    tags: ["cycling", "repair", "diy-mechanic", "mobility"],
    createdby: "SpokeSpun",
    roles: ["team", "host", "participant", "head-mechanic", "tool-keeper"],
    members: [
      {
        user: "SpokeSpun",
        roles: ["team", "head-mechanic"],
        comment: "I have a professional bike repair stand to bring.",
      },
      {
        user: "ChainGrease",
        roles: ["team", "tool-keeper"],
        comment: "I will manage the community toolbox.",
      },
    ],
    teamOrganizations: ["Velorution"],
    region: "Rolistan",
  },
  {
    name: "Neighborhood Oral History Podcast",
    description:
      "Every senior in our quarter has incredible stories about how this city used to be. Let's grab field recorders, interview our elderly neighbors, and produce a beautiful local history podcast.",
    categories: ["humanities", "history"],
    tags: ["podcast", "storytelling", "audio-editing", "intergenerational"],
    createdby: "AudioHistorian",
    roles: ["team", "host", "participant", "interviewer", "audio-editor", "sound-designer"],
    members: [
      {
        user: "AudioHistorian",
        roles: ["team", "interviewer"],
        comment: "I already have a list of three grandmas willing to talk!",
      },
      {
        user: "CutMasterFlex",
        roles: ["audio-editor"],
        comment: "I use Audacity and can edit the episodes.",
      },
    ],
    teamOrganizations: ["VoiceOfTheStreet"],
    region: "Rolistan",
  },
  {
    name: "Guerrilla Seed Bombing Action Force",
    description:
      "Tired of depressing industrial concrete patches? Let's bake hundreds of seed bombs out of clay, compost, and native wildflower seeds, then bike around the city to green up neglected spaces.",
    categories: ["misc", "ecology"],
    tags: ["guerrilla-gardening", "wildflowers", "bees", "activism"],
    createdby: "ClayThrower",
    roles: ["team", "host", "participant", "clay-sourcer", "route-mapper"],
    members: [
      {
        user: "ClayThrower",
        roles: ["team", "route-mapper"],
        comment: "Mapping out gray zones in the industrial area right now.",
      },
    ],
    teamOrganizations: ["GreenGuerrillas"],
    region: "Rolistan",
  },
  {
    name: "Giant DIY Telescope Building",
    description:
      "We want to see Saturn's rings! Let's team up to build a high-performance Dobsonian telescope from scratch, including grinding and polishing our own primary mirror. It's a long project, but worth it.",
    categories: ["sciences", "physics"],
    tags: ["astronomy", "telescope", "diy-science", "optics"],
    createdby: "StarGazerMax",
    roles: ["team", "host", "participant", "mirror-grinder", "wood-machinist"],
    members: [
      {
        user: "StarGazerMax",
        roles: ["team", "mirror-grinder"],
        comment: "Ordered the glass blank and silicon carbide grit!",
      },
    ],
    teamOrganizations: ["CosmosClub"],
    region: "Rolistan",
  },
  {
    name: "Linux Migration Party for Seniors",
    description:
      "Let's help older folks revive their slow, old laptops! We'll set up a weekend event where we install lightweight Linux distributions (like Mint or Ubuntu) and show them how to securely browse the web.",
    categories: ["computer", "operating"],
    tags: ["linux", "open-source", "digital-inclusion", "hardware-revival"],
    createdby: "TuxFriend",
    roles: ["team", "host", "participant", "usb-installer-maker", "patience-guru"],
    members: [
      {
        user: "TuxFriend",
        roles: ["team", "usb-installer-maker"],
        comment: "Flashing 10 USB drives with Linux Mint.",
      },
      {
        user: "KindSoul",
        roles: ["team", "patience-guru"],
        comment: "I love explaining tech slowly to grandparents.",
      },
    ],
    teamOrganizations: ["LinuxForAll"],
    region: "Rolistan",
  },
  {
    name: "Community Theatre Puppet Show",
    description:
      "We want to write, build puppets for, and perform a satirical political puppet show at the upcoming street festival. We need scriptwriters, puppet makers (papier-mâché), and dramatic voice actors!",
    categories: ["culture", "theatre"],
    tags: ["puppetry", "satire", "acting", "crafting"],
    createdby: "PuppetMaster",
    roles: ["team", "host", "participant", "scriptwriter", "puppet-builder", "puppeteer"],
    members: [
      {
        user: "PuppetMaster",
        roles: ["team", "puppet-builder"],
        comment: "I have tons of old newspapers and glue ready.",
      },
      {
        user: "DramaQueen",
        roles: ["team", "scriptwriter"],
        comment: "Working on a funny script about local rent prices.",
      },
      { user: "VoiceGuy", roles: ["puppeteer"], comment: "Can do 5 different funny voices!" },
    ],
    teamOrganizations: ["BackstageChaos"],
    region: "Rolistan",
  },
  {
    name: "Pin-Hole Camera and Darkroom Experiment",
    description:
      "Let's build working cameras out of simple shoe boxes and coffee cans. Then we will transform a bathroom into a temporary darkroom to develop our own black-and-white analog photos using safe chemicals.",
    categories: ["culture", "photography"],
    tags: ["pinhole", "analog-photography", "darkroom", "diy-chemistry"],
    createdby: "SilverHalide",
    roles: ["team", "host", "participant", "darkroom-safety", "chemical-mixer"],
    members: [
      {
        user: "SilverHalide",
        roles: ["team", "chemical-mixer"],
        comment: "Sourcing the photo-paper and developers.",
      },
    ],
    teamOrganizations: ["ShutterBugs"],
    region: "Rolistan",
  },
  {
    name: "Public Park Parkour and Calisthenics Rack",
    description:
      "We want to design a custom outdoor calisthenics pull-up rack and get permission from the city council to build it in the public park. We need structural drawings and sport enthusiasts to lobby for it.",
    categories: ["sports", "teamsport"],
    tags: ["calisthenics", "parkour", "fitness", "urban-design"],
    createdby: "BarBrotherFly",
    roles: ["team", "host", "participant", "cad-designer", "city-council-liaison"],
    members: [],
    teamOrganizations: ["StreetWorkout"],
    region: "Rolistan",
  },
  {
    name: "Cryptoparty and Digital Self-Defense",
    description:
      "Let's teach each other how to protect our digital lives. In this collaborative project, we will set up PGP email encryption, install Signal, configure Password Managers, and discuss metadata privacy.",
    categories: ["computer", "internet"],
    tags: ["privacy", "encryption", "security", "digital-rights"],
    createdby: "CypherPunk99",
    roles: ["team", "host", "participant", "crypto-mentor", "snack-provider"],
    members: [],
    teamOrganizations: ["PrivacyNow"],
    region: "Rolistan",
  },
];
