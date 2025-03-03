import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { useAffectedReplica } from "/imports/api/events/publications";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";

export function UpdateAffectedReplica({
  values,
  event,
  startDayChanged,
  timeChanged,
  onChange,
}: {
  values: { infos: boolean; time: boolean; timeOfChangedReplicas: boolean };
  event: {
    _id: string;
    startLocal: string;
    endLocal: string;
  };
  startDayChanged: boolean;
  timeChanged: boolean;
  onChange: (newValues: { infos: boolean; time: boolean; timeOfChangedReplicas: boolean }) => void;
}) {
  const { t } = useTranslation();
  const { timeFormat, dateFormat } = useDateTimeFormat();

  const [isAffectedReplicaLoading, affectedReplica] = useAffectedReplica(event._id);

  function changedReplicas() {
    return affectedReplica.filter((replica) => !replica.sameTime(event));
  }

  if (isAffectedReplicaLoading() || affectedReplica.length === 0) {
    return null;
  }

  return (
    <>
      <div className="form-check mt-2">
        <input
          className="form-check-input"
          type="checkbox"
          name="updateReplicasInfo"
          id="eventEditUpdateReplicasInfoCheck"
          onChange={(ev) => {
            onChange({ ...values, infos: ev.currentTarget.checked });
          }}
          checked={values.infos}
        />
        <label className="form-check-label" htmlFor="eventEditUpdateReplicasInfoCheck">
          {t(
            "event.edit.updateReplicasInfo",
            "Update {COUNT, plural, one{info from later copy} other{info from # later copies} } as well.",
            { COUNT: affectedReplica.length },
          )}
        </label>
      </div>
      {timeChanged && (
        <>
          <div className={`form-check ${startDayChanged ? "disabled" : ""}`}>
            <input
              className="form-check-input"
              type="checkbox"
              name="updateReplicasTime"
              value=""
              id="eventEditUpdateReplicasTimeCheck"
              disabled={startDayChanged}
              onChange={(ev) => {
                onChange({ ...values, time: ev.currentTarget.checked });
              }}
              checked={values.time}
            />
            <label className="form-check-label" htmlFor="eventEditUpdateReplicasTimeCheck">
              {t(
                "event.edit.updateReplicasTime",
                "Update time from {COUNT, plural, one{copy} other{copies} }",
                { COUNT: affectedReplica.length },
              )}
            </label>
          </div>
          {startDayChanged ? (
            <div className="card text-white bg-danger mb-4">
              <div className="card-body p-2">
                <span className="fa-solid fa-triangle-exclamation fa-fw" aria-hidden="true"></span>
                {t(
                  "event.edit.startDayChanged",
                  "Updating the copies when the start day has been changed is not (yet) supported.",
                )}
              </div>
            </div>
          ) : (
            changedReplicas().length > 0 && (
              <div className={`card mb-4 changed-replicas ${values.time ? "is-emphasized" : ""}`}>
                <div className="card-header bg-warning">
                  <span
                    className="fa-solid fa-triangle-exclamation fa-fw"
                    aria-hidden="true"
                  ></span>
                  {t(
                    "event.edit.changedReplicas.heading",
                    "Found {NUM, plural, one{one copy which varies} other{# copies which vary} } in time",
                    { NUM: changedReplicas().length },
                  )}
                </div>
                <div className="card-body">
                  {!values.timeOfChangedReplicas && (
                    <span className="update-changed-replicas-help">
                      {t(
                        "event.edit.changedReplicas.body",
                        "By default {NUM, plural, one{this copy} other{these copies} } won't be updated as {NUM, plural, one{it has} other{they have} } another time set than the original event:",
                        { NUM: changedReplicas().length },
                      )}
                    </span>
                  )}

                  <ul>
                    {changedReplicas().map((replica) => (
                      <li>
                        <a href={Router.path("showEvent", replica)} target="_blank">
                          {dateFormat(replica.startLocal)}-{replica.title}(
                          {timeFormat(replica.startLocal)}-{timeFormat(replica.endLocal)})
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="updateChangedReplicasTime"
                      id="eventEditUpdateChangedReplicasTimeCheck"
                      onChange={(ev) => {
                        onChange({ ...values, timeOfChangedReplicas: ev.currentTarget.checked });
                      }}
                      checked={values.timeOfChangedReplicas}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="eventEditUpdateChangedReplicasTimeCheck"
                    >
                      {t(
                        "event.edit.updateChangedReplicasTime",
                        "Overwrite {NUM, plural, one{this events} other{these events} } time too",
                        { NUM: changedReplicas().length },
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </>
  );
}
