/* eslint max-len: 0 */
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
      {
        user: "GreenThumbSam",
        roles: ["team", "host"],
        comment: "Initiator and ready to build!",
      },
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
    organizations: ["GreenCity-Hub"],
    region: "Rolistan",
    internal: true,
  },
  {
    name: "Open Source Neighborhood Map App",
    description:
      "We are building a privacy-friendly, open-source mobile app to map local tool-sharing boxes, free food shelters, and community spaces.",
    categories: ["computer", "programming"],
    tags: ["javascript", "open-source", "maps", "community-tool"],
    createdby: "DevLinus",
    roles: ["team", "host", "participant", "frontend-lead", "backend-lead", "ui-designer"],
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
    organizations: ["HackForGood"],
    region: "Rolistan",
    internal: true,
  },
  {
    name: "DIY Synth and Noisebox Workshop",
    description:
      "Let's solder our own lo-fi electronic synthesizers and learn the basics of analog circuitry.",
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
        comment: "I can manage the bulk order.",
      },
    ],
    organizations: ["MakerSpace-Group"],
    region: "Rolistan",
    singleEvent: true,
  },
  {
    name: "Interactive Community Mural Painting",
    description:
      "Let's design and paint a massive, colorful mural that represents our diverse neighborhood.",
    categories: ["culture", "fineart"],
    tags: ["street-art", "mural", "painting", "cooperative"],
    createdby: "Elena_Art",
    roles: ["team", "host", "participant", "lead-artist", "wall-preparer"],
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
    organizations: ["ArtInThePark"],
    region: "Rolistan",
  },
  {
    name: "Zero-Waste Cooking and Fermentation Lab",
    description:
      "We will collect surplus veggies from local markets and spend a Saturday fermenting and cooking together.",
    categories: ["culture", "cooking"],
    tags: ["fermentation", "zero-waste", "kimchi", "foodsharing"],
    createdby: "ChefEco",
    roles: ["team", "host", "participant", "kitchen-manager", "jar-collector"],
    members: [
      {
        user: "ChefEco",
        roles: ["team", "kitchen-manager"],
        comment: "Organized the industrial kitchen space.",
      },
      {
        user: "JarJarBinks",
        roles: ["jar-collector"],
        comment: "Bringing 40 sterilized glass jars.",
      },
    ],
    organizations: ["FoodSavers"],
    region: "Rolistan",
    singleEvent: true,
  },
  {
    name: "Local Wild Herbs Identification & Mapping",
    description:
      "We want to discover edible and medicinal wild plants growing right in our city parks and forests.",
    categories: ["sciences", "biology"],
    tags: ["foraging", "herbs", "botany", "nature"],
    createdby: "ForestFauna",
    roles: ["team", "host", "participant", "botanist"],
    members: [
      {
        user: "ForestFauna",
        roles: ["team", "botanist"],
        comment: "I can identify most local toxic lookalikes.",
      },
    ],
    organizations: ["BioBlitz"],
    region: "Rolistan",
  },
  {
    name: "Upcycled Fashion and Repair Café",
    description:
      "Let's meet up with sewing machines to repair, alter, and upcycle old clothes into creative new fashion pieces.",
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
    ],
    organizations: ["EcoCreatives"],
    region: "Rolistan",
  },
  {
    name: "Neighborhood Skateboard Ramp Construction",
    description:
      "We have secured a small abandoned lot and want to construct a modular wooden mini-ramp.",
    categories: ["handicraft", "construction"],
    tags: ["skateboarding", "woodworking", "diy-ramp", "youth"],
    createdby: "OllieKing",
    roles: ["team", "host", "participant", "construction-lead"],
    members: [
      {
        user: "OllieKing",
        roles: ["team", "construction-lead"],
        comment: "Got the blueprints ready.",
      },
      {
        user: "Woody",
        roles: ["team"],
        comment: "Can get cheap marine plywood.",
      },
    ],
    organizations: ["SkateOrDie"],
    region: "Rolistan",
  },
  {
    name: "Solar-Powered Phone Charging Bench",
    description:
      "Let's build a public wooden bench featuring an integrated solar panel and USB ports.",
    categories: ["handicraft", "electronics"],
    tags: ["solar", "renewable-energy", "woodwork", "public-space"],
    createdby: "SolarPunky",
    roles: ["team", "host", "participant", "solar-engineer", "woodworker"],
    members: [
      {
        user: "SolarPunky",
        roles: ["team", "solar-engineer"],
        comment: "Already bought the solar panel and charge controller.",
      },
    ],
    organizations: ["GreenTech"],
    region: "Rolistan",
  },
  {
    name: "Experimental Noise Orchestra",
    description:
      "We are forming an orchestra using found objects, modified toys, and synthesizers.",
    categories: ["culture", "music"],
    tags: ["experimental", "noise", "improvisation", "avant-garde"],
    createdby: "CaptainFeedback",
    roles: ["team", "host", "participant", "conductor"],
    members: [
      {
        user: "CaptainFeedback",
        roles: ["team", "conductor"],
        comment: "I will bring a megaphone and contact mics.",
      },
      {
        user: "TapeLoop",
        roles: ["team"],
        comment: "I'll record our sessions.",
      },
    ],
    organizations: ["SubSonics"],
    region: "Rolistan",
  },
  {
    name: "Zine Making and Underground Publishing",
    description:
      "Let's create a quarterly self-published counter-culture magazine.",
    categories: ["culture", "literature"],
    tags: ["zine", "diy-publishing", "collages", "poetry"],
    createdby: "XeroxPunk",
    roles: ["team", "host", "participant", "editor", "layout-artist"],
    members: [
      {
        user: "XeroxPunk",
        roles: ["team", "editor"],
        comment: "Collecting submissions starting today!",
      },
      {
        user: "Glued_Paper",
        roles: ["layout-artist"],
        comment: "I have boxes of old magazines for collages.",
      },
    ],
    organizations: ["PressFreedom"],
    region: "Rolistan",
    archived: true,
  },
  {
    name: "Community Bicycle Repair Hub",
    description:
      "We want to open a weekly pop-up stand where people can fix their bikes for free.",
    categories: ["handicraft", "metalwood"],
    tags: ["cycling", "repair", "diy-mechanic", "mobility"],
    createdby: "SpokeSpun",
    roles: ["team", "host", "participant", "head-mechanic", "tool-keeper"],
    members: [
      {
        user: "SpokeSpun",
        roles: ["team", "head-mechanic"],
        comment: "I have a professional bike repair stand.",
      },
      {
        user: "ChainGrease",
        roles: ["team", "tool-keeper"],
        comment: "I will manage the toolbox.",
      },
    ],
    organizations: ["Velorution"],
    region: "Rolistan",
  }
];
