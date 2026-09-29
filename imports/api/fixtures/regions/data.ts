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
    id: string;
    icon: string;
    proposal: boolean;
    preset: boolean;
    editable: boolean;
    /** UI strings in the same format as `RoleEntity["translations"]` */
    translations?: Record<string, Record<string, string>>;
  }[];
  allowUserCustomRoleCreation: boolean;
}[] = [
  {
    _id: "9JyFCoKWkxnf8LWPh",
    name: "Testistan",
    nameEn: "Testland",
    loc: [47.1375, 7.2472],
    tz: "Europe/Zurich",
    allowUserCustomRoleCreation: true,
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
    allowUserCustomRoleCreation: true,
  },
  {
    _id: "MPKEnGGC8T9XyCCRG",
    name: "Englistan",
    nameEn: "Englistan",
    loc: [40, -100],
    tz: "America/Denver",
    allowUserCustomRoleCreation: true,
  },
  {
    _id: "4Je2iee208aLHS1Km",
    name: "Yogyakarta",
    nameEn: "Yogyakarta",
    country: "ID",
    loc: [-7.8014, 110.3644],
    tz: "Asia/Jakarta",
    allowUserCustomRoleCreation: true,
  },
  {
    _id: "Siifr2P7drkv66FNA",
    name: "Bern",
    nameEn: "Bern",
    country: "CH",
    region: "BE",
    loc: [46.9511, 7.4386],
    tz: "Europe/Zurich",
    allowUserCustomRoleCreation: true,
  },
  {
    _id: "J6GDhEEvdmdSMzPPF",
    name: "Zürich (NHW)",
    nameEn: "Zurich (NHW)",
    country: "CH",
    region: "ZH",
    loc: [47.3784, 8.5257],
    tz: "Europe/Zurich",
    allowUserCustomRoleCreation: false,
  },
  {
    _id: "doR7JQH0jDE7Uunp3",
    name: "Frauenfeld",
    nameEn: "Frauenfield",
    country: "CH",
    region: "TG",
    loc: [47.556, 8.8965],
    tz: "Europe/Zurich",
    allowUserCustomRoleCreation: true,
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
    allowUserCustomRoleCreation: false,
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
    allowUserCustomRoleCreation: false,
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
    allowUserCustomRoleCreation: true,
  },
  {
    _id: "5JyFCoKwkxnf8LWoh",
    name: "Projectistan",
    nameEn: "Projectistan",
    loc: [47.1375, 7.2472],
    tz: "Europe/Zurich",
    roles: [
      {
        id: "participant",
        icon: "fa-solid fa-thumbs-up",
        proposal: false,
        preset: true,
        editable: false,
      },
      {
        id: "mentor",
        icon: "fa-solid fa-graduation-cap",
        proposal: true,
        preset: false,
        editable: true,
      },
      {
        id: "host",
        icon: "fa-solid fa-house",
        proposal: true,
        preset: false,
        editable: true,
      },
      {
        id: "team",
        icon: "fa-solid fa-bullhorn",
        proposal: false,
        preset: true,
        editable: false,
      },
      {
        id: "facilitator",
        icon: "fa-solid fa-chalkboard-user",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "facilitator",
            de: "Moderator",
            fr: "animateur",
          },
          subscribe: {
            en: "I can be a facilitator",
            de: "Ich kann Moderator sein",
            fr: "Je peux être animateur",
          },
          subscribed: {
            en: "You are listed as facilitator",
            de: "Sie sind als Moderator aufgeführt",
            fr: "Vous êtes listé comme animateur",
          },
          description: {
            en: "a facilitator",
            de: "ein Moderator",
            fr: "un animateur",
          },
          "find.roleNeeded": {
            en: "Looking for a facilitator",
            de: "Sucht einen Moderator",
            fr: "Recherche un animateur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a facilitator",
            de: "Benötigt einen Moderator",
            fr: "Besoin d'un animateur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a facilitator",
            de: "Hat einen Moderator",
            fr: "A un animateur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a facilitator",
            de: "Sie sind Moderator",
            fr: "Vous êtes animateur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as facilitator\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Moderator zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant qu'animateur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "builder",
        icon: "fa-solid fa-hammer",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "builder",
            de: "Baumeister",
            fr: "constructeur",
          },
          subscribe: {
            en: "I can be a builder",
            de: "Ich kann Baumeister sein",
            fr: "Je peux être constructeur",
          },
          subscribed: {
            en: "You are listed as builder",
            de: "Sie sind als Baumeister aufgeführt",
            fr: "Vous êtes listé comme constructeur",
          },
          description: {
            en: "a builder",
            de: "ein Baumeister",
            fr: "un constructeur",
          },
          "find.roleNeeded": {
            en: "Looking for a builder",
            de: "Sucht einen Baumeister",
            fr: "Recherche un constructeur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a builder",
            de: "Benötigt einen Baumeister",
            fr: "Besoin d'un constructeur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a builder",
            de: "Hat einen Baumeister",
            fr: "A un constructeur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a builder",
            de: "Sie sind Baumeister",
            fr: "Vous êtes constructeur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as builder\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Baumeister zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que constructeur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "researcher",
        icon: "fa-solid fa-microscope",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "researcher",
            de: "Forscher",
            fr: "chercheur",
          },
          subscribe: {
            en: "I can be a researcher",
            de: "Ich kann Forscher sein",
            fr: "Je peux être chercheur",
          },
          subscribed: {
            en: "You are listed as researcher",
            de: "Sie sind als Forscher aufgeführt",
            fr: "Vous êtes listé comme chercheur",
          },
          description: {
            en: "a researcher",
            de: "ein Forscher",
            fr: "un chercheur",
          },
          "find.roleNeeded": {
            en: "Looking for a researcher",
            de: "Sucht einen Forscher",
            fr: "Recherche un chercheur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a researcher",
            de: "Benötigt einen Forscher",
            fr: "Besoin d'un chercheur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a researcher",
            de: "Hat einen Forscher",
            fr: "A un chercheur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a researcher",
            de: "Sie sind Forscher",
            fr: "Vous êtes chercheur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as researcher\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Forscher zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que chercheur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "editor",
        icon: "fa-solid fa-pen-to-square",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "editor",
            de: "Redakteur",
            fr: "éditeur",
          },
          subscribe: {
            en: "I can be an editor",
            de: "Ich kann Redakteur sein",
            fr: "Je peux être éditeur",
          },
          subscribed: {
            en: "You are listed as editor",
            de: "Sie sind als Redakteur aufgeführt",
            fr: "Vous êtes listé comme éditeur",
          },
          description: {
            en: "an editor",
            de: "ein Redakteur",
            fr: "un éditeur",
          },
          "find.roleNeeded": {
            en: "Looking for an editor",
            de: "Sucht einen Redakteur",
            fr: "Recherche un éditeur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs an editor",
            de: "Benötigt einen Redakteur",
            fr: "Besoin d'un éditeur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has an editor",
            de: "Hat einen Redakteur",
            fr: "A un éditeur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are an editor",
            de: "Sie sind Redakteur",
            fr: "Vous êtes éditeur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as editor\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Redakteur zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant qu'éditeur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "organizer",
        icon: "fa-solid fa-sitemap",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "organizer",
            de: "Organisator",
            fr: "organisateur",
          },
          subscribe: {
            en: "I can be an organizer",
            de: "Ich kann Organisator sein",
            fr: "Je peux être organisateur",
          },
          subscribed: {
            en: "You are listed as organizer",
            de: "Sie sind als Organisator aufgeführt",
            fr: "Vous êtes listé comme organisateur",
          },
          description: {
            en: "an organizer",
            de: "ein Organisator",
            fr: "un organisateur",
          },
          "find.roleNeeded": {
            en: "Looking for an organizer",
            de: "Sucht einen Organisator",
            fr: "Recherche un organisateur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs an organizer",
            de: "Benötigt einen Organisator",
            fr: "Besoin d'un organisateur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has an organizer",
            de: "Hat einen Organisator",
            fr: "A un organisateur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are an organizer",
            de: "Sie sind Organisator",
            fr: "Vous êtes organisateur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as organizer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Organisator zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant qu'organisateur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "developer",
        icon: "fa-solid fa-code",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "developer",
            de: "Entwickler",
            fr: "développeur",
          },
          subscribe: {
            en: "I can be a developer",
            de: "Ich kann Entwickler sein",
            fr: "Je peux être développeur",
          },
          subscribed: {
            en: "You are listed as developer",
            de: "Sie sind als Entwickler aufgeführt",
            fr: "Vous êtes listé comme développeur",
          },
          description: {
            en: "a developer",
            de: "ein Entwickler",
            fr: "un développeur",
          },
          "find.roleNeeded": {
            en: "Looking for a developer",
            de: "Sucht einen Entwickler",
            fr: "Recherche un développeur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a developer",
            de: "Benötigt einen Entwickler",
            fr: "Besoin d'un développeur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a developer",
            de: "Hat einen Entwickler",
            fr: "A un développeur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a developer",
            de: "Sie sind Entwickler",
            fr: "Vous êtes développeur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as developer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Entwickler zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que développeur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "tester",
        icon: "fa-solid fa-vial",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "tester",
            de: "Tester",
            fr: "testeur",
          },
          subscribe: {
            en: "I can be a tester",
            de: "Ich kann Tester sein",
            fr: "Je peux être testeur",
          },
          subscribed: {
            en: "You are listed as tester",
            de: "Sie sind als Tester aufgeführt",
            fr: "Vous êtes listé comme testeur",
          },
          description: {
            en: "a tester",
            de: "ein Tester",
            fr: "un testeur",
          },
          "find.roleNeeded": {
            en: "Looking for a tester",
            de: "Sucht einen Tester",
            fr: "Recherche un testeur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a tester",
            de: "Benötigt einen Tester",
            fr: "Besoin d'un testeur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a tester",
            de: "Hat einen Tester",
            fr: "A un testeur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a tester",
            de: "Sie sind Tester",
            fr: "Vous êtes testeur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as tester\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Tester zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que testeur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "producer",
        icon: "fa-solid fa-clapperboard",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "producer",
            de: "Produzent",
            fr: "producteur",
          },
          subscribe: {
            en: "I can be a producer",
            de: "Ich kann Produzent sein",
            fr: "Je peux être producteur",
          },
          subscribed: {
            en: "You are listed as producer",
            de: "Sie sind als Produzent aufgeführt",
            fr: "Vous êtes listé comme producteur",
          },
          description: {
            en: "a producer",
            de: "ein Produzent",
            fr: "un producteur",
          },
          "find.roleNeeded": {
            en: "Looking for a producer",
            de: "Sucht einen Produzenten",
            fr: "Recherche un producteur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a producer",
            de: "Benötigt einen Produzenten",
            fr: "Besoin d'un producteur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a producer",
            de: "Hat einen Produzenten",
            fr: "A un producteur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a producer",
            de: "Sie sind Produzent",
            fr: "Vous êtes producteur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as producer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Produzent zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que producteur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "moderator",
        icon: "fa-solid fa-shield-halved",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "moderator",
            de: "Moderator",
            fr: "modérateur",
          },
          subscribe: {
            en: "I can be a moderator",
            de: "Ich kann Moderator sein",
            fr: "Je peux être modérateur",
          },
          subscribed: {
            en: "You are listed as moderator",
            de: "Sie sind als Moderator aufgeführt",
            fr: "Vous êtes listé comme modérateur",
          },
          description: {
            en: "a moderator",
            de: "ein Moderator",
            fr: "un modérateur",
          },
          "find.roleNeeded": {
            en: "Looking for a moderator",
            de: "Sucht einen Moderator",
            fr: "Recherche un modérateur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a moderator",
            de: "Benötigt einen Moderator",
            fr: "Besoin d'un modérateur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a moderator",
            de: "Hat einen Moderator",
            fr: "A un modérateur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a moderator",
            de: "Sie sind Moderator",
            fr: "Vous êtes modérateur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as moderator\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Moderator zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que modérateur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "planner",
        icon: "fa-solid fa-calendar-days",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "planner",
            de: "Planer",
            fr: "planificateur",
          },
          subscribe: {
            en: "I can be a planner",
            de: "Ich kann Planer sein",
            fr: "Je peux être planificateur",
          },
          subscribed: {
            en: "You are listed as planner",
            de: "Sie sind als Planer aufgeführt",
            fr: "Vous êtes listé comme planificateur",
          },
          description: {
            en: "a planner",
            de: "ein Planer",
            fr: "un planificateur",
          },
          "find.roleNeeded": {
            en: "Looking for a planner",
            de: "Sucht einen Planer",
            fr: "Recherche un planificateur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a planner",
            de: "Benötigt einen Planer",
            fr: "Besoin d'un planificateur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a planner",
            de: "Hat einen Planer",
            fr: "A un planificateur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a planner",
            de: "Sie sind Planer",
            fr: "Vous êtes planificateur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as planner\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Planer zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que planificateur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "curator",
        icon: "fa-solid fa-vault",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "curator",
            de: "Kurator",
            fr: "conservateur",
          },
          subscribe: {
            en: "I can be a curator",
            de: "Ich kann Kurator sein",
            fr: "Je peux être conservateur",
          },
          subscribed: {
            en: "You are listed as curator",
            de: "Sie sind als Kurator aufgeführt",
            fr: "Vous êtes listé comme conservateur",
          },
          description: {
            en: "a curator",
            de: "ein Kurator",
            fr: "un conservateur",
          },
          "find.roleNeeded": {
            en: "Looking for a curator",
            de: "Sucht einen Kurator",
            fr: "Recherche un conservateur",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a curator",
            de: "Benötigt einen Kurator",
            fr: "Besoin d'un conservateur",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a curator",
            de: "Hat einen Kurator",
            fr: "A un conservateur",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a curator",
            de: "Sie sind Kurator",
            fr: "Vous êtes conservateur",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as curator\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Kurator zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que conservateur\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "cook",
        icon: "fa-solid fa-utensils",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "cook",
            de: "Koch",
            fr: "cuisinier",
          },
          subscribe: {
            en: "I can be a cook",
            de: "Ich kann Koch sein",
            fr: "Je peux être cuisinier",
          },
          subscribed: {
            en: "You are listed as cook",
            de: "Sie sind als Koch aufgeführt",
            fr: "Vous êtes listé comme cuisinier",
          },
          description: {
            en: "a cook",
            de: "ein Koch",
            fr: "un cuisinier",
          },
          "find.roleNeeded": {
            en: "Looking for a cook",
            de: "Sucht einen Koch",
            fr: "Recherche un cuisinier",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a cook",
            de: "Benötigt einen Koch",
            fr: "Besoin d'un cuisinier",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a cook",
            de: "Hat einen Koch",
            fr: "A un cuisinier",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a cook",
            de: "Sie sind Koch",
            fr: "Vous êtes cuisinier",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as cook\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Koch zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que cuisinier\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "designer",
        icon: "fa-solid fa-palette",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "designer",
            de: "Designer",
            fr: "designer",
          },
          subscribe: {
            en: "I can be a designer",
            de: "Ich kann Designer sein",
            fr: "Je peux être designer",
          },
          subscribed: {
            en: "You are listed as designer",
            de: "Sie sind als Designer aufgeführt",
            fr: "Vous êtes listé comme designer",
          },
          description: {
            en: "a designer",
            de: "ein Designer",
            fr: "un designer",
          },
          "find.roleNeeded": {
            en: "Looking for a designer",
            de: "Sucht einen Designer",
            fr: "Recherche un designer",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a designer",
            de: "Benötigt einen Designer",
            fr: "Besoin d'un designer",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a designer",
            de: "Hat einen Designer",
            fr: "A un designer",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a designer",
            de: "Sie sind Designer",
            fr: "Vous êtes designer",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as designer\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Designer zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que designer\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "technician",
        icon: "fa-solid fa-screwdriver-wrench",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "technician",
            de: "Techniker",
            fr: "technicien",
          },
          subscribe: {
            en: "I can be a technician",
            de: "Ich kann Techniker sein",
            fr: "Je peux être technicien",
          },
          subscribed: {
            en: "You are listed as technician",
            de: "Sie sind als Techniker aufgeführt",
            fr: "Vous êtes listé comme technicien",
          },
          description: {
            en: "a technician",
            de: "ein Techniker",
            fr: "un technicien",
          },
          "find.roleNeeded": {
            en: "Looking for a technician",
            de: "Sucht einen Techniker",
            fr: "Recherche un technicien",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a technician",
            de: "Benötigt einen Techniker",
            fr: "Besoin d'un technicien",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a technician",
            de: "Hat einen Techniker",
            fr: "A un technicien",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a technician",
            de: "Sie sind Techniker",
            fr: "Vous êtes technicien",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as technician\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Techniker zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que technicien\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "guide",
        icon: "fa-solid fa-compass",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "guide",
            de: "Führer",
            fr: "guide",
          },
          subscribe: {
            en: "I can be a guide",
            de: "Ich kann Führer sein",
            fr: "Je peux être guide",
          },
          subscribed: {
            en: "You are listed as guide",
            de: "Sie sind als Führer aufgeführt",
            fr: "Vous êtes listé comme guide",
          },
          description: {
            en: "a guide",
            de: "ein Führer",
            fr: "un guide",
          },
          "find.roleNeeded": {
            en: "Looking for a guide",
            de: "Sucht einen Führer",
            fr: "Recherche un guide",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs a guide",
            de: "Benötigt einen Führer",
            fr: "Besoin d'un guide",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has a guide",
            de: "Hat einen Führer",
            fr: "A un guide",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are a guide",
            de: "Sie sind Führer",
            fr: "Vous êtes guide",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as guide\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Führer zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant que guide\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
      {
        id: "archivist",
        icon: "fa-solid fa-box-archive",
        proposal: true,
        preset: false,
        editable: true,
        translations: {
          short: {
            en: "archivist",
            de: "Archivar",
            fr: "archiviste",
          },
          subscribe: {
            en: "I can be an archivist",
            de: "Ich kann Archivar sein",
            fr: "Je peux être archiviste",
          },
          subscribed: {
            en: "You are listed as archivist",
            de: "Sie sind als Archivar aufgeführt",
            fr: "Vous êtes listé comme archiviste",
          },
          description: {
            en: "an archivist",
            de: "ein Archivar",
            fr: "un archiviste",
          },
          "find.roleNeeded": {
            en: "Looking for an archivist",
            de: "Sucht einen Archivar",
            fr: "Recherche un archiviste",
          },
          "groupList.statusTitle.roleNeeded": {
            en: "Needs an archivist",
            de: "Benötigt einen Archivar",
            fr: "Besoin d'un archiviste",
          },
          "groupList.statusTitle.roleOccupied": {
            en: "Has an archivist",
            de: "Hat einen Archivar",
            fr: "A un archiviste",
          },
          "groupList.statusTitle.roleOccupiedByUser": {
            en: "You are an archivist",
            de: "Sie sind Archivar",
            fr: "Vous êtes archiviste",
          },
          "notification.join.mail.intro": {
            en: "{USER} just joined {GROUP} as archivist\n\nIf you like them to collaborate feel free to contact them. You can give them rights to edit {GROUP} and make them part of the coordination team by clicking the megaphone next to their name.",
            de: "{USER} ist gerade als Archivar zu {GROUP} beigetreten\n\nWenn Sie möchten, dass sie zusammenarbeiten, können Sie sich gerne mit ihnen in Verbindung setzen. Sie können ihnen Rechte zur Bearbeitung von {GROUP} geben und sie Teil des Koordinierungsteams machen, indem Sie auf das Megafon neben ihrem Namen klicken.",
            fr: "{USER} vient de rejoindre {GROUP} en tant qu'archiviste\n\nSi vous souhaitez qu'ils collaborent, n'hésitez pas à les contacter. Vous pouvez leur donner les droits pour modifier {GROUP} et les intégrer à l'équipe de coordination en cliquant sur le mégaphone à côté de leur nom.",
          },
          "group.firstSteps": {
            en: "If not done already, please mention your experiences on the topic in your personal message.\n\n{GUIDE}",
            de: "Falls noch nicht geschehen, erwähnen Sie bitte Ihre Erfahrungen zum Thema in Ihrer persönlichen Nachricht.\n\n{GUIDE}",
            fr: "Si ce n'est pas déjà fait, veuillez mentionner vos expériences sur le sujet dans votre message personnel.\n\n{GUIDE}",
          },
          "group.messageInfo": {
            en: "Leave a message about your experience on the topic. The message will appear next to your name.",
            de: "Hinterlassen Sie eine Nachricht über Ihre Erfahrung zum Thema. Die Nachricht wird neben Ihrem Namen angezeigt.",
            fr: "Laissez un message sur votre expérience du sujet. Le message apparaîtra à côté de votre nom.",
          },
        },
      },
    ],
    allowUserCustomRoleCreation: true,
  },
];
