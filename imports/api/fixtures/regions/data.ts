import { type RoleEntity } from "/imports/utils/PublicSettings";

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
  roles?: RoleEntity;
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
  },
];
