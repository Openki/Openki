import { Router } from "meteor/iron:router";
import React from "react";
import { useTranslation } from "react-i18next";
import { FormCheck } from "../../FormCheck";
import { useAffectedReplica } from "/imports/api/events/publications";
import { useDateTimeFormat } from "/imports/utils/react-moment-format";
import { cx } from "/imports/utils/cx";

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
      <FormCheck
        id="event-edit-update-replicas-info"
        type="box"
        label={t(
          "event.edit.updateReplicasInfo",
          "Update {COUNT, plural, one{info from later copy} other{info from # later copies} } as well.",
          { COUNT: affectedReplica.length },
        )}
        onChange={(checked) => onChange({ ...values, infos: checked })}
        checked={values.infos}
      />
      {timeChanged && (
        <>
          <FormCheck
            id="event-edit-update-replicas-time"
            type="box"
            label={t(
              "event.edit.updateReplicasTime",
              "Update time from {COUNT, plural, one{copy} other{copies} }",
              { COUNT: affectedReplica.length },
            )}
            checked={values.time}
            disabled={startDayChanged}
            onChange={(checked) => onChange({ ...values, time: checked })}
          />
          {startDayChanged ? (
            <div className="card text-white bg-danger mb-4">
              <div className="card-body p-2">
                <i className="fa-solid fa-triangle-exclamation fa-fw" />
                {t(
                  "event.edit.startDayChanged",
                  "Updating the copies when the start day has been changed is not (yet) supported.",
                )}
              </div>
            </div>
          ) : (
            changedReplicas().length > 0 && (
              <div className={cx("card mb-4 changed-replicas", values.time && "is-emphasized")}>
                <div className="card-header bg-warning">
                  <i className="fa-solid fa-triangle-exclamation fa-fw" />
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
                      <li key={replica._id}>
                        <a
                          href={Router.path("showEvent", replica)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {dateFormat(replica.startLocal)}-{replica.title}(
                          {timeFormat(replica.startLocal)}-{timeFormat(replica.endLocal)})
                        </a>
                      </li>
                    ))}
                  </ul>
                  <FormCheck
                    id="event-edit-update-changed-replicas-time"
                    type="box"
                    label={t(
                      "event.edit.updateChangedReplicasTime",
                      "Overwrite {NUM, plural, one{this events} other{these events} } time too",
                      { NUM: changedReplicas().length },
                    )}
                    onChange={(checked) => onChange({ ...values, timeOfChangedReplicas: checked })}
                    checked={values.timeOfChangedReplicas}
                  />
                </div>
              </div>
            )
          )}
        </>
      )}
    </>
  );
}
