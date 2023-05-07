/* eslint-disable no-nested-ternary */
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useUser } from '/imports/utils/react-meteor-data';
import { useDateTimeFormat } from '/imports/utils/react-moment-format';

import { EventModel } from '/imports/api/events/events';

import { PleaseLogin } from '/imports/ui/components/please-login';
import { ButtonCancel } from '/imports/ui/components/buttons';

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

export function RegisterPanel(props: {
	event: EventModel;
	busy: boolean;
	onRegister: () => Promise<void>;
}) {
	const { event, busy, onRegister } = props;
	const { t } = useTranslation();
	const user = useUser();
	const { dateFormat } = useDateTimeFormat();
	const [registerDropdown, setRegisterDropdown] = useState(false);

	function userName() {
		return user?.getDisplayName() || t('eventDetails.notLoggedIn', '(not logged in?)');
	}

	return (
		<>
			{!registerDropdown ? (
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
				<div className="p-3 event-detail-register-dropdown">
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
					<div className="row justify-content-between align-items-center gap-3">
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
									await onRegister();
									setRegisterDropdown(false);
								}}
								busy={busy}
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
