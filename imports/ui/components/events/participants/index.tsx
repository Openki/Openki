import { useTranslation } from 'react-i18next';
import React, { useEffect, useRef, useState } from 'react';
import { useUserId } from 'meteor/react-meteor-accounts';
import bootstrap from 'bootstrap';
import { Template } from 'meteor/templating';

import { EventModel } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';

import * as UserPrivilegeUtils from '/imports/utils/user-privilege-utils';
import { useUser } from '/imports/utils/react-meteor-data';

import { ParticipantContact } from '/imports/ui/components/participant/contact';
import { ProfileLink } from '/imports/ui/components/profile-link';
import { SendMessage, Data as SendMessageData } from '/imports/ui/components/send-message';
import { Contribution } from '/imports/ui/components/contribution';

import './styles.scss';

function EventParticipant(props: { participant: string; event: EventModel }) {
	const userId = useUserId();
	const { participant, event } = props;

	function ownUserParticipantClass() {
		if (participant === userId) {
			return 'is-own-user';
		}
		return '';
	}

	return (
		<div className={`event-participant ${ownUserParticipantClass()}`}>
			<ProfileLink userId={participant} />
			&nbsp;
			<Contribution userId={participant} />
			&nbsp;
			<ParticipantContact participant={participant} event={event} />
		</div>
	);
}

export function EventParticipants(data: { event: EventModel }) {
	const { t } = useTranslation();
	const modalRef = useRef(null);
	const user = useUser();
	const IncreaseBy = 10;
	const [participantsDisplayLimit, setParticipantsDisplayLimit] = useState(IncreaseBy);
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		if (!showModal) {
			return;
		}
		const element = modalRef.current as unknown as Element;
		bootstrap.Modal.getOrCreateInstance(element).show();
		element.addEventListener('hidden.bs.modal', () => {
			setShowModal(false);
		});
	});

	function howManyEnrolled() {
		const event = data.event;

		return event.participants?.length || 0;
	}

	function howManyFreePlaces() {
		const event = data.event;
		const occupied = event.participants?.length || 0;
		return event.maxParticipants - occupied;
	}

	function canNotifyAll() {
		const { participants } = data.event;

		if (!(participants && participants.length > 1)) {
			return false;
		}

		if (UserPrivilegeUtils.privilegedTo('admin')) {
			return true;
		}

		const event = data.event;

		return !!(
			(user && event?.editableBy(user)) ||
			user?.groups.some((g) => event?.groupOrganizers.includes(g))
		);
	}

	function sendMessageAttr(): SendMessageData {
		return {
			placeholder: t(
				'eventParticipants.sendMessage.placeholder',
				"Hi there, I'm looking forward for tomorrow. Please bring your laptops. And don't forget to opt out now if you can't attend in order to free your seat.",
			),
			onSend: async (message, options) => {
				EventsMethods.contactParticipants(data.event._id, message, options);
				const element = modalRef.current as unknown as Element;
				bootstrap.Modal.getOrCreateInstance(element).hide();
			},
		};
	}

	function sortedParticipants() {
		const { participants } = data.event;
		if (user?._id && participants?.includes(user._id)) {
			const userArrayPosition = participants.indexOf(user._id);
			// remove current user form array and read him at index 0
			participants.splice(userArrayPosition, 1); // remove
			participants.splice(0, 0, user._id); // read
		}
		return participants?.slice(0, participantsDisplayLimit);
	}

	function limited() {
		return (
			participantsDisplayLimit &&
			data.event.participants &&
			data.event.participants?.length > participantsDisplayLimit
		);
	}

	return (
		<>
			<div className="event-page-component-header">
				{showModal ? (
					<div className="modal" tabIndex={-1} role="dialog" ref={modalRef}>
						<div className="modal-dialog modal-sm" role="document">
							<div className="modal-content">
								<div className="modal-header">
									<h4 className="modal-title">
										<span className="fa-solid fa-paper-plane fa-fw" aria-hidden="true"></span>
										{t(
											'participantContactModal.writeMessageToAllAttendees',
											'Write a message to all participants',
										)}
									</h4>
									<button
										type="button"
										className="btn-close"
										data-bs-dismiss="modal"
										aria-label="Close"
									></button>
								</div>
								<div className="modal-body text-dark">
									<SendMessage {...sendMessageAttr()} />
								</div>
							</div>
						</div>
					</div>
				) : null}
				<h4>
					<span className="fa-solid fa-users fa-fw" aria-hidden="true"></span>&nbsp;
					{t(
						'event.details.paticipants.title',
						'{NUM, plural, =0{No participants yet} one{1 Participant} other{# Participants} }',
						{ NUM: howManyEnrolled() },
					)}
					{canNotifyAll() ? (
						<i
							className="fa-solid fa-envelope event-participants-contact float-end"
							onClick={() => {
								setShowModal(!showModal);
							}}
						></i>
					) : null}
					<br />
					{data.event.maxParticipants ? (
						<span className="free-places">
							{t(
								'event.details.participants.free.places',
								'{NUM, plural, =0{No free seats} one{one free seat} other{# free seats} }',
								{ NUM: howManyFreePlaces() },
							)}
						</span>
					) : null}
				</h4>
			</div>
			{data.event.participants ? (
				<div className="event-participants">
					{sortedParticipants()?.map((participant) => {
						return (
							<EventParticipant key={participant} participant={participant} event={data.event} />
						);
					})}
					{limited() ? (
						<button
							className="btn btn-add event-page-btn"
							type="button"
							onClick={() => {
								setParticipantsDisplayLimit(participantsDisplayLimit + IncreaseBy);
							}}
						>
							{t('_button.more')}
						</button>
					) : null}
				</div>
			) : null}
		</>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('EventParticipants', () => EventParticipants);
