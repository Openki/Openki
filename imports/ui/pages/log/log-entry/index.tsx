import React, {  useState } from "react";
import moment from "moment";
import { LogEntity } from "/imports/api/log/factory";

import "./styles.scss";

export function Entry({
  entryOrInterval,
  onIdClick,
  onTrackClick,
  onDateClick,
}: {
  entryOrInterval: LogEntity | { interval: string };
  onIdClick: (id: string) => void;
  onTrackClick: (track: string) => void;
  onDateClick: (date: Date) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function shortId(id: string) {
    return id.substring(0, 8);
  }

  return (
    <tr>
      {"interval" in entryOrInterval ? (
        <>
          <td></td>
          <td></td>
          <td colSpan={3} style={{ color: "gray" }}>
            {entryOrInterval.interval}
          </td>
        </>
      ) : (
        <>
          {" "}
          <td>
            <a
              className="js-rel-id id clickable"
              onClick={() => {
                onIdClick(entryOrInterval._id);
              }}
              title={entryOrInterval._id}
            >
              {shortId(entryOrInterval._id)}
            </a>
          </td>
          <td>
            <a
              className="js-tr id clickable"
              onClick={() => {
                onTrackClick(entryOrInterval.tr);
              }}
            >
              {entryOrInterval.tr}
            </a>
          </td>
          <td>
            <a
              className="js-date clickable nowrap"
              onClick={() => {
                onDateClick(entryOrInterval.ts);
              }}
            >
              {moment(entryOrInterval.ts).toISOString()}
            </a>
          </td>
          <td className="nowrap">
            {entryOrInterval.rel.map((id) => (
              <a
                className="js-rel-id id clickable nowrap"
                title={id}
                onClick={() => {
                  onIdClick(id);
                }}
              >
                {shortId(id)}
              </a>
            ))}
          </td>
          <td>
            {expanded ? (
              <pre
                onClick={() => {
                  setExpanded(false);
                }}
              >
                {JSON.stringify(entryOrInterval, null, "   ")}
              </pre>
            ) : (
              <div
                className="nowrap"
                onClick={() => {
                  setExpanded(true);
                }}
              >
                {JSON.stringify(entryOrInterval.body, null, "   ")}
              </div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}
