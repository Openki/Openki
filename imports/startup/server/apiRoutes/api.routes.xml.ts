import { v5 as uuidv5, validate as isValidUUID } from "uuid";
import { create } from "xmlbuilder2";
import { ApiEvent } from "/imports/Api";
import { Router } from "meteor/iron:router";
import { FilteringReadError } from "/imports/utils/filtering";
import { NoActionError, orderedResults } from "./api.routes.utils";
import { textPlain } from "/imports/utils/html-tools";
import { Regions } from "/imports/api/regions/regions";
import { LocalTime, Zone } from "/imports/utils/local-time";

const OPENKI_UUID_NAMESPACE = "bfcc029a-5d16-4863-af43-17277e2e717b";

function sortByTimeAndRoom(regionZone: Zone, results: ApiEvent[]) {
  return results.reduce(
    (accumulator: Record<string, Record<string, ApiEvent[]>>, current: ApiEvent) => {
      const currentDate = regionZone.fromString(current.startLocal).format("YYYY-MM-DD");

      let currentRoom;
      if (current.venue?.name && current.room) {
        currentRoom = `${current.venue?.name} (${current.room})`;
      } else {
        currentRoom = current.venue?.name || current.room;
      }

      if (currentDate in accumulator) {
        const dateEvents = accumulator[currentDate];
        if (currentRoom in dateEvents) {
          dateEvents[currentRoom].push(current);
        } else {
          dateEvents[currentRoom] = [current];
        }
      } else {
        accumulator[currentDate] = {
          [currentRoom]: [current],
        };
      }
      return accumulator;
    },
    {},
  );
}

async function xmlSendResponder(res: any, process: any) {
  try {
    const body = await process();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/xml");
    res.end(body);
  } catch (e) {
    const body: any = {};
    if (e instanceof FilteringReadError || e instanceof NoActionError) {
      res.statusCode = 400;
      body.status = "fail";
      body.data = {};
      if ((e as any).name) {
        body.data[(e as any).name] = e.message;
      } else {
        body.data.error = e.message;
      }
    } else {
      console.log(e, e.stack);
      res.statusCode = 500;
      body.status = "error";
      body.message = "Server error";
    }
    res.end(JSON.stringify(body, null, "\t"));
  }
}

function toPseudoHash(value: string) {
  let hash = 0;
  for (let i = 0, len = value.length; i < len; i += 1) {
    const chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash < 0 ? hash * -1 : hash;
}

function asUuid(value: string) {
  if (isValidUUID(value)) {
    return value;
  }

  return uuidv5(value, OPENKI_UUID_NAMESPACE);
}

Router.route("api.0.xml", {
  path: "/api/0/xml/schedule",
  where: "server",
  async action() {
    await xmlSendResponder(this.response, async () => {
      const region = await Regions.findOneAsync({ _id: this.params.query.region });

      if (!region) {
        throw new Meteor.Error("region requried", "The region param must be given.");
      }
      const regionZone = await LocalTime.zoneAsync(region._id);

      // Hide canceled events in schedule
      this.params.query.canceled = this.params.query.canceled ?? "0";
      const results = await orderedResults(this.params, "events");

      const resultsByTimeAndRoom = sortByTimeAndRoom(regionZone, results);

      const scheduleNode = create({ version: "1.0" }).ele("schedule", {
        "xsi:noNamespaceSchemaLocation": "https://c3voc.de/schedule/schema.xsd",
        "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      });
      scheduleNode.ele("generator", { name: "openki" });
      scheduleNode.ele("version").txt("1.0");
      scheduleNode
        .ele("conference")
        .ele("acronym")
        .txt(region?.scheduleXmlData?.acronym || "")
        .up()
        .ele("title")
        .txt(region?.scheduleXmlData?.title || "")
        .up()
        .ele("start")
        .txt(region?.scheduleXmlData?.start || "")
        .up()
        .ele("end")
        .txt(region?.scheduleXmlData?.end || "")
        .up()
        .ele("days")
        .txt(region?.scheduleXmlData?.days || "")
        .up()
        .ele("time_zone_name")
        .txt(region?.scheduleXmlData?.time_zone_name || "")
        .up()
        .ele("base_url")
        .txt(region?.scheduleXmlData?.base_url || "")
        .up();

      let dayIdx = 1;
      for (const [date, dateEvents] of Object.entries(resultsByTimeAndRoom)) {
        const dayNode = scheduleNode.ele("day", {
          date,
          end: regionZone
            .fromString(date)
            .add(1, "day")
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ssZ"),
          index: dayIdx,
          start: regionZone.fromString(date).startOf("day").format("YYYY-MM-DDTHH:mm:ssZ"),
        });

        dayIdx += 1;
        for (const [room, roomEvents] of Object.entries(dateEvents)) {
          const roomId = roomEvents.find((e) => e.venue?.id)?.venue?.id;

          const roomNode = dayNode.ele("room", {
            name: room,
            // use venue id for uuid if none is set use venue name to generate a uuid
            guid: asUuid(roomId || room),
          });

          roomEvents.forEach((event) => {
            const durationMinutes = `00${event.duration % 60}`.slice(-2);
            const duration = `${Math.floor(event.duration / 60)}:${durationMinutes}`;
            const eventNode = roomNode
              .ele("event", {
                id: toPseudoHash(event.id),
                guid: asUuid(event.id),
              })
              .ele("date")
              .txt(regionZone.fromString(event.startLocal).format("YYYY-MM-DDTHH:mm:ssZ"))
              .up()
              .ele("start")
              .txt(regionZone.fromString(event.startLocal).format("HH:mm"))
              .up()
              .ele("duration")
              .txt(duration)
              .up()
              .ele("room")
              .txt(room)
              .up()
              .ele("slug")
              .txt(event.slug || "")
              .up()
              .ele("url")
              .txt(event.link || "")
              .up()
              .ele("title")
              .txt(event.title)
              .up()
              .ele("subtitle")
              .up()
              .ele("type")
              .up()
              .ele("language")
              .up()
              .ele("abstract")
              .up()
              .ele("description")
              .txt(textPlain(event.description))
              .up()
              .ele("logo")
              .up()
              .ele("links")
              .up()
              .ele("attachements")
              .up();

            function getCustomFieldValue(field: string) {
              return event.course?.customFields?.find((f) => f.name === field)?.value;
            }

            const recording = getCustomFieldValue("recording");
            // optout (do not record flag) is true when the customfield is not setted or when recording is disabled
            const optout = !(typeof recording === "boolean" && recording);
            eventNode
              .ele("recording")
              .ele("license")
              .up()
              .ele("optout")
              .txt("" + optout)
              .up()
              .up();

            const persons = eventNode.ele("persons");
            const speaker = getCustomFieldValue("speaker");
            if (typeof speaker === "string" && speaker) {
              persons
                .ele("person", {
                  id: toPseudoHash(speaker),
                })
                .txt(speaker);
            } else {
              // If no custom field with speaker exists we use the organization
              event.organizations.forEach((organization) => {
                persons
                  .ele("person", {
                    id: organization.id,
                  })
                  .txt(organization.name);
              });
            }
          });
        }
      }
      return scheduleNode.end({ prettyPrint: true });
    });
  },
});
