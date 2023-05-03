/* eslint-disable no-nested-ternary */
import { Router } from 'meteor/iron:router';
import { useTranslation } from 'react-i18next';
import { Template } from 'meteor/templating';
import React, { useState } from 'react';
import { useUser } from '/imports/utils/react-meteor-data';
import moment from 'moment';
import { useDateTimeFormat } from '/imports/utils/react-moment-format';

import * as Alert from '/imports/api/alerts/alert';
import { EventModel } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { Regions } from '/imports/api/regions/regions';
import { useDetails } from '/imports/api/courses/publications';

import { PleaseLogin } from '/imports/ui/components/please-login';
import { EventParticipants } from '/imports/ui/components/events/participants';
import { Report } from '/imports/ui/components/report';
import { ButtonCancel } from '/imports/ui/components/buttons';

import * as Analytics from '/imports/ui/lib/analytics';

import './styles.scss';

function ButtonRegister(props: { onClick: () => void; busy?: boolean | undefined }) {
	const { t } = useTranslation();

	return (
		<PleaseLogin
			type="button"
			className="btn btn-add btn-event text-center"
			onClick={props.onClick}
			disabled={props.busy}
		>
			{props.busy ? (
				<>
					<span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{' '}
					{t('_button.registering', 'Registering…')}
				</>
			) : (
				t('event.details.register-register', 'Register')
			)}
		</PleaseLogin>
	);
}

function ButtonRegistrationClosed(props: {
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	busy?: boolean | undefined;
}) {
	const { t } = useTranslation();

	return (
		<button
			type="button"
			className="btn btn-warning btn-event text-center"
			onClick={props.onClick}
			disabled={props.busy}
		>
			{props.busy ? (
				<>
					<span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{' '}
					{t('_button.addingYouToWaitingQueue', 'Adding you to waiting queue…')}
				</>
			) : (
				t('event.details.isFullyBooked', 'The event is fully booked')
			)}
		</button>
	);
}

function ButtonUnregister(props: {
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	busy?: boolean | undefined;
}) {
	const { t } = useTranslation();

	return (
		<button
			type="button"
			className="btn btn-danger btn-event text-center"
			onClick={props.onClick}
			disabled={props.busy}
		>
			{props.busy ? (
				<>
					<span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>{' '}
					{t('_button.unregistering', 'Unregistering…')}
				</>
			) : (
				t('event.details.unregister-withdraw', 'Withdraw')
			)}
		</button>
	);
}

export function EventRegistration(props: { event: EventModel }) {
	const { event } = props;
	const user = useUser();

	const [isLoading, course] = useDetails(event.courseId || '-1');

	const { t } = useTranslation();
	const [registerDropdown, setRegisterDropdown] = useState(false);
	const [unregisterDropdown, setUnregisterDropdown] = useState(false);
	const [isBusy, setIsBusy] = useState('');
	const { dateFormat } = useDateTimeFormat();

	async function addParticipant() {
		setIsBusy('registering');
		try {
			await EventsMethods.addParticipant(event._id);

			Analytics.trackEvent('RSVPs', 'RSVPs as participant', Regions.findOne(event.region)?.nameEn);
		} catch (err) {
			Alert.serverError(err);
		}
	}

	function userName() {
		return user?.getDisplayName() || t('eventDetails.notLoggedIn', '(not logged in?)');
	}
	function courseTitle() {
		if (event.courseId) {
			return course?.name;
		}
		return undefined;
	}
	function acceptsParticipants() {
		// no maxParticipants
		if (!event.maxParticipants) {
			return true;
		}

		if (!event.participants) {
			return true;
		}

		if (event.participants.length < event.maxParticipants) {
			return true;
		}
		return false;
	}
	function isFuture() {
		return moment().isBefore(event.end);
	}
	function userRegisteredForEvent() {
		const userId = user?._id;
		return userId && event.participants?.includes(userId);
	}
	function anyDropdown() {
		return unregisterDropdown || registerDropdown;
	}

	return (
		<>
			{Router.current().params.query.action === 'register' ? (
				<PleaseLogin
					type="auto"
					onRender={() => {
						// register from email
						addParticipant();
					}}
				/>
			) : null}
			{isFuture() ? (
				<>
					<div className="page-component">
						<div className="event-page-component-header">
							<h4>{t('event.details.registration', 'Registration')}</h4>
						</div>
					</div>
					<div className="page-component">
						<b>
							{!userRegisteredForEvent()
								? t(
										'event.details.i-participate-no',
										'Let it be known you are participating in this event. Your registration is binding.',
								  )
								: t(
										'event.details.i-participate-yes',
										'You are now registered. Your registration is binding.',
								  )}
						</b>
					</div>
					<div
						className={`page-component ${
							anyDropdown() ? 'pt-3 px-3 event-detail-register-dropdown' : ''
						}`}
					>
						{!userRegisteredForEvent() ? (
							acceptsParticipants() ? (
								!registerDropdown ? (
									<button
										type="button"
										className="btn btn-add btn-event"
										onClick={() => {
											setRegisterDropdown(true);
										}}
									>
										{t('event.details.reserve-a-seat', 'Reserve a seat')}
									</button>
								) : (
									<>
										<p>
											{t(
												'event.details.want-to-register',
												'Do you want to reserve a seat as {USERNAME} for the event "{EVENTTITLE}" on the {DATE}? Your reservation is binding.',
												{
													USERNAME: userName(),
													EVENTTITLE: event.title,
													DATE: dateFormat(event.startLocal),
												},
											)}
										</p>
										<div className="row justify-content-between align-items-center pb-3">
											<div className="col-lg-4 d-grid">
												<ButtonCancel
													onClick={() => {
														setRegisterDropdown(false);
													}}
												/>
											</div>
											<div className="col-lg-7 d-grid">
												<ButtonRegister
													onClick={async () => {
														await addParticipant();
														setRegisterDropdown(false);
													}}
													busy={isBusy === 'registering'}
												/>
											</div>
										</div>
									</>
								)
							) : (
								<ButtonRegistrationClosed busy={isBusy === 'registering'} />
							)
						) : (
							<>
								{!unregisterDropdown ? (
									<button
										type="button"
										className="btn btn-add btn-event"
										onClick={() => {
											setUnregisterDropdown(true);
										}}
									>
										{t('event.details.withdraw-registration', 'Withdraw my registration')}
									</button>
								) : (
									<>
										<p>
											{t(
												'event.details.want-to-withdraw',
												'Do you want to withdraw your registration for the event "{EVENTTITLE}" on the {DATE}?',
												{ EVENTTITLE: event.title, DATE: dateFormat(event.startLocal) },
											)}
										</p>
										<div className="row justify-content-between align-items-center pb-3">
											<div className="col-lg-4 d-grid">
												<ButtonCancel
													onClick={() => {
														setUnregisterDropdown(false);
													}}
												/>
											</div>
											<div className="col-lg-7 d-grid">
												<ButtonUnregister
													onClick={async () => {
														setIsBusy('unregistering');

														try {
															await EventsMethods.removeParticipant(event._id);

															Analytics.trackEvent(
																'Unsubscribes RSVPs',
																'Unsubscribes RSVPs as participant',
																Regions.findOne(event.region)?.nameEn,
															);
														} catch (err) {
															Alert.serverError(err, 'could not remove participant');
														} finally {
															setIsBusy('');
														}
														setUnregisterDropdown(false);
													}}
													busy={isBusy === 'unregistering'}
												/>
											</div>
										</div>
										{!isLoading() && courseTitle() ? (
											<p className="pb-3">
												{t(
													'event.details.youStayEnrolled',
													'Note that you will stay enrolled as interested for {COURSETITLE}.',
													{ COURSETITLE: courseTitle() },
												)}
											</p>
										) : null}
									</>
								)}
							</>
						)}
					</div>
				</>
			) : null}

			<div className="page-component">
				<EventParticipants event={event} />
			</div>
			<div className="page-component">
				<Report />
			</div>
		</>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('EventRegistration', () => EventRegistration);
