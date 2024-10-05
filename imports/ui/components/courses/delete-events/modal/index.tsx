import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { Regions } from "/imports/api/regions/regions";
import * as Alert from "/imports/api/alerts/alert";
import * as EventsMethods from "/imports/api/events/methods";
import { EventModel } from "/imports/api/events/events";

import * as Analytics from "/imports/ui/lib/analytics";

import { Event } from "./event";

import "./styles.scss";

export function Modal(props: {
  upcomingEvents: EventModel[];
  onHideEventsDeleteModal: () => void;
}) {
  const { t } = useTranslation();
  const [isBusy, setIsBusy] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([] as EventModel[]);
  const [allEventsSelected, setAllEventsSelected] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const modalRef = useRef(null);

  function isSelected(event: EventModel) {
    return !!selectedEvents?.some((e) => e._id === event._id);
  }
  function numSelectedEvents() {
    return selectedEvents.length || 0;
  }
  function noEventsSelected() {
    return selectedEvents.length === 0;
  }

  // set allEventsSelected to true if all events are selected
  useEffect(() => {
    const events = props.upcomingEvents;
    const newAllEventsSelected = events.length === selectedEvents.length;
    setAllEventsSelected(newAllEventsSelected);
  }, [props.upcomingEvents, selectedEvents.length]);

  // close confirmation dialog if no events are selected
  useEffect(() => {
    if (showDeleteConfirm) {
      if (!selectedEvents.length) {
        setShowDeleteConfirm(false);
      }
    }
  }, [showDeleteConfirm, selectedEvents.length]);

  useLayoutEffect(() => {
    if (!modalRef.current) {
      return;
    }
    $(modalRef.current)
      .modal("show")
      .on("hidden.bs.modal", function () {
        props.onHideEventsDeleteModal();
      });
  });

  return (
    <div className="modal delete-events-modal" ref={modalRef} tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-sm" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">
              <span className="fa-solid fa-trash-can fa-fw" aria-hidden="true"></span>{" "}
              {t("deleteEventsModal.title", "Delete events")}
            </h4>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {showDeleteConfirm ? (
              <>
                <div className="card">
                  <div className="card-header text-white bg-danger">
                    {t("deleteEventsModal.confirm", "Confirm deletion of events")}
                  </div>
                  <div className="card-body">
                    {t(
                      "deleteEventsModal.reallyDelete",
                      "Delete {NUM, plural, one{this event} other{these # events} }?",
                      { NUM: numSelectedEvents() },
                    )}
                  </div>
                  <ul className="list-group list-group-flush selected-events">
                    {selectedEvents.map((event) => {
                      return (
                        <li key={event._id} className="list-group-item list-group-item-danger">
                          <button
                            type="button"
                            className="btn-close btn-close-white float-end"
                            aria-label="Close"
                            onClick={() => {
                              setSelectedEvents(
                                selectedEvents.filter((se) => se._id !== event._id),
                              );
                            }}
                          ></button>
                          <Event event={event} />
                        </li>
                      );
                    })}
                  </ul>
                  <div className="card-body">
                    <div className="delete-events-actions">
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={isBusy}
                        onClick={() => {
                          setIsBusy(true);

                          const events = selectedEvents;
                          let removed = 0;
                          let responses = 0;
                          events?.forEach((event) => {
                            EventsMethods.remove(event._id)
                              .then(() => {
                                removed += 1;
                              })
                              .catch((err) => {
                                const start = moment(event.startLocal).format("llll");
                                Alert.serverError(
                                  err,
                                  t(
                                    "deleteEventsModal.errWithReason",
                                    'Could not delete the "{TITLE} ({START})" event.',
                                    { TITLE: event.title, START: start },
                                  ),
                                );
                              })
                              .finally(() => {
                                responses += 1;
                                if (responses === events.length) {
                                  setIsBusy(false);
                                  setShowDeleteConfirm(false);
                                  if (removed) {
                                    Alert.success(
                                      t(
                                        "deleteEventsModal.sucess",
                                        "{NUM, plural, one{Event was} other{# events were} } successfully deleted.",
                                        { NUM: removed },
                                      ),
                                    );

                                    Analytics.trackEvent(
                                      "Events deletions",
                                      "Events deletions as team",
                                      Regions.findOne(event.region)?.nameEn,
                                      removed,
                                    );
                                  }
                                  if (removed === responses) {
                                    setSelectedEvents([]);
                                    if (modalRef.current) {
                                      $(modalRef.current).modal("hide");
                                    }
                                  }
                                }
                              });
                          });
                        }}
                      >
                        {isBusy ? (
                          <>
                            <span
                              className="fa-solid fa-circle-notch fa-spin fa-fw"
                              aria-hidden="true"
                            ></span>
                            {t(
                              "deleteEventsModal.deletingEvents",
                              "Deleting {NUM, plural, one{event} other{events} }…",
                              { NUM: numSelectedEvents() },
                            )}
                          </>
                        ) : (
                          t(
                            "deleteEventsModal.confirmDeleteEvents",
                            "Delete {NUM, plural, one{event} other{events} }",
                            { NUM: numSelectedEvents() },
                          )
                        )}
                      </button>{" "}
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={isBusy}
                        onClick={() => {
                          setShowDeleteConfirm(false);
                        }}
                      >
                        {t("_button.cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="delete-events-list">
                  {props.upcomingEvents.map((event) => {
                    return (
                      <div key={event._id} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id={`deleteEventsListCheck${event._id}`}
                          checked={isSelected(event)}
                          disabled={isBusy}
                          onChange={(e) => {
                            let newSelectedEvents;

                            if (e.target.checked) {
                              newSelectedEvents = [...selectedEvents, event];
                            } else {
                              newSelectedEvents = selectedEvents.filter(
                                (se) => se._id !== event._id,
                              );
                            }

                            setSelectedEvents(newSelectedEvents);
                          }}
                        />
                        <label
                          className="form-check-label mb-1"
                          htmlFor={`deleteEventsListCheck${event._id}`}
                        >
                          <Event event={event} />
                        </label>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <button
                    className="btn btn-danger"
                    disabled={noEventsSelected()}
                    onClick={() => {
                      setShowDeleteConfirm(true);
                    }}
                  >
                    {t(
                      "deleteEventsModal.deleteEvents",
                      "Delete {NUM, plural, =0{event} one{event} other{# events} }",
                      { NUM: numSelectedEvents() },
                    )}
                  </button>{" "}
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      let newSelectedEvents: EventModel[];
                      if (allEventsSelected) {
                        newSelectedEvents = [];
                      } else {
                        newSelectedEvents = props.upcomingEvents;
                      }

                      setSelectedEvents(newSelectedEvents);
                    }}
                  >
                    {allEventsSelected
                      ? t("deleteEventsModal.clearSelection", "Clear selection")
                      : t("deleteEventsModal.selectAll", "Select all")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// for Blaze
// eslint-disable-next-line import/first
import "./template.html";

Template.registerHelper("DeleteEventsModal", () => Modal);
