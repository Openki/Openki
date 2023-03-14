import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Promise } from 'meteor/promise';

import './styles.scss';

export type Props = {
	confirmText: string;
	confirmButton: string;
	onRemove: () => Promise<void>;
	busyButton: string;
};

export function DeleteConfirmation(props: Props) {
	const { t } = useTranslation();
	const [isConfirm, setIsConfirm] = useState(false);
	const [isBusy, setIsBusy] = useState(false);

	if (!isConfirm) {
		return (
			<button
				type="button"
				className="btn btn-delete text-nowrap text-danger"
				onClick={() => {
					setIsConfirm(true);
				}}
			>
				{t('_button.delete')}
			</button>
		);
	}
	return (
		<div className="delete-confirmation">
			<p>{props.confirmText}</p>
			<div className="form-actions">
				{!isBusy ? (
					<button
						type="button"
						className="btn btn-danger text-nowrap"
						onClick={async () => {
							setIsBusy(true);
							await props.onRemove();
						}}
					>
						{props.confirmButton}
					</button>
				) : (
					<button type="button" className="btn btn-danger text-nowrap" disabled={true}>
						<span className="fa-solid fa-circle-notch fa-spin fa-fw" aria-hidden="true"></span>
						{props.busyButton}
					</button>
				)}

				<button
					type="button"
					className="btn btn-cancel text-nowrap"
					onClick={() => {
						setIsConfirm(false);
					}}
				>
					{t('_button.cancel')}
				</button>
			</div>
		</div>
	);
}

// for Blaze
// eslint-disable-next-line import/first
import './template.html';

Template.registerHelper(DeleteConfirmation.name, () => DeleteConfirmation);
