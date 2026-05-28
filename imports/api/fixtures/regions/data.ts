export const regions: {
  _id: string;
  name: string;
  nameEn: string;
  loc?: [number, number];
  tz: string;
  calendarStartDate?: true;
  defaultTeamOrganizations?: string[];
  singleEvents?: boolean;
  country?: string;
  region?: string;
  tenant?: string;
  admin?: string;
  custom?: {
    siteName?: string;
    siteStage?: string;
    headerLogo?: { src: string; alt: string };
    emailLogo?: string;
  };
  dashboard?: {
    entity: "organization" | "group" | "groupWithoutPropose" | "event" | "eventsMap" | "propose";
    title?: string;
    query?: string;
    showAll?: { link?: string; text?: string };
  }[];
  map?: {
    crs?: "Simple";
    api: "c3nav";
    apiUrl: string;
    layers: { name: string; level: number; tileUrl: string }[];
    defaultLevel: number;
    maxZoom: number;
    attribution: string;
  };
  roles?: {
    type: string;
    icon: string;
    proposal: boolean;
    preset: boolean;
    editable: boolean;
    /** UI strings in the same format as `RoleEntity["translations"]` */
    translations?: Record<string, Record<string, string>>;
  }[];
}[] = [
  {
    _id: "9JyFCoKWkxnf8LWPh",
    name: "Testistan",
    nameEn: "Testland",
    loc: [47.1375, 7.2472],
    tz: "Europe/Zurich",
  },
  {
    _id: "EZqQLGL4PtFCxCNrp",
    name: "Spilistan",
    nameEn: "Spilistan",
    loc: [47.05, 8.3],
    tz: "Europe/Andorra",
    dashboard: [
      {
        entity: "group",
        title: "dashboard.userInvolvedIn.title",
        query: "userInvolved={currentUser}",
      },
      {
        entity: "event",
        title: "dashboard.userRegistredFor.title",
        query: "participant={currentUser}&after=now&sort=start",
      },
      { entity: "group", title: "dashboard.recentActivities.title", query: "internal=0" },
      {
        entity: "event",
        title: "dashboard.upcomingEvents.title",
        query: "after=now&sort=start&internal=0&canceled=0",
      },
      {
        entity: "group",
        title: "dashboard.newProposals.title",
        query: "state=proposal&internal=0&sort=-time_created",
      },
      {
        entity: "group",
        title: "dashboard.lookingForMentors.title",
        query: "needsRole=mentor&state=proposal,resting&internal=0",
      },
      {
        entity: "group",
        title: "dashboard.lookingForVenues.title",
        query: "needsRole=host&state=proposal,resting&internal=0",
      },
      {
        entity: "eventsMap",
        title: "dashboard.eventsMap.title",
        query: "after=now&internal=0&canceled=0",
      },
      { entity: "propose" },
    ],
  },
  {
    _id: "MPKEnGGC8T9XyCCRG",
    name: "Englistan",
    nameEn: "Englistan",
    loc: [40, -100],
    tz: "America/Denver",
  },
  {
    _id: "4Je2iee208aLHS1Km",
    name: "Yogyakarta",
    nameEn: "Yogyakarta",
    country: "ID",
    loc: [-7.8014, 110.3644],
    tz: "Asia/Jakarta",
  },
  {
    _id: "Siifr2P7drkv66FNA",
    name: "Bern",
    nameEn: "Bern",
    country: "CH",
    region: "BE",
    loc: [46.9511, 7.4386],
    tz: "Europe/Zurich",
  },
  {
    _id: "J6GDhEEvdmdSMzPPF",
    name: "Zürich (NHW)",
    nameEn: "Zurich (NHW)",
    country: "CH",
    region: "ZH",
    loc: [47.3784, 8.5257],
    tz: "Europe/Zurich",
  },
  {
    _id: "doR7JQH0jDE7Uunp3",
    name: "Frauenfeld",
    nameEn: "Frauenfield",
    country: "CH",
    region: "TG",
    loc: [47.556, 8.8965],
    tz: "Europe/Zurich",
  },
  {
    name: "Online",
    nameEn: "Online",
    _id: "987sdfgnDSDf238dd",
    tz: "Europe/Zurich",
    custom: {
      siteName: "Jitsiland",
      siteStage: "Online",
      headerLogo: {
        src: "sveb_logo.png",
        alt: "Online Logo",
      },
      emailLogo: "emails/sveb.png",
    },
  },
  {
    _id: "h4MnI3psRr8hSljk2",
    name: "Zürich (Lernt)",
    nameEn: "Zurich (Lernt)",
    country: "CH",
    region: "ZH",
    loc: [47.3784, 8.5257],
    tz: "Europe/Zurich",
    calendarStartDate: true,
    defaultTeamOrganizations: ["Hx7iiRX5Fg3Pf2xne"],
    singleEvents: true,
    tenant: "Zuerich Lernt",
    admin: "Support",
    custom: {
      siteName: "Zürich Lernt",
      siteStage: "Platform",
    },
    dashboard: [
      {
        entity: "group",
        title: "dashboard.newProposals.title",
        query: "state=proposal&internal=0&sort=-time_created",
      },
      { entity: "group", title: "dashboard.recentActivities.title", query: "" },
      {
        entity: "event",
        title: "dashboard.upcomingEvents.title",
        query: "after=now&sort=start&internal=0&canceled=0",
      },
    ],
  },
  {
    _id: "h4MnI3psRddhSljk2",
    name: "CCC",
    nameEn: "CCC",
    country: "CH",
    region: "ZH",
    loc: [47.3784, 8.5257],
    tz: "Europe/Zurich",
    tenant: "CCC",
    admin: "Hacker1",
    custom: {
      siteName: "CCC",
      siteStage: "Hack",
    },
    map: {
      crs: "Simple",
      api: "c3nav",
      apiUrl: "https://hack-mas24.c3nav.de/api/v2/",
      layers: [
        {
          name: "Erdgeschoss",
          level: 1,
          tileUrl: "https://tiles.hack-mas24.c3nav.de/1/{z}/{x}/{y}/0.png",
        },
        {
          name: "Obergeschoss",
          level: 88,
          tileUrl: "https://tiles.hack-mas24.c3nav.de/88/{z}/{x}/{y}/0.png",
        },
      ],
      maxZoom: 5,
      defaultLevel: 1,
      attribution: "&copy; <a href='https://github.com/c3nav'>c3nav</a>",
    },
  },
  {
    _id: "5JyFCoKwkxnf8LWoh",
    name: "Projectistan",
    nameEn: "Projectistan",
    loc: [47.1375, 7.2472],
    tz: "Europe/Zurich",
    roles: [
      {
        type: "participant",
        icon: "fa-solid fa-thumbs-up",
        proposal: false,
        preset: true,
        editable: false,
      },
      {
        type: "mentor",
        icon: "fa-solid fa-graduation-cap",
        proposal: true,
        preset: false,
        editable: true,
      },
      {
        type: "host",
        icon: "fa-solid fa-house",
        proposal: true,
        preset: false,
        editable: true,
      },
      {
        type: "team",
        icon: "fa-solid fa-bullhorn",
        proposal: false,
        preset: true,
        editable: false,
      },
      {
        type: "facilitator",
        icon: "fa-solid fa-chalkboard-user",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "facilitator",
          },
          subscribe: {
            en: "I can be a facilitator",
          },
          subscribed: {
            en: "You are listed as facilitator",
          },
          description: {
            en: "a facilitator",
          },
          myList: {
            en: "I teach",
          },
          userList: {
            en: "{NAME} teaches",
          },
          myListPast: {
            en: "I taught",
          },
          userListPast: {
            en: "{NAME} taught",
          },
          find_roleNeeded: {
            en: "Looking for a facilitator",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a facilitator",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a facilitator",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a facilitator",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as facilitator\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "builder",
        icon: "fa-solid fa-hammer",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "builder",
          },
          subscribe: {
            en: "I can be a builder",
          },
          subscribed: {
            en: "You are listed as builder",
          },
          description: {
            en: "a builder",
          },
          myList: {
            en: "I build",
          },
          userList: {
            en: "{NAME} builds",
          },
          myListPast: {
            en: "I built",
          },
          userListPast: {
            en: "{NAME} built",
          },
          find_roleNeeded: {
            en: "Looking for a builder",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a builder",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a builder",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a builder",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as builder\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "researcher",
        icon: "fa-solid fa-microscope",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "researcher",
          },
          subscribe: {
            en: "I can be a researcher",
          },
          subscribed: {
            en: "You are listed as researcher",
          },
          description: {
            en: "a researcher",
          },
          myList: {
            en: "I research",
          },
          userList: {
            en: "{NAME} researches",
          },
          myListPast: {
            en: "I researched",
          },
          userListPast: {
            en: "{NAME} researched",
          },
          find_roleNeeded: {
            en: "Looking for a researcher",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a researcher",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a researcher",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a researcher",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as researcher\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "editor",
        icon: "fa-solid fa-pen-to-square",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "editor",
          },
          subscribe: {
            en: "I can be an editor",
          },
          subscribed: {
            en: "You are listed as editor",
          },
          description: {
            en: "an editor",
          },
          myList: {
            en: "I edit",
          },
          userList: {
            en: "{NAME} edits",
          },
          myListPast: {
            en: "I edited",
          },
          userListPast: {
            en: "{NAME} edited",
          },
          find_roleNeeded: {
            en: "Looking for an editor",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs an editor",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has an editor",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are an editor",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as editor\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "organizer",
        icon: "fa-solid fa-sitemap",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "organizer",
          },
          subscribe: {
            en: "I can be an organizer",
          },
          subscribed: {
            en: "You are listed as organizer",
          },
          description: {
            en: "an organizer",
          },
          myList: {
            en: "I organize",
          },
          userList: {
            en: "{NAME} organizes",
          },
          myListPast: {
            en: "I organized",
          },
          userListPast: {
            en: "{NAME} organized",
          },
          find_roleNeeded: {
            en: "Looking for an organizer",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs an organizer",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has an organizer",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are an organizer",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as organizer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "developer",
        icon: "fa-solid fa-code",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "developer",
          },
          subscribe: {
            en: "I can be a developer",
          },
          subscribed: {
            en: "You are listed as developer",
          },
          description: {
            en: "a developer",
          },
          myList: {
            en: "I develop",
          },
          userList: {
            en: "{NAME} develops",
          },
          myListPast: {
            en: "I developed",
          },
          userListPast: {
            en: "{NAME} developed",
          },
          find_roleNeeded: {
            en: "Looking for a developer",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a developer",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a developer",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a developer",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as developer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "tester",
        icon: "fa-solid fa-vial",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "tester",
          },
          subscribe: {
            en: "I can be a tester",
          },
          subscribed: {
            en: "You are listed as tester",
          },
          description: {
            en: "a tester",
          },
          myList: {
            en: "I test",
          },
          userList: {
            en: "{NAME} tests",
          },
          myListPast: {
            en: "I tested",
          },
          userListPast: {
            en: "{NAME} tested",
          },
          find_roleNeeded: {
            en: "Looking for a tester",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a tester",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a tester",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a tester",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as tester\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "producer",
        icon: "fa-solid clapperboard",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "producer",
          },
          subscribe: {
            en: "I can be a producer",
          },
          subscribed: {
            en: "You are listed as producer",
          },
          description: {
            en: "a producer",
          },
          myList: {
            en: "I produce",
          },
          userList: {
            en: "{NAME} produces",
          },
          myListPast: {
            en: "I produced",
          },
          userListPast: {
            en: "{NAME} produced",
          },
          find_roleNeeded: {
            en: "Looking for a producer",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a producer",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a producer",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a producer",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as producer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "moderator",
        icon: "fa-solid fa-shield-halved",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "moderator",
          },
          subscribe: {
            en: "I can be a moderator",
          },
          subscribed: {
            en: "You are listed as moderator",
          },
          description: {
            en: "a moderator",
          },
          myList: {
            en: "I moderate",
          },
          userList: {
            en: "{NAME} moderates",
          },
          myListPast: {
            en: "I moderated",
          },
          userListPast: {
            en: "{NAME} moderated",
          },
          find_roleNeeded: {
            en: "Looking for a moderator",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a moderator",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a moderator",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a moderator",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as moderator\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "planner",
        icon: "fa-solid fa-calendar-days",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "planner",
          },
          subscribe: {
            en: "I can be a planner",
          },
          subscribed: {
            en: "You are listed as planner",
          },
          description: {
            en: "a planner",
          },
          myList: {
            en: "I plan",
          },
          userList: {
            en: "{NAME} plans",
          },
          myListPast: {
            en: "I planned",
          },
          userListPast: {
            en: "{NAME} planned",
          },
          find_roleNeeded: {
            en: "Looking for a planner",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a planner",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a planner",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a planner",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as planner\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "curator",
        icon: "fa-solid fa-vault",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "curator",
          },
          subscribe: {
            en: "I can be a curator",
          },
          subscribed: {
            en: "You are listed as curator",
          },
          description: {
            en: "a curator",
          },
          myList: {
            en: "I curate",
          },
          userList: {
            en: "{NAME} curates",
          },
          myListPast: {
            en: "I curated",
          },
          userListPast: {
            en: "{NAME} curated",
          },
          find_roleNeeded: {
            en: "Looking for a curator",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a curator",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a curator",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a curator",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as curator\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "cook",
        icon: "fa-solid fa-utensils",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "cook",
          },
          subscribe: {
            en: "I can be a cook",
          },
          subscribed: {
            en: "You are listed as cook",
          },
          description: {
            en: "a cook",
          },
          myList: {
            en: "I cook",
          },
          userList: {
            en: "{NAME} cooks",
          },
          myListPast: {
            en: "I cooked",
          },
          userListPast: {
            en: "{NAME} cooked",
          },
          find_roleNeeded: {
            en: "Looking for a cook",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a cook",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a cook",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a cook",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as cook\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "designer",
        icon: "fa-solid fa-palette",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "designer",
          },
          subscribe: {
            en: "I can be a designer",
          },
          subscribed: {
            en: "You are listed as designer",
          },
          description: {
            en: "a designer",
          },
          myList: {
            en: "I design",
          },
          userList: {
            en: "{NAME} designs",
          },
          myListPast: {
            en: "I designed",
          },
          userListPast: {
            en: "{NAME} designed",
          },
          find_roleNeeded: {
            en: "Looking for a designer",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a designer",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a designer",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a designer",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as designer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "technician",
        icon: "fa-solid fa-screwdriver-wrench",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "technician",
          },
          subscribe: {
            en: "I can be a technician",
          },
          subscribed: {
            en: "You are listed as technician",
          },
          description: {
            en: "a technician",
          },
          myList: {
            en: "I am a technician",
          },
          userList: {
            en: "{NAME} is a technician",
          },
          myListPast: {
            en: "I was a technician",
          },
          userListPast: {
            en: "{NAME} was a technician",
          },
          find_roleNeeded: {
            en: "Looking for a technician",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a technician",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a technician",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a technician",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as technician\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "guide",
        icon: "fa-solid fa-compass",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "guide",
          },
          subscribe: {
            en: "I can be a guide",
          },
          subscribed: {
            en: "You are listed as guide",
          },
          description: {
            en: "a guide",
          },
          myList: {
            en: "I guide",
          },
          userList: {
            en: "{NAME} guides",
          },
          myListPast: {
            en: "I guided",
          },
          userListPast: {
            en: "{NAME} guided",
          },
          find_roleNeeded: {
            en: "Looking for a guide",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs a guide",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has a guide",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are a guide",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as guide\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
      {
        type: "archivist",
        icon: "fa-solid fa-box-archive",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "archivist",
          },
          subscribe: {
            en: "I can be an archivist",
          },
          subscribed: {
            en: "You are listed as archivist",
          },
          description: {
            en: "an archivist",
          },
          myList: {
            en: "I archive",
          },
          userList: {
            en: "{NAME} archives",
          },
          myListPast: {
            en: "I archived",
          },
          userListPast: {
            en: "{NAME} archived",
          },
          find_roleNeeded: {
            en: "Looking for an archivist",
          },
          groupList_statusTitle_roleNeeded: {
            en: "Needs an archivist",
          },
          groupList_statusTitle_roleOccupied: {
            en: "Has an archivist",
          },
          groupList_statusTitle_roleOccupiedByUser: {
            en: "You are an archivist",
          },
          notification_join_mail_intro: {
            en: "{USERNAME} just joined {GROUP} as archivist\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
          },
          group_firstSteps: {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{COORDINATION_GUIDE}",
          },
          group_messageInfo: {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
          },
        },
      },
    ],
  },
];
