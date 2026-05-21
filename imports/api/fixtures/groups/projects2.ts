/* eslint max-len: 0 */

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
      "name": "Community Urban Rooftop Garden",
      "categories": ["handicraft", "gardening"],
      "tags": ["urban-farming", "sustainability", "permaculture", "community"],
      organizations: ["GreenCity-Hub"],
      "createdby": "GreenThumbSam",
      "description": "Let's transform the empty rooftop downtown into a green oasis! We want to build raised beds, set up a composting system, and grow organic vegetables and herbs together. No gardening experience required, just a passion for getting your hands dirty and building a sustainable green neighborhood ecosystem.",
      "roles": ["team", "host", "participant", "builder", "expert", "coordinator"],
      "members": [
        { "user": "GreenThumbSam", "roles": ["team", "host"], "comment": "Initiator and ready to build!" },
        { "user": "Anna_Plant", "roles": ["team", "expert"], "comment": "I can source organic heirloom seeds." },
        { "user": "BobTheBuilder", "roles": ["builder"], "comment": "I can help construct the wooden pallets raised beds." },
        { "user": "Chloe99", "roles": ["participant"], "comment": "Total beginner but highly motivated to water plants!" },
        { "user": "Dave_Urban", "roles": ["participant"] },
        { "user": "Emma_Green", "roles": ["participant"] },
        { "user": "Frankie", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Open Source Neighborhood Map App",
      "categories": ["computer", "programming"],
      "tags": ["javascript", "open-source", "maps", "community-tool"],
      organizations: ["HackForGood"],
      "createdby": "DevLinus",
      "description": "We are building a privacy-friendly, open-source mobile app to map local tool-sharing boxes, free food shelters, and community spaces. We need frontend and backend developers, UI designers, and motivated locals to test the app in the wild. Let's make local resources visible to everyone!",
      "roles": ["team", "host", "participant", "developer", "designer", "tester"],
      "members": [
        { "user": "DevLinus", "roles": ["team", "developer"], "comment": "Setting up the initial API repo." },
        { "user": "Sarah_Codes", "roles": ["team", "developer"], "comment": "I will handle the React Native setup." },
        { "user": "PixelPete", "roles": ["designer"], "comment": "Can provide Figma layouts next week." },
        { "user": "UserA", "roles": ["participant"] },
        { "user": "UserB", "roles": ["participant"] },
        { "user": "UserC", "roles": ["participant"] },
        { "user": "UserD", "roles": ["tester"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "DIY Synth and Noisebox Workshop",
      "categories": ["handicraft", "electronics"],
      "tags": ["soldering", "diy-audio", "synth", "hardware"],
      organizations: ["MakerSpace-Group"],
      "createdby": "CircuitQueen",
      "description": "Let's solder our own lo-fi electronic synthesizers! We will order custom DIY kits, share soldering irons, and learn the basics of analog circuitry to make some awesome or weird sounds. No engineering degree needed, we guide you step by step.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "CircuitQueen", "roles": ["team", "instructor"], "comment": "I have 4 soldering irons we can use." },
        { "user": "Marc_O", "roles": ["participant", "coordinator"], "comment": "I can manage the bulk order from the electronics store." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Interactive Community Mural Painting",
      "categories": ["culture", "fineart"],
      "tags": ["street-art", "mural", "painting", "cooperative"],
      organizations: ["ArtInThePark"],
      "createdby": "Elena_Art",
      "description": "The grey concrete wall behind the community center needs some love. Let's design and paint a massive, colorful mural that represents our diverse neighborhood. Everyone can add their stroke, paint with brushes, or help prepare the surface.",
      "roles": ["team", "host", "participant", "artist", "builder"],
      "members": [
        { "user": "Elena_Art", "roles": ["team", "artist"], "comment": "Drafting the concept sketch this weekend." },
        { "user": "TomGrid", "roles": ["team", "builder"], "comment": "I have the primer paint and brushes ready." },
        { "user": "KidAtHeart", "roles": ["participant"], "comment": "Can I bring my kids to help color the lower parts?" }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Zero-Waste Cooking and Fermentation Lab",
      "categories": ["culture", "cooking"],
      "tags": ["fermentation", "zero-waste", "kimchi", "foodsharing"],
      organizations: ["Foodsaving.de"],
      "createdby": "ChefEco",
      "description": "Let's meet up to tackle food waste! We will collect surplus vegetables from local markets and spend a Saturday afternoon fermenting, pickling, and cooking huge batches of kimchi, sauerkraut, and chutneys to share among participants and neighbors.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "ChefEco", "roles": ["team", "instructor"], "comment": "Organized the industrial kitchen space for Saturday." },
        { "user": "JarJarBinks", "roles": ["coordinator"], "comment": "Bringing 40 sterilized glass jars." },
        { "user": "Lisa_K", "roles": ["team", "participant"], "comment": "Got an amazing recipe for spicy radish kimchi." },
        { "user": "Alice", "roles": ["participant"] },
        { "user": "Kevin", "roles": ["participant"] },
        { "user": "Melanie", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Local Wild Herbs Identification & Mapping",
      "categories": ["sciences", "biology"],
      "tags": ["foraging", "herbs", "botany", "nature"],
      organizations: ["BioBlitz"],
      "createdby": "ForestFauna",
      "description": "We want to discover edible and medicinal wild plants growing right in our city parks and forests. We will document them using cameras, map their locations, and create a printed local herbal guide for neighbors.",
      "roles": ["team", "host", "participant", "expert", "designer"],
      "members": [
        { "user": "ForestFauna", "roles": ["team", "expert"], "comment": "I can identify most local toxic lookalikes." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Upcycled Fashion and Repair Cafe",
      "categories": ["handicraft", "fabric"],
      "tags": ["upcycling", "sewing", "fashion", "repair"],
      organizations: ["EcoCreatives"],
      "createdby": "StitchCraft",
      "description": "Don't throw away torn jeans or old shirts! Let's meet up with sewing machines to repair, alter, and upcycle old clothes into creative new fashion pieces. Screen-printing station included!",
      "roles": ["team", "host", "participant", "instructor", "expert"],
      "members": [
        { "user": "StitchCraft", "roles": ["team", "instructor"], "comment": "Bringing two extra sewing machines." },
        { "user": "InkMaster", "roles": ["expert"], "comment": "I'll bring textile ink and custom stencils." },
        { "user": "NoobSew", "roles": ["participant"], "comment": "Need to fix a zipper, hope someone can show me how." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Neighborhood Skateboard Ramp Construction",
      "categories": ["handicraft", "construction"],
      "tags": ["skateboarding", "woodworking", "diy-ramp", "youth"],
      organizations: ["SkateOrDie"],
      "createdby": "OllieKing",
      "description": "The local kids need a safe place to skate. We have secured a small abandoned lot and want to design and construct a modular wooden mini-ramp. Looking for anyone handy with a circular saw, hammer, or planning tool!",
      "roles": ["team", "host", "participant", "builder", "coordinator"],
      "members": [
        { "user": "OllieKing", "roles": ["team", "builder"], "comment": "Got the blueprints ready." },
        { "user": "Woody", "roles": ["team", "coordinator"], "comment": "Can get cheap marine plywood from my uncle." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Solar-Powered Phone Charging Bench",
      "categories": ["handicraft", "electronics"],
      "tags": ["solar", "renewable-energy", "woodwork", "public-space"],
      organizations: ["GreenTech"],
      "createdby": "SolarPunky",
      "description": "Let's build a public wooden bench for the community park featuring an integrated solar panel and USB ports for anyone to charge their phones using 100% clean energy. We need woodworkers and electronics enthusiasts.",
      "roles": ["team", "host", "participant", "expert", "builder"],
      "members": [
        { "user": "SolarPunky", "roles": ["team", "expert"], "comment": "I already bought the 50W solar panel and charge controller." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Experimental Noise Orchestra",
      "categories": ["culture", "music"],
      "tags": ["experimental", "noise", "improvisation", "avant-garde"],
      organizations: ["SubSonics"],
      "createdby": "CaptainFeedback",
      "description": "No musical skills required! We are forming an orchestra using found objects, modified toys, broken instruments, and vintage synthesizers. Let's practice improvisation and perform a chaotic live gig.",
      "roles": ["team", "host", "participant", "instructor", "expert"],
      "members": [
        { "user": "CaptainFeedback", "roles": ["team", "instructor"], "comment": "I will bring a megaphone and contact mics." },
        { "user": "TapeLoop", "roles": ["team", "expert"], "comment": "I'll record our sessions on a 4-track cassette deck." },
        { "user": "CymbalClash", "roles": ["participant"], "comment": "I have an old oil drum we can hit." },
        { "user": "NoiseUser1", "roles": ["participant"] },
        { "user": "NoiseUser2", "roles": ["participant"] },
        { "user": "NoiseUser3", "roles": ["participant"] },
        { "user": "NoiseUser4", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Zine Making and Underground Publishing",
      "categories": ["culture", "literature"],
      "tags": ["zine", "diy-publishing", "collages", "poetry"],
      organizations: ["PressFreedom"],
      "createdby": "XeroxPunk",
      "description": "Let's create a quarterly, self-published counter-culture magazine (Zine). We write articles, draw comics, make collages, and physically cut/paste everything together before photocopying it for distribution.",
      "roles": ["team", "host", "participant", "designer", "coordinator"],
      "members": [
        { "user": "XeroxPunk", "roles": ["team", "coordinator"], "comment": "Collecting submissions starting today!" },
        { "user": "Glued_Paper", "roles": ["designer"], "comment": "I have boxes of old vintage magazines for collages." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Community Bicycle Repair Hub",
      "categories": ["handicraft", "metalwood"],
      "tags": ["cycling", "repair", "diy-mechanic", "mobility"],
      organizations: ["Velorution"],
      "createdby": "SpokeSpun",
      "description": "We want to open a weekly pop-up stand where people can fix their bikes for free. We share specialized tools, lubricants, patches, and teach bike owners how to maintain their gears, chains, and brakes autonomously.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "SpokeSpun", "roles": ["team", "instructor"], "comment": "I have a professional bike repair stand to bring." },
        { "user": "ChainGrease", "roles": ["team", "coordinator"], "comment": "I will manage the community toolbox." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Neighborhood Oral History Podcast",
      "categories": ["humanities", "history"],
      "tags": ["podcast", "storytelling", "audio-editing", "intergenerational"],
      organizations: ["VoiceOfTheStreet"],
      "createdby": "AudioHistorian",
      "description": "Every senior in our quarter has incredible stories about how this city used to look and feel. Let's grab portable field recorders, interview our elderly neighbors, and produce a beautiful local history podcast series.",
      "roles": ["team", "host", "participant", "expert", "coordinator"],
      "members": [
        { "user": "AudioHistorian", "roles": ["team", "coordinator"], "comment": "I already have a list of three grandmas willing to talk!" },
        { "user": "CutMasterFlex", "roles": ["expert"], "comment": "I use Audacity and can edit the episodes." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Guerrilla Seed Bombing Action Force",
      "categories": ["misc", "ecology"],
      "tags": ["guerrilla-gardening", "wildflowers", "bees", "activism"],
      organizations: ["GreenGuerrillas"],
      "createdby": "ClayThrower",
      "description": "Tired of depressing industrial concrete patches? Let's bake hundreds of seed bombs out of clay, organic compost, and native wildflower seeds, then bike around the city to green up neglected urban spaces.",
      "roles": ["team", "host", "participant", "coordinator"],
      "members": [
        { "user": "ClayThrower", "roles": ["team", "coordinator"], "comment": "Mapping out gray zones in the industrial area right now." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Giant DIY Telescope Building",
      "categories": ["sciences", "physics"],
      "tags": ["astronomy", "telescope", "diy-science", "optics"],
      organizations: ["CosmosClub"],
      "createdby": "StarGazerMax",
      "description": "We want to see Saturn's rings clearly! Let's team up to build a high-performance Dobsonian telescope from scratch, including grinding and polishing our own primary mirror. It's a long project, but highly rewarding.",
      "roles": ["team", "host", "participant", "expert", "builder"],
      "members": [
        { "user": "StarGazerMax", "roles": ["team", "expert"], "comment": "Ordered the glass blank and silicon carbide grit!" }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Linux Migration Party for Seniors",
      "categories": ["computer", "operating"],
      "tags": ["linux", "open-source", "digital-inclusion", "hardware-revival"],
      organizations: ["LinuxForAll"],
      "createdby": "TuxFriend",
      "description": "Let's help older folks revive their slow, old laptops! We'll set up a weekend event where we install lightweight Linux distributions (like Mint or Linux Lite) and show them how to securely browse the web without adware.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "TuxFriend", "roles": ["team", "coordinator"], "comment": "Flashing 10 USB drives with Linux Mint." },
        { "user": "KindSoul", "roles": ["team", "instructor"], "comment": "I love explaining tech slowly to grandparents." },
        { "user": "SeniorFan1", "roles": ["participant"] },
        { "user": "SeniorFan2", "roles": ["participant"] },
        { "user": "SeniorFan3", "roles": ["participant"] },
        { "user": "SeniorFan4", "roles": ["participant"] },
        { "user": "SeniorFan5", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Community Theatre Puppet Show",
      "categories": ["culture", "theatre"],
      "tags": ["puppetry", "satire", "acting", "crafting"],
      organizations: ["BackstageChaos"],
      "createdby": "PuppetMaster",
      "description": "We want to write, build puppets for, and perform a satirical political puppet show at the upcoming local street festival. We need scriptwriters, puppet makers (papier-mache), and dramatic voice actors!",
      "roles": ["team", "host", "participant", "artist", "coordinator"],
      "members": [
        { "user": "PuppetMaster", "roles": ["team", "artist"], "comment": "I have tons of old newspapers and glue ready." },
        { "user": "DramaQueen", "roles": ["team", "coordinator"], "comment": "Working on a funny script about local rent prices." },
        { "user": "VoiceGuy", "roles": ["participant"], "comment": "Can do 5 different funny voices!" }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Pin-Hole Camera and Darkroom Experiment",
      "categories": ["culture", "photography"],
      "tags": ["pinhole", "analog-photography", "darkroom", "diy-chemistry"],
      organizations: ["ShutterBugs"],
      "createdby": "SilverHalide",
      "description": "Let's build working analog cameras out of simple shoe boxes and coffee cans. Then we will transform a dark bathroom into a temporary darkroom to develop our own black-and-white photos using safe household chemicals.",
      "roles": ["team", "host", "participant", "expert", "instructor"],
      "members": [
        { "user": "SilverHalide", "roles": ["team", "expert"], "comment": "Sourcing the photo-paper and developers." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Public Park Parkour and Calisthenics Rack",
      "categories": ["sports", "teamsport"],
      "tags": ["calisthenics", "parkour", "fitness", "urban-design"],
      organizations: ["StreetWorkout"],
      "createdby": "BarBrotherFly",
      "description": "We want to design a custom outdoor calisthenics pull-up rack and get official permission from the city council to build it in the public park. We need structural drawings, safety inspectors, and sports enthusiasts to lobby for it.",
      "roles": ["team", "host", "participant", "designer", "coordinator"],
      "members": [],
      "region": "Projectistan"
    },
    {
      "name": "Cryptoparty and Digital Self-Defense",
      "categories": ["computer", "internet"],
      "tags": ["privacy", "encryption", "security", "digital-rights"],
      organizations: ["PrivacyNow"],
      "createdby": "CypherPunk99",
      "description": "Let's teach each other how to protect our digital lives. In this collaborative project, we will set up PGP email encryption, install Signal, configure open-source Password Managers, and discuss metadata privacy concepts.",
      "roles": ["team", "host", "participant", "instructor"],
      "members": [],
      "region": "Projectistan"
    },
    {
      "name": "Neighborhood Board Game Prototyping",
      "categories": ["culture", "design"],
      "tags": ["boardgames", "tabletop", "gamedesign", "playtesting"],
      organizations: ["MeepleMakers"],
      "createdby": "DiceRollDan",
      "description": "Do you have an idea for a strategic board game or a funny card game? Let's meet up weekly to design mechanics, print custom cards, craft 3D wooden tokens, and playtest each other's prototypes over drinks.",
      "roles": ["team", "host", "participant", "designer", "tester"],
      "members": [
        { "user": "DiceRollDan", "roles": ["team", "designer"], "comment": "Bringing cardboard prototypes and prototype dice." },
        { "user": "CardQueen", "roles": ["team", "designer"] },
        { "user": "TesterTom", "roles": ["tester"], "comment": "Ready to break your game balance!" },
        { "user": "Player1", "roles": ["participant"] },
        { "user": "Player2", "roles": ["participant"] },
        { "user": "Player3", "roles": ["participant"] },
        { "user": "Player4", "roles": ["participant"] },
        { "user": "Player5", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Solar Cooking Box Construction",
      "categories": ["handicraft", "construction"],
      "tags": ["solar-cooking", "diy-energy", "upcycling", "outdoor"],
      organizations: ["OffGridLiving"],
      "createdby": "SunnySideUp",
      "description": "We want to build highly insulated wooden boxes lined with reflective mirrors to cook food using purely solar heat. Great project for picnics and teaching kids about green thermodynamic principles.",
      "roles": ["team", "host", "participant", "builder", "instructor"],
      "members": [
        { "user": "SunnySideUp", "roles": ["team", "instructor"], "comment": "I have the thermal glass panels secured." },
        { "user": "WoodChopper", "roles": ["builder"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Local Language Exchange & Story Slam",
      "categories": ["humanities", "languages"],
      "tags": ["languages", "storytelling", "integration", "culture"],
      organizations: ["PolyglotHub"],
      "createdby": "LinguaFranc",
      "description": "Instead of boring vocabulary tests, let's learn new languages by sharing personal life stories. Every week features two languages. Native speakers act as coaches while the rest tries to follow and contribute sketches.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "LinguaFranc", "roles": ["team", "coordinator"], "comment": "Can coach English and French." },
        { "user": "Amira_Arabic", "roles": ["instructor"], "comment": "I will teach basic conversational Arabic!" },
        { "user": "LangLearner1", "roles": ["participant"] },
        { "user": "LangLearner2", "roles": ["participant"] },
        { "user": "LangLearner3", "roles": ["participant"] },
        { "user": "LangLearner4", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Community Drone Mapping Project",
      "categories": ["computer", "operating"],
      "tags": ["drones", "mapping", "gis", "open-data"],
      organizations: ["SkyWatchers"],
      "createdby": "AeroCam",
      "description": "Let's map our environmental changing zones using open hardware drones and photogrammetry software. We generate high-definition open-source 3D maps to track local deforestation and river path changes.",
      "roles": ["team", "host", "participant", "expert", "coordinator"],
      "members": [
        { "user": "AeroCam", "roles": ["team", "expert"], "comment": "Got a drone with an advanced mapping payload." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Fermented Beverage Crafting Lab",
      "categories": ["culture", "cooking"],
      "tags": ["brewing", "kombucha", "ginger-beer", "biology"],
      organizations: ["FermentNation"],
      "createdby": "BubblesMagee",
      "description": "Let's explore the science of non-alcoholic fermentation. We will culture SCOBYs for fizzy kombucha, grow ginger bugs for spicy old-school ginger beer, and experiment with local wild berries for unique carbonated sodas.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "BubblesMagee", "roles": ["team", "instructor"], "comment": "Sharing free starter cultures to all attendees." },
        { "user": "SodaPop", "roles": ["coordinator"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Mobile Repair Station Cargo Bike",
      "categories": ["handicraft", "metalwood"],
      "tags": ["cargo-bike", "welding", "mobility", "diy-transport"],
      organizations: ["Velorution"],
      "createdby": "WeldDone",
      "description": "Let's build a heavy-duty three-wheeled cargo bike from scrapped old steel frames. The front box will open up into a fully integrated mobile workbench containing tools for community neighborhood support.",
      "roles": ["team", "host", "participant", "builder", "expert"],
      "members": [
        { "user": "WeldDone", "roles": ["team", "builder"], "comment": "I have a MIG welder in my basement shop." },
        { "user": "FrameHunter", "roles": ["team", "participant"], "comment": "Scavenging old bike frames from recycling sites." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Neighborhood Philosophy Cafe",
      "categories": ["humanities", "philosophy"],
      "tags": ["discussion", "ethics", "philosophy", "critical-thinking"],
      organizations: ["SocratesCafe"],
      "createdby": "SofiaThinker",
      "description": "Is a meaningful life possible under modern capitalism? Let's discuss timeless philosophical ideas in a cozy, non-pretentious format. Every session starts with a 10-minute presentation followed by structured open debate.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "SofiaThinker", "roles": ["team", "instructor"], "comment": "Preparing an intro presentation on Hannah Arendt." },
        { "user": "PhilFan01", "roles": ["participant"] },
        { "user": "PhilFan02", "roles": ["participant"] },
        { "user": "PhilFan03", "roles": ["participant"] },
        { "user": "PhilFan04", "roles": ["participant"] },
        { "user": "PhilFan05", "roles": ["participant"] },
        { "user": "PhilFan06", "roles": ["participant"] },
        { "user": "PhilFan07", "roles": ["participant"] },
        { "user": "PhilFan08", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "DIY Hydroponic Window Farm",
      "categories": ["handicraft", "gardening"],
      "tags": ["hydroponics", "indoor-farming", "automation", "diy"],
      organizations: ["GreenTech"],
      "createdby": "HydroHacker",
      "description": "Grow fresh basil and strawberries right inside your apartment window all winter long! We are designing vertical hydroponic loops out of cheap recycled plastic bottles, tiny water pumps, and automated Arduino timers.",
      "roles": ["team", "host", "participant", "builder", "developer"],
      "members": [
        { "user": "HydroHacker", "roles": ["team", "developer"], "comment": "Wrote the code for automated nutrient cycles." },
        { "user": "PlumberPete", "roles": ["builder"], "comment": "I can construct the PVC tube framing safely." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Balkan Brass Music Ensemble",
      "categories": ["culture", "music"],
      "tags": ["brass", "music", "balkan", "jam-session"],
      organizations: ["SubSonics"],
      "createdby": "TrumpetKing",
      "description": "Looking for trumpet, saxophone, trombone, and percussion players to form a high-energy Balkan-style acoustic street band. Let's learn traditional odd-meter rhythms (7/8, 9/8) and play high-speed dance melodies together.",
      "roles": ["team", "host", "participant", "instructor", "coordinator"],
      "members": [
        { "user": "TrumpetKing", "roles": ["team", "instructor"], "comment": "I have sheet music and custom ear protection." },
        { "user": "DrummerGal", "roles": ["team", "participant"], "comment": "Bringing a loud marching snare drum." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Guerrilla Poetry Postbox Action",
      "categories": ["culture", "literature"],
      "tags": ["poetry", "street-art", "literature", "intervention"],
      organizations: ["ArtInThePark"],
      "createdby": "PoetLaureate",
      "description": "Let's build wooden, weather-proof mini boxes to mount around urban walking paths. Passersby can take a beautifully printed poem or leave their own anonymous writings behind to brighten somebody's bad day.",
      "roles": ["team", "host", "participant", "builder", "designer"],
      "members": [
        { "user": "PoetLaureate", "roles": ["team", "designer"], "comment": "Designing template typography cards." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Community Clay Oven Construction",
      "categories": ["handicraft", "construction"],
      "tags": ["cob-oven", "pizza", "baking", "primitive-skills"],
      organizations: ["MakerSpace-Group"],
      "createdby": "PizzaEnthusiast",
      "description": "We want to construct a traditional clay/cob outdoor pizza oven in our communal garden space. This requires mixing clay, sand, and straw by foot, building an insulation layer, and firing up brick foundations.",
      "roles": ["team", "host", "participant", "builder", "expert"],
      "members": [
        { "user": "PizzaEnthusiast", "roles": ["team", "builder"], "comment": "Got access to clean river clay." },
        { "user": "BakerBob", "roles": ["expert"], "comment": "Can teach natural sourdough baking techniques once it's built." },
        { "user": "MudLover", "roles": ["participant"] },
        { "user": "HungryMax", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Youth Skate Film Production Crew",
      "categories": ["culture", "film"],
      "tags": ["videography", "video-editing", "skateboarding", "indie-film"],
      organizations: ["SkateOrDie"],
      "createdby": "FisheyePhil",
      "description": "Let's film a fast-paced neighborhood skateboarding promo video! We need camera operators with fisheye lenses, runners to place lighting, and video editors working with open-source tools like DaVinci or Kdenlive.",
      "roles": ["team", "host", "participant", "expert", "tester"],
      "members": [
        { "user": "FisheyePhil", "roles": ["team", "expert"], "comment": "Bringing my Sony camera setup and rigs." },
        { "user": "Skatematch", "roles": ["tester"], "comment": "Can perform some line runs on camera." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Open Mapping of City Barrier Points",
      "categories": ["humanities", "sociology"],
      "tags": ["accessibility", "inclusion", "mapping", "wheelchair"],
      organizations: ["HackForGood"],
      "createdby": "AccessAll",
      "description": "Let's make our city truly open! We are organizing weekend walks to map high curbs, broken elevators, and non-accessible entrances into OpenStreetMap. Help wheelchair users and parents with strollers plan safely.",
      "roles": ["team", "host", "participant", "coordinator"],
      "members": [
        { "user": "AccessAll", "roles": ["team", "coordinator"], "comment": "Providing checklists for parameter assessments." },
        { "user": "Walker1", "roles": ["participant"] },
        { "user": "Walker2", "roles": ["participant"] },
        { "user": "Walker3", "roles": ["participant"] },
        { "user": "Walker4", "roles": ["participant"] },
        { "user": "Walker5", "roles": ["participant"] },
        { "user": "Walker6", "roles": ["participant"] },
        { "user": "Walker7", "roles": ["participant"] },
        { "user": "Walker8", "roles": ["participant"] },
        { "user": "Walker9", "roles": ["participant"] },
        { "user": "Walker10", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Wild Birdhouse Crafting & Monitoring",
      "categories": ["handicraft", "gardening"],
      "tags": ["birds", "wildlife", "woodworking", "citizenscience"],
      organizations: ["BioBlitz"],
      "createdby": "OrnithoTom",
      "description": "Local songbirds are losing nesting spaces. Let's assemble custom wooden birdhouses specifically designed for endangered local species, hang them up across city parks, and monitor nesting metrics safely.",
      "roles": ["team", "host", "participant", "builder", "expert"],
      "members": [
        { "user": "OrnithoTom", "roles": ["team", "expert"], "comment": "Got correct entrance hole specifications for blue tits." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Intro to Electronics with Raspberry Pi",
      "categories": ["computer", "electronics"],
      "tags": ["raspberry-pi", "python", "hardware", "education"],
      organizations: ["MakerSpace-Group"],
      "createdby": "PiPioneer",
      "description": "Want to learn how software interacts with hardware components? Let's meet to program simple microcontrollers, wire up flashing LED configurations, and use light sensors using Python scripts.",
      "roles": ["team", "host", "participant", "instructor"],
      "members": [
        { "user": "PiPioneer", "roles": ["team", "instructor"], "comment": "Have 5 test boards to loan during meetings." },
        { "user": "StudentX", "roles": ["participant"] },
        { "user": "StudentY", "roles": ["participant"] },
        { "user": "StudentZ", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Acoustic Folk Song Circle & Jam",
      "categories": ["culture", "music"],
      "tags": ["acoustic", "guitar", "folk", "singing"],
      organizations: ["ArtInThePark"],
      "createdby": "StrummerDan",
      "description": "Bring your acoustic guitar, ukulele, mandolin, accordion, or just your voice. We meet around a campfire or inside a park to share simple chord sheets, sing traditional songs, and improvise folk rhythms.",
      "roles": ["team", "host", "participant", "coordinator"],
      "members": [
        { "user": "StrummerDan", "roles": ["team", "coordinator"], "comment": "Printing booklets of chords for everyone." },
        { "user": "Jammer1", "roles": ["participant"] },
        { "user": "Jammer2", "roles": ["participant"] },
        { "user": "Jammer3", "roles": ["participant"] },
        { "user": "Jammer4", "roles": ["participant"] },
        { "user": "Jammer5", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Community Solar Panel Bulk Buying Club",
      "categories": ["misc", "ecology"],
      "tags": ["solar", "cooperative", "energy-transition", "finance"],
      organizations: ["GreenTech"],
      "createdby": "WattSaver",
      "description": "Let's group our financial resources to buy solar balcony modules directly from wholesale manufacturers. By ordering together, we reduce shipping costs and get a premium discount for all neighbors.",
      "roles": ["team", "host", "participant", "coordinator", "expert"],
      "members": [
        { "user": "WattSaver", "roles": ["team", "coordinator"], "comment": "In contact with a European supplier." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Stop-Motion Animation Collective",
      "categories": ["culture", "film"],
      "tags": ["animation", "claymation", "stopmotion", "creative"],
      organizations: ["BackstageChaos"],
      "createdby": "ClayAnimator",
      "description": "Let's create a collaborative short animated movie using clay figures, cut-out paper elements, and smartphone cameras. We will build tiny stage designs and animate frame-by-frame.",
      "roles": ["team", "host", "participant", "artist", "designer"],
      "members": [
        { "user": "ClayAnimator", "roles": ["team", "artist"], "comment": "Bringing high-strength plasticine modeling clay." }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Urban Park Slackline Jam & Balance",
      "categories": ["sports", "artistry"],
      "tags": ["slackline", "balance", "outdoor", "fitness"],
      organizations: ["StreetWorkout"],
      "createdby": "SlackLinerJoe",
      "description": "Let's tension some long lines between trees using safe protective tree mats. Everyone from complete beginners trying their first steps to advanced trickliners are welcome to share tips and hang out.",
      "roles": ["team", "host", "participant", "instructor"],
      "members": [
        { "user": "SlackLinerJoe", "roles": ["team", "instructor"], "comment": "Providing two 15-meter beginner lines." },
        { "user": "Balanceman", "roles": ["participant"] },
        { "user": "RunnerGirl", "roles": ["participant"] },
        { "user": "FitUser", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    },
    {
      "name": "Local Activism Screenprinting Collective",
      "categories": ["culture", "fineart"],
      "tags": ["screenprinting", "activism", "merch", "diy-art"],
      organizations: ["PressFreedom"],
      "createdby": "InkRebel",
      "description": "Let's build screens and print custom political messages onto repurposed old fabric, hoodies, and posters. We'll show you how to expose templates using simple UV spotlights in dark settings.",
      "roles": ["team", "host", "participant", "expert", "builder"],
      "members": [
        { "user": "InkRebel", "roles": ["team", "expert"], "comment": "Got professional textile ink to share." },
        { "user": "Printhelper", "roles": ["participant"] }
      ],
      "region": "Projectistan"
    }
]
