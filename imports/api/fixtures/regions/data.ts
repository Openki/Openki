export const regions: {
  _id: string;
  name: string;
  nameEn: string;
  loc?: [number, number];
  tz: string;
  calendarStartDate?: true;
  defaultTeamGroups?: string[];
  singleEvents?: boolean;
  country?: string;
  region?: string;
  tenant?: string;
  custom?: {
    siteName?: string;
    siteStage?: string;
    headerLogo?: { src: string; alt: string };
    emailLogo?: string;
  };
  dashboard?: {
    entity: "group" | "course" | "courseWithoutPropose" | "event" | "eventsMap" | "propose";
    title?: string;
    query?: string;
    showAll?: { link?: string; text?: string };
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
    defaultTeamGroups: ["Hx7iiRX5Fg3Pf2xne"],
    singleEvents: true,
    tenant: "Zuerich Lernt",
    custom: {
      siteName: "Zürich Lernt",
      siteStage: "Platform",
    },
    dashboard: [
      {
        entity: "course",
        title: "dashboard.newProposals.title",
        query: "state=proposal&internal=0&sort=-time_created",
      },
      { entity: "course", title: "dashboard.recentActivities.title", query: "" },
      {
        entity: "event",
        title: "dashboard.upcomingEvents.title",
        query: "after=now&sort=start&internal=0&canceled=0",
      },
    ],
  },
];
