import { useUserId } from 'meteor/react-meteor-accounts';
import React, { useEffect, useState } from 'react';

import { useSessionEquals } from '/imports/utils/react-meteor-data';

export interface FormProps {
	type: 'form';
	onSubmit: () => void;
}

export interface ButtonProps {
	type: 'button';
	onClick: () => void;
	disabled?: boolean | undefined;
}
export interface Props {
	type: 'form' | 'button';
	className?: string | undefined;
	children?: any;
}

export function PleaseLogin(props: Props & (FormProps | ButtonProps)) {
	const [actionActive, setActionActive] = useState(false);
	const [openedLogin, setOpenedLogin] = useState(false);
	const userId = useUserId();
	const notPleaseLogin = useSessionEquals('pleaseLogin', false);

	useEffect(() => {
		if (actionActive) {
			if (userId) {
				setActionActive(false);
				// if the user is logged in call the save function
				if (props.type === 'form') {
					props.onSubmit();
				} else {
					props.onClick();
				}
			} else if (!openedLogin) {
				// if the user is not logged in open up the login window
				Session.set('pleaseLogin', true);
				setOpenedLogin(true);
			} else if (notPleaseLogin) {
				// if the user closed the login window without logged in reset without call the save function
				setActionActive(false);
				setOpenedLogin(false);
			}
		}
	}, [actionActive, userId, openedLogin, notPleaseLogin, props]);

	function handleEvent(event: { preventDefault: () => void }) {
		event.preventDefault();
		setActionActive(true);
	}

	return props.type === 'form' ? (
		<form className={props.className} onSubmit={handleEvent}>
			{props.children}
		</form>
	) : (
		<button className={props.className} onClick={handleEvent} disabled={props.disabled}>
			{props.children}
		</button>
	);
}
