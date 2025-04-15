import moment from "moment";
import { v5 as uuidv5 } from "uuid";
import { create } from "xmlbuilder2";
import { ApiEvent } from "/imports/Api";
import { Router } from "meteor/iron:router";
import { FilteringReadError } from "/imports/utils/filtering";
import { NoActionError, orderedResults } from "./api.routes.utils";
import { textPlain } from "/imports/utils/html-tools";
import { Regions } from "/imports/api/regions/regions";

const OPENKI_UUID_NAMESPACE = "bfcc029a-5d16-4863-af43-17277e2e717b";

const sortByTimeAndRoom = (results: ApiEvent[]) =>
  results.reduce((accumulator: Record<string, Record<string, ApiEvent[]>>, current: ApiEvent) => {
    const currentDate = moment(current.start).format("YYYY-MM-DD");

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
  }, {});

const xmlSendResponder = async function (res: any, process: any) {
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
      /* eslint-disable-next-line no-console */
      console.log(e, e.stack);
      res.statusCode = 500;
      body.status = "error";
      body.message = "Server error";
    }
    res.end(JSON.stringify(body, null, "\t"));
  }
};

const pseudoHash = function (str: string) {
  let hash = 0;
  for (let i = 0, len = str.length; i < len; i += 1) {
    const chr = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash < 0 ? hash * -1 : hash;
};

Router.route("api.0.xml", {
  path: "/api/0/xml/schedule",
  where: "server",
  async action() {
    await xmlSendResponder(this.response, async () => {
      const region = await Regions.findOneAsync({ _id: this.params.query.region });

      // Hide canceled events in schedule
      this.params.query.canceled = this.params.query.canceled ?? "0";
      const results = await orderedResults(this.params, "events");

      const resultsByTimeAndRoom = sortByTimeAndRoom(results);

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
          end: moment(date).add(1, "day").startOf("day").format("YYYY-MM-DDTHH:mm:ssZ"),
          index: dayIdx,
          start: moment(date).startOf("day").format("YYYY-MM-DDTHH:mm:ssZ"),
        });

        dayIdx += 1;
        for (const [room, roomEvents] of Object.entries(dateEvents)) {
          const roomNode = dayNode.ele("room", {
            name: room,
          });
          // eslint-disable-next-line no-loop-func
          roomEvents.forEach(
            // eslint-disable-next-line no-loop-func
            (event: any) => {
              const durationMinutes = `00${event.duration % 60}`.slice(-2);
              const duration = `${Math.floor(event.duration / 60)}:${durationMinutes}`;
              const eventNode = roomNode
                .ele("event", {
                  id: pseudoHash(event.id),
                  guid: uuidv5(event.id, OPENKI_UUID_NAMESPACE),
                })
                .ele("date")
                .txt(moment(event.startLocal).format("YYYY-MM-DDTHH:mm:ssZ"))
                .up()
                .ele("start")
                .txt(moment(event.startLocal).format("HH:mm"))
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
                .ele("recording")
                .ele("license")
                .up()
                .ele("optout")
                .txt("false")
                .up()
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

              let hasPerson = false;
              const fields = event.course.customFields;
              if (typeof fields === `object`) {
                const persons = eventNode.ele("persons");
                fields.forEach((field: any) => {
                  if (field.name === `speaker`) {
                    hasPerson = true;
                    persons
                      .ele("person", {
                        id: pseudoHash(field.value),
                      })
                      .txt(field.value);
                  }
                });
              }

              // If no custom field with speaker exists we use de group
              if (!hasPerson) {
                const persons = eventNode.ele("persons");
                // eslint-disable-next-line no-loop-func
                event.groups.forEach((group: any) => {
                  persons
                    .ele("person", {
                      id: group.id,
                    })
                    .txt(group.name);
                });
              }
            },
          );
        }
      }
      return scheduleNode.end({ prettyPrint: true });
    });
  },
});
