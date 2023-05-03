/* eslint-disable no-nested-ternary */
import { Router } from 'meteor/iron:router';
import { useTranslation } from 'react-i18next';
import { Template } from 'meteor/templating';
import React, { useState } from 'react';
import { useUser } from '/imports/utils/react-meteor-data';
import moment from 'moment';

import * as Alert from '/imports/api/alerts/alert';
import { EventModel } from '/imports/api/events/events';
import * as EventsMethods from '/imports/api/events/methods';
import { Regions } from '/imports/api/regions/regions';

import { PleaseLogin } from '/imports/ui/lib/please-login';

import * as Analytics from '/imports/ui/lib/analytics';

import './styles.scss';
import { EventParticipants } from '../../participants';
import { Report } from '../../../report';
import { useDetails } from '/imports/api/courses/publications';
import { ButtonCancel } from '../../../buttons';
import { useDateTimeFormat } from '/imports/utils/react-moment-format';

function ButtonRegister(props: {
	onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
	busy?: boolean | undefined;
}) {
	const { t } = useTranslation();

	return (
		<button
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
		</button>
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

export function EventRegistration(data: EventModel) {
	const user = useUser();

	const [isLoading, course] = useDetails(data.courseId || '-1');

	const { t } = useTranslation();
	const [registerDropdown, setRegisterDropdown] = useState(false);
	const [unregisterDropdown, setUnregisterDropdown] = useState(false);
	const [isBusy, setIsBusy] = useState('');
	const { dateFormat } = useDateTimeFormat();

	function addParticipant() {
		setIsBusy('registering');
		PleaseLogin(instance, async () => {
			try {
				await EventsMethods.addParticipant(data._id);

				Analytics.trackEvent('RSVPs', 'RSVPs as participant', Regions.findOne(data.region)?.nameEn);
			} catch (err) {
				Alert.serverError(err);
			}
		});
	}

	// register from email
	if (Router.current().params.query.action === 'register') {
		addParticipant();
	}

	function userName() {
		return user?.getDisplayName() || t('eventDetails.notLoggedIn', '(not logged in?)');
	}
	function courseTitle() {
		if (data.courseId) {
			return course?.name;
		}
		return undefined;
	}
	function acceptsParticipants() {
		// no maxParticipants
		if (!data.maxParticipants) {
			return true;
		}

		if (!data.participants) {
			return true;
		}

		if (data.participants.length < data.maxParticipants) {
			return true;
		}
		return false;
	}
	function isFuture() {
		return moment().isBefore(data.end);
	}
	function userRegisteredForEvent() {
		const userId = user?._id;
		return userId && data.participants?.includes(userId);
	}
	function anyDropdown() {
		return unregisterDropdown || registerDropdown;
	}

	return (
		<div className="col-lg-4">
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
								registerDropdown ? (
									<button
										type="button"
										className="btn btn-add btn-event"
										onClick={() => {
											setRegisterDropdown(true);
										}}
									>
										{t('event.details.withdraw-registration' ,'Withdraw my registration')}
									</button>
								) : (
									<>
										<p>
											{t(
												'event.details.want-to-register',
												'Do you want to reserve a seat as {USERNAME} for the event "{EVENTTITLE}" on the {DATE}? Your reservation is binding.',
												{
													USERNAME: userName(),
													EVENTTITLE: data.title,
													DATE: dateFormat(data.startLocal),
												},
											)}
										</p>
										<p>
											<div className="row justify-content-between align-items-center">
												<div className="col-lg-4 d-grid">
													<ButtonCancel
														onClick={() => {
															setRegisterDropdown(false);
														}}
													/>
												</div>
												<div className="col-lg-7 d-grid">
													<ButtonRegister
														onClick={() => {
															addParticipant();
															setRegisterDropdown(false);
														}}
														busy={isBusy === 'registering'}
													/>
												</div>
											</div>
										</p>
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
										{t('event.details.reserve-a-seat', 'Reserve a seat')}
									</button>
								) : (
									<>
										<p>
											{t(
												'event.details.want-to-withdraw',
												'Do you want to withdraw your registration for the event "{EVENTTITLE}" on the {DATE}?',
												{ EVENTTITLE: data.title, DATE: dateFormat(data.startLocal) },
											)}
										</p>
										<p>
											<div className="row justify-content-between align-items-center">
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
																await EventsMethods.removeParticipant(data._id);

																Analytics.trackEvent(
																	'Unsubscribes RSVPs',
																	'Unsubscribes RSVPs as participant',
																	Regions.findOne(data.region)?.nameEn,
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
										</p>
									</>
								)}
								: {(isLoading() && courseTitle()?
								<p>
									{t(
										'event.details.youStayEnrolled',
										'Note that you will stay enrolled as interested for {COURSETITLE}.',
										{ COURSETITLE: courseTitle() },
									)}
								</p>
								:null)}
							</>
						)}
					</div>
				</>
			) : null}

			<div className="page-component">
				<EventParticipants event={data} />
			</div>
			<div className="page-component">
				<Report />
			</div>
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('EventRegistration', () => EventRegistration);
