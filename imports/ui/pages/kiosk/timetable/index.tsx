import { Template } from 'meteor/templating';
import React from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { EventModel } from '/imports/api/events/events';
import { VenueModel } from '/imports/api/venues/venues';

import { textPlain } from '/imports/utils/html-tools';
import { useDateTimeFormat } from '/imports/utils/react-moment-format';

import './styles.scss';

interface RelStartEnd {
	relStart: number;
	relEnd: number;
}

export interface Props {
	now: number;
	days: ({
		moment: moment.Moment;
	} & RelStartEnd)[];
	hours: ({
		moment: moment.Moment;
	} & RelStartEnd)[];
	grouped: {
		perRoom: {
			room: string;
			venue: VenueModel;
			rows: (EventModel & RelStartEnd)[][];
		}[];
		venue: VenueModel;
	}[];
	future_length: number;
}

export function KioskTimetablePage(props: Props) {
	const { t } = useTranslation();
	const { timeFormat } = useDateTimeFormat();

	function isRoomRow(room: string, index: number) {
		return room && index !== 0;
	}
	function position(rel: RelStartEnd) {
		return { left: `${rel.relStart * 100}%`, right: `${rel.relEnd * 100}%` };
	}
	function showDay(m: moment.Moment) {
		return m.locale(Session.get('timeLocale') || 'en').format('dddd, LL');
	}
	function showHour(m: moment.Moment) {
		return m.locale(Session.get('timeLocale') || 'en').format('H');
	}

	return (
		<div className="container-fluid timetable">
			<div className="timetable-header">
				<div className="timetable-days">
					{props.days.map((day) => {
						return (
							<div key={day.moment.toISOString()} className="timetable-day" style={position(day)}>
								{showDay(day.moment)}
							</div>
						);
					})}
				</div>
				{props.future_length ? (
					<div className="vertical-wrapper">
						<div
							className="vertical"
							style={position({ relStart: props.now, relEnd: props.now + 1 })}
						></div>
					</div>
				) : null}
				<div className="timetable-hours">
					{props.hours.map((hour) => {
						return (
							<div
								key={hour.moment.toISOString()}
								className="timetable-hour"
								style={position(hour)}
							>
								{showHour(hour.moment)}
							</div>
						);
					})}
				</div>
			</div>
			{props.grouped.map((groups, index) => {
				return (
					<React.Fragment key={index}>
						{groups.perRoom.map((event, index2) => {
							return (
								<div
									key={index2}
									className={`timetable-row ${
										isRoomRow(event.room, index2) ? 'timetable-row-room' : ''
									}`}
								>
									<div className="timetable-location text-start">
										<span className="text-nowrap">
											<span className="fa-solid fa-house fa-fw" aria-hidden="true"></span>&nbsp;
											{event.venue.name}
										</span>{' '}
										{event.room ? (
											<span className="text-nowrap">
												<span className="fa-solid fa-signs-post fa-fw" aria-hidden="true"></span>
												&nbsp;{event.room}
											</span>
										) : null}
									</div>
									{event.rows.map((row, index3) => {
										return (
											<div key={index3} className="timetable-row-section">
												{row.map((entry) => {
													return (
														<div
															key={entry._id}
															className={`timetable-event${
																entry.relStart > 0.5 ? ' timetable-event-left' : ''
															}`}
															style={position(entry)}
														>
															<div
																className={`timetable-event-title${
																	entry.canceled ? ' timetable-event-title-canceled' : ''
																}`}
															>
																{entry.title}
															</div>
															<div className="timetable-event-time">
																<span
																	className="fa-regular fa-clock fa-fw"
																	aria-hidden="true"
																></span>
																{timeFormat(entry.start)} - {timeFormat(entry.end)}
															</div>
															<div className="timetable-event-description">
																{textPlain(entry.description)}
															</div>
															{entry.canceled ? (
																<span className="timetable-event-canceled-panel">
																	{t('_label.canceled', 'Canceled')}
																</span>
															) : null}
														</div>
													);
												})}
											</div>
										);
									})}
								</div>
							);
						})}
					</React.Fragment>
				);
			})}
			{!props.future_length ? (
				<h3>{t('kiosk.noFutureEvents', 'There are no future events')}</h3>
			) : null}
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper('KioskTimetablePage', () => KioskTimetablePage);
