/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';

import { useSessionEquals, useUserId } from '/imports/utils/react-meteor-data';

interface AutoProps {
	type: 'auto';
	onRender: () => void;
}

interface FormProps {
	type: 'form';
	onSubmit: () => void;
}

interface ButtonProps {
	type: 'button';
	onClick: () => void;
	disabled?: boolean | undefined;
}
interface Props {
	type: 'auto' | 'form' | 'button';
	className?: string | undefined;
	children?: any;
}

export function PleaseLogin(props: Props & (AutoProps | FormProps | ButtonProps)) {
	const [actionActive, setActionActive] = useState(props.type === 'auto');
	const [openedLogin, setOpenedLogin] = useState(false);
	const userId = useUserId();
	const notPleaseLogin = useSessionEquals('pleaseLogin', false);

	useEffect(() => {
		if (actionActive) {
			if (userId) {
				setActionActive(false);
				// if the user is logged in call the save function
				if (props.type === 'auto') {
					props.onRender();
				} else if (props.type === 'form') {
					props.onSubmit();
				} else if (props.type === 'button') {
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
	) : props.type === 'button' ? (
		<button className={props.className} onClick={handleEvent} disabled={props.disabled}>
			{props.children}
		</button>
	) : (
		props.children || null
	);
}
