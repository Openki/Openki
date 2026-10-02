import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";
import { useUser } from "/imports/ui/hooks/react-meteor-data";

import { EventModel, EventParticipant } from "/imports/api/events/events";

import { ReactJoin } from "/imports/utils/ReactJoin";
import { cx } from "/imports/utils/cx";

import { UserName } from "/imports/ui/components/UserName";

import "./styles.scss";

function EventParticipant({ participant }: { participant: EventParticipant }) {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <span className={cx(participant.user === user?._id && "fw-bold")}>
      <UserName userId={participant.user} />
      {!!participant.companions && (
        <>
          {" "}
          <span
            className="badge rounded-pill text-bg-primary text-white"
            data-bs-title={t("eventParticipant.iBringCompanions", "Brings companion.")}
          >
            +{participant.companions}
          </span>
        </>
      )}
    </span>
  );
}

export interface Props {
  event: EventModel;
}

export function EventParticipants({ event }: Props) {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const user = useUser();
  const IncreaseBy = 5;
  const [participantsDisplayLimit, setParticipantsDisplayLimit] = useState(IncreaseBy);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const element = modalRef.current as unknown as Element;
    if (!showModal || !element) {
      return;
    }
    Modal.getOrCreateInstance(element).show();
    element.addEventListener("hidden.bs.modal", () => {
      setShowModal(false);
    });
  });

  function sortedParticipants() {
    const participants = event.participants || [];
    if (user?._id && event.attendedBy(user._id)) {
      const userArrayPosition = participants.findIndex((p) => p.user === user._id);
      const userParticipant = participants[userArrayPosition];
      // remove current user form array and read him at index 0
      participants.splice(userArrayPosition, 1); // remove
      participants.splice(0, 0, userParticipant); // read
    }
    return participants.slice(0, participantsDisplayLimit);
  }

  function limited() {
    return (
      !!participantsDisplayLimit &&
      !!event.participants &&
      event.participants.length > participantsDisplayLimit
    );
  }

  return (
    <>
      <h4 className="card-title">
        {t(
          "event.details.participants.title",
          "{NUM, plural, =0{No participants yet} one{1 Participant} other{# Participants} }",
          { NUM: event.numberOfParticipants() },
        )}
      </h4>
      {!!event.participants && (
        <p className="card-text">
          {ReactJoin(
            sortedParticipants()?.map((participant) => (
              <EventParticipant key={participant.user} participant={participant} />
            )),
          )}
          {limited() && (
            <>
              {" "}
              <button
                className="btn btn-sm btn-secondary"
                type="button"
                onClick={() => {
                  setParticipantsDisplayLimit(participantsDisplayLimit + IncreaseBy);
                }}
              >
                {t("_button.more")}
              </button>
            </>
          )}
        </p>
      )}
    </>
  );
}
