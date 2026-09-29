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
  onIdClick: (newId: string) => void;
  onTrackClick: (newTrack: string) => void;
  onDateClick: (newDate: Date) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  function shortId(id: string) {
    return id.substring(0, 8);
  }

  function toggleUnlessTextSelected() {
    // Abort if text is selected. This prevents unwanted collapsing/expanding of the log entry details
    if (document.getSelection()?.type === "Range") {
      return;
    }

    setExpanded(!expanded);
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
              onClick={() => {
                onIdClick(entry._id);
              }}
              title={entry._id}
            >
              {shortId(entry._id)}
            </a>
          </td>
          <td>
            <a
              className="js-tr id clickable"
              onClick={() => {
                onTrackClick(entry.tr);
              }}
            >
              {entry.tr}
            </a>
          </td>
          <td>
            <a
              className="js-date clickable nowrap"
              onClick={() => {
                onDateClick(entry.ts);
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
              <pre onClick={toggleUnlessTextSelected}>{JSON.stringify(entry, null, 3)}</pre>
            ) : (
              <div className="nowrap" onClick={toggleUnlessTextSelected}>
                {JSON.stringify(entry.body, null, 3)}
              </div>
            )}
          </td>
        </>
      )}
    </tr>
  );
}
