import { VenueTemplate } from "./create";

export const venues: VenueTemplate[] = [
  {
    name: "Kasama",
    maxPeople: 40,
    maxWorkplaces: 15,
    address: "Militärstrasse 87a, 8004 Zürich, Switzerland",
    route:
      "Bus 31 oder 32 bis Militär/Langstrasse, dann zu Fuss Militärstrasse Richtung HB folgen, rechte Strassenseite bis 87a, im Hinterhof",
    description: "Lokaler Infoladen seit 1990",
    website: "http://kasama.ch",
    facilities: {
      projector: true,
      wifi: true,
      kitchen: true,
    },
    createdby: "FeeLing",
    editor: "FeeLing",
  },
  {
    name: "SGMK MechArtLab",
    maxPeople: 20,
    maxWorkplaces: 20,
    address: "Hohlstrasse 52, 8004 Zürich",
    route: "3 min von HelvetiaPlatz, (gleiches Gebäude wie Pusterla-Elektronik)",
    description:
      "Das MechArtLab beinhaltet Werkstatt, Schulungsraum, Techn. Bibliothek und Lager und bietet Platz für selbstorganisierte Gruppentreffen, Workshops, Jugendelektronikwerkstatt, uvm.",
    website: "http://www.sgmk-ssam.ch/mechartlab/",
    facilities: {
      projector: false,
      audio: false,
      blackboard: false,
      whiteboard: true,
      flipchart: false,
      wifi: true,
      kitchen: false,
    },
    createdby: "Sandra",
    editor: "Barbie92",
  },
  {
    name: "ABS",
    address: "Hohlstrasse 481, 8048 Zürich",
  },
  {
    name: "ASZ-Badenerstrasse",
    address: "Badenerstrasse 565, 8048 Zürich, Schweiz",
  },
  {
    name: "ASZ-Rauti",
    address: "FLÜELASTR. 54 // 8047 ZÜRICH",
  },
  {
    name: "Siebbdrucki1",
    address: "Manessestrasse 23",
  },
  {
    name: "Siebdrucki2",
    address: "Im Birchbüehl 2132 Hintertannen",
  },
  {
    name: "Offene Nähstube Pompon",
    address: "Idaplatz 10, 8003 Zürich, Schweiz",
  },
  {
    name: "Gemeinschaftsgarten SeedCity",
    address: "ETH-Hönggerberg, CH-8093 Zürich",
  },
  {
    name: "ortoloco-Gemüsefeld",
    address: "Spreitenbacherstrasse 35, 8953 Dietikon",
  },
  {
    name: "Stadiongarten",
    address: "",
  },
  {
    name: "Dynamo SoundLab",
    address: "Wasserwerkstrasse 21",
  },
  {
    name: "Dynamo Tanzdach",
    address: "Wasserwerkstrasse 21, Zürich",
  },
  {
    name: "Designwerkstatt",
    address: "Toniareal Zürich",
  },
  {
    name: "A4 - Copyshop",
    address: "Dienerstrasse 19  8004 Zürich",
  },
  {
    name: "Fermento",
    address: "Rosengartenstrasse",
  },
  {
    name: "K-Set",
    address: "Innenhof der Tellstrasse 20 Zürich",
  },
  {
    name: "Lugisland CCCZH Hackerspace",
    address: "Röschibachstrasse 26",
  },
  {
    name: "Dock18",
    address: "Rote Fabrik Seestrasse 395, CH-8038 Zürich",
  },
  {
    name: "Colab",
    address: "Zentralstrasse 37 in Zürich-Wiedikon",
  },
  {
    name: "Shedhalle",
    address: "Seestrasse 395, CH-8038 Zürich",
  },
  {
    name: "Kunstraum Walcheturm",
    address: "kanonengasse 20 * 8004 Zürich",
  },
  {
    name: "Corner College",
    address: "Kochstrasse 1, CH-8004 Zürich ",
  },
  {
    name: "Mein gorsses Wohnzimmer",
    address: "Rüdisüliweg 4a",
  },
  {
    name: "Kaffee Zähringer",
    address: "Zähringerplatz 11, 8001 Zürich, Schweiz",
  },
];
