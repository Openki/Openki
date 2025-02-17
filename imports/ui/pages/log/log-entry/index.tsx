import React, { useState } from "react";
import moment from "moment";
import { LogEntity } from "/imports/api/log/factory";

import "./styles.scss";

export function Entry({
  entry,
  onIdClick,
  onTrackClick,
  onDateClick,
}: {
  entry: LogEntity | { interval: string };
  onIdClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, newId: string) => void;
  onTrackClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, newTrack: string) => void;
  onDateClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, newDate: Date) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function shortId(id: string) {
    return id.substring(0, 8);
  }

  return (
    <tr>
      {"interval" in entry ? (
        <>
          <td></td>
          <td></td>
          <td colSpan={3} style={{ color: "gray" }}>
            {entry.interval}
          </td>
        </>
      ) : (
        <>
          <td>
            <a
              className="js-rel-id id clickable"
              onClick={(event) => {
                onIdClick(event, entry._id);
              }}
              title={entry._id}
            >
              {shortId(entry._id)}
            </a>
          </td>
          <td>
            <a
              className="js-tr id clickable"
              onClick={(event) => {
                onTrackClick(event, entry.tr);
              }}
            >
              {entry.tr}
            </a>
          </td>
          <td>
            <a
              className="js-date clickable nowrap"
              onClick={(event) => {
                onDateClick(event, entry.ts);
              }}
            >
              {moment(entry.ts).toISOString()}
            </a>
          </td>
          <td className="nowrap">
            {entry.rel.map((id) => (
              <a
                key={id}
                className="js-rel-id id clickable nowrap"
                title={id}
                onClick={(event) => {
                  onIdClick(event, id);
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
                {JSON.stringify(entry, null, "   ")}
              </pre>
            ) : (
              <div
                className="nowrap"
                onClick={() => {
                  setExpanded(true);
                }}
              >
                {JSON.stringify(entry.body, null, "   ")}
              </div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}
