import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "/imports/startup/client/bootstrap";

import { EventModel, EventParticipant } from "/imports/api/events/events";
import * as EventsMethods from "/imports/api/events/methods";

import { useUser } from "/imports/ui/hooks/react-meteor-data";
import { cx } from "/imports/utils/cx";

import { Contribution } from "../../Contribution";
import { SendMessage, Props as SendMessageProps } from "../../SendMessage";
import { RemoveDropdown } from "./remove-dropdown";
import { ParticipantContact } from "/imports/ui/components/participant/contact";
import { ProfileLink } from "/imports/ui/components/profile-link";
import { ButtonIcon } from "/imports/ui/components/Buttons";

import "./styles.scss";

function EventParticipant({
  participant,
  event,
}: {
  participant: EventParticipant;
  event: EventModel;
}) {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <div
      className={cx(
        "event-participant d-flex flex-wrap align-items-center",
        participant.user === user?._id && "bg-user",
      )}
    >
      <div className="me-1">
        <ProfileLink userId={participant.user} />
        <Contribution userId={participant.user} />
      </div>
      <ParticipantContact participant={participant.user} event={event} />
      <div className="ms-auto d-flex flex-wrap align-items-center">
        {!!participant.companions && (
          <span
            className="p-1 bg-primary text-light fw-bold"
            data-bs-title={t("eventParticipant.iBringCompanions", "Brings companion.")}
          >
            +{participant.companions} <i className="fa-solid fa-user fa-fw" />
          </span>
        )}

        {!!user && user._id !== participant.user && event.editableBy(user) && (
          <RemoveDropdown
            userId={participant.user}
            onClick={() => {
              EventsMethods.removeParticipant(event._id, participant.user);
            }}
          />
        )}
      </div>
    </div>
  );
}

export interface Props {
  event: EventModel;
}

export function EventParticipants({ event }: Props) {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const user = useUser();
  const IncreaseBy = 10;
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

  function howManyFreePlaces() {
    const occupied = event.numberOfParticipants();
    return event.maxParticipants - occupied;
  }

  function canNotifyAll() {
    if (!((event.participants?.length || 0) > 1)) {
      return false;
    }

    return !!(user && event.editableBy(user));
  }

  function sendMessageAttr(): Omit<SendMessageProps, "recipientId"> {
    return {
      autoFocus: true,
      placeholder: t(
        "eventParticipants.sendMessage.placeholder",
        "Hi there, I'm looking forward for tomorrow. Please bring your laptops. And don't forget to opt out now if you can't attend in order to free your seat.",
      ),
      onSend: async (message, options) => {
        EventsMethods.contactParticipants(event._id, message, options);
        const element = modalRef.current as unknown as Element;
        Modal.getOrCreateInstance(element).hide();
      },
      // When sending a message to all participants, show the email options
      // to allow the event organizer to send an email notification and include their email
      // for easy communication with the participants.
      showEmailOptions: true,
    };
  }

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

  function toggleModal() {
    setShowModal(!showModal);
  }

  return (
    <>
      <div data-test="events-participants" className="page-component-header">
        {showModal && (
          <div className="modal" tabIndex={-1} role="dialog" ref={modalRef}>
            <div className="modal-dialog modal-sm" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title d-flex align-items-center gap-2">
                    <i className="fa-solid fa-paper-plane fa-fw" />
                    <span>
                      {t(
                        "participantContactModal.writeMessageToAllAttendees",
                        "Write a message to all participants",
                      )}
                    </span>
                  </h4>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label={t("_button.close")}
                  ></button>
                </div>
                <div className="modal-body text-dark">
                  <SendMessage {...sendMessageAttr()} recipientId={`event:${event._id}`} />
                </div>
              </div>
            </div>
          </div>
        )}
        <h4 data-test="events-participants-header">
          {t(
            "event.details.participants.title",
            "{NUM, plural, =0{No participants yet} one{1 Participant} other{# Participants} }",
            { NUM: event.numberOfParticipants() },
          )}
          {canNotifyAll() && (
            <ButtonIcon
              id="events-participants-notify-all"
              className="btn-lg btn-primary"
              onClick={toggleModal}
              label={t("event.details.participants.contact-all", "Contact all participants")}
              icon="fa-solid fa-paper-plane"
            />
          )}
          <br />
          {!!event.maxParticipants && !event.canceled && (
            <div className="fs-6 text-end">
              {t(
                "event.details.participants.free.places",
                "{NUM, plural, =0{No free seats} one{one free seat} other{# free seats} }",
                { NUM: howManyFreePlaces() },
              )}
            </div>
          )}
        </h4>
      </div>
      {!!event.participants && (
        <div className="event-participants">
          {sortedParticipants()?.map((participant) => {
            return (
              <EventParticipant key={participant.user} participant={participant} event={event} />
            );
          })}
          {limited() && (
            <button
              className="btn btn-add page-component-btn"
              type="button"
              onClick={() => {
                setParticipantsDisplayLimit(participantsDisplayLimit + IncreaseBy);
              }}
            >
              {t("_button.more")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
